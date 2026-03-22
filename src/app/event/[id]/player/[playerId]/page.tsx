"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MahjongEvent, WinResult, PersonalityProfile, PointLedger } from "@/lib/types";
import { computeLedger } from "@/lib/ledger";
import { HandDisplay } from "@/components/hand-display";
import { PlayerCard } from "@/components/player-card";
import Link from "next/link";

export default function PlayerDetail() {
  const params = useParams();
  const eventId = params.id as string;
  const playerId = params.playerId as string;
  const [event, setEvent] = useState<MahjongEvent | null>(null);
  const [profile, setProfile] = useState<PersonalityProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    fetch(`/api/events/${eventId}`).then((r) => r.json()).then((d) => setEvent(d.event));
  }, [eventId]);

  async function generateProfile() {
    setLoadingProfile(true);
    const res = await fetch(`/api/events/${eventId}/personality`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId }),
    });
    const data = await res.json();
    if (data.profile) {
      setProfile(data.profile);
    } else if (data.profiles) {
      // Fallback: old endpoint returns all profiles
      const match = data.profiles.find((p: PersonalityProfile) => p.playerId === playerId);
      if (match) setProfile(match);
    }
    setLoadingProfile(false);
  }

  if (!event) {
    return (
      <div className="text-center py-20 text-gray-400">
        <div className="text-4xl mb-3">🀄</div>
        Loading...
      </div>
    );
  }

  const player = event.players.find((p) => p.id === playerId);
  const departed = (event.departedPlayers || []).find((p) => p.id === playerId);
  const playerName = player?.name || departed?.name || "Unknown";

  const ledgers = computeLedger(event);
  const ledger = ledgers.find((l) => l.playerId === playerId);

  const wins: (WinResult & { roundIndex: number })[] = [];
  event.rounds.forEach((round, i) => {
    for (const win of round.wins) {
      if (win.winnerId === playerId) {
        wins.push({ ...win, roundIndex: i + 1 });
      }
    }
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="mahjong-header -mx-4 px-6 pt-8 pb-6 text-white rounded-b-3xl shadow-lg">
        <Link href={`/event/${eventId}`} className="text-red-200 hover:text-white text-xs inline-flex items-center gap-1 mb-3 transition-colors">
          ← Back to event
        </Link>
        <div className="text-center">
          <h1 className="text-2xl font-bold">{playerName}</h1>
          {player && (
            <p className="text-red-200 text-sm mt-1">
              {event.tables.find((t) => t.id === player.tableId)?.name || ""}
            </p>
          )}
          {departed && <p className="text-red-200 text-sm mt-1">(left the event)</p>}
        </div>
      </div>

      {/* Stats */}
      {ledger && (
        <div className="mahjong-card p-4">
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <p className={`text-xl font-bold ${ledger.avgPointsPerGame > 0 ? "text-emerald-600" : ledger.avgPointsPerGame < 0 ? "text-red-600" : "text-gray-400"}`}>
                {ledger.avgPointsPerGame > 0 ? "+" : ""}{ledger.avgPointsPerGame}
              </p>
              <p className="text-[10px] text-gray-500">Avg/Game</p>
            </div>
            <div>
              <p className={`text-xl font-bold ${ledger.totalPoints > 0 ? "text-emerald-600" : ledger.totalPoints < 0 ? "text-red-600" : "text-gray-400"}`}>
                {ledger.totalPoints > 0 ? "+" : ""}{ledger.totalPoints}
              </p>
              <p className="text-[10px] text-gray-500">Total Pts</p>
            </div>
            <div>
              <p className="text-xl font-bold text-gray-800">{ledger.gamesPlayed}</p>
              <p className="text-[10px] text-gray-500">Games</p>
            </div>
            <div>
              <p className="text-xl font-bold text-amber-600">{ledger.wins}</p>
              <p className="text-[10px] text-gray-500">Wins</p>
            </div>
          </div>
        </div>
      )}

      {/* Personality profile */}
      {profile ? (
        <PlayerCard profile={profile} ledger={ledger} />
      ) : (
        <div className="mahjong-card p-5 text-center space-y-3">
          <div className="text-3xl">🔮</div>
          <p className="font-bold text-gray-800">Mahjong Personality</p>
          <p className="text-xs text-gray-500">
            AI analyzes play style — suit preferences, win patterns, risk-taking — and generates a fun personality profile.
          </p>
          {ledger && ledger.gamesPlayed > 0 ? (
            <button
              onClick={generateProfile}
              disabled={loadingProfile}
              className="w-full py-3 bg-[#c41e3a] hover:bg-[#a01830] text-white rounded-xl font-bold text-sm shadow-md shadow-red-900/20 transition-colors disabled:bg-gray-300"
            >
              {loadingProfile ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing play style...
                </span>
              ) : (
                "Reveal My Personality"
              )}
            </button>
          ) : (
            <p className="text-xs text-gray-400">Play at least 1 game to unlock</p>
          )}
        </div>
      )}

      {/* Win history */}
      <div className="mahjong-card p-4">
        <h2 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-3">Win History</h2>
        {wins.length === 0 ? (
          <p className="text-center text-gray-400 py-6 text-sm">No wins recorded yet</p>
        ) : (
          <div className="space-y-3">
            {wins.map((win) => (
              <div key={win.id} className="bg-gray-50 rounded-xl p-3 space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Round {win.roundIndex}</span>
                  <span className="font-bold text-[#c41e3a]">{win.totalFan} fan · {win.score} pts</span>
                </div>
                <HandDisplay tiles={win.tiles} />
                <div className="flex flex-wrap gap-1">
                  {win.fan.map((f, i) => (
                    <span key={i} className="bg-red-50 text-red-700 text-[10px] px-2 py-0.5 rounded-full">{f.name} +{f.value}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
