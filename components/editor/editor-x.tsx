"use client"

import { useRef, useEffect, useMemo, useState } from "react"
import { LexicalComposer } from "@lexical/react/LexicalComposer"
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin"
import { ContentEditable as LexicalContentEditable } from "@lexical/react/LexicalContentEditable"
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin"
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { KEY_ENTER_COMMAND, COMMAND_PRIORITY_LOW } from "lexical"
import { $convertToMarkdownString, $convertFromMarkdownString, TRANSFORMERS } from "@lexical/markdown"
import { registerMarkdownShortcuts } from "@lexical/markdown"
import { HeadingNode, QuoteNode } from "@lexical/rich-text"
import { ListNode, ListItemNode } from "@lexical/list"
import { CodeNode, CodeHighlightNode } from "@lexical/code"
import { LinkNode, AutoLinkNode } from "@lexical/link"
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode"
import { ComponentPickerMenuPlugin } from "@/components/editor/plugins/component-picker-menu-plugin"
import { ParagraphPickerPlugin } from "@/components/editor/plugins/picker/paragraph-picker-plugin"
import { HeadingPickerPlugin } from "@/components/editor/plugins/picker/heading-picker-plugin"
import { BulletedListPickerPlugin } from "@/components/editor/plugins/picker/bulleted-list-picker-plugin"
import { NumberedListPickerPlugin } from "@/components/editor/plugins/picker/numbered-list-picker-plugin"
import { CodePickerPlugin } from "@/components/editor/plugins/picker/code-picker-plugin"
import { QuotePickerPlugin } from "@/components/editor/plugins/picker/quote-picker-plugin"
import { EmojiPickerPlugin } from "@/components/editor/plugins/emoji-picker-plugin"
import { CheckListPickerPlugin } from "@/components/editor/plugins/picker/check-list-picker-plugin"
import { DividerPickerPlugin } from "@/components/editor/plugins/picker/divider-picker-plugin"
import { CodeHighlightPlugin } from "@/components/editor/plugins/code-highlight-plugin"
import { TabFocusPlugin } from "@/components/editor/plugins/tab-focus-plugin"
import { FloatingTextFormatToolbarPlugin } from "@/components/editor/plugins/floating-text-format-plugin"
import { FloatingLinkEditorPlugin } from "@/components/editor/plugins/floating-link-editor-plugin"
import { editorTheme } from "@/components/editor/themes/editor-theme"
import "@/components/editor/themes/editor-theme.css"
import { cn } from "@/lib/utils"

function AutoFocusPlugin() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      editor.focus()
    })
    return () => cancelAnimationFrame(raf)
  }, [editor])

  return null
}

function MarkdownShortcutsPlugin() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return registerMarkdownShortcuts(editor, TRANSFORMERS)
  }, [editor])

  return null
}

function SlashMenuPlugin() {
  const baseOptions = [
    ParagraphPickerPlugin(),
    HeadingPickerPlugin({ n: 1 }),
    HeadingPickerPlugin({ n: 2 }),
    HeadingPickerPlugin({ n: 3 }),
    BulletedListPickerPlugin(),
    NumberedListPickerPlugin(),
    CodePickerPlugin(),
    QuotePickerPlugin(),
    CheckListPickerPlugin(),
    DividerPickerPlugin(),
  ]

  return (
    <ComponentPickerMenuPlugin
      baseOptions={baseOptions}
    />
  )
}

function EditorContentPlugin({
  initialContent,
  onMarkdownChange,
}: {
  initialContent: string
  onMarkdownChange: (markdown: string) => void
}) {
  const [editor] = useLexicalComposerContext()
  const initialized = useRef(false)
  const onChangeRef = useRef(onMarkdownChange)
  onChangeRef.current = onMarkdownChange

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    if (!initialContent) return

    editor.update(() => {
      $convertFromMarkdownString(initialContent, TRANSFORMERS)
    })
  }, [editor, initialContent])

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const markdown = $convertToMarkdownString(TRANSFORMERS)
        onChangeRef.current(markdown)
      })
    })
  }, [editor])

  return null
}

function KeyboardPlugin({
  onEscape,
  onModEnter,
}: {
  onEscape?: () => void
  onModEnter?: () => void
}) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    const root = editor.getRootElement()
    if (!root) return

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        onEscape?.()
        return
      }
    }

    root.addEventListener("keydown", handler)
    return () => root.removeEventListener("keydown", handler)
  }, [editor, onEscape])

  useEffect(() => {
    return editor.registerCommand(
      KEY_ENTER_COMMAND,
      (payload) => {
        const event = payload as KeyboardEvent | null
        if (event && (event.metaKey || event.ctrlKey)) {
          event.preventDefault()
          onModEnter?.()
          return true
        }
        return false
      },
      COMMAND_PRIORITY_LOW,
    )
  }, [editor, onModEnter])

  return null
}

export function EditorX({
  value,
  onChange,
  placeholder = "Type here...",
  className,
  minHeight = "1lh",
  disabled,
  focusOnMount,
  onEscape,
  onModEnter,
  onFocus,
  onBlur,
}: {
  value: string
  onChange: (markdown: string) => void
  placeholder?: string
  className?: string
  minHeight?: string
  disabled?: boolean
  focusOnMount?: boolean
  onEscape?: () => void
  onModEnter?: () => void
  onFocus?: () => void
  onBlur?: () => void
}) {
  const initialConfig = useMemo(() => ({
    namespace: "TrojesEditor",
    theme: editorTheme,
    nodes: [
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      CodeNode,
      CodeHighlightNode,
      LinkNode,
      AutoLinkNode,
      HorizontalRuleNode,
    ],
    editorState: null,
    onError: (error: Error) => {
      console.error(error)
    },
  }), [])

  const [isLinkEditMode, setIsLinkEditMode] = useState(false)
  const anchorRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={anchorRef} className={cn("relative", disabled && "pointer-events-none opacity-50", className)}>
      <LexicalComposer initialConfig={initialConfig}>
        <MarkdownShortcutsPlugin />
        <SlashMenuPlugin />
        <EmojiPickerPlugin />
        <CodeHighlightPlugin />
        <TabFocusPlugin />
        <FloatingTextFormatToolbarPlugin
          anchorElem={anchorRef.current}
          setIsLinkEditMode={setIsLinkEditMode}
        />
        <FloatingLinkEditorPlugin
          anchorElem={anchorRef.current}
          isLinkEditMode={isLinkEditMode}
          setIsLinkEditMode={setIsLinkEditMode}
        />
        <HistoryPlugin />
        {focusOnMount && <AutoFocusPlugin />}
        <KeyboardPlugin onEscape={onEscape} onModEnter={onModEnter} />
        <EditorContentPlugin
          initialContent={value}
          onMarkdownChange={onChange}
        />
        <RichTextPlugin
          contentEditable={
            <LexicalContentEditable
              className="relative block overflow-auto px-4 py-2 focus:outline-none text-base leading-normal"
              style={{ minHeight: "1lh" }}
              aria-placeholder={placeholder}
              onFocus={onFocus}
              onBlur={onBlur}
              placeholder={
                <div className="text-muted-foreground/60 pointer-events-none absolute top-0 left-0 overflow-hidden px-4 py-2 text-ellipsis select-none text-base">
                  {placeholder}
                </div>
              }
            />
          }
          placeholder={null}
          ErrorBoundary={LexicalErrorBoundary}
        />
      </LexicalComposer>
    </div>
  )
}
