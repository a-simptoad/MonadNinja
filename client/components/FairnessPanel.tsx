import { Copy, Zap } from "lucide-react";
import { useWaitForTransactionReceipt } from "wagmi";
import { useState, useEffect } from "react";
import { getGameInstance } from "@/game/Game";

interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: "proof" | "event" | "warn";
}

export default function FairnessPanel({ txHash, seed }: { txHash: `0x${string}` | undefined; seed: string }) {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const messages = {
        "Transaction Confirmed": "event", // Hash generated
        "VRF request Submitted": "event", // Received transaction receipt //(comes from txHash)
        "Oracle assigned Sequence": "proof", // Sequence number generated // (comes from receipt logs)
        "Seed Updated": "event", // Seed Updated
        "Game Started": "event", // Game Started
        "Game Ended": "event" // Game Ended
      };

  const { data: receipt, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });
  const game = getGameInstance();
  const [difficulty, setDifficulty] = useState(0);
  const [multiplier, setMultiplier] = useState(1);

  const addLog = (log: LogEntry) => {
    setLogs((prev) => [log, ...prev.slice(0, 9)]); // Keep only the latest 10 logs
  };

  useEffect(() => {
      // Add log for Transaction Confirmed
      if(txHash) {
        const newLog: LogEntry = {
          id: new Date().getTime().toString() + Math.random().toString(),
          timestamp: new Date().toLocaleTimeString(),
          message: "Transaction Confirmed",
          type: messages["Transaction Confirmed"] as "proof" | "event" | "warn",
        };
        addLog(newLog);
      }
  }, [txHash]);

  useEffect(() => {
      // Add log for VRF request Submitted
      if(isConfirmed) {
        const newLog: LogEntry = {
          id: new Date().getTime().toString() + Math.random().toString(),
          timestamp: new Date().toLocaleTimeString(),
          message: "VRF request Submitted",
          type: messages["VRF request Submitted"] as "proof" | "event" | "warn",
        };
        addLog(newLog);
      }
  }, [isConfirmed]);

  useEffect(() => {
      // Add log for Seed Updated
      if(receipt) {
        const newLog: LogEntry = {
          id: new Date().getTime().toString() + Math.random().toString(),
          timestamp: new Date().toLocaleTimeString(),
          message: "Oracle assigned Sequence",
          type: messages["Oracle assigned Sequence"] as "proof" | "event" | "warn",
        };
        addLog(newLog);
      }
  }, [receipt]);

  useEffect(() => {
      // Add log for Seed Updated
      if(seed !== "Start a game to generate a seed") {
        const newLog: LogEntry = {
          id: new Date().getTime().toString() + Math.random().toString(),
          timestamp: new Date().toLocaleTimeString(),
          message: "Seed Updated",
          type: messages["Seed Updated"] as "proof" | "event" | "warn",
        };
        addLog(newLog);
      }
  }, [seed]);

  useEffect(() => {
    if(!game) return;

    game?.events.once('log', (log: { type: "proof" | "event" | "warn"; message: string; timestamp: string }) => {
      const newLog: LogEntry = {
        id: new Date().getTime().toString() + Math.random().toString(),
        timestamp: log.timestamp,
        message: log.message,
        type: log.type,
      };
      addLog(newLog);
    });

    game.events.off('difficulty');

    game?.events.on('difficulty', (data: {message: string, timestamp: string, type: "proof" | "event" | "warn"}) => {
      const newLog: LogEntry = {
        id: new Date().getTime().toString() + Math.random().toString(),
        timestamp: data.timestamp,
        message: data.message,
        type: data.type,
      };
      addLog(newLog);
      setDifficulty((data.message.match(/(\d+(\.\d+)?)%/) ? parseFloat(data.message.match(/(\d+(\.\d+)?)%/)![1]) : 0));
    });

    game?.events.once('gameover', (data: {score: number, seed: string, multiplier: number}) => {
      const newLog: LogEntry = {
        id: new Date().getTime().toString() + Math.random().toString(),
        timestamp: new Date().toLocaleTimeString(),
        message: `Game Over`,
        type: "event",
      };
      addLog(newLog);
      setMultiplier(data.multiplier);
    });
    
    return () => {
      game.events.off('difficulty');
    }
  }, [game]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(seed);
  };

  return (
    <div className="w-full md:w-80 bg-card border border-border rounded-lg p-4 flex flex-col gap-4">
      {/* Header */}
      <h2 className="text-lg font-bold text-foreground">Fairness</h2>

      {/* Current Seed */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Current Seed
        </label>
        <div className="flex items-center gap-2 bg-input rounded p-2">
          <code className="text-xs font-mono text-yellow-200 flex-1 break-all text-wrap">
            {seed}
          </code>
          <button
            onClick={copyToClipboard}
            className="p-1.5 hover:bg-border rounded transition-colors flex-shrink-0"
            title="Copy seed"
          >
            <Copy className="w-3 h-3 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Difficulty Level */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Difficulty
          </label>
          <span className="text-sm font-bold text-white">{difficulty.toFixed(0)}%</span>
        </div>
        <div className="w-full h-2 bg-input rounded-full overflow-hidden">
          <div
            className="h-full bg-yellow-200 transition-all duration-300"
            style={{ width: `${difficulty.toFixed(0)}%` }}
          />
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Live Game Log */}
      <div className="space-y-2 flex-1 flex flex-col">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Live Game Log
        </label>
        <div className="flex-1 bg-input rounded border border-border overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-1 p-3 font-mono text-xs">
            {logs.length === 0 ? (
              <div className="text-muted-foreground">Waiting for events...</div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex gap-2 text-muted-foreground">
                  <span className="text-muted-foreground opacity-60 flex-shrink-0">
                    {log.timestamp}
                  </span>
                  <span className="flex-1">
                    {log.type === "proof" ? (
                      <span className="text-accent">[PROOF]</span>
                    ) : (
                      <span className="text-secondary">[EVENT]</span>
                    )}{" "}
                    {log.message}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Zap className="w-3 h-3 text-yellow-200" />
        <span>On-chain verified</span>
      </div>
    </div>
  );
}
