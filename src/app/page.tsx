"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function HomePage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400">Loading...</div>}>
      <Home />
    </Suspense>
  );
}

function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rejoinEventId = searchParams.get("rejoin");
  const rejoinName = searchParams.get("name");

  const [mode, setMode] = useState<"home" | "create" | "join">(rejoinEventId ? "join" : "home");
  const [eventName, setEventName] = useState("");
  const [baseScore, setBaseScore] = useState(1);
  const [tableCode, setTableCode] = useState("");
  const [playerName, setPlayerName] = useState(rejoinName || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Host creates event + first table
  const [tableNames, setTableNames] = useState<string[]>(["Table 1"]);

  function addTable() {
    setTableNames([...tableNames, `Table ${tableNames.length + 1}`]);
  }

  function removeTable(i: number) {
    if (tableNames.length <= 1) return;
    setTableNames(tableNames.filter((_, idx) => idx !== i));
  }

  async function createEvent() {
    setLoading(true);
    setError("");

    // Create event
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: eventName, baseScore }),
    });
    const data = await res.json();
    const eventId = data.event.id;
    const pin = data.event.hostPin;

    // Create tables with codes
    const tables = tableNames.map((name, i) => ({
      id: `t${i + 1}`,
      name,
      code: generateTableCode(),
      playerIds: [],
    }));

    await fetch(`/api/events/${eventId}/tables?pin=${pin}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tables }),
    });

    setLoading(false);
    router.push(`/event/${eventId}?pin=${pin}`);
  }

  async function joinTable() {
    setLoading(true);
    setError("");

    let targetEventId = rejoinEventId;

    if (!targetEventId) {
      // Look up which event has this table code
      const res = await fetch("/api/events/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableCode: tableCode.trim().toUpperCase() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Could not find table");
        setLoading(false);
        return;
      }
      targetEventId = data.eventId;
    }

    // Join the table
    const joinRes = await fetch(`/api/events/${targetEventId}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tableCode: tableCode.trim().toUpperCase(), playerName: playerName.trim() }),
    });
    const joinData = await joinRes.json();

    if (!joinRes.ok && joinRes.status !== 409) {
      setError(joinData.error || "Could not join table");
      setLoading(false);
      return;
    }

    // Player identity lives in the URL (?player=xxx)
    // Only write to localStorage if no one else has claimed it yet
    // (avoids overwriting when multiple players share one browser)
    const player = joinData.player;
    const existingLocal = localStorage.getItem(`mahjong-player-${targetEventId}`);
    if (!existingLocal) {
      localStorage.setItem(`mahjong-player-${targetEventId}`, player.id);
      localStorage.setItem(`mahjong-player-name-${targetEventId}`, player.name);
    }

    setLoading(false);
    router.push(`/event/${targetEventId}?player=${player.id}`);
  }

  function generateTableCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 4; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="mahjong-header -mx-4 px-6 pt-10 pb-8 text-center text-white rounded-b-3xl shadow-lg">
        <div className="text-5xl mb-2">🀄</div>
        <h1 className="text-3xl font-bold tracking-tight">Mahjong Event</h1>
        <p className="text-red-200 text-sm mt-1 tracking-wide">Sichuan 血战到底</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">{error}</div>
      )}

      {/* Home: choose role */}
      {mode === "home" && (
        <>
          {/* How it works */}
          <div className="mahjong-card p-5">
            <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-3">How it works</h3>
            <div className="space-y-3 text-sm">
              <div className="flex gap-3 items-start">
                <span className="bg-[#c41e3a] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
                <p className="text-gray-600"><span className="font-medium text-gray-800">Host creates tables</span> — each table gets a join code</p>
              </div>
              <div className="flex gap-3 items-start">
                <span className="bg-[#c41e3a] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
                <p className="text-gray-600"><span className="font-medium text-gray-800">Players join with the table code</span> — enter your name and you're in</p>
              </div>
              <div className="flex gap-3 items-start">
                <span className="bg-[#c41e3a] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
                <p className="text-gray-600"><span className="font-medium text-gray-800">When you win, snap a photo</span> — AI calculates your score</p>
              </div>
              <div className="flex gap-3 items-start">
                <span className="bg-[#c41e3a] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">4</span>
                <p className="text-gray-600"><span className="font-medium text-gray-800">Live leaderboard</span> updates across all tables</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setMode("create")}
              className="w-full py-4 bg-[#c41e3a] hover:bg-[#a01830] text-white rounded-2xl font-bold text-lg shadow-md shadow-red-900/20 transition-colors"
            >
              I'm the Host
              <span className="block text-xs font-normal text-red-200 mt-0.5">Create event & set up tables</span>
            </button>
            <button
              onClick={() => setMode("join")}
              className="w-full py-4 bg-gray-800 hover:bg-gray-900 text-white rounded-2xl font-bold text-lg transition-colors"
            >
              I'm a Player
              <span className="block text-xs font-normal text-gray-400 mt-0.5">Join a table with a code</span>
            </button>
            <Link
              href="/how-to-play"
              className="w-full py-3 border border-gray-200 text-gray-600 rounded-2xl font-medium text-sm text-center block hover:bg-gray-50 transition-colors"
            >
              📖 How to Play
              <span className="block text-xs font-normal text-gray-400 mt-0.5">New to Mahjong? Start here</span>
            </Link>
          </div>
        </>
      )}

      {/* Host: Create event */}
      {mode === "create" && (
        <div className="space-y-4">
          <button onClick={() => setMode("home")} className="text-sm text-gray-500 hover:text-gray-700">← Back</button>

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
          </div>

          <div className="mahjong-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <span className="w-1 h-5 bg-amber-500 rounded-full inline-block"></span>
                Tables
              </h3>
              <button onClick={addTable} className="text-sm bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg font-bold transition-colors">
                + Add Table
              </button>
            </div>
            <p className="text-xs text-gray-500">Each table gets its own join code. Players use the code to join their table.</p>
            <div className="space-y-2">
              {tableNames.map((name, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      const updated = [...tableNames];
                      updated[i] = e.target.value;
                      setTableNames(updated);
                    }}
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 bg-gray-50/50"
                    placeholder="Table name (e.g., Beginner, Advanced)"
                  />
                  {tableNames.length > 1 && (
                    <button onClick={() => removeTable(i)} className="text-red-400 hover:text-red-600 text-sm px-2">Remove</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={createEvent}
            disabled={!eventName.trim() || loading || tableNames.some(n => !n.trim())}
            className="w-full py-3.5 bg-[#c41e3a] hover:bg-[#a01830] text-white rounded-xl font-bold text-sm tracking-wide transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md shadow-red-900/20"
          >
            {loading ? "Creating..." : "Create Event"}
          </button>
        </div>
      )}

      {/* Player: Join table */}
      {mode === "join" && (
        <div className="space-y-4">
          {!rejoinEventId && (
            <button onClick={() => setMode("home")} className="text-sm text-gray-500 hover:text-gray-700">← Back</button>
          )}

          {rejoinEventId && (
            <div className="mahjong-card p-4 border-l-4 border-amber-500">
              <p className="text-sm text-gray-600">
                <span className="font-bold text-gray-800">Hi {rejoinName}!</span> Enter a new table code to rejoin. Your scores carry over.
              </p>
            </div>
          )}

          <div className="mahjong-card p-5 space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <span className="w-1 h-5 bg-gray-800 rounded-full inline-block"></span>
              {rejoinEventId ? "Join a New Table" : "Join a Table"}
            </h3>
            <p className="text-sm text-gray-500">Ask the host for your table code</p>
            <input
              type="text"
              placeholder="Table code (e.g., AB3K)"
              value={tableCode}
              onChange={(e) => setTableCode(e.target.value.toUpperCase())}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-center font-mono text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-gray-800/20 focus:border-gray-800 transition-all bg-gray-50/50 uppercase"
              maxLength={4}
            />
            {rejoinEventId ? (
              <div className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-100 text-gray-600">
                {playerName}
              </div>
            ) : (
              <input
                type="text"
                placeholder="Your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800/20 focus:border-gray-800 transition-all bg-gray-50/50"
              />
            )}
            <button
              onClick={joinTable}
              disabled={!tableCode.trim() || !playerName.trim() || loading}
              className="w-full py-3.5 bg-gray-800 hover:bg-gray-900 text-white rounded-xl font-bold text-sm tracking-wide transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? "Joining..." : "Join Table"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
