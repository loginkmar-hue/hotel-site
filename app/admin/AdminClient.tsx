"use client";
import { useState, useRef } from "react";
import type { Room } from "@/lib/roomsStore";
import type { Booking, BookingStatus } from "@/lib/bookingsStore";
import { Plus, Pencil, Trash2, LogOut, Save, X, Loader2, Upload, Link2, ImageIcon, AlertCircle, BedDouble, Inbox, Phone, User, Calendar, MessageSquare, RefreshCw, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

type Props = { initialRooms: Room[]; initialBookings: Booking[] };

type Draft = Omit<Room, "features"> & { featuresStr: string };

const empty: Draft = {
  id: "",
  name: "",
  description: "",
  price: 0,
  capacity: 1,
  size: 0,
  image: "",
  featuresStr: "",
};

function toDraft(r: Room): Draft {
  return { ...r, featuresStr: r.features.join(", ") };
}

function fromDraft(d: Draft): Omit<Room, "id"> & { id?: string } {
  return {
    id: d.id || undefined,
    name: d.name.trim(),
    description: d.description.trim(),
    price: Number(d.price),
    capacity: Number(d.capacity),
    size: Number(d.size),
    image: d.image.trim(),
    features: d.featuresStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  };
}

export default function AdminClient({ initialRooms, initialBookings }: Props) {
  const [tab, setTab] = useState<"rooms" | "bookings" | "calendar">("bookings");
  const [bookingFilter, setBookingFilter] = useState<"active" | "archive">("active");
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [editing, setEditing] = useState<{ mode: "new" | "edit"; draft: Draft } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const newCount = bookings.filter((b) => b.status === "new").length;
  const activeBookings = bookings.filter((b) => b.status === "new" || b.status === "confirmed");
  const archiveBookings = bookings.filter((b) => b.status === "completed" || b.status === "cancelled");

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    location.href = "/";
  }

  async function refresh() {
    const res = await fetch("/api/admin/rooms");
    const data = await res.json();
    if (data.ok) setRooms(data.rooms);
  }

  async function refreshBookings() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/bookings");
      const data = await res.json();
      if (data.ok) setBookings(data.bookings);
    } finally {
      setBusy(false);
    }
  }

  async function changeBookingStatus(id: string, status: BookingStatus) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка");
      setBookings((prev) => prev.map((b) => (b.id === id ? data.booking : b)));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setBusy(false);
    }
  }

  async function removeBooking(id: string) {
    if (!confirm("Удалить заявку?")) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка");
      setBookings((prev) => prev.filter((b) => b.id !== id));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!editing) return;
    setBusy(true);
    setError(null);
    try {
      const payload = fromDraft(editing.draft);
      const url =
        editing.mode === "new" ? "/api/admin/rooms" : `/api/admin/rooms/${editing.draft.id}`;
      const method = editing.mode === "new" ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка сохранения");
      await refresh();
      setEditing(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Удалить этот номер?")) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/rooms/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка удаления");
      await refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-serif text-4xl">Админка</h1>
        <div className="flex gap-2">
          {tab === "rooms" && (
            <button
              onClick={() => setEditing({ mode: "new", draft: { ...empty } })}
              className="px-4 py-2 rounded-full bg-brand-700 text-brand-50 hover:bg-brand-800 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Добавить номер
            </button>
          )}
          {tab === "bookings" && (
            <button
              onClick={refreshBookings}
              disabled={busy}
              className="px-4 py-2 rounded-full border border-brand-300 hover:bg-brand-100 flex items-center gap-2 disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${busy ? "animate-spin" : ""}`} /> Обновить
            </button>
          )}
          <button
            onClick={logout}
            className="px-4 py-2 rounded-full border border-brand-300 hover:bg-brand-100 flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Выйти
          </button>
        </div>
      </div>

      <div className="flex gap-1 mb-6 border-b border-brand-200">
        <TabBtn active={tab === "bookings"} onClick={() => setTab("bookings")}>
          <Inbox className="w-4 h-4" /> Заявки
          {newCount > 0 && (
            <span className="ml-1 px-2 py-0.5 rounded-full bg-red-600 text-white text-xs">{newCount}</span>
          )}
        </TabBtn>
        <TabBtn active={tab === "calendar"} onClick={() => setTab("calendar")}>
          <CalendarDays className="w-4 h-4" /> Календарь
        </TabBtn>
        <TabBtn active={tab === "rooms"} onClick={() => setTab("rooms")}>
          <BedDouble className="w-4 h-4" /> Номера
        </TabBtn>
      </div>

      {error && <p className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}

      {tab === "bookings" && (
        <>
          <div className="flex gap-2 mb-4">
            <FilterBtn active={bookingFilter === "active"} onClick={() => setBookingFilter("active")}>
              Активные ({activeBookings.length})
            </FilterBtn>
            <FilterBtn active={bookingFilter === "archive"} onClick={() => setBookingFilter("archive")}>
              Архив ({archiveBookings.length})
            </FilterBtn>
          </div>
          <BookingsList
            bookings={bookingFilter === "active" ? activeBookings : archiveBookings}
            onChangeStatus={changeBookingStatus}
            onDelete={removeBooking}
            busy={busy}
          />
        </>
      )}

      {tab === "calendar" && <CalendarView rooms={rooms} bookings={bookings} />}

      {tab === "rooms" && (
      <div className="grid gap-4">
        {rooms.length === 0 && (
          <p className="text-brand-700/70 italic">Номеров пока нет — добавьте первый.</p>
        )}
        {rooms.map((r) => (
          <div
            key={r.id}
            className="bg-white border border-brand-200 rounded-2xl p-5 flex gap-5 items-start"
          >
            <div
              className="w-32 h-24 rounded-xl bg-cover bg-center flex-shrink-0"
              style={{ backgroundImage: `url('${r.image}')` }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2 flex-wrap">
                <h2 className="font-serif text-2xl">{r.name}</h2>
                <span className="text-sm text-brand-600">id: {r.id}</span>
              </div>
              <p className="text-sm text-brand-800/80 mt-1 line-clamp-2">{r.description}</p>
              <div className="flex flex-wrap gap-3 mt-2 text-sm text-brand-700">
                <span>{r.price.toLocaleString("ru-RU")} ₽/ночь</span>
                <span>· до {r.capacity} гостей</span>
                <span>· {r.size} м²</span>
                <span>· {r.features.length} удобств</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setEditing({ mode: "edit", draft: toDraft(r) })}
                className="p-2 rounded-lg border border-brand-200 hover:bg-brand-100"
                title="Редактировать"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => remove(r.id)}
                className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                title="Удалить"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start md:items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 my-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-2xl">
                {editing.mode === "new" ? "Новый номер" : `Редактирование: ${editing.draft.name}`}
              </h2>
              <button onClick={() => setEditing(null)} className="p-2 rounded-lg hover:bg-brand-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <DraftField label="Название *">
                <input
                  className="adminput"
                  value={editing.draft.name}
                  onChange={(e) =>
                    setEditing({ ...editing, draft: { ...editing.draft, name: e.target.value } })
                  }
                />
              </DraftField>
              <DraftField label="ID (необязательно)">
                <input
                  className="adminput"
                  placeholder="генерируется автоматически"
                  disabled={editing.mode === "edit"}
                  value={editing.draft.id}
                  onChange={(e) =>
                    setEditing({ ...editing, draft: { ...editing.draft, id: e.target.value } })
                  }
                />
              </DraftField>
              <DraftField label="Описание *" className="md:col-span-2">
                <textarea
                  rows={3}
                  className="adminput resize-none"
                  value={editing.draft.description}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      draft: { ...editing.draft, description: e.target.value },
                    })
                  }
                />
              </DraftField>
              <DraftField label="Цена за ночь, ₽ *">
                <input
                  type="number"
                  min={0}
                  className="adminput"
                  value={editing.draft.price}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      draft: { ...editing.draft, price: Number(e.target.value) },
                    })
                  }
                />
              </DraftField>
              <DraftField label="Вместимость, чел *">
                <input
                  type="number"
                  min={1}
                  className="adminput"
                  value={editing.draft.capacity}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      draft: { ...editing.draft, capacity: Number(e.target.value) },
                    })
                  }
                />
              </DraftField>
              <DraftField label="Площадь, м² *">
                <input
                  type="number"
                  min={1}
                  className="adminput"
                  value={editing.draft.size}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      draft: { ...editing.draft, size: Number(e.target.value) },
                    })
                  }
                />
              </DraftField>
              <div className="md:col-span-2">
                <ImageField
                  value={editing.draft.image}
                  onChange={(url) =>
                    setEditing({ ...editing, draft: { ...editing.draft, image: url } })
                  }
                />
              </div>
              <DraftField label="Удобства (через запятую)" className="md:col-span-2">
                <input
                  className="adminput"
                  placeholder="Wi-Fi, Кондиционер, Телевизор"
                  value={editing.draft.featuresStr}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      draft: { ...editing.draft, featuresStr: e.target.value },
                    })
                  }
                />
              </DraftField>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setEditing(null)}
                className="px-5 py-2 rounded-full border border-brand-300 hover:bg-brand-100"
              >
                Отмена
              </button>
              <button
                onClick={save}
                disabled={busy}
                className="px-5 py-2 rounded-full bg-brand-700 text-brand-50 hover:bg-brand-800 disabled:opacity-60 flex items-center gap-2"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .adminput {
          width: 100%;
          padding: 0.55rem 0.8rem;
          border-radius: 0.6rem;
          border: 1px solid rgb(227 210 182);
          background: white;
          font-size: 0.95rem;
          outline: none;
        }
        .adminput:focus { border-color: rgb(168 122 63); box-shadow: 0 0 0 3px rgb(168 122 63 / .15); }
        .adminput:disabled { background: rgb(241 233 220); cursor: not-allowed; }
      `}</style>
    </div>
  );
}

function DraftField({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-sm font-medium text-brand-800 mb-1">{label}</span>
      {children}
    </label>
  );
}

function ImageField({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUrl, setShowUrl] = useState(false);

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка загрузки");
      onChange(data.url);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-brand-800">Фотография *</span>
        <button
          type="button"
          onClick={() => setShowUrl((v) => !v)}
          className="text-xs text-brand-600 hover:text-brand-800 flex items-center gap-1"
        >
          <Link2 className="w-3 h-3" /> {showUrl ? "скрыть URL" : "вставить URL"}
        </button>
      </div>
      <div className="flex gap-3">
        <div
          className="w-36 h-28 rounded-xl border-2 border-dashed border-brand-300 bg-brand-50 flex items-center justify-center overflow-hidden flex-shrink-0"
          style={
            value
              ? { backgroundImage: `url('${value}')`, backgroundSize: "cover", backgroundPosition: "center" }
              : undefined
          }
        >
          {!value && <ImageIcon className="w-8 h-8 text-brand-400" />}
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 rounded-lg bg-brand-700 text-brand-50 hover:bg-brand-800 disabled:opacity-60 flex items-center justify-center gap-2 text-sm"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {value ? "Заменить фото" : "Загрузить фото"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="px-4 py-2 rounded-lg border border-brand-300 hover:bg-brand-100 text-sm text-brand-700"
            >
              Убрать фото
            </button>
          )}
          <p className="text-xs text-brand-700/70">JPG, PNG, WebP, GIF — до 5 МБ</p>
        </div>
      </div>
      {showUrl && (
        <input
          className="adminput mt-3"
          placeholder="https://..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {error && (
        <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 -mb-px border-b-2 text-sm font-medium flex items-center gap-2 transition ${
        active
          ? "border-brand-700 text-brand-800"
          : "border-transparent text-brand-600 hover:text-brand-800"
      }`}
    >
      {children}
    </button>
  );
}

