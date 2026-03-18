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
    <div className="space-y-8">
      <div className="text-center pt-8">
        <h1 className="text-4xl font-bold">🀄</h1>
        <h2 className="text-2xl font-bold mt-2">Mahjong Event</h2>
        <p className="text-gray-500 text-sm">Sichuan 血战到底</p>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-lg">Create Event</h3>
        <input
          type="text"
          placeholder="Event name (e.g., Sunday Mahjong)"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
        />
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600">Base score:</label>
          <input
            type="number"
            min={1}
            value={baseScore}
            onChange={(e) => setBaseScore(Number(e.target.value))}
            className="w-20 border rounded-lg px-3 py-2"
          />
        </div>
        <button
          onClick={createEvent}
          disabled={!eventName.trim() || loading}
          className="w-full py-3 bg-red-600 text-white rounded-lg font-bold disabled:bg-gray-300"
        >
          {loading ? "Creating..." : "Create Event"}
        </button>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-lg">Join Event</h3>
        <input
          type="text"
          placeholder="Enter event code"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
        />
        <button
          onClick={joinEvent}
          disabled={!joinCode.trim()}
          className="w-full py-3 bg-gray-800 text-white rounded-lg font-bold disabled:bg-gray-300"
        >
          Join
        </button>
      </div>
    </div>
  );
}
