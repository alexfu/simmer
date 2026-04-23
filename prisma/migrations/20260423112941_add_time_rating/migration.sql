-- CreateEnum
CREATE TYPE "TimeRating" AS ENUM ('quick', 'medium', 'involved');

-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN     "timeRating" "TimeRating";
