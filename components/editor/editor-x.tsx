"use client"

import { useRef, useEffect } from "react"
import { LexicalComposer } from "@lexical/react/LexicalComposer"
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin"
import { ContentEditable as LexicalContentEditable } from "@lexical/react/LexicalContentEditable"
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin"
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { $convertToMarkdownString, $convertFromMarkdownString, TRANSFORMERS } from "@lexical/markdown"
import { registerMarkdownShortcuts } from "@lexical/markdown"
import { HeadingNode, QuoteNode } from "@lexical/rich-text"
import { ListNode, ListItemNode } from "@lexical/list"
import { CodeNode, CodeHighlightNode } from "@lexical/code"
import { LinkNode, AutoLinkNode } from "@lexical/link"
import { ComponentPickerMenuPlugin } from "@/components/editor/plugins/component-picker-menu-plugin"
import { ParagraphPickerPlugin } from "@/components/editor/plugins/picker/paragraph-picker-plugin"
import { HeadingPickerPlugin } from "@/components/editor/plugins/picker/heading-picker-plugin"
import { BulletedListPickerPlugin } from "@/components/editor/plugins/picker/bulleted-list-picker-plugin"
import { NumberedListPickerPlugin } from "@/components/editor/plugins/picker/numbered-list-picker-plugin"
import { CodePickerPlugin } from "@/components/editor/plugins/picker/code-picker-plugin"
import { QuotePickerPlugin } from "@/components/editor/plugins/picker/quote-picker-plugin"
import { EmojiPickerPlugin } from "@/components/editor/plugins/emoji-picker-plugin"
import { editorTheme } from "@/components/editor/themes/editor-theme"
import "@/components/editor/themes/editor-theme.css"
import { cn } from "@/lib/utils"

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

  useEffect(() => {
    onChangeRef.current = onMarkdownChange
  }, [onMarkdownChange])

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

export function EditorX({
  value,
  onChange,
  placeholder = "Type here...",
  className,
  minHeight = "120px",
  disabled,
}: {
  value: string
  onChange: (markdown: string) => void
  placeholder?: string
  className?: string
  minHeight?: string
  disabled?: boolean
}) {
  const initialConfig = {
    namespace: "TrojeEditor",
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
    ],
    editorState: null,
    onError: (error: Error) => {
      console.error(error)
    },
  }

  return (
    <div className={cn("relative", disabled && "pointer-events-none opacity-50", className)}>
      <LexicalComposer initialConfig={initialConfig}>
        <MarkdownShortcutsPlugin />
        <SlashMenuPlugin />
        <EmojiPickerPlugin />
        <HistoryPlugin />
        <EditorContentPlugin
          initialContent={value}
          onMarkdownChange={onChange}
        />
        <RichTextPlugin
          contentEditable={
            <LexicalContentEditable
              className="relative block overflow-auto px-4 py-3 focus:outline-none text-base leading-relaxed"
              style={{ minHeight }}
              aria-placeholder={placeholder}
              placeholder={
                <div className="text-muted-foreground/60 pointer-events-none absolute top-0 left-0 overflow-hidden px-4 py-3 text-ellipsis select-none text-base">
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
