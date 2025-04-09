'use client'

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { networkConfig, network } from "@/contracts"
import "@mysten/dapp-kit/dist/index.css";
import { ThemeProvider } from "next-themes";
import { UserProfileProvider } from "@/contexts/user-profile-context";
import { AppProvider } from "@/contexts/app-context";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <SuiClientProvider networks={networkConfig} defaultNetwork={network}>
          <AppProvider>
              <UserProfileProvider>
                <WalletProvider autoConnect stashedWallet={
                  {
                    name: "Sui Passport",
                    network: network,
                  }
                }>
                  {children}
                </WalletProvider>
              </UserProfileProvider>
          </AppProvider>
        </SuiClientProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
