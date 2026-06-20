import { Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer id="contacts" className="bg-brand-900 text-brand-100 mt-24">
      <div className="mx-auto max-w-6xl px-4 py-12 grid md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-serif text-xl mb-3">Гостиница</h3>
          <p className="text-sm text-brand-200/80">
            Уютные номера в Махачкале. Бронирование без предоплаты — мы перезвоним и
            подтвердим ваш заезд.
          </p>
        </div>
        <div className="space-y-2 text-sm">
          <h4 className="font-semibold text-brand-50 mb-2">Контакты</h4>
          <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> +7 (900) 123-45-67</p>
          <p className="flex items-center gap-2"><Mail className="w-4 h-4" /> info@hotel-mkala.ru</p>
          <p className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" /> Федеральное шоссе, 17А, Махачкала, Республика Дагестан, 367020</p>
        </div>
        <div className="space-y-2 text-sm">
          <h4 className="font-semibold text-brand-50 mb-2">Режим работы</h4>
          <p>Ресепшн: 24/7</p>
          <p>Заезд и выезд: в любое время</p>
        </div>
      </div>
      <div className="border-t border-brand-800 py-4 text-center text-xs text-brand-300">
        © {new Date().getFullYear()} Гостиница на Федеральном шоссе. Все права защищены.
      </div>
    </footer>
  );
}
