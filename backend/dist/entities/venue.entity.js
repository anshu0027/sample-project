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
exports.Venue = void 0;
const typeorm_1 = require("typeorm");
const event_entity_1 = require("./event.entity");
let Venue = class Venue {
};
exports.Venue = Venue;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: "ID" }),
    __metadata("design:type", Number)
], Venue.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "NAME" }),
    __metadata("design:type", String)
], Venue.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "ADDRESS1" }),
    __metadata("design:type", String)
], Venue.prototype, "address1", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "ADDRESS2", nullable: true }),
    __metadata("design:type", String)
], Venue.prototype, "address2", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "COUNTRY" }),
    __metadata("design:type", String)
], Venue.prototype, "country", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "CITY" }),
    __metadata("design:type", String)
], Venue.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "STATE", nullable: true }),
    __metadata("design:type", String)
], Venue.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "ZIP", nullable: true }),
    __metadata("design:type", String)
], Venue.prototype, "zip", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "LOCATIONTYPE", nullable: true }),
    __metadata("design:type", String)
], Venue.prototype, "locationType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "CEREMONYLOCATIONTYPE", nullable: true }),
    __metadata("design:type", String)
], Venue.prototype, "ceremonyLocationType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "INDOOROUTDOOR", nullable: true }),
    __metadata("design:type", String)
], Venue.prototype, "indoorOutdoor", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "VENUEASINSURED", type: "number", default: 0 }),
    __metadata("design:type", Boolean)
], Venue.prototype, "venueAsInsured", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "RECEPTIONLOCATIONTYPE",
        type: "varchar",
        length: 255,
        nullable: true,
    }),
    __metadata("design:type", String)
], Venue.prototype, "receptionLocationType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "RECEPTIONINDOOROUTDOOR",
        type: "varchar",
        length: 255,
        nullable: true,
    }),
    __metadata("design:type", String)
], Venue.prototype, "receptionIndoorOutdoor", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "RECEPTIONVENUENAME",
        type: "varchar",
        length: 255,
        nullable: true,
    }),
    __metadata("design:type", String)
], Venue.prototype, "receptionVenueName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "RECEPTIONVENUEADDRESS1",
        type: "varchar",
        length: 255,
        nullable: true,
    }),
    __metadata("design:type", String)
], Venue.prototype, "receptionVenueAddress1", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "RECEPTIONVENUEADDRESS2",
        type: "varchar",
        length: 255,
        nullable: true,
    }),
    __metadata("design:type", String)
], Venue.prototype, "receptionVenueAddress2", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "RECEPTIONVENUECOUNTRY",
        type: "varchar",
        length: 255,
        nullable: true,
    }),
    __metadata("design:type", String)
], Venue.prototype, "receptionVenueCountry", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "RECEPTIONVENUECITY",
        type: "varchar",
        length: 255,
        nullable: true,
    }),
    __metadata("design:type", String)
], Venue.prototype, "receptionVenueCity", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "RECEPTIONVENUESTATE",
        type: "varchar",
        length: 255,
        nullable: true,
    }),
    __metadata("design:type", String)
], Venue.prototype, "receptionVenueState", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "RECEPTIONVENUEZIP",
        type: "varchar",
        length: 255,
        nullable: true,
    }),
    __metadata("design:type", String)
], Venue.prototype, "receptionVenueZip", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "RECEPTIONVENUEASINSURED",
        type: "number",
        default: 0,
        nullable: true,
    }),
    __metadata("design:type", Boolean)
], Venue.prototype, "receptionVenueAsInsured", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "BRUNCHLOCATIONTYPE",
        type: "varchar",
        length: 255,
        nullable: true,
    }),
    __metadata("design:type", String)
], Venue.prototype, "brunchLocationType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "BRUNCHINDOOROUTDOOR",
        type: "varchar",
        length: 255,
        nullable: true,
    }),
    __metadata("design:type", String)
], Venue.prototype, "brunchIndoorOutdoor", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "BRUNCHVENUENAME",
        type: "varchar",
        length: 255,
        nullable: true,
    }),
    __metadata("design:type", String)
], Venue.prototype, "brunchVenueName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "BRUNCHVENUEADDRESS1",
        type: "varchar",
        length: 255,
        nullable: true,
    }),
    __metadata("design:type", String)
], Venue.prototype, "brunchVenueAddress1", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "BRUNCHVENUEADDRESS2",
        type: "varchar",
        length: 255,
        nullable: true,
    }),
    __metadata("design:type", String)
], Venue.prototype, "brunchVenueAddress2", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "BRUNCHVENUECOUNTRY",
        type: "varchar",
        length: 255,
        nullable: true,
    }),
    __metadata("design:type", String)
], Venue.prototype, "brunchVenueCountry", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "BRUNCHVENUECITY",
        type: "varchar",
        length: 255,
        nullable: true,
    }),
    __metadata("design:type", String)
], Venue.prototype, "brunchVenueCity", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "BRUNCHVENUESTATE",
        type: "varchar",
        length: 255,
        nullable: true,
    }),
    __metadata("design:type", String)
], Venue.prototype, "brunchVenueState", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "BRUNCHVENUEZIP",
        type: "varchar",
        length: 255,
        nullable: true,
    }),
    __metadata("design:type", String)
], Venue.prototype, "brunchVenueZip", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "BRUNCHVENUEASINSURED",
        type: "number",
        default: 0,
        nullable: true,
    }),
    __metadata("design:type", Boolean)
], Venue.prototype, "brunchVenueAsInsured", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "REHEARSALLOCATIONTYPE",
        type: "varchar",
        length: 255,
        nullable: true,
    }),
    __metadata("design:type", String)
], Venue.prototype, "rehearsalLocationType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "REHEARSALINDOOROUTDOOR",
        type: "varchar",
        length: 255,
        nullable: true,
    }),
    __metadata("design:type", String)
], Venue.prototype, "rehearsalIndoorOutdoor", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "REHEARSALVENUENAME",
        type: "varchar",
        length: 255,
        nullable: true,
    }),
    __metadata("design:type", String)
], Venue.prototype, "rehearsalVenueName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "REHEARSALVENUEADDRESS1",
        type: "varchar",
        length: 255,
        nullable: true,
    }),
    __metadata("design:type", String)
], Venue.prototype, "rehearsalVenueAddress1", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "REHEARSALVENUEADDRESS2",
        type: "varchar",
        length: 255,
        nullable: true,
    }),
    __metadata("design:type", String)
], Venue.prototype, "rehearsalVenueAddress2", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "REHEARSALVENUECOUNTRY",
        type: "varchar",
        length: 255,
        nullable: true,
    }),
    __metadata("design:type", String)
], Venue.prototype, "rehearsalVenueCountry", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "REHEARSALVENUECITY",
        type: "varchar",
        length: 255,
        nullable: true,
    }),
    __metadata("design:type", String)
], Venue.prototype, "rehearsalVenueCity", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "REHEARSALVENUESTATE",
        type: "varchar",
        length: 255,
        nullable: true,
    }),
    __metadata("design:type", String)
], Venue.prototype, "rehearsalVenueState", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "REHEARSALVENUEZIP",
        type: "varchar",
        length: 255,
        nullable: true,
    }),
    __metadata("design:type", String)
], Venue.prototype, "rehearsalVenueZip", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "REHEARSALVENUEASINSURED",
        type: "number",
        default: 0,
        nullable: true,
    }),
    __metadata("design:type", Boolean)
], Venue.prototype, "rehearsalVenueAsInsured", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "REHEARSALDINNERVENUENAME",
        type: "varchar",
        length: 255,
        nullable: true,
    }),
    __metadata("design:type", String)
], Venue.prototype, "rehearsalDinnerVenueName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "REHEARSALDINNERVENUEADDRESS1",
        type: "varchar",
        length: 255,
        nullable: true,
    }),
    __metadata("design:type", String)
], Venue.prototype, "rehearsalDinnerVenueAddress1", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "REHEARSALDINNERVENUEADDRESS2",
        type: "varchar",
        length: 255,
        nullable: true,
    }),
    __metadata("design:type", String)
], Venue.prototype, "rehearsalDinnerVenueAddress2", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "REHEARSALDINNERVENUECOUNTRY",
        type: "varchar",
        length: 255,
        nullable: true,
    }),
    __metadata("design:type", String)
], Venue.prototype, "rehearsalDinnerVenueCountry", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "REHEARSALDINNERVENUECITY",
        type: "varchar",
        length: 255,
        nullable: true,
    }),
    __metadata("design:type", String)
], Venue.prototype, "rehearsalDinnerVenueCity", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "REHEARSALDINNERVENUESTATE",
        type: "varchar",
        length: 255,
        nullable: true,
    }),
    __metadata("design:type", String)
], Venue.prototype, "rehearsalDinnerVenueState", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "REHEARSALDINNERVENUEZIP",
        type: "varchar",
        length: 255,
        nullable: true,
    }),
    __metadata("design:type", String)
], Venue.prototype, "rehearsalDinnerVenueZip", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "REHEARSALDINNERVENUEASINSURED",
        type: "number",
        default: 0,
        nullable: true,
    }),
    __metadata("design:type", Boolean)
], Venue.prototype, "rehearsalDinnerVenueAsInsured", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "REHEARSALDINNERLOCATIONTYPE",
        type: "varchar",
        length: 255,
        nullable: true,
    }),
    __metadata("design:type", String)
], Venue.prototype, "rehearsalDinnerLocationType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "REHEARSALDINNERINDOOROUTDOOR",
        type: "varchar",
        length: 255,
        nullable: true,
    }),
    __metadata("design:type", String)
], Venue.prototype, "rehearsalDinnerIndoorOutdoor", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "EVENTID", unique: true }),
    __metadata("design:type", Number)
], Venue.prototype, "eventId", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => event_entity_1.Event, (event) => event.venue),
    (0, typeorm_1.JoinColumn)({ name: "EVENTID" }),
    __metadata("design:type", event_entity_1.Event)
], Venue.prototype, "event", void 0);
exports.Venue = Venue = __decorate([
    (0, typeorm_1.Entity)("VENUES")
], Venue);
//# sourceMappingURL=venue.entity.js.map