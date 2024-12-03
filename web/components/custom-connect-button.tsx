'use client'

import { useState } from 'react'
import { ConnectModal, useAccounts, useDisconnectWallet, useSwitchAccount } from '@mysten/dapp-kit'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, User, Wallet } from 'lucide-react'
import { truncateAddress } from '@/lib/utils'
import { usePathname, useRouter } from 'next/navigation'

export function CustomConnectButton() {
  const [open, setOpen] = useState(false)
  const { mutate: disconnect } = useDisconnectWallet()
  const { mutate: switchAccount } = useSwitchAccount()
  const accounts = useAccounts()
  const router = useRouter()
  const pathname = usePathname()

  if (!accounts.length) {
    return (
      <ConnectModal
        open={open}
        onOpenChange={setOpen}
        trigger={
          <Button variant="outline">
            <Wallet className="mr-2 h-4 w-4" />
            Connect Wallet
          </Button>
        }
      />
    )
  }

  const currentAccount = accounts[0]

  const handleProfile = () => {
    router.push(pathname === '/user' ? '/' : '/user')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <User className="mr-2 h-4 w-4" />
          {truncateAddress(currentAccount.address)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {accounts.length > 1 && (
          <>
            {accounts.map((account) => (
              <DropdownMenuItem
                key={account.address}
                onClick={() => switchAccount({ account })}
              >
                <User className="mr-2 h-4 w-4" />
                {truncateAddress(account.address)}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={handleProfile}>
          <User className="mr-2 h-4 w-4" />
          {pathname === '/user' ? 'Home' : 'Profile'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => {
            disconnect()
            setOpen(false)
        }} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 