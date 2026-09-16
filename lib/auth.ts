import type { NextAuthOptions } from "next-auth"
import { getServerSession } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { type NextRequest } from "next/server"
import * as Effect from "effect/Effect"
import { runEffect } from "@/lib/effect-runtime"
import { getUserIdFromApiKey } from "@/lib/api-keys"
import {
  accountExists,
  createAccount,
  createUser,
  findUserIdByEmail,
  updateUserProfile,
} from "@/db/users"

function env(name: string): string {
  return process.env[name] as string
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: env("GOOGLE_CLIENT_ID"),
      clientSecret: env("GOOGLE_CLIENT_SECRET"),
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false

      try {
        const userId = await runEffect(
          findUserIdByEmail(user.email).pipe(
            Effect.flatMap((existingId) =>
              existingId
                ? Effect.succeed(existingId)
                : createUser({
                    name: user.name,
                    email: user.email!,
                    image: user.image,
                  }).pipe(Effect.map((newUser) => newUser.id)),
            ),
          ),
        )

        if (userId) {
          await runEffect(
            updateUserProfile({
              id: userId,
              name: user.name,
              image: user.image,
            }),
          )
        }

        user.id = userId

        if (account) {
          const exists = await runEffect(
            accountExists({
              provider: account.provider,
              providerAccountId: account.providerAccountId,
            }),
          )

          if (!exists) {
            await runEffect(
              createAccount({
                user_id: userId,
                type: account.type,
                provider: account.provider,
                provider_account_id: account.providerAccountId,
                access_token: account.access_token ?? null,
                refresh_token: account.refresh_token ?? null,
                expires_at: account.expires_at ?? null,
                token_type: account.token_type ?? null,
                scope: account.scope ?? null,
                id_token: account.id_token ?? null,
              }),
            )
          }
        }

        return true
      } catch (error) {
        console.error("Error in signIn callback:", error)
        return false
      }
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        const email = session.user.email
        if (email) {
          try {
            const userId = await runEffect(findUserIdByEmail(email))
            if (userId) {
              session.user.id = userId
            }
          } catch (error) {
            console.error("Error fetching user in session callback:", error)
          }
        }
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export async function getAuthenticatedUserId(request?: NextRequest): Promise<string | null> {
  const session = await getServerSession(authOptions)
  if (session?.user?.id) {
    return session.user.id
  }

  if (!request) return null

  const authHeader = request.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) return null

  const apiKey = authHeader.slice(7).trim()
  if (!apiKey) return null

  try {
    return await runEffect(getUserIdFromApiKey(apiKey))
  } catch (error) {
    console.error("Error validating API key:", error)
    return null
  }
}
