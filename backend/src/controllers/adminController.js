const bcrypt = require("bcryptjs");
const { User } = require("../models");

async function listUsers(req, res) {
  const users = await User.findAll({
    attributes: ["id", "fullName", "email", "role", "createdAt"],
    order: [["createdAt", "DESC"]]
  });
  res.json(users);
}

async function updateUserRole(req, res) {
  const { role } = req.body;
  if (!["ADMIN", "USER"].includes(role)) {
    return res.status(400).json({ message: "Rol ADMIN veya USER olmalıdır." });
  }

  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı." });

  await user.update({ role });
  res.json({ id: user.id, fullName: user.fullName, email: user.email, role: user.role });
}

async function createUser(req, res) {
  const { fullName, email, password, role = "USER" } = req.body;
  if (!fullName || !email || !password) {
    return res.status(400).json({ message: "Ad soyad, e-posta ve şifre zorunludur." });
  }
  if (!["ADMIN", "USER"].includes(role)) {
    return res.status(400).json({ message: "Rol ADMIN veya USER olmalıdır." });
  }

  const exists = await User.findOne({ where: { email } });
  if (exists) return res.status(400).json({ message: "Bu e-posta zaten kayıtlı." });

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ fullName, email, password: hashed, role });
  res.status(201).json({ id: user.id, fullName: user.fullName, email: user.email, role: user.role });
}

async function deleteUser(req, res) {
  const id = Number(req.params.id);
  if (id === Number(req.user.id)) {
    return res.status(400).json({ message: "Kendi hesabınızı silemezsiniz." });
  }
  const user = await User.findByPk(id);
  if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı." });
  await user.destroy();
  res.json({ message: "Kullanıcı silindi." });
}

module.exports = { listUsers, updateUserRole, createUser, deleteUser };
