const Validator = require('fastest-validator');
const { response } = require('../helpers/response.formatter');

const v = new Validator();

module.exports = {
  // Validate request body
  validate: (schema) => {
    return (req, res, next) => {
      const check = v.compile(schema);
      const result = check(req.body);
      
      if (result !== true) {
        return res.status(400).json(response(400, 'Validation Error', result));
      }
      next();
    };
  },

  // Validate query params
  validateQuery: (schema) => {
    return (req, res, next) => {
      const check = v.compile(schema);
      const result = check(req.query);
      
      if (result !== true) {
        return res.status(400).json(response(400, 'Query Validation Error', result));
      }
      next();
    };
  },
};