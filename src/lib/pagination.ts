/** Page metadata returned by paginated dashboard queries. */
export function paginate(page: number, limit: number, totalCount: number) {
  return {
    page,
    limit,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    hasMore: page * limit < totalCount,
  };
}

/** Prisma `skip`/`take` for a 1-based page. */
export const pageWindow = (page: number, limit: number) => ({
  skip: (page - 1) * limit,
  take: limit,
});
