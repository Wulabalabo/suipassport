'use client'

import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { CustomConnectButton } from './custom-connect-button'
import { useEffect } from "react"
import { getChangedObjectsFromDigest } from "@/lib/utils"

export function MainNav() {
  const { theme, setTheme } = useTheme()

  const handleTest = async () => {
    const data = getChangedObjectsFromDigest("AQBTAgAAAAAAAEBCDwAAAAAAYBG2AAAAAACYFngAAAAAAIg2AQAAAAAAIL6HiTFzSiaVvrGGdmczvd7UO3C6yNik2ryvHC7QLNG4AQMAAAABIOA30qMe5rFQpaVCUUodhVFJrXl7mRHVoDxYWnsMrf/5AyAWY2Nj9gZ+JI5LNGAS5eYR4w9hjuEhpQeUS60iiHzdqCA2Ahc3liGy8gPSn+TzWT6Iui5XoXRGXFxhHRZ/nq7HASBogQ2rwrAcMZr0YQoOFMF8HXNDjOpyYYjzM3O+yRo5hMs27BAAAAAABipj/wwUtHVNb+7lo06+67P17h4M8j6JTyG4aGdv3KBrAco27BAAAAAAIHlDCOkHsvJ2wBSzRWVHBfmsieSDhcISnc8nHAnJf5++AGCnXZh9zC/VMukyFo5mcBevj804xMJ6rcts/0GzIYaxASCAbyUdrbBudamJIb/LqvJWBXWSj7Tkj0z1We40xSCcuABgp12Yfcwv1TLpMhaOZnAXr4/NOMTCeq3LbP9BsyGGsQCEBGGtziJIwHzx58bfJEIaXHprsjvRmZgXgbRjlV+JkgABIAwLFCXB7EdjD4aYtvqy5vLXzFVaPLBalnWusdTpQfWOAGCnXZh9zC/VMukyFo5mcBevj804xMJ6rcts/0GzIYaxAar9+muHvjehZLLdOXdL3h4OdBCMKyF2zzPzTwiDl+t1Aco27BAAAAAAINugIoDhr9XsVrVbQXO/gNGi7yi6+TT8xu1GB46bmdq5AsY27BAAAAAAASDIbkk0JoZH/dzNe1EXttgXyuNu9DjAJjieZS1w1NtARQLGNuwQAAAAAAC9CjGamFhkGpu7Fnn+a71FTLfNFbhWvHxjVgYZRjx/BwHKNuwQAAAAACAoXh05+B9DLPo+0zyKcjMJGJ1owu8vl6t3mw/5YbcpbgBgp12Yfcwv1TLpMhaOZnAXr4/NOMTCeq3LbP9BsyGGsQEg9kwZ22qM4znX/lmJmCq/ZvzefPUBHafnRxcm5V77dHwAYKddmH3ML9Uy6TIWjmZwF6+PzTjEwnqty2z/QbMhhrEAyTCA1Ua/47vkdknDXRLbX0zwMVYB/1rpFu5d4d8+jUAByjbsEAAAAAAgNsN0Bj/hjGKYIgWtxdeoeOGwkncX4yxApgOFj3XVcqoBqv36a4e+N6Fkst05d0veHg50EIwrIXbPM/NPCIOX63UBICgk6gleV/BsuZ/hC++Ub4Z8rq6I+ITSLgKGQVbFQEuLAar9+muHvjehZLLdOXdL3h4OdBCMKyF2zzPzTwiDl+t1APhKzcV9yY3iFulUiCUcevn0CANFS4vcWcC62ey9FJVQAAEgCGNsaGLqxz47XROVN8Vbfsv5jS83XY9mpkaFLfmP83MBYbjIwZ/I7CnLoBp2GAKCdknrtHkGzw4N4VV/dwQf0x4BAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGAKS1uQ8AAAAAIBTMjXBeeUEf4yzYMgDzBuQ+BjI/QGvaJdxdv1cCExmXAA==".trim())
    console.log(data)
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