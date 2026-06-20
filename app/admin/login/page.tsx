"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const search = useSearchParams();
  const from = search.get("from") || "/admin";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка входа");
      router.push(from);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <form
        onSubmit={onSubmit}
        className="bg-white rounded-2xl shadow-lg border border-brand-200 p-8 w-full max-w-sm"
      >
        <div className="flex items-center gap-2 mb-6">
          <Lock className="w-5 h-5 text-brand-600" />
          <h1 className="font-serif text-2xl">Вход в админку</h1>
        </div>
        <label className="block mb-4">
          <span className="block text-sm font-medium text-brand-800 mb-1">Пароль</span>
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-brand-200 focus:border-brand-500 outline-none"
          />
        </label>
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <button
          type="submit"
          disabled={loading || !password}
          className="w-full px-4 py-2.5 rounded-full bg-brand-700 text-brand-50 hover:bg-brand-800 disabled:opacity-60 transition flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Войти
        </button>
      </form>
    </div>
  );
}
