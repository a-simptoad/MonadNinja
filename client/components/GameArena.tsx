import { useEffect, useState } from "react";
import PhaserGame from "@/components/PhaserGame";
import PostGameModal from "@/components/PostGameModal";
import { getGameInstance } from "@/game/Game";
import { useWriteContract, useAccount, useWaitForTransactionReceipt } from "wagmi";
import { abi } from "@/config/abi";
import { monadTestnet } from "@/config/wagmi";

export default function GameArena() {
  const [gameStarted, setGameStarted] = useState(false);
  const [showPostGameModal, setShowPostGameModal] = useState(false);
  const [score, setScore] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  
  // Initialize with undefined, not empty string, to keep Wagmi happy
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);

  const { address } = useAccount();

  // 1. Monitor the transaction
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ 
    hash: txHash 
  });

  const { writeContract, isPending: isWalletOpening } = useWriteContract({ 
    mutation: { 
      onSuccess: (hash) => { 
        console.log('Tx sent:', hash); 
        setTxHash(hash);
        // REMOVED: setGameStarted(true) here. 
        // We wait for confirmation first!
      }, 
      onError: (err) => { 
        console.error('Tx error:', err);
      },
    }, 
  });  

  // 2. Effect: Start game ONLY when transaction is confirmed on blockchain
  useEffect(() => {
    if (isConfirmed && !gameStarted) {
        console.log("Transaction confirmed! Starting game...");
        setGameStarted(true);
    }
  }, [isConfirmed, gameStarted]);

  // 3. Effect: Attach listeners safely (Polling fixes the race condition)
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let game: Phaser.Game | null = null;

    if (gameStarted) {
      // Poll every 100ms until Phaser is ready
      intervalId = setInterval(() => {
        game = getGameInstance();
        
        if (game) {
          console.log("Phaser instance found, attaching listeners");
          clearInterval(intervalId); // Stop checking

          // Clean up old listeners to be safe
          game.events.off('gameover'); 

          game.events.on('gameover', (data: {score: number, seed: string}) => {
            console.log("Game Over Event Received", data);
            setScore(data.score);
            setShowPostGameModal(true);
          });
        }
      }, 100);
    }

    return () => {
      clearInterval(intervalId);
      if (game) {
        game.events.off('gameover');
      }
    };
  }, [gameStarted]);
  
  function handleStart() {
    if(!address) return;
    
    writeContract({
      address: `0x5b48bb90b908c0e9fd3190c1dc14c5ca25841a8c`,
      abi: abi,
      functionName: 'requestRandomNumber',
      account: address,
      chain: monadTestnet, 
      value: 150000000000000000n, // 0.15 MON
    });
  }

  // Helper to determine UI state
  const isProcessing = isWalletOpening || (txHash && isConfirming);

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="w-full bg-card border-2 border-primary rounded-lg overflow-hidden">
        <div className="relative w-full bg-gradient-to-b from-card to-slate-950 aspect-video flex items-center justify-center">
          
          {!gameStarted ? (
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4">
                <div className="w-16 h-16 rounded-full bg-card flex items-center justify-center text-3xl">
                  {isProcessing ? "⏳" : "🥷"}
                </div>
              </div>

              <h2 className="text-2xl font-bold text-foreground mb-2">
                {isProcessing ? "Summoning Blockchain..." : "Ready to Slice?"}
              </h2>

              <p className="text-sm text-muted-foreground mb-6">
                {isConfirming ? "Waiting for transaction confirmation..." : "Get your VRF seed and start the game"}
              </p>

              {!isProcessing && (
                  <button
                    onClick={handleStart}
                    disabled={isProcessing}
                    className="px-8 py-3 bg-gradient-to-r from-secondary to-accent text-accent-foreground font-bold rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Start Game (0.15 MON)
                  </button>
              )}
            </div>
          ) : (
            <div className="w-full h-full">
              <PhaserGame />
              <PostGameModal
                  isOpen={showPostGameModal}
                  onClose={() => {
                    setGameStarted(false);
                    setShowPostGameModal(false);
                    setTxHash(undefined); // Reset hash for next game
                  }}
                  score={score}
                  multiplier={multiplier}
                  txHash={txHash || ""}
                />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}