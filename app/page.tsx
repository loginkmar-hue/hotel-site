import Link from "next/link";
import { Coffee, Wifi, Car, Utensils, Sparkles, ShieldCheck, Phone, MapPin, BedDouble } from "lucide-react";
import { getRooms } from "@/lib/rooms";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featured = (await getRooms()).slice(0, 3);
  return (
    <>
      {/* Hero */}
      <section className="relative h-[80vh] min-h-[520px] flex items-center justify-center text-center text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/hero.jfif')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-900/80 via-brand-900/60 to-brand-900/85" />
        <div className="relative max-w-3xl px-6">
          <p className="uppercase tracking-[0.3em] text-sm text-brand-200 mb-4">Махачкала</p>
          <h1 className="font-serif text-5xl md:text-6xl leading-tight mb-6">
            Гостиница
          </h1>
          <p className="text-lg md:text-xl text-brand-100/90 mb-8">
            Уютные номера, ресепшн 24/7 и удобное расположение на Федеральном
            шоссе. Забронируйте без предоплаты — мы перезвоним вам в течение 15 минут.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/rooms"
              className="px-7 py-3 rounded-full bg-brand-50 text-brand-900 font-medium hover:bg-white transition"
            >
              Посмотреть номера
            </Link>
            <a
              href="#contacts"
              className="px-7 py-3 rounded-full border border-brand-100/60 hover:bg-white/10 transition"
            >
              Связаться с нами
            </a>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="mx-auto max-w-6xl px-4 py-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="uppercase text-xs tracking-widest text-brand-600 mb-3">О нас</p>
          <h2 className="font-serif text-4xl mb-6">Просто приехать и остаться</h2>
          <p className="text-brand-800/80 mb-4 leading-relaxed">
            Наша гостиница находится на Федеральном шоссе в Махачкале — удобно
            добираться на машине и останавливаться как проездом, так и на несколько дней.
            Мы продумали каждую деталь для вашего комфорта: мягкие кровати, тихие
            номера, бесплатный Wi-Fi и внимательный персонал 24/7.
          </p>
          <p className="text-brand-800/80 leading-relaxed">
            Будь то отдых вдвоём, семейная поездка или командировка — у нас найдётся подходящий
            номер.
          </p>
        </div>
        <div className="relative h-96 rounded-2xl overflow-hidden shadow-xl">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1551776235-dde6d482980b?auto=format&fit=crop&w=1200&q=80')",
            }}
          />
        </div>
      </section>

      {/* Services */}
      <section id="services" className="bg-white/60 border-y border-brand-200">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="text-center mb-12">
            <p className="uppercase text-xs tracking-widest text-brand-600 mb-3">Услуги</p>
            <h2 className="font-serif text-4xl">Всё для вашего отдыха</h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { icon: Wifi, title: "Бесплатный Wi-Fi", text: "Интернет во всех номерах." },
              { icon: Utensils, title: "Общая кухня", text: "Небольшая общая кухня для гостей — можно приготовить или разогреть еду." },
              { icon: Car, title: "Парковка", text: "Бесплатная охраняемая парковка для гостей." },
              { icon: Phone, title: "Поддержка 24/7", text: "Мы на связи в любое время дня и ночи." },
              { icon: MapPin, title: "Удобное расположение", text: "На Федеральном шоссе — легко добраться на машине." },
              { icon: BedDouble, title: "Чистые номера", text: "Ежедневная уборка и свежее бельё." },
            ].map((s, i) => (
              <div
                key={i}
                className="bg-brand-50 rounded-2xl p-6 border border-brand-200/60 hover:shadow-md transition"
              >
                <s.icon className="w-7 h-7 text-brand-600 mb-3" />
                <h3 className="font-serif text-xl mb-2">{s.title}</h3>
                <p className="text-sm text-brand-800/80">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured rooms */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <p className="uppercase text-xs tracking-widest text-brand-600 mb-3">Номера</p>
            <h2 className="font-serif text-4xl">Популярные варианты</h2>
          </div>
          <Link href="/rooms" className="text-brand-700 hover:text-brand-900 underline underline-offset-4">
            Смотреть все номера →
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {featured.map((r) => (
            <Link
              key={r.id}
              href={`/rooms#${r.id}`}
              className="group rounded-2xl overflow-hidden bg-white shadow-sm border border-brand-200/60 hover:shadow-lg transition"
            >
              <div
                className="h-56 bg-cover bg-center group-hover:scale-105 transition duration-500"
                style={{ backgroundImage: `url('${r.image}')` }}
              />
              <div className="p-5">
                <h3 className="font-serif text-2xl mb-1">{r.name}</h3>
                <p className="text-sm text-brand-800/70 mb-3 line-clamp-2">{r.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-brand-700 font-semibold">
                    от {r.price.toLocaleString("ru-RU")} ₽ / ночь
                  </span>
                  <span className="text-xs text-brand-600">до {r.capacity} гостей</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Booking promise */}
      <section className="bg-brand-700 text-brand-50">
        <div className="mx-auto max-w-6xl px-4 py-16 grid md:grid-cols-3 gap-8">
          {[
            { icon: ShieldCheck, title: "Без предоплаты", text: "Оплата на месте при заезде." },
            { icon: Phone, title: "Звонок за 15 минут", text: "Менеджер свяжется и подтвердит детали." },
            { icon: Sparkles, title: "Лучшая цена", text: "На сайте — без посреднических комиссий." },
          ].map((s, i) => (
            <div key={i} className="flex gap-4">
              <s.icon className="w-8 h-8 flex-shrink-0 text-brand-200" />
              <div>
                <h3 className="font-serif text-xl mb-1">{s.title}</h3>
                <p className="text-sm text-brand-100/80">{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
