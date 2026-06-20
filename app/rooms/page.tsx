import { getRooms } from "@/lib/rooms";
import { Users, Maximize2, Check } from "lucide-react";
import BookingForm from "@/components/BookingForm";

export const metadata = { title: "Номера — Гостиница" };
export const dynamic = "force-dynamic";

export default async function RoomsPage() {
  const rooms = await getRooms();
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="text-center mb-12">
        <p className="uppercase text-xs tracking-widest text-brand-600 mb-3">Каталог</p>
        <h1 className="font-serif text-5xl mb-4">Наши номера</h1>
        <p className="text-brand-800/70 max-w-2xl mx-auto">
          Выберите подходящий номер и оставьте заявку — мы перезвоним, чтобы подтвердить даты
          заезда. Предоплата не требуется.
        </p>
      </div>

      <div className="space-y-12">
        {rooms.map((r) => (
          <article
            key={r.id}
            id={r.id}
            className="grid md:grid-cols-2 gap-8 items-stretch bg-white rounded-3xl overflow-hidden shadow-sm border border-brand-200/60"
          >
            <div
              className="h-72 md:h-full md:min-h-[380px] bg-cover bg-center bg-brand-100"
              style={{ backgroundImage: `url('${r.image}')` }}
            />
            <div className="p-8 flex flex-col">
              <h2 className="font-serif text-3xl mb-2">{r.name}</h2>
              <p className="text-brand-800/80 mb-4">{r.description}</p>
              <div className="flex flex-wrap gap-4 text-sm text-brand-700 mb-4">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" /> до {r.capacity} гостей
                </span>
                <span className="flex items-center gap-1">
                  <Maximize2 className="w-4 h-4" /> {r.size} м²
                </span>
              </div>
              <ul className="grid grid-cols-2 gap-2 mb-6 text-sm">
                {r.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-brand-800/80">
                    <Check className="w-4 h-4 text-brand-600" /> {f}
                  </li>
                ))}
              </ul>
              <div className="mt-auto flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <span className="text-3xl font-serif text-brand-800">
                    {r.price.toLocaleString("ru-RU")} ₽
                  </span>
                  <span className="text-sm text-brand-600"> / ночь</span>
                </div>
                <a
                  href={`#book-${r.id}`}
                  className="px-6 py-3 rounded-full bg-brand-700 text-brand-50 hover:bg-brand-800 transition"
                >
                  Забронировать
                </a>
              </div>
            </div>
            <div id={`book-${r.id}`} className="md:col-span-2 border-t border-brand-200 bg-brand-50/60 p-8">
              <BookingForm roomId={r.id} roomName={r.name} roomCapacity={r.capacity} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
