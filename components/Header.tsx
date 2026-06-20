"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, Hotel } from "lucide-react";

export default function Header() {
  const [open, setOpen] = useState(false);
  const links = [
    { href: "/#about", label: "О нас" },
    { href: "/rooms", label: "Номера" },
    { href: "/#services", label: "Услуги" },
    { href: "/#contacts", label: "Контакты" },
  ];
  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-brand-50/80 border-b border-brand-200">
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-serif text-xl text-brand-800">
          <Hotel className="w-6 h-6 text-brand-600" />
          Гостиница
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm hover:text-brand-600 transition">
              {l.label}
            </Link>
          ))}
          <Link
            href="/rooms"
            className="px-4 py-2 rounded-full bg-brand-700 text-brand-50 text-sm hover:bg-brand-800 transition"
          >
            Забронировать
          </Link>
        </nav>
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Меню">
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-brand-200 bg-brand-50">
          <div className="px-4 py-3 flex flex-col gap-3">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-sm">
                {l.label}
              </Link>
            ))}
            <Link
              href="/rooms"
              onClick={() => setOpen(false)}
              className="px-4 py-2 rounded-full bg-brand-700 text-brand-50 text-sm w-fit"
            >
              Забронировать
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
