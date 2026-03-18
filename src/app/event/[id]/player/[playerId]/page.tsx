"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MahjongEvent, WinResult } from "@/lib/types";
import { HandDisplay } from "@/components/hand-display";
import Link from "next/link";

export default function PlayerDetail() {
  const params = useParams();
  const eventId = params.id as string;
  const playerId = params.playerId as string;
  const [event, setEvent] = useState<MahjongEvent | null>(null);

  useEffect(() => {
    fetch(`/api/events/${eventId}`).then((r) => r.json()).then((d) => setEvent(d.event));
  }, [eventId]);

  if (!event) return <div className="text-center py-20">Loading...</div>;

  const player = event.players.find((p) => p.id === playerId);
  if (!player) return <div className="text-center py-20">Player not found</div>;

  const wins: (WinResult & { roundIndex: number })[] = [];
  event.rounds.forEach((round, i) => {
    for (const win of round.wins) {
      if (win.winnerId === playerId) {
        wins.push({ ...win, roundIndex: i + 1 });
      }
    }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-center">🀄 {player.name}</h1>
      {wins.length === 0 ? (
        <p className="text-center text-gray-400 py-8">No wins recorded yet</p>
      ) : (
        wins.map((win) => (
          <div key={win.id} className="bg-white rounded-xl p-4 shadow-sm space-y-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Round {win.roundIndex}</span>
              <span>{win.totalFan} fan • {win.score} pts</span>
            </div>
            <HandDisplay tiles={win.tiles} />
            {win.photoUrl && <img src={win.photoUrl} alt="Winning hand" className="w-full rounded-lg" />}
            <div className="flex flex-wrap gap-1">
              {win.fan.map((f, i) => (
                <span key={i} className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded-full">{f.name} +{f.value}</span>
              ))}
            </div>
          </div>
        ))
      )}
      <Link href={`/event/${eventId}`} className="block text-center text-sm text-gray-500 underline">Back to event</Link>
    </div>
  );
}
