const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Purchase = sequelize.define("Purchase", {
  userId: { type: DataTypes.INTEGER, allowNull: false },
  animalId: { type: DataTypes.INTEGER, allowNull: true },
  sellerName: { type: DataTypes.STRING, allowNull: false },
  purchaseType: { type: DataTypes.STRING, allowNull: false, defaultValue: "Hayvan Alışı" },
  quantity: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 1 },
  unit: { type: DataTypes.STRING, allowNull: false, defaultValue: "adet" },
  unitPrice: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  totalPrice: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  purchaseDate: { type: DataTypes.DATEONLY, allowNull: false },
  notes: { type: DataTypes.TEXT, allowNull: true }
}, {
  tableName: "purchases",
  timestamps: true
});

module.exports = Purchase;
