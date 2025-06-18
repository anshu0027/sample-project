"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePolicyVersionPolicyId1749539493977 = void 0;
class UpdatePolicyVersionPolicyId1749539493977 {
    constructor() {
        this.name = 'UpdatePolicyVersionPolicyId1749539493977';
    }
    async up(queryRunner) {
        // First, delete any versions with null policyId
        await queryRunner.query(`DELETE FROM "POLICY_VERSIONS" WHERE "POLICYID" IS NULL`);
        // Then modify the column to be non-nullable
        await queryRunner.query(`ALTER TABLE "POLICY_VERSIONS" MODIFY "POLICYID" NUMBER NOT NULL`);
    }
    async down(queryRunner) {
        // Revert the column to be nullable
        await queryRunner.query(`ALTER TABLE "POLICY_VERSIONS" MODIFY "POLICYID" NUMBER`);
    }
}
exports.UpdatePolicyVersionPolicyId1749539493977 = UpdatePolicyVersionPolicyId1749539493977;
