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
import {
  Landmark,
  MapPinned,
  Plus,
  Save,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { listStates, patchState } from "@/lib/states-api";
import { listAreas, patchArea } from "@/lib/areas-api";
import type { State } from "@/types/state";
import type { Area } from "@/types/area";
import { extractErrorMessage } from "@/lib/utils";
import { createMember, deleteMember, listMembers } from "@/lib/members-api";
import type { MemberRecord } from "@/types/models";
import { Combobox } from "@/components/ui/combobox";
import { listCells } from "@/lib/cells-api";
import { listZones } from "@/lib/zones-api";
import type { Cell } from "@/types/cell";
import type { Zone } from "@/types/zone";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";

export default function PastorsManagementPage() {
  const [states, setStates] = useState<State[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loadingStates, setLoadingStates] = useState(true);
  const [loadingAreas, setLoadingAreas] = useState(true);
  const [loadingPastors, setLoadingPastors] = useState(true);
  const [loadingCells, setLoadingCells] = useState(true);
  const [loadingZones, setLoadingZones] = useState(true);
  const [pastorOptions, setPastorOptions] = useState<MemberRecord[]>([]);
  const [cells, setCells] = useState<Cell[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [search, setSearch] = useState("");
  const [pastorSearch, setPastorSearch] = useState("");
  const [statePastorEdits, setStatePastorEdits] = useState<
    Record<number, string>
  >({});
  const [lgaPastorEdits, setLgaPastorEdits] = useState<Record<number, string>>(
    {},
  );
  const [savingStateId, setSavingStateId] = useState<number | null>(null);
  const [savingAreaId, setSavingAreaId] = useState<number | null>(null);
  const [isCreatingPastor, setIsCreatingPastor] = useState(false);
  const [pastorFirstName, setPastorFirstName] = useState("");
  const [pastorLastName, setPastorLastName] = useState("");
  const [pastorPhone, setPastorPhone] = useState("");
  const [pastorAddress, setPastorAddress] = useState("");
  const [pastorStateId, setPastorStateId] = useState("");
  const [pastorAreaId, setPastorAreaId] = useState("");
  const [pastorCellId, setPastorCellId] = useState("");
  const [pastorZoneId, setPastorZoneId] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MemberRecord | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

    void (async () => {
      setLoadingPastors(true);
      try {
        const members = await listMembers();
        setPastorOptions(members);
      } catch (error) {
        toast.error("Failed to load pastors", {
          description: extractErrorMessage(error),
        });
      } finally {
        setLoadingPastors(false);
      }
    })();

    void (async () => {
      setLoadingCells(true);
      setLoadingZones(true);
      try {
        const [cellRows, zoneRows] = await Promise.all([
          listCells(),
          listZones(),
        ]);
        setCells(cellRows);
        setZones(zoneRows);
      } catch (error) {
        toast.error("Failed to load units for pastor creation", {
          description: extractErrorMessage(error),
        });
      } finally {
        setLoadingCells(false);
        setLoadingZones(false);
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

  const managedPastors = useMemo(() => {
    const q = pastorSearch.trim().toLowerCase();
    const nonConvertMembers = pastorOptions.filter(
      (member) => member.status !== "NEW_CONVERT",
    );
    if (!q) return nonConvertMembers;
    return nonConvertMembers.filter((member) =>
      `${member.first_name} ${member.last_name ?? ""} ${member.phone_number} ${member.cell_name}`
        .toLowerCase()
        .includes(q),
    );
  }, [pastorOptions, pastorSearch]);

  const pastorCellNum = Number.parseInt(pastorCellId, 10);
  const pastorStateNum = Number.parseInt(pastorStateId, 10);
  const pastorAreaNum = Number.parseInt(pastorAreaId, 10);
  const pastorZoneNum = Number.parseInt(pastorZoneId, 10);
  const canCreatePastor =
    pastorFirstName.trim().length > 0 &&
    pastorPhone.trim().length >= 7 &&
    Number.isFinite(pastorCellNum);
  const pastorDropdownOptions = pastorOptions.map((member) => ({
    value: String(member.id),
    label: [member.first_name, member.last_name].filter(Boolean).join(" "),
  }));
  const filteredCreateAreas =
    Number.isFinite(pastorStateNum) && pastorStateId.trim() !== ""
      ? areas.filter((area) => area.state === pastorStateNum)
      : [];
  const filteredCreateZones =
    Number.isFinite(pastorAreaNum) && pastorAreaId.trim() !== ""
      ? zones.filter((zone) => zone.area === pastorAreaNum)
      : [];
  const filteredCreateCells =
    Number.isFinite(pastorZoneNum) && pastorZoneId.trim() !== ""
      ? cells.filter((cell) => cell.zone === pastorZoneNum)
      : [];

  useEffect(() => {
    if (!pastorAreaId) return;
    const selectedArea = areas.find((area) => String(area.id) === pastorAreaId);
    if (!selectedArea) {
      setPastorAreaId("");
      setPastorZoneId("");
      setPastorCellId("");
      return;
    }
    if (
      Number.isFinite(pastorStateNum) &&
      selectedArea.state !== pastorStateNum
    ) {
      setPastorAreaId("");
      setPastorZoneId("");
      setPastorCellId("");
    }
  }, [areas, pastorAreaId, pastorStateNum]);

  useEffect(() => {
    if (!pastorZoneId) return;
    const selectedZone = zones.find((zone) => String(zone.id) === pastorZoneId);
    if (!selectedZone) {
      setPastorZoneId("");
      setPastorCellId("");
      return;
    }
    if (Number.isFinite(pastorAreaNum) && selectedZone.area !== pastorAreaNum) {
      setPastorZoneId("");
      setPastorCellId("");
    }
  }, [zones, pastorZoneId, pastorAreaNum]);

  useEffect(() => {
    if (!pastorCellId) return;
    const selectedCell = cells.find((cell) => String(cell.id) === pastorCellId);
    if (!selectedCell) {
      setPastorCellId("");
      return;
    }
    if (Number.isFinite(pastorZoneNum) && selectedCell.zone !== pastorZoneNum) {
      setPastorCellId("");
    }
  }, [cells, pastorCellId, pastorZoneNum]);

  const assignedStatePastors = states.filter(
    (row) => row.state_pastor > 0,
  ).length;
  const assignedLgaPastors = areas.filter((row) => row.area_leader > 0).length;
  const totalPastors = pastorOptions.filter(
    (member) => member.status !== "NEW_CONVERT",
  ).length;

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
      toast.error("Select a valid State Pastor");
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
      toast.error("Select a valid LGA Pastor");
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

  const handleCreatePastor = async () => {
    if (!canCreatePastor) {
      toast.error("Complete pastor details before creating.");
      return;
    }
    setIsCreatingPastor(true);
    try {
      const created = await createMember({
        first_name: pastorFirstName.trim(),
        last_name: pastorLastName.trim() || undefined,
        phone_number: pastorPhone.trim(),
        residential_address: pastorAddress.trim() || undefined,
        cell: pastorCellNum,
        zone: Number.isFinite(pastorZoneNum) ? pastorZoneNum : undefined,
        status: "WORKER",
        integration_status: "INTEGRATED",
      });
      setPastorOptions((prev) => [created, ...prev]);
      setPastorFirstName("");
      setPastorLastName("");
      setPastorPhone("");
      setPastorAddress("");
      setPastorStateId("");
      setPastorAreaId("");
      setPastorCellId("");
      setPastorZoneId("");
      setIsCreateModalOpen(false);
      toast.success("Pastor created successfully.");
    } catch (error) {
      toast.error("Failed to create pastor", {
        description: extractErrorMessage(error),
      });
    } finally {
      setIsCreatingPastor(false);
    }
  };

  const onConfirmDeletePastor = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteMember(deleteTarget.id);
      setPastorOptions((prev) =>
        prev.filter((row) => row.id !== deleteTarget.id),
      );
      setStates((prev) =>
        prev.map((row) =>
          row.state_pastor === deleteTarget.id
            ? { ...row, state_pastor: 0 }
            : row,
        ),
      );
      setAreas((prev) =>
        prev.map((row) =>
          row.area_leader === deleteTarget.id
            ? { ...row, area_leader: 0 }
            : row,
        ),
      );
      toast.success("Pastor removed successfully.");
      setDeleteTarget(null);
    } catch (error) {
      toast.error("Failed to remove pastor", {
        description: extractErrorMessage(error),
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pastors</h1>
          <p className="text-muted-foreground mt-1">
            Create pastors, manage their records, and assign them to
            jurisdictions.
          </p>
        </div>
        <Button type="button" onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Create Pastor
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-none bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
                  Total pastors
                </p>
                <h2 className="text-2xl font-bold">
                  {loadingPastors ? (
                    <Skeleton className="h-7 w-10" />
                  ) : (
                    totalPastors
                  )}
                </h2>
              </div>
            </div>
          </CardContent>
        </Card>
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
        <CardHeader className="border-b border-slate-50 space-y-3">
          <h2 className="text-lg font-bold">Manage Pastors</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={pastorSearch}
              onChange={(e) => setPastorSearch(e.target.value)}
              placeholder="Search pastor name, phone or cell..."
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[360px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Cell</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingPastors ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={`pastor-skeleton-${i}`}>
                      <TableCell>
                        <Skeleton className="h-4 w-28" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="ml-auto h-8 w-16" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : managedPastors.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="py-8 text-center text-sm text-muted-foreground"
                    >
                      No pastors found.
                    </TableCell>
                  </TableRow>
                ) : (
                  managedPastors.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-semibold">
                        {[row.first_name, row.last_name]
                          .filter(Boolean)
                          .join(" ")}
                      </TableCell>
                      <TableCell>{row.phone_number}</TableCell>
                      <TableCell>{row.cell_name}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setDeleteTarget(row)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

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

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="border-none bg-white">
          <CardHeader className="border-b border-slate-50">
            <h2 className="text-lg font-bold">State Pastors</h2>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  <TableHead>State</TableHead>
                  <TableHead>State Pastor</TableHead>
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
                          {loadingPastors ? (
                            <Skeleton className="h-10 w-full" />
                          ) : (
                            <Combobox
                              value={getStatePastorValue(row)}
                              onChange={(value) =>
                                setStatePastorEdits((prev) => ({
                                  ...prev,
                                  [row.id]: value,
                                }))
                              }
                              placeholder="Select pastor"
                              searchPlaceholder="Search pastors..."
                              options={pastorDropdownOptions}
                            />
                          )}
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
                  <TableHead>LGA Pastor</TableHead>
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
                          {loadingPastors ? (
                            <Skeleton className="h-10 w-full" />
                          ) : (
                            <Combobox
                              value={getLgaPastorValue(row)}
                              onChange={(value) =>
                                setLgaPastorEdits((prev) => ({
                                  ...prev,
                                  [row.id]: value,
                                }))
                              }
                              placeholder="Select pastor"
                              searchPlaceholder="Search pastors..."
                              options={pastorDropdownOptions}
                            />
                          )}
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

      {isCreateModalOpen ? (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => {
              if (!isCreatingPastor) setIsCreateModalOpen(false);
            }}
            aria-label="Close create pastor modal"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-pastor-title"
            className="relative w-full max-w-3xl rounded-lg border bg-card p-6 md:p-8 shadow-2xl animate-in fade-in zoom-in duration-300"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3
                  id="create-pastor-title"
                  className="text-2xl font-bold tracking-tight"
                >
                  Create Pastor
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add a pastor profile with unit details for assignment.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setIsCreateModalOpen(false)}
                disabled={isCreatingPastor}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  value={pastorFirstName}
                  onChange={(e) => setPastorFirstName(e.target.value)}
                  placeholder="First name"
                />
                <Input
                  value={pastorLastName}
                  onChange={(e) => setPastorLastName(e.target.value)}
                  placeholder="Last name (optional)"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  value={pastorPhone}
                  onChange={(e) => setPastorPhone(e.target.value)}
                  placeholder="Phone number"
                />
                <Input
                  value={pastorAddress}
                  onChange={(e) => setPastorAddress(e.target.value)}
                  placeholder="Address (optional)"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {loadingStates ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Combobox
                    value={pastorStateId}
                    onChange={(value) => {
                      setPastorStateId(value);
                      setPastorAreaId("");
                      setPastorZoneId("");
                      setPastorCellId("");
                    }}
                    options={states.map((row) => ({
                      value: String(row.id),
                      label: row.name,
                    }))}
                    placeholder="Select state"
                    searchPlaceholder="Search states..."
                  />
                )}
                {loadingAreas ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Combobox
                    value={pastorAreaId}
                    onChange={(value) => {
                      setPastorAreaId(value);
                      setPastorZoneId("");
                      setPastorCellId("");
                    }}
                    options={filteredCreateAreas.map((row) => ({
                      value: String(row.id),
                      label: row.name,
                    }))}
                    placeholder="Select area"
                    searchPlaceholder="Search areas..."
                  />
                )}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {loadingZones ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Combobox
                    value={pastorZoneId}
                    onChange={(value) => {
                      setPastorZoneId(value);
                      setPastorCellId("");
                    }}
                    options={filteredCreateZones.map((row) => ({
                      value: String(row.id),
                      label: row.name,
                    }))}
                    placeholder="Select zone"
                    searchPlaceholder="Search zones..."
                  />
                )}
                {loadingCells ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Combobox
                    value={pastorCellId}
                    onChange={setPastorCellId}
                    options={filteredCreateCells.map((row) => ({
                      value: String(row.id),
                      label: row.name,
                    }))}
                    placeholder="Select cell"
                    searchPlaceholder="Search cells..."
                  />
                )}
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={isCreatingPastor}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => void handleCreatePastor()}
                  disabled={!canCreatePastor || isCreatingPastor}
                >
                  <Plus className="h-4 w-4" />
                  Create Pastor
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={onConfirmDeletePastor}
        title="Remove pastor?"
        description="This will remove the pastor record from members and clear linked assignments."
        itemName={
          deleteTarget
            ? [deleteTarget.first_name, deleteTarget.last_name]
                .filter(Boolean)
                .join(" ")
            : undefined
        }
        confirmLabel="Yes, remove"
        isLoading={deleteLoading}
      />
    </div>
  );
}
