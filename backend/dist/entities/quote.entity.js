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
exports.Quote = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const event_entity_1 = require("./event.entity");
const policy_holder_entity_1 = require("./policy-holder.entity");
const policy_entity_1 = require("./policy.entity");
const payment_entity_1 = require("./payment.entity");
const enums_1 = require("./enums");
let Quote = class Quote {
};
exports.Quote = Quote;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'ID' }),
    __metadata("design:type", Number)
], Quote.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'QUOTENUMBER', unique: true }),
    __metadata("design:type", String)
], Quote.prototype, "quoteNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'EMAIL', type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Quote.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'COVERAGELEVEL', nullable: true }),
    __metadata("design:type", Number)
], Quote.prototype, "coverageLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'LIABILITYCOVERAGE', nullable: true }),
    __metadata("design:type", String)
], Quote.prototype, "liabilityCoverage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'LIQUORLIABILITY', default: false, nullable: true }),
    __metadata("design:type", Boolean)
], Quote.prototype, "liquorLiability", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'COVIDDISCLOSURE', nullable: true }),
    __metadata("design:type", Boolean)
], Quote.prototype, "covidDisclosure", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'SPECIALACTIVITIES', nullable: true }),
    __metadata("design:type", Boolean)
], Quote.prototype, "specialActivities", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'TOTALPREMIUM', type: 'float', nullable: true }),
    __metadata("design:type", Number)
], Quote.prototype, "totalPremium", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'BASEPREMIUM', type: 'float', nullable: true }),
    __metadata("design:type", Number)
], Quote.prototype, "basePremium", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'LIABILITYPREMIUM', type: 'float', nullable: true }),
    __metadata("design:type", Number)
], Quote.prototype, "liabilityPremium", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'LIQUORLIABILITYPREMIUM', type: 'float', nullable: true }),
    __metadata("design:type", Number)
], Quote.prototype, "liquorLiabilityPremium", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'STATUS', type: 'varchar', length: 20, default: enums_1.StepStatus.STEP1 }),
    __metadata("design:type", String)
], Quote.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'SOURCE', type: 'varchar', length: 20, default: enums_1.QuoteSource.CUSTOMER }),
    __metadata("design:type", String)
], Quote.prototype, "source", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ISCUSTOMERGENERATED', default: false }),
    __metadata("design:type", Boolean)
], Quote.prototype, "isCustomerGenerated", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'CONVERTEDTOPOLICY', default: false }),
    __metadata("design:type", Boolean)
], Quote.prototype, "convertedToPolicy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'EMAILSENT', default: false }),
    __metadata("design:type", Boolean)
], Quote.prototype, "emailSent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'EMAILSENTAT', nullable: true }),
    __metadata("design:type", Date)
], Quote.prototype, "emailSentAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'RESIDENTSTATE', nullable: true }),
    __metadata("design:type", String)
], Quote.prototype, "residentState", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'CREATEDAT' }),
    __metadata("design:type", Date)
], Quote.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'UPDATEDAT' }),
    __metadata("design:type", Date)
], Quote.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'USERID' }),
    __metadata("design:type", Number)
], Quote.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.quotes),
    (0, typeorm_1.JoinColumn)({ name: 'USERID' }),
    __metadata("design:type", user_entity_1.User)
], Quote.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => event_entity_1.Event, (event) => event.quote),
    __metadata("design:type", event_entity_1.Event)
], Quote.prototype, "event", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => policy_holder_entity_1.PolicyHolder, (policyHolder) => policyHolder.quote),
    __metadata("design:type", policy_holder_entity_1.PolicyHolder)
], Quote.prototype, "policyHolder", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => policy_entity_1.Policy, (policy) => policy.quote),
    __metadata("design:type", policy_entity_1.Policy)
], Quote.prototype, "policy", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => payment_entity_1.Payment, (payment) => payment.quote),
    __metadata("design:type", Array)
], Quote.prototype, "payments", void 0);
exports.Quote = Quote = __decorate([
    (0, typeorm_1.Entity)('QUOTES'),
    (0, typeorm_1.Index)(['userId']),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['source']),
    (0, typeorm_1.Index)(['convertedToPolicy'])
], Quote);
