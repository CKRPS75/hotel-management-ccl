import { useState, useMemo } from "react";
import { X, Calendar, CreditCard } from "lucide-react";
import { hotelApi } from "../api/hotelApi";

export default function BookingModal({ room, onClose, onSuccess, notify }) {
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [submitting, setSubmitting] = useState(false);

  const billing = useMemo(() => {
    const rate = Number(room.price_per_night || 0);
    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    const nights = Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));
    const subtotal = rate * nights;
    const gst = Math.round(subtotal * 0.12);
    const total = subtotal + gst;
    return { rate, nights, subtotal, gst, total };
  }, [room, checkIn, checkOut]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await hotelApi.createBooking({
        room_no: room.room_no,
        guest_name: guestName,
        guest_phone: guestPhone,
        check_in: checkIn,
        check_out: checkOut,
        nights: billing.nights,
      });
      notify(`Reservation ${res.booking.booking_id} confirmed in Amazon RDS!`);
      onSuccess(res.booking);
    } catch (err) {
      notify(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700"
        >
          <X className="w-5 h-5" />
        </button>

        <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
          Instant Cloud Reservation
        </span>
        <h3 className="font-serif text-2xl font-bold mt-1 mb-5">
          Room {room.room_no} — {room.room_type}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Guest Full Name
              </label>
              <input
                required
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="e.g. Rushil Shitut"
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Mobile Number
              </label>
              <input
                required
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Check-In Date
              </label>
              <input
                type="date"
                required
                value={checkIn}
                min={today}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Check-Out Date
              </label>
              <input
                type="date"
                required
                value={checkOut}
                min={checkIn}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          {/* Dynamic Tariff + GST Breakdown */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>
                Room Tariff ({billing.nights} Night{billing.nights > 1 ? "s" : ""} × ₹
                {billing.rate.toLocaleString()})
              </span>
              <span>₹{billing.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>GST (12%)</span>
              <span>₹{billing.gst.toLocaleString()}</span>
            </div>
            <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-base text-slate-900">
              <span>Total Payable</span>
              <span>₹{billing.total.toLocaleString()}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-semibold py-3 rounded-xl text-sm transition flex items-center justify-center gap-2"
          >
            <CreditCard className="w-4 h-4 text-amber-400" />
            {submitting ? "Processing in AWS Lambda..." : "Confirm & Pay Now"}
          </button>
        </form>
      </div>
    </div>
  );
}