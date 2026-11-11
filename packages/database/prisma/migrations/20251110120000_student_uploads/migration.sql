-- Student profile photos (public object storage key on user) and registration documents (private).

ALTER TABLE "users" ADD COLUMN "profile_photo_key" VARCHAR(500);

CREATE TABLE "student_documents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "student_id" UUID NOT NULL,
    "object_key" VARCHAR(500) NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "file_size" INTEGER NOT NULL,
    "uploaded_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_documents_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "student_documents_object_key_key" ON "student_documents"("object_key");
CREATE INDEX "idx_student_documents_student" ON "student_documents"("student_id");

ALTER TABLE "student_documents" ADD CONSTRAINT "student_documents_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
