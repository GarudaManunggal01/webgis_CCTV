/*
  Warnings:

  - Added the required column `slug` to the `CCTV` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CCTV" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "streamUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'online',
    "thumbnail" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_CCTV" ("createdAt", "id", "latitude", "longitude", "name", "status", "streamUrl", "updatedAt") SELECT "createdAt", "id", "latitude", "longitude", "name", "status", "streamUrl", "updatedAt" FROM "CCTV";
DROP TABLE "CCTV";
ALTER TABLE "new_CCTV" RENAME TO "CCTV";
CREATE UNIQUE INDEX "CCTV_slug_key" ON "CCTV"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
