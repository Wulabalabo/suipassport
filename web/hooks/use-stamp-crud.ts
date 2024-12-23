'use client'

import { useState } from 'react'
import type { ClaimStamp } from '@/lib/validations/claim-stamp'

export function useClaimStamps() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const listClaimStamps = async (params?: Record<string, string | number>) => {
    try {
      setIsLoading(true)
      const stampId = params?.stampId
      const queryParams = stampId ? `?stampId=${stampId}` : ''
      const response = await fetch(`/api/claim-stamps${queryParams}`)
      const result = await response.json()
      return result.data
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch claim stamps'))
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const getClaimStamp = async (id: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/claim-stamps/${id}`)
      const result = await response.json()
      return result.data
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch claim stamp'))
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const updateClaimStamp = async (id: string, data: ClaimStamp) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/claim-stamps/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await response.json()
      return result.data
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update claim stamp'))
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const deleteClaimStamp = async (id: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/claim-stamps/${id}`, {
        method: 'DELETE'
      })
      const result = await response.json()
      return result.data
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete claim stamp'))
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    error,
    listClaimStamps,
    getClaimStamp,
    updateClaimStamp,
    deleteClaimStamp
  }
}