"use client";

import { useStore } from "@/store";
import { Card, CardContent, CardHeader } from "@/components/ui/dashboard-cards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Plus, Filter } from "lucide-react";
import Link from "next/link";

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
        <Button asChild size="lg">
          <Link href="/app/attendance/new">
            <Plus />
            Submit Report
          </Link>
        </Button>
      </div>

      <Card className="border-none bg-white">
        <CardHeader className="pb-4 border-b border-slate-50">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by date or cell..."
                className="pl-10 rounded-xl"
              />
            </div>
            <Button variant="outline">
              <Filter />
              Filter
            </Button>
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
            <TableBody />
          </Table>
          <p className="text-center text-muted-foreground py-12 text-sm px-4">
            No attendance records yet. This list will populate when an
            attendance API is connected.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
