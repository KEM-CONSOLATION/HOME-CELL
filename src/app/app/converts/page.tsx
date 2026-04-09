"use client";

import { useStore } from "@/store";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  Badge,
} from "@/components/ui/dashboard-cards";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  UserPlus,
  Clock,
  MessageCircle,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { MOCK_NEW_CONVERTS } from "@/data/mock-data";
import { useState } from "react";
import Link from "next/link";

export default function ConvertsPage() {
  const { user } = useStore();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredConverts = MOCK_NEW_CONVERTS.filter(
    (nc) =>
      nc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nc.phone.includes(searchTerm),
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Converts</h1>
          <p className="text-muted-foreground mt-1">
            Track and follow up with recent converts in {user?.unitName}.
          </p>
        </div>
        <Link
          href="/app/converts/new"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 text-sm font-bold transition-all hover:scale-105 active:scale-95"
        >
          <UserPlus className="h-4 w-4" />
          Register New Convert
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {[
          {
            label: "Pending Assignment",
            value: "12",
            icon: Clock,
            accent: "bg-blue-500",
          },
          {
            label: "In Progress",
            value: "24",
            icon: MessageCircle,
            accent: "bg-amber-500",
          },
          {
            label: "Fully Integrated",
            value: "156",
            icon: CheckCircle,
            accent: "bg-emerald-500",
          },
        ].map((stat, i) => (
          <Card
            key={i}
            className="border-none bg-white relative overflow-hidden"
          >
            <div
              className={cn("absolute left-0 top-0 bottom-0 w-1", stat.accent)}
            />
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-xs font-black uppercase tracking-widest">
                    {stat.label}
                  </p>
                  <h3 className="text-3xl font-bold mt-1">{stat.value}</h3>
                </div>
                <div
                  className={cn(
                    "h-12 w-12 rounded-2xl flex items-center justify-center opacity-10",
                    stat.accent,
                  )}
                />
                <stat.icon
                  className={cn(
                    "absolute right-8 h-6 w-6 opacity-40",
                    stat.accent.replace("bg-", "text-"),
                  )}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none bg-white">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search converts by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 w-full rounded-xl border bg-slate-50 pl-10 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 focus:bg-white transition-all"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                <TableHead>Convert</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned Cell</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredConverts.map((nc) => (
                <TableRow key={nc.id} className="hover:bg-slate-50/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {nc.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold truncate">{nc.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {nc.address}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm">
                    {nc.phone}
                  </TableCell>
                  <TableCell>
                    <Badge className="rounded-lg py-1">
                      {nc.followUpStatus.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="bg-slate-100 text-slate-700 rounded-lg py-1"
                    >
                      Grace Cell
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[320px]">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {nc.followUpNotes || "—"}
                    </p>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="h-10 px-4 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors">
                        <MessageCircle className="h-4 w-4" />
                        WhatsApp
                      </button>
                      <Link
                        href={`/app/converts/${nc.id}`}
                        className="h-10 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-bold inline-flex items-center justify-center gap-2 hover:-translate-y-px transition-all"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Details
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
