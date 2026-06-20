import type { Booking } from "./bookingsStore";

export async function notifyNewBooking(b: Booking): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const lines = [
    "🆕 *Новая заявка*",
    `Номер: ${b.roomName}`,
    `Имя: ${b.name}`,
    `Тел: ${b.phone}`,
    `Заезд: ${b.checkIn || "—"}`,
    `Выезд: ${b.checkOut || "—"}`,
    `Гостей: ${b.guests}`,
  ];
  if (b.comment) lines.push(`Комментарий: ${b.comment}`);

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: lines.join("\n"),
        parse_mode: "Markdown",
      }),
    });
  } catch (e) {
    console.error("[telegram] notify failed", e);
  }
}
