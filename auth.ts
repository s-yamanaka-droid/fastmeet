import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/calendar.readonly",
            "https://www.googleapis.com/auth/calendar.events",
          ].join(" "),
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.email = profile?.email;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;

      if (session.user?.email) {
        const username = session.user.email.split("@")[0].replace(/[^a-z0-9]/gi, "");
        const { data: existing } = await supabaseAdmin
          .from("calbook_users")
          .select("id, username")
          .eq("email", session.user.email)
          .single();

        if (!existing) {
          await supabaseAdmin.from("calbook_users").upsert({
            email: session.user.email,
            name: session.user.name,
            username,
            google_refresh_token: token.refreshToken as string,
          }, { onConflict: "email" });
        } else if (token.refreshToken) {
          await supabaseAdmin
            .from("calbook_users")
            .update({ google_refresh_token: token.refreshToken as string })
            .eq("email", session.user.email);
        }

        session.username = existing?.username ?? username;
      }

      return session;
    },
  },
  pages: {
    signIn: "/",
  },
});
