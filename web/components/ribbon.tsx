interface RibbonProps {
    text: string
    bgColor: string
    borderColor: string
  }
  
  export function Ribbon({ text, bgColor, borderColor }: RibbonProps) {
    return (
      <div className="absolute -top-1 -right-1">
        <div className="relative">
          <div className={`w-20 h-6 ${bgColor} text-white text-xs flex items-center justify-center`}>
            {text}
          </div>
          <div className={`absolute top-6 right-0 w-0 h-0 border-t-[6px] ${borderColor} border-r-[5px] border-r-transparent`} />
        </div>
      </div>
    )
  }