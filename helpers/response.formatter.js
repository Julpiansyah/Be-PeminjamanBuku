// helpers/response.formatter.js

module.exports = {
  // Fungsi response standar
  response: (statusCode = 200, message = 'Success', data = null, meta = null) => {
    const res = {
      status: statusCode,
      message,
      data,
    };
    if (meta) res.meta = meta;
    return res;
  },

  paginate: (data, page, limit, total) => {
    return {
      data,
      pagination: {
        current_page: parseInt(page),
        per_page: parseInt(limit),
        total_items: total,
        total_pages: Math.ceil(total / limit),
      },
    };
  },
};