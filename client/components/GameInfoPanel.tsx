export default function GameInfoPanel() {

  return (
    <div className="w-full md:w-80 bg-card border border-border rounded-lg p-4 flex flex-col gap-2">
      {/* Header */}
      {/* <h2 className="text-lg font-bold text-foreground">Game Info</h2> */}

      {/* Current Seed */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground tracking-wider">
          Before starting the game add some testnet MON to your embedded wallet address to cover transaction fees.
        </label>
      </div>


      {/* Divider */}
      <div className="h-px bg-border" />

      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground tracking-wider">
        </label>
      </div>
    </div>
  );
}
