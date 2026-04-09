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
  User,
  Mail,
  Phone,
  MapPin,
  Bell,
  Lock,
  Shield,
  Smartphone,
  Upload,
  Save,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { user } = useStore();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      toast.success("Settings updated!", {
        description: "Your changes have been saved successfully.",
      });
      setIsSaving(false);
    }, 1000);
  };

  const tabs = [
    { id: "profile", label: "General Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security & Login", icon: Lock },
    { id: "account", label: "Account Activity", icon: Shield },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Account Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your personal information and application preferences.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground transition-all hover:translate-y-[-2px] active:translate-y-0 disabled:opacity-70 group"
        >
          {isSaving ? (
            <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save All Changes
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Tabs */}
        <div className="lg:col-span-3 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-slate-100 hover:text-foreground",
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-9 space-y-6">
          {activeTab === "profile" && (
            <>
              <Card className="border-none bg-white">
                <CardHeader>
                  <CardTitle>Public Profile</CardTitle>
                  <CardDescription>
                    How other leaders see you in the network.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-50">
                    <div className="relative group">
                      <div className="h-24 w-24 rounded-lg bg-slate-100 flex items-center justify-center border-2 border-slate-200 overflow-hidden">
                        {user?.avatar ? (
                          <img
                            src={user.avatar}
                            className="h-full w-full object-cover"
                            alt="Avatar"
                          />
                        ) : (
                          <User className="h-10 w-10 text-slate-300" />
                        )}
                      </div>
                      <button className="absolute -bottom-1 -right-1 h-8 w-8 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95">
                        <Upload className="h-4 w-4" />
                      </button>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{user?.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {user?.role.replace("_", " ")} • {user?.unitName}
                      </p>
                      <div className="mt-3 flex gap-2">
                        <button className="text-xs font-bold text-primary hover:underline">
                          Change Photo
                        </button>
                        <span className="text-slate-200">|</span>
                        <button className="text-xs font-bold text-rose-500 hover:underline">
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        Full Name
                      </label>
                      <input
                        type="text"
                        defaultValue={user?.name}
                        className="w-full h-12 px-4 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        Email Address
                      </label>
                      <input
                        type="email"
                        defaultValue={user?.email}
                        className="w-full h-12 px-4 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        placeholder="+234 ..."
                        className="w-full h-12 px-4 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        Region / State
                      </label>
                      <input
                        type="text"
                        readOnly
                        defaultValue={user?.unitName}
                        className="w-full h-12 px-4 rounded-xl border bg-slate-100 text-muted-foreground cursor-not-allowed font-medium"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none bg-white">
                <CardHeader>
                  <CardTitle>Home Fellowship Info</CardTitle>
                  <CardDescription>
                    Specific details about your assigned cell unit.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        Cell Name
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          type="text"
                          defaultValue="Grace & Truth Cell"
                          className="w-full h-12 pl-12 pr-4 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        Cell Address
                      </label>
                      <input
                        type="text"
                        defaultValue="Block A2, Heaven's Gate Estate"
                        className="w-full h-12 px-4 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === "security" && (
            <Card className="border-none bg-white">
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Ensure your account remains secure with a strong password.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    Current Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full h-12 px-4 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      New Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full h-12 px-4 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full h-12 px-4 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium"
                    />
                  </div>
                </div>
                <div className="pt-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
                      <Smartphone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">
                        Two-Factor Authentication
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Add an extra layer of security to your account.
                      </p>
                    </div>
                  </div>
                  <button className="text-xs font-bold text-primary hover:underline">
                    Enable 2FA
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "notifications" && (
            <Card className="border-none bg-white">
              <CardHeader>
                <CardTitle>Global Notifications</CardTitle>
                <CardDescription>
                  Control how you receive alerts and updates.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  {
                    label: "Attendance Due Alerts",
                    desc: "Get notified when it's time to submit your weekly report.",
                  },
                  {
                    label: "New Member Assignments",
                    desc: "Receive alerts when new converts are assigned to your cell.",
                  },
                  {
                    label: "Follow-up Reminders",
                    desc: "Periodic reminders for pending convert follow-ups.",
                  },
                  {
                    label: "State Announcements",
                    desc: "Important updates from the State Pastor's office.",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between pb-4 border-b border-slate-50 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="text-sm font-bold">{item.label}</p>
                      <p className="text-xs text-muted-foreground font-medium">
                        {item.desc}
                      </p>
                    </div>
                    <div className="h-6 w-11 bg-primary rounded-full relative p-1 cursor-pointer transition-colors">
                      <div className="h-4 w-4 bg-white rounded-full absolute right-1" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {activeTab === "account" && (
            <Card className="border-none border-rose-100 bg-white">
              <CardHeader>
                <CardTitle className="text-rose-600">Danger Zone</CardTitle>
                <CardDescription>
                  Permanent actions regarding your leadership access.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-rose-700">
                      Deactivate Leadership Access
                    </p>
                    <p className="text-xs text-rose-600/80 font-medium">
                      This will hide your profile and restrict dashboard access
                      until re-enabled.
                    </p>
                  </div>
                  <button className="h-10 px-4 rounded-xl bg-white border border-rose-200 text-rose-600 text-xs font-bold hover:bg-rose-100 transition-colors">
                    Deactivate
                  </button>
                </div>
                <div className="p-4 rounded-2xl bg-rose-500 text-white flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold">
                      Delete Account Information
                    </p>
                    <p className="text-xs text-rose-100 font-medium whitespace-nowrap">
                      This action cannot be undone. All personal data will be
                      wiped.
                    </p>
                  </div>
                  <button className="h-10 px-4 rounded-xl bg-white text-rose-600 text-xs font-bold hover:bg-rose-50 transition-colors flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    Delete Permanently
                  </button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
