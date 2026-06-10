const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define("User", {
  fullName: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM("ADMIN", "USER"), allowNull: false, defaultValue: "USER" }
}, {
  tableName: "users",
  timestamps: true
});

module.exports = User;
