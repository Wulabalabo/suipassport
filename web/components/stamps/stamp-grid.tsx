import { DisplayStamp } from '@/app/@stamp/page'
import StampCard from './stamp-card'

interface StampGridProps {
  stamps: DisplayStamp[]
  onSelectStamp: (stamp: DisplayStamp) => void
  isMobile?: boolean
}

export function StampGrid({ stamps, onSelectStamp, isMobile = false }: StampGridProps) {
  if (isMobile) {
    return (
      <div className="pt-6 space-y-2">
        {stamps?.map((stamp) => (
          <div
            key={stamp.id}
            onClick={() => onSelectStamp(stamp)}
            className="flex justify-between items-center bg-card border border-border shadow shadow-border rounded-sm p-5 hover:bg-gray-300 transition-colors cursor-pointer"
          >
            <div className="font-bold text-lg">{stamp.name}</div>
            {stamp.isClaimable && <div className="text-blue-400">Claimable</div>}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="pt-6">
      <div className="grid grid-cols-4 gap-6">
        {stamps?.map((stamp) => (
          <StampCard 
            key={stamp.id} 
            stamp={stamp} 
            setSelectedStamp={() => onSelectStamp(stamp)} 
          />
        ))}
      </div>
    </div>
  )
}