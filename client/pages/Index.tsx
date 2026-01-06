import { useState } from "react";
import Header from "@/components/Header";
import GameArena from "@/components/GameArena";
import FairnessPanel from "@/components/FairnessPanel";
import Leaderboard from "@/components/Leaderboard";
import PostGameModal from "@/components/PostGameModal";
import GameInfoPanel from "@/components/GameInfoPanel";

export default function Index() {
  const [showPostGameModal, setShowPostGameModal] = useState(false);
  const [seed, setSeed] = useState("Start a game to generate a seed");
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);

  const mockGameResult = {
    score: 18100,
    multiplier: 1.8,
    txHash: "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p",
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="px-4 md:px-6 py-6 max-w-7xl mx-auto">
        {/* Game Section */}
        <div className="space-y-4 mb-8">
          {/* Arena + Fairness Panel */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Game Arena */}
            <div className="flex-1 min-w-0">
              <GameArena contractAddress={"0xAcF8E4876C44e9E16E8aa994F1890A7b6baD3f4c"} txHash={txHash} setSeed={setSeed} setTxHash={setTxHash}/>
            </div>

            {/* Fairness Sidebar */}
            <div className="w-full md:w-80 flex-shrink-0 gap-4 flex flex-col">
              <GameInfoPanel txHash={txHash} />
              <FairnessPanel txHash={txHash} seed={seed} />
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <Leaderboard />
      </main>

      {/* Post-Game Modal */}
      <PostGameModal
        isOpen={showPostGameModal}
        onClose={() => setShowPostGameModal(false)}
        score={mockGameResult.score}
        multiplier={mockGameResult.multiplier}
        txHash={mockGameResult.txHash}
      />
    </div>
  );
}
