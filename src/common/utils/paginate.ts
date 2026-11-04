import type { FindManyOptions, ObjectLiteral, Repository } from 'typeorm';
import type { PaginatedResult } from '../interfaces/paginated-result.interface.js';

export async function paginate<T extends ObjectLiteral>(
  repository: Repository<T>,
  options: FindManyOptions<T>,
  page: number,
  limit: number,
): Promise<PaginatedResult<T>> {
  const [items, total] = await repository.findAndCount({
    ...options,
    skip: (page - 1) * limit,
    take: limit,
  });

  return {
    items,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
