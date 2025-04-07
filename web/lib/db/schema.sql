-- 删除已存在的表（如果需要）
DROP TABLE IF EXISTS stamps;
DROP TABLE IF EXISTS users;

-- 创建 stamps 表
CREATE TABLE stamps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stamp_id TEXT NOT NULL,
    claim_code TEXT,
    total_count_limit INTEGER DEFAULT 0,
    user_count_limit INTEGER DEFAULT 1,
    claim_count INTEGER DEFAULT 0,
    claim_code_start_timestamp INTEGER,
    claim_code_end_timestamp INTEGER,
    public_claim BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引以优化查询
CREATE INDEX idx_stamp_id ON stamps(stamp_id);
CREATE INDEX idx_claim_code ON stamps(claim_code);
CREATE INDEX idx_timestamps ON stamps(claim_code_start_timestamp, claim_code_end_timestamp);

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    address TEXT NOT NULL UNIQUE,
    name TEXT,
    stamp_count INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_address ON users(address);
