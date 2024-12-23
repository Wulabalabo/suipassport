-- 删除已存在的表（如果需要）
DROP TABLE IF EXISTS claim_stamps;

-- 创建 claim_stamps 表
CREATE TABLE claim_stamps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stamp_id TEXT,
    claim_code TEXT,
    claim_code_start_timestamp INTEGER,
    claim_code_end_timestamp INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引以优化查询
CREATE INDEX idx_stamp_id ON claim_stamps(stamp_id);
CREATE INDEX idx_claim_code ON claim_stamps(claim_code);
CREATE INDEX idx_timestamps ON claim_stamps(claim_code_start_timestamp, claim_code_end_timestamp);