-- Settings table for user preferences and app configuration
CREATE TABLE IF NOT EXISTS "settings" (
	"id" INTEGER PRIMARY KEY,
	"userId" INTEGER,
	"key" TEXT NOT NULL,
	"value" TEXT,
	"createdAt" INTEGER DEFAULT (strftime('%s','now') || substr(strftime('%f','now'),4)),
	"updatedAt" INTEGER DEFAULT (strftime('%s','now') || substr(strftime('%f','now'),4)),
	FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE,
	UNIQUE("userId", "key")
);

-- Add default settings for existing users
INSERT OR IGNORE INTO "settings" ("userId", "key", "value")
SELECT id, 'theme', 'auto' FROM users;

INSERT OR IGNORE INTO "settings" ("userId", "key", "value") 
SELECT id, 'notifications', 'true' FROM users;

INSERT OR IGNORE INTO "settings" ("userId", "key", "value")
SELECT id, 'autoSave', 'true' FROM users;

INSERT OR IGNORE INTO "settings" ("userId", "key", "value")
SELECT id, 'fontSize', 'medium' FROM users;

INSERT OR IGNORE INTO "settings" ("userId", "key", "value")
SELECT id, 'editorMode', 'wysiwyg' FROM users;

INSERT OR IGNORE INTO "settings" ("userId", "key", "value")
SELECT id, 'exportFormat', 'markdown' FROM users;

-- Add settings-related columns to users table
ALTER TABLE users ADD COLUMN "settingsVersion" INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN "lastSettingsUpdate" INTEGER DEFAULT (strftime('%s','now') || substr(strftime('%f','now'),4));