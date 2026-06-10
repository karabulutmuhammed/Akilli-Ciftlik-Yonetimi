const { ProductionRecord, Animal } = require("../models");
const { ownerWhere, emitDataChanged, parseFloatOrNull, parseIntOrNull, today } = require("./_helpers");

async function list(req, res) {
  const rows = await ProductionRecord.findAll({
    where: ownerWhere(req),
    include: [{ model: Animal, as: "animal", attributes: ["id", "name", "earTag"] }],
    order: [["recordDate", "DESC"]]
  });
  res.json(rows);
}

async function create(req, res) {
  const row = await ProductionRecord.create({
    userId: req.user.id,
    animalId: parseIntOrNull(req.body.animalId),
    recordDate: req.body.recordDate || req.body.productionDate || today(),
    milkAmount: parseFloatOrNull(req.body.milkAmount) || parseFloatOrNull(req.body.quantity) || 0,
    quality: req.body.quality || req.body.productionType || null,
    notes: req.body.notes || req.body.note || null
  });
  emitDataChanged("production-records", "create", { userId: req.user.id, id: row.id });
  res.status(201).json(row);
}

async function update(req, res) {
  const row = await ProductionRecord.findOne({ where: ownerWhere(req, { id: req.params.id }) });
  if (!row) return res.status(404).json({ message: "Kayıt bulunamadı." });
  await row.update({ ...req.body, animalId: req.body.animalId === undefined ? row.animalId : parseIntOrNull(req.body.animalId) });
  emitDataChanged("production-records", "update", { userId: req.user.id, id: row.id });
  res.json(row);
}

async function remove(req, res) {
  const row = await ProductionRecord.findOne({ where: ownerWhere(req, { id: req.params.id }) });
  if (!row) return res.status(404).json({ message: "Kayıt bulunamadı." });
  await row.destroy();
  emitDataChanged("production-records", "delete", { userId: req.user.id, id: Number(req.params.id) });
  res.json({ message: "Silindi." });
}

module.exports = { list, create, update, remove };