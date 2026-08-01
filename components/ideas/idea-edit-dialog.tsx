"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogCloseButton } from "@/components/ui/custom/dialog-close-button";
import { EditorX } from "@/components/editor/editor-x";
import { useSuppressGlobalHotkeys } from "@/hooks/use-hotkey-scope";
import { useDialogCloseHotkey } from "@/hooks/use-dialog-close-hotkey";
import { useScrollLock } from "@/hooks/use-scroll-lock";
import { Check, X } from "lucide-react";

interface IdeaEditDialogProps {
  ideaId: string;
  initialContent: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, content: string) => Promise<void>;
}

export function IdeaEditDialog({
  ideaId,
  initialContent,
  open,
  onOpenChange,
  onSave,
}: IdeaEditDialogProps) {
  const [content, setContent] = useState(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useSuppressGlobalHotkeys(open);
  useScrollLock(open);
  useDialogCloseHotkey(open, () => onOpenChange(false));

  // Reset content whenever the dialog opens for a different idea
  useEffect(() => {
    if (open) {
      setContent(initialContent);
      setIsSubmitting(false);
    }
  }, [open, initialContent]);

  const handleClose = useCallback(() => {
    if (isSubmitting) return;
    onOpenChange(false);
  }, [isSubmitting, onOpenChange]);

  const handleSubmit = useCallback(async () => {
    const currentContent = content;
    if (!currentContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSave(ideaId, currentContent.trim());
    } finally {
      setIsSubmitting(false);
      onOpenChange(false);
    }
  }, [content, isSubmitting, onSave, ideaId, onOpenChange]);

  const handleEscape = useCallback(() => {
    handleClose();
  }, [handleClose]);

  const handleModEnter = useCallback(() => {
    handleSubmit();
  }, [handleSubmit]);

  const isDirty = content.trim() !== initialContent.trim();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        showCloseButton={false}
        className="flex flex-col gap-0 overflow-hidden p-0 sm:max-w-xl"
      >
        <DialogCloseButton onClick={handleClose} />
        <DialogHeader className="px-4 pt-6 pb-6">
          <DialogTitle>Edit idea</DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 px-4 pb-2">
          <div className="rounded-md border border-border bg-card">
            <EditorX
              value={initialContent}
              onChange={setContent}
              onEscape={handleEscape}
              onModEnter={handleModEnter}
              placeholder="Edit your idea..."
              disabled={isSubmitting}
              focusOnMount
              minHeight="20dvh"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border px-4 py-3">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            <X className="size-4 mr-2" />
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!content.trim() || !isDirty || isSubmitting}
          >
            {isSubmitting ? (
              <Spinner className="size-4 mr-2" />
            ) : (
              <Check className="size-4 mr-2" />
            )}
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
