import { SetMetadata } from '@nestjs/common';
import type { UserRole } from '../../users/entities/user.entity.js';

export const ROLES_KEY = 'roles';

/**
 * Membatasi route hanya untuk role tertentu, contoh: @Roles(UserRole.Admin).
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