const STATUS_LABELS: Record<BookingStatus, string> = {
  new: "Новая",
  confirmed: "Подтверждена",
  completed: "Завершена",
  cancelled: "Отменена",
};

const STATUS_STYLES: Record<BookingStatus, string> = {
  new: "bg-amber-100 text-amber-800 border-amber-300",
  confirmed: "bg-emerald-100 text-emerald-800 border-emerald-300",
  completed: "bg-blue-100 text-blue-800 border-blue-300",
  cancelled: "bg-stone-100 text-stone-700 border-stone-300",
};

function FilterBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-sm border transition ${
        active
          ? "bg-brand-700 text-brand-50 border-brand-700"
          : "bg-white text-brand-700 border-brand-300 hover:bg-brand-100"
      }`}
    >
      {children}
    </button>
  );
}

function BookingsList({
  bookings,
  onChangeStatus,
  onDelete,
  busy,
}: {
  bookings: Booking[];
  onChangeStatus: (id: string, s: BookingStatus) => void;
  onDelete: (id: string) => void;
  busy: boolean;
}) {
  if (bookings.length === 0) {
    return (
      <div className="text-center py-16 text-brand-700/70">
        <Inbox className="w-12 h-12 mx-auto mb-3 text-brand-400" />
        <p className="italic">Заявок пока нет.</p>
      </div>
    );
  }
  return (
    <div className="grid gap-4">
      {bookings.map((b) => (
        <div
          key={b.id}
          className="bg-white border border-brand-200 rounded-2xl p-5 grid md:grid-cols-3 gap-4"
        >
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium border ${STATUS_STYLES[b.status]}`}
              >
                {STATUS_LABELS[b.status]}
              </span>
              <span className="text-sm text-brand-700/70">
                {new Date(b.createdAt).toLocaleString("ru-RU")}
              </span>
            </div>
            <h3 className="font-serif text-xl mb-2">{b.roomName}</h3>
            <div className="grid sm:grid-cols-2 gap-2 text-sm text-brand-800">
              <p className="flex items-center gap-2">
                <User className="w-4 h-4 text-brand-600" /> {b.name}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-600" />
                <a href={`tel:${b.phone.replace(/\s/g, "")}`} className="hover:text-brand-900 underline underline-offset-4">
                  {b.phone}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-600" />
                {b.checkIn || "—"} → {b.checkOut || "—"}
              </p>
              <p className="flex items-center gap-2">
                <User className="w-4 h-4 text-brand-600" /> Гостей: {b.guests}
              </p>
            </div>
            {b.comment && (
              <p className="mt-3 text-sm text-brand-800/80 flex items-start gap-2 bg-brand-50 rounded-lg p-3">
                <MessageSquare className="w-4 h-4 text-brand-600 mt-0.5 flex-shrink-0" />
                {b.comment}
              </p>
            )}
          </div>
          <div className="flex md:flex-col gap-2 md:items-stretch">
            {b.status !== "confirmed" && (
              <button
                disabled={busy}
                onClick={() => onChangeStatus(b.id, "confirmed")}
                className="px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-sm disabled:opacity-60"
              >
                Подтвердить
              </button>
            )}
            {b.status !== "cancelled" && (
              <button
                disabled={busy}
                onClick={() => onChangeStatus(b.id, "cancelled")}
                className="px-3 py-2 rounded-lg border border-brand-300 hover:bg-brand-100 text-sm disabled:opacity-60"
              >
                Отменить
              </button>
            )}
            {b.status !== "new" && (
              <button
                disabled={busy}
                onClick={() => onChangeStatus(b.id, "new")}
                className="px-3 py-2 rounded-lg border border-brand-300 hover:bg-brand-100 text-sm disabled:opacity-60"
              >
                В новые
              </button>
            )}
            <button
              disabled={busy}
              onClick={() => onDelete(b.id)}
              className="px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-sm disabled:opacity-60 flex items-center justify-center gap-1"
            >
              <Trash2 className="w-4 h-4" /> Удалить
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const WEEKDAYS = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

