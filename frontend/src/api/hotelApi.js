const STORAGE_KEY = "hotel_api_gateway_url";

export function getApiBaseUrl() {
  return localStorage.getItem(STORAGE_KEY) || "";
}

export function setApiBaseUrl(url) {
  const clean = url.trim().replace(/\/$/, "");
  localStorage.setItem(STORAGE_KEY, clean);
  return clean;
}

async function request(path, options = {}) {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new Error("Please connect your AWS API Gateway Invoke URL in the top bar first.");
  }

  const res = await fetch(`${baseUrl}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data;
}

export const hotelApi = {
  getRooms: () => request("/rooms"),
  addRoom: (payload) =>
    request("/rooms", { method: "POST", body: JSON.stringify(payload) }),
  createBooking: (payload) =>
    request("/book", { method: "POST", body: JSON.stringify(payload) }),
  getBookings: (query = "") =>
    request(`/bookings${query ? `?query=${encodeURIComponent(query)}` : ""}`),
  checkoutGuest: (booking_id, room_no) =>
    request("/checkout", {
      method: "PUT",
      body: JSON.stringify({ booking_id, room_no }),
    }),
  verifyStaffPin: (pin) =>
    request("/login", { method: "POST", body: JSON.stringify({ pin }) }),
};