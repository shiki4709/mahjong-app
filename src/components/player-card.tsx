import { PersonalityProfile, PointLedger } from "@/lib/types";

export function PlayerCard({ profile, ledger }: { profile: PersonalityProfile; ledger?: PointLedger }) {
  return (
    <div className="bg-gradient-to-br from-red-50 to-yellow-50 border-2 border-red-200 rounded-xl p-5 max-w-sm mx-auto shadow-lg">
      <div className="text-center mb-3">
        <h3 className="text-2xl font-bold text-red-800">{profile.playerName}</h3>
        <p className="text-xl mt-1">「{profile.title}」</p>
        <p className="text-sm text-gray-500">{profile.titleEn}</p>
      </div>
      <p className="text-gray-700 text-sm leading-relaxed mb-4">{profile.description}</p>
      {ledger && (
        <div className="grid grid-cols-3 gap-2 text-center text-xs border-t border-red-200 pt-3">
          <div>
            <p className="font-bold text-lg text-red-700">{ledger.totalPoints > 0 ? "+" : ""}{ledger.totalPoints}</p>
            <p className="text-gray-500">Points</p>
          </div>
          <div>
            <p className="font-bold text-lg text-red-700">{ledger.wins}</p>
            <p className="text-gray-500">Wins</p>
          </div>
          <div>
            <p className="font-bold text-lg text-red-700">{ledger.biggestFan}番</p>
            <p className="text-gray-500">Biggest</p>
          </div>
        </div>
      )}
      <p className="text-center text-[10px] text-gray-400 mt-3">🀄 Mahjong Event</p>
    </div>
  );
}
