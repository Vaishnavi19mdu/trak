const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
function getToken() {
  return localStorage.getItem("trak_token");
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export async function register(email, full_name, password) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, full_name, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Registration failed");
  localStorage.setItem("trak_token", data.access_token);
  return data;
}

export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Invalid email or password");
  localStorage.setItem("trak_token", data.access_token);
  return data;
}

export function logout() {
  localStorage.removeItem("trak_token");
}

// ── User ─────────────────────────────────────────────────────────────────────

export async function getMe() {
  const res = await fetch(`${BASE_URL}/users/me`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error("Not authenticated");
  return res.json();
}

export async function updateProfile(profileData) {
  const res = await fetch(`${BASE_URL}/users/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(profileData),
  });
  if (!res.ok) throw new Error("Failed to update profile");
  return res.json();
}

// ── Violations ────────────────────────────────────────────────────────────────

export async function getViolations() {
  const res = await fetch(`${BASE_URL}/violations/`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error("Failed to fetch violations");
  return res.json();
}

export async function addViolation(violation_id) {
  const res = await fetch(`${BASE_URL}/violations/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ violation_id }),
  });
  if (!res.ok) throw new Error("Failed to add violation");
  return res.json();
}

export async function clearViolations() {
  const res = await fetch(`${BASE_URL}/violations/`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error("Failed to clear violations");
}

// ── Risk Score ────────────────────────────────────────────────────────────────

export async function getRiskScore() {
  const res = await fetch(`${BASE_URL}/risk/score`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error("Failed to fetch risk score");
  return res.json();
}