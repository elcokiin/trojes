"use client"

import { useReducer, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useApiKeys } from "@/hooks/use-api-keys"
import type { ApiKey } from "@/hooks/use-api-keys"
import { Key, Plus, Trash2, Copy, Check, Pencil } from "lucide-react"

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

type ApiKeysState = {
  newKeyName: string
  newlyCreatedKey: string | null
  editingId: string | null
  editingName: string
  isCreating: boolean
}

type ApiKeysAction =
  | { type: 'SET_NEW_KEY_NAME'; name: string }
  | { type: 'START_CREATING' }
  | { type: 'CREATE_SUCCESS'; fullKey: string }
  | { type: 'FINISH_CREATING' }
  | { type: 'START_EDIT'; id: string; name: string }
  | { type: 'SET_EDITING_NAME'; name: string }
  | { type: 'CANCEL_EDIT' }
  | { type: 'EDIT_SUCCESS' }

const initialState: ApiKeysState = {
  newKeyName: '',
  newlyCreatedKey: null,
  editingId: null,
  editingName: '',
  isCreating: false,
}

function apiKeysReducer(state: ApiKeysState, action: ApiKeysAction): ApiKeysState {
  switch (action.type) {
    case 'SET_NEW_KEY_NAME':
      return { ...state, newKeyName: action.name }
    case 'START_CREATING':
      return { ...state, isCreating: true }
    case 'CREATE_SUCCESS':
      return { ...state, newlyCreatedKey: action.fullKey, newKeyName: '' }
    case 'FINISH_CREATING':
      return { ...state, isCreating: false }
    case 'START_EDIT':
      return { ...state, editingId: action.id, editingName: action.name }
    case 'SET_EDITING_NAME':
      return { ...state, editingName: action.name }
    case 'CANCEL_EDIT':
      return { ...state, editingId: null, editingName: '' }
    case 'EDIT_SUCCESS':
      return { ...state, editingId: null, editingName: '' }
    default:
      return state
  }
}

export function ApiKeysManager() {
  const { keys, isLoading, create, rename, remove } = useApiKeys()

  const [state, dispatch] = useReducer(apiKeysReducer, initialState)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  const handleCreate = async () => {
    if (!state.newKeyName.trim() || state.isCreating) return

    dispatch({ type: 'START_CREATING' })
    try {
      const fullKey = await create(state.newKeyName.trim())
      if (fullKey) {
        dispatch({ type: 'CREATE_SUCCESS', fullKey })
      }
    } finally {
      dispatch({ type: 'FINISH_CREATING' })
    }
  }

  const handleDelete = async (id: string) => {
    await remove(id)
  }

  const handleRename = async (id: string) => {
    if (!state.editingName.trim()) return

    const ok = await rename(id, state.editingName.trim())
    if (ok) {
      dispatch({ type: 'EDIT_SUCCESS' })
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">Create API key</Label>
        <p className="text-xs text-muted-foreground mt-1">
          Use this for external HTTP capture without browser session.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={state.newKeyName}
          onChange={(e) => dispatch({ type: 'SET_NEW_KEY_NAME', name: e.target.value })}
          placeholder="e.g. n8n local workflow"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCreate()
          }}
        />
        <Button onClick={handleCreate} disabled={!state.newKeyName.trim() || state.isCreating} className="w-full sm:w-auto">
          <Plus className="size-4 mr-2" />
          Create
        </Button>
      </div>

      {state.newlyCreatedKey && (
        <div className="rounded-lg border border-primary/30 bg-primary/10 p-3 space-y-2">
          <p className="text-sm font-medium">Copy your key now (shown once):</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <code className="min-w-0 flex-1 rounded bg-background px-2 py-2 text-[11px] leading-relaxed break-all whitespace-pre-wrap">
              {state.newlyCreatedKey}
            </code>
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => copyToClipboard(state.newlyCreatedKey!, "new")}
            >
              {copiedId === "new" ? <Check className="size-4" /> : <Copy className="size-4" />}
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-sm font-medium">Your API keys</Label>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading keys...</p>
        ) : keys.length === 0 ? (
          <p className="text-sm text-muted-foreground">No keys yet.</p>
        ) : (
          <div className="space-y-2">
            {keys.map((key) => (
              <div key={key.id} className="rounded-lg border p-3 flex items-start gap-3">
                <Key className="size-4 text-muted-foreground shrink-0" />
                <div className="min-w-0 flex-1">
                  {state.editingId === key.id ? (
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Input
                        className="h-8"
                        value={state.editingName}
                        onChange={(e) => dispatch({ type: 'SET_EDITING_NAME', name: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRename(key.id)
                          if (e.key === "Escape") {
                            dispatch({ type: 'CANCEL_EDIT' })
                          }
                        }}
                        autoFocus
                      />
                      <Button size="sm" variant="ghost" className="w-full sm:w-auto" onClick={() => handleRename(key.id)}>
                        <Check className="size-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-medium truncate">{key.name}</p>
                      <p className="text-xs text-muted-foreground break-words">
                        ****{key.key_preview} • Created {formatDate(key.created_at)}
                        {key.last_used_at ? ` • Last used ${formatDate(key.last_used_at)}` : ""}
                      </p>
                    </>
                  )}
                </div>
                {state.editingId !== key.id && (
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        dispatch({ type: 'START_EDIT', id: key.id, name: key.name })
                      }}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleDelete(key.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground space-y-2">
        <p className="font-medium text-foreground/90">Use via HTTP</p>
        <div className="rounded bg-background p-2 text-[11px] leading-relaxed">
          <p className="break-words">Authorization:</p>
          <p className="break-all">Bearer trojes_your_api_key_here</p>
        </div>
      </div>
    </div>
  )
}
