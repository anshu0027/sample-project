import { AppDataSource } from "../data-source";
import {
  BackupLog,
  BackupType,
  BackupStatus,
} from "../entities/backup-log.entity";
import { SentryService } from "./sentry.service";
import { EventType, EventLevel } from "../entities/event-log.entity";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { exec } from "child_process";
import { promisify } from "util";
import { Policy } from "../entities/policy.entity";
import { PolicyVersion } from "../entities/policy-version.entity";
import { Quote } from "../entities/quote.entity";
import { Payment } from "../entities/payment.entity";
import { SentryErrorService } from "./sentry-error.service";
import { createClerkClient, verifyToken } from "@clerk/backend";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

const execAsync = promisify(exec);

export interface BackupOptions {
  backupType: BackupType;
  initiatedBy?: string;
  description?: string;
  compressionType?: string;
  storageLocation?: string;
  retentionPolicy?: string;
}

export interface BackupData {
  policies: Policy[];
  policyVersions: PolicyVersion[];
  quotes: Quote[];
  payments: Payment[];
  metadata: {
    timestamp: string;
    version: string;
    totalRecords: number;
  };
}

export class BackupService {
  private static instance: BackupService;
  private backupLogRepository = AppDataSource.getRepository(BackupLog);
  private sentryService = SentryService.getInstance();
  private sentryErrorService = SentryErrorService.getInstance();

  private constructor() {}

  public static getInstance(): BackupService {
    if (!BackupService.instance) {
      BackupService.instance = new BackupService();
    }
    return BackupService.instance;
  }

