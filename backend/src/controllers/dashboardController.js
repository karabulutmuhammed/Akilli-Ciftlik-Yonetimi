const { Animal, Vaccination, FeedItem, Sale, Expense, ProductionRecord, Purchase } = require("../models");
const { Op, fn, col } = require("sequelize");

async function summary(req, res) {
  const userId = req.user.id;

  const [
    animalCount,
    pendingVaccinations,
    feedItems,
    totalSales,
    totalExpenses,
    totalMilk,
    totalPurchases,
    recentSales,
    recentExpenses
  ] = await Promise.all([
    Animal.count({ where: { userId } }),
    Vaccination.count({ where: { userId, nextDate: { [Op.gte]: new Date() } } }),
    FeedItem.findAll({ where: { userId }, attributes: ["id", "name", "stock", "criticalLevel"] }),
    Sale.sum("totalPrice", { where: { userId } }),
    Expense.sum("amount", { where: { userId } }),
    ProductionRecord.sum("milkAmount", { where: { userId } }),
    Purchase.sum("totalPrice", { where: { userId } }),
    Sale.findAll({ where: { userId }, order: [["saleDate", "DESC"]], limit: 5 }),
    Expense.findAll({ where: { userId }, order: [["expenseDate", "DESC"]], limit: 5 })
  ]);

  const lowStockCount = feedItems.filter(item => Number(item.stock) <= Number(item.criticalLevel)).length;

  res.json({
    cards: {
      animalCount,
      pendingVaccinations,
      lowStockCount,
      totalSales: Number(totalSales || 0),
      totalExpenses: Number(totalExpenses || 0),
      totalPurchases: Number(totalPurchases || 0),
      totalMilk: Number(totalMilk || 0),
      netBalance: Number((totalSales || 0) - (totalExpenses || 0) - (totalPurchases || 0))
    },
    recentSales,
    recentExpenses,
    lowStockItems: feedItems.filter(item => Number(item.stock) <= Number(item.criticalLevel))
  });
}

module.exports = { summary };
