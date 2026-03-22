import Link from "next/link";
import { PointLedger } from "@/lib/types";

const RANK_STYLES = [
  "bg-gradient-to-r from-yellow-50 to-amber-50 font-bold",
  "bg-gray-50/80",
  "bg-orange-50/50",
];

export function Leaderboard({ ledgers, eventId, myPlayerId }: { ledgers: PointLedger[]; eventId?: string; myPlayerId?: string | null }) {
  // Already sorted by avgPointsPerGame from computeLedger
  const sorted = ledgers;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-gray-200 text-gray-500 text-[10px] uppercase tracking-wider">
            <th className="py-2 px-1 text-left">#</th>
            <th className="py-2 px-1 text-left">Player</th>
            <th className="py-2 px-1 text-right">Avg</th>
            <th className="py-2 px-1 text-right">Pts</th>
            <th className="py-2 px-1 text-right">G</th>
            <th className="py-2 px-1 text-right">W</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((ledger, i) => (
            <tr
              key={ledger.playerId}
              className={`border-b border-gray-100 transition-colors ${RANK_STYLES[i] || ""}`}
            >
              <td className="py-2.5 px-1 text-center">
                {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : <span className="text-gray-400">{i + 1}</span>}
              </td>
              <td className="py-2.5 px-1">
                {eventId ? (
                  <Link href={`/event/${eventId}/player/${ledger.playerId}${myPlayerId ? `?player=${myPlayerId}` : ""}`} className="hover:text-[#c41e3a] transition-colors">
                    {ledger.playerName}
                  </Link>
                ) : ledger.playerName}
              </td>
              <td className={`py-2.5 px-1 text-right font-mono font-bold text-xs ${ledger.avgPointsPerGame > 0 ? "text-emerald-600" : ledger.avgPointsPerGame < 0 ? "text-red-600" : "text-gray-400"}`}>
                {ledger.gamesPlayed > 0 ? (
                  <>{ledger.avgPointsPerGame > 0 ? "+" : ""}{ledger.avgPointsPerGame}</>
                ) : (
                  <span className="text-gray-300">-</span>
                )}
              </td>
              <td className={`py-2.5 px-1 text-right font-mono text-xs ${ledger.totalPoints > 0 ? "text-emerald-600" : ledger.totalPoints < 0 ? "text-red-600" : "text-gray-400"}`}>
                {ledger.totalPoints > 0 ? "+" : ""}{ledger.totalPoints}
              </td>
              <td className="py-2.5 px-1 text-right text-gray-600 text-xs">{ledger.gamesPlayed}</td>
              <td className="py-2.5 px-1 text-right text-gray-600 text-xs">{ledger.wins}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-[9px] text-gray-400 mt-2 text-right">Avg = avg points per game &middot; G = games played &middot; W = wins</p>
    </div>
  );
}
