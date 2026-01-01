import { X, ExternalLink, Star, Save, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { useState, useEffect } from "react";
import { abi } from "@/config/abi";
import { monadTestnet } from "@/config/wagmi";

interface PostGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: number;
  multiplier: number;
  txHash: string;
  name?: string;
}

export default function PostGameModal({
  isOpen,
  onClose,
  score,
  multiplier,
  txHash,
  name,
}: PostGameModalProps) {
  const finalScore = Math.floor(score * multiplier);
  const { address } = useAccount();
  
  // State for the name input
  const [playerName, setPlayerName] = useState(name || "");
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Wagmi Hooks for writing to contract
  const { data: hash, writeContract, isPending: isWritePending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ 
    hash 
  });

  // Update local state if prop changes
  useEffect(() => {
    if (name) setPlayerName(name);
  }, [name]);

  // Handle the contract call
  const handleUpdateScore = () => {
    if (!playerName.trim()) return;

    writeContract({
      address: '0xe599053caC076EB4de7EF7772f5bE66f2AaF755b', // Your Contract Address
      abi: abi,
      functionName: 'updateScore',
      args: [playerName, BigInt(finalScore)], // name (string), score (uint256)
      chain: monadTestnet,
      account: address,
    });
    setHasSubmitted(true);
  };

  const isProcessing = isWritePending || isConfirming;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-md bg-card border-2 border-primary rounded-lg p-6 relative"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 hover:bg-input rounded transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                GAME OVER
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                You sliced through the matrix!
              </p>
            </div>

            {/* Score Display */}
            <div className="space-y-4 mb-6">
              <div className="bg-input rounded-lg p-4 text-center">
                <p className="text-xs uppercase text-muted-foreground font-semibold tracking-wider mb-1">
                  Final Score
                </p>
                <p className="text-5xl font-black bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                  {finalScore.toLocaleString()}
                </p>
              </div>

              {/* Score Breakdown */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Base Score:</span>
                  <span className="text-foreground">{score.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Multiplier:</span>
                  <span className="text-secondary font-bold">{multiplier.toFixed(1)}x</span>
                </div>
              </div>
            </div>

            {/* Transaction Hash */}
            <div className="mb-6 p-3 bg-input rounded border border-border">
              <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">
                Game Session TX
              </p>
              <code className="text-xs font-mono text-accent break-all text-wrap block">
                {txHash || "No TX Hash"}
              </code>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              
              {/* --- NEW: Update Score Section --- */}
              <div className="bg-slate-900/50 p-3 rounded-lg border border-border space-y-3">
                
                {!isConfirmed && !hasSubmitted ? (
                    <>
                        {/* Name Input */}
                        <div>
                            <label className="text-xs text-muted-foreground uppercase font-bold ml-1">Enter Nickname</label>
                            <input 
                                type="text" 
                                value={playerName}
                                onChange={(e) => setPlayerName(e.target.value)}
                                placeholder="Ninja Name"
                                maxLength={15}
                                className="w-full mt-1 px-3 py-2 bg-black border border-input rounded focus:outline-none focus:border-primary text-white placeholder:text-gray-600"
                            />
                        </div>

                        {/* Submit Button */}
                        <button 
                            onClick={handleUpdateScore}
                            disabled={isProcessing || !playerName.trim()}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-secondary to-accent hover:opacity-90 transition-opacity text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save to Leaderboard
                                </>
                            )}
                        </button>
                    </>
                ) : isConfirmed ? (
                    <div className="text-center py-2">
                        <p className="text-green-400 font-bold flex items-center justify-center gap-2">
                            <Star className="w-4 h-4 fill-green-400" />
                            Score Saved to Chain!
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Check the leaderboard to see your rank.</p>
                    </div>
                ) : (
                    // Transaction sent but waiting for confirmation
                    <div className="text-center py-2 text-yellow-500 flex flex-col items-center">
                         <Loader2 className="w-6 h-6 animate-spin mb-2" />
                         <span className="font-bold text-sm">Confirming Transaction...</span>
                    </div>
                )}
                
                {/* Error Message */}
                {error && (
                    <p className="text-xs text-red-500 text-center">{error.message.slice(0, 50)}...</p>
                )}
              </div>
              {/* --- END New Section --- */}

              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary to-primary hover:opacity-90 transition-opacity text-primary-foreground font-bold rounded-lg">
                <ExternalLink className="w-4 h-4" />
                Verify on Explorer
              </button>

              <button
                onClick={onClose}
                className="w-full px-4 py-3 border border-border hover:bg-input transition-colors text-foreground font-bold rounded-lg"
              >
                Play Again
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}