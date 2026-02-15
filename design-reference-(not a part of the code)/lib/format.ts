export function truncateAddress(address: string): string {
  if (address.includes("...")) return address
  if (address.length <= 10) return address
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

export function formatSOL(amount: number): string {
  return `${amount.toFixed(2)} SOL`
}

export function relativeTime(isoDate: string): string {
  const now = Date.now()
  const date = new Date(isoDate).getTime()
  const diff = now - date

  if (diff < 0) {
    const absDiff = Math.abs(diff)
    if (absDiff < 3600000) return `in ${Math.floor(absDiff / 60000)}m`
    if (absDiff < 86400000) return `in ${Math.floor(absDiff / 3600000)}h`
    return `in ${Math.floor(absDiff / 86400000)}d`
  }

  if (diff < 60000) return "just now"
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`
  return new Date(isoDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function timeUntil(isoDate: string): string {
  const diff = new Date(isoDate).getTime() - Date.now()
  if (diff <= 0) return "Expired"
  const hours = Math.floor(diff / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

export function categoryColor(category: string): { bg: string; text: string } {
  const map: Record<string, { bg: string; text: string }> = {
    fitness: { bg: "bg-red-500/10", text: "text-red-400" },
    coding: { bg: "bg-blue-500/10", text: "text-blue-400" },
    reading: { bg: "bg-amber-500/10", text: "text-amber-400" },
    health: { bg: "bg-emerald-500/10", text: "text-emerald-400" },
    finance: { bg: "bg-cyan-500/10", text: "text-cyan-400" },
    custom: { bg: "bg-fuchsia-500/10", text: "text-fuchsia-400" },
  }
  return map[category] ?? map.custom
}

export function statusColor(status: string): { bg: string; text: string; dot: string } {
  const map: Record<string, { bg: string; text: string; dot: string }> = {
    active: { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400" },
    filling: { bg: "bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-400" },
    completed: { bg: "bg-blue-500/10", text: "text-blue-400", dot: "bg-blue-400" },
    settling: { bg: "bg-orange-500/10", text: "text-orange-400", dot: "bg-orange-400" },
  }
  return map[status] ?? map.active
}
