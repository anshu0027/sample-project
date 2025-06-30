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
exports.SentryError = exports.ErrorStatus = exports.ErrorSeverity = void 0;
const typeorm_1 = require("typeorm");
var ErrorSeverity;
(function (ErrorSeverity) {
    ErrorSeverity["LOW"] = "low";
    ErrorSeverity["MEDIUM"] = "medium";
    ErrorSeverity["HIGH"] = "high";
    ErrorSeverity["CRITICAL"] = "critical";
})(ErrorSeverity || (exports.ErrorSeverity = ErrorSeverity = {}));
var ErrorStatus;
(function (ErrorStatus) {
    ErrorStatus["NEW"] = "new";
    ErrorStatus["IN_PROGRESS"] = "in_progress";
    ErrorStatus["RESOLVED"] = "resolved";
    ErrorStatus["IGNORED"] = "ignored";
})(ErrorStatus || (exports.ErrorStatus = ErrorStatus = {}));
let SentryError = class SentryError {
};
exports.SentryError = SentryError;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SentryError.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "varchar2",
        length: 100,
        nullable: false,
    }),
    __metadata("design:type", String)
], SentryError.prototype, "errorType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "varchar2",
        length: 500,
        nullable: false,
    }),
    __metadata("design:type", String)
], SentryError.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "clob",
        nullable: true,
    }),
    __metadata("design:type", Object)
], SentryError.prototype, "stackTrace", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "varchar2",
        length: 20,
        nullable: false,
        default: ErrorSeverity.MEDIUM,
    }),
    __metadata("design:type", String)
], SentryError.prototype, "severity", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "varchar2",
        length: 20,
        nullable: false,
        default: ErrorStatus.NEW,
    }),
    __metadata("design:type", String)
], SentryError.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "varchar2",
        length: 100,
        nullable: true,
    }),
    __metadata("design:type", Object)
], SentryError.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "varchar2",
        length: 45,
        nullable: true,
    }),
    __metadata("design:type", Object)
], SentryError.prototype, "ipAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "varchar2",
        length: 500,
        nullable: true,
    }),
    __metadata("design:type", Object)
], SentryError.prototype, "userAgent", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "varchar2",
        length: 10,
        nullable: true,
    }),
    __metadata("design:type", Object)
], SentryError.prototype, "httpMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "varchar2",
        length: 500,
        nullable: true,
    }),
    __metadata("design:type", Object)
], SentryError.prototype, "endpoint", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "number",
        nullable: true,
    }),
    __metadata("design:type", Object)
], SentryError.prototype, "statusCode", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "clob",
        nullable: true,
    }),
    __metadata("design:type", Object)
], SentryError.prototype, "requestBody", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "clob",
        nullable: true,
    }),
    __metadata("design:type", Object)
], SentryError.prototype, "responseBody", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "varchar2",
        length: 100,
        nullable: true,
    }),
    __metadata("design:type", Object)
], SentryError.prototype, "sessionId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "varchar2",
        length: 100,
        nullable: true,
    }),
    __metadata("design:type", Object)
], SentryError.prototype, "correlationId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "varchar2",
        length: 100,
        nullable: true,
    }),
    __metadata("design:type", Object)
], SentryError.prototype, "sentryEventId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "number",
        nullable: false,
        default: 1,
    }),
    __metadata("design:type", Number)
], SentryError.prototype, "occurrenceCount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "date",
        nullable: true,
    }),
    __metadata("design:type", Object)
], SentryError.prototype, "firstOccurrence", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "date",
        nullable: true,
    }),
    __metadata("design:type", Object)
], SentryError.prototype, "lastOccurrence", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "clob",
        nullable: true,
    }),
    __metadata("design:type", Object)
], SentryError.prototype, "additionalContext", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "varchar2",
        length: 100,
        nullable: true,
    }),
    __metadata("design:type", Object)
], SentryError.prototype, "assignedTo", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "clob",
        nullable: true,
    }),
    __metadata("design:type", Object)
], SentryError.prototype, "resolutionNotes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], SentryError.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], SentryError.prototype, "updatedAt", void 0);
exports.SentryError = SentryError = __decorate([
    (0, typeorm_1.Entity)("SENTRY_ERRORS"),
    (0, typeorm_1.Index)(["severity", "createdAt"]),
    (0, typeorm_1.Index)(["status", "createdAt"]),
    (0, typeorm_1.Index)(["errorType", "createdAt"]),
    (0, typeorm_1.Index)(["userId", "createdAt"])
], SentryError);
//# sourceMappingURL=sentry-error.entity.js.map