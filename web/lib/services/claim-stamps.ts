import { queryD1 } from '@/lib/db';
import type { ClaimStamp } from '@/lib/validations/claim-stamp';
import type { SafeClaimStamp } from '@/types/db';

export async function getClaimStamps() {
  try {
    const query = `
    SELECT 
      stamp_id, 
      claim_code_start_timestamp, 
      claim_code_end_timestamp,
      total_count_limit,
      user_count_limit,
      claim_count,
      CASE WHEN claim_code IS NULL THEN 0 ELSE 1 END as has_claim_code
    FROM claim_stamps`;
    
    const response = await queryD1<SafeClaimStamp[]>(query);    
    return response.data;
  } catch (error) {
    console.error('Error fetching claim stamps:', error);
    throw error;
  }
}

export async function createClaimStamp(data: ClaimStamp) {
  return queryD1<ClaimStamp>(
    `INSERT OR REPLACE INTO claim_stamps (
      stamp_id, 
      claim_code, 
      claim_code_start_timestamp, 
      claim_code_end_timestamp,
      total_count_limit,
      user_count_limit
    ) VALUES (?, ?, ?, ?, ?, ?)
    RETURNING *`,
    [
      data.stamp_id,
      data.claim_code,
      data.claim_code_start_timestamp,
      data.claim_code_end_timestamp,
      data.total_count_limit,
      data.user_count_limit
    ]
  );
}


export async function getClaimStampById(id: string) {
  return queryD1<SafeClaimStamp>(
    'SELECT stamp_id, claim_code_start_timestamp, claim_code_end_timestamp FROM claim_stamps WHERE stamp_id = ?',
    [id]
  );
}

export async function updateClaimStamp(id: string, data: ClaimStamp) {
  return queryD1<ClaimStamp>(
    `UPDATE claim_stamps 
       SET claim_code = ?,
           claim_code_start_timestamp = ?,
           claim_code_end_timestamp = ?
       WHERE stamp_id = ?
       RETURNING *`,
    [
      data.claim_code,
      data.claim_code_start_timestamp,
      data.claim_code_end_timestamp,
      id
    ]
  );
}

export async function increaseClaimStampCount(id: string) {
  const query = `
    UPDATE claim_stamps 
    SET claim_count = COALESCE(claim_count, 0) + 1 
    WHERE stamp_id = ? 
    RETURNING *
  `;
  return queryD1<ClaimStamp>(query, [id]);
}

export async function deleteClaimStamp(id: string) {
  return queryD1<ClaimStamp>(
    'DELETE FROM claim_stamps WHERE id = ? RETURNING *',
    [id]
  );
}