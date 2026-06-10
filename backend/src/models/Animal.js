const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Animal = sequelize.define("Animal", {
  userId: { type: DataTypes.INTEGER, allowNull: false },

  earTag: { type: DataTypes.STRING, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  animalType: { type: DataTypes.STRING, allowNull: false },
  breed: { type: DataTypes.STRING, allowNull: true },
  gender: { type: DataTypes.STRING, allowNull: true },
  birthDate: { type: DataTypes.DATEONLY, allowNull: true },
  weight: { type: DataTypes.FLOAT, allowNull: true },
  purchaseDate: { type: DataTypes.DATEONLY, allowNull: true },
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: "Aktif" },
  notes: { type: DataTypes.TEXT, allowNull: true }

}, {
  tableName: "animals",
  timestamps: true
});

module.exports = Animal;
