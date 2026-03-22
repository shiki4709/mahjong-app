"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { MahjongEvent } from "@/lib/types";
import Link from "next/link";
import { TileDisplay } from "@/components/tile";

type KongType = "ming" | "an";

const KONG_INFO: Record<KongType, {
  name: string;
  nameEn: string;
  desc: string;
  example: string;
  payment: string;
  icon: string;
}> = {
  ming: {
    name: "明杠",
    nameEn: "Open Kong",
    desc: "Someone discarded a tile and you have 3 matching tiles in your hand — you claim it to make 4 of a kind.",
    example: "You hold 3× and another player discards the 4th",
    payment: "The discarder pays you",
    icon: "📤",
  },
  an: {
    name: "暗杠",
    nameEn: "Concealed Kong",
    desc: "You drew all 4 matching tiles yourself — no one else knows what tiles they are.",
    example: "You drew all 4 tiles from the wall yourself",
    payment: "All 3 other players pay you (2× base each)",
    icon: "🤫",
  },
};

export default function KongPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = params.id as string;
  const playerParam = searchParams.get("player");
  const [event, setEvent] = useState<MahjongEvent | null>(null);
  const [step, setStep] = useState<"type" | "payer" | "confirm">("type");
  const [playerId, setPlayerId] = useState("");
  const [kongType, setKongType] = useState<KongType | null>(null);
  const [paidById, setPaidById] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/events/${eventId}`).then((r) => r.json()).then((d) => setEvent(d.event));
  }, [eventId]);

  // Auto-detect player: URL param > localStorage
  useEffect(() => {
    const saved = playerParam || localStorage.getItem(`mahjong-player-${eventId}`);
    if (saved) setPlayerId(saved);
  }, [eventId, playerParam]);

  async function submitKong() {
    if (!kongType) return;
    setLoading(true);
    // Find active round for THIS player's table only
    const declarer = event?.players.find((p) => p.id === playerId);
    const declarerTableId = declarer?.tableId;
    const activeRound = event?.rounds.find((r) => r.status === "in_progress" && r.tableId === declarerTableId);
    let roundId = activeRound?.id;
    if (!roundId) {
      const tablePlayers = event?.players.filter((p) => p.tableId === declarerTableId).map((p) => p.id) || [];
      const res = await fetch(`/api/events/${eventId}/rounds`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableId: declarerTableId, playerIds: tablePlayers }),
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
    setTimeout(() => router.push(`/event/${eventId}${playerParam ? `?player=${playerParam}` : ""}`), 1500);
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
  const kongInfo = kongType ? KONG_INFO[kongType] : null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="mahjong-header -mx-4 px-6 pt-8 pb-6 text-white rounded-b-3xl shadow-lg">
        <Link href={`/event/${eventId}${playerParam ? `?player=${playerParam}` : ""}`} className="text-red-200 hover:text-white text-xs inline-flex items-center gap-1 mb-3 transition-colors">
          ← Back to event
        </Link>
        <div className="text-center">
          <h1 className="text-2xl font-bold">杠 Kong</h1>
          <p className="text-red-200 text-sm mt-1">Declare 4 of a kind for bonus points</p>
        </div>
      </div>

      {/* Success state */}
      {success && (
        <div className="mahjong-card p-6 text-center border-l-4 border-green-500">
          <div className="text-3xl mb-2">✅</div>
          <p className="font-bold text-green-800">Kong recorded!</p>
          <p className="text-xs text-gray-500 mt-1">Returning to event...</p>
        </div>
      )}

      {!success && (
        <>
          {/* What is a Kong? - collapsible help */}
          <HelpCard />

          {/* Step indicator */}
          <div className="flex gap-1 px-1">
            {["Type", kongType === "ming" ? "Who threw?" : null, "Confirm"].filter(Boolean).map((label, i) => {
              const stepIndex = step === "type" ? 0 : step === "payer" ? 1 : kongType === "ming" ? 2 : 1;
              return (
                <div key={i} className="flex-1">
                  <div className={`h-1 rounded-full ${i <= stepIndex ? "bg-amber-500" : "bg-gray-200"}`} />
                  <p className={`text-[10px] mt-1 ${i <= stepIndex ? "text-amber-700 font-bold" : "text-gray-400"}`}>{label}</p>
                </div>
              );
            })}
          </div>

          {/* Step: Kong type */}
          {step === "type" && (
            <div className="space-y-3">
              <div className="mahjong-card p-4 border-l-4 border-amber-500">
                <p className="text-sm text-gray-600">
                  <span className="font-bold text-gray-800">{player?.name}</span>, what kind of Kong?
                </p>
              </div>

              {(["ming", "an"] as KongType[]).map((type) => {
                const info = KONG_INFO[type];
                return (
                  <button
                    key={type}
                    onClick={() => {
                      setKongType(type);
                      if (type === "an") {
                        setStep("confirm");
                      } else {
                        setStep("payer");
                      }
                    }}
                    className={`w-full mahjong-card p-4 text-left transition-colors ${
                      kongType === type ? "border-l-4 border-amber-500" : ""
                    }`}
                  >
                    <div className="flex gap-3 items-start">
                      <span className="text-2xl shrink-0">{info.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-gray-800">{info.name}</span>
                          <span className="text-xs text-gray-400">{info.nameEn}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{info.desc}</p>
                        <div className="bg-amber-50 rounded-lg px-3 py-1.5 mt-2 inline-block">
                          <p className="text-[10px] text-amber-700 font-medium">💰 {info.payment}</p>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}

            </div>
          )}

          {/* Step: Who pays? (only for ming kong) */}
          {step === "payer" && kongType && kongType !== "an" && (
            <div className="mahjong-card p-5 space-y-3">
              <h2 className="font-bold text-sm flex items-center gap-2">
                <span className="w-1 h-5 bg-amber-500 rounded-full inline-block" />
                {kongType === "ming" ? "Who discarded the tile?" : "Confirm added Kong"}
              </h2>
              {kongType === "ming" && (
                <p className="text-xs text-gray-500">
                  The player who threw the tile that completed your Kong pays the bonus.
                </p>
              )}
              <div className="space-y-2">
                {event.players.filter((p) => p.id !== playerId && p.tableId === player?.tableId).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { setPaidById(p.id); setStep("confirm"); }}
                    className={`w-full py-3 px-4 rounded-xl text-left text-sm font-medium transition-colors ${
                      paidById === p.id
                        ? "bg-amber-500 text-white"
                        : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setStep("type")}
                className="w-full py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                ← Change kong type
              </button>
            </div>
          )}

          {/* Step: Confirm */}
          {step === "confirm" && kongInfo && (
            <div className="space-y-4">
              <div className="mahjong-card p-5 space-y-3">
                <h2 className="font-bold text-sm flex items-center gap-2">
                  <span className="w-1 h-5 bg-green-500 rounded-full inline-block" />
                  Confirm Kong
                </h2>

                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Player</span>
                    <span className="font-bold text-gray-800">{player?.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Type</span>
                    <span className="font-bold text-gray-800">{kongInfo.name} {kongInfo.nameEn}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Payment</span>
                    <span className="font-bold text-amber-700">{kongInfo.payment}</span>
                  </div>
                  {kongType !== "an" && paidById && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Discarder</span>
                      <span className="font-bold text-gray-800">{event.players.find((p) => p.id === paidById)?.name}</span>
                    </div>
                  )}
                </div>

                {/* Visual example */}
                <div className="flex justify-center gap-0.5 py-2">
                  <TileDisplay tile={{ suit: "tong", number: 3 }} size="sm" />
                  <TileDisplay tile={{ suit: "tong", number: 3 }} size="sm" />
                  <TileDisplay tile={{ suit: "tong", number: 3 }} size="sm" />
                  <TileDisplay tile={{ suit: "tong", number: 3 }} size="sm" />
                </div>
              </div>

              <button
                onClick={submitKong}
                disabled={loading}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold text-sm shadow-md shadow-amber-900/20 transition-colors disabled:bg-gray-300"
              >
                {loading ? "Recording..." : "Confirm Kong"}
              </button>

              <button
                onClick={() => setStep(kongType === "an" ? "type" : "payer")}
                className="w-full py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                ← Go back
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ─── Collapsible help card ─── */
function HelpCard() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mahjong-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-5 py-3 flex items-center justify-between text-left"
      >
        <span className="text-xs font-bold text-gray-500">
          ❓ What is a Kong?
        </span>
        <span className={`text-gray-400 text-xs transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
      </button>
      {open && (
        <div className="px-5 pb-4 space-y-3">
          <p className="text-sm text-gray-600">
            A <span className="font-bold text-gray-800">Kong (杠)</span> is when you have <span className="font-bold">4 identical tiles</span>.
            It&apos;s a bonus that earns you extra points — separate from winning.
          </p>

          {/* Visual */}
          <div className="flex justify-center gap-0.5">
            <TileDisplay tile={{ suit: "wan", number: 8 }} size="sm" />
            <TileDisplay tile={{ suit: "wan", number: 8 }} size="sm" />
            <TileDisplay tile={{ suit: "wan", number: 8 }} size="sm" />
            <TileDisplay tile={{ suit: "wan", number: 8 }} size="sm" />
          </div>

          <div className="space-y-2 text-xs text-gray-600">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="font-bold text-gray-800">📤 明杠 Open Kong</p>
              <p className="mt-0.5">Someone threw a tile and you have the other 3 → claim it!</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="font-bold text-gray-800">🤫 暗杠 Concealed Kong</p>
              <p className="mt-0.5">You drew all 4 yourself → biggest bonus, others don&apos;t see the tiles</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
