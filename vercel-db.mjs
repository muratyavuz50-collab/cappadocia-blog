let activeUrl = "";
let activeClient;

async function client(env) {
  const url = env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured.");
  if (url !== activeUrl) {
    activeUrl = url;
    const { neon } = await import("@neondatabase/serverless");
    activeClient = neon(url);
  }
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
