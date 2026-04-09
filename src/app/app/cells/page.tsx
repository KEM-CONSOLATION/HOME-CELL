"use client";

import { useStore } from "@/store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
} from "@/components/ui/dashboard-cards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Search,
  Users,
  Calendar,
  ChevronRight,
  Shield,
  Activity,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { MOCK_CELLS, MOCK_MEMBERS } from "@/data/mock-data";

export default function CellsDirectoryPage() {
  const { user } = useStore();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCells = MOCK_CELLS.filter((cell) =>
    cell.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Fellowship Cells
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage the fellowship centers and leadership assignments in{" "}
            {user?.unitName}.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/app/cells/new">
            <Plus />
            Create New Cell
          </Link>
        </Button>
      </div>

      {/* Metrics Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        {[
          {
            label: "Total Active Cells",
            value: MOCK_CELLS.length,
            icon: Shield,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Active Leaders",
            value: "14",
            icon: UserCheck,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
          {
            label: "Avg. Cell Growth",
            value: "+12.4%",
            icon: Activity,
            color: "text-purple-600",
            bg: "bg-purple-50",
          },
        ].map((stat, i) => (
          <Card key={i} className="border-none bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "h-12 w-12 rounded-2xl flex items-center justify-center",
                    stat.bg,
                    stat.color,
                  )}
                >
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    {stat.label}
                  </p>
                  <h3 className="text-2xl font-bold">{stat.value}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none bg-white">
        <CardHeader className="pb-4 border-b border-slate-50">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by cell name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 w-full rounded-xl border bg-slate-50 pl-10 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                <TableHead>Cell</TableHead>
                <TableHead>Leader</TableHead>
                <TableHead>Meeting Day</TableHead>
                <TableHead className="text-center">Members</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCells.map((cell) => {
                const memberCount = MOCK_MEMBERS.filter(
                  (m) => m.cellId === cell.id,
                ).length;

                return (
                  <TableRow key={cell.id} className="hover:bg-slate-50/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {cell.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold">{cell.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {cell.id}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-primary">
                        Alice Johnson
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        Saturdays, 5:00 PM
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="inline-flex items-center justify-center rounded-full bg-slate-100 px-3 py-1 text-sm font-bold">
                        {memberCount}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="success">ACTIVE</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/app/cells/${cell.id}`}
                        className="inline-flex h-10 px-4 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest items-center gap-2 hover:-translate-y-px transition-all"
                      >
                        Manage
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
