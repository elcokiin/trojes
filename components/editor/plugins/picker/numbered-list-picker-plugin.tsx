import { $insertList } from "@lexical/list";

import { ListOrderedIcon } from "lucide-react";

import { ComponentPickerOption } from "@/components/editor/plugins/picker/component-picker-option";

export function NumberedListPickerPlugin() {
  return new ComponentPickerOption("Numbered List", {
    icon: <ListOrderedIcon className="size-4" />,
    keywords: ["numbered list", "ordered list", "ol"],
    onSelect: () => $insertList("number"),
  });
}
