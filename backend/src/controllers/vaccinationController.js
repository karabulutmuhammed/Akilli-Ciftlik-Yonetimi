const { Vaccination, Animal } = require("../models");
const { ownerWhere, emitDataChanged, parseIntOrNull, today } = require("./_helpers");

async function list(req, res) {
  const rows = await Vaccination.findAll({
    where: ownerWhere(req),
    include: [{ model: Animal, as: "animal", attributes: ["id", "name", "earTag"] }],
    order: [["applicationDate", "DESC"]]
  });
  res.json(rows);
}

async function create(req, res) {
  const row = await Vaccination.create({
    userId: req.user.id,
    animalId: parseIntOrNull(req.body.animalId),
    vaccineName: req.body.vaccineName || "Genel Aşı",
    applicationDate: req.body.applicationDate || today(),
    nextDate: req.body.nextDate || null,
    veterinarian: req.body.veterinarian || null,
    status: req.body.status || "Tamamlandı",
    notes: req.body.notes || req.body.note || null
  });
  emitDataChanged("vaccinations", "create", { userId: req.user.id, id: row.id });
  res.status(201).json(row);
}

async function update(req, res) {
  const row = await Vaccination.findOne({ where: ownerWhere(req, { id: req.params.id }) });
  if (!row) return res.status(404).json({ message: "Kayıt bulunamadı." });
  await row.update({ ...req.body, animalId: req.body.animalId === undefined ? row.animalId : parseIntOrNull(req.body.animalId) });
  emitDataChanged("vaccinations", "update", { userId: req.user.id, id: row.id });
  res.json(row);
}

async function remove(req, res) {
  const row = await Vaccination.findOne({ where: ownerWhere(req, { id: req.params.id }) });
  if (!row) return res.status(404).json({ message: "Kayıt bulunamadı." });
  await row.destroy();
  emitDataChanged("vaccinations", "delete", { userId: req.user.id, id: Number(req.params.id) });
  res.json({ message: "Silindi." });
}

module.exports = { list, create, update, remove };