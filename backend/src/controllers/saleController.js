const { Sale, Animal } = require("../models");
const { ownerWhere, emitDataChanged, parseFloatOrNull, parseIntOrNull, today } = require("./_helpers");

async function list(req, res) {
  const rows = await Sale.findAll({
    where: ownerWhere(req),
    include: [{ model: Animal, as: "animal", attributes: ["id", "name", "earTag"] }],
    order: [["saleDate", "DESC"]]
  });
  res.json(rows);
}

async function create(req, res) {
  const quantity = parseFloatOrNull(req.body.quantity) || 1;
  const unitPrice = parseFloatOrNull(req.body.unitPrice) || 0;
  const totalPrice = parseFloatOrNull(req.body.totalPrice) || parseFloatOrNull(req.body.totalAmount) || quantity * unitPrice;

  const row = await Sale.create({
    userId: req.user.id,
    saleType: req.body.saleType || "Hayvan Satışı",
    animalId: parseIntOrNull(req.body.animalId),
    customerName: req.body.customerName || "Müşteri",
    quantity,
    unit: req.body.unit || "adet",
    unitPrice,
    totalPrice,
    saleDate: req.body.saleDate || today(),
    paymentStatus: req.body.paymentStatus || "Ödendi",
    notes: req.body.notes || req.body.note || null
  });

  emitDataChanged("sales", "create", { userId: req.user.id, id: row.id });
  res.status(201).json(row);
}

async function update(req, res) {
  const row = await Sale.findOne({ where: ownerWhere(req, { id: req.params.id }) });
  if (!row) return res.status(404).json({ message: "Kayıt bulunamadı." });
  await row.update({ ...req.body, animalId: req.body.animalId === undefined ? row.animalId : parseIntOrNull(req.body.animalId) });
  emitDataChanged("sales", "update", { userId: req.user.id, id: row.id });
  res.json(row);
}

async function remove(req, res) {
  const row = await Sale.findOne({ where: ownerWhere(req, { id: req.params.id }) });
  if (!row) return res.status(404).json({ message: "Kayıt bulunamadı." });
  await row.destroy();
  emitDataChanged("sales", "delete", { userId: req.user.id, id: Number(req.params.id) });
  res.json({ message: "Silindi." });
}

module.exports = { list, create, update, remove };