const { Expense } = require("../models");
const { ownerWhere, emitDataChanged, parseFloatOrNull, today } = require("./_helpers");

async function list(req, res) {
  const rows = await Expense.findAll({ where: ownerWhere(req), order: [["expenseDate", "DESC"]] });
  res.json(rows);
}

async function create(req, res) {
  const row = await Expense.create({
    userId: req.user.id,
    category: req.body.category || "Genel",
    title: req.body.title || "Gider",
    amount: parseFloatOrNull(req.body.amount) || 0,
    expenseDate: req.body.expenseDate || today(),
    notes: req.body.notes || null
  });
  emitDataChanged("expenses", "create", { userId: req.user.id, id: row.id });
  res.status(201).json(row);
}

async function update(req, res) {
  const row = await Expense.findOne({ where: ownerWhere(req, { id: req.params.id }) });
  if (!row) return res.status(404).json({ message: "Kayıt bulunamadı." });
  await row.update(req.body);
  emitDataChanged("expenses", "update", { userId: req.user.id, id: row.id });
  res.json(row);
}

async function remove(req, res) {
  const row = await Expense.findOne({ where: ownerWhere(req, { id: req.params.id }) });
  if (!row) return res.status(404).json({ message: "Kayıt bulunamadı." });
  await row.destroy();
  emitDataChanged("expenses", "delete", { userId: req.user.id, id: Number(req.params.id) });
  res.json({ message: "Silindi." });
}

module.exports = { list, create, update, remove };