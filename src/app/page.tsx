"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [eventName, setEventName] = useState("");
  const [baseScore, setBaseScore] = useState(1);
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function createEvent() {
    setLoading(true);
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: eventName, baseScore }),
    });
    const data = await res.json();
    setLoading(false);
    router.push(`/event/${data.event.id}?pin=${data.event.hostPin}`);
  }

  function joinEvent() {
    if (joinCode.trim()) {
      router.push(`/event/${joinCode.trim()}`);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="mahjong-header -mx-4 px-6 pt-10 pb-8 text-center text-white rounded-b-3xl shadow-lg">
        <div className="text-5xl mb-2">🀄</div>
        <h1 className="text-3xl font-bold tracking-tight">Mahjong Event</h1>
        <p className="text-red-200 text-sm mt-1 tracking-wide">Sichuan 血战到底</p>
      </div>

      {/* Create event */}
      <div className="mahjong-card p-5 space-y-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <span className="w-1 h-5 bg-[#c41e3a] rounded-full inline-block"></span>
          Create Event
        </h3>
        <input
          type="text"
          placeholder="Event name (e.g., Sunday Mahjong)"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c41e3a]/30 focus:border-[#c41e3a] transition-all bg-gray-50/50"
        />
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-500">Base score:</label>
          <input
            type="number"
            min={1}
            value={baseScore}
            onChange={(e) => setBaseScore(Number(e.target.value))}
            className="w-20 border border-gray-200 rounded-xl px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#c41e3a]/30 bg-gray-50/50"
          />
        </div>
        <button
          onClick={createEvent}
          disabled={!eventName.trim() || loading}
          className="w-full py-3.5 bg-[#c41e3a] hover:bg-[#a01830] text-white rounded-xl font-bold text-sm tracking-wide transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md shadow-red-900/20"
        >
          {loading ? "Creating..." : "Create Event"}
        </button>
      </div>

      {/* Join event */}
      <div className="mahjong-card p-5 space-y-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <span className="w-1 h-5 bg-gray-800 rounded-full inline-block"></span>
          Join Event
        </h3>
        <input
          type="text"
          placeholder="Enter event code"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800/20 focus:border-gray-800 transition-all bg-gray-50/50"
        />
        <button
          onClick={joinEvent}
          disabled={!joinCode.trim()}
          className="w-full py-3.5 bg-gray-800 hover:bg-gray-900 text-white rounded-xl font-bold text-sm tracking-wide transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Join
        </button>
      </div>
    </div>
  );
}
