import { SentryService } from "./sentry.service";
import { SentryErrorService } from "./sentry-error.service";
import { BackupService } from "./backup.service";
import { EmailService } from "./email.service";
import { EventLevel } from "../entities/event-log.entity";
import { ErrorSeverity } from "../entities/sentry-error.entity";
// import { BackupType } from "../entities/backup-log.entity";
import cron from "node-cron";
import { AppDataSource } from "../data-source";
import { Quote } from "../entities/quote.entity";
import { StepStatus } from "../entities/enums";
import { Not, LessThan } from "typeorm";

export class ScheduledTasksService {
  private static instance: ScheduledTasksService;
  private sentryService = SentryService.getInstance();
  private sentryErrorService = SentryErrorService.getInstance();
  private backupService = BackupService.getInstance();
  private emailService = EmailService.getInstance();

  private constructor() {}
  public static getInstance(): ScheduledTasksService {
    if (!ScheduledTasksService.instance) {
      ScheduledTasksService.instance = new ScheduledTasksService();
    }
    return ScheduledTasksService.instance;
  }

  // Initialize all scheduled tasks
  public async initializeScheduledTasks(): Promise<void> {
    try {
      // Schedule daily backup at 2 AM
      this.scheduleDailyBackup();
      // Schedule weekly backup on Sunday at 3 AM
      this.scheduleWeeklyBackup();
      // Schedule error report every 10 minutes
      this.scheduleErrorReporting();
      // Schedule log cleanup daily at 4 AM
      this.scheduleLogCleanup();
      // Schedule backup cleanup daily at 5 AM
      this.scheduleBackupCleanup();
      // Schedule quote expiration daily at 1:30 AM
      this.scheduleQuoteExpiration();

      await this.sentryService.logSystemEvent(
        "Scheduled tasks initialized",
        "All automated tasks have been scheduled successfully",
        EventLevel.INFO
      );

      console.log("✅ Scheduled tasks initialized successfully");
    } catch (error) {
      console.error("❌ Error initializing scheduled tasks:", error);
      await this.sentryService.logSystemEvent(
        "Scheduled tasks initialization failed",
        `Failed to initialize scheduled tasks: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        EventLevel.ERROR
      );
    }
  }

  // Schedule daily backup using node-cron (2 AM)
  private scheduleDailyBackup(): void {
    cron.schedule("0 2 * * *", async () => {
      try {
        await this.backupService.createDailyBackup();
        console.log("✅ Daily backup completed successfully");
      } catch (error) {
        console.error("❌ Daily backup failed:", error);
        await this.sentryService.logSystemEvent(
          "Daily backup failed",
          `Daily backup failed: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          EventLevel.ERROR
        );
      }
    });
  }

  // Schedule weekly backup using node-cron (Sunday 3 AM)
  private scheduleWeeklyBackup(): void {
    cron.schedule("0 3 * * 0", async () => {
      try {
        await this.backupService.createWeeklyBackup();
        console.log("✅ Weekly backup completed successfully");
      } catch (error) {
        console.error("❌ Weekly backup failed:", error);
        await this.sentryService.logSystemEvent(
          "Weekly backup failed",
          `Weekly backup failed: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          EventLevel.ERROR
        );
      }
    });
  }

  // Schedule error reporting every 10 minutes using node-cron
  private scheduleErrorReporting(): void {
    cron.schedule("*/10 * * * *", async () => {
      try {
        await this.sendErrorReport();
      } catch (error) {
        console.error("❌ Error reporting failed:", error);
        await this.sentryService.logSystemEvent(
          "Error reporting failed",
          `Error reporting failed: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          EventLevel.ERROR
        );
      }
    });
  }

  // Schedule log cleanup
  private scheduleLogCleanup(): void {
    // Schedule to run daily at 4 AM
    cron.schedule("0 4 * * *", async () => {
      try {
        const deletedCount = await this.sentryService.cleanOldLogs(90); // 90 days retention
        console.log(
          `✅ Log cleanup completed. Deleted ${deletedCount} old logs`
        );

        await this.sentryService.logSystemEvent(
          "Log cleanup completed",
          `Cleaned up ${deletedCount} old event logs`,
          EventLevel.INFO
        );
      } catch (error) {
        console.error("❌ Log cleanup failed:", error);
        await this.sentryService.logSystemEvent(
          "Log cleanup failed",
          `Log cleanup failed: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          EventLevel.ERROR
        );
      }
    });
  }

  // Schedule backup cleanup using node-cron (5 AM)
  private scheduleBackupCleanup(): void {
    cron.schedule("0 5 * * *", async () => {
      try {
        const deletedCount = await this.backupService.cleanExpiredBackups();
        console.log(
          `✅ Backup cleanup completed. Deleted ${deletedCount} expired backups`
        );

        await this.sentryService.logSystemEvent(
          "Backup cleanup completed",
          `Cleaned up ${deletedCount} expired backups`,
          EventLevel.INFO
        );
      } catch (error) {
        console.error("❌ Backup cleanup failed:", error);
        await this.sentryService.logSystemEvent(
          "Backup cleanup failed",
          `Backup cleanup failed: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          EventLevel.ERROR
        );
      }
    });
  }

  // Expire old quotes (not converted to policy, older than 30 days)
  private scheduleQuoteExpiration(): void {
    // Run daily at 1:30 AM
    cron.schedule("30 1 * * *", async () => {
      try {
        const quoteRepo = AppDataSource.getRepository(Quote);
        const now = new Date();
        const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
        const expiredQuotes = await quoteRepo.find({
          where: {
            convertedToPolicy: false,
            status: Not(StepStatus.EXPIRED),
            createdAt: LessThan(cutoff),
          },
        });
        if (expiredQuotes.length > 0) {
          for (const quote of expiredQuotes) {
            quote.status = StepStatus.EXPIRED;
            await quoteRepo.save(quote);
          }
          await this.sentryService.logSystemEvent(
            "Quote expiration",
            `Expired ${expiredQuotes.length} quotes older than 30 days`,
            EventLevel.INFO
          );
          console.log(`✅ Expired ${expiredQuotes.length} old quotes`);
        } else {
          console.log("No quotes to expire today.");
        }
      } catch (error) {
        console.error("❌ Quote expiration failed:", error);
        await this.sentryService.logSystemEvent(
          "Quote expiration failed",
          `Quote expiration failed: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          EventLevel.ERROR
        );
      }
    });
  }

  // Send error report email
  private async sendErrorReport(): Promise<void> {
    try {
      // Get errors from the last 10 minutes
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      const { errors } = await this.sentryErrorService.getErrors({
        startDate: tenMinutesAgo,
        limit: 100,
      });

      if (errors.length === 0) {
        return; // No errors to report
      }

      // Group errors by severity
      const errorsBySeverity = {
        critical: errors.filter((e) => e.severity === ErrorSeverity.CRITICAL),
        high: errors.filter((e) => e.severity === ErrorSeverity.HIGH),
        medium: errors.filter((e) => e.severity === ErrorSeverity.MEDIUM),
        low: errors.filter((e) => e.severity === ErrorSeverity.LOW),
      };

      // Only send email if there are critical or high severity errors
      if (
        errorsBySeverity.critical.length === 0 &&
        errorsBySeverity.high.length === 0
      ) {
        return;
      }

      const emailContent = this.generateErrorReportEmail(errorsBySeverity);

      await this.emailService.sendEmail({
        to: process.env.ADMIN_EMAIL || "admin@example.com",
        subject: `🚨 Error Report - ${new Date().toLocaleString()}`,
        html: emailContent,
      });

      await this.sentryService.logSystemEvent(
        "Error report sent",
        `Sent error report email with ${errors.length} errors`,
        EventLevel.INFO,
        { errorCount: errors.length, severityBreakdown: errorsBySeverity }
      );
    } catch (error) {
      console.error("Error sending error report:", error);
      await this.sentryService.logSystemEvent(
        "Error report failed",
        `Failed to send error report: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        EventLevel.ERROR
      );
    }
  }

  // Generate error report email content
  private generateErrorReportEmail(errorsBySeverity: any): string {
    const totalErrors = Object.values(errorsBySeverity).reduce(
      (sum: number, errors: any) => sum + errors.length,
      0
    );

    let html = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <h2 style="color: #d32f2f;">🚨 Error Report</h2>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Total Errors:</strong> ${totalErrors}</p>
        <div style="margin: 20px 0;">
          <h3>Error Summary</h3>
          <ul>
            <li><strong style="color: #d32f2f;">Critical:</strong> ${
              errorsBySeverity.critical.length
            }</li>
            <li><strong style="color: #f57c00;">High:</strong> ${
              errorsBySeverity.high.length
            }</li>
            <li><strong style="color: #fbc02d;">Medium:</strong> ${
              errorsBySeverity.medium.length
            }</li>
            <li><strong style="color: #388e3c;">Low:</strong> ${
              errorsBySeverity.low.length
            }</li>
          </ul>
        </div>
    `;

    // Add critical errors
    if (errorsBySeverity.critical.length > 0) {
      html += `
        <div style="margin: 20px 0; padding: 15px; background-color: #ffebee; border-left: 4px solid #d32f2f;">
          <h3 style="color: #d32f2f;">Critical Errors</h3>
          ${errorsBySeverity.critical
            .map(
              (error: any) => `
            <div style="margin: 10px 0; padding: 10px; background-color: white; border-radius: 4px;">
              <p><strong>Type:</strong> ${error.errorType}</p>
              <p><strong>Message:</strong> ${error.errorMessage}</p>
              <p><strong>Occurrences:</strong> ${error.occurrenceCount}</p>
              <p><strong>Last Occurrence:</strong> ${new Date(
                error.lastOccurrence
              ).toLocaleString()}</p>
            </div>
          `
            )
            .join("")}
        </div>
      `;
    }

    // Add high severity errors
    if (errorsBySeverity.high.length > 0) {
      html += `
        <div style="margin: 20px 0; padding: 15px; background-color: #fff3e0; border-left: 4px solid #f57c00;">
          <h3 style="color: #f57c00;">High Severity Errors</h3>
          ${errorsBySeverity.high
            .map(
              (error: any) => `
            <div style="margin: 10px 0; padding: 10px; background-color: white; border-radius: 4px;">
              <p><strong>Type:</strong> ${error.errorType}</p>
              <p><strong>Message:</strong> ${error.errorMessage}</p>
              <p><strong>Occurrences:</strong> ${error.occurrenceCount}</p>
              <p><strong>Last Occurrence:</strong> ${new Date(
                error.lastOccurrence
              ).toLocaleString()}</p>
            </div>
          `
            )
            .join("")}
        </div>
      `;
    }

    html += `
        <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 4px;">
          <p><small>This is an automated error report. Please review and take appropriate action.</small></p>
        </div>
      </div>
    `;
    return html;
  }

  // Manual trigger for daily backup
  public async triggerDailyBackup(): Promise<void> {
    try {
      await this.backupService.createDailyBackup();
      console.log("✅ Manual daily backup completed successfully");
    } catch (error) {
      console.error("❌ Manual daily backup failed:", error);
      throw error;
    }
  }

  // Manual trigger for weekly backup
  public async triggerWeeklyBackup(): Promise<void> {
    try {
      await this.backupService.createWeeklyBackup();
      console.log("✅ Manual weekly backup completed successfully");
    } catch (error) {
      console.error("❌ Manual weekly backup failed:", error);
      throw error;
    }
  }

  // Manual trigger for error report
  public async triggerErrorReport(): Promise<void> {
    try {
      await this.sendErrorReport();
      console.log("✅ Manual error report sent successfully");
    } catch (error) {
      console.error("❌ Manual error report failed:", error);
      throw error;
    }
  }
}
