import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatePolicyVersionPolicyId1749539493977 implements MigrationInterface {
    name = 'UpdatePolicyVersionPolicyId1749539493977'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // First, delete any versions with null policyId
        await queryRunner.query(`DELETE FROM "POLICY_VERSIONS" WHERE "POLICYID" IS NULL`);
        
        // Then modify the column to be non-nullable
        await queryRunner.query(`ALTER TABLE "POLICY_VERSIONS" MODIFY "POLICYID" NUMBER NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert the column to be nullable
        await queryRunner.query(`ALTER TABLE "POLICY_VERSIONS" MODIFY "POLICYID" NUMBER`);
    }
} 