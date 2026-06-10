const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FeedTransaction = sequelize.define("FeedTransaction", {
  userId: { type: DataTypes.INTEGER, allowNull: false },

  feedItemId: { type: DataTypes.INTEGER, allowNull: false },
  transactionType: { type: DataTypes.ENUM("IN", "OUT"), allowNull: false },
  quantity: { type: DataTypes.FLOAT, allowNull: false },
  transactionDate: { type: DataTypes.DATEONLY, allowNull: false },
  notes: { type: DataTypes.TEXT, allowNull: true }

}, {
  tableName: "feed_transactions",
  timestamps: true
});

module.exports = FeedTransaction;
