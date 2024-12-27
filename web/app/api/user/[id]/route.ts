
import { NextRequest } from "next/server";
import { getUserByAddress } from "../handlers/get-user-by-id";

export const GET = async (request: NextRequest) => getUserByAddress(request);