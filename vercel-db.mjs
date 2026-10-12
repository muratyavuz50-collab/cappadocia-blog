let activeUrl = "";
let activeClient;
let activeSchema;

const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS articles (slug TEXT PRIMARY KEY, draft_json TEXT NOT NULL, published_json TEXT, status TEXT NOT NULL DEFAULT 'draft', revision INTEGER NOT NULL DEFAULT 1, updated_at TEXT NOT NULL, updated_by TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS article_revisions (id TEXT PRIMARY KEY, slug TEXT NOT NULL, snapshot_json TEXT NOT NULL, action TEXT NOT NULL, revision INTEGER NOT NULL, saved_at TEXT NOT NULL, saved_by TEXT NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS idx_article_revisions_slug_saved_at ON article_revisions(slug, saved_at)`,
  `CREATE TABLE IF NOT EXISTS members (user_id TEXT PRIMARY KEY, email TEXT NOT NULL, name TEXT NOT NULL, joined_at TEXT NOT NULL, accepted_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS administrators (slot TEXT PRIMARY KEY, user_id TEXT NOT NULL, bound_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS site_metrics (day TEXT NOT NULL, kind TEXT NOT NULL, path TEXT NOT NULL, source TEXT NOT NULL, label TEXT NOT NULL, bucket TEXT NOT NULL, count INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (day, kind, path, source, label, bucket))`,
  `CREATE TABLE IF NOT EXISTS site_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)`,
];

async function client(env) {
  const url = env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured.");
  if (url !== activeUrl) {
    activeUrl = url;
    const { neon } = await import("@neondatabase/serverless");
    activeClient = neon(url);
    activeSchema = Promise.all(schemaStatements.map((statement) => activeClient.query(statement)));
  }
  await activeSchema;
  return activeClient;
}

function sqlForPostgres(sql) {
  let index = 0;
  let text = sql.replace(/\?/g, () => `$${++index}`);
  text = text.replace(/^\s*INSERT\s+OR\s+IGNORE\s+INTO/i, "INSERT INTO");
  if (/^\s*INSERT\s+INTO/i.test(sql) && /INSERT\s+OR\s+IGNORE/i.test(sql)) {
    text += " ON CONFLICT DO NOTHING";
  }
  return text;
}

class Statement {
  constructor(env, text, params = []) { this.env = env; this.text = text; this.params = params; }
  bind(...params) { this.params = params; return this; }
  async result() {
    if (!this.env.DATABASE_URL) {
      if (/^\s*SELECT\b/i.test(this.text) || /\bINSERT\s+INTO\s+site_metrics\b/i.test(this.text)) {
        return { rows: [], rowCount: 0 };
      }
      throw new Error("DATABASE_URL is required for CMS writes.");
    }
    return (await client(this.env)).query(sqlForPostgres(this.text), this.params, { fullResults: true });
  }
  async first() { return (await this.result()).rows[0] || null; }
  async all() { return { results: (await this.result()).rows }; }
  async run() {
    const result = await this.result();
    return { meta: { changes: result.rowCount || 0 } };
  }
}

function isRevisionInsert(text) {
  return /INSERT\s+INTO\s+article_revisions\s*\([^)]*\)\s+SELECT\s+[\s\S]*WHERE\s+changes\(\)\s*=\s*1/i.test(text);
}

function revisionInsertWithValues(text) {
  return text.replace(
    /(INSERT\s+INTO\s+article_revisions\s*\([^)]*\))\s+SELECT\s+([\s\S]+?)\s+WHERE\s+changes\(\)\s*=\s*1/i,
    "$1 VALUES ($2)",
  );
}

/** Compatibility layer for the site's existing prepared-statement interface. */
export function createVercelDatabase(env) {
  return {
    prepare(text) { return new Statement(env, text); },
    async batch(statements) {
      const results = [];
      let previousChanges = 0;
      for (const statement of statements) {
        if (isRevisionInsert(statement.text)) {
          if (previousChanges !== 1) {
            results.push({ meta: { changes: 0 } });
            continue;
          }
          const result = await new Statement(env, revisionInsertWithValues(statement.text), statement.params).run();
          results.push(result);
          previousChanges = result.meta.changes;
          continue;
        }
        const result = await statement.run();
        results.push(result);
        previousChanges = result.meta.changes;
      }
      return results;
    },
  };
}
