module.exports = function getPagination(query) {
  const DEFAULT_LIMIT = 20;
  const MAX_LIMIT = 100;

  const page = query.page ? Math.max(1, parseInt(query.page)) : 1;
  const limit = query.limit
    ? Math.min(MAX_LIMIT, Math.max(1, parseInt(query.limit)))
    : DEFAULT_LIMIT;
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};
