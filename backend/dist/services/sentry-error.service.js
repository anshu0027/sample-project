"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SentryErrorService = void 0;
const data_source_1 = require("../data-source");
const sentry_error_entity_1 = require("../entities/sentry-error.entity");
const event_logger_service_1 = require("./event-logger.service");
const event_log_entity_1 = require("../entities/event-log.entity");
const uuid_1 = require("uuid");
class SentryErrorService {
    constructor() {
        this.sentryErrorRepository = data_source_1.AppDataSource.getRepository(sentry_error_entity_1.SentryError);
        this.eventLogger = event_logger_service_1.EventLoggerService.getInstance();
    }
    static getInstance() {
        if (!SentryErrorService.instance) {
            SentryErrorService.instance = new SentryErrorService();
        }
        return SentryErrorService.instance;
    }
    /**
     * Capture and store an error
     */
    async captureError(options) {
        try {
            // Check if similar error exists (based on error type and message)
            const existingError = await this.sentryErrorRepository.findOne({
                where: {
                    errorType: options.errorType,
                    errorMessage: options.errorMessage,
                    status: sentry_error_entity_1.ErrorStatus.NEW,
                },
            });
            if (existingError) {
                // Update existing error with occurrence count
                existingError.occurrenceCount += 1;
                existingError.lastOccurrence = new Date();
                existingError.additionalContext = this.mergeContext(existingError.additionalContext, options.additionalContext);
                const updatedError = await this.sentryErrorRepository.save(existingError);
                // Log the error occurrence
                await this.eventLogger.logEvent({
                    eventType: event_log_entity_1.EventType.ERROR,
                    action: `Error reoccurrence: ${options.errorType}`,
                    description: `Error "${options.errorMessage}" occurred again (${existingError.occurrenceCount} times)`,
                    userId: options.userId,
                    ipAddress: options.ipAddress,
                    userAgent: options.userAgent,
                    httpMethod: options.httpMethod,
                    endpoint: options.endpoint,
                    statusCode: options.statusCode,
                    level: event_log_entity_1.EventLevel.ERROR,
                    sessionId: options.sessionId,
                    correlationId: options.correlationId,
                });
                return updatedError;
            }
            else {
                // Create new error record
                const sentryError = new sentry_error_entity_1.SentryError();
                sentryError.errorType = options.errorType;
                sentryError.errorMessage = options.errorMessage;
                sentryError.stackTrace = options.stackTrace || null;
                sentryError.severity = options.severity || sentry_error_entity_1.ErrorSeverity.MEDIUM;
                sentryError.status = sentry_error_entity_1.ErrorStatus.NEW;
                sentryError.userId = options.userId || null;
                sentryError.ipAddress = options.ipAddress || null;
                sentryError.userAgent = options.userAgent || null;
                sentryError.httpMethod = options.httpMethod || null;
                sentryError.endpoint = options.endpoint || null;
                sentryError.statusCode = options.statusCode || null;
                sentryError.sessionId = options.sessionId || null;
                sentryError.correlationId = options.correlationId || (0, uuid_1.v4)();
                sentryError.sentryEventId = (0, uuid_1.v4)();
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
                const savedError = await this.sentryErrorRepository.save(sentryError);
                // Log the new error
                await this.eventLogger.logEvent({
                    eventType: event_log_entity_1.EventType.ERROR,
                    action: `New error captured: ${options.errorType}`,
                    description: `New error "${options.errorMessage}" captured and stored`,
                    userId: options.userId,
                    ipAddress: options.ipAddress,
                    userAgent: options.userAgent,
                    httpMethod: options.httpMethod,
                    endpoint: options.endpoint,
                    statusCode: options.statusCode,
                    level: event_log_entity_1.EventLevel.ERROR,
                    sessionId: options.sessionId,
                    correlationId: options.correlationId,
                });
                return savedError;
            }
        }
        catch (error) {
            console.error("Error capturing Sentry error:", error);
            throw error;
        }
    }
    /**
     * Capture error from request context
     */
    async captureRequestError(req, _res, error, statusCode = 500) {
        var _a, _b;
        const options = {
            errorType: error.constructor.name,
            errorMessage: error.message,
            stackTrace: error.stack,
            severity: this.getSeverityFromStatusCode(statusCode),
            userId: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || req.userId,
            ipAddress: this.getClientIp(req),
            userAgent: req.get("User-Agent"),
            httpMethod: req.method,
            endpoint: req.originalUrl,
            statusCode: statusCode,
            requestBody: this.sanitizeRequestBody(req.body),
            sessionId: (_b = req.session) === null || _b === void 0 ? void 0 : _b.id,
            correlationId: req.headers["x-correlation-id"] || (0, uuid_1.v4)(),
            additionalContext: {
                url: req.url,
                headers: this.sanitizeHeaders(req.headers),
                timestamp: new Date().toISOString(),
            },
        };
        return await this.captureError(options);
    }
    /**
     * Get errors by filters
     */
    async getErrors(filters) {
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
    async updateErrorStatus(errorId, status, assignedTo, resolutionNotes) {
        const error = await this.sentryErrorRepository.findOne({
            where: { id: errorId },
        });
        if (!error) {
            throw new Error("Error not found");
        }
        error.status = status;
        if (assignedTo)
            error.assignedTo = assignedTo;
        if (resolutionNotes)
            error.resolutionNotes = resolutionNotes;
        return await this.sentryErrorRepository.save(error);
    }
    /**
     * Get error statistics
     */
    async getErrorStatistics(days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const stats = await this.sentryErrorRepository
            .createQueryBuilder("error")
            .select([
            "error.severity as severity",
            "error.status as status",
            "COUNT(*) as count",
            "SUM(error.occurrenceCount) as totalOccurrences",
        ])
            .where("error.createdAt >= :startDate", { startDate })
            .groupBy("error.severity, error.status")
            .getRawMany();
        return stats;
    }
    /**
     * Clean old resolved errors (retention policy)
     */
    async cleanOldResolvedErrors(retentionDays = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
        const result = await this.sentryErrorRepository
            .createQueryBuilder()
            .delete()
            .where("status = :status AND lastOccurrence < :cutoffDate", {
            status: sentry_error_entity_1.ErrorStatus.RESOLVED,
            cutoffDate,
        })
            .execute();
        return result.affected || 0;
    }
    /**
     * Get client IP address
     */
    getClientIp(req) {
        var _a;
        return (req.ip ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            ((_a = req.connection.socket) === null || _a === void 0 ? void 0 : _a.remoteAddress) ||
            "unknown");
    }
    /**
     * Sanitize request body for logging (remove sensitive data)
     */
    sanitizeRequestBody(body) {
        if (!body)
            return body;
        const sanitized = Object.assign({}, body);
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
    sanitizeHeaders(headers) {
        if (!headers)
            return headers;
        const sanitized = Object.assign({}, headers);
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
    getSeverityFromStatusCode(statusCode) {
        if (statusCode >= 500)
            return sentry_error_entity_1.ErrorSeverity.HIGH;
        if (statusCode >= 400)
            return sentry_error_entity_1.ErrorSeverity.MEDIUM;
        return sentry_error_entity_1.ErrorSeverity.LOW;
    }
    /**
     * Merge additional context
     */
    mergeContext(existingContext, newContext) {
        if (!existingContext && !newContext)
            return "";
        let existing = {};
        if (existingContext) {
            try {
                existing = JSON.parse(existingContext);
            }
            catch (e) {
                existing = { raw: existingContext };
            }
        }
        const merged = Object.assign(Object.assign({}, existing), newContext);
        return JSON.stringify(merged);
    }
}
exports.SentryErrorService = SentryErrorService;
//# sourceMappingURL=sentry-error.service.js.map