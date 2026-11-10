/*
  Warnings:

  - The `position` column on the `Player` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "PlayerPosition" AS ENUM ('GOALKEEPER', 'DEFENDER', 'FULLBACK', 'MIDFIELDER', 'FORWARD');

-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "isPaid" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "position",
ADD COLUMN     "position" "PlayerPosition";
