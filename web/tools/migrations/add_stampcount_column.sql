-- 1. 创建临时表，包含新的 stamp_count 字段
CREATE TABLE users_temp (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    address TEXT NOT NULL UNIQUE,
    name TEXT,
    stamp_count INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. 复制现有数据到临时表，stamp_count 初始化为 0
INSERT INTO users_temp (id, address, name, points, created_at, updated_at)
SELECT id, address, name, points, created_at, updated_at
FROM users;

-- 3. 删除原表
DROP TABLE users;

-- 4. 将临时表重命名为正式表
ALTER TABLE users_temp RENAME TO users;

-- 5. 重新创建索引
CREATE INDEX idx_address ON users(address);