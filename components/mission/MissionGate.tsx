"use client";
import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, ExternalLink, Loader2, Shield, Clock, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { generateMissionToken, randomCountdown } from "@/lib/utils";

interface Task { _id: string; type: string; label: string; url: string; required: boolean; }
interface MissionData { _id: string; name: string; tasks: Task[]; countdownSeconds: number; humanVerification: boolean; }

interface Props {
  resourceType: "file" | "link";
  resourceId: string;
  slug: string;
  mission: MissionData | null;
  missionEnabled: boolean;
}

export default function MissionGate({ resourceType, resourceId, slug, mission, missionEnabled }: Props) {
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [humanVerified, setHumanVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [countdownActive, setCountdownActive] = useState(false);
  const [puzzleAnswer, setPuzzleAnswer] = useState("");
  const [puzzleQuestion, setPuzzleQuestion] = useState({ q: "", a: "" });
  const [loading, setLoading] = useState(false);
  const [token] = useState(() => generateMissionToken(resourceId, "client"));
  const [verifyChallenge, setVerifyChallenge] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [requiredClicks] = useState(() => Math.floor(Math.random() * 3) + 3);

  useEffect(() => {
    const nums = [Math.floor(Math.random() * 10) + 1, Math.floor(Math.random() * 10) + 1];
    setPuzzleQuestion({ q: `${nums[0]} + ${nums[1]} = ?`, a: String(nums[0] + nums[1]) });
    if (missionEnabled) {
      const secs = mission?.countdownSeconds ?? randomCountdown(10, 25);
      setCountdown(secs);
      setCountdownActive(true);
    }
  }, [mission, missionEnabled]);

  useEffect(() => {
    if (!countdownActive || countdown <= 0) { if (countdown <= 0) setCountdownActive(false); return; }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, countdownActive]);

  const completeTask = useCallback((taskId: string) => {
    setCompletedTasks((prev) => new Set([...prev, taskId]));
  }, []);

  const allRequiredDone = mission
    ? mission.tasks.filter((t) => t.required).every((t) => completedTasks.has(t._id))
    : true;

  const canProceed = allRequiredDone && humanVerified && countdown <= 0;

  async function handleProceed() {
    if (!canProceed) return;
    if (mission?.humanVerification && puzzleAnswer !== puzzleQuestion.a) {
      toast.error("Wrong answer! Try again."); return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/missions/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resourceType, slug, token,
          completedTasks: Array.from(completedTasks),
          humanVerified,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Verification failed");
      toast.success("Verified! Redirecting...");
      setTimeout(() => { window.location.href = data.redirectUrl; }, 800);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!missionEnabled) {
    return (
      <div className="card p-6 text-center">
        <a href={`/api/missions/verify`} onClick={handleProceed}
          className="btn-primary w-full justify-center text-base py-4">
          <Shield className="w-5 h-5" /> Access File
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {countdownActive && (
        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-brand-500/10 border border-brand-500/30 flex items-center justify-center shrink-0">
            <span className="text-brand-400 font-bold text-lg">{countdown}</span>
          </div>
          <div>
            <div className="text-white font-semibold text-sm">Please wait</div>
            <div className="text-slate-400 text-xs">Timer expires in {countdown} seconds</div>
          </div>
          <Clock className="w-4 h-4 text-slate-500 ml-auto" />
        </div>
      )}

      {mission && mission.tasks.length > 0 && (
        <div className="card p-6">
          <h3 className="text-white font-semibold mb-4 text-sm">Complete Tasks to Continue</h3>
          <div className="space-y-3">
            {mission.tasks.map((task) => {
              const done = completedTasks.has(task._id);
              return (
                <div key={task._id} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${done ? "border-green-500/30 bg-green-500/5" : "border-surface-border bg-surface"}`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${done ? "border-green-500 bg-green-500" : "border-slate-600"}`}>
                    {done && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                  <span className={`text-sm flex-1 ${done ? "text-slate-400 line-through" : "text-white"}`}>{task.label}</span>
                  {!done && (
                    <a href={task.url} target="_blank" rel="noopener noreferrer"
                      onClick={() => setTimeout(() => completeTask(task._id), 3000)}
                      className="btn-primary text-xs py-1.5 px-3">
                      Open <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {task.required && !done && <span className="text-xs text-red-400">Required</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="card p-6 space-y-4">
        <h3 className="text-white font-semibold text-sm">Human Verification</h3>

        <div className="space-y-3">
          <div className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all select-none ${verifyChallenge ? "border-brand-500/30" : "border-surface-border"}`}
            onClick={() => setVerifyChallenge(true)}>
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${verifyChallenge ? "border-brand-500 bg-brand-500" : "border-slate-600"}`}>
              {verifyChallenge && <CheckCircle2 className="w-3 h-3 text-white" />}
            </div>
            <span className="text-sm text-white">I am not a robot</span>
            <Shield className="w-4 h-4 text-slate-500 ml-auto" />
          </div>

          {verifyChallenge && !humanVerified && (
            <div className="bg-surface rounded-xl p-4 space-y-3 border border-surface-border">
              <p className="text-xs text-slate-400">Solve this to verify:</p>
              <p className="text-white font-medium">{puzzleQuestion.q}</p>
              <div className="flex gap-2">
                <input
                  type="number"
                  className="input text-sm py-2"
                  placeholder="Your answer"
                  value={puzzleAnswer}
                  onChange={(e) => setPuzzleAnswer(e.target.value)}
                />
                <button
                  onClick={() => {
                    if (puzzleAnswer === puzzleQuestion.a) {
                      setHumanVerified(true);
                      toast.success("Verified!");
                    } else {
                      toast.error("Wrong answer");
                      setPuzzleAnswer("");
                    }
                  }}
                  className="btn-primary text-sm px-4 py-2 shrink-0">
                  Check
                </button>
              </div>

              <div className="pt-2 border-t border-surface-border">
                <p className="text-xs text-slate-400 mb-2">Also click the button {requiredClicks} times:</p>
                <button
                  onClick={() => setClickCount((c) => Math.min(c + 1, requiredClicks))}
                  className={`w-full py-2 rounded-xl text-sm font-medium border transition-colors ${clickCount >= requiredClicks ? "border-green-500/30 bg-green-500/10 text-green-400" : "border-surface-border bg-surface text-slate-300 hover:border-brand-500/30"}`}>
                  {clickCount >= requiredClicks ? "✓ Done" : `Click me (${clickCount}/${requiredClicks})`}
                </button>
              </div>
            </div>
          )}

          {humanVerified && (
            <div className="flex items-center gap-2 text-green-400 text-sm p-3 rounded-xl bg-green-500/5 border border-green-500/20">
              <CheckCircle2 className="w-4 h-4" /> Verification complete
            </div>
          )}
        </div>
      </div>

      <button
        onClick={handleProceed}
        disabled={!canProceed || loading}
        className="btn-primary w-full justify-center text-base py-4 disabled:opacity-40">
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : countdown > 0 ? `Wait ${countdown}s...` : !allRequiredDone ? "Complete all tasks first" : !humanVerified ? "Verify you're human" : "Get Access"}
      </button>
    </div>
  );
}
