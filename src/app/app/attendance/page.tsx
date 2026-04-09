"use client";

import { useStore } from "@/store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import { Search, Plus, ChevronRight, Filter } from "lucide-react";
import Link from "next/link";
import { MOCK_ATTENDANCE } from "@/data/mock-data";

export default function AttendanceListPage() {
  const { user } = useStore();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Attendance History
          </h1>
          <p className="text-muted-foreground mt-1">
            Review weekly attendance reports for {user?.unitName}.
          </p>
        </div>
        <Link
          href="/app/attendance/new"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Submit Report
        </Link>
      </div>

      <Card className="border-none bg-white">
        <CardHeader className="pb-4 border-b border-slate-50">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by date or cell..."
                className="h-12 w-full rounded-xl border bg-slate-50 pl-10 text-sm focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all"
              />
            </div>
            <button className="h-12 px-5 rounded-xl border text-sm font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors">
              <Filter className="h-4 w-4" />
              Filter
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                <TableHead>Date</TableHead>
                <TableHead>Cell</TableHead>
                <TableHead className="text-center">Attendance</TableHead>
                <TableHead className="text-center">New Souls</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_ATTENDANCE.map((record) => (
                <TableRow key={record.id} className="hover:bg-slate-50/50">
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-2xl bg-primary/10 flex flex-col items-center justify-center text-primary border border-primary/20">
                        <span className="text-[10px] font-black uppercase leading-none">
                          {new Date(record.date).toLocaleString("default", {
                            month: "short",
                          })}
                        </span>
                        <span className="text-lg font-bold leading-tight mt-0.5">
                          {new Date(record.date).getDate()}
                        </span>
                      </div>
                      <div className="text-sm">
                        <p className="font-bold">
                          {new Date(record.date).toLocaleDateString(undefined, {
                            dateStyle: "medium",
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground font-medium">
                          Week meeting report
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-bold">
                        {record.cellId === "cell-1"
                          ? "Grace Cell"
                          : "Mercy Cell"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {record.cellId}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-lg font-bold">
                      {record.totalAttendance}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-lg font-bold text-purple-600">
                      {record.newConverts}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-emerald-50 text-emerald-600 border-none">
                      SUBMITTED
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/app/attendance/${record.id}`}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white hover:scale-105 active:scale-95 transition-all"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Link>
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
