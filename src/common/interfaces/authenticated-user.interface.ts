import type { UserRole } from '../../users/entities/user.entity.js';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
