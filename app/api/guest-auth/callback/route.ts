import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const stateParam = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(`${req.nextUrl.origin}/?guest_auth_error=${encodeURIComponent(error)}`);
  }
  if (!code || !stateParam) {
    return NextResponse.json({ error: "Missing code or state" }, { status: 400 });
  }

  // state decode
  let redirectTo = "/";
  try {
    const parsed = JSON.parse(Buffer.from(stateParam, "base64url").toString());
    redirectTo = parsed.redirectTo || "/";
  } catch {
    // ignore
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "Google OAuth env not set" }, { status: 500 });
  }

  const origin = req.nextUrl.origin;
  const callbackUrl = `${origin}/api/guest-auth/callback`;

  // トークン交換
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: callbackUrl,
      grant_type: "authorization_code",
    }).toString(),
  });
  if (!tokenRes.ok) {
    const t = await tokenRes.text();
    return NextResponse.json({ error: "Token exchange failed", detail: t }, { status: 500 });
  }
  const tokens = await tokenRes.json();

  // ユーザー情報取得
  const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  if (!userRes.ok) {
    return NextResponse.json({ error: "Userinfo fetch failed" }, { status: 500 });
  }
  const userInfo: { email: string; name?: string; picture?: string } = await userRes.json();

  // クッキーにゲスト情報を保存（30日）
  const res = NextResponse.redirect(`${origin}${redirectTo}`);
  res.cookies.set(
    "fastmeet_guest",
    JSON.stringify({
      email: userInfo.email,
      name: userInfo.name ?? "",
      picture: userInfo.picture ?? "",
    }),
    {
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
      path: "/",
      httpOnly: false, // クライアントJSから読み取り可能（フォーム自動入力用）
    }
  );

  return res;
}
