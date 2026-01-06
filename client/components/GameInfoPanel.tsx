import { useReadContract } from "wagmi";
import { abi } from "@/config/abi";

export default function GameInfoPanel() {

    const { data: entropyFee } = useReadContract({
        address: "0xAcF8E4876C44e9E16E8aa994F1890A7b6baD3f4c" as `0x${string}`,
        abi: abi,
        functionName: "getEntropyFee",
    });

  return (
    <div className="w-full md:w-80 bg-card border border-border rounded-lg p-4 flex flex-col gap-2">
      {/* Current Seed */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground tracking-wider">
          Before starting the game add some testnet MON to your embedded wallet address to cover transaction fees.
        </label>
      </div>


      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Current Entropy Fee*/}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground tracking-wider">
        </label>
      </div>
    </div>
  );
}
