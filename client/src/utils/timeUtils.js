export function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatDayHeader(date) {
  const msgDate = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (msgDate.toDateString() === today.toDateString()) return "Today";
  if (msgDate.toDateString() === yesterday.toDateString()) return "Yesterday";

  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 6);
  if (msgDate >= weekAgo) {
    return msgDate.toLocaleDateString("en-US", { weekday: "long" });
  }

  if (msgDate.getFullYear() === today.getFullYear()) {
    return msgDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  return msgDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
