'use client'

import { ConnectButton } from '@mysten/dapp-kit'


export function MainNav() {  

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="lg:h-32 lg:px-24 w-full h-[68px] px-6 bg-white border-b border-[#e3f4ff] justify-between items-center inline-flex">
        <div className="text-center"><span className="text-blue-400 text-2xl font-medium leading-loose tracking-tight lg:font-bold lg:text-4xl">Sui </span><span className="text-black text-2xl font-medium leading-loose tracking-tight lg:font-bold lg:text-4xl">Passport</span></div>
        <ConnectButton />
      </div>
    </header>
  )
} 