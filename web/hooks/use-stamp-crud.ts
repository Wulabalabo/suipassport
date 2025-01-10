'use client'

import { useState } from 'react'
import type { ClaimStamp } from '@/lib/validations/claim-stamp'
import { SafeClaimStamp } from '@/types/db'
import { apiFetch } from '@/lib/apiClient'
import { ClaimStampResponse } from '@/types'
import { VerifyClaimStampRequest } from '@/types/stamp'

export function useClaimStamps() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const listClaimStamps = async () => {
    try {
      setIsLoading(true)
      const response = await apiFetch<{ results: SafeClaimStamp[] }>(`/api/stamps`,{
        method: 'GET'
      })
      const result = await response

      return result.results as SafeClaimStamp[]
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch claim stamps'))
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const createClaimStamp = async (data: ClaimStamp) => {
    try {
      setIsLoading(true)
      const response = await apiFetch(`/api/stamps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await response
      return result
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create claim stamp'))
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const getClaimStamp = async (id: string) => {
    try {
      setIsLoading(true)
      const response = await apiFetch<{ results: SafeClaimStamp[] }>(`/api/stamps/${id}`)
      const result = await response
      return result.results
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
      const response = await apiFetch<{ results: SafeClaimStamp[] }>(`/api/stamps/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await response
      return result.results
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update claim stamp'))
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const increaseClaimStampCount = async (stamp_id: string) => {
    try {
      setIsLoading(true)
      const response = await apiFetch<{ results: SafeClaimStamp[] }>(`/api/stamps/add`, {
        method: 'PATCH',
        body: JSON.stringify({ stamp_id })
      })
      const result = await response
      return result.results
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to increase claim stamp count'))
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const deleteClaimStamp = async (id: string) => {
    try {
      setIsLoading(true)
      const response = await apiFetch<{ results: SafeClaimStamp[] }>(`/api/stamps/${id}`, {
        method: 'DELETE'
      })
      const result = await response
      return result.results
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete claim stamp'))
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const verifyClaimStamp = async (data: VerifyClaimStampRequest) => {
    try {
      const response = await apiFetch<ClaimStampResponse>(`/api/stamps/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await response
      return result
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to verify claim stamp'))
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
    deleteClaimStamp,
    createClaimStamp,
    increaseClaimStampCount,
    verifyClaimStamp
  }
}