-- Staff personnel number + document vault (Neon private bucket keys)
ALTER TABLE "staff_profiles" ADD COLUMN "employee_number" VARCHAR(50);

CREATE UNIQUE INDEX "staff_profiles_employee_number_key" ON "staff_profiles"("employee_number");

CREATE TABLE "staff_documents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "staff_profile_id" UUID NOT NULL,
    "document_kind" VARCHAR(50) NOT NULL,
    "object_key" VARCHAR(500) NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "file_size" INTEGER NOT NULL,
    "uploaded_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "staff_documents_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "staff_documents_object_key_key" ON "staff_documents"("object_key");
CREATE INDEX "idx_staff_documents_staff_profile" ON "staff_documents"("staff_profile_id");

ALTER TABLE "staff_documents" ADD CONSTRAINT "staff_documents_staff_profile_id_fkey" FOREIGN KEY ("staff_profile_id") REFERENCES "staff_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
