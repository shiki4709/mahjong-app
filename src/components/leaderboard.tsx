import Link from "next/link";
import { PointLedger } from "@/lib/types";

const RANK_STYLES = [
  "bg-gradient-to-r from-yellow-50 to-amber-50 font-bold",
  "bg-gray-50/80",
  "bg-orange-50/50",
];

export function Leaderboard({ ledgers, eventId }: { ledgers: PointLedger[]; eventId?: string }) {
  const sorted = [...ledgers].sort((a, b) => b.totalPoints - a.totalPoints || b.wins - a.wins);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
            <th className="py-2 px-1 text-left">#</th>
            <th className="py-2 px-2 text-left">Player</th>
            <th className="py-2 px-2 text-right">Pts</th>
            <th className="py-2 px-2 text-right">W</th>
            <th className="py-2 px-2 text-right">L</th>
            <th className="py-2 px-2 text-right">Best</th>
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
              <td className="py-2.5 px-2">
                {eventId ? (
                  <Link href={`/event/${eventId}/player/${ledger.playerId}`} className="hover:text-[#c41e3a] transition-colors">
                    {ledger.playerName}
                  </Link>
                ) : ledger.playerName}
              </td>
              <td className={`py-2.5 px-2 text-right font-mono font-bold ${ledger.totalPoints > 0 ? "text-emerald-600" : ledger.totalPoints < 0 ? "text-red-600" : "text-gray-400"}`}>
                {ledger.totalPoints > 0 ? "+" : ""}{ledger.totalPoints}
              </td>
              <td className="py-2.5 px-2 text-right text-gray-600">{ledger.wins}</td>
              <td className="py-2.5 px-2 text-right text-gray-600">{ledger.losses}</td>
              <td className="py-2.5 px-2 text-right">
                {ledger.biggestFan ? (
                  <span className="text-amber-600 font-medium">{ledger.biggestFan}番</span>
                ) : (
                  <span className="text-gray-300">-</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
