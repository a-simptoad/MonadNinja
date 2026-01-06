import { useReadContract } from "wagmi";
import { useEffect } from "react";
import { abi } from "@/config/abi";

export default function GameInfoPanel({txHash}: {txHash: `0x${string}` | undefined}) {
    const gameStarted = !!txHash; // If there's no txHash, the game hasn't started yet

    const { data: entropyFee, refetch } = useReadContract({
        address: "0xAcF8E4876C44e9E16E8aa994F1890A7b6baD3f4c" as `0x${string}`,
        abi: abi,
        functionName: "getEntropyFee",
    });

    // Refetch entropy fee every 5000ms
    useEffect(() => {
        const interval = setInterval(refetch, 5000);
        return () => clearInterval(interval);
    }, []);

  return (
    <div className="w-full md:w-80 bg-card border border-border rounded-lg p-4 flex flex-col gap-2">
      {/* Current Seed */}
      {!gameStarted &&(
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground tracking-wider">
          Before starting the game add some testnet MON to your embedded wallet address to cover transaction fees.
        </label>
        <div className="h-px bg-border" />
      </div>)}

      {/* Current Entropy Fee*/}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-muted-foreground tracking-wider">
                Current Entropy Fee: 
            </label>
            <code className="text-xs font-mono text-yellow-200">
                {entropyFee ? (Number(entropyFee) / 1e18).toFixed(5) + " MON" : "Loading..."}
            </code>
        </div>
      </div>
    </div>
  );
}
