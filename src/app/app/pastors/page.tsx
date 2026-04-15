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
import { Landmark, MoreHorizontal, Plus, Search, Users, X } from "lucide-react";
import { listStates, patchState } from "@/lib/states-api";
import { listAreas } from "@/lib/areas-api";
import type { State } from "@/types/state";
import type { Area } from "@/types/area";
import { extractErrorMessage } from "@/lib/utils";
import {
  createMember,
  deleteMember,
  listMembers,
  updateMember,
} from "@/lib/members-api";
import type { MemberRecord } from "@/types/models";
import { Combobox } from "@/components/ui/combobox";
import { listCells } from "@/lib/cells-api";
import { listZones } from "@/lib/zones-api";
import type { Cell } from "@/types/cell";
import type { Zone } from "@/types/zone";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { useFormFields } from "@/hooks/use-form-fields";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const pastorFormInitialFields = {
  firstName: "",
  lastName: "",
  phone: "",
  address: "",
  stateId: "",
  areaId: "",
  zoneId: "",
  cellId: "",
};

export default function PastorsManagementPage() {
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [cells, setCells] = useState<Cell[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [search, setSearch] = useState("");
  const [viewTarget, setViewTarget] = useState<MemberRecord | null>(null);
  const [editTarget, setEditTarget] = useState<MemberRecord | null>(null);
  const {
    fields: createPastor,
    setField: setCreateField,
    setFields: setCreateFields,
    resetFields: resetCreateFields,
  } = useFormFields(pastorFormInitialFields);
  const {
    fields: editPastor,
    setField: setEditField,
    setFields: setEditFields,
  } = useFormFields(pastorFormInitialFields);
  const [isCreatingPastor, setIsCreatingPastor] = useState(false);
  const [isUpdatingPastor, setIsUpdatingPastor] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MemberRecord | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    void (async () => {
      setIsLoadingData(true);
      try {
        const [statesRows, areasRows, zoneRows, cellRows, memberRows] =
          await Promise.all([
            listStates(),
            listAreas(),
            listZones(),
            listCells(),
            listMembers(),
          ]);
        setStates(statesRows);
        setAreas(areasRows);
        setZones(zoneRows);
        setCells(cellRows);
        setMembers(memberRows);
      } catch (error) {
        toast.error("Failed to load pastors data", {
          description: extractErrorMessage(error),
        });
      } finally {
        setIsLoadingData(false);
      }
    })();
  }, []);

  const statePastorIds = useMemo(
    () => new Set(states.map((row) => row.state_pastor).filter((id) => id > 0)),
    [states],
  );

  const pastors = useMemo(() => {
    return members.filter(
      (member) => member.status === "WORKER" || statePastorIds.has(member.id),
    );
  }, [members, statePastorIds]);

  const filteredPastors = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return pastors;
    return pastors.filter((member) =>
      `${member.first_name} ${member.last_name ?? ""} ${member.phone_number} ${member.cell_name}`
        .toLowerCase()
        .includes(q),
    );
  }, [pastors, search]);

  const cellById = useMemo(
    () => new Map(cells.map((cell) => [cell.id, cell])),
    [cells],
  );
  const zoneById = useMemo(
    () => new Map(zones.map((zone) => [zone.id, zone])),
    [zones],
  );
  const areaById = useMemo(
    () => new Map(areas.map((area) => [area.id, area])),
    [areas],
  );
  const stateById = useMemo(
    () => new Map(states.map((state) => [state.id, state])),
    [states],
  );

  const getStateNameFromCellId = (cellId: number) => {
    const cell = cellById.get(cellId);
    const zoneId = cell?.zone;
    if (!zoneId) return "Not set";
    const zone = zoneById.get(zoneId);
    if (!zone) return "Not set";
    const area = areaById.get(zone.area);
    if (!area) return "Not set";
    return stateById.get(area.state)?.name ?? "Not set";
  };

  const pastorCellNum = Number.parseInt(createPastor.cellId, 10);
  const pastorStateNum = Number.parseInt(createPastor.stateId, 10);
  const pastorAreaNum = Number.parseInt(createPastor.areaId, 10);
  const pastorZoneNum = Number.parseInt(createPastor.zoneId, 10);
  const canCreatePastor =
    createPastor.firstName.trim().length > 0 &&
    createPastor.phone.trim().length >= 7 &&
    Number.isFinite(pastorCellNum);
  const filteredCreateAreas =
    Number.isFinite(pastorStateNum) && createPastor.stateId.trim() !== ""
      ? areas.filter((area) => area.state === pastorStateNum)
      : [];
  const filteredCreateZones =
    Number.isFinite(pastorAreaNum) && createPastor.areaId.trim() !== ""
      ? zones.filter((zone) => zone.area === pastorAreaNum)
      : [];
  const filteredCreateCells =
    Number.isFinite(pastorZoneNum) && createPastor.zoneId.trim() !== ""
      ? cells.filter((cell) => cell.zone === pastorZoneNum)
      : [];

  useEffect(() => {
    if (!createPastor.areaId) return;
    const selectedArea = areas.find(
      (area) => String(area.id) === createPastor.areaId,
    );
    if (!selectedArea) {
      setCreateFields({
        areaId: "",
        zoneId: "",
        cellId: "",
      });
      return;
    }
    if (
      Number.isFinite(pastorStateNum) &&
      selectedArea.state !== pastorStateNum
    ) {
      setCreateFields({
        areaId: "",
        zoneId: "",
        cellId: "",
      });
    }
  }, [areas, createPastor.areaId, pastorStateNum, setCreateFields]);

  useEffect(() => {
    if (!createPastor.zoneId) return;
    const selectedZone = zones.find(
      (zone) => String(zone.id) === createPastor.zoneId,
    );
    if (!selectedZone) {
      setCreateFields({
        zoneId: "",
        cellId: "",
      });
      return;
    }
    if (Number.isFinite(pastorAreaNum) && selectedZone.area !== pastorAreaNum) {
      setCreateFields({
        zoneId: "",
        cellId: "",
      });
    }
  }, [zones, createPastor.zoneId, pastorAreaNum, setCreateFields]);

  useEffect(() => {
    if (!createPastor.cellId) return;
    const selectedCell = cells.find(
      (cell) => String(cell.id) === createPastor.cellId,
    );
    if (!selectedCell) {
      setCreateField("cellId", "");
      return;
    }
    if (Number.isFinite(pastorZoneNum) && selectedCell.zone !== pastorZoneNum) {
      setCreateField("cellId", "");
    }
  }, [cells, createPastor.cellId, pastorZoneNum, setCreateField]);

  const canUpdatePastor =
    editPastor.firstName.trim().length > 0 &&
    editPastor.phone.trim().length >= 7 &&
    Number.isFinite(Number.parseInt(editPastor.zoneId, 10)) &&
    Number.isFinite(Number.parseInt(editPastor.cellId, 10));

  const editStateNum = Number.parseInt(editPastor.stateId, 10);
  const editAreaNum = Number.parseInt(editPastor.areaId, 10);
  const editZoneNum = Number.parseInt(editPastor.zoneId, 10);
  const filteredEditAreas =
    Number.isFinite(editStateNum) && editPastor.stateId.trim() !== ""
      ? areas.filter((area) => area.state === editStateNum)
      : [];
  const filteredEditZones =
    Number.isFinite(editAreaNum) && editPastor.areaId.trim() !== ""
      ? zones.filter((zone) => zone.area === editAreaNum)
      : [];
  const filteredEditCells =
    Number.isFinite(editZoneNum) && editPastor.zoneId.trim() !== ""
      ? cells.filter((cell) => cell.zone === editZoneNum)
      : [];

  useEffect(() => {
    if (!editPastor.areaId) return;
    const selectedArea = areas.find(
      (area) => String(area.id) === editPastor.areaId,
    );
    if (!selectedArea) {
      setEditFields({ areaId: "", zoneId: "", cellId: "" });
      return;
    }
    if (Number.isFinite(editStateNum) && selectedArea.state !== editStateNum) {
      setEditFields({ areaId: "", zoneId: "", cellId: "" });
    }
  }, [areas, editPastor.areaId, editStateNum, setEditFields]);

  useEffect(() => {
    if (!editPastor.zoneId) return;
    const selectedZone = zones.find(
      (zone) => String(zone.id) === editPastor.zoneId,
    );
    if (!selectedZone) {
      setEditFields({ zoneId: "", cellId: "" });
      return;
    }
    if (Number.isFinite(editAreaNum) && selectedZone.area !== editAreaNum) {
      setEditFields({ zoneId: "", cellId: "" });
    }
  }, [zones, editPastor.zoneId, editAreaNum, setEditFields]);

  useEffect(() => {
    if (!editPastor.cellId) return;
    const selectedCell = cells.find(
      (cell) => String(cell.id) === editPastor.cellId,
    );
    if (!selectedCell) {
      setEditField("cellId", "");
      return;
    }
    if (Number.isFinite(editZoneNum) && selectedCell.zone !== editZoneNum) {
      setEditField("cellId", "");
    }
  }, [cells, editPastor.cellId, editZoneNum, setEditField]);

  const openEditModal = (pastor: MemberRecord) => {
    const linkedCell = cells.find((cell) => cell.id === pastor.cell);
    const linkedZone = linkedCell?.zone
      ? zones.find((zone) => zone.id === linkedCell.zone)
      : undefined;
    const linkedArea = linkedZone
      ? areas.find((area) => area.id === linkedZone.area)
      : undefined;
    setEditTarget(pastor);
    setEditFields({
      firstName: pastor.first_name,
      lastName: pastor.last_name ?? "",
      phone: pastor.phone_number,
      address: pastor.residential_address ?? "",
      stateId: linkedArea ? String(linkedArea.state) : "",
      areaId: linkedArea ? String(linkedArea.id) : "",
      zoneId: linkedZone ? String(linkedZone.id) : "",
      cellId: String(pastor.cell),
    });
  };

  const handleCreatePastor = async () => {
    if (!canCreatePastor) {
      toast.error("Complete pastor details before creating.");
      return;
    }
    setIsCreatingPastor(true);
    try {
      const created = await createMember({
        first_name: createPastor.firstName.trim(),
        last_name: createPastor.lastName.trim() || undefined,
        phone_number: createPastor.phone.trim(),
        residential_address: createPastor.address.trim() || undefined,
        cell: pastorCellNum,
        zone: Number.isFinite(pastorZoneNum) ? pastorZoneNum : undefined,
        status: "WORKER",
        integration_status: "INTEGRATED",
      });
      setMembers((prev) => [created, ...prev]);
      resetCreateFields();
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

  const handleUpdatePastor = async () => {
    if (!editTarget || !canUpdatePastor) {
      toast.error("Complete pastor details before saving.");
      return;
    }
    setIsUpdatingPastor(true);
    const editZoneNumValue = Number.parseInt(editPastor.zoneId, 10);
    const editCellNumValue = Number.parseInt(editPastor.cellId, 10);
    const followUpNum = Number.parseInt(
      String(editTarget.follow_up_officer ?? ""),
      10,
    );
    try {
      const updated = await updateMember(editTarget.id, {
        first_name: editPastor.firstName.trim(),
        last_name: editPastor.lastName.trim() || undefined,
        zone: editZoneNumValue,
        cell: editCellNumValue,
        status: "WORKER",
        phone_number: editPastor.phone.trim(),
        residential_address: editPastor.address.trim() || undefined,
        nok_name: editTarget.nok_name || undefined,
        nok_phone: editTarget.nok_phone || undefined,
        date_joined: editTarget.date_joined || undefined,
        salvation_date: editTarget.salvation_date ?? undefined,
        how_won: editTarget.how_won || undefined,
        follow_up_officer: Number.isFinite(followUpNum) ? followUpNum : null,
        integration_status: editTarget.integration_status,
        initial_notes: editTarget.initial_notes || undefined,
      });
      setMembers((prev) =>
        prev.map((member) => (member.id === updated.id ? updated : member)),
      );
      setEditTarget(null);
      toast.success("Pastor updated successfully.");
    } catch (error) {
      toast.error("Failed to update pastor", {
        description: extractErrorMessage(error),
      });
    } finally {
      setIsUpdatingPastor(false);
    }
  };

  const onConfirmDeletePastor = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const linkedStates = states.filter(
        (row) => row.state_pastor === deleteTarget.id,
      );
      if (linkedStates.length > 0) {
        await Promise.all(
          linkedStates.map((row) => patchState(row.id, { state_pastor: 0 })),
        );
        setStates((prev) =>
          prev.map((row) =>
            row.state_pastor === deleteTarget.id
              ? { ...row, state_pastor: 0 }
              : row,
          ),
        );
      }
      await deleteMember(deleteTarget.id);
      setMembers((prev) => prev.filter((row) => row.id !== deleteTarget.id));
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
            Create, view, update, and delete pastor records.
          </p>
        </div>
        <Button type="button" onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Create Pastor
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
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
                  {isLoadingData ? (
                    <Skeleton className="h-7 w-10" />
                  ) : (
                    pastors.length
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
                  {isLoadingData ? (
                    <Skeleton className="h-7 w-10" />
                  ) : (
                    states.filter((row) => row.state_pastor > 0).length
                  )}
                </h2>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none bg-white">
        <CardHeader className="border-b border-slate-50 space-y-3">
          <h2 className="text-lg font-bold">Pastors Directory</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
                  <TableHead>State</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingData ? (
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
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="ml-auto h-8 w-36" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredPastors.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-8 text-center text-sm text-muted-foreground"
                    >
                      No pastors found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPastors.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-semibold">
                        {[row.first_name, row.last_name]
                          .filter(Boolean)
                          .join(" ")}
                      </TableCell>
                      <TableCell>{row.phone_number}</TableCell>
                      <TableCell>{row.cell_name}</TableCell>
                      <TableCell>{getStateNameFromCellId(row.cell)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="rounded-2xl h-11 w-11"
                            >
                              <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52">
                            <DropdownMenuItem
                              onClick={() => setViewTarget(row)}
                            >
                              View pastor
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openEditModal(row)}
                            >
                              Edit pastor
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteTarget(row)}
                            >
                              Delete pastor
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

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
                  value={createPastor.firstName}
                  onChange={(e) => setCreateField("firstName", e.target.value)}
                  placeholder="First name"
                />
                <Input
                  value={createPastor.lastName}
                  onChange={(e) => setCreateField("lastName", e.target.value)}
                  placeholder="Last name (optional)"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  value={createPastor.phone}
                  onChange={(e) => setCreateField("phone", e.target.value)}
                  placeholder="Phone number"
                />
                <Input
                  value={createPastor.address}
                  onChange={(e) => setCreateField("address", e.target.value)}
                  placeholder="Address (optional)"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {isLoadingData ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Combobox
                    value={createPastor.stateId}
                    onChange={(value) => {
                      setCreateFields({
                        stateId: value,
                        areaId: "",
                        zoneId: "",
                        cellId: "",
                      });
                    }}
                    options={states.map((row) => ({
                      value: String(row.id),
                      label: row.name,
                    }))}
                    placeholder="Select state"
                    searchPlaceholder="Search states..."
                  />
                )}
                {isLoadingData ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Combobox
                    value={createPastor.areaId}
                    onChange={(value) => {
                      setCreateFields({
                        areaId: value,
                        zoneId: "",
                        cellId: "",
                      });
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
                {isLoadingData ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Combobox
                    value={createPastor.zoneId}
                    onChange={(value) => {
                      setCreateFields({
                        zoneId: value,
                        cellId: "",
                      });
                    }}
                    options={filteredCreateZones.map((row) => ({
                      value: String(row.id),
                      label: row.name,
                    }))}
                    placeholder="Select zone"
                    searchPlaceholder="Search zones..."
                  />
                )}
                {isLoadingData ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Combobox
                    value={createPastor.cellId}
                    onChange={(value) => setCreateField("cellId", value)}
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

      {editTarget ? (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => {
              if (!isUpdatingPastor) setEditTarget(null);
            }}
            aria-label="Close edit pastor modal"
          />
          <div className="relative w-full max-w-3xl rounded-lg border bg-card p-6 md:p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold tracking-tight">
                  Edit Pastor
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Update pastor profile and assignment details.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setEditTarget(null)}
                disabled={isUpdatingPastor}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  value={editPastor.firstName}
                  onChange={(e) => setEditField("firstName", e.target.value)}
                  placeholder="First name"
                />
                <Input
                  value={editPastor.lastName}
                  onChange={(e) => setEditField("lastName", e.target.value)}
                  placeholder="Last name (optional)"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  value={editPastor.phone}
                  onChange={(e) => setEditField("phone", e.target.value)}
                  placeholder="Phone number"
                />
                <Input
                  value={editPastor.address}
                  onChange={(e) => setEditField("address", e.target.value)}
                  placeholder="Address (optional)"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Combobox
                  value={editPastor.stateId}
                  onChange={(value) =>
                    setEditFields({
                      stateId: value,
                      areaId: "",
                      zoneId: "",
                      cellId: "",
                    })
                  }
                  options={states.map((row) => ({
                    value: String(row.id),
                    label: row.name,
                  }))}
                  placeholder="Select state"
                  searchPlaceholder="Search states..."
                />
                <Combobox
                  value={editPastor.areaId}
                  onChange={(value) =>
                    setEditFields({
                      areaId: value,
                      zoneId: "",
                      cellId: "",
                    })
                  }
                  options={filteredEditAreas.map((row) => ({
                    value: String(row.id),
                    label: row.name,
                  }))}
                  placeholder="Select area"
                  searchPlaceholder="Search areas..."
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Combobox
                  value={editPastor.zoneId}
                  onChange={(value) =>
                    setEditFields({
                      zoneId: value,
                      cellId: "",
                    })
                  }
                  options={filteredEditZones.map((row) => ({
                    value: String(row.id),
                    label: row.name,
                  }))}
                  placeholder="Select zone"
                  searchPlaceholder="Search zones..."
                />
                <Combobox
                  value={editPastor.cellId}
                  onChange={(value) => setEditField("cellId", value)}
                  options={filteredEditCells.map((row) => ({
                    value: String(row.id),
                    label: row.name,
                  }))}
                  placeholder="Select cell"
                  searchPlaceholder="Search cells..."
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditTarget(null)}
                  disabled={isUpdatingPastor}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => void handleUpdatePastor()}
                  disabled={!canUpdatePastor || isUpdatingPastor}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {viewTarget ? (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setViewTarget(null)}
            aria-label="Close pastor details modal"
          />
          <div className="relative w-full max-w-xl rounded-lg border bg-card p-6 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold tracking-tight">
                  Pastor Details
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  View pastor profile and assignment details.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setViewTarget(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3 text-sm">
              <p>
                <span className="font-semibold">Name:</span>{" "}
                {[viewTarget.first_name, viewTarget.last_name]
                  .filter(Boolean)
                  .join(" ")}
              </p>
              <p>
                <span className="font-semibold">Phone:</span>{" "}
                {viewTarget.phone_number || "Not set"}
              </p>
              <p>
                <span className="font-semibold">Address:</span>{" "}
                {viewTarget.residential_address || "Not set"}
              </p>
              <p>
                <span className="font-semibold">Cell:</span>{" "}
                {viewTarget.cell_name || "Not set"}
              </p>
              <p>
                <span className="font-semibold">State:</span>{" "}
                {getStateNameFromCellId(viewTarget.cell)}
              </p>
              <p>
                <span className="font-semibold">Assigned State Pastor:</span>{" "}
                {states
                  .filter((row) => row.state_pastor === viewTarget.id)
                  .map((row) => row.name)
                  .join(", ") || "None"}
              </p>
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
