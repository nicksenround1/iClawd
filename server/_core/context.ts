import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

// Local mode: when OAUTH_SERVER_URL is not set, we auto-create and use a
// built-in local user so all features work without Manus platform login.
const LOCAL_USER_OPEN_ID = "local-user";

async function getOrCreateLocalUser(): Promise<User | null> {
  try {
    let user = await db.getUserByOpenId(LOCAL_USER_OPEN_ID);
    if (!user) {
      await db.upsertUser({
        openId: LOCAL_USER_OPEN_ID,
        name: "Local User",
        email: null,
        loginMethod: "local",
        lastSignedIn: new Date(),
      });
      user = await db.getUserByOpenId(LOCAL_USER_OPEN_ID);
    }
    return user ?? null;
  } catch {
    return null;
  }
}

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  // If OAUTH_SERVER_URL is not configured, run in local mode:
  // automatically authenticate as the built-in local user.
  if (!ENV.oAuthServerUrl) {
    user = await getOrCreateLocalUser();
  } else {
    try {
      user = await sdk.authenticateRequest(opts.req);
    } catch (error) {
      // Authentication is optional for public procedures.
      user = null;
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
