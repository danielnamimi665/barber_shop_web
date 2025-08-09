import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Log environment variables for debugging
console.log("Google Client ID loaded:", !!process.env.GOOGLE_CLIENT_ID);
console.log("Google Client Secret loaded:", !!process.env.GOOGLE_CLIENT_SECRET);
console.log("NextAuth URL:", process.env.NEXTAUTH_URL);

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],

  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("Sign in attempt:", { user, account, profile });
      console.log("Account provider:", account?.provider);
      console.log("Account error:", account?.error);
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
      // Always redirect to home page after successful sign in
      return `${baseUrl}/home`;
    },
  },
  debug: true, // Always enable debug for now
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-key-for-development",
});

export { handler as GET, handler as POST }; 