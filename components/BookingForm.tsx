"use client";
import { useState, useMemo, useEffect } from "react";
import { CheckCircle2, Loader2, AlertCircle, CalendarOff } from "lucide-react";

type Props = { roomId: string; roomName: string; roomCapacity: number };

function formatPhone(digits: string): string {
  // digits: до 11 цифр, начинаются с 7
  const d = digits.slice(0, 11);
  const a = d.slice(1, 4);
  const b = d.slice(4, 7);
  const c = d.slice(7, 9);
  const e = d.slice(9, 11);
  let out = "+7";
  if (a) out += ` (${a}`;
  if (a.length === 3) out += ")";
  if (b) out += ` ${b}`;
  if (c) out += `-${c}`;
  if (e) out += `-${e}`;
  return out;
}

function extractDigits(value: string): string {
  let d = value.replace(/\D/g, "");
  if (!d) return "";
  // нормализуем: 8XXXXXXXXXX → 7XXXXXXXXXX, без префикса → 7XXX...
  if (d[0] === "8") d = "7" + d.slice(1);
  if (d[0] !== "7") d = "7" + d;
  return d.slice(0, 11);
}

const todayISO = () => new Date().toISOString().slice(0, 10);

function formatRu(iso: string): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y.slice(2)}`;
}

export default function BookingForm({ roomId, roomName, roomCapacity }: Props) {
  const [name, setName] = useState("");
  const [phoneDigits, setPhoneDigits] = useState(""); // 11 цифр
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [busyRanges, setBusyRanges] = useState<Array<{ checkIn: string; checkOut: string }>>([]);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/availability?roomId=${encodeURIComponent(roomId)}`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && d.ok && Array.isArray(d.ranges)) setBusyRanges(d.ranges);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [roomId]);

  const today = todayISO();
  const phoneDisplay = useMemo(() => formatPhone(phoneDigits), [phoneDigits]);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) e.name = "Укажите имя (минимум 2 символа).";
    if (phoneDigits.length !== 11) e.phone = "Введите телефон полностью.";
    if (checkIn && checkIn < today) e.checkIn = "Дата заезда не может быть в прошлом.";
    if (checkIn && checkOut && checkOut <= checkIn)
      e.checkOut = "Дата выезда должна быть позже даты заезда.";
    if (
      checkIn &&
      checkOut &&
      busyRanges.some((r) => r.checkIn < checkOut && r.checkOut > checkIn)
    )
      e.checkOut = "Эти даты уже заняты — выберите другие.";
    if (guests < 1) e.guests = "Минимум 1 гость.";
    if (guests > roomCapacity)
      e.guests = `В этом номере максимум ${roomCapacity} ${roomCapacity === 1 ? "гость" : "гостей"}.`;
    return e;
  }, [name, phoneDigits, checkIn, checkOut, guests, roomCapacity, today, busyRanges]);

  const isValid = Object.keys(errors).length === 0;

  function handlePhoneChange(value: string) {
    setPhoneDigits(extractDigits(value));
  }

  function handlePhoneKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && phoneDigits.length > 1) {
      e.preventDefault();
      setPhoneDigits(phoneDigits.slice(0, -1));
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ name: true, phone: true, checkIn: true, checkOut: true, guests: true });
    if (!isValid) return;
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          roomName,
          name: name.trim(),
          phone: "+" + phoneDigits,
          checkIn,
          checkOut,
          guests,
          comment,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Не удалось отправить заявку");
      }
      setStatus("ok");
      setName("");
      setPhoneDigits("");
      setCheckIn("");
      setCheckOut("");
      setComment("");
      setGuests(1);
      setTouched({});
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ошибка");
      setStatus("error");
    }
  }

  if (status === "ok") {
    return (
      <div className="flex items-start gap-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl p-6">
        <CheckCircle2 className="w-8 h-8 flex-shrink-0 text-emerald-600" />
        <div>
          <h3 className="font-serif text-2xl mb-1">Заявка принята!</h3>
          <p className="text-sm">
            Спасибо! Мы свяжемся с вами в течение 15 минут, чтобы подтвердить бронирование номера
            «{roomName}». Предоплата не требуется.
          </p>
          <button
            onClick={() => setStatus("idle")}
            className="mt-3 text-sm underline underline-offset-4"
          >
            Оформить ещё одну заявку
          </button>
        </div>
      </div>
    );
  }

  const showError = (key: string) => touched[key] && errors[key];

  return (
    <form onSubmit={onSubmit} noValidate className="grid md:grid-cols-2 gap-4">
      <div className="md:col-span-2">
        <h3 className="font-serif text-2xl mb-1">Бронирование: {roomName}</h3>
        <p className="text-sm text-brand-700/80 mb-2">
          Оставьте имя и номер телефона — мы перезвоним и подтвердим даты. Предоплата не требуется.
        </p>
      </div>

      <Field label="Ваше имя *" error={showError("name") ? errors.name : null}>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, name: true }))}
          placeholder="Иван Иванов"
          className="input"
        />
      </Field>

      <Field label="Телефон *" error={showError("phone") ? errors.phone : null}>
        <input
          required
          type="tel"
          inputMode="numeric"
          value={phoneDisplay}
          onChange={(e) => handlePhoneChange(e.target.value)}
          onKeyDown={handlePhoneKeyDown}
          onFocus={() => {
            if (!phoneDigits) setPhoneDigits("7");
          }}
          onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
          placeholder="+7 (___) ___-__-__"
          className="input"
        />
      </Field>

      <Field label="Дата заезда" error={showError("checkIn") ? errors.checkIn : null}>
        <input
          type="date"
          min={today}
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, checkIn: true }))}
          className="input"
        />
      </Field>

      <Field label="Дата выезда" error={showError("checkOut") ? errors.checkOut : null}>
        <input
          type="date"
          min={checkIn || today}
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, checkOut: true }))}
          className="input"
        />
      </Field>

      <Field
        label={`Гостей (макс. ${roomCapacity})`}
        error={showError("guests") ? errors.guests : null}
      >
        <input
          type="number"
          min={1}
          max={roomCapacity}
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
          onBlur={() => setTouched((t) => ({ ...t, guests: true }))}
          className="input"
        />
      </Field>

      {busyRanges.length > 0 && (
        <div className="md:col-span-2 -mt-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2">
          <CalendarOff className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Уже заняты:</strong>{" "}
            {busyRanges
              .map((r) => `${formatRu(r.checkIn)}–${formatRu(r.checkOut)}`)
              .join(", ")}
          </div>
        </div>
      )}

      <Field label="Комментарий" className="md:col-span-2">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="Особые пожелания (необязательно)"
          className="input resize-none"
        />
      </Field>

      <div className="md:col-span-2 flex items-center justify-between gap-4 flex-wrap">
        <p className="text-xs text-brand-700/70">
          Нажимая кнопку, вы соглашаетесь на обработку персональных данных.
        </p>
        <button
          type="submit"
          disabled={status === "loading" || !isValid}
          className="px-7 py-3 rounded-full bg-brand-700 text-brand-50 hover:bg-brand-800 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {status === "loading" && <Loader2 className="w-4 h-4 animate-spin" />}
          Отправить заявку
        </button>
      </div>
      {error && (
        <p className="md:col-span-2 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </p>
      )}

      <style>{`
        .input {
          width: 100%;
          padding: 0.65rem 0.9rem;
          border-radius: 0.75rem;
          border: 1px solid rgb(227 210 182);
          background: white;
          font-size: 0.95rem;
          outline: none;
          transition: border-color .15s, box-shadow .15s;
        }
        .input:focus { border-color: rgb(168 122 63); box-shadow: 0 0 0 3px rgb(168 122 63 / .15); }
        .input.invalid { border-color: rgb(220 38 38); }
      `}</style>
    </form>
  );
}

function Field({
  label,
  children,
  error,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  error?: string | null;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-sm font-medium text-brand-800 mb-1">{label}</span>
      {children}
      {error && (
        <span className="mt-1 text-xs text-red-600 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {error}
        </span>
      )}
    </label>
  );
}
