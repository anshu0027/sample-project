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
exports.PolicyHolder = void 0;
const typeorm_1 = require("typeorm");
const quote_entity_1 = require("./quote.entity");
const policy_entity_1 = require("./policy.entity");
let PolicyHolder = class PolicyHolder {
};
exports.PolicyHolder = PolicyHolder;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'ID' }),
    __metadata("design:type", Number)
], PolicyHolder.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'FIRSTNAME' }),
    __metadata("design:type", String)
], PolicyHolder.prototype, "firstName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'LASTNAME' }),
    __metadata("design:type", String)
], PolicyHolder.prototype, "lastName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'PHONE' }),
    __metadata("design:type", String)
], PolicyHolder.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'RELATIONSHIP', nullable: true }),
    __metadata("design:type", String)
], PolicyHolder.prototype, "relationship", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'HEARABOUTUS', nullable: true }),
    __metadata("design:type", String)
], PolicyHolder.prototype, "hearAboutUs", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ADDRESS' }),
    __metadata("design:type", String)
], PolicyHolder.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'COUNTRY' }),
    __metadata("design:type", String)
], PolicyHolder.prototype, "country", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'CITY' }),
    __metadata("design:type", String)
], PolicyHolder.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'STATE', nullable: true }),
    __metadata("design:type", String)
], PolicyHolder.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ZIP', nullable: true }),
    __metadata("design:type", String)
], PolicyHolder.prototype, "zip", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'LEGALNOTICES', nullable: true }),
    __metadata("design:type", Boolean)
], PolicyHolder.prototype, "legalNotices", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'COMPLETINGFORMNAME', nullable: true }),
    __metadata("design:type", String)
], PolicyHolder.prototype, "completingFormName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'QUOTEID', unique: true, nullable: true }),
    __metadata("design:type", Number)
], PolicyHolder.prototype, "quoteId", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => quote_entity_1.Quote, (quote) => quote.policyHolder),
    (0, typeorm_1.JoinColumn)({ name: 'QUOTEID' }),
    __metadata("design:type", quote_entity_1.Quote)
], PolicyHolder.prototype, "quote", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'POLICYID', nullable: true }),
    __metadata("design:type", Number)
], PolicyHolder.prototype, "policyId", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => policy_entity_1.Policy, (policy) => policy.policyHolder),
    (0, typeorm_1.JoinColumn)({ name: 'POLICYID' }),
    __metadata("design:type", policy_entity_1.Policy)
], PolicyHolder.prototype, "policy", void 0);
exports.PolicyHolder = PolicyHolder = __decorate([
    (0, typeorm_1.Entity)('POLICY_HOLDERS')
], PolicyHolder);
