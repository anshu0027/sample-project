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
exports.PolicyVersion = void 0;
const typeorm_1 = require("typeorm");
const policy_entity_1 = require("./policy.entity");
let PolicyVersion = class PolicyVersion {
};
exports.PolicyVersion = PolicyVersion;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'ID' }),
    __metadata("design:type", Number)
], PolicyVersion.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'DATA', type: 'simple-json' }) // Json in Oracle might need special handling later
    ,
    __metadata("design:type", Object)
], PolicyVersion.prototype, "data", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'CREATEDAT' }),
    __metadata("design:type", Date)
], PolicyVersion.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'POLICYID', nullable: false }),
    __metadata("design:type", Number)
], PolicyVersion.prototype, "policyId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => policy_entity_1.Policy, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'POLICYID' }),
    __metadata("design:type", policy_entity_1.Policy)
], PolicyVersion.prototype, "policy", void 0);
exports.PolicyVersion = PolicyVersion = __decorate([
    (0, typeorm_1.Entity)('POLICY_VERSIONS'),
    (0, typeorm_1.Index)(['policyId'])
], PolicyVersion);
//# sourceMappingURL=policy-version.entity.js.map