import { useState, useEffect } from "react";
import { Search, FileText } from "lucide-react";
import { hotelApi } from "../api/hotelApi";

export default function BookingLookupPage({ onOpenInvoice, notify }) {
  const [query, setQuery] = useState("");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const data = await hotelApi.getBookings(query);
      setBookings(data.bookings || []);
    } catch (err) {
      notify(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <h2 className="font-serif text-2xl font-bold mb-1">
          Find Your Reservation & GST Invoice
        </h2>
        <p className="text-sm text-slate-500 mb-5">
          Search by registered mobile number or Booking ID (e.g.,{" "}
          <code className="bg-slate-100 px-1.5 py-0.5 rounded">BK-1024</code>) to view or print your receipt.
        </p>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter Phone Number or Booking ID..."
              className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-slate-900"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>
      </div>

      <div className="space-y-4">
        {bookings.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-sm text-slate-500">
            No reservations found matching your search.
          </div>
        ) : (
          bookings.map((b) => (
            <div
              key={b.booking_id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-slate-900">{b.booking_id}</span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                      b.booking_status === "Active"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {b.booking_status}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-800">
                  {b.guest_name} ({b.guest_phone}) — Room {b.room_no} ({b.room_type})
                </p>
                <p className="text-xs text-slate-500">
                  {b.check_in} to {b.check_out} ({b.nights} Nights) • Paid ₹
                  {Number(b.total_amount).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => onOpenInvoice(b)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                View GST Invoice
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}