"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/dashboard-cards";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Landmark, MapPinned, Save, Search } from "lucide-react";
import { listStates, patchState } from "@/lib/states-api";
import { listAreas, patchArea } from "@/lib/areas-api";
import type { State } from "@/types/state";
import type { Area } from "@/types/area";
import { extractErrorMessage } from "@/lib/utils";

export default function PastorsManagementPage() {
  const [states, setStates] = useState<State[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loadingStates, setLoadingStates] = useState(true);
  const [loadingAreas, setLoadingAreas] = useState(true);
  const [search, setSearch] = useState("");
  const [statePastorEdits, setStatePastorEdits] = useState<
    Record<number, string>
  >({});
  const [lgaPastorEdits, setLgaPastorEdits] = useState<Record<number, string>>(
    {},
  );
  const [savingStateId, setSavingStateId] = useState<number | null>(null);
  const [savingAreaId, setSavingAreaId] = useState<number | null>(null);

  useEffect(() => {
    void (async () => {
      setLoadingStates(true);
      setLoadingAreas(true);
      try {
        const [statesRows, areasRows] = await Promise.all([
          listStates(),
          listAreas(),
        ]);
        setStates(statesRows);
        setAreas(areasRows);
      } catch (error) {
        toast.error("Failed to load pastor assignments", {
          description: extractErrorMessage(error),
        });
      } finally {
        setLoadingStates(false);
        setLoadingAreas(false);
      }
    })();
  }, []);

  const filteredStates = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return states;
    return states.filter((row) => row.name.toLowerCase().includes(q));
  }, [search, states]);

  const filteredAreas = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return areas;
    return areas.filter(
      (row) =>
        row.name.toLowerCase().includes(q) ||
        row.state_name.toLowerCase().includes(q),
    );
  }, [search, areas]);

  const assignedStatePastors = states.filter(
    (row) => row.state_pastor > 0,
  ).length;
  const assignedLgaPastors = areas.filter((row) => row.area_leader > 0).length;

  const getStatePastorValue = (row: State) => {
    const draft = statePastorEdits[row.id];
    return draft ?? String(row.state_pastor ?? "");
  };

  const getLgaPastorValue = (row: Area) => {
    const draft = lgaPastorEdits[row.id];
    return draft ?? String(row.area_leader ?? "");
  };

  const saveStatePastor = async (row: State) => {
    const raw = getStatePastorValue(row).trim();
    const pastorId = Number.parseInt(raw, 10);
    if (!Number.isFinite(pastorId) || pastorId < 0) {
      toast.error("Enter a valid State Pastor ID");
      return;
    }
    setSavingStateId(row.id);
    try {
      const updated = await patchState(row.id, { state_pastor: pastorId });
      setStates((prev) =>
        prev.map((item) => (item.id === row.id ? updated : item)),
      );
      setStatePastorEdits((prev) => {
        const next = { ...prev };
        delete next[row.id];
        return next;
      });
      toast.success(`Updated ${row.name} assignment`);
    } catch (error) {
      toast.error("Failed to update State Pastor", {
        description: extractErrorMessage(error),
      });
    } finally {
      setSavingStateId(null);
    }
  };

  const saveLgaPastor = async (row: Area) => {
    const raw = getLgaPastorValue(row).trim();
    const pastorId = Number.parseInt(raw, 10);
    if (!Number.isFinite(pastorId) || pastorId < 0) {
      toast.error("Enter a valid LGA Pastor ID");
      return;
    }
    setSavingAreaId(row.id);
    try {
      const updated = await patchArea(row.id, { area_leader: pastorId });
      setAreas((prev) =>
        prev.map((item) => (item.id === row.id ? updated : item)),
      );
      setLgaPastorEdits((prev) => {
        const next = { ...prev };
        delete next[row.id];
        return next;
      });
      toast.success(`Updated ${row.name} assignment`);
    } catch (error) {
      toast.error("Failed to update LGA Pastor", {
        description: extractErrorMessage(error),
      });
    } finally {
      setSavingAreaId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Pastors & LGA Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Assign State Pastors and LGA Pastors to their jurisdictions.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-none bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Landmark className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
                  States with pastors
                </p>
                <h2 className="text-2xl font-bold">
                  {loadingStates ? (
                    <Skeleton className="h-7 w-10" />
                  ) : (
                    assignedStatePastors
                  )}
                </h2>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <MapPinned className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
                  LGAs with pastors
                </p>
                <h2 className="text-2xl font-bold">
                  {loadingAreas ? (
                    <Skeleton className="h-7 w-10" />
                  ) : (
                    assignedLgaPastors
                  )}
                </h2>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none bg-white">
        <CardHeader className="border-b border-slate-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search state or LGA..."
              className="pl-10"
            />
          </div>
        </CardHeader>
      </Card>

      <Card className="border-none bg-white">
        <CardHeader className="border-b border-slate-50">
          <h2 className="text-lg font-bold">State Pastors</h2>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                <TableHead>State</TableHead>
                <TableHead>State Pastor ID</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingStates
                ? Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={`state-skeleton-${i}`}>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-10 w-28" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="ml-auto h-9 w-20" />
                      </TableCell>
                    </TableRow>
                  ))
                : filteredStates.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-semibold">
                        {row.name}
                      </TableCell>
                      <TableCell className="w-44">
                        <Input
                          type="number"
                          min={0}
                          value={getStatePastorValue(row)}
                          onChange={(e) =>
                            setStatePastorEdits((prev) => ({
                              ...prev,
                              [row.id]: e.target.value,
                            }))
                          }
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => void saveStatePastor(row)}
                          disabled={savingStateId === row.id}
                        >
                          <Save className="h-4 w-4" />
                          Save
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-none bg-white">
        <CardHeader className="border-b border-slate-50">
          <h2 className="text-lg font-bold">LGA Pastors</h2>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                <TableHead>LGA</TableHead>
                <TableHead>State</TableHead>
                <TableHead>LGA Pastor ID</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingAreas
                ? Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={`area-skeleton-${i}`}>
                      <TableCell>
                        <Skeleton className="h-4 w-28" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-28" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-10 w-28" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="ml-auto h-9 w-20" />
                      </TableCell>
                    </TableRow>
                  ))
                : filteredAreas.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-semibold">
                        {row.name}
                      </TableCell>
                      <TableCell>{row.state_name}</TableCell>
                      <TableCell className="w-44">
                        <Input
                          type="number"
                          min={0}
                          value={getLgaPastorValue(row)}
                          onChange={(e) =>
                            setLgaPastorEdits((prev) => ({
                              ...prev,
                              [row.id]: e.target.value,
                            }))
                          }
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => void saveLgaPastor(row)}
                          disabled={savingAreaId === row.id}
                        >
                          <Save className="h-4 w-4" />
                          Save
                        </Button>
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
