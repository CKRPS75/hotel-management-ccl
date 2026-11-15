import { useState, useMemo } from "react";
import { RefreshCw, SlidersHorizontal } from "lucide-react";
import RoomCard from "../components/RoomCard";

const FILTERS = ["ALL", "Available", "Standard", "Deluxe", "Executive"];

export default function GuestRoomsPage({ rooms, loading, onRefresh, onSelectRoom }) {
  const [filter, setFilter] = useState("ALL");

  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      if (filter === "ALL") return true;
      if (filter === "Available") return r.status === "Available";
      return r.room_type.toLowerCase().includes(filter.toLowerCase());
    });
  }, [rooms, filter]);

  return (
    <div className="space-y-8">
      {/* Luxury Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white shadow-lg">
        <img
          src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=80"
          alt="Aurelia Grand Hotel"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="relative p-8 sm:p-12 max-w-2xl">
          <span className="inline-block px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-semibold uppercase tracking-wider mb-4">
            Serverless Cloud Hospitality
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold leading-tight mb-3">
            Refined Comfort, Powered by AWS.
          </h2>
          <p className="text-slate-200 text-sm sm:text-base mb-6">
            Real-time suite inventory persisted in Amazon RDS MySQL with instant AWS Lambda billing and GST invoicing.
          </p>
          <button
            onClick={onRefresh}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-5 py-2.5 rounded-xl text-sm transition inline-flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Sync Live Availability
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Filter:
          </span>
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                filter === f
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              {f === "ALL" ? "All Suites" : f === "Available" ? "Available Only" : f}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-500 font-medium">
          Showing {filteredRooms.length} of {rooms.length} suites
        </p>
      </div>

      {/* Rooms Grid */}
      {filteredRooms.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-sm">
          {rooms.length === 0
            ? "Connect your AWS API Gateway Invoke URL in the top bar to load rooms from Amazon RDS."
            : "No rooms match the selected filter."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <RoomCard key={room.room_no} room={room} onBook={onSelectRoom} />
          ))}
        </div>
      )}
    </div>
  );
}