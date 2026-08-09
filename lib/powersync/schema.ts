import { column, Schema, Table } from "@powersync/web"

const ideas = new Table(
  {
    user_id: column.text,
    content: column.text,
    source: column.text,
    status: column.text,
    tags: column.text,
    pinned: column.integer,
    background_color: column.text,
    deleted_at: column.text,
    created_at: column.text,
    updated_at: column.text,
  },
  {
    indexes: {
      ideas_user_status_created: ["user_id", "status", "created_at"],
      ideas_pinned: ["user_id", "pinned"],
    },
  },
)

export const AppSchema = new Schema({ ideas })

export type Database = (typeof AppSchema)["types"]
export type IdeaRow = Database["ideas"]
