'use client'

import { Search } from "lucide-react"
import { Input } from "./input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"

interface SearchFilterBarProps {
  searchPlaceholder?: string
  filterPlaceholder?: string
  filterOptions?: Array<{ value: string; label: string }>
  onSearchChange?: (value: string) => void
  onFilterChange?: (value: string) => void
  className?: string
  filterDisabled?: boolean
}

export function SearchFilterBar({
  searchPlaceholder = "Search...",
  filterPlaceholder = "Filter",
  filterOptions = [],
  onSearchChange,
  onFilterChange,
  className = "",
  filterDisabled = false
}: SearchFilterBarProps) {
  return (
    <div className={`flex items-center justify-between gap-x-4 flex-shrink-0 ${className}`}>
      <div className="relative flex-1 w-1/2">
        <Input
          placeholder={searchPlaceholder}
          className="pr-10"
          onChange={(e) => onSearchChange?.(e.target.value)}
        />
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>
      {!filterDisabled && <div className="w-1/2">
        <Select onValueChange={onFilterChange} disabled={filterDisabled}>
          <SelectTrigger>
            <SelectValue placeholder={filterPlaceholder} />
          </SelectTrigger>
          <SelectContent>
            {filterOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
          </Select>
        </div>
      }
    </div>
  )
} 