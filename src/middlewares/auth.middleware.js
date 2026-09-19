export default function authMiddleware(req, res, next) {
  if (!req.session.accessToken) {
    return res.status(401).json({
      message: "Please login to access the feature",
    });
  }
  next();
}