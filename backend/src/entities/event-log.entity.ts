import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

export enum EventType {
  LOGIN = "login",
  LOGOUT = "logout",
  API_CALL = "api_call",
  ERROR = "error",
  SYSTEM = "system",
}

export enum EventLevel {
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
  CRITICAL = "critical",
}

@Entity("EVENT_LOGS")
@Index(["eventType", "createdAt"])
@Index(["userId", "createdAt"])
@Index(["ipAddress", "createdAt"])
@Index(["level", "createdAt"])
export class EventLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: "varchar2",
    length: 50,
    nullable: false,
  })
  eventType!: EventType;

  @Column({
    type: "varchar2",
    length: 20,
    nullable: false,
    default: EventLevel.INFO,
  })
  level!: EventLevel;

  @Column({
    type: "varchar2",
    length: 255,
    nullable: false,
  })
  action!: string;

  @Column({
    type: "clob",
    nullable: true,
  })
  description!: string | null;

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
    type: "number",
    nullable: true,
  })
  responseTime!: number | null;

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
    type: "clob",
    nullable: true,
  })
  errorDetails!: string | null;

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

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
