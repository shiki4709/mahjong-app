"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Tile, MahjongEvent, FanBreakdown } from "@/lib/types";
import { HandDisplay } from "@/components/hand-display";
import { TilePicker } from "@/components/tile-picker";

type Step = "photo" | "confirm" | "manual" | "details" | "result";

export default function SubmitWin() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

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
  const [result, setResult] = useState<{ fan: FanBreakdown[]; totalFan: number; score: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/events/${eventId}`).then((r) => r.json()).then((d) => setEvent(d.event));
  }, [eventId]);

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
        setStep("manual");
      } else {
        setTiles(data.tiles);
        setPhotoUrl(data.photoUrl);
        setKongs(data.kongs || 0);
        setValidation(data.validation);
        setStep("confirm");
      }
    } catch {
      setError("Upload failed. Please try again.");
    }
    setLoading(false);
  }

  async function submitWin() {
    if (!winnerId) return;
    setLoading(true);
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

  if (!event) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-center">🀄 Submit Win</h1>
      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">{error}</div>}

      {step === "photo" && (
        <div className="bg-white rounded-xl p-5 shadow-sm space-y-4 text-center">
          <p className="text-lg">Take a photo of your winning hand</p>
          <label className="block w-full py-4 bg-red-600 text-white rounded-lg font-bold cursor-pointer">
            📸 Open Camera
            <input type="file" accept="image/*" capture="environment" onChange={handlePhoto} className="hidden" />
          </label>
          <button onClick={() => setStep("manual")} className="text-sm text-gray-500 underline">Or enter tiles manually</button>
          {loading && <p className="text-gray-500">Analyzing tiles...</p>}
        </div>
      )}

      {step === "confirm" && (
        <div className="bg-white rounded-xl p-5 shadow-sm space-y-4">
          <p className="font-bold">Detected tiles:</p>
          <HandDisplay tiles={tiles} />
          {validation && !validation.valid && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">{validation.reason}</div>}
          {validation?.valid && <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm">Valid winning hand!</div>}
          <div className="flex gap-2">
            <button onClick={() => setStep("details")} disabled={!validation?.valid} className="flex-1 py-3 bg-green-600 text-white rounded-lg font-bold disabled:bg-gray-300">Correct</button>
            <button onClick={() => setStep("manual")} className="flex-1 py-3 bg-gray-200 rounded-lg font-bold">Fix Tiles</button>
          </div>
        </div>
      )}

      {step === "manual" && (
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <TilePicker initialTiles={tiles} onConfirm={(t) => { setTiles(t); setStep("details"); }} />
        </div>
      )}

      {step === "details" && (
        <div className="bg-white rounded-xl p-5 shadow-sm space-y-4">
          <HandDisplay tiles={tiles} />
          <div>
            <label className="block text-sm font-medium mb-1">Who won?</label>
            <select value={winnerId} onChange={(e) => setWinnerId(e.target.value)} className="w-full border rounded-lg px-3 py-2">
              <option value="">Select player</option>
              {event.players.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Win type</label>
            <div className="flex gap-2">
              <button onClick={() => setWinType("zimo")} className={`flex-1 py-2 rounded-lg font-bold ${winType === "zimo" ? "bg-red-600 text-white" : "bg-gray-100"}`}>自摸 (Self-draw)</button>
              <button onClick={() => setWinType("dianpao")} className={`flex-1 py-2 rounded-lg font-bold ${winType === "dianpao" ? "bg-red-600 text-white" : "bg-gray-100"}`}>点炮 (Discard)</button>
            </div>
          </div>
          {winType === "dianpao" && (
            <div>
              <label className="block text-sm font-medium mb-1">Who discarded?</label>
              <select value={discarderId} onChange={(e) => setDiscarderId(e.target.value)} className="w-full border rounded-lg px-3 py-2">
                <option value="">Select player</option>
                {event.players.filter((p) => p.id !== winnerId).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          )}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={isLastTile} onChange={(e) => setIsLastTile(e.target.checked)} /> 海底捞月 (Last tile)</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={isKongWin} onChange={(e) => setIsKongWin(e.target.checked)} /> 杠上开花 (Win off kong)</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={isRobbingKong} onChange={(e) => setIsRobbingKong(e.target.checked)} /> 杠上炮 (Robbing a kong)</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={isDealerFirstDraw} onChange={(e) => setIsDealerFirstDraw(e.target.checked)} /> 天胡 (Heavenly hand)</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={isFirstDraw} onChange={(e) => setIsFirstDraw(e.target.checked)} /> 地胡 (Earthly hand)</label>
          </div>
          <button onClick={submitWin} disabled={!winnerId || loading || (winType === "dianpao" && !discarderId)} className="w-full py-3 bg-green-600 text-white rounded-lg font-bold disabled:bg-gray-300">
            {loading ? "Submitting..." : "Submit Win"}
          </button>
        </div>
      )}

      {step === "result" && result && (
        <div className="bg-white rounded-xl p-5 shadow-sm space-y-4 text-center">
          <p className="text-2xl font-bold text-green-600">Win Recorded!</p>
          <div className="space-y-1">
            {result.fan.map((f, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span>{f.name} ({f.nameEn})</span>
                <span className="font-bold">+{f.value} fan</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-3">
            <p className="text-lg">Total: <span className="font-bold">{result.totalFan} fan</span></p>
            <p className="text-2xl font-bold text-red-600">{result.score} points</p>
          </div>
          <button onClick={() => router.push(`/event/${eventId}`)} className="w-full py-3 bg-gray-800 text-white rounded-lg font-bold">Back to Leaderboard</button>
        </div>
      )}
    </div>
  );
}
