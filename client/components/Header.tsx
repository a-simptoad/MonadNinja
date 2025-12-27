import '@rainbow-me/rainbowkit/styles.css';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Header() {

  return (
    <header className="border-b border-border bg-card backdrop-blur-sm">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-primary-foreground text-lg">
            M
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Monad Ninja
            </h1>
            <p className="text-xs text-muted-foreground">Neo-Arcade Gamefi</p>
          </div>
        </div>

        {/* Center Status */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-sm font-medium text-muted-foreground">
            Monad Testnet
          </span>
        </div>

        <ConnectButton showBalance={false} />
      </div>
    </header>
  );
}
