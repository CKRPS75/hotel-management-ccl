import { useState, useEffect, useCallback } from "react";
import { Info } from "lucide-react";
import Navbar from "./components/Navbar";
import BookingModal from "./components/BookingModal";
import InvoiceModal from "./components/InvoiceModal";
import GuestRoomsPage from "./pages/GuestRoomsPage";
import BookingLookupPage from "./pages/BookingLookupPage";
import StaffDashboardPage from "./pages/StaffDashboardPage";
import { getApiBaseUrl, hotelApi } from "./api/hotelApi";

export default function App() {
  const [activeTab, setActiveTab] = useState("guest");
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [invoiceBooking, setInvoiceBooking] = useState(null);
  const [toast, setToast] = useState("");

  const notify = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  }, []);

  const fetchRooms = useCallback(async () => {
    if (!getApiBaseUrl()) return;
    setLoadingRooms(true);
    try {
      const data = await hotelApi.getRooms();
      setRooms(data.rooms || []);
    } catch (err) {
      notify(err.message);
    } finally {
      setLoadingRooms(false);
    }
  }, [notify]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onConnect={() => {
          notify("Connected to AWS API Gateway! Syncing RDS...");
          fetchRooms();
        }}
      />

      {toast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-3">
          <Info className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-sm">{toast}</span>
        </div>
      )}

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 flex-1">
        {activeTab === "guest" && (
          <GuestRoomsPage
            rooms={rooms}
            loading={loadingRooms}
            onRefresh={fetchRooms}
            onSelectRoom={setSelectedRoom}
          />
        )}

        {activeTab === "lookup" && (
          <BookingLookupPage
            onOpenInvoice={setInvoiceBooking}
            notify={notify}
          />
        )}

        {activeTab === "staff" && (
          <StaffDashboardPage
            rooms={rooms}
            onRoomsChanged={fetchRooms}
            onOpenInvoice={setInvoiceBooking}
            notify={notify}
          />
        )}
      </main>

      {selectedRoom && (
        <BookingModal
          room={selectedRoom}
          onClose={() => setSelectedRoom(null)}
          onSuccess={(newBooking) => {
            setSelectedRoom(null);
            fetchRooms();
            setInvoiceBooking(newBooking);
          }}
          notify={notify}
        />
      )}

      <InvoiceModal
        booking={invoiceBooking}
        onClose={() => setInvoiceBooking(null)}
      />
    </div>
  );
}