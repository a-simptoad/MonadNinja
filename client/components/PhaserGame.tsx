import { useEffect } from "react";
import { startGame, destroyGame } from "@/game/Game";

export default function PhaserGame() {
  useEffect(() => {
    startGame();

    return () => {
      destroyGame();
    };
  }, []);

  return (
    <div
      id="phaser-game"
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    />
  );
}
