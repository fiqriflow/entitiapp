"use client";

import { useState } from "react";
import {
  deleteMabarEvent,
  toggleMabarStatus,
  approveParticipant,
  rejectParticipant,
  setCompletionOverride,
} from "@/app/admin/mabar/actions";
import MabarFormModal, { type MabarRow } from "./MabarFormModal";
import TemplatePickerModal, { type TemplateRow } from "./TemplatePickerModal";
import { saveEventAsTemplate } from "@/app/admin/mabar/template-actions";
import type { MabarInput } from "@/app/admin/mabar/actions";
import { formatRupiah, isMabarCompleted, levelRangeLabel } from "@/lib/constants";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export type PendingRow = {
  id: string;
  mabar_id: string;
  players: { full_name: string | null; nickname: string | null } | null;
};

export default function MabarListClient({
  events,
  pendingByMabar,
  templates,
}: {
  events: MabarRow[];
  pendingByMabar: Record<string, PendingRow[]>;
  templates: TemplateRow[];
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MabarRow | null>(null);
  const [prefill, setPrefill] = useState<Partial<MabarInput> | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [savingTemplateId, setSavingTemplateId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [overridingId, setOverridingId] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setPrefill(null);
    setModalOpen(true);
  };

  const openEdit = (event: MabarRow) => {
    setEditing(event);
    setPrefill(null);
    setModalOpen(true);
  };

  const handleSaveAsTemplate = async (event: MabarRow) => {
    const name = window.prompt(
      `Nama template untuk "${event.title}":`,
      event.title
    );
    if (!name || !name.trim()) return;
    setSavingTemplateId(event.id);
    await saveEventAsTemplate(event.id, name.trim());
    setSavingTemplateId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus mabar ini? Data peserta juga akan terhapus.")) return;
    setDeletingId(id);
    await deleteMabarEvent(id);
    setDeletingId(null);
  };

  const handleToggleStatus = async (event: MabarRow) => {
    setTogglingId(event.id);
    await toggleMabarStatus(
      event.id,
      event.status === "active" ? "closed" : "active"
    );
    setTogglingId(null);
  };

  const handleApprove = async (participantId: string) => {
    setProcessingId(participantId);
    await approveParticipant(participantId);
    setProcessingId(null);
  };

  const handleReject = async (participantId: string) => {
    setProcessingId(participantId);
    await rejectParticipant(participantId);
    setProcessingId(null);
  };

  const handleOverrideChange = async (
    event: MabarRow,
    value: "selesai" | "belum" | null
  ) => {
    setOverridingId(event.id);
    await setCompletionOverride(event.id, value);
    setOverridingId(null);
  };

  return (
    <div>
      <div className="flex justify-end gap-2">
        <button
          onClick={() => setPickerOpen(true)}
          className="rounded-lg border border-black/10 px-4 py-2.5 text-sm font-medium text-ink"
        >
          📁 Pakai Template
        </button>
        <button
          onClick={openCreate}
          className="rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white"
        >
          + Buat Mabar
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {events.map((ev) => {
          const pending = pendingByMabar[ev.id] ?? [];
          return (
            <div
              key={ev.id}
              className="rounded-xl border border-black/10 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="text-sm font-semibold text-ink">
                      {ev.title}
                    </p>
                    {ev.is_private && (
                      <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                        🔒 Privat
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-ink/50">
                    {formatDate(ev.event_date)} · {ev.start_time?.slice(0, 5)}
                    {ev.end_time ? `–${ev.end_time.slice(0, 5)}` : ""}
                  </p>
                  {ev.location && (
                    <p className="mt-0.5 text-xs text-ink/50">
                      📍 {ev.location}
                    </p>
                  )}
                  <p className="mt-0.5 text-xs font-medium text-brand-dark">
                    {formatRupiah(ev.price)}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <span className="rounded-full bg-neutral-100 px-1.5 py-0.5 text-[10px] text-ink/50">
                      {levelRangeLabel(ev.level_min, ev.level_max)}
                    </span>
                    {ev.gender_restriction && (
                      <span className="rounded-full bg-neutral-100 px-1.5 py-0.5 text-[10px] text-ink/50">
                        {ev.gender_restriction === "pria" ? "Man Only" : "Woman Only"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Toggle status */}
                <button
                  onClick={() => handleToggleStatus(ev)}
                  disabled={togglingId === ev.id}
                  className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-60 ${
                    ev.status === "active" ? "bg-brand" : "bg-neutral-300"
                  }`}
                  aria-label="Toggle status aktif"
                >
                  <span
                    className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                      ev.status === "active" ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <p className="mt-2 text-xs text-ink/60">
                {ev.status === "active" ? "Aktif" : "Ditutup"} ·{" "}
                {ev.joined_count}/{ev.max_slot} slot terisi
                {pending.length > 0 ? ` · ${pending.length} menunggu` : ""}
                {ev.price > 0
                  ? ` · ${ev.paid_count}/${ev.joined_count} lunas`
                  : ""}
                {ev.event_date <= todayStr()
                  ? ` · ${ev.checked_in_count}/${ev.joined_count} hadir`
                  : ""}
              </p>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
                <div
                  className="h-full rounded-full bg-brand"
                  style={{
                    width: `${Math.min(
                      100,
                      (ev.joined_count / ev.max_slot) * 100
                    )}%`,
                  }}
                />
              </div>

              <div className="mt-3 flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    isMabarCompleted(ev.event_date, ev.completion_override)
                      ? "bg-neutral-200 text-ink/60"
                      : "bg-brand-light text-brand-dark"
                  }`}
                >
                  {isMabarCompleted(ev.event_date, ev.completion_override)
                    ? "🏁 Selesai"
                    : "🏸 Berlangsung"}
                  {ev.completion_override ? " (manual)" : ""}
                </span>
                <select
                  value={ev.completion_override ?? "auto"}
                  onChange={(e) =>
                    handleOverrideChange(
                      ev,
                      e.target.value === "auto"
                        ? null
                        : (e.target.value as "selesai" | "belum")
                    )
                  }
                  disabled={overridingId === ev.id}
                  className="rounded-lg border border-black/10 px-2 py-1 text-[11px] text-ink/60 disabled:opacity-60"
                >
                  <option value="auto">Otomatis (ikut tanggal)</option>
                  <option value="selesai">Paksa: Selesai</option>
                  <option value="belum">Paksa: Belum Selesai</option>
                </select>
              </div>

              {pending.length > 0 && (
                <div className="mt-3 rounded-lg bg-amber-50 p-3">
                  <p className="text-xs font-medium text-amber-800">
                    Menunggu persetujuan ({pending.length})
                  </p>
                  <div className="mt-2 space-y-1.5">
                    {pending.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between gap-2 rounded-md bg-white px-2.5 py-1.5"
                      >
                        <span className="truncate text-xs text-ink">
                          {p.players?.nickname || p.players?.full_name || "Pemain"}
                        </span>
                        <div className="flex shrink-0 gap-1.5">
                          <button
                            onClick={() => handleApprove(p.id)}
                            disabled={processingId === p.id}
                            className="rounded-md bg-brand px-2 py-1 text-[10px] font-medium text-white disabled:opacity-60"
                          >
                            Terima
                          </button>
                          <button
                            onClick={() => handleReject(p.id)}
                            disabled={processingId === p.id}
                            className="rounded-md border border-red-200 px-2 py-1 text-[10px] font-medium text-red-600 disabled:opacity-60"
                          >
                            Tolak
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => openEdit(ev)}
                  className="flex-1 rounded-lg border border-black/10 py-2 text-xs font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleSaveAsTemplate(ev)}
                  disabled={savingTemplateId === ev.id}
                  className="flex-1 rounded-lg border border-black/10 py-2 text-xs font-medium disabled:opacity-60"
                >
                  {savingTemplateId === ev.id ? "..." : "💾 Template"}
                </button>
                <button
                  onClick={() => handleDelete(ev.id)}
                  disabled={deletingId === ev.id}
                  className="flex-1 rounded-lg border border-red-200 py-2 text-xs font-medium text-red-600"
                >
                  {deletingId === ev.id ? "Menghapus..." : "Hapus"}
                </button>
              </div>
            </div>
          );
        })}
        {events.length === 0 && (
          <p className="py-8 text-center text-sm text-ink/40">
            Belum ada mabar. Klik &quot;Buat Mabar&quot; untuk mulai.
          </p>
        )}
      </div>

      <MabarFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editing={editing}
        prefill={prefill}
      />

      <TemplatePickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        templates={templates}
        onPick={(values) => {
          setEditing(null);
          setPrefill(values);
          setModalOpen(true);
        }}
      />
    </div>
  );
}
