import { Sparkles, BedDouble } from "lucide-react";

export default function RoomCard({ room, onBook }) {
  const isAvailable = room.status === "Available";

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col">
      <div className="relative h-56 overflow-hidden">
        <img
          src={room.image_url}
          alt={room.room_type}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <span className="absolute top-3.5 left-3.5 bg-slate-950/80 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
          <BedDouble className="w-3.5 h-3.5 text-amber-400" />
          Room {room.room_no}
        </span>
        <span
          className={`absolute top-3.5 right-3.5 px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
            isAvailable
              ? "bg-emerald-500 text-white"
              : "bg-rose-500 text-white"
          }`}
        >
          {room.status}
        </span>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-baseline gap-2 mb-2">
            <h3 className="font-serif text-xl font-bold text-slate-900">
              {room.room_type}
            </h3>
            <p className="text-lg font-bold text-amber-600 whitespace-nowrap">
              ₹{Number(room.price_per_night).toLocaleString()}
              <span className="text-xs text-slate-400 font-normal">/night</span>
            </p>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed mb-5 flex items-start gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
            <span>{room.amenities}</span>
          </p>
        </div>

        <button
          disabled={!isAvailable}
          onClick={() => onBook(room)}
          className={`w-full py-2.5 rounded-xl text-sm font-semibold transition ${
            isAvailable
              ? "bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }`}
        >
          {isAvailable ? "Reserve Suite" : "Currently Occupied"}
        </button>
      </div>
    </div>
  );
}