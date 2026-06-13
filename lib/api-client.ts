export const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return res.json()
}

export const ideasApi = {
  create(content: string) {
    return fetch("/api/ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    })
  },

  update(id: string, data: Record<string, unknown>) {
    return fetch(`/api/ideas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
  },

  remove(id: string) {
    return fetch(`/api/ideas/${id}`, { method: "DELETE" })
  },
}

export const apiKeysApi = {
  create(name: string) {
    return fetch("/api/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
  },

  rename(id: string, name: string) {
    return fetch(`/api/api-keys/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
  },

  remove(id: string) {
    return fetch(`/api/api-keys/${id}`, { method: "DELETE" })
  },
}
