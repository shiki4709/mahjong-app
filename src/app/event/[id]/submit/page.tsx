"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Tile, MahjongEvent, FanBreakdown } from "@/lib/types";
import { HandDisplay } from "@/components/hand-display";
import { TilePicker } from "@/components/tile-picker";

type Step = "photo" | "confirm" | "manual" | "details" | "result";

export default function SubmitWin() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = params.id as string;
  const playerParam = searchParams.get("player");

  const [event, setEvent] = useState<MahjongEvent | null>(null);
  const [step, setStep] = useState<Step>("photo");
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [photoUrl, setPhotoUrl] = useState("");
  const [kongs, setKongs] = useState(0);
  const [validation, setValidation] = useState<{ valid: boolean; reason?: string } | null>(null);
  const [winnerId, setWinnerId] = useState("");
  const [winType, setWinType] = useState<"zimo" | "dianpao">("zimo");
  const [discarderId, setDiscarderId] = useState("");
  const [isLastTile, setIsLastTile] = useState(false);
  const [isKongWin, setIsKongWin] = useState(false);
  const [isRobbingKong, setIsRobbingKong] = useState(false);
  const [isDealerFirstDraw, setIsDealerFirstDraw] = useState(false);
  const [isFirstDraw, setIsFirstDraw] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<{ fan: FanBreakdown[]; totalFan: number; score: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/events/${eventId}`).then((r) => r.json()).then((d) => setEvent(d.event));
  }, [eventId]);

  // Auto-set winner: URL param > localStorage
  useEffect(() => {
    const saved = playerParam || localStorage.getItem(`mahjong-player-${eventId}`);
    if (saved) setWinnerId(saved);
  }, [eventId, playerParam]);

  function resetToPhoto() {
    setStep("photo");
    setTiles([]);
    setPhotoUrl("");
    setKongs(0);
    setValidation(null);
    setError("");
    setLoading(false);
  }

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("photo", file);
    try {
      const res = await fetch("/api/recognize", { method: "POST", body: formData });
      const data = await res.json();
      if (data.error && !data.tiles) {
        setPhotoUrl(data.photoUrl || "");
        setError(data.error);
        setLoading(false);
      } else {
        setTiles(data.tiles);
        setPhotoUrl(data.photoUrl);
        setKongs(data.kongs || 0);
        setValidation(data.validation);
        setStep("confirm");
        setLoading(false);
      }
    } catch {
      setError("Upload failed. Please try again.");
      setLoading(false);
    }
  }

  async function submitWin() {
    if (!winnerId) return;
    setLoading(true);
    setError("");
    const activeRound = event?.rounds.find((r) => r.status === "in_progress");
    let roundId = activeRound?.id;
    if (!roundId) {
      const winner = event?.players.find((p) => p.id === winnerId);
      const tablePlayers = event?.players.filter((p) => p.tableId === winner?.tableId).map((p) => p.id) || [];
      const res = await fetch(`/api/events/${eventId}/rounds`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableId: winner?.tableId, playerIds: tablePlayers.length > 0 ? tablePlayers : event?.players.map((p) => p.id) }),
      });
      const data = await res.json();
      roundId = data.round.id;
    }
    const res = await fetch(`/api/events/${eventId}/rounds/${roundId}/wins`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ winnerId, tiles, photoUrl, winType, discarderId: winType === "dianpao" ? discarderId : undefined, kongCount: kongs, isLastTile, isKongWin, isRobbingKong, isDealerFirstDraw, isFirstDraw }),
    });
    const data = await res.json();
    if (!data.valid) { setError(data.error); setLoading(false); return; }
    setResult({ fan: data.win.fan, totalFan: data.win.totalFan, score: data.win.score });
    setStep("result");
    setLoading(false);
  }

  if (!event) return <div className="text-center py-20 text-gray-400"><div className="text-4xl mb-3">🀄</div>Loading...</div>;

  const winner = event.players.find((p) => p.id === winnerId);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="mahjong-header -mx-4 px-6 pt-6 pb-5 text-white rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-3">
          <button onClick={() => step === "photo" ? router.push(`/event/${eventId}${playerParam ? `?player=${playerParam}` : ""}`) : resetToPhoto()} className="text-white/70 hover:text-white text-sm">
            ← {step === "photo" ? "Back" : "Start Over"}
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-lg font-bold">我胡了! I Won!</h1>
          </div>
          <div className="w-12"></div>
        </div>
        {/* Step indicator */}
        <div className="flex gap-1.5 mt-3 justify-center">
          {["Photo", "Confirm", "Details", "Done"].map((label, i) => {
            const stepOrder = ["photo", "confirm", "details", "result"];
            const currentIdx = step === "manual" ? 1 : stepOrder.indexOf(step);
            return (
              <div key={label} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${i <= currentIdx ? "bg-white" : "bg-white/30"}`} />
                <span className={`text-[10px] ${i <= currentIdx ? "text-white" : "text-white/40"}`}>{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mahjong-card p-3 border-l-4 border-red-500">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Step 1: Photo */}
      {step === "photo" && (
        <div className="mahjong-card p-5 space-y-4 text-center">
          <div className="text-4xl mb-1">📸</div>
          <p className="font-bold text-lg">Take a photo of your winning hand</p>
          <p className="text-sm text-gray-500">Lay out all tiles face-up and snap a clear photo</p>

          <label className={`block w-full py-4 ${loading ? "bg-gray-400" : "bg-[#c41e3a] hover:bg-[#a01830]"} text-white rounded-xl font-bold cursor-pointer transition-colors shadow-md`}>
            {loading ? "Analyzing tiles..." : "Open Camera"}
            <input type="file" accept="image/*" capture="environment" onChange={handlePhoto} className="hidden" disabled={loading} />
          </label>

          {loading && (
            <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-[#c41e3a] rounded-full animate-spin"></div>
              AI is reading your tiles...
            </div>
          )}

          <div className="relative flex items-center gap-3 py-2">
            <div className="h-px flex-1 bg-gray-200"></div>
            <span className="text-xs text-gray-400">or</span>
            <div className="h-px flex-1 bg-gray-200"></div>
          </div>

          <button
            onClick={() => { setError(""); setStep("manual"); }}
            className="w-full py-3 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Enter tiles manually
          </button>
        </div>
      )}

      {/* Step 2: Confirm tiles from AI */}
      {step === "confirm" && (
        <div className="mahjong-card p-5 space-y-4">
          <p className="font-bold text-sm text-gray-500 uppercase tracking-wider">AI Detected Tiles:</p>
          <HandDisplay tiles={tiles} />

          {validation && !validation.valid && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">
              <p className="font-bold mb-1">Not a valid winning hand</p>
              <p>{validation.reason}</p>
            </div>
          )}
          {validation?.valid && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-green-700 text-sm font-medium">
              Valid winning hand!
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setStep("details")}
              disabled={!validation?.valid}
              className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm disabled:bg-gray-300 transition-colors"
            >
              Looks correct
            </button>
            <button
              onClick={() => setStep("manual")}
              className="py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-sm transition-colors"
            >
              Fix tiles
            </button>
          </div>
          <button onClick={resetToPhoto} className="w-full text-center text-sm text-gray-400 hover:text-gray-600">
            Retake photo
          </button>
        </div>
      )}

      {/* Step 2b: Manual tile picker */}
      {step === "manual" && (
        <div className="space-y-3">
          <div className="mahjong-card p-5">
            <TilePicker initialTiles={tiles} onConfirm={(t) => { setTiles(t); setStep("details"); }} />
          </div>
          <button onClick={resetToPhoto} className="w-full text-center text-sm text-gray-400 hover:text-gray-600">
            ← Back to camera
          </button>
        </div>
      )}

      {/* Step 3: Win details — simplified */}
      {step === "details" && (
        <div className="space-y-4">
          <div className="mahjong-card p-4">
            <HandDisplay tiles={tiles} />
          </div>

          {/* Winner — auto-detected, changeable */}
          <div className="mahjong-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Winner</p>
                <p className="font-bold text-gray-800">{winner?.name || "Select player"}</p>
              </div>
              {!winner && (
                <span className="text-xs text-red-500 font-medium">Required</span>
              )}
            </div>
            {/* Show player selector only if not auto-detected or user wants to change */}
            {!winner ? (
              <div className="space-y-2 mt-3">
                {event.players.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setWinnerId(p.id)}
                    className="w-full py-2.5 px-4 rounded-xl text-left text-sm font-medium bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            ) : (
              <button
                onClick={() => setWinnerId("")}
                className="text-xs text-gray-400 hover:text-gray-600 mt-1"
              >
                Change player
              </button>
            )}
          </div>

          {/* The one essential question: how did you win? */}
          <div className="mahjong-card p-4 space-y-3">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">How did you win?</p>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setWinType("zimo")}
                className={`py-4 rounded-xl text-center transition-colors ${
                  winType === "zimo"
                    ? "bg-[#c41e3a] text-white shadow-md shadow-red-900/20"
                    : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                }`}
              >
                <span className="text-lg font-bold block">自摸</span>
                <span className={`text-xs block mt-0.5 ${winType === "zimo" ? "text-red-200" : "text-gray-400"}`}>I drew it myself</span>
              </button>
              <button
                onClick={() => setWinType("dianpao")}
                className={`py-4 rounded-xl text-center transition-colors ${
                  winType === "dianpao"
                    ? "bg-[#c41e3a] text-white shadow-md shadow-red-900/20"
                    : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                }`}
              >
                <span className="text-lg font-bold block">点炮</span>
                <span className={`text-xs block mt-0.5 ${winType === "dianpao" ? "text-red-200" : "text-gray-400"}`}>Someone threw it</span>
              </button>
            </div>

            {/* Explain the difference */}
            <div className="bg-gray-50 rounded-lg px-3 py-2">
              <p className="text-[10px] text-gray-500">
                {winType === "zimo"
                  ? "💡 Self-draw: all 3 other players pay you. Worth 1 extra fan!"
                  : "💡 Discard win: only the player who threw the tile pays you."
                }
              </p>
            </div>
          </div>

          {/* Who discarded? — only shown for dianpao */}
          {winType === "dianpao" && (
            <div className="mahjong-card p-4 space-y-2">
              <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Who threw the winning tile?</p>
              <div className="space-y-2">
                {event.players.filter((p) => p.id !== winnerId).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setDiscarderId(p.id)}
                    className={`w-full py-2.5 px-4 rounded-xl text-left text-sm font-medium transition-colors ${
                      discarderId === p.id
                        ? "bg-[#c41e3a] text-white"
                        : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Advanced / rare bonuses — hidden by default */}
          <div className="mahjong-card overflow-hidden">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full px-4 py-3 flex items-center justify-between text-left"
            >
              <span className="text-xs text-gray-400">
                Rare bonuses (usually not needed)
              </span>
              <span className={`text-gray-400 text-xs transition-transform ${showAdvanced ? "rotate-180" : ""}`}>▾</span>
            </button>
            {showAdvanced && (
              <div className="px-4 pb-4 space-y-2">
                <p className="text-[10px] text-gray-400 mb-2">Only check these if you know they apply. Most hands won&apos;t have any.</p>
                {[
                  { checked: isLastTile, onChange: setIsLastTile, name: "海底捞月", en: "Last Tile", desc: "Won on the very last tile from the wall" },
                  { checked: isKongWin, onChange: setIsKongWin, name: "杠上开花", en: "Win off Kong", desc: "Won on the tile drawn after declaring a Kong" },
                  { checked: isRobbingKong, onChange: setIsRobbingKong, name: "杠上炮", en: "Robbing a Kong", desc: "Won by claiming someone else's Kong tile" },
                  { checked: isDealerFirstDraw, onChange: setIsDealerFirstDraw, name: "天胡", en: "Heavenly Hand", desc: "Dealer won on their very first draw (super rare!)" },
                  { checked: isFirstDraw, onChange: setIsFirstDraw, name: "地胡", en: "Earthly Hand", desc: "Non-dealer won on their first draw" },
                ].map(({ checked, onChange, name, en, desc }) => (
                  <label key={name} className="flex items-start gap-3 bg-gray-50 rounded-lg p-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded mt-0.5"
                      checked={checked}
                      onChange={(e) => onChange(e.target.checked)}
                    />
                    <div>
                      <p className="text-xs font-bold text-gray-700">{name} <span className="font-normal text-gray-400">{en}</span></p>
                      <p className="text-[10px] text-gray-500">{desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={submitWin}
            disabled={!winnerId || loading || (winType === "dianpao" && !discarderId)}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md"
          >
            {loading ? "Submitting..." : "Submit Win"}
          </button>

          <button onClick={() => setStep("confirm")} className="w-full text-center text-sm text-gray-400 hover:text-gray-600">
            ← Back to tiles
          </button>
        </div>
      )}

      {/* Step 4: Result */}
      {step === "result" && result && (
        <div className="mahjong-card p-5 space-y-4 text-center">
          <div className="text-4xl">🎉</div>
          <p className="text-2xl font-bold text-emerald-600">Win Recorded!</p>

          <div className="bg-gray-50 rounded-xl p-4 space-y-1.5 text-left">
            {result.fan.map((f, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-600">{f.name} <span className="text-gray-400">({f.nameEn})</span></span>
                <span className="font-bold text-[#c41e3a]">+{f.value} fan</span>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <p className="text-sm text-gray-500">Total Fan</p>
            <p className="text-3xl font-bold">{result.totalFan} 番</p>
            <p className="text-sm text-gray-500 mt-2">Points Scored</p>
            <p className="text-4xl font-bold text-[#c41e3a]">{result.score}</p>
          </div>

          <button
            onClick={() => router.push(`/event/${eventId}${playerParam ? `?player=${playerParam}` : ""}`)}
            className="w-full py-3.5 bg-gray-800 hover:bg-gray-900 text-white rounded-xl font-bold text-sm transition-colors"
          >
            Back to Leaderboard
          </button>
        </div>
      )}
    </div>
  );
}
