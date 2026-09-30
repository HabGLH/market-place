// roleMiddleware.js
export const roleMiddleware = () => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Check if the user is an admin
    if (req.user.role === "admin" || req.user.role === 1) {
      next();
    } else {
      res
        .status(403)
        .json({ message: "Access denied. Insufficient permissions." });
    }
  };
};
