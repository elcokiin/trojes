import type { NextAuthOptions } from "next-auth"
import { getServerSession } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { type NextRequest } from "next/server"
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
        let userId = await findUserIdByEmail(user.email)

        if (!userId) {
          const newUser = await createUser({
            name: user.name,
            email: user.email,
            image: user.image,
          })
          userId = newUser.id
        } else {
          await updateUserProfile({
            id: userId,
            name: user.name,
            image: user.image,
          })
        }

        user.id = userId

        if (account) {
          const exists = await accountExists({
            provider: account.provider,
            providerAccountId: account.providerAccountId,
          })

          if (!exists) {
            await createAccount({
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
            })
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
          const userId = await findUserIdByEmail(email)
          if (userId) {
            session.user.id = userId
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

  return getUserIdFromApiKey(apiKey)
}
