const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Vaccination = sequelize.define("Vaccination", {
  userId: { type: DataTypes.INTEGER, allowNull: false },

  animalId: { type: DataTypes.INTEGER, allowNull: true },
  vaccineName: { type: DataTypes.STRING, allowNull: false },
  applicationDate: { type: DataTypes.DATEONLY, allowNull: false },
  nextDate: { type: DataTypes.DATEONLY, allowNull: true },
  veterinarian: { type: DataTypes.STRING, allowNull: true },
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: "Tamamlandı" },
  notes: { type: DataTypes.TEXT, allowNull: true }

}, {
  tableName: "vaccinations",
  timestamps: true
});

module.exports = Vaccination;
