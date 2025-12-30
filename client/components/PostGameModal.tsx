import { X, Share2, ExternalLink, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PostGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: number;
  multiplier: number;
  txHash: string;
}

export default function PostGameModal({
  isOpen,
  onClose,
  score,
  multiplier,
  txHash,
}: PostGameModalProps) {
  const finalScore = Math.floor(score * multiplier);

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
              <div className="flex justify-center gap-1 mb-3">
                {[...Array(3)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-8 h-8 text-secondary fill-secondary"
                  />
                ))}
              </div>
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
                  <span className="text-secondary font-bold">{multiplier}x</span>
                </div>
              </div>
            </div>

            {/* Transaction Hash */}
            <div className="mb-6 p-3 bg-input rounded border border-border">
              <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">
                Verified TX
              </p>
              <code className="text-xs font-mono text-accent break-all text-wrap">
                {txHash}
              </code>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary to-primary hover:opacity-90 transition-opacity text-primary-foreground font-bold rounded-lg">
                <ExternalLink className="w-4 h-4" />
                Verify on Explorer
              </button>

              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-secondary to-accent hover:opacity-90 transition-opacity text-white font-bold rounded-lg">
                <Share2 className="w-4 h-4" />
                Share to X
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
