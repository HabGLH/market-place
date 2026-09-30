import AppError from "../utils/AppError.js";

const validateRequest = (schemas) => (req, res, next) => {
  for (const [part, schema] of Object.entries(schemas)) {
    const result = schema.safeParse(req[part]);
    if (!result.success) {
      const message = result.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ");
      return next(new AppError(`Invalid request: ${message}`, 400));
    }

    if (part === "query") {
      Object.defineProperty(req, "query", {
        configurable: true,
        enumerable: true,
        writable: true,
        value: result.data,
      });
    } else {
      req[part] = result.data;
    }
  }

  next();
};

export default validateRequest;
