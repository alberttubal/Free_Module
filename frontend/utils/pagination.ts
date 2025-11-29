export const DEFAULT_LIMIT = 20;
export const getLimitOffset = (page = 1, limit = DEFAULT_LIMIT) => ({ limit, offset: (page - 1) * limit });