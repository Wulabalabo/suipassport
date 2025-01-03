
import { NextRequest } from "next/server";
import { getStamps } from "./handlers/get-stamps"; 
import { updateStamps } from "./handlers/update-stamps";


export const GET = async () => getStamps();
export const POST = async (request: NextRequest) => updateStamps(request);
