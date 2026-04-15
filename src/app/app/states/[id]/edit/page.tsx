"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/dashboard-cards";
import { ArrowLeft, Save, Landmark } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";
import { getState, updateState } from "@/lib/states-api";
import { Skeleton } from "@/components/ui/skeleton";
import { listMembers } from "@/lib/members-api";
import type { MemberRecord } from "@/types/models";
import { Combobox } from "@/components/ui/combobox";

export default function EditStatePage() {
  const router = useRouter();
  const params = useParams();
  const idParam = (params as { id?: string | string[] } | null)?.id;
  const raw = Array.isArray(idParam) ? idParam[0] : idParam;
  const idNum = raw ? Number.parseInt(raw, 10) : NaN;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState("");
  const [statePastorId, setStatePastorId] = useState("");
  const [leaders, setLeaders] = useState<MemberRecord[]>([]);
  const [isLoadingLeaders, setIsLoadingLeaders] = useState(true);

  const pastorNum = Number.parseInt(statePastorId, 10);
  const isValid = name.trim().length > 0 && Number.isFinite(pastorNum);

  useEffect(() => {
    void (async () => {
      try {
        const rows = await listMembers();
        setLeaders(rows);
      } catch {
        toast.error("Could not load members for pastor assignment.");
      } finally {
        setIsLoadingLeaders(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!Number.isFinite(idNum)) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    void (async () => {
      try {
        const row = await getState(idNum);
        if (cancelled) return;
        setName(row.name);
        setStatePastorId(String(row.state_pastor));
      } catch (error) {
        console.error("Failed to fetch state:", error);
        if (!cancelled) {
          toast.error("Failed to load state");
          router.push("/app/states");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [idNum, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !Number.isFinite(idNum)) return;
    setIsSaving(true);
    try {
      await updateState(idNum, {
        name: name.trim(),
        state_pastor: pastorNum,
      });
      toast.success("State updated", {
        description: "Changes have been saved.",
      });
      router.push(`/app/states/${idNum}`);
    } catch (error: unknown) {
      console.error("Save error:", error);
      const err = error as { response?: { data?: { detail?: string } } };
      const message =
        err.response?.data?.detail ?? "Failed to update state. Try again.";
      toast.error("Update failed", { description: String(message) });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
        <Skeleton className="h-5 w-32" />
        <Card className="border-none bg-white">
          <CardHeader className="space-y-3">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                key={`state-edit-skeleton-${i}`}
                className="h-10 w-full"
              />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between">
        <Link
          href={Number.isFinite(idNum) ? `/app/states/${idNum}` : "/app/states"}
          className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to state
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Edit state</h1>
        <p className="text-muted-foreground">
          Update the state name or state pastor assignment.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="border-none bg-white">
          <CardHeader className="border-b border-slate-50 mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Landmark className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>State details</CardTitle>
                <CardDescription>
                  Full update of this state record.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-12 px-4 rounded-lg border bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                State pastor <span className="text-destructive">*</span>
              </label>
              {isLoadingLeaders ? (
                <Skeleton className="h-12 w-full rounded-lg" />
              ) : (
                <Combobox
                  value={statePastorId}
                  onChange={setStatePastorId}
                  placeholder="Select pastor"
                  searchPlaceholder="Search pastors..."
                  options={leaders.map((member) => ({
                    value: String(member.id),
                    label: [member.first_name, member.last_name]
                      .filter(Boolean)
                      .join(" "),
                  }))}
                />
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4 pt-2">
          <Link
            href={
              Number.isFinite(idNum) ? `/app/states/${idNum}` : "/app/states"
            }
            className="px-6 py-3 rounded-xl border font-bold text-sm hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSaving || !isValid}
            className="cursor-pointer px-8 py-3 rounded-lg bg-primary text-primary-foreground font-bold text-sm flex items-center gap-2 hover:translate-y-[-2px] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all"
          >
            {isSaving ? (
              <Skeleton className="h-4 w-4 rounded-full bg-primary-foreground/40" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save changes
          </button>
        </div>
      </form>
    </div>
  );
}
