-- AlterTable
ALTER TABLE "staff_attendances" ADD COLUMN "checked_in_at" TIMESTAMPTZ(6),
ADD COLUMN "checked_out_at" TIMESTAMPTZ(6);