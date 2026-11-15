-- CreateTable
CREATE TABLE "check_out_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "student_id" UUID NOT NULL,
    "allocation_id" UUID NOT NULL,
    "planned_date" DATE NOT NULL,
    "reason" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_by" UUID,
    "reviewed_at" TIMESTAMPTZ(6),
    "review_remarks" TEXT,

    CONSTRAINT "check_out_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_checkout_requests_status" ON "check_out_requests"("status", "planned_date");

-- AddForeignKey
ALTER TABLE "check_out_requests" ADD CONSTRAINT "check_out_requests_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "check_out_requests" ADD CONSTRAINT "check_out_requests_allocation_id_fkey" FOREIGN KEY ("allocation_id") REFERENCES "allocation_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;