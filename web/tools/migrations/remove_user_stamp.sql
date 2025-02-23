-- 1. 首先创建一个临时表来存储现有数据（不包含 stamps 字段）
CREATE TABLE users_temp (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    address TEXT NOT NULL UNIQUE,
    name TEXT,
    points INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. 将现有数据复制到临时表（除了 stamps 字段）
INSERT INTO users_temp (id, address, name, points, created_at, updated_at)
SELECT id, address, name, points, created_at, updated_at
FROM users;

-- 3. 删除原始表
DROP TABLE users;

-- 4. 将临时表重命名为正式表
ALTER TABLE users_temp RENAME TO users;

-- 5. 重新创建索引
CREATE INDEX idx_address ON users(address);