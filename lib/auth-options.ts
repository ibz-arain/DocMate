import { AuthOptions, User } from "next-auth";
import { Account, Profile } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";
import { db } from "@/lib/db";
import { compare } from "bcrypt";

interface DbUser {
  id: number;
  username: string;
  password: string;
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          const userResult = await db.execute({
            sql: "SELECT id, username, password FROM users WHERE username = ?",
            args: [credentials.username],
          });

          if (!userResult.rows.length) {
            console.log("No user found with username:", credentials.username);
            return null;
          }

          const userRow = userResult.rows[0] as unknown as DbUser;

          if (!userRow.password) {
            console.log("User found but password hash is missing.");
            return null;
          }

          const isPasswordValid = await compare(
            credentials.password,
            userRow.password
          );

          if (!isPasswordValid) {
            console.log("Invalid password for user:", credentials.username);
            return null;
          }

          return {
            id: String(userRow.id),
            name: userRow.username,
            email: null,
          };
        } catch (error) { 
          console.error("Error during authorization:", error);
          return null;
        } 
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID || "",
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET || "",
      tenantId: process.env.AZURE_AD_TENANT_ID || "",
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }: { user: User; account: Account | null; profile?: Profile | undefined }) {
      if (account && profile && (account.provider === "google" || account.provider === "azure-ad")) {
        const email = profile.email;
        if (!email) {
          console.error("OAuth profile missing email:", profile);
          return false;
        }

        try {
          const existingUserResult = await db.execute({
            sql: "SELECT id, username FROM users WHERE username = ?",
            args: [email],
          });

          if (existingUserResult.rows.length > 0) {
            const existingUser = existingUserResult.rows[0] as unknown as DbUser;
            user.id = String(existingUser.id);
            console.log(`OAuth user found in DB: ${email}, ID: ${user.id}`);
          } else {
            console.log(`OAuth user not found. Creating new user for: ${email}`);
            const newUserResult = await db.execute({
              sql: "INSERT INTO users (username, password) VALUES (?, NULL) RETURNING id",
              args: [email],
            });

            if (newUserResult.rows.length > 0) {
              const newUserId = newUserResult.rows[0].id;
              user.id = String(newUserId);
              user.name = email;
              user.email = email;
              console.log(`New OAuth user created: ${email}, ID: ${user.id}`);
            } else {
              console.error("Failed to create new OAuth user in DB.");
              return false;
            }
          }
          return true;
        } catch (error) {
          console.error("Error during OAuth signIn callback:", error);
          return false;
        }
      }
      
      if (account?.provider === "credentials") {
         return !!user.id;
      }

      return true;
    },

    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user?.id) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
         console.log(`JWT callback: User ID ${user.id} added to token.`);
      }
      return token;
    },

    async session({ session, token }: { session: any; token: JWT }) {
      if (token.id && session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.email = token.email;
        console.log(`Session callback: User ID ${token.id} added to session.`);
      } else {
         console.log("Session callback: No token ID found, session user:", session.user);
      }
      return session;
    },
  },
  pages: {
    signIn: "/account",
  },
  session: {
    strategy: "jwt" as const,
  },
  debug: process.env.NODE_ENV === 'development',
}; 