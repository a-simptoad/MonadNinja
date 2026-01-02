import { Wallet, LogOut, Copy } from 'lucide-react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useSetActiveWallet } from '@privy-io/wagmi';
import { useEffect } from 'react';

export default function Header() {
  const { ready, login, logout, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const { setActiveWallet } = useSetActiveWallet();

  const embeddedWallet = wallets.find((wallet) => wallet.walletClientType === 'privy');
  const externalWallet = wallets.find((wallet) => wallet.walletClientType !== 'privy');
  
  useEffect(() => {
    if (embeddedWallet) {
      setActiveWallet(embeddedWallet);
    }
  }, [embeddedWallet, setActiveWallet]);

  const copyAddress = () => {
    if (embeddedWallet) navigator.clipboard.writeText(embeddedWallet.address);
  };

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

        {/* --- Login / Wallet Section --- */}
        <div>
          {authenticated && embeddedWallet ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-lime-900 font-semibold text-primary-foreground text-sm">
              <Wallet className="w-4 h-4" />
              <span>
                {embeddedWallet.address.slice(0, 6)}...{embeddedWallet.address.slice(-4)}
              </span>
              
              <div className="h-4 w-px bg-white/20 mx-1" />

              <button 
                onClick={copyAddress} 
                className="hover:text-white/80 transition-colors"
                title="Copy Address"
              >
                <Copy className="w-4 h-4" />
              </button>

              <button 
                onClick={logout} 
                disabled={!ready}
                className="hover:text-red-300 transition-colors ml-1"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button 
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-lime-900 hover:opacity-90 transition-opacity font-semibold text-primary-foreground text-sm" 
              onClick={login}
            >
              Connect
            </button>
          )}
        </div>

      </div>
    </header>
  );
}