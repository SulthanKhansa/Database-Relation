import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Menandai route agar dapat diakses tanpa JWT.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
