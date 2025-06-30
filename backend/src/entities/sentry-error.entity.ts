import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

export enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export enum ErrorStatus {
  NEW = "new",
  IN_PROGRESS = "in_progress",
  RESOLVED = "resolved",
  IGNORED = "ignored",
}

@Entity("SENTRY_ERRORS")
@Index(["severity", "createdAt"])
@Index(["status", "createdAt"])
@Index(["errorType", "createdAt"])
@Index(["userId", "createdAt"])
export class SentryError {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: "varchar2",
    length: 100,
    nullable: false,
  })
  errorType!: string;

  @Column({
    type: "varchar2",
    length: 500,
    nullable: false,
  })
  errorMessage!: string;

  @Column({
    type: "clob",
    nullable: true,
  })
  stackTrace!: string | null;

  @Column({
    type: "varchar2",
    length: 20,
    nullable: false,
    default: ErrorSeverity.MEDIUM,
  })
  severity!: ErrorSeverity;

  @Column({
    type: "varchar2",
    length: 20,
    nullable: false,
    default: ErrorStatus.NEW,
  })
  status!: ErrorStatus;

  @Column({
    type: "varchar2",
    length: 100,
    nullable: true,
  })
  userId!: string | null;

  @Column({
    type: "varchar2",
    length: 45,
    nullable: true,
  })
  ipAddress!: string | null;

  @Column({
    type: "varchar2",
    length: 500,
    nullable: true,
  })
  userAgent!: string | null;

  @Column({
    type: "varchar2",
    length: 10,
    nullable: true,
  })
  httpMethod!: string | null;

  @Column({
    type: "varchar2",
    length: 500,
    nullable: true,
  })
  endpoint!: string | null;

  @Column({
    type: "number",
    nullable: true,
  })
  statusCode!: number | null;

  @Column({
    type: "clob",
    nullable: true,
  })
  requestBody!: string | null;

  @Column({
    type: "clob",
    nullable: true,
  })
  responseBody!: string | null;

  @Column({
    type: "varchar2",
    length: 100,
    nullable: true,
  })
  sessionId!: string | null;

  @Column({
    type: "varchar2",
    length: 100,
    nullable: true,
  })
  correlationId!: string | null;

  @Column({
    type: "varchar2",
    length: 100,
    nullable: true,
  })
  sentryEventId!: string | null;

  @Column({
    type: "number",
    nullable: false,
    default: 1,
  })
  occurrenceCount!: number;

  @Column({
    type: "date",
    nullable: true,
  })
  firstOccurrence!: Date | null;

  @Column({
    type: "date",
    nullable: true,
  })
  lastOccurrence!: Date | null;

  @Column({
    type: "clob",
    nullable: true,
  })
  additionalContext!: string | null;

  @Column({
    type: "varchar2",
    length: 100,
    nullable: true,
  })
  assignedTo!: string | null;

  @Column({
    type: "clob",
    nullable: true,
  })
  resolutionNotes!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
