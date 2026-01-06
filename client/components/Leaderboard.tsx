import { Trophy, ExternalLink, Loader2 } from "lucide-react";
import { useReadContract, useReadContracts } from "wagmi";
import { abi } from "@/config/abi";
import { useMemo } from "react";

interface LeaderboardEntry {
  rank: number;
  address: `0x${string}`;
  nickname: string;
  score: number;
}

export default function Leaderboard() {
  const CONTRACT_ADDRESS = '0xAcF8E4876C44e9E16E8aa994F1890A7b6baD3f4c' as `0x${string}`;

  const { 
    data: playerAddresses, 
    isLoading: isLoadingAddresses 
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: abi,
    functionName: 'getPlayers',
  });

  const contracts = useMemo(() => {
    if (!playerAddresses) return [];
    
    return (playerAddresses as `0x${string}`[]).map((addr) => ({
      address: CONTRACT_ADDRESS,
      abi: abi,
      functionName: 'getInfo',
      args: [addr],
    }));
  }, [playerAddresses]);

  // runs getInfo in parallel for all players
  const { 
    data: playersData, 
    isLoading: isLoadingInfo 
  } = useReadContracts({
    contracts: contracts,
    query: {
      enabled: !!playerAddresses && playerAddresses.length > 0, // Only run if we have addresses
    }
  });

  const leaderboard = useMemo(() => {
    if (!playerAddresses || !playersData) return [];

    const entries: LeaderboardEntry[] = [];
    const addresses = playerAddresses as `0x${string}`[];

    addresses.forEach((address, index) => {
      const result = playersData[index];

      if (result && result.status === "success" && result.result) {
        // result.result matches the output of getInfo: [string name, uint256 score]
        const [name, score] = result.result as [string, bigint];

        entries.push({
          rank: 0,
          address: address,
          nickname: name || "Anonymous",
          score: Number(score),
        });
      }
    });

    entries.sort((a, b) => b.score - a.score);

    return entries.slice(0, 7).map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));

  }, [playerAddresses, playersData]);

  const isLoading = isLoadingAddresses || isLoadingInfo;

  return (
    <div className="w-full bg-card border border-border rounded-lg p-4 md:p-6">
      <div className="flex items-center gap-3 mb-4">
        <Trophy className="w-6 h-6 text-yellow-500" />
        <h2 className="text-xl font-bold text-foreground">Top 7 Slicers</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-3 text-xs uppercase text-muted-foreground font-semibold">Rank</th>
              <th className="text-left py-3 px-3 text-xs uppercase text-muted-foreground font-semibold">Player</th>
              <th className="text-right py-3 px-3 text-xs uppercase text-muted-foreground font-semibold">Score</th>
              <th className="text-center py-3 px-3 text-xs uppercase text-muted-foreground font-semibold">Verify</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Fetching scores...
                  </div>
                </td>
              </tr>
            ) : leaderboard.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-muted-foreground">
                  No players found yet. Be the first!
                </td>
              </tr>
            ) : (
              leaderboard.map((entry) => (
                <tr
                  key={entry.address}
                  className={`border-b border-border hover:bg-muted/50 transition-colors ${
                    entry.rank <= 3 ? "bg-yellow-500/5" : ""
                  }`}
                >
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-2 font-medium">
                      {entry.rank === 1 ? <span className="text-xl">🥇</span> :
                       entry.rank === 2 ? <span className="text-xl">🥈</span> :
                       entry.rank === 3 ? <span className="text-xl">🥉</span> :
                       <span className="text-muted-foreground ml-1">#{entry.rank}</span>}
                    </div>
                  </td>
                  <td className="py-4 px-3">
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground truncate max-w-[140px]">
                        {entry.nickname}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[100px]">
                        {entry.address.slice(0, 6)}...{entry.address.slice(-4)}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-3 text-right">
                    <span className="font-bold text-white font-mono text-lg">
                      {entry.score.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-4 px-3 text-center">
                    <a 
                      href={`https://testnet.monadexplorer.com/address/${entry.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center p-2 hover:bg-border rounded transition-colors group opacity-50 hover:opacity-100"
                    >
                      <ExternalLink className="w-4 h-4 text-white" />
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-3 bg-muted/30 rounded text-xs text-muted-foreground text-center flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
        Live Data • Verified on Monad Testnet
      </div>
    </div>
  );
}