import { NextRequest } from "next/server";
import { getUsers } from "./handlers/get-user";
import { createOrUpdateUser } from "./handlers/create-user";
import { updateUser } from "./handlers/update-user";
import { deleteUser } from "./handlers/delete-user";


export const GET = async (request: NextRequest) => getUsers(request);
export const POST = async (request: NextRequest) => createOrUpdateUser(request);
export const PATCH = async (request: NextRequest) => updateUser(request);
export const DELETE = async (request: NextRequest) => deleteUser(request);