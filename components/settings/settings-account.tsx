"use client";

import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface SettingsAccountProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function SettingsAccount({ user }: SettingsAccountProps) {
  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Avatar className="size-14">
          <AvatarImage
            src={user.image || undefined}
            alt={user.name || "User"}
          />
          <AvatarFallback className="bg-primary/10 text-primary text-lg">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex flex-col gap-1">
          {user.name && (
            <p className="text-sm font-medium leading-none truncate">
              {user.name}
            </p>
          )}
          {user.email && (
            <p className="text-sm text-muted-foreground truncate">
              {user.email}
            </p>
          )}
        </div>
      </div>
      <Button
        variant="outline"
        className="w-fit gap-2 text-destructive hover:text-destructive"
        onClick={() => signOut({ callbackUrl: "/login" })}
      >
        <LogOut className="size-4" />
        Sign out
      </Button>
    </div>
  );
}
