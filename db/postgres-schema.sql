CREATE TABLE IF NOT EXISTS articles (
  slug TEXT PRIMARY KEY,
  draft_json TEXT NOT NULL,
  published_json TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  revision INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL,
  updated_by TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS article_revisions (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL,
  snapshot_json TEXT NOT NULL,
  action TEXT NOT NULL,
  revision INTEGER NOT NULL,
  saved_at TEXT NOT NULL,
  saved_by TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_article_revisions_slug_saved_at ON article_revisions(slug, saved_at);

CREATE TABLE IF NOT EXISTS members (
  user_id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  joined_at TEXT NOT NULL,
  accepted_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS administrators (
  slot TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  bound_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS site_metrics (
  day TEXT NOT NULL,
  kind TEXT NOT NULL,
  path TEXT NOT NULL,
  source TEXT NOT NULL,
  label TEXT NOT NULL,
  bucket TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, kind, path, source, label, bucket)
);

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
