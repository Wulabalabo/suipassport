interface D1Response<T> {
    success: boolean;
    data?: T;
    error?: string;
}

type SQLParams = (string | number | null)[];

export async function checkDatabaseConnection(): Promise<boolean> {
    try {
        const response = await queryD1('SELECT 1');
        return response.success;
    } catch {
        return false;
    }
}

export async function queryD1<T>(
    query: string,
    params?: SQLParams
): Promise<D1Response<T>> {
    const isLocal = process.env.NODE_ENV === 'development';
    const baseUrl = isLocal 
        ? 'http://127.0.0.1:8787'
        : `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/d1/database/${process.env.DATABASE_ID}`;

    try {
        const response = await fetch(
            `${baseUrl}/query`,
            {
                method: 'POST',
                headers: {
                    ...(isLocal ? {} : {
                        'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
                    }),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sql: query,
                    params: params || []
                })
            }
        );

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.errors?.[0]?.message || 'Database query failed');
        }

        // 统一处理 result.result 格式
        const normalizedResult = Array.isArray(result.result) 
            ? result.result[0]
            : result.result;

        return {
            success: true,
            data: normalizedResult as T
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}