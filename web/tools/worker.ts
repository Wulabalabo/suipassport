import { queryD1 } from "@/lib/db";
import { D1Database } from "@cloudflare/workers-types";

interface Env {
    DB: D1Database;
}

type SQLParams = (string | number | null)[];

export default {
    async fetch(request: Request, env: Env) {
        const url = new URL(request.url);

        if (url.pathname === '/query' && request.method === 'POST') {
            try {
                const { sql, params } = await request.json() as { sql: string, params: SQLParams };
                const result = await env.DB.prepare(sql).bind(...(params || [])).all();
                return Response.json({ result });
            } catch (error) {
                return Response.json(
                    { errors: [{ message: error instanceof Error ? error.message : 'Unknown error' }] },
                    { status: 500 }
                );
            }
        }

        return new Response('Not found', { status: 404 });
    },
};