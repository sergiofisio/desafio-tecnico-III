/*
  Warnings:

  - A unique constraint covering the columns `[idempotencyKey]` on the table `Exam` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Exam_idempotencyKey_key" ON "public"."Exam"("idempotencyKey");
