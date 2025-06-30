"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventLoggerService = void 0;
const data_source_1 = require("../data-source");
const event_log_entity_1 = require("../entities/event-log.entity");
const uuid_1 = require("uuid");
class EventLoggerService {
    constructor() {
        this.eventLogRepository = data_source_1.AppDataSource.getRepository(event_log_entity_1.EventLog);
    }
    static getInstance() {
        if (!EventLoggerService.instance) {
            EventLoggerService.instance = new EventLoggerService();
        }
        return EventLoggerService.instance;
    }
    /**
     * Log an event to the database
     */
    async logEvent(options) {
        // Fire and forget - don't await this to avoid blocking the main request
        this.logEventAsync(options).catch((error) => {
            console.error("Error logging event (non-blocking):", error);
        });
        // Return a mock event log immediately to maintain API compatibility
        const mockEventLog = new event_log_entity_1.EventLog();
        mockEventLog.eventType = options.eventType;
        mockEventLog.level = options.level || event_log_entity_1.EventLevel.INFO;
        mockEventLog.action = options.action;
        mockEventLog.correlationId = options.correlationId || (0, uuid_1.v4)();
        return mockEventLog;
    }
    /**
     * Internal async method for actual logging
     */
    async logEventAsync(options) {
        try {
            const eventLog = new event_log_entity_1.EventLog();
            eventLog.eventType = options.eventType;
            eventLog.level = options.level || event_log_entity_1.EventLevel.INFO;
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
            eventLog.correlationId = options.correlationId || (0, uuid_1.v4)();
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
            const savedEvent = await this.eventLogRepository.save(eventLog);
            // Also log to console for development
            if (process.env.NODE_ENV === "development") {
                console.log(`[EVENT LOG] ${eventLog.eventType.toUpperCase()}: ${eventLog.action}`, {
                    userId: eventLog.userId,
                    ipAddress: eventLog.ipAddress,
                    endpoint: eventLog.endpoint,
                    statusCode: eventLog.statusCode,
                    timestamp: new Date().toISOString(),
                });
            }
            return savedEvent;
        }
        catch (error) {
            console.error("Error logging event:", error);
            throw error;
        }
    }
    /**
     * Log admin login event
     */
    async logAdminLogin(req, res, userId, success) {
        var _a;
        const options = {
            eventType: event_log_entity_1.EventType.LOGIN,
            action: success ? "Admin login successful" : "Admin login failed",
            description: `Admin login attempt for user: ${userId}`,
            userId: userId,
            ipAddress: this.getClientIp(req),
            userAgent: req.get("User-Agent"),
            httpMethod: req.method,
            endpoint: req.originalUrl,
            statusCode: success ? 200 : 401,
            level: success ? event_log_entity_1.EventLevel.INFO : event_log_entity_1.EventLevel.WARNING,
            sessionId: (_a = req.session) === null || _a === void 0 ? void 0 : _a.id,
            correlationId: req.headers["x-correlation-id"] || (0, uuid_1.v4)(),
        };
        // Fire and forget - don't await
        this.logEvent(options);
    }
    /**
     * Log admin logout event
     */
    async logAdminLogout(req, res, userId) {
        var _a;
        const options = {
            eventType: event_log_entity_1.EventType.LOGOUT,
            action: "Admin logout",
            description: `Admin logout for user: ${userId}`,
            userId: userId,
            ipAddress: this.getClientIp(req),
            userAgent: req.get("User-Agent"),
            httpMethod: req.method,
            endpoint: req.originalUrl,
            statusCode: 200,
            level: event_log_entity_1.EventLevel.INFO,
            sessionId: (_a = req.session) === null || _a === void 0 ? void 0 : _a.id,
            correlationId: req.headers["x-correlation-id"] || (0, uuid_1.v4)(),
        };
        // Fire and forget - don't await
        this.logEvent(options);
    }
    /**
     * Log API call event
     */
    async logApiCall(req, res, startTime, responseBody, error) {
        var _a, _b;
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        const statusCode = res.statusCode;
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || req.userId;
        const options = {
            eventType: event_log_entity_1.EventType.API_CALL,
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
            sessionId: (_b = req.session) === null || _b === void 0 ? void 0 : _b.id,
            correlationId: req.headers["x-correlation-id"] || (0, uuid_1.v4)(),
        };
        // Fire and forget - don't await
        this.logEvent(options);
    }
    /**
     * Log system event
     */
    async logSystemEvent(action, description, level = event_log_entity_1.EventLevel.INFO, additionalData) {
        const options = {
            eventType: event_log_entity_1.EventType.SYSTEM,
            action: action,
            description: description,
            level: level,
            additionalData: additionalData,
        };
        // Fire and forget - don't await
        this.logEvent(options);
    }
    /**
     * Get events by filters
     */
    async getEvents(filters) {
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
     * Clean old event logs (retention policy)
     */
    async cleanOldLogs(retentionDays = 90) {
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
     * Determine event level based on status code and error
     */
    getEventLevel(statusCode, error) {
        if (error)
            return event_log_entity_1.EventLevel.ERROR;
        if (statusCode >= 500)
            return event_log_entity_1.EventLevel.ERROR;
        if (statusCode >= 400)
            return event_log_entity_1.EventLevel.WARNING;
        return event_log_entity_1.EventLevel.INFO;
    }
}
exports.EventLoggerService = EventLoggerService;
//# sourceMappingURL=event-logger.service.js.map