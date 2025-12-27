import { useEffect, useState } from "react";
import PhaserGame from "@/components/PhaserGame";
import PostGameModal from "@/components/PostGameModal";
import { getGameInstance } from "@/game/Game";

export default function GameArena() {
  const [gameStarted, setGameStarted] = useState(false);
  const [showPostGameModal, setShowPostGameModal] = useState(false);
  const [score, setScore] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [txHash, setTxHash] = useState("");

  useEffect(() => {
    const game = getGameInstance();
    if (gameStarted && game) {
      // You can add any additional logic here if needed when the game starts
      game.events.on('gameover', (data: {score: number, seed: string}) => {
        setScore(data.score);
        setShowPostGameModal(true);
      });
    }

    return () => {
      if (game) {
        game.events.off('gameover');
      }
    };
  }, [gameStarted]); 

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Game Canvas Container */}
      <div className="w-full bg-card border-2 border-primary rounded-lg overflow-hidden">
        <div className="relative w-full bg-gradient-to-b from-card to-slate-950 aspect-video flex items-center justify-center">
          {!gameStarted ? (
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4">
                <div className="w-16 h-16 rounded-full bg-card flex items-center justify-center text-3xl">
                  🥷
                </div>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Ready to Slice?
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Get your VRF seed and start the game
              </p>
              <button
                onClick={() => setGameStarted(true)}
                className="px-8 py-3 bg-gradient-to-r from-secondary to-accent text-accent-foreground font-bold rounded-lg hover:opacity-90 transition-opacity"
              >
                Start Game
              </button>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <PhaserGame />

              <PostGameModal
                      isOpen={showPostGameModal}
                      onClose={() => {
                        setGameStarted(false);
                        setShowPostGameModal(false)
                      }}
                      score={score}
                      multiplier={multiplier}
                      txHash={txHash}
                />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
