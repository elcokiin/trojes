export interface FakeRow {
  id: string
  [key: string]: unknown
}

export interface FakeDb {
  select(sql: string, params: unknown[]): FakeRow[]
  getOptional(sql: string, params: unknown[]): Promise<FakeRow | null>
  execute(sql: string, params: unknown[]): Promise<{ rowsAffected: number }>
  subscribe(fn: () => void): () => void
  error: Error | null
  setError(error: Error | null): void
}

type Listener = () => void

export function createFakeDb(initialRows: FakeRow[] = []): FakeDb {
  let rows: FakeRow[] = initialRows.map((r) => ({ ...r }))
  const listeners = new Set<Listener>()

  function notify() {
    listeners.forEach((l) => l())
  }

  function subscribe(fn: Listener): () => void {
    listeners.add(fn)
    return () => {
      listeners.delete(fn)
    }
  }

  function splitConditions(sql: string): { conds: string[]; limit: number | null } {
    const upper = sql.toUpperCase()
    const whereIdx = upper.indexOf("WHERE")
    const orderIdx = upper.indexOf("ORDER BY")
    const limitMatch = upper.match(/LIMIT\s*(\?|\d+)/)

    let conds: string[] = []
    if (whereIdx !== -1) {
      const end = orderIdx !== -1 ? orderIdx : sql.length
      conds = sql
        .slice(whereIdx + 5, end)
        .split("AND")
        .map((s) => s.trim())
        .filter(Boolean)
    }

    let limit: number | null = null
    if (limitMatch) {
      limit = limitMatch[1] === "?" ? -1 : Number(limitMatch[1])
    }
    return { conds, limit }
  }

  function matchesRow(row: FakeRow, cond: string, params: unknown[], pointer: { i: number }): boolean {
    if (cond.includes("LIKE ?")) {
      const col = cond.split("LIKE")[0].trim()
      const needle = String(params[pointer.i++] ?? "")
        .replace(/%/g, "")
        .toLowerCase()
      return String(row[col] ?? "").toLowerCase().includes(needle)
    }

    const match = cond.match(/^(\w+)\s*=\s*(.+)$/)
    if (!match) return true
    const [, col, rhs] = match

    if (rhs === "?") {
      return row[col] === params[pointer.i++]
    }
    if (rhs === "1" || rhs === "0") {
      return row[col] === Number(rhs)
    }
    return row[col] === rhs.replace(/^'|'$/g, "")
  }

  let currentError: Error | null = null

  function select(sql: string, params: unknown[]): FakeRow[] {
    if (currentError) return []
    if (sql.toUpperCase().includes("WHERE 1=0")) return []

    const { conds, limit } = splitConditions(sql)
    const limitVal = limit === -1 ? Number(params[params.length - 1]) : limit

    const matched = rows.filter((row) => {
      const pointer = { i: 0 }
      return conds.every((cond) => matchesRow(row, cond, params, pointer))
    })

    const sorted = matched.sort((a, b) => {
      const byCreated = String(b.created_at ?? "").localeCompare(String(a.created_at ?? ""))
      if (byCreated !== 0) return byCreated
      return String(b.id ?? "").localeCompare(String(a.id ?? ""))
    })

    return limitVal != null ? sorted.slice(0, limitVal) : sorted
  }

  async function getOptional(sql: string, params: unknown[]): Promise<FakeRow | null> {
    if (sql.includes("id = ?")) {
      const row = rows.find((r) => r.id === params[0])
      return row ? { ...row } : null
    }
    return select(sql, params)[0] ?? null
  }

  async function execute(sql: string, params: unknown[]): Promise<{ rowsAffected: number }> {
    const trimmed = sql.trim()

    const insertMatch = trimmed.match(
      /^INSERT INTO\s+\w+\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i,
    )
    if (insertMatch) {
      const cols = insertMatch[1].split(",").map((s) => s.trim())
      const values = insertMatch[2].split(",").map((s) => s.trim())
      const row: Record<string, unknown> = {}
      let p = 0
      cols.forEach((col, i) => {
        const v = values[i]
        if (v === "?") row[col] = params[p++]
        else if (v.toUpperCase() === "NULL") row[col] = null
        else if (/^-?\d+$/.test(v)) row[col] = Number(v)
        else row[col] = v.replace(/^'|'$/g, "")
      })
      rows.push(row as FakeRow)
      notify()
      return { rowsAffected: 1 }
    }

    const updateMatch = trimmed.match(
      /^UPDATE\s+\w+\s+SET\s+(.+?)\s+WHERE\s+id\s*=\s*\?/i,
    )
    if (updateMatch) {
      const row = rows.find((r) => r.id === params[params.length - 1])
      if (!row) return { rowsAffected: 0 }

      const assigns = updateMatch[1].split(",").map((s) => s.trim())
      let p = 0
      for (const a of assigns) {
        const m = a.match(/^(\w+)\s*=\s*(.+)$/)
        if (!m) continue
        const [, col, rhs] = m
        if (rhs === "?") row[col] = params[p++]
        else if (rhs.toUpperCase() === "NULL") row[col] = null
        else if (/^-?\d+$/.test(rhs)) row[col] = Number(rhs)
        else row[col] = rhs.replace(/^'|'$/g, "")
      }
      notify()
      return { rowsAffected: 1 }
    }

    const deleteMatch = trimmed.match(/^DELETE FROM\s+\w+\s+WHERE\s+id\s*=\s*\?/i)
    if (deleteMatch) {
      const before = rows.length
      rows = rows.filter((r) => r.id !== params[0])
      notify()
      return { rowsAffected: before - rows.length }
    }

    throw new Error(`Unsupported SQL in fake db: ${sql}`)
  }

  return {
    select,
    getOptional,
    execute,
    subscribe,
    get error() {
      return currentError
    },
    setError(error: Error | null) {
      currentError = error
      notify()
    },
  }
}
