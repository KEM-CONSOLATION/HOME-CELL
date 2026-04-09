"use client";

import { useStore } from "@/store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/dashboard-cards";
import {
  Send,
  MessageSquare,
  Mail,
  Search,
  History,
  Plus,
  MoreVertical,
  CheckCheck,
  Bell,
  Radio,
  Users,
  Megaphone,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function CommunicationHub() {
  const { user } = useStore();
  const [activeTab, setActiveTab] = useState("broadcasts");
  const [message, setMessage] = useState("");

  const handleSendBroadcast = () => {
    if (!message.trim()) return;
    toast.success("Broadcast queued successfully!", {
      description: "Delivering to all members in your unit via SMS/Email.",
    });
    setMessage("");
  };

  const tabs = [
    { id: "broadcasts", label: "Group Broadcasts", icon: Megaphone },
    { id: "direct", label: "Leader Comms", icon: MessageSquare },
    { id: "announcements", label: "State Alerts", icon: Bell },
  ];

  const recentHistory = [
    {
      id: 1,
      title: "Weekly Fellowship Reminder",
      status: "Delivered",
      date: "2 hours ago",
      type: "SMS",
      sentBy: "John Doe",
    },
    {
      id: 2,
      title: "Special Fasting Announcement",
      status: "Delivered",
      date: "Yesterday",
      type: "Email",
      sentBy: "John Doe",
    },
    {
      id: 3,
      title: "New Convert Welcome Message",
      status: "Delivered",
      date: "2 days ago",
      type: "Bulk SMS",
      sentBy: "Alice Smith",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Communication Hub
          </h1>
          <p className="text-muted-foreground mt-1">
            Centralized messaging for all {user?.unitName} members and
            leadership.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="h-11 px-6 rounded-xl border font-bold text-sm hover:bg-slate-50 transition-colors flex items-center gap-2">
            <History className="h-4 w-4" />
            Broadcast Archive
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Navigation / Feed */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none bg-white">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Channels</CardTitle>
                <Plus className="h-4 w-4 text-muted-foreground cursor-pointer" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group",
                    activeTab === tab.id
                      ? "bg-primary/5 border border-primary/20"
                      : "hover:bg-slate-50",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "h-9 w-9 rounded-lg flex items-center justify-center transition-colors",
                        activeTab === tab.id
                          ? "bg-primary text-white"
                          : "bg-slate-100 text-muted-foreground group-hover:bg-slate-200",
                      )}
                    >
                      <tab.icon className="h-4 w-4" />
                    </div>
                    <span
                      className={cn(
                        "text-sm font-bold",
                        activeTab === tab.id
                          ? "text-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      {tab.label}
                    </span>
                  </div>
                  {tab.id === "announcements" && (
                    <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                  )}
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="border-none bg-white">
            <CardHeader className="pb-4 border-b border-slate-50">
              <CardTitle className="text-lg">Broadcasting to:</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl border bg-slate-50/50">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-bold">
                    Everyone in {user?.unitName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Approx. 412 Recipients
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button className="h-10 rounded-lg border bg-white flex items-center justify-center gap-2 text-xs font-bold hover:bg-slate-50">
                  <Radio className="h-3.5 w-3.5 text-blue-500" />
                  SMS Channel
                </button>
                <button className="h-10 rounded-lg border border-primary/20 bg-primary/5 flex items-center justify-center gap-2 text-xs font-bold text-primary">
                  <Mail className="h-3.5 w-3.5" />
                  Email Channel
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Composer / History */}
        <div className="lg:col-span-8 space-y-6">
          {/* Composer */}
          <Card className="border-none bg-white overflow-hidden">
            <div className="h-1 bg-primary w-full" />
            <CardContent className="pt-8 space-y-4">
              <div className="relative">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your broadcast message here... Members will receive this via their preferred contact method."
                  className="w-full min-h-[180px] p-6 rounded-[32px] border-2 border-slate-100 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all text-lg font-medium resize-none"
                />
                <div className="absolute right-6 bottom-6 flex items-center gap-4">
                  <p className="text-xs text-muted-foreground font-medium">
                    {message.length} Characters
                  </p>
                  <button
                    onClick={handleSendBroadcast}
                    className="h-12 px-8 rounded-2xl bg-primary text-primary-foreground font-bold text-sm flex items-center gap-2 hover:translate-y-[-2px] active:translate-y-0 transition-all"
                  >
                    <Send className="h-4 w-4" />
                    Launch Broadcast
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-4 px-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/5"
                  />
                  <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                    Also post as Announcement
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/5"
                  />
                  <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                    Schedule for Later
                  </span>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* History Table */}
          <Card className="border-none bg-white">
            <CardHeader>
              <CardTitle className="text-lg">
                Recent Broadcast History
              </CardTitle>
              <CardDescription>
                Recently sent communications from your unit.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                        {item.type === "SMS" ? (
                          <Smartphone className="h-5 w-5" />
                        ) : (
                          <Mail className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{item.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.sentBy} • {item.type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs">
                          <CheckCheck className="h-3.5 w-3.5" />
                          {item.status}
                        </div>
                        <p className="text-[10px] text-muted-foreground font-medium">
                          {item.date}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="h-8 w-8 flex items-center justify-center hover:bg-slate-200 rounded-lg">
                            <MoreVertical className="h-4 w-4 text-muted-foreground" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem
                            onClick={() =>
                              toast.info("Details", {
                                description: item.title,
                              })
                            }
                          >
                            View details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              toast.success("Re-sent", {
                                description: `Re-sent “${item.title}”.`,
                              })
                            }
                          >
                            Resend
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() =>
                              toast.error("Delete not enabled yet", {
                                description: "This is mock data for now.",
                              })
                            }
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Smartphone(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
      <path d="M12 18h.01" />
    </svg>
  );
}
