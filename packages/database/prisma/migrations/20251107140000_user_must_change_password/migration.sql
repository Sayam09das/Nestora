-- FR-008: force password change after administrative default / temporary passwords.
ALTER TABLE "users" ADD COLUMN "must_change_password" BOOLEAN NOT NULL DEFAULT false;
