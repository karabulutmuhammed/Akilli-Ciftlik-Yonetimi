const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const animalRoutes = require("./routes/animalRoutes");
const vaccinationRoutes = require("./routes/vaccinationRoutes");
const feedRoutes = require("./routes/feedRoutes");
const saleRoutes = require("./routes/saleRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const productionRoutes = require("./routes/productionRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    const allowed = (process.env.CORS_ORIGIN || "").split(",").map(v => v.trim()).filter(Boolean);
    if (allowed.length === 0 || allowed.includes(origin)) return callback(null, true);
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json());
app.use("/api/assistant", require("./routes/assistantRoutes"));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Akilli Ciftlik API çalışıyor." });
});

app.use("/api/auth", authRoutes);
app.use("/api/animals", animalRoutes);
app.use("/api/vaccinations", vaccinationRoutes);
app.use("/api/feed", feedRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/production-records", productionRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminRoutes);

module.exports = app;
