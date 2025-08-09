import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("Sign in attempt:", { user, account, profile });
      // Always allow sign in for Google
      return true;
    },
    async session({ session, token }) {
      console.log("Session callback:", { session, token });
      // Add user info to session
      if (token) {
        session.user = {
          ...session.user,
          email: token.email,
          name: token.name,
          image: token.picture
        };
      }
      return session;
    },
    async jwt({ token, user, account }) {
      console.log("JWT callback:", { token, user, account });
      if (account) {
        token.accessToken = account.access_token;
      }
      if (user) {
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      console.log("Redirect callback:", { url, baseUrl });
      // If URL is provided in the callback, use it
      if (url.startsWith(baseUrl)) {
        return url;
      }
      // Otherwise redirect to home page after successful sign in
      return `${baseUrl}/home`;
    },
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret",
});

export { handler as GET, handler as POST }; 