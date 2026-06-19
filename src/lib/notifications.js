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
export async function showLocalNotification(title, body) {
  if (Notification.permission !== "granted") return false;
  const reg = await navigator.serviceWorker.ready;
  reg.showNotification(title, {
    body,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: "ctfl-reminder", // evita acumular notificações duplicadas
  });
  return true;
}

export function daysSinceLastStudy(lastStudyDate) {
  if (!lastStudyDate) return null;
  const diff = Date.now() - new Date(lastStudyDate).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}
