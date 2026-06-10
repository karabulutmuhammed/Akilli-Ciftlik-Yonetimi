const { Purchase, Animal } = require("../models");
const { ownerWhere, emitDataChanged, parseFloatOrNull, parseIntOrNull, today } = require("./_helpers");

async function list(req, res) {
  const rows = await Purchase.findAll({
    where: ownerWhere(req),
    include: [{ model: Animal, as: "animal", attributes: ["id", "name", "earTag"] }],
    order: [["purchaseDate", "DESC"]]
  });
  res.json(rows);
}

async function create(req, res) {
  const quantity = parseFloatOrNull(req.body.quantity) || 1;
  const unitPrice = parseFloatOrNull(req.body.unitPrice) || 0;
  const totalPrice = parseFloatOrNull(req.body.totalPrice) || parseFloatOrNull(req.body.totalAmount) || quantity * unitPrice;

  const row = await Purchase.create({
    userId: req.user.id,
    animalId: parseIntOrNull(req.body.animalId),
    sellerName: req.body.sellerName || "Satıcı",
    purchaseType: req.body.purchaseType || "Hayvan Alışı",
    quantity,
    unit: req.body.unit || "adet",
    unitPrice,
    totalPrice,
    purchaseDate: req.body.purchaseDate || today(),
    notes: req.body.notes || req.body.note || null
  });

  emitDataChanged("purchases", "create", { userId: req.user.id, id: row.id });
  res.status(201).json(row);
}

async function update(req, res) {
  const row = await Purchase.findOne({ where: ownerWhere(req, { id: req.params.id }) });
  if (!row) return res.status(404).json({ message: "Kayıt bulunamadı." });
  await row.update({ ...req.body, animalId: req.body.animalId === undefined ? row.animalId : parseIntOrNull(req.body.animalId) });
  emitDataChanged("purchases", "update", { userId: req.user.id, id: row.id });
  res.json(row);
}

async function remove(req, res) {
  const row = await Purchase.findOne({ where: ownerWhere(req, { id: req.params.id }) });
  if (!row) return res.status(404).json({ message: "Kayıt bulunamadı." });
  await row.destroy();
  emitDataChanged("purchases", "delete", { userId: req.user.id, id: Number(req.params.id) });
  res.json({ message: "Silindi." });
}

module.exports = { list, create, update, remove };