"use client";

import Image from "next/image";
import { useStore } from "@/store";
import { Bell, ChevronDown, Menu, LogOut, Settings, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSyncExternalStore } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GlobalSearch } from "@/components/layout/global-search";

const subscribe = () => () => {};

export function TopNav({ onOpenSidebar }: { onOpenSidebar?: () => void }) {
  const { user } = useStore();
  const { resetAuth } = useStore();
  const router = useRouter();
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  const handleLogout = () => {
    resetAuth();
    toast.success("Signed out", { description: "See you next time." });
    router.push("/");
  };

  return (
    <header className="flex h-16 items-center border-b border-border/60 bg-card/50 backdrop-blur-md px-4 sm:px-6 sticky top-0 z-30">
      <div className="flex min-w-0 flex-1 items-center gap-3 md:gap-4">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="cursor-pointer md:hidden inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border hover:bg-accent transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5 text-muted-foreground" />
        </button>
        <div className="min-w-0 flex-1 md:flex md:max-w-none md:justify-start">
          <GlobalSearch />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {!mounted ? (
          <div className="h-10 w-10 rounded-xl border bg-card/60" />
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="cursor-pointer relative flex h-10 w-10 items-center justify-center rounded-xl border hover:bg-accent transition-colors">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary border-2 border-card" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-2">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="px-2 py-2 text-xs text-muted-foreground">
                No new notifications yet.
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {!mounted ? (
          <div className="h-11 w-28 rounded-xl border bg-card/60" />
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="cursor-pointer flex items-center gap-3 pl-2 border-l ml-2 rounded-xl pr-2 py-1 hover:bg-accent/60 transition-colors">
                <div className="hidden flex-col items-end sm:flex">
                  <span className="text-sm font-semibold leading-none">
                    {user?.name}
                  </span>
                  <span className="mt-1 text-xs capitalize text-muted-foreground">
                    {user?.role.toLowerCase().replace("_", " ")}
                  </span>
                </div>
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border-2 border-background bg-primary font-medium text-primary-foreground">
                  {user?.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user?.name ?? "Account"}
                      width={40}
                      height={40}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    user?.name.charAt(0)
                  )}
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => toast.info("Profile coming soon")}
              >
                <User className="mr-2 size-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/app/settings")}>
                <Settings className="mr-2 size-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 size-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
