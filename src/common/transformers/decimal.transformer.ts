import type { ValueTransformer } from 'typeorm';

/**
 * PostgreSQL mengembalikan kolom DECIMAL sebagai string.
 * Transformer ini menjaga tipe data tetap number di sisi aplikasi.
 */
export const decimalTransformer: ValueTransformer = {
  to: (value?: number | null) => value,
  from: (value?: string | null) =>
    value === null || value === undefined ? value : Number(value),
};
