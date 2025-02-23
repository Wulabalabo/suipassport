
import { NextRequest } from "next/server";
import { getStamps } from "./handlers/getStamps"; 
import { createStamp } from "./handlers/createStamp";


export const GET = async () => getStamps();
export const POST = async (request: NextRequest) => createStamp(request);
