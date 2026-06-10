const { Animal } = require("../models");
const { ownerWhere, emitDataChanged, parseFloatOrNull, today } = require("./_helpers");

async function list(req, res) {
  const rows = await Animal.findAll({ where: ownerWhere(req), order: [["createdAt", "DESC"]] });
  res.json(rows);
}

async function create(req, res) {
  const data = await Animal.create({
    userId: req.user.id,
    earTag: req.body.earTag || `TAG-${Date.now().toString().slice(-6)}`,
    name: req.body.name || "İsimsiz Hayvan",
    animalType: req.body.animalType || "Büyükbaş",
    breed: req.body.breed || null,
    gender: req.body.gender || null,
    birthDate: req.body.birthDate || null,
    weight: parseFloatOrNull(req.body.weight),
    purchaseDate: req.body.purchaseDate || today(),
    status: req.body.status || "Aktif",
    notes: req.body.notes || null
  });
  emitDataChanged("animals", "create", { userId: req.user.id, id: data.id });
  res.status(201).json(data);
}

async function update(req, res) {
  const row = await Animal.findOne({ where: ownerWhere(req, { id: req.params.id }) });
  if (!row) return res.status(404).json({ message: "Kayıt bulunamadı." });

  await row.update({
    earTag: req.body.earTag ?? row.earTag,
    name: req.body.name ?? row.name,
    animalType: req.body.animalType ?? row.animalType,
    breed: req.body.breed ?? row.breed,
    gender: req.body.gender ?? row.gender,
    birthDate: req.body.birthDate ?? row.birthDate,
    weight: req.body.weight !== undefined ? parseFloatOrNull(req.body.weight) : row.weight,
    purchaseDate: req.body.purchaseDate ?? row.purchaseDate,
    status: req.body.status ?? row.status,
    notes: req.body.notes ?? row.notes
  });

  emitDataChanged("animals", "update", { userId: req.user.id, id: row.id });
  res.json(row);
}

async function remove(req, res) {
  const row = await Animal.findOne({ where: ownerWhere(req, { id: req.params.id }) });
  if (!row) return res.status(404).json({ message: "Kayıt bulunamadı." });
  await row.destroy();
  emitDataChanged("animals", "delete", { userId: req.user.id, id: Number(req.params.id) });
  res.json({ message: "Silindi." });
}

module.exports = { list, create, update, remove };