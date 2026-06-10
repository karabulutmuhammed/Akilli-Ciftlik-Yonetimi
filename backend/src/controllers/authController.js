const bcrypt = require("bcryptjs");
const { User } = require("../models");
const { signToken } = require("../utils/token");

async function register(req, res) {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Ad soyad, e-posta ve şifre zorunludur." });
    }

    const exists = await User.findOne({ where: { email } });
    if (exists) {
      return res.status(400).json({ message: "Bu e-posta zaten kayıtlı." });
    }

    const count = await User.count();
    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      password: hashed,
      role: count === 0 ? "ADMIN" : "USER"
    });

    const token = signToken(user);

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Kayıt başarısız.", error: error.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: "Kullanıcı bulunamadı." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Şifre hatalı." });
    }

    const token = signToken(user);
    return res.json({
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Giriş başarısız.", error: error.message });
  }
}

async function me(req, res) {
  return res.json(req.user);
}

module.exports = { register, login, me };
