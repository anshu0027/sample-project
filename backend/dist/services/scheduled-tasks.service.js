"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduledTasksService = void 0;
const event_logger_service_1 = require("./event-logger.service");
const sentry_error_service_1 = require("./sentry-error.service");
const backup_service_1 = require("./backup.service");
const email_service_1 = require("./email.service");
const event_log_entity_1 = require("../entities/event-log.entity");
const sentry_error_entity_1 = require("../entities/sentry-error.entity");
const node_cron_1 = __importDefault(require("node-cron"));
const data_source_1 = require("../data-source");
const quote_entity_1 = require("../entities/quote.entity");
const enums_1 = require("../entities/enums");
const typeorm_1 = require("typeorm");
class ScheduledTasksService {
    constructor() {
        this.eventLogger = event_logger_service_1.EventLoggerService.getInstance();
        this.sentryErrorService = sentry_error_service_1.SentryErrorService.getInstance();
        this.backupService = backup_service_1.BackupService.getInstance();
        this.emailService = email_service_1.EmailService.getInstance();
    }
    static getInstance() {
        if (!ScheduledTasksService.instance) {
            ScheduledTasksService.instance = new ScheduledTasksService();
        }
        return ScheduledTasksService.instance;
    }
    // Initialize all scheduled tasks
    async initializeScheduledTasks() {
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
            await this.eventLogger.logSystemEvent("Scheduled tasks initialized", "All automated tasks have been scheduled successfully", event_log_entity_1.EventLevel.INFO);
            console.log("✅ Scheduled tasks initialized successfully");
        }
        catch (error) {
            console.error("❌ Error initializing scheduled tasks:", error);
            await this.eventLogger.logSystemEvent("Scheduled tasks initialization failed", `Failed to initialize scheduled tasks: ${error instanceof Error ? error.message : "Unknown error"}`, event_log_entity_1.EventLevel.ERROR);
        }
    }
    // Schedule daily backup
    scheduleDailyBackup() {
        const scheduleDailyBackup = () => {
            const now = new Date();
            const nextRun = new Date();
            nextRun.setHours(2, 0, 0, 0); // 2 AM
            if (now >= nextRun) {
                nextRun.setDate(nextRun.getDate() + 1); // Tomorrow
            }
            const timeUntilNextRun = nextRun.getTime() - now.getTime();
            setTimeout(async () => {
                try {
                    await this.backupService.createDailyBackup();
                    console.log("✅ Daily backup completed successfully");
                }
                catch (error) {
                    console.error("❌ Daily backup failed:", error);
                    await this.eventLogger.logSystemEvent("Daily backup failed", `Daily backup failed: ${error instanceof Error ? error.message : "Unknown error"}`, event_log_entity_1.EventLevel.ERROR);
                }
                // Schedule next run
                scheduleDailyBackup();
            }, timeUntilNextRun);
        };
        scheduleDailyBackup();
    }
    // Schedule weekly backup
    scheduleWeeklyBackup() {
        const scheduleWeeklyBackup = () => {
            const now = new Date();
            const nextRun = new Date();
            nextRun.setHours(3, 0, 0, 0); // 3 AM
            // Set to next Sunday
            const daysUntilSunday = (7 - nextRun.getDay()) % 7;
            nextRun.setDate(nextRun.getDate() + daysUntilSunday);
            if (now >= nextRun) {
                nextRun.setDate(nextRun.getDate() + 7); // Next Sunday
            }
            const timeUntilNextRun = nextRun.getTime() - now.getTime();
            setTimeout(async () => {
                try {
                    await this.backupService.createWeeklyBackup();
                    console.log("✅ Weekly backup completed successfully");
                }
                catch (error) {
                    console.error("❌ Weekly backup failed:", error);
                    await this.eventLogger.logSystemEvent("Weekly backup failed", `Weekly backup failed: ${error instanceof Error ? error.message : "Unknown error"}`, event_log_entity_1.EventLevel.ERROR);
                }
                // Schedule next run
                scheduleWeeklyBackup();
            }, timeUntilNextRun);
        };
        scheduleWeeklyBackup();
    }
    // Schedule error reporting every 10 minutes
    scheduleErrorReporting() {
        const TEN_MINUTES = 10 * 60 * 1000; // 10 minutes in milliseconds
        setInterval(async () => {
            try {
                await this.sendErrorReport();
            }
            catch (error) {
                console.error("❌ Error reporting failed:", error);
                await this.eventLogger.logSystemEvent("Error reporting failed", `Error reporting failed: ${error instanceof Error ? error.message : "Unknown error"}`, event_log_entity_1.EventLevel.ERROR);
            }
        }, TEN_MINUTES);
    }
    // Schedule log cleanup
    scheduleLogCleanup() {
        // Schedule to run daily at 4 AM
        node_cron_1.default.schedule("0 4 * * *", async () => {
            try {
                const deletedCount = await this.eventLogger.cleanOldLogs(90); // 90 days retention
                console.log(`✅ Log cleanup completed. Deleted ${deletedCount} old logs`);
                await this.eventLogger.logSystemEvent("Log cleanup completed", `Cleaned up ${deletedCount} old event logs`, event_log_entity_1.EventLevel.INFO);
            }
            catch (error) {
                console.error("❌ Log cleanup failed:", error);
                await this.eventLogger.logSystemEvent("Log cleanup failed", `Log cleanup failed: ${error instanceof Error ? error.message : "Unknown error"}`, event_log_entity_1.EventLevel.ERROR);
            }
        });
    }
    // Schedule backup cleanup
    scheduleBackupCleanup() {
        const scheduleBackupCleanup = () => {
            const now = new Date();
            const nextRun = new Date();
            nextRun.setHours(5, 0, 0, 0); // 5 AM
            if (now >= nextRun) {
                nextRun.setDate(nextRun.getDate() + 1); // Tomorrow
            }
            const timeUntilNextRun = nextRun.getTime() - now.getTime();
            setTimeout(async () => {
                try {
                    const deletedCount = await this.backupService.cleanExpiredBackups();
                    console.log(`✅ Backup cleanup completed. Deleted ${deletedCount} expired backups`);
                    await this.eventLogger.logSystemEvent("Backup cleanup completed", `Cleaned up ${deletedCount} expired backups`, event_log_entity_1.EventLevel.INFO);
                }
                catch (error) {
                    console.error("❌ Backup cleanup failed:", error);
                    await this.eventLogger.logSystemEvent("Backup cleanup failed", `Backup cleanup failed: ${error instanceof Error ? error.message : "Unknown error"}`, event_log_entity_1.EventLevel.ERROR);
                }
                // Schedule next run
                scheduleBackupCleanup();
            }, timeUntilNextRun);
        };
        scheduleBackupCleanup();
    }
    // Expire old quotes (not converted to policy, older than 30 days)
    scheduleQuoteExpiration() {
        // Run daily at 1:30 AM
        node_cron_1.default.schedule("30 1 * * *", async () => {
            try {
                const quoteRepo = data_source_1.AppDataSource.getRepository(quote_entity_1.Quote);
                const now = new Date();
                const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
                const expiredQuotes = await quoteRepo.find({
                    where: {
                        convertedToPolicy: false,
                        status: (0, typeorm_1.Not)(enums_1.StepStatus.EXPIRED),
                        createdAt: (0, typeorm_1.LessThan)(cutoff),
                    },
                });
                if (expiredQuotes.length > 0) {
                    for (const quote of expiredQuotes) {
                        quote.status = enums_1.StepStatus.EXPIRED;
                        await quoteRepo.save(quote);
                    }
                    await this.eventLogger.logSystemEvent("Quote expiration", `Expired ${expiredQuotes.length} quotes older than 30 days`, event_log_entity_1.EventLevel.INFO);
                    console.log(`✅ Expired ${expiredQuotes.length} old quotes`);
                }
                else {
                    console.log("No quotes to expire today.");
                }
            }
            catch (error) {
                console.error("❌ Quote expiration failed:", error);
                await this.eventLogger.logSystemEvent("Quote expiration failed", `Quote expiration failed: ${error instanceof Error ? error.message : "Unknown error"}`, event_log_entity_1.EventLevel.ERROR);
            }
        });
    }
    // Send error report email
    async sendErrorReport() {
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
                critical: errors.filter((e) => e.severity === sentry_error_entity_1.ErrorSeverity.CRITICAL),
                high: errors.filter((e) => e.severity === sentry_error_entity_1.ErrorSeverity.HIGH),
                medium: errors.filter((e) => e.severity === sentry_error_entity_1.ErrorSeverity.MEDIUM),
                low: errors.filter((e) => e.severity === sentry_error_entity_1.ErrorSeverity.LOW),
            };
            // Only send email if there are critical or high severity errors
            if (errorsBySeverity.critical.length === 0 &&
                errorsBySeverity.high.length === 0) {
                return;
            }
            const emailContent = this.generateErrorReportEmail(errorsBySeverity);
            await this.emailService.sendEmail({
                to: process.env.ADMIN_EMAIL || "admin@example.com",
                subject: `🚨 Error Report - ${new Date().toLocaleString()}`,
                html: emailContent,
            });
            await this.eventLogger.logSystemEvent("Error report sent", `Sent error report email with ${errors.length} errors`, event_log_entity_1.EventLevel.INFO, { errorCount: errors.length, severityBreakdown: errorsBySeverity });
        }
        catch (error) {
            console.error("Error sending error report:", error);
            await this.eventLogger.logSystemEvent("Error report failed", `Failed to send error report: ${error instanceof Error ? error.message : "Unknown error"}`, event_log_entity_1.EventLevel.ERROR);
        }
    }
    // Generate error report email content
    generateErrorReportEmail(errorsBySeverity) {
        const totalErrors = Object.values(errorsBySeverity).reduce((sum, errors) => sum + errors.length, 0);
        let html = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <h2 style="color: #d32f2f;">🚨 Error Report</h2>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Total Errors:</strong> ${totalErrors}</p>
        <div style="margin: 20px 0;">
          <h3>Error Summary</h3>
          <ul>
            <li><strong style="color: #d32f2f;">Critical:</strong> ${errorsBySeverity.critical.length}</li>
            <li><strong style="color: #f57c00;">High:</strong> ${errorsBySeverity.high.length}</li>
            <li><strong style="color: #fbc02d;">Medium:</strong> ${errorsBySeverity.medium.length}</li>
            <li><strong style="color: #388e3c;">Low:</strong> ${errorsBySeverity.low.length}</li>
          </ul>
        </div>
    `;
        // Add critical errors
        if (errorsBySeverity.critical.length > 0) {
            html += `
        <div style="margin: 20px 0; padding: 15px; background-color: #ffebee; border-left: 4px solid #d32f2f;">
          <h3 style="color: #d32f2f;">Critical Errors</h3>
          ${errorsBySeverity.critical
                .map((error) => `
            <div style="margin: 10px 0; padding: 10px; background-color: white; border-radius: 4px;">
              <p><strong>Type:</strong> ${error.errorType}</p>
              <p><strong>Message:</strong> ${error.errorMessage}</p>
              <p><strong>Occurrences:</strong> ${error.occurrenceCount}</p>
              <p><strong>Last Occurrence:</strong> ${new Date(error.lastOccurrence).toLocaleString()}</p>
            </div>
          `)
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
                .map((error) => `
            <div style="margin: 10px 0; padding: 10px; background-color: white; border-radius: 4px;">
              <p><strong>Type:</strong> ${error.errorType}</p>
              <p><strong>Message:</strong> ${error.errorMessage}</p>
              <p><strong>Occurrences:</strong> ${error.occurrenceCount}</p>
              <p><strong>Last Occurrence:</strong> ${new Date(error.lastOccurrence).toLocaleString()}</p>
            </div>
          `)
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
    async triggerDailyBackup() {
        try {
            await this.backupService.createDailyBackup();
            console.log("✅ Manual daily backup completed successfully");
        }
        catch (error) {
            console.error("❌ Manual daily backup failed:", error);
            throw error;
        }
    }
    // Manual trigger for weekly backup
    async triggerWeeklyBackup() {
        try {
            await this.backupService.createWeeklyBackup();
            console.log("✅ Manual weekly backup completed successfully");
        }
        catch (error) {
            console.error("❌ Manual weekly backup failed:", error);
            throw error;
        }
    }
    // Manual trigger for error report
    async triggerErrorReport() {
        try {
            await this.sendErrorReport();
            console.log("✅ Manual error report sent successfully");
        }
        catch (error) {
            console.error("❌ Manual error report failed:", error);
            throw error;
        }
    }
}
exports.ScheduledTasksService = ScheduledTasksService;
//# sourceMappingURL=scheduled-tasks.service.js.map