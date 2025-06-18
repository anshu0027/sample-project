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
exports.Policy = void 0;
const typeorm_1 = require("typeorm");
const quote_entity_1 = require("./quote.entity");
const event_entity_1 = require("./event.entity");
const policy_holder_entity_1 = require("./policy-holder.entity");
const payment_entity_1 = require("./payment.entity");
const policy_version_entity_1 = require("./policy-version.entity");
let Policy = class Policy {
};
exports.Policy = Policy;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'ID' }),
    __metadata("design:type", Number)
], Policy.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'POLICYNUMBER', unique: true }),
    __metadata("design:type", String)
], Policy.prototype, "policyNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'PDFURL', nullable: true }),
    __metadata("design:type", String)
], Policy.prototype, "pdfUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'EMAILSENT', default: false }),
    __metadata("design:type", Boolean)
], Policy.prototype, "emailSent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'EMAILSENTAT', nullable: true }),
    __metadata("design:type", Date)
], Policy.prototype, "emailSentAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'CREATEDAT' }),
    __metadata("design:type", Date)
], Policy.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'UPDATEDAT' }),
    __metadata("design:type", Date)
], Policy.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'QUOTEID', unique: true, nullable: true }),
    __metadata("design:type", Number)
], Policy.prototype, "quoteId", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => quote_entity_1.Quote, (quote) => quote.policy),
    (0, typeorm_1.JoinColumn)({ name: 'QUOTEID' }),
    __metadata("design:type", quote_entity_1.Quote)
], Policy.prototype, "quote", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => event_entity_1.Event, (event) => event.policy),
    __metadata("design:type", event_entity_1.Event)
], Policy.prototype, "event", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => policy_holder_entity_1.PolicyHolder, (policyHolder) => policyHolder.policy),
    __metadata("design:type", policy_holder_entity_1.PolicyHolder)
], Policy.prototype, "policyHolder", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => payment_entity_1.Payment, (payment) => payment.policy),
    __metadata("design:type", Array)
], Policy.prototype, "payments", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => policy_version_entity_1.PolicyVersion, (version) => version.policy),
    __metadata("design:type", Array)
], Policy.prototype, "versions", void 0);
exports.Policy = Policy = __decorate([
    (0, typeorm_1.Entity)('POLICIES')
], Policy);
