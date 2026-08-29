import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core"

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  image: text("image"),
  created_at: text("created_at").default(""),
  updated_at: text("updated_at").default(""),
})

export const accounts = sqliteTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    user_id: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    provider_account_id: text("provider_account_id").notNull(),
    access_token: text("access_token"),
    refresh_token: text("refresh_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    created_at: text("created_at").default(""),
    updated_at: text("updated_at").default(""),
  },
  (table) => [
    index("idx_accounts_user_id").on(table.user_id),
    uniqueIndex("idx_accounts_provider_account").on(table.provider, table.provider_account_id),
  ]
)

export const ideas = sqliteTable(
  "ideas",
  {
    id: text("id").primaryKey(),
    user_id: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    source: text("source").default("web"),
    status: text("status").default("inbox"),
    tags: text("tags"),
    pinned: integer("pinned").default(0),
    background_color: text("background_color"),
    deleted_at: text("deleted_at"),
    created_at: text("created_at").default(""),
    updated_at: text("updated_at").default(""),
  },
  (table) => [
    index("idx_ideas_user_status_created").on(table.user_id, table.status, table.created_at),
  ]
)

export const apiKeys = sqliteTable(
  "api_keys",
  {
    id: text("id").primaryKey(),
    user_id: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    key_hash: text("key_hash").notNull().unique(),
    key_preview: text("key_preview").notNull(),
    created_at: text("created_at").default(""),
    last_used_at: text("last_used_at"),
  },
  (table) => [
    index("idx_api_keys_user_id").on(table.user_id),
    index("idx_api_keys_key_hash").on(table.key_hash),
  ]
)

export type Idea = typeof ideas.$inferSelect
export type NewIdea = typeof ideas.$inferInsert
export type ApiKey = typeof apiKeys.$inferSelect
