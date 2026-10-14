// Notificações locais (Web Notifications API) — sem servidor/push remoto.
// Suporte: Android/desktop bons; iOS PWA tem suporte limitado.

export function isNotificationSupported() {
  return "Notification" in window && "serviceWorker" in navigator;
}

export async function requestNotificationPermission() {
  if (!isNotificationSupported()) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  const result = await Notification.requestPermission();
  return result;
}

export function getNotificationPermission() {
  if (!isNotificationSupported()) return "unsupported";
  return Notification.permission;
}

// Mostra notificação local via Service Worker (mais confiável que `new Notification()`
// direto, especialmente em Android/Chrome)
// r10: `opts.data` viaja no notificationclick do sw.js — ex: { go: "quiz" }
// faz o clique navegar pra rota neutra /go/quiz (último cert usado).
export async function showLocalNotification(title, body, opts = {}) {
  if (Notification.permission !== "granted") return false;
  const reg = await navigator.serviceWorker.ready;
  reg.showNotification(title, {
    body,
    icon: "./icon-192.png",
    badge: "./icon-192.png",
    tag: "ctfl-reminder", // evita acumular notificações duplicadas
    ...(opts.data ? { data: opts.data } : {}),
  });
  return true;
}

export function daysSinceLastStudy(lastStudyDate) {
  if (!lastStudyDate) return null;
  const diff = Date.now() - new Date(lastStudyDate).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}
