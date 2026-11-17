
export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    // Store validated data separately.
    req.validated = req.validated || {};
    req.validated[source] = result.data;

    // Express allows replacing req.body, but req.query is getter-only.
    if (source === 'body') {
      req.body = result.data;
    }

    next();
  };
};
