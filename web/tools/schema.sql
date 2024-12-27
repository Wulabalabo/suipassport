-- 删除已存在的表（如果需要）
DROP TABLE IF EXISTS claim_stamps;
DROP TABLE IF EXISTS users;

-- 创建 claim_stamps 表
CREATE TABLE claim_stamps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stamp_id TEXT,
    claim_code TEXT,
    total_count_limit INTEGER,
    user_count_limit INTEGER DEFAULT 1,
    claim_count INTEGER DEFAULT 0,
    claim_code_start_timestamp INTEGER,
    claim_code_end_timestamp INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引以优化查询
CREATE INDEX idx_stamp_id ON claim_stamps(stamp_id);
CREATE INDEX idx_claim_code ON claim_stamps(claim_code);
CREATE INDEX idx_timestamps ON claim_stamps(claim_code_start_timestamp, claim_code_end_timestamp);

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    address TEXT NOT NULL UNIQUE,
    stamps JSON,  -- Cloudflare D1 supports JSON type for storing arrays
    points INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_address ON users(address);
