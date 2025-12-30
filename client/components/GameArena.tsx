import { useEffect, useState, useRef } from "react";
import PhaserGame from "@/components/PhaserGame";
import PostGameModal from "@/components/PostGameModal";
import { getGameInstance } from "@/game/Game";

import { 
  useWriteContract, 
  useAccount, 
  useWaitForTransactionReceipt, 
  usePublicClient 
} from "wagmi";
import { parseEventLogs } from "viem"; 
import { abi } from "@/config/abi";
import { monadTestnet } from "@/config/wagmi";

export default function GameArena({ txHash, setSeed, setTxHash }: { txHash: `0x${string}` | undefined; setSeed: (seed: string) => void; setTxHash: (hash: `0x${string}` | undefined) => void }) {
  const [gameStarted, setGameStarted] = useState(false);
  const [showPostGameModal, setShowPostGameModal] = useState(false);
  const [score, setScore] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [randomNumber, setRandomNumber] = useState<string>(""); 
  
  const [sequenceNumber, setSequenceNumber] = useState<bigint | null>(null);

  const { address } = useAccount();
  const publicClient = usePublicClient(); 
  
  const isPollingRef = useRef(false);

  const { 
    data: receipt, 
    isLoading: isConfirming, 
    isSuccess: isConfirmed 
  } = useWaitForTransactionReceipt({ hash: txHash });

  const { writeContract, isPending: isWalletOpening } = useWriteContract({ 
    mutation: { 
      onSuccess: (hash) => setTxHash(hash),
      onError: (err) => console.error('Tx error:', err),
    }, 
  });

  useEffect(() => {
    if (isConfirmed && receipt && !sequenceNumber) {
        try {
            console.log("Transaction confirmed. Parsing for Sequence Number...");
            const logs = parseEventLogs({
                abi: abi,
                eventName: 'RandomnessRequested',
                logs: receipt.logs, 
            });

            if (logs.length > 0) {
                const seq = logs[0].args.sequenceNumber;
                console.log("🎟️ Sequence Number Found:", seq.toString());
                setSequenceNumber(seq); 
            } else {
                console.error("Could not find RandomnessRequested event in logs!");
            }
        } catch (e) { 
            console.error("Error parsing logs:", e); 
        }
    }
  }, [isConfirmed, receipt, sequenceNumber]);

  useEffect(() => {
    let pollInterval: NodeJS.Timeout;

    const pollForOracle = async () => {
        if (!sequenceNumber || !publicClient || gameStarted || isPollingRef.current) return;
        
        isPollingRef.current = true;

        try {
            const logs = await publicClient.getContractEvents({
                address: `0x5b48bb90b908c0e9fd3190c1dc14c5ca25841a8c`,
                abi: abi,
                eventName: 'RandomnessResult',
                fromBlock: receipt ? receipt.blockNumber : 'earliest', 
            });

            const match = logs.find(log => log.args.sequenceNumber === sequenceNumber);
            
            if (match) {
              const seed = match.args.randomNumber.toString();
                console.log("✅ ORACLE FOUND!", seed);
                setRandomNumber(seed);
                setSeed(seed);
                setGameStarted(true);
                clearInterval(pollInterval);
            }
        } catch (err) {
            console.error("Polling error:", err);
        } finally {
            isPollingRef.current = false;
        }
    };

    if (sequenceNumber && !gameStarted) {
        pollForOracle();
        pollInterval = setInterval(pollForOracle, 2000);
    }

    return () => {
        if (pollInterval) clearInterval(pollInterval);
    };
  }, [sequenceNumber, gameStarted, publicClient, receipt]);


  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let game: Phaser.Game | null = null;

    if (gameStarted) {
      intervalId = setInterval(() => {
        game = getGameInstance();
        if (game) {
          clearInterval(intervalId);
          game.events.off('gameover'); 
          game.events.on('gameover', (data: {score: number, seed: string}) => {
            setScore(data.score);
            setShowPostGameModal(true);
          });
        }
      }, 100);
    }
    return () => {
      clearInterval(intervalId);
      if (game) game.events.off('gameover');
    };
  }, [gameStarted]);
  
  function handleStart() {
    if(!address) return;
    
    setSequenceNumber(null);
    setRandomNumber(""); 
    setGameStarted(false);
    setTxHash(undefined);
    
    writeContract({
      address: `0x5b48bb90b908c0e9fd3190c1dc14c5ca25841a8c`,
      abi: abi,
      functionName: 'requestRandomNumber',
      account: address,
      chain: monadTestnet, 
      value: 200000000000000000n, 
    });
  }

  const isWaitingForOracle = isConfirmed && sequenceNumber && !gameStarted;
  const isProcessing = isWalletOpening || isConfirming || isWaitingForOracle;

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="w-full bg-card border-2 border-primary rounded-lg overflow-hidden">
        <div className="relative w-full bg-gradient-to-b from-card to-slate-950 aspect-video flex items-center justify-center">
          
          {!gameStarted ? (
            <div className="text-center">
               <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4">
                <div className="w-16 h-16 rounded-full bg-card flex items-center justify-center text-3xl animate-pulse">
                  {isWaitingForOracle ? "🔮" : (isProcessing ? "⏳" : "🥷")}
                </div>
              </div>

              <h2 className="text-2xl font-bold text-foreground mb-2">
                {isWaitingForOracle ? "Summoning Oracle..." : 
                 isProcessing ? "Processing..." : "Ready to Slice?"}
              </h2>

              <p className="text-sm text-muted-foreground mb-6">
                 {isWaitingForOracle ? `Waiting for Random Seed #${sequenceNumber?.toString()}...` : 
                  isConfirming ? "Confirming transaction..." : "Get your VRF seed and start the game"}
              </p>

              {!isProcessing && (
                  <button onClick={handleStart} className="px-8 py-3 bg-gradient-to-r from-secondary to-accent text-accent-foreground font-bold rounded-lg hover:opacity-90 transition-opacity">
                    Start Game (0.15 MON)
                  </button>
              )}
            </div>
          ) : (
            <div className="w-full h-full">
              <PhaserGame seed={randomNumber} />
              <PostGameModal
                  isOpen={showPostGameModal}
                  onClose={() => {
                    setGameStarted(false);
                    setShowPostGameModal(false);
                    setTxHash(undefined);
                    setSequenceNumber(null); 
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