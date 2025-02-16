import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function auth() {
  const session = await getServerSession(authOptions);
  return session;
}

export type Session = Awaited<ReturnType<typeof auth>>;

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
} 