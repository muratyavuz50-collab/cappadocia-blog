import { sqliteTable, text, integer, index, primaryKey } from "drizzle-orm/sqlite-core";

export const articles = sqliteTable("articles", {
  slug: text("slug").primaryKey(),
  draftJson: text("draft_json").notNull(),
  publishedJson: text("published_json"),
  status: text("status").notNull().default("draft"),
  revision: integer("revision").notNull().default(1),
  updatedAt: text("updated_at").notNull(),
  updatedBy: text("updated_by").notNull(),
});

export const revisions = sqliteTable("article_revisions", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull(),
  snapshotJson: text("snapshot_json").notNull(),
  action: text("action").notNull(),
  revision: integer("revision").notNull(),
  savedAt: text("saved_at").notNull(),
  savedBy: text("saved_by").notNull(),
}, (table) => [index("idx_article_revisions_slug_saved_at").on(table.slug, table.savedAt)]);

export const members = sqliteTable("members", {
  userId: text("user_id").primaryKey(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  joinedAt: text("joined_at").notNull(),
  acceptedAt: text("accepted_at").notNull(),
});

export const administrators = sqliteTable("administrators", {
  slot: text("slot").primaryKey(),
  userId: text("user_id").notNull(),
  boundAt: text("bound_at").notNull(),
});

export const metrics = sqliteTable("site_metrics", {
 day:text("day").notNull(),kind:text("kind").notNull(),path:text("path").notNull(),
 source:text("source").notNull(),label:text("label").notNull(),bucket:text("bucket").notNull(),
 count:integer("count").notNull().default(0)
},t=>[primaryKey({columns:[t.day,t.kind,t.path,t.source,t.label,t.bucket]})]);
export const settings = sqliteTable("site_settings",{key:text("key").primaryKey(),value:text("value").notNull()});
