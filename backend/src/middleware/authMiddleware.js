const jwt = require("jsonwebtoken");
const { User } = require("../models");

async function authMiddleware(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "Token gerekli." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id, {
      attributes: ["id", "fullName", "email", "role"]
    });

    if (!user) {
      return res.status(401).json({ message: "Geçersiz kullanıcı." });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Yetkisiz erişim." });
  }
}

module.exports = authMiddleware;
