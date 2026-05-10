export function formatDeadline(date: Date): string {
  const d = new Date(date);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return d.toLocaleDateString("en-US", options);
}

export function daysUntilDeadline(deadline: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const deadlineDate = new Date(deadline);
  deadlineDate.setHours(0, 0, 0, 0);
  
  const diffTime = deadlineDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

export function getDeadlineStatus(deadline: Date): "expired" | "today" | "tomorrow" | "soon" | "upcoming" {
  const days = daysUntilDeadline(deadline);
  
  if (days < 0) return "expired";
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days <= 7) return "soon";
  return "upcoming";
}

export function getDeadlineColor(status: "expired" | "today" | "tomorrow" | "soon" | "upcoming"): string {
  switch (status) {
    case "expired":
      return "text-red-400";
    case "today":
      return "text-orange-400";
    case "tomorrow":
      return "text-amber-400";
    case "soon":
      return "text-yellow-300";
    default:
      return "text-green-400";
  }
}
