import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prismadb from "@/lib/prisma";

// Build a providers array conditionally — skip GitHub if env vars are missing
const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error("Email và mật khẩu là bắt buộc");
      }
      const user = await prismadb.user.findUnique({
        where: { email: credentials.email },
      });
      if (!user || !user.passwordHash) {
        throw new Error("Tài khoản không tồn tại");
      }
      if (user.isBanned) {
        throw new Error(`Tài khoản đã bị khóa. Lý do: ${user.banReason || "Vi phạm quy tắc"}`);
      }
      const isCorrectPassword = await bcrypt.compare(credentials.password, user.passwordHash);
      if (!isCorrectPassword) {
        throw new Error("Mật khẩu không đúng");
      }
      return { id: user.id, email: user.email, name: user.username, image: user.avatarUrl };
    },
  }),
];

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  providers.unshift(
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    })
  );
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prismadb) as any,
  providers,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      // On initial sign-in, cache user data into the JWT token
      if (user) {
        token.id = user.id;
        token.isBanned = (user as any).isBanned ?? false;
        token.banReason = (user as any).banReason ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      // Read from cached JWT — no DB query needed
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).isBanned = token.isBanned ?? false;
        (session.user as any).banReason = token.banReason ?? null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-build-only",
};
