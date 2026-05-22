import { NextRequest, NextResponse } from "next/server";

// Guest用OAuth開始エンドポイント
// scope は最小限（openid/email/profile のみ）。カレンダー権限は要求しない。
// 完了後は state に入れた redirect_to に戻す。
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const redirectTo = searchParams.get("redirect_to") || "/";

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: "GOOGLE_CLIENT_ID not set" }, { status: 500 });
  }

  const origin = req.nextUrl.origin;
  const callbackUrl = `${origin}/api/guest-auth/callback`;

  // state は redirect_to をbase64 encodeして埋め込む
  const state = Buffer.from(JSON.stringify({ redirectTo, nonce: crypto.randomUUID() })).toString("base64url");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: callbackUrl,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
    prompt: "select_account",
  });

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}
