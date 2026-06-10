const { FeedItem, FeedTransaction } = require("../models");
const { ownerWhere, emitDataChanged, parseFloatOrNull, parseIntOrNull, today } = require("./_helpers");

async function listItems(req, res) {
  const rows = await FeedItem.findAll({ where: ownerWhere(req), order: [["createdAt", "DESC"]] });
  res.json(rows);
}

async function createItem(req, res) {
  const row = await FeedItem.create({
    userId: req.user.id,
    name: req.body.name || "Yem Kartı",
    unit: req.body.unit || "kg",
    stock: parseFloatOrNull(req.body.stock) || 0,
    unitPrice: parseFloatOrNull(req.body.unitPrice) || 0,
    supplier: req.body.supplier || null,
    criticalLevel: parseFloatOrNull(req.body.criticalLevel) || 50
  });
  emitDataChanged("feed-items", "create", { userId: req.user.id, id: row.id });
  res.status(201).json(row);
}

async function updateItem(req, res) {
  const row = await FeedItem.findOne({ where: ownerWhere(req, { id: req.params.id }) });
  if (!row) return res.status(404).json({ message: "Kayıt bulunamadı." });
  await row.update(req.body);
  emitDataChanged("feed-items", "update", { userId: req.user.id, id: row.id });
  res.json(row);
}

async function removeItem(req, res) {
  const row = await FeedItem.findOne({ where: ownerWhere(req, { id: req.params.id }) });
  if (!row) return res.status(404).json({ message: "Kayıt bulunamadı." });
  await row.destroy();
  emitDataChanged("feed-items", "delete", { userId: req.user.id, id: Number(req.params.id) });
  res.json({ message: "Silindi." });
}

async function listTransactions(req, res) {
  const rows = await FeedTransaction.findAll({ where: ownerWhere(req), order: [["transactionDate", "DESC"]] });
  res.json(rows);
}

async function createTransaction(req, res) {
  const feedItem = await FeedItem.findOne({ where: ownerWhere(req, { id: parseIntOrNull(req.body.feedItemId) }) });
  if (!feedItem) return res.status(404).json({ message: "Yem kartı bulunamadı." });

  const qty = parseFloatOrNull(req.body.quantity) || 0;
  const type = req.body.transactionType || req.body.movementType || "IN";
  const stock = type === "IN" ? feedItem.stock + qty : feedItem.stock - qty;

  if (stock < 0) return res.status(400).json({ message: "Stok sıfırın altına düşemez." });

  const row = await FeedTransaction.create({
    userId: req.user.id,
    feedItemId: feedItem.id,
    transactionType: type,
    quantity: qty,
    transactionDate: req.body.transactionDate || req.body.movementDate || today(),
    notes: req.body.notes || req.body.note || null
  });

  await feedItem.update({ stock });
  emitDataChanged("feed-transactions", "create", { userId: req.user.id, id: row.id });
  emitDataChanged("feed-items", "stock-update", { userId: req.user.id, id: feedItem.id });
  res.status(201).json(row);
}

module.exports = {
  listItems, createItem, updateItem, removeItem,
  listTransactions, createTransaction
};