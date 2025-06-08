// my-backend/src/routes/v1/admin.routes.ts
import { Router, Request, Response } from 'express';
import { AppDataSource } from '../../data-source';
import { Policy } from '../../entities/policy.entity';
import { PolicyVersion } from '../../entities/policy-version.entity';
import { In } from 'typeorm';

const router = Router();

// --- POST /api/v1/admin/cleanup-policy-versions ---
router.post('/cleanup-policy-versions', async (req: Request, res: Response) => {
    try {
        const policyRepository = AppDataSource.getRepository(Policy);
        const versionRepository = AppDataSource.getRepository(PolicyVersion);

        // 1. Get all policies and their associated versions
        const policies = await policyRepository.find({
            relations: ['versions'],
        });

        let totalDeleted = 0;
        const allVersionIdsToDelete: number[] = [];

        // 2. For each policy, identify versions to delete
        for (const policy of policies) {
            // Ensure versions exist and there are more than 10
            if (policy.versions && policy.versions.length > 10) {
                // Sort versions by date descending to be sure we keep the newest
                const sortedVersions = policy.versions.sort(
                    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
                );

                // The versions to delete are all after the 10th one
                const versionsToDelete = sortedVersions.slice(10);
                const idsToDelete = versionsToDelete.map(v => v.id);
                
                allVersionIdsToDelete.push(...idsToDelete);
                totalDeleted += idsToDelete.length;
            }
        }

        // 3. Perform a single bulk delete operation if there's anything to delete
        if (allVersionIdsToDelete.length > 0) {
            await versionRepository.delete({
                id: In(allVersionIdsToDelete)
            });
        }

        res.json({
            message: `Successfully cleaned up policy versions. Deleted ${totalDeleted} old versions.`
        });

    } catch (error) {
        console.error("Error cleaning up policy versions:", error);
        res.status(500).json({ error: "Failed to clean up policy versions" });
    }
});

export default router;