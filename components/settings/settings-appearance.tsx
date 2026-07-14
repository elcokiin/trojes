"use client";

import { useTheme } from "@/components/providers/theme-provider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Monitor } from "lucide-react";

export function SettingsAppearance() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-col gap-3">
      <Label className="text-sm font-medium">Theme</Label>
      <div className="grid grid-cols-3 gap-2">
        <Button
          variant={theme === "light" ? "default" : "outline"}
          size="sm"
          onClick={() => setTheme("light")}
          className="gap-2"
        >
          <Sun className="size-4" />
          Light
        </Button>
        <Button
          variant={theme === "dark" ? "default" : "outline"}
          size="sm"
          onClick={() => setTheme("dark")}
          className="gap-2"
        >
          <Moon className="size-4" />
          Dark
        </Button>
        <Button
          variant={theme === "system" ? "default" : "outline"}
          size="sm"
          onClick={() => setTheme("system")}
          className="gap-2"
        >
          <Monitor className="size-4" />
          System
        </Button>
      </div>
    </div>
  );
}
