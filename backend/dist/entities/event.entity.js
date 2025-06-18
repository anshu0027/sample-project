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
exports.Event = void 0;
const typeorm_1 = require("typeorm");
const quote_entity_1 = require("./quote.entity");
const policy_entity_1 = require("./policy.entity");
const venue_entity_1 = require("./venue.entity");
let Event = class Event {
};
exports.Event = Event;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'ID' }),
    __metadata("design:type", Number)
], Event.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'EVENTTYPE' }),
    __metadata("design:type", String)
], Event.prototype, "eventType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'EVENTDATE' }),
    __metadata("design:type", Date)
], Event.prototype, "eventDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'MAXGUESTS' }),
    __metadata("design:type", String)
], Event.prototype, "maxGuests", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'HONOREE1FIRSTNAME', nullable: true }),
    __metadata("design:type", String)
], Event.prototype, "honoree1FirstName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'HONOREE1LASTNAME', nullable: true }),
    __metadata("design:type", String)
], Event.prototype, "honoree1LastName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'HONOREE2FIRSTNAME', nullable: true }),
    __metadata("design:type", String)
], Event.prototype, "honoree2FirstName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'HONOREE2LASTNAME', nullable: true }),
    __metadata("design:type", String)
], Event.prototype, "honoree2LastName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'QUOTEID', unique: true, nullable: true }),
    __metadata("design:type", Number)
], Event.prototype, "quoteId", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => quote_entity_1.Quote, (quote) => quote.event),
    (0, typeorm_1.JoinColumn)({ name: 'QUOTEID' }),
    __metadata("design:type", quote_entity_1.Quote)
], Event.prototype, "quote", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'POLICYID', unique: true, nullable: true }),
    __metadata("design:type", Number)
], Event.prototype, "policyId", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => policy_entity_1.Policy, (policy) => policy.event),
    (0, typeorm_1.JoinColumn)({ name: 'POLICYID' }),
    __metadata("design:type", policy_entity_1.Policy)
], Event.prototype, "policy", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => venue_entity_1.Venue, (venue) => venue.event),
    __metadata("design:type", venue_entity_1.Venue)
], Event.prototype, "venue", void 0);
exports.Event = Event = __decorate([
    (0, typeorm_1.Entity)('EVENTS')
], Event);
