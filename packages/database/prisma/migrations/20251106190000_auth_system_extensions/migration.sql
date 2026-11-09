-- Auth system extensions: sessions (idle/revoke/MFA), OTP challenges, pending registrations,
-- password reset authorization tokens, MFA recovery, IP throttling.

CREATE TYPE "OtpPurpose" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET');

CREATE TYPE "PendingRegistrationStatus" AS ENUM ('PENDING_VERIFICATION', 'COMPLETED', 'EXPIRED');

ALTER TABLE "users" ADD COLUMN "mfa_enabled" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "users" ADD COLUMN "mfa_secret_enc" TEXT;

ALTER TABLE "sessions" ADD COLUMN "last_activity_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "sessions" ADD COLUMN "revoked_at" TIMESTAMPTZ(6);

ALTER TABLE "sessions" ADD COLUMN "mfa_verified_at" TIMESTAMPTZ(6);

CREATE INDEX "idx_sessions_user_revoked" ON "sessions"("user_id", "revoked_at");

CREATE TABLE "pending_registrations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "phone_number" VARCHAR(20),
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "status" "PendingRegistrationStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "pending_registrations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "pending_registrations_email_key" ON "pending_registrations"("email");

CREATE INDEX "idx_pending_registration_status" ON "pending_registrations"("status");

CREATE TABLE "otp_challenges" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email_normalized" VARCHAR(255) NOT NULL,
    "purpose" "OtpPurpose" NOT NULL,
    "code_hash" VARCHAR(64) NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "consumed_at" TIMESTAMPTZ(6),
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "resend_not_before" TIMESTAMPTZ(6),
    "user_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_challenges_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "idx_otp_email_purpose" ON "otp_challenges"("email_normalized", "purpose", "created_at" DESC);

ALTER TABLE "otp_challenges" ADD CONSTRAINT "otp_challenges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "password_reset_authorizations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "token_hash" VARCHAR(64) NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "consumed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_authorizations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "password_reset_authorizations_token_hash_key" ON "password_reset_authorizations"("token_hash");

CREATE INDEX "idx_pw_reset_auth_user" ON "password_reset_authorizations"("user_id");

ALTER TABLE "password_reset_authorizations" ADD CONSTRAINT "password_reset_authorizations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "mfa_recovery_codes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "code_hash" VARCHAR(64) NOT NULL,
    "used_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mfa_recovery_codes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "uniq_mfa_recovery_user_hash" ON "mfa_recovery_codes"("user_id", "code_hash");

ALTER TABLE "mfa_recovery_codes" ADD CONSTRAINT "mfa_recovery_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "auth_ip_throttles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ip_hash" VARCHAR(64) NOT NULL,
    "window_started_at" TIMESTAMPTZ(6) NOT NULL,
    "failed_count" INTEGER NOT NULL DEFAULT 0,
    "locked_until" TIMESTAMPTZ(6),

    CONSTRAINT "auth_ip_throttles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "auth_ip_throttles_ip_hash_key" ON "auth_ip_throttles"("ip_hash");