function CalendarView({ rooms, bookings }: { rooms: Room[]; bookings: Booking[] }) {
  const [start, setStart] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const DAYS = 14;
  const todayStr = ymd(new Date());

  const days: Date[] = [];
  for (let i = 0; i < DAYS; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  const endStr = ymd(days[days.length - 1]);
  const startStr = ymd(days[0]);

  // только активные брони, пересекающиеся с видимым окном
  const visible = bookings.filter(
    (b) =>
      (b.status === "confirmed" || b.status === "new") &&
      b.checkIn &&
      b.checkOut &&
      b.checkIn <= endStr &&
      b.checkOut > startStr,
  );

  function shift(deltaDays: number) {
    const d = new Date(start);
    d.setDate(start.getDate() + deltaDays);
    setStart(d);
  }

  function bookingForCell(roomId: string, dayStr: string): Booking | undefined {
    return visible.find(
      (b) => b.roomId === roomId && b.checkIn <= dayStr && b.checkOut > dayStr,
    );
  }

  if (rooms.length === 0) {
    return (
      <p className="text-brand-700/70 italic">Сначала добавьте номера во вкладке «Номера».</p>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => shift(-DAYS)}
            className="p-2 rounded-lg border border-brand-300 hover:bg-brand-100"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              const d = new Date();
              d.setHours(0, 0, 0, 0);
              setStart(d);
            }}
            className="px-3 py-1.5 rounded-lg border border-brand-300 hover:bg-brand-100 text-sm"
          >
            Сегодня
          </button>
          <button
            onClick={() => shift(DAYS)}
            className="p-2 rounded-lg border border-brand-300 hover:bg-brand-100"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="text-sm text-brand-700">
          {days[0].toLocaleDateString("ru-RU")} — {days[DAYS - 1].toLocaleDateString("ru-RU")}
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-emerald-400 inline-block" /> подтверждена
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-amber-300 inline-block" /> новая
          </span>
        </div>
      </div>

      <div className="overflow-x-auto border border-brand-200 rounded-2xl bg-white">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 bg-brand-50 border-b border-r border-brand-200 px-3 py-2 text-left font-medium z-10 min-w-[160px]">
                Номер
              </th>
              {days.map((d) => {
                const isToday = ymd(d) === todayStr;
                const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                return (
                  <th
                    key={ymd(d)}
                    className={`border-b border-brand-200 px-1 py-2 font-normal min-w-[44px] ${
                      isToday ? "bg-brand-100" : isWeekend ? "bg-brand-50/60" : ""
                    }`}
                  >
                    <div className="text-xs text-brand-600">{WEEKDAYS[d.getDay()]}</div>
                    <div className={`text-base ${isToday ? "font-bold text-brand-800" : ""}`}>
                      {d.getDate()}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rooms.map((r) => (
              <tr key={r.id}>
                <td className="sticky left-0 bg-white border-r border-b border-brand-200 px-3 py-2 font-medium z-10">
                  <div className="truncate max-w-[200px]">{r.name}</div>
                  <div className="text-xs text-brand-600">до {r.capacity} гостей</div>
                </td>
                {days.map((d) => {
                  const dayStr = ymd(d);
                  const b = bookingForCell(r.id, dayStr);
                  const isToday = dayStr === todayStr;
                  const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                  let bg = isToday ? "bg-brand-50" : isWeekend ? "bg-stone-50" : "bg-white";
                  if (b) bg = b.status === "confirmed" ? "bg-emerald-400" : "bg-amber-300";
                  return (
                    <td
                      key={dayStr}
                      title={
                        b
                          ? `${b.name} • ${b.phone}\n${b.checkIn} → ${b.checkOut}\n${STATUS_LABELS[b.status]}`
                          : "Свободно"
                      }
                      className={`border-b border-brand-200 ${bg} h-12 align-middle text-center text-xs`}
                    >
                      {b && d.getDate() === new Date(b.checkIn + "T00:00:00").getDate() && (
                        <span className="px-1 truncate text-white font-medium">{b.name.split(" ")[0]}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-brand-700/70">
        Наведите на ячейку — увидите имя, телефон и даты. Стрелки сверху листают по 14 дней.
      </p>
    </div>
  );
}
