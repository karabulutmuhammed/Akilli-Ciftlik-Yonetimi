const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FeedItem = sequelize.define("FeedItem", {
  userId: { type: DataTypes.INTEGER, allowNull: false },

  name: { type: DataTypes.STRING, allowNull: false },
  unit: { type: DataTypes.STRING, allowNull: false, defaultValue: "kg" },
  stock: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  unitPrice: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  supplier: { type: DataTypes.STRING, allowNull: true },
  criticalLevel: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 50 }

}, {
  tableName: "feed_items",
  timestamps: true
});

module.exports = FeedItem;
