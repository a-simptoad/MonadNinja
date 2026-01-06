import { useEffect, useState, useRef } from "react";
import PhaserGame from "@/components/PhaserGame";
import PostGameModal from "@/components/PostGameModal";
import { getGameInstance } from "@/game/Game";

import { 
  useWriteContract, 
  useAccount, 
  useWaitForTransactionReceipt, 
  usePublicClient,
  useBalance,
  useReadContract,
} from "wagmi";
import { parseEventLogs } from "viem"; 
import { abi } from "@/config/abi";
import { monadTestnet } from "@/config/wagmi";

export default function GameArena({ contractAddress, txHash, setSeed, setTxHash }: { contractAddress: `${string}` | undefined; txHash: `0x${string}` | undefined; setSeed: (seed: string) => void; setTxHash: (hash: `0x${string}` | undefined) => void }) {
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

  const { writeContract, isPending: isWalletOpening, isError: isWalletError } = useWriteContract({ 
    mutation: { 
      onSuccess: (hash) => setTxHash(hash),
      onError: (err) => {
        if(err.name == "ContractFunctionExecutionError"){
          window.alert('Insufficient Balance\n\nCopy the embedded wallet address and fund it with testnet MON to play the game.');
          return;
        }
        window.alert('Tx error:' + err.message);},
    }, 
  });

  const { data: entropyFee, refetch } = useReadContract({
      address: "0xAcF8E4876C44e9E16E8aa994F1890A7b6baD3f4c" as `0x${string}`,
      abi: abi,
      functionName: "getEntropyFee",
  });

  const getBalance = useBalance({ address: address });

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isConfirmed && receipt && !sequenceNumber) {
        try {
            const logs = parseEventLogs({
                abi: abi,
                eventName: 'RandomnessRequested',
                logs: receipt.logs, 
            });

            if (logs.length > 0) {
                const seq = logs[0].args.sequenceNumber;
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
                address: contractAddress as `0x${string}`,
                abi: abi,
                eventName: 'RandomnessResult',
                fromBlock: receipt ? receipt.blockNumber : 'earliest', 
            });

            const match = logs.find(log => log.args.sequenceNumber === sequenceNumber);
            
            if (match) {
              const seed = match.args.randomNumber.toString();
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
          game.events.on('gameover', (data: {score: number, seed: string, multiplier: number}) => {
            setScore(data.score);
            setMultiplier(data.multiplier);
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
    if(!address) {
      window.alert('Please connect your wallet to start the game.');
      return;
    }
    if(getBalance?.data && getBalance.data.value < entropyFee! + 100000000000000000n) {
      window.alert('Insufficient balance to start the game. You need at least 0.20 MON.\nTry adding tokens to your embedded wallet address: ' + address);
      return;
    }
    
    setSequenceNumber(null);
    setRandomNumber(""); 
    setGameStarted(false);
    setTxHash(undefined);
    
    writeContract({
      address: contractAddress as `0x${string}`,
      abi: abi,
      functionName: 'requestRandomNumber',
      account: address,
      chain: monadTestnet, 
      value: entropyFee! + 50000000000000000n, 
    });
  }

  const isWaitingForOracle = isConfirmed && sequenceNumber && !gameStarted;
  const isProcessing = isWalletOpening || isConfirming || isWaitingForOracle;
  const errorOccured = isWalletError;

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="w-full bg-card border-2 border-lime-500 rounded-lg overflow-hidden">
        <div className="relative w-full bg-gradient-to-b from-card to-slate-950 aspect-video flex items-center justify-center">
          
          {!gameStarted ? (
            <div className="text-center">
               <div className="w-20 h-20 rounded-full bg-lime-900 flex items-center justify-center mx-auto mb-4">
                <div className="w-16 h-16 rounded-full bg-card flex items-center justify-center text-3xl animate-pulse">
                  {errorOccured ? "❌" : isWaitingForOracle ? "🔮" : (isProcessing ? "⏳" : "🥷")}
                </div>
              </div>

              <h2 className="text-2xl font-bold text-foreground mb-2">
                {errorOccured ? "Error Occurred" : isWaitingForOracle ? "Summoning Oracle..." : 
                 isProcessing ? "Processing..." : "Ready to Slice?"}
              </h2>

              <p className="text-sm text-muted-foreground mb-6">
                 {errorOccured ? "An error occurred. Please try again." : isWaitingForOracle ? `Waiting for Random Seed #${sequenceNumber?.toString()}...` : 
                  isConfirming ? "Confirming transaction..." : "Get your VRF seed and start the game"}
              </p>

              {(errorOccured || !isProcessing) && (
                  <button onClick={handleStart} className="px-8 py-3 bg-lime-600 text-accent-foreground font-bold rounded-lg hover:opacity-90 transition-opacity">
                    Start Game (Fee + 0.05 MON)
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