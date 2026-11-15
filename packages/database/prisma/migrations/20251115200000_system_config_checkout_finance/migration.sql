-- SystemConfiguration
CREATE TABLE "system_configurations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "config_key" VARCHAR(100) NOT NULL,
    "value_json" TEXT NOT NULL,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "updated_by" UUID,

    CONSTRAINT "system_configurations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "system_configurations_config_key_key" ON "system_configurations"("config_key");

-- CheckOutRequest accountant clearance
ALTER TABLE "check_out_requests" ADD COLUMN "accountant_cleared" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "check_out_requests" ADD COLUMN "accountant_cleared_at" TIMESTAMPTZ(6);
ALTER TABLE "check_out_requests" ADD COLUMN "accountant_cleared_by" UUID;