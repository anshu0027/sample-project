// my-backend/src/routes/v1/admin.routes.ts
import { Router, Request, Response } from "express";
import { AppDataSource } from "../../data-source";
import { Policy } from "../../entities/policy.entity";
import { PolicyVersion } from "../../entities/policy-version.entity";
import { In } from "typeorm";
import { SentryService } from "../../services/sentry.service";
import { SentryErrorService } from "../../services/sentry-error.service";

// ------------------------
// Router for handling admin-specific API endpoints.
// Base path: /api/v1/admin
// ------------------------
const router = Router();
const sentryService = SentryService.getInstance();
const sentryErrorService = SentryErrorService.getInstance();

// --- POST /api/v1/admin/cleanup-policy-versions ---
// ------------------------
// Handles the cleanup of old policy versions.
// For each policy, it keeps the 10 most recent versions and deletes any older ones.
// This is useful for managing database size and performance.
// ------------------------
router.post(
  "/cleanup-policy-versions",
  async (_req: Request, res: Response) => {
    const startTime = Date.now();
    try {
      const policyRepository = AppDataSource.getRepository(Policy);
      const versionRepository = AppDataSource.getRepository(PolicyVersion);

      // ------------------------
      // 1. Fetch all policies along with their associated versions.
      // The 'versions' relation is loaded to avoid N+1 query problems.
      // ------------------------
      const policies = await policyRepository.find({
        relations: ["versions"],
      });

      let totalDeleted = 0;
      const allVersionIdsToDelete: number[] = [];

      // ------------------------
      // 2. Iterate through each policy to identify old versions that need to be deleted.
      // ------------------------
      for (const policy of policies) {
        // ------------------------
        // Check if the policy has versions and if the number of versions exceeds 10.
        // ------------------------
        if (policy.versions && policy.versions.length > 10) {
          // Sort versions by date descending to be sure we keep the newest
          const sortedVersions = policy.versions.sort(
            (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
          );

          // The versions to delete are all after the 10th one
          // ------------------------
          // Identify versions to delete (all versions beyond the 10 most recent).
          // ------------------------
          const versionsToDelete = sortedVersions.slice(10);
          const idsToDelete = versionsToDelete.map((v) => v.id);

          allVersionIdsToDelete.push(...idsToDelete);
          totalDeleted += idsToDelete.length;
        }
      }

      // ------------------------
      // 3. If there are any versions to delete, perform a single bulk delete operation.
      // Using `In(allVersionIdsToDelete)` is more efficient than deleting one by one.
      // ------------------------
      if (allVersionIdsToDelete.length > 0) {
        await versionRepository.delete({
          id: In(allVersionIdsToDelete),
        });
      }

      const response = {
        message: `Successfully cleaned up policy versions. Deleted ${totalDeleted} old versions.`,
      };
      res.json(response);
      await sentryService.logApiCall(_req, res, startTime, response);
    } catch (error) {
      await sentryErrorService.captureRequestError(
        _req,
        res,
        error as Error,
        res.statusCode || 500
      );
      await sentryService.logApiCall(
        _req,
        res,
        startTime,
        undefined,
        error as Error
      );
      // ------------------------
      // Error handling for the cleanup process.
      // ------------------------
      console.error("Error cleaning up policy versions:", error);
      res.status(500).json({ error: "Failed to clean up policy versions" });
    }
  }
);

export default router;
