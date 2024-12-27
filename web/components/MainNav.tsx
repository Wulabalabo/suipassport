'use client'

import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { CustomConnectButton } from './custom-connect-button'
import { useEffect } from "react"
import { useUserCrud } from "@/hooks/use-user-crud"

export function MainNav() {
  const { theme, setTheme } = useTheme()
  const { updateUserData } = useUserCrud()

  const handleTest = async () => {
    await updateUserData("0x2eb40a1c825b4ead061e8cc6be55a9a010a81a31cef89a23cbdfaee8ade6cf1c", "0xf62be7c8b4e92ddf79afe1f3a4686057f8ff3801c51c95495ebc27e54fd16c19", {
      stamp: { id: "0xf62be7c8b4e92ddf79afe1f3a4686057f8ff3801c51c95495ebc27e54fd16c19", claim_count: 1 },
      points: 1
    })
  }

  useEffect(() => {
    console.log(theme)
  }, [theme])

  return (
    <header className="sticky top-0 z-50 w-full bg-background dark:bg-black">
      <div className="lg:h-28 lg:px-24 w-full h-[68px] px-6 border-border flex items-center justify-between border-b">
        <div className="text-center">
          <span className="text-primary text-lg font-medium leading-loose tracking-tight lg:font-bold lg:text-4xl">Sui </span>
          <span className="text-lg font-medium leading-loose tracking-tight lg:font-bold lg:text-4xl">Passport</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleTest}>
            Test
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          <CustomConnectButton />
        </div>
      </div>
    </header>
  )
} 