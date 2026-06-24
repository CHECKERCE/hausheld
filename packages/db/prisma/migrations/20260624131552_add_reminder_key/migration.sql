/*
  Warnings:

  - A unique constraint covering the columns `[key]` on the table `Reminder` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Reminder" ADD COLUMN     "key" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Reminder_key_key" ON "Reminder"("key");
