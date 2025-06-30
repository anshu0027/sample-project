"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventLog = exports.EventLevel = exports.EventType = void 0;
const typeorm_1 = require("typeorm");
var EventType;
(function (EventType) {
    EventType["LOGIN"] = "login";
    EventType["LOGOUT"] = "logout";
    EventType["API_CALL"] = "api_call";
    EventType["ERROR"] = "error";
    EventType["SYSTEM"] = "system";
})(EventType || (exports.EventType = EventType = {}));
var EventLevel;
(function (EventLevel) {
    EventLevel["INFO"] = "info";
    EventLevel["WARNING"] = "warning";
    EventLevel["ERROR"] = "error";
    EventLevel["CRITICAL"] = "critical";
})(EventLevel || (exports.EventLevel = EventLevel = {}));
let EventLog = class EventLog {
};
exports.EventLog = EventLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], EventLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "varchar2",
        length: 50,
        nullable: false,
    }),
    __metadata("design:type", String)
], EventLog.prototype, "eventType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "varchar2",
        length: 20,
        nullable: false,
        default: EventLevel.INFO,
    }),
    __metadata("design:type", String)
], EventLog.prototype, "level", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "varchar2",
        length: 255,
        nullable: false,
    }),
    __metadata("design:type", String)
], EventLog.prototype, "action", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "clob",
        nullable: true,
    }),
    __metadata("design:type", Object)
], EventLog.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "varchar2",
        length: 100,
        nullable: true,
    }),
    __metadata("design:type", Object)
], EventLog.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "varchar2",
        length: 45,
        nullable: true,
    }),
    __metadata("design:type", Object)
], EventLog.prototype, "ipAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "varchar2",
        length: 500,
        nullable: true,
    }),
    __metadata("design:type", Object)
], EventLog.prototype, "userAgent", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "varchar2",
        length: 10,
        nullable: true,
    }),
    __metadata("design:type", Object)
], EventLog.prototype, "httpMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "varchar2",
        length: 500,
        nullable: true,
    }),
    __metadata("design:type", Object)
], EventLog.prototype, "endpoint", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "number",
        nullable: true,
    }),
    __metadata("design:type", Object)
], EventLog.prototype, "statusCode", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "number",
        nullable: true,
    }),
    __metadata("design:type", Object)
], EventLog.prototype, "responseTime", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "clob",
        nullable: true,
    }),
    __metadata("design:type", Object)
], EventLog.prototype, "requestBody", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "clob",
        nullable: true,
    }),
    __metadata("design:type", Object)
], EventLog.prototype, "responseBody", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "clob",
        nullable: true,
    }),
    __metadata("design:type", Object)
], EventLog.prototype, "errorDetails", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "varchar2",
        length: 100,
        nullable: true,
    }),
    __metadata("design:type", Object)
], EventLog.prototype, "sessionId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "varchar2",
        length: 100,
        nullable: true,
    }),
    __metadata("design:type", Object)
], EventLog.prototype, "correlationId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], EventLog.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], EventLog.prototype, "updatedAt", void 0);
exports.EventLog = EventLog = __decorate([
    (0, typeorm_1.Entity)("EVENT_LOGS"),
    (0, typeorm_1.Index)(["eventType", "createdAt"]),
    (0, typeorm_1.Index)(["userId", "createdAt"]),
    (0, typeorm_1.Index)(["ipAddress", "createdAt"]),
    (0, typeorm_1.Index)(["level", "createdAt"])
], EventLog);
//# sourceMappingURL=event-log.entity.js.map