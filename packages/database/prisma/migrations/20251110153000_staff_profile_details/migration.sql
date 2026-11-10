ALTER TABLE "staff_profiles" ADD COLUMN "employment_type" VARCHAR(50);
ALTER TABLE "staff_profiles" ADD COLUMN "joining_date" DATE;
ALTER TABLE "staff_profiles" ADD COLUMN "identity_proof_type" VARCHAR(50);
ALTER TABLE "staff_profiles" ADD COLUMN "identity_proof_number" VARCHAR(80);
ALTER TABLE "staff_profiles" ADD COLUMN "emergency_contact_name" VARCHAR(150);
ALTER TABLE "staff_profiles" ADD COLUMN "emergency_relationship" VARCHAR(50);
ALTER TABLE "staff_profiles" ADD COLUMN "emergency_contact_phone" VARCHAR(20);
ALTER TABLE "staff_profiles" ADD COLUMN "permanent_address" TEXT;
