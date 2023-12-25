/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "GameType" AS ENUM ('WORDGAME', 'COUNTING');

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Channel" (
    "id" TEXT NOT NULL,
    "player" TEXT NOT NULL,
    "letter" TEXT NOT NULL,
    "limit" INTEGER NOT NULL,
    "type" "GameType" NOT NULL,
    "words" TEXT[],

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("id")
);
