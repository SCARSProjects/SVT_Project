import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { getUserByEmail, createUser, updateUserImage } from '@/lib/db';

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET || 'shopmart-nextauth-fallback-secret-2026',
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email.toLowerCase().trim();
        const user = await getUserByEmail(email);
        if (!user) return null;

        // An empty-string password is a sentinel for OAuth-only accounts.
        // Prevent credentials login for accounts created exclusively with Google.
        if (!user.password) return null;

        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;

        return { id: user.id, name: user.name, email: user.email, role: user.role } as any;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // No database adapter is configured (session strategy is 'jwt'), so
      // NextAuth never persists OAuth sign-ins on its own. Create a real
      // user row in the database so that orders, wishlists, and account
      // settings keyed by userId work as expected.
      if (account?.provider === 'google' && user.email) {
        const email = user.email.toLowerCase().trim();
        const existing = await getUserByEmail(email);
        if (!existing) {
          await createUser({
            name: user.name || (profile as any)?.name || email.split('@')[0],
            email,
            password: '',
            role: 'CUSTOMER',
            image: user.image || null,
          });
        } else if (user.image && !existing.image) {
          await updateUserImage(existing.id, user.image);
        }
      }
      return true;
    },
    async jwt({ token, user, account, trigger, session }) {
      if (user?.email) {
        const email = user.email.toLowerCase().trim();
        let dbUser = await getUserByEmail(email);

        // Ensure user row exists in db on OAuth sign-in
        if (!dbUser && account?.provider === 'google') {
          dbUser = await createUser({
            name: user.name || email.split('@')[0],
            email,
            password: '',
            role: 'CUSTOMER',
            image: user.image || null,
          });
        }

        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
        }
      }

      if (user?.image) {
        token.picture = user.image;
      }

      // Account settings calls session.update({ name }) after a successful save
      if (trigger === 'update' && session?.name) {
        token.name = session.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        if (token.picture) {
          session.user.image = token.picture as string;
        }
      }
      return session;
    },
  },
};
