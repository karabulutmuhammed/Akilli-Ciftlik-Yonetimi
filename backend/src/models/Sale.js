const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Sale = sequelize.define("Sale", {
  userId: { type: DataTypes.INTEGER, allowNull: false },

  saleType: { type: DataTypes.STRING, allowNull: false },
  animalId: { type: DataTypes.INTEGER, allowNull: true },
  customerName: { type: DataTypes.STRING, allowNull: false },
  quantity: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 1 },
  unit: { type: DataTypes.STRING, allowNull: false, defaultValue: "adet" },
  unitPrice: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  totalPrice: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  saleDate: { type: DataTypes.DATEONLY, allowNull: false },
  paymentStatus: { type: DataTypes.STRING, allowNull: false, defaultValue: "Ödendi" },
  notes: { type: DataTypes.TEXT, allowNull: true }

}, {
  tableName: "sales",
  timestamps: true
});

module.exports = Sale;
