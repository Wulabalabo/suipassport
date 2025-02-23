-- 1. 重命名表
ALTER TABLE claim_stamps RENAME TO stamps;

-- 2. 重新创建索引（SQLite会自动保留索引，但为了清晰起见，这里列出来）
-- 注意：索引名称会保持不变，你也可以选择重命名索引
CREATE INDEX IF NOT EXISTS idx_stamp_id ON stamps(stamp_id);
CREATE INDEX IF NOT EXISTS idx_claim_code ON stamps(claim_code);
CREATE INDEX IF NOT EXISTS idx_timestamps ON stamps(claim_code_start_timestamp, claim_code_end_timestamp);