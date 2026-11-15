import { useState, useEffect } from "react";
import { Lock, PlusCircle, RefreshCw, LogOut } from "lucide-react";
import { hotelApi } from "../api/hotelApi";

export default function StaffDashboardPage({
  rooms,
  onRoomsChanged,
  onOpenInvoice,
  notify,
}) {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [bookings, setBookings] = useState([]);

  // Add Room Form State
  const [roomNo, setRoomNo] = useState("");
  const [roomType, setRoomType] = useState("Standard Queen");
  const [price, setPrice] = useState("");
  const [amenities, setAmenities] = useState("");

  const loadBookings = async () => {
    try {
      const res = await hotelApi.getBookings();
      setBookings(res.bookings || []);
    } catch (err) {
      notify(err.message);
    }
  };

  useEffect(() => {
    if (unlocked) {
      loadBookings();
      onRoomsChanged();
    }
  }, [unlocked]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await hotelApi.verifyStaffPin(pin);
      setUnlocked(true);
      notify("Staff Dashboard unlocked.");
    } catch (err) {
      notify(err.message);
    }
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    try {
      const res = await hotelApi.addRoom({
        room_no: roomNo,
        room_type: roomType,
        price_per_night: price,
        amenities: amenities || "Wi-Fi • Smart TV • King Bed",
      });
      notify(res.message);
      setRoomNo("");
      setPrice("");
      setAmenities("");
      onRoomsChanged();
    } catch (err) {
      notify(err.message);
    }
  };

  const handleCheckout = async (bookingId, roomNumber) => {
    try {
      const res = await hotelApi.checkoutGuest(bookingId, roomNumber);
      notify(res.message);
      loadBookings();
      onRoomsChanged();
    } catch (err) {
      notify(err.message);
    }
  };

  if (!unlocked) {
    return (
      <form
        onSubmit={handleLogin}
        className="max-w-md mx-auto bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center my-8"
      >
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="font-serif text-2xl font-bold mb-1">
          Reception & Staff Portal
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          Verified via AWS Lambda policy. Demo PIN:{" "}
          <strong className="text-slate-800">admin123</strong>
        </p>
        <input
          type="password"
          required
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="Enter Staff PIN"
          className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-center tracking-widest text-sm mb-4 focus:outline-none focus:border-slate-900"
        />
        <button
          type="submit"
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-xl text-sm transition"
        >
          Unlock Dashboard
        </button>
      </form>
    );
  }

  const occupiedCount = rooms.filter((r) => r.status === "Occupied").length;
  const activeCount = bookings.filter((b) => b.booking_status === "Active").length;
  const totalRevenue = bookings.reduce(
    (sum, b) => sum + Number(b.total_amount || 0),
    0
  );
  const occupancyPct = rooms.length
    ? Math.round((occupiedCount / rooms.length) * 100)
    : 0;

  return (
    <div className="space-y-8">
      {/* Live KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 uppercase font-semibold">
            Total Inventory
          </p>
          <p className="text-2xl font-bold mt-1">{rooms.length} Rooms</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 uppercase font-semibold">
            Occupancy Rate
          </p>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {occupancyPct}%
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 uppercase font-semibold">
            Active Guests
          </p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {activeCount}
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 uppercase font-semibold">
            Total Revenue (Incl. GST)
          </p>
          <p className="text-2xl font-bold mt-1">
            ₹{totalRevenue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Add New Room Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-base mb-4 flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-amber-600" />
          Add New Room to Amazon RDS Inventory
        </h3>
        <form
          onSubmit={handleAddRoom}
          className="grid grid-cols-1 sm:grid-cols-5 gap-3"
        >
          <input
            required
            value={roomNo}
            onChange={(e) => setRoomNo(e.target.value)}
            placeholder="Room No (e.g. 401)"
            className="border border-slate-300 rounded-xl px-3.5 py-2 text-sm"
          />
          <select
            value={roomType}
            onChange={(e) => setRoomType(e.target.value)}
            className="border border-slate-300 rounded-xl px-3.5 py-2 text-sm"
          >
            <option value="Standard Queen">Standard Queen</option>
            <option value="Deluxe King">Deluxe King</option>
            <option value="Executive Suite">Executive Suite</option>
            <option value="Royal Penthouse">Royal Penthouse</option>
          </select>
          <input
            required
            type="number"
            min="500"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Tariff / Night (₹)"
            className="border border-slate-300 rounded-xl px-3.5 py-2 text-sm"
          />
          <input
            value={amenities}
            onChange={(e) => setAmenities(e.target.value)}
            placeholder="Amenities (Wi-Fi • Pool...)"
            className="border border-slate-300 rounded-xl px-3.5 py-2 text-sm"
          />
          <button
            type="submit"
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-xl px-4 py-2 text-sm transition"
          >
            + Add Room
          </button>
        </form>
      </div>

      {/* Reservations Management Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-base">
            Reservations Ledger (Amazon RDS MySQL)
          </h3>
          <button
            onClick={() => {
              loadBookings();
              onRoomsChanged();
            }}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Sync DB
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Booking ID</th>
                <th className="px-6 py-3.5">Guest</th>
                <th className="px-6 py-3.5">Room</th>
                <th className="px-6 py-3.5">Stay Dates</th>
                <th className="px-6 py-3.5">Total Bill</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.map((b) => (
                <tr key={b.booking_id}>
                  <td className="px-6 py-4 font-bold">{b.booking_id}</td>
                  <td className="px-6 py-4">
                    {b.guest_name}
                    <br />
                    <span className="text-xs text-slate-400">
                      {b.guest_phone}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    Room {b.room_no} ({b.room_type})
                  </td>
                  <td className="px-6 py-4 text-xs">
                    {b.check_in} → {b.check_out} ({b.nights}N)
                  </td>
                  <td className="px-6 py-4 font-semibold">
                    ₹{Number(b.total_amount).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        b.booking_status === "Active"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {b.booking_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => onOpenInvoice(b)}
                      className="text-xs font-semibold text-slate-600 hover:underline"
                    >
                      Invoice
                    </button>
                    {b.booking_status === "Active" && (
                      <button
                        onClick={() => handleCheckout(b.booking_id, b.room_no)}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold inline-flex items-center gap-1"
                      >
                        <LogOut className="w-3 h-3" /> Check-Out
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}