"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { MahjongEvent, Table } from "@/lib/types";
import { nanoid } from "nanoid";
import Link from "next/link";

export default function AdminPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const eventId = params.id as string;
  const pin = searchParams.get("pin") || "";
  const [event, setEvent] = useState<MahjongEvent | null>(null);
  const [tables, setTables] = useState<Table[]>([]);

  useEffect(() => {
    fetch(`/api/events/${eventId}?pin=${pin}`).then((r) => r.json()).then((d) => { setEvent(d.event); setTables(d.event.tables || []); });
  }, [eventId, pin]);

  async function saveTables() {
    await fetch(`/api/events/${eventId}/tables?pin=${pin}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tables }),
    });
    alert("Tables saved!");
  }

  function addTable() {
    setTables([...tables, { id: nanoid(4), name: `Table ${tables.length + 1}`, playerIds: [] }]);
  }

  function assignPlayer(tableIndex: number, playerId: string) {
    const updated = tables.map((t, i) => ({
      ...t,
      playerIds: i === tableIndex ? [...t.playerIds, playerId] : t.playerIds.filter((pid) => pid !== playerId),
    }));
    setTables(updated);
  }

  async function deletePlayer(playerId: string) {
    if (!confirm("Remove this player?")) return;
    await fetch(`/api/events/${eventId}/players/${playerId}?pin=${pin}`, { method: "DELETE" });
    setEvent((prev) => prev ? { ...prev, players: prev.players.filter((p) => p.id !== playerId) } : null);
  }

  if (!event) return <div className="text-center py-20">Loading...</div>;

  const assignedPlayerIds = tables.flatMap((t) => t.playerIds);
  const unassigned = event.players.filter((p) => !assignedPlayerIds.includes(p.id));

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-center">🀄 Admin</h1>
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h2 className="font-bold mb-2">Players ({event.players.length})</h2>
        {event.players.map((p) => (
          <div key={p.id} className="flex justify-between items-center py-1 text-sm">
            <span>{p.name}</span>
            <button onClick={() => deletePlayer(p.id)} className="text-red-500 text-xs">Remove</button>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="font-bold">Tables</h2>
          <button onClick={addTable} className="text-sm bg-green-600 text-white px-3 py-1 rounded-lg">+ Add Table</button>
        </div>
        {tables.map((table, ti) => (
          <div key={table.id} className="border rounded-lg p-3">
            <h3 className="font-bold text-sm mb-2">{table.name}</h3>
            <div className="space-y-1">
              {table.playerIds.map((pid) => {
                const player = event.players.find((p) => p.id === pid);
                return (
                  <div key={pid} className="text-sm flex justify-between">
                    <span>{player?.name}</span>
                    <button onClick={() => setTables(tables.map((t, i) => i === ti ? { ...t, playerIds: t.playerIds.filter((id) => id !== pid) } : t))} className="text-red-400 text-xs">×</button>
                  </div>
                );
              })}
            </div>
            {unassigned.length > 0 && table.playerIds.length < 4 && (
              <select onChange={(e) => { if (e.target.value) assignPlayer(ti, e.target.value); e.target.value = ""; }} className="mt-2 w-full border rounded px-2 py-1 text-sm">
                <option value="">Add player...</option>
                {unassigned.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            )}
          </div>
        ))}
        <button onClick={saveTables} className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold">Save Tables</button>
      </div>
      <Link href={`/event/${eventId}?pin=${pin}`} className="block text-center text-sm text-gray-500 underline">Back to event</Link>
    </div>
  );
}
