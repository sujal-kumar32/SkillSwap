export function getSessionStartEnd(session) {
  if (!session?.date) return null;

  const start = new Date(session.date);
  if (session.time) {
    const [h, m] = session.time.split(":").map(Number);
    start.setHours(h || 0, m || 0, 0, 0);
  }
  const duration = session.duration || 60;
  const end = new Date(start.getTime() + duration * 60000);
  return { start, end };
}

export function getSessionState(session) {
  if (!session || session.status !== "active") {
    if (session?.status === "completed") return "completed";
    if (session?.status === "cancelled") return "cancelled";
    return null;
  }

  const times = getSessionStartEnd(session);
  if (!times) return "upcoming";

  const now = new Date();

  const graceBefore = 5 * 60 * 1000;
  if (now < new Date(times.start.getTime() - graceBefore)) return "upcoming";
  if (now <= times.end) return "live";
  return "completed";
}
