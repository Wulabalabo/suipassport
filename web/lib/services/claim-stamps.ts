import { queryD1 } from '@/lib/db';
import type { ClaimStamp } from '@/lib/validations/claim-stamp';

interface SafeClaimStamp {
  stamp_id: string;
  claim_code_start_timestamp: string | null;
  claim_code_end_timestamp: string | null;
  has_claim_code: boolean;
}

export async function getClaimStamps(stampId?: string | null) {
  let query = `
  SELECT 
    stamp_id, 
    claim_code_start_timestamp, 
    claim_code_end_timestamp,
    CASE WHEN claim_code IS NULL THEN 0 ELSE 1 END as has_claim_code
  FROM claim_stamps`;
  const params: (string | number | null)[] = [];
  
  if (stampId) {
    query += ' WHERE stamp_id = ?';
    params.push(stampId);
  }
  
  return queryD1<SafeClaimStamp[]>(query, params);
}

export async function createClaimStamp(data: ClaimStamp) {
  return queryD1<ClaimStamp>(
    `INSERT OR REPLACE INTO claim_stamps (
      stamp_id, 
      claim_code, 
      claim_code_start_timestamp, 
      claim_code_end_timestamp
    ) VALUES (?, ?, ?, ?)
    RETURNING *`,
    [
      data.stamp_id,
      data.claim_code,
      data.claim_code_start_timestamp,
      data.claim_code_end_timestamp
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
  
  export async function deleteClaimStamp(id: string) {
    return queryD1<ClaimStamp>(
      'DELETE FROM claim_stamps WHERE id = ? RETURNING *',
      [id]
    );
  }