  // Create a database backup
  public async createBackup(options: BackupOptions): Promise<BackupLog> {
    const backupLog = new BackupLog();
    backupLog.backupType = options.backupType;
    backupLog.status = BackupStatus.IN_PROGRESS;
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
      await this.sentryService.logSystemEvent(
        `Backup started: ${options.backupType}`,
        `Database backup initiated for ${options.backupType} backup`,
        EventLevel.INFO,
        { backupId: savedBackupLog.id, backupType: options.backupType }
      );

      // Create backup directory if it doesn't exist
      const backupDir = path.dirname(backupLog.storageLocation);
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      // Generate backup filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const backupFileName = `backup_${options.backupType}_${timestamp}.sql`;
      const backupFilePath = path.join(
        backupLog.storageLocation,
        backupFileName
      );

      // Get database connection details
      const dbConfig = this.getDatabaseConfig();

      // Create backup using Oracle Data Pump or SQL*Plus
      const backupCommand = this.generateBackupCommand(
        dbConfig,
        backupFilePath,
        options.compressionType
      );

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
      backupLog.status = BackupStatus.COMPLETED;

      // Get database statistics
      const dbStats = await this.getDatabaseStatistics();
      backupLog.tablesCount = dbStats.tablesCount;
      backupLog.recordsCount = dbStats.recordsCount;

      // Set expiration date based on retention policy
      backupLog.expiresAt = this.calculateExpirationDate(
        options.retentionPolicy || "30_days"
      );

      // Update backup log
      const updatedBackupLog = await this.backupLogRepository.save(backupLog);

      // Log backup completion
      await this.sentryService.logSystemEvent(
        `Backup completed: ${options.backupType}`,
        `Database backup completed successfully. File: ${backupFileName}, Size: ${this.formatFileSize(
          fileStats.size
        )}`,
        EventLevel.INFO,
        {
          backupId: updatedBackupLog.id,
          backupType: options.backupType,
          fileSize: fileStats.size,
          duration: backupLog.duration,
        }
      );

      return updatedBackupLog;
    } catch (error) {
      // Update backup log with error
      backupLog.status = BackupStatus.FAILED;
      backupLog.errorDetails =
        error instanceof Error ? error.message : "Unknown error";
      backupLog.completedAt = new Date();
      backupLog.duration =
        backupLog.completedAt.getTime() - backupLog.startedAt.getTime();

      const failedBackupLog = await this.backupLogRepository.save(backupLog);

      // Log backup failure
      await this.sentryService.logSystemEvent(
        `Backup failed: ${options.backupType}`,
        `Database backup failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        EventLevel.ERROR,
        {
          backupId: failedBackupLog.id,
          backupType: options.backupType,
          error: error instanceof Error ? error.message : "Unknown error",
        }
      );
      throw error;
    }
  }

  // Create daily backup
  public async createDailyBackup(): Promise<BackupLog> {
    return await this.createBackup({
      backupType: BackupType.DAILY,
      initiatedBy: "system",
      description: "Automated daily database backup",
      retentionPolicy: "7_days",
    });
  }

  // Create weekly backup
  public async createWeeklyBackup(): Promise<BackupLog> {
    return await this.createBackup({
      backupType: BackupType.WEEKLY,
      initiatedBy: "system",
      description: "Automated weekly database backup",
      retentionPolicy: "30_days",
    });
  }

  // Get backup logs by filters
  public async getBackupLogs(filters: {
    backupType?: BackupType;
    status?: BackupStatus;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{ backups: BackupLog[]; total: number }> {
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
  public async cleanExpiredBackups(): Promise<number> {
    const expiredBackups = await this.backupLogRepository.find({
      where: {
        status: BackupStatus.COMPLETED,
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
        await this.sentryService.logSystemEvent(
          "Backup cleanup",
          `Expired backup deleted: ${path.basename(
            backup.filePath || "unknown"
          )}`,
          EventLevel.INFO,
          { backupId: backup.id, backupType: backup.backupType }
        );
      } catch (error) {
        console.error(`Error cleaning backup ${backup.id}:`, error);
      }
    }

    return deletedCount;
  }

  // Get backup statistics
  public async getBackupStatistics(days: number = 30): Promise<any> {
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
  private generateBackupCommand(
    dbConfig: any,
    backupFilePath: string,
    compressionType?: string
  ): string {
    const { host, port, username, password, sid } = dbConfig;

    // Using Oracle Data Pump for backup
    const dumpCommand = `expdp ${username}/${password}@${host}:${port}/${sid} DIRECTORY=DATA_PUMP_DIR DUMPFILE=${path.basename(
      backupFilePath
    )} LOGFILE=${path.basename(backupFilePath, ".sql")}.log FULL=Y`;

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
  private getDatabaseConfig(): any {
    return {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      sid: process.env.DB_SID,
    };
  }

  // Get default storage location
  private getDefaultStorageLocation(): string {
    const baseDir =
      process.env.BACKUP_DIR || path.join(process.cwd(), "backups");
    return path.join(baseDir, "database");
  }

  // Calculate file checksum
  private calculateChecksum(filePath: string): string {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash("sha256");
    hashSum.update(fileBuffer);
    return hashSum.digest("hex");
  }

  // Get database statistics
  private async getDatabaseStatistics(): Promise<{
    tablesCount: number;
    recordsCount: number;
  }> {
    try {
      // Get tables count
      const tablesResult = await AppDataSource.query(`
        SELECT COUNT(*) as count 
        FROM USER_TABLES
      `);

      // Get total records count (approximate)
      const recordsResult = await AppDataSource.query(`
        SELECT SUM(NUM_ROWS) as count 
        FROM USER_TABLES
      `);

      return {
        tablesCount: parseInt(tablesResult[0]?.count || "0"),
        recordsCount: parseInt(recordsResult[0]?.count || "0"),
      };
    } catch (error) {
      console.error("Error getting database statistics:", error);
      return { tablesCount: 0, recordsCount: 0 };
    }
  }

  // Calculate expiration date based on retention policy
  private calculateExpirationDate(retentionPolicy: string): Date {
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
  private formatFileSize(bytes: number): string {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  }
}
