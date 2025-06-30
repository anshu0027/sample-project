import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

export enum BackupType {
  DAILY = "daily",
  WEEKLY = "weekly",
  MANUAL = "manual",
  SYSTEM = "system",
}

export enum BackupStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
}

@Entity("BACKUP_LOGS")
@Index(["backupType", "createdAt"])
@Index(["status", "createdAt"])
@Index(["backupDate", "createdAt"])
export class BackupLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: "varchar2",
    length: 20,
    nullable: false,
  })
  backupType!: BackupType;

  @Column({
    type: "varchar2",
    length: 20,
    nullable: false,
    default: BackupStatus.PENDING,
  })
  status!: BackupStatus;

  @Column({
    type: "date",
    nullable: false,
  })
  backupDate!: Date;

  @Column({
    type: "varchar2",
    length: 500,
    nullable: true,
  })
  filePath!: string | null;

  @Column({
    type: "number",
    nullable: true,
  })
  fileSize!: number | null;

  @Column({
    type: "varchar2",
    length: 100,
    nullable: true,
  })
  checksum!: string | null;

  @Column({
    type: "varchar2",
    length: 100,
    nullable: true,
  })
  initiatedBy!: string | null;

  @Column({
    type: "date",
    nullable: true,
  })
  startedAt!: Date | null;

  @Column({
    type: "date",
    nullable: true,
  })
  completedAt!: Date | null;

  @Column({
    type: "number",
    nullable: true,
  })
  duration!: number | null;

  @Column({
    type: "clob",
    nullable: true,
  })
  description!: string | null;

  @Column({
    type: "clob",
    nullable: true,
  })
  errorDetails!: string | null;

  @Column({
    type: "number",
    nullable: true,
  })
  tablesCount!: number | null;

  @Column({
    type: "number",
    nullable: true,
  })
  recordsCount!: number | null;

  @Column({
    type: "varchar2",
    length: 100,
    nullable: true,
  })
  compressionType!: string | null;

  @Column({
    type: "varchar2",
    length: 500,
    nullable: true,
  })
  storageLocation!: string | null;

  @Column({
    type: "varchar2",
    length: 100,
    nullable: true,
  })
  retentionPolicy!: string | null;

  @Column({
    type: "date",
    nullable: true,
  })
  expiresAt!: Date | null;

  @Column({
    type: "varchar2",
    length: 100,
    nullable: true,
  })
  backupVersion!: string | null;

  @Column({
    type: "clob",
    nullable: true,
  })
  additionalMetadata!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
