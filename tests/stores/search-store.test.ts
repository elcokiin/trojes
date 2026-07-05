import { describe, it, expect, beforeEach, vi, afterEach } from "vitest"
import { useSearchStore } from "@/stores/search-store"

const initialState = {
  searchMode: false,
  searchQuery: "",
  debouncedSearch: "",
}

beforeEach(() => {
  useSearchStore.setState(initialState)
})

afterEach(() => {
  vi.useRealTimers()
})

describe("search-store", () => {
  it("setSearchQuery updates searchQuery immediately", () => {
    useSearchStore.getState().setSearchQuery("hello")
    expect(useSearchStore.getState().searchQuery).toBe("hello")
  })

  it("debouncedSearch does not update before 300ms", () => {
    vi.useFakeTimers()
    useSearchStore.getState().setSearchQuery("hello")
    vi.advanceTimersByTime(200)
    expect(useSearchStore.getState().debouncedSearch).toBe("")
  })

  it("debouncedSearch updates after 300ms", () => {
    vi.useFakeTimers()
    useSearchStore.getState().setSearchQuery("hello")
    vi.advanceTimersByTime(300)
    expect(useSearchStore.getState().debouncedSearch).toBe("hello")
  })

  it("rapid consecutive calls only debounce the last one", () => {
    vi.useFakeTimers()
    const store = useSearchStore.getState()
    store.setSearchQuery("a")
    vi.advanceTimersByTime(100)
    store.setSearchQuery("ab")
    vi.advanceTimersByTime(100)
    store.setSearchQuery("abc")
    vi.advanceTimersByTime(299)
    expect(useSearchStore.getState().debouncedSearch).toBe("")
    vi.advanceTimersByTime(1)
    expect(useSearchStore.getState().debouncedSearch).toBe("abc")
  })

  it("handleClearSearch resets both searchQuery and debouncedSearch", () => {
    vi.useFakeTimers()
    useSearchStore.getState().setSearchQuery("hello")
    vi.advanceTimersByTime(300)
    expect(useSearchStore.getState().debouncedSearch).toBe("hello")

    useSearchStore.getState().handleClearSearch()
    expect(useSearchStore.getState().searchQuery).toBe("")
    expect(useSearchStore.getState().debouncedSearch).toBe("")
  })

  it("handleClearSearch cancels pending debounce", () => {
    vi.useFakeTimers()
    useSearchStore.getState().setSearchQuery("hello")
    vi.advanceTimersByTime(100)
    useSearchStore.getState().handleClearSearch()
    vi.advanceTimersByTime(300)
    expect(useSearchStore.getState().debouncedSearch).toBe("")
  })

  it("setSearchMode updates searchMode", () => {
    useSearchStore.getState().setSearchMode(true)
    expect(useSearchStore.getState().searchMode).toBe(true)
    useSearchStore.getState().setSearchMode(false)
    expect(useSearchStore.getState().searchMode).toBe(false)
  })
})
