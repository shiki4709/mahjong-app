import Link from "next/link";
import { PointLedger } from "@/lib/types";

export function Leaderboard({ ledgers, eventId }: { ledgers: PointLedger[]; eventId?: string }) {
  const sorted = [...ledgers].sort((a, b) => b.totalPoints - a.totalPoints || b.wins - a.wins);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="py-2 px-1 text-left">#</th>
            <th className="py-2 px-2 text-left">Player</th>
            <th className="py-2 px-2 text-right">Points</th>
            <th className="py-2 px-2 text-right">W</th>
            <th className="py-2 px-2 text-right">L</th>
            <th className="py-2 px-2 text-right">Best</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((ledger, i) => (
            <tr
              key={ledger.playerId}
              className={`border-b border-gray-100 ${i === 0 ? "bg-yellow-50 font-bold" : ""} ${i === 1 ? "bg-gray-50" : ""}`}
            >
              <td className="py-2 px-1">
                {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
              </td>
              <td className="py-2 px-2">
                {eventId ? (
                  <Link href={`/event/${eventId}/player/${ledger.playerId}`} className="underline">
                    {ledger.playerName}
                  </Link>
                ) : ledger.playerName}
              </td>
              <td className={`py-2 px-2 text-right font-mono ${ledger.totalPoints >= 0 ? "text-green-600" : "text-red-600"}`}>
                {ledger.totalPoints > 0 ? "+" : ""}{ledger.totalPoints}
              </td>
              <td className="py-2 px-2 text-right">{ledger.wins}</td>
              <td className="py-2 px-2 text-right">{ledger.losses}</td>
              <td className="py-2 px-2 text-right">{ledger.biggestFan ? `${ledger.biggestFan}番` : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
