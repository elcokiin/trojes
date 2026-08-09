import { base64url, SignJWT } from "jose"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const instanceUrl = process.env.POWERSYNC_INSTANCE_URL
    const jwtSecret = process.env.POWERSYNC_JWT_SECRET
    const keyId = process.env.POWERSYNC_JWT_KID
    const audience = process.env.POWERSYNC_JWT_AUDIENCE

    if (!instanceUrl || !jwtSecret || !keyId || !audience) {
      console.error("PowerSync environment variables are not configured")
      return NextResponse.json(
        { error: "PowerSync is not configured" },
        { status: 500 },
      )
    }

    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const secret = base64url.decode(jwtSecret)
    const token = await new SignJWT({ user_id: session.user.id })
      .setProtectedHeader({ alg: "HS256", kid: keyId })
      .setSubject(session.user.id)
      .setIssuedAt()
      .setAudience(audience)
      .setExpirationTime("60m")
      .sign(secret)

    return NextResponse.json({
      endpoint: instanceUrl,
      token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    })
  } catch (error) {
    console.error("Failed to generate PowerSync token:", error)
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 },
    )
  }
}
