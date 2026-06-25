import { $insertList } from "@lexical/list";

import { ListTodoIcon } from "lucide-react";

import { ComponentPickerOption } from "@/components/editor/plugins/picker/component-picker-option";

export function CheckListPickerPlugin() {
  return new ComponentPickerOption("Check List", {
    icon: <ListTodoIcon className="size-4" />,
    keywords: ["check list", "todo list"],
    onSelect: () => $insertList("check"),
  });
}
