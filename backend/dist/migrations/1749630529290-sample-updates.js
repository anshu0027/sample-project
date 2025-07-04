"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SampleUpdates1749630529290 = void 0;
class SampleUpdates1749630529290 {
    constructor() {
        this.name = 'SampleUpdates1749630529290';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "POLICY_HOLDERS" DROP CONSTRAINT "FK_POLICY_HOLDERS_QUOTE"`);
        await queryRunner.query(`ALTER TABLE "POLICY_HOLDERS" DROP CONSTRAINT "FK_POLICY_HOLDERS_POLICY"`);
        await queryRunner.query(`ALTER TABLE "PAYMENTS" DROP CONSTRAINT "FK_PAYMENTS_QUOTE"`);
        await queryRunner.query(`ALTER TABLE "PAYMENTS" DROP CONSTRAINT "FK_PAYMENTS_POLICY"`);
        await queryRunner.query(`ALTER TABLE "POLICY_VERSIONS" DROP CONSTRAINT "FK_POLICY_VERSIONS_POLICY"`);
        await queryRunner.query(`ALTER TABLE "POLICIES" DROP CONSTRAINT "FK_POLICIES_QUOTE"`);
        await queryRunner.query(`ALTER TABLE "VENUES" DROP CONSTRAINT "FK_VENUES_EVENT"`);
        await queryRunner.query(`ALTER TABLE "EVENTS" DROP CONSTRAINT "FK_EVENTS_QUOTE"`);
        await queryRunner.query(`ALTER TABLE "EVENTS" DROP CONSTRAINT "FK_EVENTS_POLICY"`);
        await queryRunner.query(`ALTER TABLE "QUOTES" DROP CONSTRAINT "FK_QUOTES_USER"`);
        await queryRunner.query(`DROP INDEX "IDX_PAYMENTS_QUOTE"`);
        await queryRunner.query(`DROP INDEX "IDX_PAYMENTS_STATUS"`);
        await queryRunner.query(`DROP INDEX "IDX_POLICY_VERSIONS_POLICY"`);
        await queryRunner.query(`DROP INDEX "IDX_QUOTES_USER"`);
        await queryRunner.query(`DROP INDEX "IDX_QUOTES_SOURCE"`);
        await queryRunner.query(`DROP INDEX "IDX_QUOTES_STATUS"`);
        await queryRunner.query(`DROP INDEX "IDX_QUOTES_CONVERTED"`);
        await queryRunner.query(`ALTER TABLE "POLICY_HOLDERS" ADD CONSTRAINT "PK_fbaecd96bf302c3e8a3becb2826" PRIMARY KEY ("ID")`);
        await queryRunner.query(`ALTER TABLE "POLICY_HOLDERS" MODIFY "LEGALNOTICES" number  `);
        await queryRunner.query(`ALTER TABLE "POLICY_HOLDERS" ADD CONSTRAINT "UQ_e7ffc88a440f5c2c47139f2cdfe" UNIQUE ("QUOTEID")`);
        await queryRunner.query(`ALTER TABLE "POLICY_HOLDERS" ADD CONSTRAINT "UQ_05a026357dfd1ad19e85b6c2ade" UNIQUE ("POLICYID")`);
        await queryRunner.query(`ALTER TABLE "PAYMENTS" ADD CONSTRAINT "PK_b5d360b420bd6fd02b57756f9f0" PRIMARY KEY ("ID")`);
        await queryRunner.query(`ALTER TABLE "PAYMENTS" DROP COLUMN "AMOUNT"`);
        await queryRunner.query(`ALTER TABLE "PAYMENTS" ADD "AMOUNT" number(10,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "PAYMENTS" DROP COLUMN "STATUS"`);
        await queryRunner.query(`ALTER TABLE "PAYMENTS" ADD "STATUS" varchar2(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "PAYMENTS" DROP COLUMN "METHOD"`);
        await queryRunner.query(`ALTER TABLE "PAYMENTS" ADD "METHOD" varchar2(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "PAYMENTS" DROP COLUMN "REFERENCE"`);
        await queryRunner.query(`ALTER TABLE "PAYMENTS" ADD "REFERENCE" varchar2(100)`);
        await queryRunner.query(`ALTER TABLE "PAYMENTS" MODIFY "CREATEDAT" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "PAYMENTS" MODIFY "UPDATEDAT" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "PAYMENTS" MODIFY "QUOTEID" number  NULL`);
        await queryRunner.query(`ALTER TABLE "POLICY_VERSIONS" ADD CONSTRAINT "PK_c6dd5407e08a0169702f679fe12" PRIMARY KEY ("ID")`);
        await queryRunner.query(`ALTER TABLE "POLICY_VERSIONS" MODIFY "DATA" clob  NOT NULL`);
        await queryRunner.query(`ALTER TABLE "POLICY_VERSIONS" MODIFY "CREATEDAT" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "POLICIES" ADD CONSTRAINT "PK_9be8c3627aa6e908bab124a28c2" PRIMARY KEY ("ID")`);
        await queryRunner.query(`ALTER TABLE "POLICIES" ADD CONSTRAINT "UQ_e23fbcaec8094fb47f9da6ebae4" UNIQUE ("POLICYNUMBER")`);
        await queryRunner.query(`ALTER TABLE "POLICIES" MODIFY "EMAILSENT" number DEFAULT 0 NOT NULL`);
        await queryRunner.query(`ALTER TABLE "POLICIES" MODIFY "CREATEDAT" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "POLICIES" MODIFY "UPDATEDAT" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "POLICIES" ADD CONSTRAINT "UQ_9d021ee9bbd19dafd3298266203" UNIQUE ("QUOTEID")`);
        await queryRunner.query(`ALTER TABLE "VENUES" ADD CONSTRAINT "PK_5bcfb6ea2758ca5b7b40e7c12a3" PRIMARY KEY ("ID")`);
        await queryRunner.query(`ALTER TABLE "VENUES" MODIFY "VENUEASINSURED" number DEFAULT 0 NOT NULL`);
        await queryRunner.query(`ALTER TABLE "VENUES" MODIFY "RECEPTIONVENUEASINSURED" number DEFAULT 0 `);
        await queryRunner.query(`ALTER TABLE "VENUES" MODIFY "BRUNCHVENUEASINSURED" number DEFAULT 0 `);
        await queryRunner.query(`ALTER TABLE "VENUES" MODIFY "REHEARSALVENUEASINSURED" number DEFAULT 0 `);
        await queryRunner.query(`ALTER TABLE "VENUES" MODIFY "REHEARSALDINNERVENUEASINSURED" number DEFAULT 0 `);
        await queryRunner.query(`ALTER TABLE "VENUES" MODIFY "EVENTID" number  NOT NULL`);
        await queryRunner.query(`ALTER TABLE "VENUES" ADD CONSTRAINT "UQ_c9f0173d38c81e364af1b3a40c5" UNIQUE ("EVENTID")`);
        await queryRunner.query(`ALTER TABLE "EVENTS" ADD CONSTRAINT "PK_d8e14739d287dae126e85d1ea7e" PRIMARY KEY ("ID")`);
        await queryRunner.query(`ALTER TABLE "EVENTS" ADD CONSTRAINT "UQ_9b114936dba06a587275f5e38d7" UNIQUE ("QUOTEID")`);
        await queryRunner.query(`ALTER TABLE "EVENTS" ADD CONSTRAINT "UQ_040b689ff8be0d2ad4c1141c734" UNIQUE ("POLICYID")`);
        await queryRunner.query(`ALTER TABLE "QUOTES" ADD CONSTRAINT "PK_449999110f46ac7ef53f55aeb40" PRIMARY KEY ("ID")`);
        await queryRunner.query(`ALTER TABLE "QUOTES" ADD CONSTRAINT "UQ_e78ceff3ff586779bf0d2ade13b" UNIQUE ("QUOTENUMBER")`);
        await queryRunner.query(`ALTER TABLE "QUOTES" MODIFY "LIQUORLIABILITY" number DEFAULT 0 `);
        await queryRunner.query(`ALTER TABLE "QUOTES" MODIFY "COVIDDISCLOSURE" number  `);
        await queryRunner.query(`ALTER TABLE "QUOTES" MODIFY "SPECIALACTIVITIES" number  `);
        await queryRunner.query(`ALTER TABLE "QUOTES" MODIFY "STATUS" varchar2(20) DEFAULT 'STEP1' NOT NULL`);
        await queryRunner.query(`ALTER TABLE "QUOTES" MODIFY "SOURCE" varchar2(20) DEFAULT 'CUSTOMER' NOT NULL`);
        await queryRunner.query(`ALTER TABLE "QUOTES" MODIFY "ISCUSTOMERGENERATED" number DEFAULT 0 NOT NULL`);
        await queryRunner.query(`ALTER TABLE "QUOTES" MODIFY "CONVERTEDTOPOLICY" number DEFAULT 0 NOT NULL`);
        await queryRunner.query(`ALTER TABLE "QUOTES" MODIFY "EMAILSENT" number DEFAULT 0 NOT NULL`);
        await queryRunner.query(`ALTER TABLE "QUOTES" MODIFY "CREATEDAT" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "QUOTES" MODIFY "UPDATEDAT" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "USERS" ADD CONSTRAINT "PK_475d4b511309ada89807bc2d40b" PRIMARY KEY ("ID")`);
        await queryRunner.query(`ALTER TABLE "USERS" ADD CONSTRAINT "UQ_03c5c0bfa50dcdf69c204bdebf2" UNIQUE ("EMAIL")`);
        await queryRunner.query(`ALTER TABLE "USERS" MODIFY "CREATEDAT" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_1f320f8d133bb03b623112ce7f" ON "PAYMENTS" ("QUOTEID")`);
        await queryRunner.query(`CREATE INDEX "IDX_b677ba7a1af2263463482ea24f" ON "PAYMENTS" ("STATUS")`);
        await queryRunner.query(`CREATE INDEX "IDX_65475608c206666bdcc06680f4" ON "POLICY_VERSIONS" ("POLICYID")`);
        await queryRunner.query(`CREATE INDEX "IDX_466e5eb0a7e5cc94fd5b8bbed7" ON "QUOTES" ("CONVERTEDTOPOLICY")`);
        await queryRunner.query(`CREATE INDEX "IDX_ef36408f453e82b4a100dc41e9" ON "QUOTES" ("SOURCE")`);
        await queryRunner.query(`CREATE INDEX "IDX_f10c17474c3674ab995de8a205" ON "QUOTES" ("STATUS")`);
        await queryRunner.query(`CREATE INDEX "IDX_51dbdf1ab84693a0624f6d9cda" ON "QUOTES" ("USERID")`);
        await queryRunner.query(`CREATE INDEX "IDX_03c5c0bfa50dcdf69c204bdebf" ON "USERS" ("EMAIL")`);
        await queryRunner.query(`ALTER TABLE "POLICY_HOLDERS" ADD CONSTRAINT "FK_e7ffc88a440f5c2c47139f2cdfe" FOREIGN KEY ("QUOTEID") REFERENCES "QUOTES" ("ID")`);
        await queryRunner.query(`ALTER TABLE "POLICY_HOLDERS" ADD CONSTRAINT "FK_05a026357dfd1ad19e85b6c2ade" FOREIGN KEY ("POLICYID") REFERENCES "POLICIES" ("ID")`);
        await queryRunner.query(`ALTER TABLE "PAYMENTS" ADD CONSTRAINT "FK_1f320f8d133bb03b623112ce7fb" FOREIGN KEY ("QUOTEID") REFERENCES "QUOTES" ("ID")`);
        await queryRunner.query(`ALTER TABLE "PAYMENTS" ADD CONSTRAINT "FK_7f9c0ae40c278c85e73a6687495" FOREIGN KEY ("POLICYID") REFERENCES "POLICIES" ("ID")`);
        await queryRunner.query(`ALTER TABLE "POLICY_VERSIONS" ADD CONSTRAINT "FK_65475608c206666bdcc06680f46" FOREIGN KEY ("POLICYID") REFERENCES "POLICIES" ("ID") ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE "POLICIES" ADD CONSTRAINT "FK_9d021ee9bbd19dafd3298266203" FOREIGN KEY ("QUOTEID") REFERENCES "QUOTES" ("ID")`);
        await queryRunner.query(`ALTER TABLE "VENUES" ADD CONSTRAINT "FK_c9f0173d38c81e364af1b3a40c5" FOREIGN KEY ("EVENTID") REFERENCES "EVENTS" ("ID")`);
        await queryRunner.query(`ALTER TABLE "EVENTS" ADD CONSTRAINT "FK_9b114936dba06a587275f5e38d7" FOREIGN KEY ("QUOTEID") REFERENCES "QUOTES" ("ID")`);
        await queryRunner.query(`ALTER TABLE "EVENTS" ADD CONSTRAINT "FK_040b689ff8be0d2ad4c1141c734" FOREIGN KEY ("POLICYID") REFERENCES "POLICIES" ("ID")`);
        await queryRunner.query(`ALTER TABLE "QUOTES" ADD CONSTRAINT "FK_51dbdf1ab84693a0624f6d9cdaf" FOREIGN KEY ("USERID") REFERENCES "USERS" ("ID")`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "QUOTES" DROP CONSTRAINT "FK_51dbdf1ab84693a0624f6d9cdaf"`);
        await queryRunner.query(`ALTER TABLE "EVENTS" DROP CONSTRAINT "FK_040b689ff8be0d2ad4c1141c734"`);
        await queryRunner.query(`ALTER TABLE "EVENTS" DROP CONSTRAINT "FK_9b114936dba06a587275f5e38d7"`);
        await queryRunner.query(`ALTER TABLE "VENUES" DROP CONSTRAINT "FK_c9f0173d38c81e364af1b3a40c5"`);
        await queryRunner.query(`ALTER TABLE "POLICIES" DROP CONSTRAINT "FK_9d021ee9bbd19dafd3298266203"`);
        await queryRunner.query(`ALTER TABLE "POLICY_VERSIONS" DROP CONSTRAINT "FK_65475608c206666bdcc06680f46"`);
        await queryRunner.query(`ALTER TABLE "PAYMENTS" DROP CONSTRAINT "FK_7f9c0ae40c278c85e73a6687495"`);
        await queryRunner.query(`ALTER TABLE "PAYMENTS" DROP CONSTRAINT "FK_1f320f8d133bb03b623112ce7fb"`);
        await queryRunner.query(`ALTER TABLE "POLICY_HOLDERS" DROP CONSTRAINT "FK_05a026357dfd1ad19e85b6c2ade"`);
        await queryRunner.query(`ALTER TABLE "POLICY_HOLDERS" DROP CONSTRAINT "FK_e7ffc88a440f5c2c47139f2cdfe"`);
        await queryRunner.query(`DROP INDEX "IDX_03c5c0bfa50dcdf69c204bdebf"`);
        await queryRunner.query(`DROP INDEX "IDX_51dbdf1ab84693a0624f6d9cda"`);
        await queryRunner.query(`DROP INDEX "IDX_f10c17474c3674ab995de8a205"`);
        await queryRunner.query(`DROP INDEX "IDX_ef36408f453e82b4a100dc41e9"`);
        await queryRunner.query(`DROP INDEX "IDX_466e5eb0a7e5cc94fd5b8bbed7"`);
        await queryRunner.query(`DROP INDEX "IDX_65475608c206666bdcc06680f4"`);
        await queryRunner.query(`DROP INDEX "IDX_b677ba7a1af2263463482ea24f"`);
        await queryRunner.query(`DROP INDEX "IDX_1f320f8d133bb03b623112ce7f"`);
        await queryRunner.query(`ALTER TABLE "USERS" MODIFY "CREATEDAT" timestamp DEFAULT CURRENT_TIMESTAMP NULL`);
        await queryRunner.query(`ALTER TABLE "USERS" DROP CONSTRAINT "UQ_03c5c0bfa50dcdf69c204bdebf2"`);
        await queryRunner.query(`ALTER TABLE "USERS" DROP CONSTRAINT "PK_475d4b511309ada89807bc2d40b"`);
        await queryRunner.query(`ALTER TABLE "QUOTES" MODIFY "UPDATEDAT" timestamp DEFAULT CURRENT_TIMESTAMP NULL`);
        await queryRunner.query(`ALTER TABLE "QUOTES" MODIFY "CREATEDAT" timestamp DEFAULT CURRENT_TIMESTAMP NULL`);
        await queryRunner.query(`ALTER TABLE "QUOTES" MODIFY "EMAILSENT" number(1,0) DEFAULT 0 NULL`);
        await queryRunner.query(`ALTER TABLE "QUOTES" MODIFY "CONVERTEDTOPOLICY" number(1,0) DEFAULT 0 NULL`);
        await queryRunner.query(`ALTER TABLE "QUOTES" MODIFY "ISCUSTOMERGENERATED" number(1,0) DEFAULT 0 NULL`);
        await queryRunner.query(`ALTER TABLE "QUOTES" MODIFY "SOURCE" varchar2(20) DEFAULT 'CUSTOMER' NULL`);
        await queryRunner.query(`ALTER TABLE "QUOTES" MODIFY "STATUS" varchar2(20) DEFAULT 'STEP1' NULL`);
        await queryRunner.query(`ALTER TABLE "QUOTES" MODIFY "SPECIALACTIVITIES" number(1,0)  `);
        await queryRunner.query(`ALTER TABLE "QUOTES" MODIFY "COVIDDISCLOSURE" number(1,0)  `);
        await queryRunner.query(`ALTER TABLE "QUOTES" MODIFY "LIQUORLIABILITY" number(1,0) DEFAULT 0 `);
        await queryRunner.query(`ALTER TABLE "QUOTES" DROP CONSTRAINT "UQ_e78ceff3ff586779bf0d2ade13b"`);
        await queryRunner.query(`ALTER TABLE "QUOTES" DROP CONSTRAINT "PK_449999110f46ac7ef53f55aeb40"`);
        await queryRunner.query(`ALTER TABLE "EVENTS" DROP CONSTRAINT "UQ_040b689ff8be0d2ad4c1141c734"`);
        await queryRunner.query(`ALTER TABLE "EVENTS" DROP CONSTRAINT "UQ_9b114936dba06a587275f5e38d7"`);
        await queryRunner.query(`ALTER TABLE "EVENTS" DROP CONSTRAINT "PK_d8e14739d287dae126e85d1ea7e"`);
        await queryRunner.query(`ALTER TABLE "VENUES" DROP CONSTRAINT "UQ_c9f0173d38c81e364af1b3a40c5"`);
        await queryRunner.query(`ALTER TABLE "VENUES" MODIFY "EVENTID" number  NULL`);
        await queryRunner.query(`ALTER TABLE "VENUES" MODIFY "REHEARSALDINNERVENUEASINSURED" number(1,0) DEFAULT 0 `);
        await queryRunner.query(`ALTER TABLE "VENUES" MODIFY "REHEARSALVENUEASINSURED" number(1,0) DEFAULT 0 `);
        await queryRunner.query(`ALTER TABLE "VENUES" MODIFY "BRUNCHVENUEASINSURED" number(1,0) DEFAULT 0 `);
        await queryRunner.query(`ALTER TABLE "VENUES" MODIFY "RECEPTIONVENUEASINSURED" number(1,0) DEFAULT 0 `);
        await queryRunner.query(`ALTER TABLE "VENUES" MODIFY "VENUEASINSURED" number(1,0) DEFAULT 0 NULL`);
        await queryRunner.query(`ALTER TABLE "VENUES" DROP CONSTRAINT "PK_5bcfb6ea2758ca5b7b40e7c12a3"`);
        await queryRunner.query(`ALTER TABLE "POLICIES" DROP CONSTRAINT "UQ_9d021ee9bbd19dafd3298266203"`);
        await queryRunner.query(`ALTER TABLE "POLICIES" MODIFY "UPDATEDAT" timestamp DEFAULT CURRENT_TIMESTAMP NULL`);
        await queryRunner.query(`ALTER TABLE "POLICIES" MODIFY "CREATEDAT" timestamp DEFAULT CURRENT_TIMESTAMP NULL`);
        await queryRunner.query(`ALTER TABLE "POLICIES" MODIFY "EMAILSENT" number(1,0) DEFAULT 0 NULL`);
        await queryRunner.query(`ALTER TABLE "POLICIES" DROP CONSTRAINT "UQ_e23fbcaec8094fb47f9da6ebae4"`);
        await queryRunner.query(`ALTER TABLE "POLICIES" DROP CONSTRAINT "PK_9be8c3627aa6e908bab124a28c2"`);
        await queryRunner.query(`ALTER TABLE "POLICY_VERSIONS" MODIFY "CREATEDAT" timestamp DEFAULT CURRENT_TIMESTAMP NULL`);
        await queryRunner.query(`ALTER TABLE "POLICY_VERSIONS" MODIFY "DATA" clob  NULL`);
        await queryRunner.query(`ALTER TABLE "POLICY_VERSIONS" DROP CONSTRAINT "PK_c6dd5407e08a0169702f679fe12"`);
        await queryRunner.query(`ALTER TABLE "PAYMENTS" MODIFY "QUOTEID" number  NOT NULL`);
        await queryRunner.query(`ALTER TABLE "PAYMENTS" MODIFY "UPDATEDAT" timestamp DEFAULT CURRENT_TIMESTAMP NULL`);
        await queryRunner.query(`ALTER TABLE "PAYMENTS" MODIFY "CREATEDAT" timestamp DEFAULT CURRENT_TIMESTAMP NULL`);
        await queryRunner.query(`ALTER TABLE "PAYMENTS" DROP COLUMN "REFERENCE"`);
        await queryRunner.query(`ALTER TABLE "PAYMENTS" ADD "REFERENCE" varchar2(255)`);
        await queryRunner.query(`ALTER TABLE "PAYMENTS" DROP COLUMN "METHOD"`);
        await queryRunner.query(`ALTER TABLE "PAYMENTS" ADD "METHOD" varchar2(255)`);
        await queryRunner.query(`ALTER TABLE "PAYMENTS" DROP COLUMN "STATUS"`);
        await queryRunner.query(`ALTER TABLE "PAYMENTS" ADD "STATUS" varchar2(20) DEFAULT 'PENDING'`);
        await queryRunner.query(`ALTER TABLE "PAYMENTS" DROP COLUMN "AMOUNT"`);
        await queryRunner.query(`ALTER TABLE "PAYMENTS" ADD "AMOUNT" float(126) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "PAYMENTS" DROP CONSTRAINT "PK_b5d360b420bd6fd02b57756f9f0"`);
        await queryRunner.query(`ALTER TABLE "POLICY_HOLDERS" DROP CONSTRAINT "UQ_05a026357dfd1ad19e85b6c2ade"`);
        await queryRunner.query(`ALTER TABLE "POLICY_HOLDERS" DROP CONSTRAINT "UQ_e7ffc88a440f5c2c47139f2cdfe"`);
        await queryRunner.query(`ALTER TABLE "POLICY_HOLDERS" MODIFY "LEGALNOTICES" number(1,0)  `);
        await queryRunner.query(`ALTER TABLE "POLICY_HOLDERS" DROP CONSTRAINT "PK_fbaecd96bf302c3e8a3becb2826"`);
        await queryRunner.query(`CREATE INDEX "IDX_QUOTES_CONVERTED" ON "QUOTES" ("CONVERTEDTOPOLICY")`);
        await queryRunner.query(`CREATE INDEX "IDX_QUOTES_STATUS" ON "QUOTES" ("STATUS")`);
        await queryRunner.query(`CREATE INDEX "IDX_QUOTES_SOURCE" ON "QUOTES" ("SOURCE")`);
        await queryRunner.query(`CREATE INDEX "IDX_QUOTES_USER" ON "QUOTES" ("USERID")`);
        await queryRunner.query(`CREATE INDEX "IDX_POLICY_VERSIONS_POLICY" ON "POLICY_VERSIONS" ("POLICYID")`);
        await queryRunner.query(`CREATE INDEX "IDX_PAYMENTS_STATUS" ON "PAYMENTS" ("STATUS")`);
        await queryRunner.query(`CREATE INDEX "IDX_PAYMENTS_QUOTE" ON "PAYMENTS" ("QUOTEID")`);
        await queryRunner.query(`ALTER TABLE "QUOTES" ADD CONSTRAINT "FK_QUOTES_USER" FOREIGN KEY ("USERID") REFERENCES "USERS" ("ID")`);
        await queryRunner.query(`ALTER TABLE "EVENTS" ADD CONSTRAINT "FK_EVENTS_POLICY" FOREIGN KEY ("POLICYID") REFERENCES "POLICIES" ("ID")`);
        await queryRunner.query(`ALTER TABLE "EVENTS" ADD CONSTRAINT "FK_EVENTS_QUOTE" FOREIGN KEY ("QUOTEID") REFERENCES "QUOTES" ("ID")`);
        await queryRunner.query(`ALTER TABLE "VENUES" ADD CONSTRAINT "FK_VENUES_EVENT" FOREIGN KEY ("EVENTID") REFERENCES "EVENTS" ("ID")`);
        await queryRunner.query(`ALTER TABLE "POLICIES" ADD CONSTRAINT "FK_POLICIES_QUOTE" FOREIGN KEY ("QUOTEID") REFERENCES "QUOTES" ("ID")`);
        await queryRunner.query(`ALTER TABLE "POLICY_VERSIONS" ADD CONSTRAINT "FK_POLICY_VERSIONS_POLICY" FOREIGN KEY ("POLICYID") REFERENCES "POLICIES" ("ID")`);
        await queryRunner.query(`ALTER TABLE "PAYMENTS" ADD CONSTRAINT "FK_PAYMENTS_POLICY" FOREIGN KEY ("POLICYID") REFERENCES "POLICIES" ("ID")`);
        await queryRunner.query(`ALTER TABLE "PAYMENTS" ADD CONSTRAINT "FK_PAYMENTS_QUOTE" FOREIGN KEY ("QUOTEID") REFERENCES "QUOTES" ("ID")`);
        await queryRunner.query(`ALTER TABLE "POLICY_HOLDERS" ADD CONSTRAINT "FK_POLICY_HOLDERS_POLICY" FOREIGN KEY ("POLICYID") REFERENCES "POLICIES" ("ID")`);
        await queryRunner.query(`ALTER TABLE "POLICY_HOLDERS" ADD CONSTRAINT "FK_POLICY_HOLDERS_QUOTE" FOREIGN KEY ("QUOTEID") REFERENCES "QUOTES" ("ID")`);
    }
}
exports.SampleUpdates1749630529290 = SampleUpdates1749630529290;
//# sourceMappingURL=1749630529290-sample-updates.js.map