"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { MahjongEvent } from "@/lib/types";

export default function KongPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const [event, setEvent] = useState<MahjongEvent | null>(null);
  const [playerId, setPlayerId] = useState("");
  const [kongType, setKongType] = useState<"ming" | "an" | "bu">("ming");
  const [paidById, setPaidById] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/events/${eventId}`).then((r) => r.json()).then((d) => setEvent(d.event));
  }, [eventId]);

  async function submitKong() {
    setLoading(true);
    const activeRound = event?.rounds.find((r) => r.status === "in_progress");
    let roundId = activeRound?.id;
    if (!roundId) {
      const res = await fetch(`/api/events/${eventId}/rounds`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableId: "", playerIds: event?.players.map((p) => p.id) }),
      });
      const data = await res.json();
      roundId = data.round.id;
    }
    await fetch(`/api/events/${eventId}/rounds/${roundId}/kongs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId, kongType, paidByIds: kongType !== "an" ? [paidById] : undefined }),
    });
    setLoading(false);
    setSuccess(true);
    setTimeout(() => router.push(`/event/${eventId}`), 1500);
  }

  if (!event) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-center">🀄 Declare Kong (杠)</h1>
      {success ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center text-green-700 font-bold">Kong recorded!</div>
      ) : (
        <div className="bg-white rounded-xl p-5 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Who declared?</label>
            <select value={playerId} onChange={(e) => setPlayerId(e.target.value)} className="w-full border rounded-lg px-3 py-2">
              <option value="">Select player</option>
              {event.players.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Kong type</label>
            <div className="space-y-2">
              <button onClick={() => setKongType("ming")} className={`w-full py-2 rounded-lg text-left px-3 ${kongType === "ming" ? "bg-red-600 text-white" : "bg-gray-100"}`}><span className="font-bold">明杠</span> — from discard (1 player pays 1pt)</button>
              <button onClick={() => setKongType("an")} className={`w-full py-2 rounded-lg text-left px-3 ${kongType === "an" ? "bg-red-600 text-white" : "bg-gray-100"}`}><span className="font-bold">暗杠</span> — concealed (all others pay 2pt each)</button>
              <button onClick={() => setKongType("bu")} className={`w-full py-2 rounded-lg text-left px-3 ${kongType === "bu" ? "bg-red-600 text-white" : "bg-gray-100"}`}><span className="font-bold">补杠</span> — upgrade triplet (1 player pays 1pt)</button>
            </div>
          </div>
          {kongType !== "an" && (
            <div>
              <label className="block text-sm font-medium mb-1">Who pays?</label>
              <select value={paidById} onChange={(e) => setPaidById(e.target.value)} className="w-full border rounded-lg px-3 py-2">
                <option value="">Select player</option>
                {event.players.filter((p) => p.id !== playerId).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          )}
          <button onClick={submitKong} disabled={!playerId || loading || (kongType !== "an" && !paidById)} className="w-full py-3 bg-yellow-500 text-white rounded-lg font-bold disabled:bg-gray-300">
            {loading ? "Submitting..." : "Record Kong"}
          </button>
        </div>
      )}
      <button onClick={() => router.push(`/event/${eventId}`)} className="w-full py-2 text-gray-500 text-sm underline">Back to event</button>
    </div>
  );
}
