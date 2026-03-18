"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { MahjongEvent, PersonalityProfile, PointLedger } from "@/lib/types";
import { Leaderboard } from "@/components/leaderboard";
import { PlayerCard } from "@/components/player-card";
import Link from "next/link";

export default function SummaryPage() {
  const params = useParams();
  const eventId = params.id as string;
  const [event, setEvent] = useState<MahjongEvent | null>(null);
  const [profiles, setProfiles] = useState<PersonalityProfile[]>([]);
  const [ledgers, setLedgers] = useState<PointLedger[]>([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    fetch(`/api/events/${eventId}`).then((r) => r.json()).then((d) => setEvent(d.event));
  }, [eventId]);

  async function generateProfiles() {
    setLoading(true);
    const res = await fetch(`/api/events/${eventId}/personality`, { method: "POST" });
    const data = await res.json();
    setProfiles(data.profiles);
    setLedgers(data.ledgers);
    setGenerated(true);
    setLoading(false);
  }

  if (!event) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-center">🀄 {event.name}</h1>
      <p className="text-center text-gray-500">Event Summary</p>
      {!generated ? (
        <div className="text-center space-y-4">
          <p className="text-gray-600">Ready to generate personality profiles?</p>
          <button onClick={generateProfiles} disabled={loading} className="w-full py-3 bg-red-600 text-white rounded-lg font-bold disabled:bg-gray-300">
            {loading ? "Generating profiles..." : "Generate Personality Profiles"}
          </button>
          {loading && <p className="text-sm text-gray-400">This may take a moment...</p>}
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h2 className="font-bold text-lg mb-3">Final Standings</h2>
            <Leaderboard ledgers={ledgers} />
          </div>
          <h2 className="font-bold text-lg text-center">Player Profiles</h2>
          <div className="space-y-4">
            {profiles.map((profile) => {
              const ledger = ledgers.find((l) => l.playerId === profile.playerId);
              return <PlayerCard key={profile.playerId} profile={profile} ledger={ledger} />;
            })}
          </div>
        </>
      )}
      <Link href={`/event/${eventId}`} className="block text-center text-sm text-gray-500 underline">Back to event</Link>
    </div>
  );
}
