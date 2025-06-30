import * as Sentry from "@sentry/node";
import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { EventLog, EventType, EventLevel } from "../entities/event-log.entity";
import {
  SentryError,
  ErrorSeverity,
  ErrorStatus,
} from "../entities/sentry-error.entity";
import { v4 as uuidv4 } from "uuid";

export interface SentryEventOptions {
  eventType: EventType;
  action: string;
  description?: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  httpMethod?: string;
  endpoint?: string;
  statusCode?: number;
  responseTime?: number;
  requestBody?: any;
  responseBody?: any;
  errorDetails?: string;
  sessionId?: string;
  correlationId?: string;
  level?: EventLevel;
  additionalData?: any;
}

export interface SentryErrorOptions {
  errorType: string;
  errorMessage: string;
  stackTrace?: string;
  severity?: ErrorSeverity;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  httpMethod?: string;
  endpoint?: string;
  statusCode?: number;
  requestBody?: any;
  responseBody?: any;
  sessionId?: string;
  correlationId?: string;
  additionalContext?: any;
}

export class SentryService {
  private static instance: SentryService;
  private eventLogRepository = AppDataSource.getRepository(EventLog);
  private sentryErrorRepository = AppDataSource.getRepository(SentryError);
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): SentryService {
    if (!SentryService.instance) {
      SentryService.instance = new SentryService();
    }
    return SentryService.instance;
  }

  /**
   * Initialize Sentry SDK
   */
  public initialize(): void {
    if (this.isInitialized) return;

    const dsn = process.env.SENTRY_DSN;
    const environment = process.env.NODE_ENV || "development";

    if (!dsn) {
      console.warn("SENTRY_DSN not found. Sentry will not be initialized.");
      return;
    }

    try {
      Sentry.init({
        dsn,
        environment,
        // Performance Monitoring
        tracesSampleRate: environment === "production" ? 0.1 : 1.0,
        // Enable profiling
        profilesSampleRate: environment === "production" ? 0.1 : 1.0,
        // Configure beforeSend to filter out sensitive data
        beforeSend(event) {
          // Filter out health check endpoints
          if (event.request?.url?.includes("/api/health")) {
            return null;
          }
          return event;
        },
        // Configure beforeSendTransaction to filter out certain transactions
        beforeSendTransaction(event) {
          // Filter out health check transactions
          if (event.transaction?.includes("/api/health")) {
            return null;
          }
          return event;
        },
        // Enable debug mode in development
        debug: environment === "development",
      });

      this.isInitialized = true;
      console.log("✅ Sentry initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize Sentry:", error);
    }
  }

  /**
   * Set up Sentry request handler for Express
   */
  public setupRequestHandler(app: any): void {
    if (!this.isInitialized) this.initialize();

    // Note: Sentry.Handlers is not available in the current version
    // We'll handle request tracking manually through our custom middleware
    console.log("ℹ️ Sentry request handler setup - using manual tracking");
  }

  /**
   * Set up Sentry error handler for Express
   */
  public setupErrorHandler(app: any): void {
    if (!this.isInitialized) this.initialize();

    // Note: Sentry.Handlers is not available in the current version
    // We'll handle error tracking manually through our custom error handling
    console.log("ℹ️ Sentry error handler setup - using manual tracking");
  }

  /**
   * Log an event to both Sentry and database
   */
  public async logEvent(options: SentryEventOptions): Promise<EventLog> {
    const correlationId = options.correlationId || uuidv4();

    try {
      // Log to Sentry first
      if (this.isInitialized) {
        this.logToSentry(options, correlationId);
      }

      // Log to database
      const savedEvent = await this.logToDatabase(options, correlationId);

      // Log to console for development
      if (process.env.NODE_ENV === "development") {
        console.log(
          `[SENTRY EVENT] ${options.eventType.toUpperCase()}: ${
            options.action
          }`,
          {
            userId: options.userId,
            ipAddress: options.ipAddress,
            endpoint: options.endpoint,
            statusCode: options.statusCode,
            correlationId,
            timestamp: new Date().toISOString(),
          }
        );
      }

      return savedEvent;
    } catch (error) {
      console.error("Error in logEvent:", error);
      // Return mock event log for compatibility even if logging fails
      const mockEventLog = new EventLog();
      mockEventLog.eventType = options.eventType;
      mockEventLog.level = options.level || EventLevel.INFO;
      mockEventLog.action = options.action;
      mockEventLog.correlationId = correlationId;
      return mockEventLog;
    }
  }

  /**
   * Capture and store an error
   */
  public async captureError(options: SentryErrorOptions): Promise<SentryError> {
    const correlationId = options.correlationId || uuidv4();

    try {
      // Capture error in Sentry first
      if (this.isInitialized) {
        this.captureErrorInSentry(options, correlationId);
      }

      // Store in database
      const savedError = await this.storeErrorInDatabase(
        options,
        correlationId
      );

      // Log to console for development
      if (process.env.NODE_ENV === "development") {
        console.error(
          `[SENTRY ERROR] ${options.errorType}: ${options.errorMessage}`,
          {
            userId: options.userId,
            ipAddress: options.ipAddress,
            endpoint: options.endpoint,
            statusCode: options.statusCode,
            correlationId,
            timestamp: new Date().toISOString(),
          }
        );
      }

      return savedError;
    } catch (error) {
      console.error("Error in captureError:", error);
      // Return mock error for compatibility even if logging fails
      const mockError = new SentryError();
      mockError.errorType = options.errorType;
      mockError.errorMessage = options.errorMessage;
      mockError.severity = options.severity || ErrorSeverity.MEDIUM;
      mockError.status = ErrorStatus.NEW;
      mockError.correlationId = correlationId;
      mockError.sentryEventId = uuidv4();
      return mockError;
    }
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
    const options: SentryErrorOptions = {
      errorType: error.constructor.name,
      errorMessage: error.message,
      stackTrace: error.stack,
      severity: this.getSeverityFromStatusCode(statusCode),
      userId: (req as any).user?.id || (req as any).userId,
      ipAddress: this.getClientIp(req),
      userAgent: req.get("User-Agent"),
      httpMethod: req.method,
      endpoint: req.originalUrl,
      statusCode: statusCode,
      requestBody: this.sanitizeRequestBody(req.body),
      sessionId: req.session?.id,
      correlationId: (req.headers["x-correlation-id"] as string) || uuidv4(),
      additionalContext: {
        url: req.url,
        headers: this.sanitizeHeaders(req.headers),
        timestamp: new Date().toISOString(),
      },
    };

    return await this.captureError(options);
  }

  /**
   * Log admin login event
   */
  public async logAdminLogin(
    req: Request,
    res: Response,
    userId: string,
    success: boolean
  ): Promise<void> {
    const options: SentryEventOptions = {
      eventType: EventType.LOGIN,
      action: success ? "Admin login successful" : "Admin login failed",
      description: `Admin login attempt for user: ${userId}`,
      userId: userId,
      ipAddress: this.getClientIp(req),
      userAgent: req.get("User-Agent"),
      httpMethod: req.method,
      endpoint: req.originalUrl,
      statusCode: success ? 200 : 401,
      level: success ? EventLevel.INFO : EventLevel.WARNING,
      sessionId: req.session?.id,
      correlationId: (req.headers["x-correlation-id"] as string) || uuidv4(),
    };

    await this.logEvent(options);
  }

  /**
   * Log admin logout event
   */
  public async logAdminLogout(
    req: Request,
    res: Response,
    userId: string
  ): Promise<void> {
    const options: SentryEventOptions = {
      eventType: EventType.LOGOUT,
      action: "Admin logout",
      description: `Admin logout for user: ${userId}`,
      userId: userId,
      ipAddress: this.getClientIp(req),
      userAgent: req.get("User-Agent"),
      httpMethod: req.method,
      endpoint: req.originalUrl,
      statusCode: 200,
      level: EventLevel.INFO,
      sessionId: req.session?.id,
      correlationId: (req.headers["x-correlation-id"] as string) || uuidv4(),
    };

    await this.logEvent(options);
  }

  /**
   * Log API call event
   */
  public async logApiCall(
    req: Request,
    res: Response,
    startTime: number,
    responseBody?: any,
    error?: Error
  ): Promise<void> {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    const statusCode = res.statusCode;
    const userId = (req as any).user?.id || (req as any).userId;

    const options: SentryEventOptions = {
      eventType: EventType.API_CALL,
      action: `${req.method} ${req.originalUrl}`,
      description: `API call to ${req.originalUrl}`,
      userId: userId,
      ipAddress: this.getClientIp(req),
      userAgent: req.get("User-Agent"),
      httpMethod: req.method,
      endpoint: req.originalUrl,
      statusCode: statusCode,
      responseTime: responseTime,
      requestBody: this.sanitizeRequestBody(req.body),
      responseBody: responseBody,
      errorDetails: error ? error.stack : undefined,
      level: this.getEventLevel(statusCode, error),
      sessionId: req.session?.id,
      correlationId: (req.headers["x-correlation-id"] as string) || uuidv4(),
    };

    await this.logEvent(options);
  }

  /**
   * Log system event
   */
  public async logSystemEvent(
    action: string,
    description: string,
    level: EventLevel = EventLevel.INFO,
    additionalData?: any
  ): Promise<void> {
    const options: SentryEventOptions = {
      eventType: EventType.SYSTEM,
      action: action,
      description: description,
      level: level,
      additionalData: additionalData,
    };

    await this.logEvent(options);
  }

  /**
   * Get events by filters (from database)
   */
  public async getEvents(filters: {
    eventType?: EventType;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    level?: EventLevel;
    limit?: number;
    offset?: number;
  }): Promise<{ events: EventLog[]; total: number }> {
    const queryBuilder = this.eventLogRepository.createQueryBuilder("event");

    if (filters.eventType) {
      queryBuilder.andWhere("event.eventType = :eventType", {
        eventType: filters.eventType,
      });
    }

    if (filters.userId) {
      queryBuilder.andWhere("event.userId = :userId", {
        userId: filters.userId,
      });
    }

    if (filters.startDate) {
      queryBuilder.andWhere("event.createdAt >= :startDate", {
        startDate: filters.startDate,
      });
    }

    if (filters.endDate) {
      queryBuilder.andWhere("event.createdAt <= :endDate", {
        endDate: filters.endDate,
      });
    }

    if (filters.level) {
      queryBuilder.andWhere("event.level = :level", { level: filters.level });
    }

    queryBuilder.orderBy("event.createdAt", "DESC");

    const total = await queryBuilder.getCount();

    if (filters.limit) {
      queryBuilder.limit(filters.limit);
    }

    if (filters.offset) {
      queryBuilder.offset(filters.offset);
    }

    const events = await queryBuilder.getMany();

    return { events, total };
  }

  /**
   * Get errors by filters (from database)
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
    const queryBuilder = this.sentryErrorRepository.createQueryBuilder("error");

    if (filters.severity) {
      queryBuilder.andWhere("error.severity = :severity", {
        severity: filters.severity,
      });
    }

    if (filters.status) {
      queryBuilder.andWhere("error.status = :status", {
        status: filters.status,
      });
    }

    if (filters.errorType) {
      queryBuilder.andWhere("error.errorType = :errorType", {
        errorType: filters.errorType,
      });
    }

    if (filters.userId) {
      queryBuilder.andWhere("error.userId = :userId", {
        userId: filters.userId,
      });
    }

    if (filters.startDate) {
      queryBuilder.andWhere("error.createdAt >= :startDate", {
        startDate: filters.startDate,
      });
    }

    if (filters.endDate) {
      queryBuilder.andWhere("error.createdAt <= :endDate", {
        endDate: filters.endDate,
      });
    }

    queryBuilder.orderBy("error.lastOccurrence", "DESC");

    const total = await queryBuilder.getCount();

    if (filters.limit) {
      queryBuilder.limit(filters.limit);
    }

    if (filters.offset) {
      queryBuilder.offset(filters.offset);
    }

    const errors = await queryBuilder.getMany();

    return { errors, total };
  }

  /**
   * Update error status
   */
  public async updateErrorStatus(
    errorId: number,
    status: ErrorStatus,
    assignedTo?: string,
    resolutionNotes?: string
  ): Promise<SentryError> {
    const error = await this.sentryErrorRepository.findOne({
      where: { id: errorId },
    });

    if (!error) {
      throw new Error("Error not found");
    }

    error.status = status;
    if (assignedTo) error.assignedTo = assignedTo;
    if (resolutionNotes) error.resolutionNotes = resolutionNotes;

    return await this.sentryErrorRepository.save(error);
  }

  /**
   * Clean old event logs (retention policy)
   */
  public async cleanOldLogs(retentionDays: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await this.eventLogRepository
      .createQueryBuilder()
      .delete()
      .where("createdAt < :cutoffDate", { cutoffDate })
      .execute();

    return result.affected || 0;
  }

  /**
   * Clean old resolved errors (retention policy)
   */
  public async cleanOldResolvedErrors(
    retentionDays: number = 30
  ): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await this.sentryErrorRepository
      .createQueryBuilder()
      .delete()
      .where("status = :status AND lastOccurrence < :cutoffDate", {
        status: ErrorStatus.RESOLVED,
        cutoffDate,
      })
      .execute();

    return result.affected || 0;
  }

  /**
   * Private method to log to Sentry
   */
  private logToSentry(
    options: SentryEventOptions,
    correlationId: string
  ): void {
    if (!this.isInitialized) return;

    try {
      const sentryLevel = this.mapEventLevelToSentryLevel(
        options.level || EventLevel.INFO
      );

      Sentry.withScope((scope) => {
        scope.setLevel(sentryLevel);
        scope.setTag("eventType", options.eventType);
        scope.setTag("correlationId", correlationId);
        scope.setTag("httpMethod", options.httpMethod || "N/A");
        scope.setTag("endpoint", options.endpoint || "N/A");
        scope.setTag("statusCode", options.statusCode?.toString() || "N/A");

        if (options.userId) {
          scope.setUser({ id: options.userId });
        }

        if (options.ipAddress) {
          scope.setTag("ipAddress", options.ipAddress);
        }

        if (options.userAgent) {
          scope.setTag("userAgent", options.userAgent);
        }

        if (options.responseTime) {
          scope.setTag("responseTime", options.responseTime.toString());
        }

        if (options.requestBody) {
          scope.setContext("requestBody", options.requestBody);
        }

        if (options.responseBody) {
          scope.setContext("responseBody", options.responseBody);
        }

        if (options.additionalData) {
          scope.setContext("additionalData", options.additionalData);
        }

        // Send as message to Sentry
        Sentry.captureMessage(options.action, {
          level: sentryLevel,
          tags: {
            eventType: options.eventType,
            correlationId,
          },
          extra: {
            description: options.description,
            userId: options.userId,
            ipAddress: options.ipAddress,
            userAgent: options.userAgent,
            httpMethod: options.httpMethod,
            endpoint: options.endpoint,
            statusCode: options.statusCode,
            responseTime: options.responseTime,
            requestBody: options.requestBody,
            responseBody: options.responseBody,
            errorDetails: options.errorDetails,
            sessionId: options.sessionId,
            additionalData: options.additionalData,
          },
        });
      });
    } catch (error) {
      console.error("Error logging to Sentry:", error);
    }
  }

  /**
   * Private method to capture error in Sentry
   */
  private captureErrorInSentry(
    options: SentryErrorOptions,
    correlationId: string
  ): void {
    if (!this.isInitialized) return;

    try {
      const sentryLevel = this.mapErrorSeverityToSentryLevel(
        options.severity || ErrorSeverity.MEDIUM
      );

      Sentry.withScope((scope) => {
        scope.setLevel(sentryLevel);
        scope.setTag("errorType", options.errorType);
        scope.setTag("correlationId", correlationId);
        scope.setTag("httpMethod", options.httpMethod || "N/A");
        scope.setTag("endpoint", options.endpoint || "N/A");
        scope.setTag("statusCode", options.statusCode?.toString() || "N/A");

        if (options.userId) {
          scope.setUser({ id: options.userId });
        }

        if (options.ipAddress) {
          scope.setTag("ipAddress", options.ipAddress);
        }

        if (options.userAgent) {
          scope.setTag("userAgent", options.userAgent);
        }

        if (options.requestBody) {
          scope.setContext("requestBody", options.requestBody);
        }

        if (options.responseBody) {
          scope.setContext("responseBody", options.responseBody);
        }

        if (options.additionalContext) {
          scope.setContext("additionalContext", options.additionalContext);
        }

        // Create error object for Sentry
        const error = new Error(options.errorMessage);
        error.name = options.errorType;
        if (options.stackTrace) {
          error.stack = options.stackTrace;
        }

        Sentry.captureException(error, {
          level: sentryLevel,
          tags: {
            errorType: options.errorType,
            correlationId,
          },
          extra: {
            userId: options.userId,
            ipAddress: options.ipAddress,
            userAgent: options.userAgent,
            httpMethod: options.httpMethod,
            endpoint: options.endpoint,
            statusCode: options.statusCode,
            requestBody: options.requestBody,
            responseBody: options.responseBody,
            sessionId: options.sessionId,
            additionalContext: options.additionalContext,
          },
        });
      });
    } catch (error) {
      console.error("Error capturing error in Sentry:", error);
    }
  }

  /**
   * Private method to log to database
   */
  private async logToDatabase(
    options: SentryEventOptions,
    correlationId: string
  ): Promise<EventLog> {
    try {
      const eventLog = new EventLog();

      eventLog.eventType = options.eventType;
      eventLog.level = options.level || EventLevel.INFO;
      eventLog.action = options.action;
      eventLog.description = options.description || null;
      eventLog.userId = options.userId || null;
      eventLog.ipAddress = options.ipAddress || null;
      eventLog.userAgent = options.userAgent || null;
      eventLog.httpMethod = options.httpMethod || null;
      eventLog.endpoint = options.endpoint || null;
      eventLog.statusCode = options.statusCode || null;
      eventLog.responseTime = options.responseTime || null;
      eventLog.sessionId = options.sessionId || null;
      eventLog.correlationId = correlationId;

      // Handle request/response body serialization
      if (options.requestBody) {
        eventLog.requestBody =
          typeof options.requestBody === "string"
            ? options.requestBody
            : JSON.stringify(options.requestBody);
      }

      if (options.responseBody) {
        eventLog.responseBody =
          typeof options.responseBody === "string"
            ? options.responseBody
            : JSON.stringify(options.responseBody);
      }

      if (options.errorDetails) {
        eventLog.errorDetails = options.errorDetails;
      }

      if (options.additionalData) {
        eventLog.responseBody =
          typeof options.additionalData === "string"
            ? options.additionalData
            : JSON.stringify(options.additionalData);
      }

      return await this.eventLogRepository.save(eventLog);
    } catch (error) {
      console.error("Error logging event to database:", error);
      throw error;
    }
  }

  /**
   * Private method to store error in database
   */
  private async storeErrorInDatabase(
    options: SentryErrorOptions,
    correlationId: string
  ): Promise<SentryError> {
    try {
      // Check if similar error exists (based on error type and message)
      const existingError = await this.sentryErrorRepository.findOne({
        where: {
          errorType: options.errorType,
          errorMessage: options.errorMessage,
          status: ErrorStatus.NEW,
        },
      });

      if (existingError) {
        // Update existing error with occurrence count
        existingError.occurrenceCount += 1;
        existingError.lastOccurrence = new Date();
        existingError.additionalContext = this.mergeContext(
          existingError.additionalContext,
          options.additionalContext
        );

        return await this.sentryErrorRepository.save(existingError);
      } else {
        // Create new error record
        const sentryError = new SentryError();

        sentryError.errorType = options.errorType;
        sentryError.errorMessage = options.errorMessage;
        sentryError.stackTrace = options.stackTrace || null;
        sentryError.severity = options.severity || ErrorSeverity.MEDIUM;
        sentryError.status = ErrorStatus.NEW;
        sentryError.userId = options.userId || null;
        sentryError.ipAddress = options.ipAddress || null;
        sentryError.userAgent = options.userAgent || null;
        sentryError.httpMethod = options.httpMethod || null;
        sentryError.endpoint = options.endpoint || null;
        sentryError.statusCode = options.statusCode || null;
        sentryError.sessionId = options.sessionId || null;
        sentryError.correlationId = correlationId;
        sentryError.sentryEventId = uuidv4();
        sentryError.occurrenceCount = 1;
        sentryError.firstOccurrence = new Date();
        sentryError.lastOccurrence = new Date();

        // Handle request/response body serialization
        if (options.requestBody) {
          sentryError.requestBody =
            typeof options.requestBody === "string"
              ? options.requestBody
              : JSON.stringify(options.requestBody);
        }

        if (options.responseBody) {
          sentryError.responseBody =
            typeof options.responseBody === "string"
              ? options.responseBody
              : JSON.stringify(options.responseBody);
        }

        if (options.additionalContext) {
          sentryError.additionalContext =
            typeof options.additionalContext === "string"
              ? options.additionalContext
              : JSON.stringify(options.additionalContext);
        }

        return await this.sentryErrorRepository.save(sentryError);
      }
    } catch (error) {
      console.error("Error storing error in database:", error);
      throw error;
    }
  }

  /**
   * Map EventLevel to Sentry level
   */
  private mapEventLevelToSentryLevel(level: EventLevel): Sentry.SeverityLevel {
    switch (level) {
      case EventLevel.CRITICAL:
        return "fatal";
      case EventLevel.ERROR:
        return "error";
      case EventLevel.WARNING:
        return "warning";
      case EventLevel.INFO:
        return "info";
      default:
        return "info";
    }
  }

  /**
   * Map ErrorSeverity to Sentry level
   */
  private mapErrorSeverityToSentryLevel(
    severity: ErrorSeverity
  ): Sentry.SeverityLevel {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return "fatal";
      case ErrorSeverity.HIGH:
        return "error";
      case ErrorSeverity.MEDIUM:
        return "warning";
      case ErrorSeverity.LOW:
        return "info";
      default:
        return "error";
    }
  }

  /**
   * Get client IP address
   */
  private getClientIp(req: Request): string {
    return (
      req.ip ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      (req.connection as any).socket?.remoteAddress ||
      "unknown"
    );
  }

  /**
   * Sanitize request body for logging (remove sensitive data)
   */
  private sanitizeRequestBody(body: any): any {
    if (!body) return body;

    const sanitized = { ...body };
    const sensitiveFields = [
      "password",
      "token",
      "secret",
      "key",
      "authorization",
    ];

    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = "[REDACTED]";
      }
    });

    return sanitized;
  }

  /**
   * Sanitize headers for logging (remove sensitive data)
   */
  private sanitizeHeaders(headers: any): any {
    if (!headers) return headers;

    const sanitized = { ...headers };
    const sensitiveHeaders = ["authorization", "cookie", "x-api-key"];

    sensitiveHeaders.forEach((header) => {
      if (sanitized[header]) {
        sanitized[header] = "[REDACTED]";
      }
    });

    return sanitized;
  }

  /**
   * Get severity from status code
   */
  private getSeverityFromStatusCode(statusCode: number): ErrorSeverity {
    if (statusCode >= 500) return ErrorSeverity.HIGH;
    if (statusCode >= 400) return ErrorSeverity.MEDIUM;
    return ErrorSeverity.LOW;
  }

  /**
   * Get event level based on status code and error
   */
  private getEventLevel(statusCode: number, error?: Error): EventLevel {
    if (error) return EventLevel.ERROR;
    if (statusCode >= 500) return EventLevel.ERROR;
    if (statusCode >= 400) return EventLevel.WARNING;
    return EventLevel.INFO;
  }

  /**
   * Merge additional context
   */
  private mergeContext(
    existingContext: string | null,
    newContext: any
  ): string {
    if (!existingContext && !newContext) return "";

    let existing = {};
    if (existingContext) {
      try {
        existing = JSON.parse(existingContext);
      } catch (e) {
        existing = { raw: existingContext };
      }
    }

    const merged = { ...existing, ...newContext };
    return JSON.stringify(merged);
  }
}
