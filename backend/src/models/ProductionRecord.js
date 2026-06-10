const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ProductionRecord = sequelize.define("ProductionRecord", {
  userId: { type: DataTypes.INTEGER, allowNull: false },

  animalId: { type: DataTypes.INTEGER, allowNull: true },
  recordDate: { type: DataTypes.DATEONLY, allowNull: false },
  milkAmount: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  quality: { type: DataTypes.STRING, allowNull: true },
  notes: { type: DataTypes.TEXT, allowNull: true }

}, {
  tableName: "production_records",
  timestamps: true
});

module.exports = ProductionRecord;
