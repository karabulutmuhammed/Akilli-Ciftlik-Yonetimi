const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Expense = sequelize.define("Expense", {
  userId: { type: DataTypes.INTEGER, allowNull: false },

  category: { type: DataTypes.STRING, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  amount: { type: DataTypes.FLOAT, allowNull: false },
  expenseDate: { type: DataTypes.DATEONLY, allowNull: false },
  notes: { type: DataTypes.TEXT, allowNull: true }

}, {
  tableName: "expenses",
  timestamps: true
});

module.exports = Expense;
