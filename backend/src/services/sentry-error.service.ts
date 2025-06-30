import { Request, Response } from "express";
import { SentryService } from "./sentry.service";
import {
  SentryError,
  ErrorSeverity,
  ErrorStatus,
} from "../entities/sentry-error.entity";
// import { EventType, EventLevel } from "../entities/event-log.entity";
// import { v4 as uuidv4 } from "uuid";

export class SentryErrorService {
  private static instance: SentryErrorService;
  private sentryService = SentryService.getInstance();

  private constructor() {}

  public static getInstance(): SentryErrorService {
    if (!SentryErrorService.instance) {
      SentryErrorService.instance = new SentryErrorService();
    }
    return SentryErrorService.instance;
  }

  /**
   * Capture and store an error
   */
  public async captureError(options: any): Promise<SentryError> {
    return await this.sentryService.captureError(options);
  }

  /**
   * Capture error from request context
   */
  public async captureRequestError(
    req: Request,
    res: Response,
    error: Error,
    statusCode: number = 500
  ): Promise<SentryError> {
    return await this.sentryService.captureRequestError(
      req,
      res,
      error,
      statusCode
    );
  }

  /**
   * Get errors by filters (delegates to Sentry service)
   */
  public async getErrors(filters: {
    severity?: ErrorSeverity;
    status?: ErrorStatus;
    errorType?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{ errors: SentryError[]; total: number }> {
    return await this.sentryService.getErrors(filters);
  }

  /**
   * Update error status (delegates to Sentry service)
   */
  public async updateErrorStatus(
    errorId: number,
    status: ErrorStatus,
    assignedTo?: string,
    resolutionNotes?: string
  ): Promise<SentryError> {
    return await this.sentryService.updateErrorStatus(
      errorId,
      status,
      assignedTo,
      resolutionNotes
    );
  }

  /**
   * Get error statistics
   */
  public async getErrorStatistics(days: number = 30): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { errors } = await this.sentryService.getErrors({
      startDate,
      limit: 1000, // Get all errors for statistics
    });

    // Group errors by severity and status
    const stats = errors.reduce((acc, error) => {
      const key = `${error.severity}_${error.status}`;
      if (!acc[key]) {
        acc[key] = {
          severity: error.severity,
          status: error.status,
          count: 0,
          totalOccurrences: 0,
        };
      }
      acc[key].count += 1;
      acc[key].totalOccurrences += error.occurrenceCount;
      return acc;
    }, {} as any);

    return Object.values(stats);
  }

  /**
   * Clean old resolved errors (delegates to Sentry service)
   */
  public async cleanOldResolvedErrors(
    retentionDays: number = 30
  ): Promise<number> {
    return await this.sentryService.cleanOldResolvedErrors(retentionDays);
  }
}
