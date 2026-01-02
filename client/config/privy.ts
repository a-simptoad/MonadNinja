import type {PrivyClientConfig} from '@privy-io/react-auth';
import { monadTestnet } from 'viem/chains';

// Replace this with your Privy config
export const privyConfig: PrivyClientConfig = {
    defaultChain: monadTestnet,
    supportedChains: [monadTestnet],
    embeddedWallets: {
        ethereum: {
            createOnLogin: 'all-users',
        },
        showWalletUIs: false,
        priceDisplay: {
            primary: 'native-token',
            secondary: null,
        }
    },
    loginMethods: ['wallet', 'email'],
    appearance: {
        theme: 'dark',
        showWalletLoginFirst: true,
    }
};