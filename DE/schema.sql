-- Final PostgreSQL schema reference.
-- The running application creates the equivalent schema through Prisma.

CREATE TYPE "Role" AS ENUM ('ADMIN', 'RESEARCHER');
CREATE TYPE "FundingType" AS ENUM ('ST', 'RD');
CREATE TYPE "Status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED');

CREATE TABLE "User" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'RESEARCHER'
);

CREATE TABLE "Project" (
    "id" TEXT PRIMARY KEY,
    "title" TEXT NOT NULL,
    "projectCode" TEXT NOT NULL UNIQUE,
    "description" TEXT,
    "fundingType" "FundingType" NOT NULL,
    "budget" DOUBLE PRECISION NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "status" "Status" NOT NULL DEFAULT 'PENDING'
);

CREATE TABLE "Report" (
    "id" TEXT PRIMARY KEY,
    "title" TEXT NOT NULL,
    "quarter" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "progress" INTEGER NOT NULL,
    "completedWork" TEXT NOT NULL,
    "remarks" TEXT,
    "status" "Status" NOT NULL DEFAULT 'PENDING',
    "projectId" TEXT NOT NULL REFERENCES "Project"("id"),
    "researcherId" TEXT NOT NULL REFERENCES "User"("id"),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE ("projectId", "quarter", "year")
);

CREATE TABLE "FundReport" (
    "id" TEXT PRIMARY KEY,
    "amountSpent" DOUBLE PRECISION NOT NULL,
    "amountReceived" DOUBLE PRECISION NOT NULL,
    "quarter" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "projectId" TEXT NOT NULL REFERENCES "Project"("id"),
    UNIQUE ("projectId", "quarter", "year")
);

CREATE TABLE "Document" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "projectId" TEXT NOT NULL REFERENCES "Project"("id"),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "_ProjectResearchers" (
    "A" TEXT NOT NULL REFERENCES "Project"("id") ON DELETE CASCADE,
    "B" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    PRIMARY KEY ("A", "B")
);

CREATE INDEX "_ProjectResearchers_B_index" ON "_ProjectResearchers" ("B");
