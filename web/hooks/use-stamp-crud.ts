'use client'

import { useState } from 'react'
import { apiFetch } from '@/lib/apiClient'
import { DbStampResponse, VerifyClaimStampResponse, VerifyStampParams, CreateOrUpdateStampParams } from '@/types/stamp'

export function useStampCRUD() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const getStamps = async () => {
    try {
      setIsLoading(true)
      const response = await apiFetch<{ results: DbStampResponse[] }>(`/api/stamps`,{
        method: 'GET'
      })
      const result = await response

      return result.results as DbStampResponse[]
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch claim stamps'))
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const createStamp = async (params: CreateOrUpdateStampParams) => {
    try {
      setIsLoading(true)
      const response = await apiFetch(`/api/stamps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
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

  const getStampByIdFromDb = async (id: string) => {
    try {
      setIsLoading(true)
      const response = await apiFetch<{ results: DbStampResponse }>(`/api/stamps/${id}`)
      const result = await response
      return result.results
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch claim stamp'))
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const updateStamp = async (params: CreateOrUpdateStampParams) => {  
    try {
      setIsLoading(true)
      const response = await apiFetch<{ results: DbStampResponse }>(`/api/stamps/${params.stamp_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
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

  const increaseStampCount = async (stamp_id: string) => {
    try {
      setIsLoading(true)
      const response = await apiFetch(`/api/stamps/add`, {
        method: 'PATCH',
        body: JSON.stringify({ stamp_id })
      })
      const result = await response
      return result
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to increase claim stamp count'))
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const deleteStamp = async (id: string) => {
    try {
      setIsLoading(true)
      const response = await apiFetch<{ results: DbStampResponse }>(`/api/stamps/${id}`, {
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

  const verifyClaimStamp = async (data: VerifyStampParams) => {
    try {
      const response = await apiFetch<VerifyClaimStampResponse>(`/api/stamps/verify`, {
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
    getStamps,
    getStampByIdFromDb,
    updateStamp,
    deleteStamp,
    createStamp,
    increaseStampCount,
    verifyClaimStamp
  }
}