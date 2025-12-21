import { Trophy, ExternalLink } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  nickname: string;
  score: number;
  multiplier: number;
  txHash: string;
}

const mockLeaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    nickname: "ShadowSlice",
    score: 45320,
    multiplier: 2.5,
    txHash: "0x3a2f...8b1c",
  },
  {
    rank: 2,
    nickname: "NinjaCode",
    score: 42150,
    multiplier: 2.1,
    txHash: "0x7b4e...9d2a",
  },
  {
    rank: 3,
    nickname: "ZenBlade",
    score: 38900,
    multiplier: 1.95,
    txHash: "0x5c9d...3f7e",
  },
  {
    rank: 4,
    nickname: "CryptoSlice",
    score: 35670,
    multiplier: 1.8,
    txHash: "0x2a1b...6c4d",
  },
  {
    rank: 5,
    nickname: "MonadMaster",
    score: 32450,
    multiplier: 1.65,
    txHash: "0x9e8f...2b5a",
  },
];

export default function Leaderboard() {
  return (
    <div className="w-full bg-card border border-border rounded-lg p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Trophy className="w-6 h-6 text-secondary" />
        <h2 className="text-xl font-bold text-foreground">Top Slicers</h2>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-3 text-xs uppercase text-muted-foreground font-semibold">
                Rank
              </th>
              <th className="text-left py-3 px-3 text-xs uppercase text-muted-foreground font-semibold">
                Slicers
              </th>
              <th className="text-right py-3 px-3 text-xs uppercase text-muted-foreground font-semibold">
                Score
              </th>
              <th className="text-right py-3 px-3 text-xs uppercase text-muted-foreground font-semibold">
                Multiplier
              </th>
              <th className="text-center py-3 px-3 text-xs uppercase text-muted-foreground font-semibold">
                Verify
              </th>
            </tr>
          </thead>
          <tbody>
            {mockLeaderboard.map((entry) => (
              <tr
                key={entry.rank}
                className="border-b border-border hover:bg-input transition-colors"
              >
                <td className="py-4 px-3">
                  <div className="flex items-center justify-center">
                    {entry.rank === 1 ? (
                      <span className="text-lg">🥇</span>
                    ) : entry.rank === 2 ? (
                      <span className="text-lg">🥈</span>
                    ) : entry.rank === 3 ? (
                      <span className="text-lg">🥉</span>
                    ) : (
                      <span className="font-bold text-muted-foreground">
                        #{entry.rank}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-4 px-3">
                  <span className="font-semibold text-foreground">
                    {entry.nickname}
                  </span>
                </td>
                <td className="py-4 px-3 text-right">
                  <span className="font-bold text-accent">
                    {entry.score.toLocaleString()}
                  </span>
                </td>
                <td className="py-4 px-3 text-right">
                  <span className="font-bold text-secondary">
                    {entry.multiplier}x
                  </span>
                </td>
                <td className="py-4 px-3 text-center">
                  <button className="inline-flex items-center justify-center p-2 hover:bg-border rounded transition-colors">
                    <ExternalLink className="w-4 h-4 text-primary" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-4 p-3 bg-input rounded text-xs text-muted-foreground text-center">
        Updated every 30 seconds • All scores verified on-chain
      </div>
    </div>
  );
}
