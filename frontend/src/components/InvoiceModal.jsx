import { Printer, X, CheckCircle } from "lucide-react";

export default function InvoiceModal({ booking, onClose }) {
  if (!booking) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        id="printable-invoice"
        className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl relative"
      >
        <div className="flex justify-between items-start border-b border-slate-200 pb-5 mb-5">
          <div>
            <h3 className="font-serif text-2xl font-bold text-slate-900">
              AURELIA GRAND
            </h3>
            <p className="text-xs text-slate-500">
              GST Tax Invoice & Cloud Reservation Receipt
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> PAID
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl text-sm mb-5">
          <div>
            <span className="text-xs text-slate-400 block">Booking ID</span>
            <strong className="text-slate-900">{booking.booking_id}</strong>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Suite Assigned</span>
            <strong className="text-slate-900">
              Room {booking.room_no} ({booking.room_type})
            </strong>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Guest Name</span>
            <strong className="text-slate-900">{booking.guest_name}</strong>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Contact</span>
            <strong className="text-slate-900">{booking.guest_phone}</strong>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Check-In</span>
            <strong className="text-slate-900">{booking.check_in}</strong>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Check-Out</span>
            <strong className="text-slate-900">{booking.check_out}</strong>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Accommodation ({booking.nights} Nights)</span>
            <span>₹{Number(booking.subtotal).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>CGST + SGST (12%)</span>
            <span>₹{Number(booking.gst).toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-bold text-base border-t border-slate-200 pt-2.5 text-slate-900">
            <span>Grand Total Paid</span>
            <span>₹{Number(booking.total_amount).toLocaleString()}</span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end gap-3 no-print">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-semibold hover:bg-slate-50 flex items-center gap-1"
          >
            <X className="w-4 h-4" /> Close
          </button>
          <button
            onClick={() => window.print()}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-semibold flex items-center gap-2"
          >
            <Printer className="w-4 h-4" /> Print / Save PDF
          </button>
        </div>
      </div>
    </div>
  );
}