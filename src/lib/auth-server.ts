import { headers } from "next/headers";
import { auth } from "./auth"
import { UserSchema } from "../schemas";


export const getSession = async () => {
  const session = auth.api.getSession({
    headers: await headers(),
  });

  return session;
}

export const getUser = async () => {
  const session = await getSession();

  return session ? UserSchema.parse(session.user) : null;
}

export const getRequiredUser = async () => {
  const user = await getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  return user;
}