-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "deleted_at" DATETIME,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "last_signed_in" DATETIME,
    "cookie_consent" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_User" ("created_at", "deleted_at", "email", "id", "last_signed_in", "password", "updated_at") SELECT "created_at", "deleted_at", "email", "id", "last_signed_in", "password", "updated_at" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_deleted_at_idx" ON "User"("deleted_at");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
