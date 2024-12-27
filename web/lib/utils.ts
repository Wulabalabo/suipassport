import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { bcs } from "@mysten/sui/bcs"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function truncateAddress(address: string): string {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function getDataFromEffects(effects: string){
  const data = bcs.TransactionEffects.fromBase64(effects)
  return data.V2?.transactionDigest
}

export function getChangedObjectsFromDigest(digest: string){
  const data = bcs.TransactionEffects.fromBase64(digest)
  return data.V2?.changedObjects
}