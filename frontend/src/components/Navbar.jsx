import { useState } from "react";
import { Crown, ShieldCheck, CheckCircle2, Cloud } from "lucide-react";
import { getApiBaseUrl, setApiBaseUrl } from "../api/hotelApi";

export default function Navbar({ activeTab, setActiveTab, onConnect }) {
  const [urlInput, setUrlInput] = useState(getApiBaseUrl());
  const [connected, setConnected] = useState(Boolean(getApiBaseUrl()));

  const handleSave = (e) => {
    e.preventDefault();
    const saved = setApiBaseUrl(urlInput);
    setConnected(Boolean(saved));
    onConnect(saved);
  };

  const navItems = [
    { id: "guest", label: "Explore Suites" },
    { id: "lookup", label: "My Bookings & Invoice" },
    { id: "staff", label: "Staff Portal", icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* AWS Endpoint Bar */}
      <div className="bg-slate-950 text-slate-300 text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Cloud className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-white">AWS 3-Service Stack:</span>
            <span>API Gateway + Lambda + RDS MySQL</span>
          </div>
          <form onSubmit={handleSave} className="flex items-center gap-2 flex-1 max-w-xl justify-end">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://xxxxxxxx.execute-api.us-east-1.amazonaws.com"
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1 text-white w-full max-w-sm focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-3 py-1 rounded-lg transition flex items-center gap-1"
            >
              {connected && <CheckCircle2 className="w-3.5 h-3.5" />}
              {connected ? "Connected" : "Connect"}
            </button>
          </form>
        </div>
      </div>

      {/* Main Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center shadow-sm">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold tracking-tight text-slate-900">
              AURELIA GRAND
            </h1>
            <p className="text-[11px] uppercase tracking-widest text-slate-500">
              Cloud Hospitality Suite
            </p>
          </div>
        </div>

        <nav className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          {navItems.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                  active
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {Icon && <Icon className="w-4 h-4 text-amber-600" />}
                {label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}