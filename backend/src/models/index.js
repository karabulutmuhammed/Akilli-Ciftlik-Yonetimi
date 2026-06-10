const sequelize = require("../config/database");
const User = require("./User");
const Animal = require("./Animal");
const Vaccination = require("./Vaccination");
const FeedItem = require("./FeedItem");
const FeedTransaction = require("./FeedTransaction");
const Sale = require("./Sale");
const Expense = require("./Expense");
const ProductionRecord = require("./ProductionRecord");
const Purchase = require("./Purchase");

User.hasMany(Animal, { foreignKey: "userId", as: "animals" });
Animal.belongsTo(User, { foreignKey: "userId", as: "owner" });

User.hasMany(Vaccination, { foreignKey: "userId", as: "vaccinations" });
Vaccination.belongsTo(User, { foreignKey: "userId", as: "owner" });
Animal.hasMany(Vaccination, { foreignKey: "animalId", as: "vaccinations" });
Vaccination.belongsTo(Animal, { foreignKey: "animalId", as: "animal" });

User.hasMany(FeedItem, { foreignKey: "userId", as: "feedItems" });
FeedItem.belongsTo(User, { foreignKey: "userId", as: "owner" });

User.hasMany(FeedTransaction, { foreignKey: "userId", as: "feedTransactions" });
FeedTransaction.belongsTo(User, { foreignKey: "userId", as: "owner" });
FeedItem.hasMany(FeedTransaction, { foreignKey: "feedItemId", as: "transactions" });
FeedTransaction.belongsTo(FeedItem, { foreignKey: "feedItemId", as: "feedItem" });

User.hasMany(Sale, { foreignKey: "userId", as: "sales" });
Sale.belongsTo(User, { foreignKey: "userId", as: "owner" });
Animal.hasMany(Sale, { foreignKey: "animalId", as: "sales" });
Sale.belongsTo(Animal, { foreignKey: "animalId", as: "animal" });

User.hasMany(Purchase, { foreignKey: "userId", as: "purchases" });
Purchase.belongsTo(User, { foreignKey: "userId", as: "owner" });
Animal.hasMany(Purchase, { foreignKey: "animalId", as: "purchases" });
Purchase.belongsTo(Animal, { foreignKey: "animalId", as: "animal" });

User.hasMany(Expense, { foreignKey: "userId", as: "expenses" });
Expense.belongsTo(User, { foreignKey: "userId", as: "owner" });

User.hasMany(ProductionRecord, { foreignKey: "userId", as: "productionRecords" });
ProductionRecord.belongsTo(User, { foreignKey: "userId", as: "owner" });
Animal.hasMany(ProductionRecord, { foreignKey: "animalId", as: "productionRecords" });
ProductionRecord.belongsTo(Animal, { foreignKey: "animalId", as: "animal" });

module.exports = {
  sequelize,
  User,
  Animal,
  Vaccination,
  FeedItem,
  FeedTransaction,
  Sale,
  Expense,
  ProductionRecord,
  Purchase
};
