interface D1Response<T> {
    success: boolean;
    data?: T;
    error?: string;
}

type SQLParams = (string | number | null)[];

export async function queryD1<T>(
    query: string,
    params?: SQLParams
): Promise<D1Response<T>> {
    try {
        const response = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/d1/database/${process.env.DATABASE_ID}/query`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
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

        return {
            success: true,
            data: result.result as T
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}