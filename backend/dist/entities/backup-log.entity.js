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
exports.BackupLog = exports.BackupStatus = exports.BackupType = void 0;
const typeorm_1 = require("typeorm");
var BackupType;
(function (BackupType) {
    BackupType["DAILY"] = "daily";
    BackupType["WEEKLY"] = "weekly";
    BackupType["MANUAL"] = "manual";
    BackupType["SYSTEM"] = "system";
})(BackupType || (exports.BackupType = BackupType = {}));
var BackupStatus;
(function (BackupStatus) {
    BackupStatus["PENDING"] = "pending";
    BackupStatus["IN_PROGRESS"] = "in_progress";
    BackupStatus["COMPLETED"] = "completed";
    BackupStatus["FAILED"] = "failed";
    BackupStatus["CANCELLED"] = "cancelled";
})(BackupStatus || (exports.BackupStatus = BackupStatus = {}));
let BackupLog = class BackupLog {
};
exports.BackupLog = BackupLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], BackupLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "varchar2",
        length: 20,
        nullable: false,
    }),
    __metadata("design:type", String)
], BackupLog.prototype, "backupType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "varchar2",
        length: 20,
        nullable: false,
        default: BackupStatus.PENDING,
    }),
    __metadata("design:type", String)
], BackupLog.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "date",
        nullable: false,
    }),
    __metadata("design:type", Date)
], BackupLog.prototype, "backupDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "varchar2",
        length: 500,
        nullable: true,
    }),
    __metadata("design:type", Object)
], BackupLog.prototype, "filePath", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "number",
        nullable: true,
    }),
    __metadata("design:type", Object)
], BackupLog.prototype, "fileSize", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "varchar2",
        length: 100,
        nullable: true,
    }),
    __metadata("design:type", Object)
], BackupLog.prototype, "checksum", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "varchar2",
        length: 100,
        nullable: true,
    }),
    __metadata("design:type", Object)
], BackupLog.prototype, "initiatedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "date",
        nullable: true,
    }),
    __metadata("design:type", Object)
], BackupLog.prototype, "startedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "date",
        nullable: true,
    }),
    __metadata("design:type", Object)
], BackupLog.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "number",
        nullable: true,
    }),
    __metadata("design:type", Object)
], BackupLog.prototype, "duration", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "clob",
        nullable: true,
    }),
    __metadata("design:type", Object)
], BackupLog.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "clob",
        nullable: true,
    }),
    __metadata("design:type", Object)
], BackupLog.prototype, "errorDetails", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "number",
        nullable: true,
    }),
    __metadata("design:type", Object)
], BackupLog.prototype, "tablesCount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "number",
        nullable: true,
    }),
    __metadata("design:type", Object)
], BackupLog.prototype, "recordsCount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "varchar2",
        length: 100,
        nullable: true,
    }),
    __metadata("design:type", Object)
], BackupLog.prototype, "compressionType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "varchar2",
        length: 500,
        nullable: true,
    }),
    __metadata("design:type", Object)
], BackupLog.prototype, "storageLocation", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "varchar2",
        length: 100,
        nullable: true,
    }),
    __metadata("design:type", Object)
], BackupLog.prototype, "retentionPolicy", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "date",
        nullable: true,
    }),
    __metadata("design:type", Object)
], BackupLog.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "varchar2",
        length: 100,
        nullable: true,
    }),
    __metadata("design:type", Object)
], BackupLog.prototype, "backupVersion", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "clob",
        nullable: true,
    }),
    __metadata("design:type", Object)
], BackupLog.prototype, "additionalMetadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], BackupLog.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], BackupLog.prototype, "updatedAt", void 0);
exports.BackupLog = BackupLog = __decorate([
    (0, typeorm_1.Entity)("BACKUP_LOGS"),
    (0, typeorm_1.Index)(["backupType", "createdAt"]),
    (0, typeorm_1.Index)(["status", "createdAt"]),
    (0, typeorm_1.Index)(["backupDate", "createdAt"])
], BackupLog);
//# sourceMappingURL=backup-log.entity.js.map