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
exports.Payment = void 0;
const typeorm_1 = require("typeorm");
const quote_entity_1 = require("./quote.entity");
const policy_entity_1 = require("./policy.entity");
let Payment = class Payment {
};
exports.Payment = Payment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'ID' }),
    __metadata("design:type", Number)
], Payment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'AMOUNT', type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Payment.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'STATUS', length: 50 }),
    __metadata("design:type", String)
], Payment.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'METHOD', length: 50 }),
    __metadata("design:type", String)
], Payment.prototype, "method", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'REFERENCE', length: 100, nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "reference", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'CREATEDAT' }),
    __metadata("design:type", Date)
], Payment.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'UPDATEDAT' }),
    __metadata("design:type", Date)
], Payment.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'QUOTEID', nullable: true }),
    __metadata("design:type", Number)
], Payment.prototype, "quoteId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => quote_entity_1.Quote, (quote) => quote.payments),
    (0, typeorm_1.JoinColumn)({ name: 'QUOTEID' }),
    __metadata("design:type", quote_entity_1.Quote)
], Payment.prototype, "quote", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'POLICYID', nullable: true }),
    __metadata("design:type", Number)
], Payment.prototype, "policyId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => policy_entity_1.Policy, (policy) => policy.payments),
    (0, typeorm_1.JoinColumn)({ name: 'POLICYID' }),
    __metadata("design:type", policy_entity_1.Policy)
], Payment.prototype, "policy", void 0);
exports.Payment = Payment = __decorate([
    (0, typeorm_1.Entity)('PAYMENTS'),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['quoteId'])
], Payment);
//# sourceMappingURL=payment.entity.js.map