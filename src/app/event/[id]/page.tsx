"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { MahjongEvent } from "@/lib/types";
import { computeLedger } from "@/lib/ledger";
import { Leaderboard } from "@/components/leaderboard";
import { EventQRCode } from "@/components/qr-code";
import Link from "next/link";

export default function EventDashboard() {
  const params = useParams();
  const searchParams = useSearchParams();
  const eventId = params.id as string;
  const pin = searchParams.get("pin");
  const isHost = !!pin;

  const [event, setEvent] = useState<MahjongEvent | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [newPlayer, setNewPlayer] = useState("");

  const fetchEvent = useCallback(async () => {
    const res = await fetch(`/api/events/${eventId}${pin ? `?pin=${pin}` : ""}`);
    const data = await res.json();
    setEvent(data.event);
  }, [eventId, pin]);

  useEffect(() => {
    fetchEvent();
    const interval = setInterval(fetchEvent, 5000);
    return () => clearInterval(interval);
  }, [fetchEvent]);

  async function addPlayer() {
    if (!newPlayer.trim()) return;
    await fetch(`/api/events/${eventId}/players`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newPlayer.trim() }),
    });
    setNewPlayer("");
    fetchEvent();
  }

  if (!event) return <div className="text-center py-20">Loading...</div>;

  const ledgers = computeLedger(event);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">🀄 {event.name}</h1>
        <p className="text-sm text-gray-500">Code: {event.id}</p>
      </div>

      <div className="flex gap-2">
        <Link href={`/event/${eventId}/submit`} className="flex-1 py-3 bg-red-600 text-white rounded-lg font-bold text-center">
          我胡了! (I Won)
        </Link>
        <Link href={`/event/${eventId}/kong`} className="py-3 px-4 bg-yellow-500 text-white rounded-lg font-bold text-center">
          杠
        </Link>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h2 className="font-bold text-lg mb-3">Leaderboard</h2>
        {ledgers.length > 0 ? (
          <Leaderboard ledgers={ledgers} eventId={eventId} />
        ) : (
          <p className="text-gray-400 text-center py-4">No games played yet</p>
        )}
      </div>

      {isHost && (
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
          <h2 className="font-bold text-lg">Host Controls</h2>
          <div className="flex gap-2">
            <input type="text" placeholder="Player name" value={newPlayer} onChange={(e) => setNewPlayer(e.target.value)} className="flex-1 border rounded-lg px-3 py-2" onKeyDown={(e) => e.key === "Enter" && addPlayer()} />
            <button onClick={addPlayer} className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold">Add</button>
          </div>
          <div className="space-y-1">
            {event.players.map((p) => (
              <div key={p.id} className="flex justify-between items-center text-sm py-1">
                <span>{p.name}</span>
                <span className="text-gray-400 text-xs">{p.id}</span>
              </div>
            ))}
          </div>
          <button onClick={() => setShowQR(!showQR)} className="w-full py-2 border rounded-lg text-sm">
            {showQR ? "Hide" : "Show"} QR Code
          </button>
          {showQR && (
            <EventQRCode url={typeof window !== "undefined" ? `${window.location.origin}/event/${eventId}` : ""} eventName={event.name} />
          )}
          <Link href={`/event/${eventId}/summary?pin=${pin}`} className="block w-full py-3 bg-gray-800 text-white rounded-lg font-bold text-center">
            End Event & Generate Profiles
          </Link>
        </div>
      )}
    </div>
  );
}
