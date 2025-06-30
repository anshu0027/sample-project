"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupService = void 0;
const data_source_1 = require("../data-source");
const backup_log_entity_1 = require("../entities/backup-log.entity");
const event_logger_service_1 = require("./event-logger.service");
const event_log_entity_1 = require("../entities/event-log.entity");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class BackupService {
    constructor() {
        this.backupLogRepository = data_source_1.AppDataSource.getRepository(backup_log_entity_1.BackupLog);
        this.eventLogger = event_logger_service_1.EventLoggerService.getInstance();
    }
    static getInstance() {
        if (!BackupService.instance) {
            BackupService.instance = new BackupService();
        }
        return BackupService.instance;
    }
    // Create a database backup
    async createBackup(options) {
        const backupLog = new backup_log_entity_1.BackupLog();
        backupLog.backupType = options.backupType;
        backupLog.status = backup_log_entity_1.BackupStatus.IN_PROGRESS;
        backupLog.backupDate = new Date();
        backupLog.initiatedBy = options.initiatedBy || "system";
        backupLog.description = options.description || "";
        backupLog.compressionType = options.compressionType || "gzip";
        backupLog.storageLocation =
            options.storageLocation || this.getDefaultStorageLocation();
        backupLog.retentionPolicy = options.retentionPolicy || "30_days";
        backupLog.backupVersion = "1.0.0";
        backupLog.startedAt = new Date();
        // Save initial backup log
        const savedBackupLog = await this.backupLogRepository.save(backupLog);
        try {
            // Log backup start
            await this.eventLogger.logSystemEvent(`Backup started: ${options.backupType}`, `Database backup initiated for ${options.backupType} backup`, event_log_entity_1.EventLevel.INFO, { backupId: savedBackupLog.id, backupType: options.backupType });
            // Create backup directory if it doesn't exist
            const backupDir = path.dirname(backupLog.storageLocation);
            if (!fs.existsSync(backupDir)) {
                fs.mkdirSync(backupDir, { recursive: true });
            }
            // Generate backup filename
            const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
            const backupFileName = `backup_${options.backupType}_${timestamp}.sql`;
            const backupFilePath = path.join(backupLog.storageLocation, backupFileName);
            // Get database connection details
            const dbConfig = this.getDatabaseConfig();
            // Create backup using Oracle Data Pump or SQL*Plus
            const backupCommand = this.generateBackupCommand(dbConfig, backupFilePath, options.compressionType);
            console.log(`Executing backup command: ${backupCommand}`);
            const { stdout, stderr } = await execAsync(backupCommand);
            if (stderr && !stderr.includes("ORA-00000")) {
                throw new Error(`Backup failed: ${stderr}`);
            }
            // Get file stats
            const fileStats = fs.statSync(backupFilePath);
            backupLog.filePath = backupFilePath;
            backupLog.fileSize = fileStats.size;
            backupLog.checksum = this.calculateChecksum(backupFilePath);
            backupLog.completedAt = new Date();
            backupLog.duration =
                backupLog.completedAt.getTime() - backupLog.startedAt.getTime();
            backupLog.status = backup_log_entity_1.BackupStatus.COMPLETED;
            // Get database statistics
            const dbStats = await this.getDatabaseStatistics();
            backupLog.tablesCount = dbStats.tablesCount;
            backupLog.recordsCount = dbStats.recordsCount;
            // Set expiration date based on retention policy
            backupLog.expiresAt = this.calculateExpirationDate(options.retentionPolicy || "30_days");
            // Update backup log
            const updatedBackupLog = await this.backupLogRepository.save(backupLog);
            // Log backup completion
            await this.eventLogger.logSystemEvent(`Backup completed: ${options.backupType}`, `Database backup completed successfully. File: ${backupFileName}, Size: ${this.formatFileSize(fileStats.size)}`, event_log_entity_1.EventLevel.INFO, {
                backupId: updatedBackupLog.id,
                backupType: options.backupType,
                fileSize: fileStats.size,
                duration: backupLog.duration,
            });
            return updatedBackupLog;
        }
        catch (error) {
            // Update backup log with error
            backupLog.status = backup_log_entity_1.BackupStatus.FAILED;
            backupLog.errorDetails =
                error instanceof Error ? error.message : "Unknown error";
            backupLog.completedAt = new Date();
            backupLog.duration =
                backupLog.completedAt.getTime() - backupLog.startedAt.getTime();
            const failedBackupLog = await this.backupLogRepository.save(backupLog);
            // Log backup failure
            await this.eventLogger.logSystemEvent(`Backup failed: ${options.backupType}`, `Database backup failed: ${error instanceof Error ? error.message : "Unknown error"}`, event_log_entity_1.EventLevel.ERROR, {
                backupId: failedBackupLog.id,
                backupType: options.backupType,
                error: error instanceof Error ? error.message : "Unknown error",
            });
            throw error;
        }
    }
    // Create daily backup
    async createDailyBackup() {
        return await this.createBackup({
            backupType: backup_log_entity_1.BackupType.DAILY,
            initiatedBy: "system",
            description: "Automated daily database backup",
            retentionPolicy: "7_days",
        });
    }
    // Create weekly backup
    async createWeeklyBackup() {
        return await this.createBackup({
            backupType: backup_log_entity_1.BackupType.WEEKLY,
            initiatedBy: "system",
            description: "Automated weekly database backup",
            retentionPolicy: "30_days",
        });
    }
    // Get backup logs by filters
    async getBackupLogs(filters) {
        const queryBuilder = this.backupLogRepository.createQueryBuilder("backup");
        if (filters.backupType) {
            queryBuilder.andWhere("backup.backupType = :backupType", {
                backupType: filters.backupType,
            });
        }
        if (filters.status) {
            queryBuilder.andWhere("backup.status = :status", {
                status: filters.status,
            });
        }
        if (filters.startDate) {
            queryBuilder.andWhere("backup.createdAt >= :startDate", {
                startDate: filters.startDate,
            });
        }
        if (filters.endDate) {
            queryBuilder.andWhere("backup.createdAt <= :endDate", {
                endDate: filters.endDate,
            });
        }
        queryBuilder.orderBy("backup.createdAt", "DESC");
        const total = await queryBuilder.getCount();
        if (filters.limit) {
            queryBuilder.limit(filters.limit);
        }
        if (filters.offset) {
            queryBuilder.offset(filters.offset);
        }
        const backups = await queryBuilder.getMany();
        return { backups, total };
    }
    // Clean expired backups
    async cleanExpiredBackups() {
        const expiredBackups = await this.backupLogRepository.find({
            where: {
                status: backup_log_entity_1.BackupStatus.COMPLETED,
                expiresAt: new Date(),
            },
        });
        let deletedCount = 0;
        for (const backup of expiredBackups) {
            try {
                // Delete backup file
                if (backup.filePath && fs.existsSync(backup.filePath)) {
                    fs.unlinkSync(backup.filePath);
                }
                // Delete backup log
                await this.backupLogRepository.remove(backup);
                deletedCount++;
                // Log cleanup
                await this.eventLogger.logSystemEvent("Backup cleanup", `Expired backup deleted: ${path.basename(backup.filePath || "unknown")}`, event_log_entity_1.EventLevel.INFO, { backupId: backup.id, backupType: backup.backupType });
            }
            catch (error) {
                console.error(`Error cleaning backup ${backup.id}:`, error);
            }
        }
        return deletedCount;
    }
    // Get backup statistics
    async getBackupStatistics(days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const stats = await this.backupLogRepository
            .createQueryBuilder("backup")
            .select([
            "backup.backupType as backupType",
            "backup.status as status",
            "COUNT(*) as count",
            "SUM(backup.fileSize) as totalSize",
            "AVG(backup.duration) as avgDuration",
        ])
            .where("backup.createdAt >= :startDate", { startDate })
            .groupBy("backup.backupType, backup.status")
            .getRawMany();
        return stats;
    }
    // Generate backup command based on database type
    generateBackupCommand(dbConfig, backupFilePath, compressionType) {
        const { host, port, username, password, sid } = dbConfig;
        // Using Oracle Data Pump for backup
        const dumpCommand = `expdp ${username}/${password}@${host}:${port}/${sid} DIRECTORY=DATA_PUMP_DIR DUMPFILE=${path.basename(backupFilePath)} LOGFILE=${path.basename(backupFilePath, ".sql")}.log FULL=Y`;
        // Alternative using SQL*Plus for simpler backup
        const sqlPlusCommand = `sqlplus -S ${username}/${password}@${host}:${port}/${sid} << EOF
SET HEADING OFF
SET FEEDBACK OFF
SET LINESIZE 1000
SET PAGESIZE 0
SPOOL ${backupFilePath}
SELECT '-- Backup generated on ' || TO_CHAR(SYSDATE, 'YYYY-MM-DD HH24:MI:SS') FROM DUAL;
SELECT '-- Database: ' || SYS_CONTEXT('USERENV', 'DB_NAME') FROM DUAL;
-- Add your backup SQL statements here
-- Example: SELECT * FROM your_table;
SPOOL OFF
EXIT
EOF`;
        return sqlPlusCommand;
    }
    // Get database configuration from environment
    getDatabaseConfig() {
        return {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            username: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            sid: process.env.DB_SID,
        };
    }
    // Get default storage location
    getDefaultStorageLocation() {
        const baseDir = process.env.BACKUP_DIR || path.join(process.cwd(), "backups");
        return path.join(baseDir, "database");
    }
    // Calculate file checksum
    calculateChecksum(filePath) {
        const fileBuffer = fs.readFileSync(filePath);
        const hashSum = crypto.createHash("sha256");
        hashSum.update(fileBuffer);
        return hashSum.digest("hex");
    }
    // Get database statistics
    async getDatabaseStatistics() {
        var _a, _b;
        try {
            // Get tables count
            const tablesResult = await data_source_1.AppDataSource.query(`
        SELECT COUNT(*) as count 
        FROM USER_TABLES
      `);
            // Get total records count (approximate)
            const recordsResult = await data_source_1.AppDataSource.query(`
        SELECT SUM(NUM_ROWS) as count 
        FROM USER_TABLES
      `);
            return {
                tablesCount: parseInt(((_a = tablesResult[0]) === null || _a === void 0 ? void 0 : _a.count) || "0"),
                recordsCount: parseInt(((_b = recordsResult[0]) === null || _b === void 0 ? void 0 : _b.count) || "0"),
            };
        }
        catch (error) {
            console.error("Error getting database statistics:", error);
            return { tablesCount: 0, recordsCount: 0 };
        }
    }
    // Calculate expiration date based on retention policy
    calculateExpirationDate(retentionPolicy) {
        const expirationDate = new Date();
        switch (retentionPolicy) {
            case "7_days":
                expirationDate.setDate(expirationDate.getDate() + 7);
                break;
            case "30_days":
                expirationDate.setDate(expirationDate.getDate() + 30);
                break;
            case "90_days":
                expirationDate.setDate(expirationDate.getDate() + 90);
                break;
            default:
                expirationDate.setDate(expirationDate.getDate() + 30); // Default 30 days
        }
        return expirationDate;
    }
    // Format file size for display
    formatFileSize(bytes) {
        const sizes = ["Bytes", "KB", "MB", "GB"];
        if (bytes === 0)
            return "0 Bytes";
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
    }
}
exports.BackupService = BackupService;
//# sourceMappingURL=backup.service.js.map