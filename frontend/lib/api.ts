export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export async function getHealth() {
  const res = await fetch(`${API_BASE}/api/health`, { cache: "no-store" });
  if (!res.ok) throw new Error("Health check failed");
  return res.json();
}

export async function getCourses() {
  const res = await fetch(`${API_BASE}/api/courses`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch courses");
  return res.json();
}
