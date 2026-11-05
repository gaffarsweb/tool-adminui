export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  emailVerifiedAt: string | null;
  avatarUrl: string | null;
  createdAt: string;
}
