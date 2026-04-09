"use client";

import { useStore } from "@/store";
import {
  Bell,
  Search,
  ChevronDown,
  LogOut,
  Settings,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TopNav() {
  const { user } = useStore();
  const { resetAuth } = useStore();
  const router = useRouter();

  const handleLogout = () => {
    resetAuth();
    toast.success("Signed out", { description: "See you next time." });
    router.push("/");
  };

  return (
    <header className="flex h-16 items-center border-b bg-card/50 backdrop-blur-md px-6 sticky top-0 z-10">
      <div className="flex flex-1 items-center gap-4">
        <div className="relative w-full max-w-md hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search for members, cells, or reports..."
            className="h-10 w-full rounded-xl border bg-background pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border hover:bg-accent transition-colors">
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 pl-2 border-l ml-2 rounded-xl pr-2 py-1 hover:bg-accent/60 transition-colors">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-sm font-semibold leading-none">
                  {user?.name}
                </span>
                <span className="text-xs text-muted-foreground mt-1 capitalize">
                  {user?.role.toLowerCase().replace("_", " ")}
                </span>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-medium overflow-hidden border-2 border-background">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
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
            <DropdownMenuItem onClick={() => toast.info("Profile coming soon")}>
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
      </div>
    </header>
  );
}
