const OpenAI = require("openai");
const db = require("../models");

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

function pickModel(names) {
  for (const name of names) {
    if (db[name]) return db[name];
  }
  return null;
}

const Models = {
  Animal: pickModel(["Animal", "Animals"]),
  Purchase: pickModel(["Purchase", "Purchases"]),
  Vaccination: pickModel(["Vaccination", "Vaccinations"]),
  FeedItem: pickModel(["FeedItem", "FeedItems"]),
  FeedTransaction: pickModel(["FeedTransaction", "FeedTransactions"]),
  Sale: pickModel(["Sale", "Sales"]),
  Expense: pickModel(["Expense", "Expenses"]),
  ProductionRecord: pickModel(["ProductionRecord", "ProductionRecords"]),
};

function modelWhere(model, userId) {
  if (!model?.rawAttributes) return {};
  if (model.rawAttributes.userId) return { userId };
  if (model.rawAttributes.UserId) return { UserId: userId };
  return {};
}

async function readModel(model, userId, limit = 200) {
  if (!model) return [];

  const rows = await model.findAll({
    where: modelWhere(model, userId),
    limit,
    order: [["id", "DESC"]],
  });

  return rows.map((x) => (typeof x.toJSON === "function" ? x.toJSON() : x));
}

function sum(rows, field) {
  return rows.reduce((acc, item) => acc + Number(item?.[field] || 0), 0);
}

async function collectFarmData(userId) {
  const [
    animals,
    purchases,
    vaccinations,
    feedItems,
    feedTransactions,
    sales,
    expenses,
    productionRecords,
  ] = await Promise.all([
    readModel(Models.Animal, userId),
    readModel(Models.Purchase, userId),
    readModel(Models.Vaccination, userId),
    readModel(Models.FeedItem, userId),
    readModel(Models.FeedTransaction, userId),
    readModel(Models.Sale, userId),
    readModel(Models.Expense, userId),
    readModel(Models.ProductionRecord, userId),
  ]);

  const totalSales = sum(sales, "totalPrice");
  const totalPurchases = sum(purchases, "totalPrice");
  const totalExpenses = sum(expenses, "amount");
  const totalMilk = sum(productionRecords, "milkAmount");

  const lowStockItems = feedItems.filter(
    (x) => Number(x.stock || 0) <= Number(x.criticalLevel || 0)
  );

  const pendingVaccinations = vaccinations.filter((x) =>
    String(x.status || "").toLowerCase().includes("bekliyor")
  );

  return {
    summary: {
      animalCount: animals.length,
      totalSales,
      totalPurchases,
      totalExpenses,
      netBalance: totalSales - totalPurchases - totalExpenses,
      totalMilk,
      lowStockCount: lowStockItems.length,
      pendingVaccinationCount: pendingVaccinations.length,
    },
    animals,
    purchases,
    vaccinations,
    feedItems,
    feedTransactions,
    sales,
    expenses,
    productionRecords,
    lowStockItems,
    pendingVaccinations,
  };
}

function money(v) {
  return `${Number(v || 0).toFixed(2)} TL`;
}

function localAssistantAnswer(question, farmData) {
  const q = question.toLowerCase();
  const s = farmData.summary;

  if (q.includes("hayvan") || q.includes("kaç hayvan")) {
    return `Toplam hayvan sayınız ${s.animalCount} adettir.`;
  }

  if (q.includes("satış") || q.includes("satis")) {
    const recent = farmData.sales.slice(0, 5);
    let text = `Toplam satış tutarınız ${money(s.totalSales)}.`;
    if (recent.length) {
      text += `\n\nSon satışlar:\n`;
      text += recent
        .map(
          (x) =>
            `- ${x.customerName || "Müşteri yok"} | ${x.saleType || "-"} | ${money(
              x.totalPrice
            )}`
        )
        .join("\n");
    }
    return text;
  }

  if (q.includes("gider")) {
    const recent = farmData.expenses.slice(0, 5);
    let text = `Toplam gider tutarınız ${money(s.totalExpenses)}.`;
    if (recent.length) {
      text += `\n\nSon giderler:\n`;
      text += recent
        .map(
          (x) =>
            `- ${x.category || "-"} | ${x.title || "-"} | ${money(x.amount)}`
        )
        .join("\n");
    }
    return text;
  }

  if (q.includes("alış") || q.includes("alis")) {
    return `Toplam hayvan/ürün alış tutarınız ${money(s.totalPurchases)}.`;
  }

  if (
    q.includes("kar") ||
    q.includes("kâr") ||
    q.includes("zarar") ||
    q.includes("net") ||
    q.includes("bakiye")
  ) {
    const durum = s.netBalance >= 0 ? "pozitif" : "negatif";
    return `Net bakiye durumunuz ${money(s.netBalance)} ve şu anda ${durum} görünüyor. Hesaplama: satışlar - alışlar - giderler.`;
  }

  if (q.includes("yem") || q.includes("stok")) {
    if (!farmData.feedItems.length) {
      return "Henüz yem kartı kaydı bulunmuyor.";
    }

    if (!farmData.lowStockItems.length) {
      return `Yem stoklarında kritik seviyenin altında kayıt görünmüyor. Toplam yem kartı sayısı: ${farmData.feedItems.length}.`;
    }

    return (
      `Kritik seviyede ${farmData.lowStockItems.length} yem stoğu var:\n` +
      farmData.lowStockItems
        .map(
          (x) =>
            `- ${x.name}: ${x.stock} ${x.unit || ""} | Kritik seviye: ${
              x.criticalLevel
            }`
        )
        .join("\n")
    );
  }

  if (q.includes("aşı") || q.includes("asi")) {
    if (!farmData.vaccinations.length) {
      return "Henüz aşı kaydı bulunmuyor.";
    }

    if (!farmData.pendingVaccinations.length) {
      return `Bekleyen aşı kaydı görünmüyor. Toplam aşı kaydı: ${farmData.vaccinations.length}.`;
    }

    return (
      `Bekleyen ${farmData.pendingVaccinations.length} aşı kaydı var:\n` +
      farmData.pendingVaccinations
        .map(
          (x) =>
            `- ${x.vaccineName || "Aşı"} | Hayvan ID: ${
              x.animalId || "-"
            } | Sonraki tarih: ${x.nextDate || "-"}`
        )
        .join("\n")
    );
  }

  if (q.includes("süt") || q.includes("sut") || q.includes("üretim") || q.includes("uretim")) {
    return `Toplam süt/üretim miktarı ${Number(s.totalMilk || 0).toFixed(
      2
    )} L olarak görünüyor.`;
  }

  if (q.includes("özet") || q.includes("ozet") || q.includes("durum")) {
    return `Çiftlik özeti:
- Toplam hayvan: ${s.animalCount}
- Toplam satış: ${money(s.totalSales)}
- Toplam alış: ${money(s.totalPurchases)}
- Toplam gider: ${money(s.totalExpenses)}
- Net bakiye: ${money(s.netBalance)}
- Düşük yem stoğu: ${s.lowStockCount}
- Bekleyen aşı: ${s.pendingVaccinationCount}
- Toplam süt: ${Number(s.totalMilk || 0).toFixed(2)} L`;
  }

  return `Bu soruya yerel asistan modunda genel cevap veriyorum.

Çiftlik özeti:
- Hayvan sayısı: ${s.animalCount}
- Satış: ${money(s.totalSales)}
- Alış: ${money(s.totalPurchases)}
- Gider: ${money(s.totalExpenses)}
- Net bakiye: ${money(s.netBalance)}
- Düşük stok: ${s.lowStockCount}
- Bekleyen aşı: ${s.pendingVaccinationCount}

Daha net cevap için şunlardan birini sorabilirsiniz:
"Toplam hayvan sayım kaç?"
"Yem stoğu düşük olanlar var mı?"
"Net bakiye durumum nedir?"
"Satış ve gider durumum nasıl?"`;
}

async function debugAssistantData(req, res) {
  try {
    const userId = req.user.id;
    const farmData = await collectFarmData(userId);

    return res.json({
      ok: true,
      mode: openai ? "openai_or_local_fallback" : "local_only",
      summary: farmData.summary,
      counts: {
        animals: farmData.animals.length,
        purchases: farmData.purchases.length,
        vaccinations: farmData.vaccinations.length,
        feedItems: farmData.feedItems.length,
        feedTransactions: farmData.feedTransactions.length,
        sales: farmData.sales.length,
        expenses: farmData.expenses.length,
        productionRecords: farmData.productionRecords.length,
      },
      modelStatus: Object.fromEntries(
        Object.entries(Models).map(([k, v]) => [k, Boolean(v)])
      ),
    });
  } catch (error) {
    console.error("Assistant debug error:", error);
    return res.status(500).json({
      message: "AI debug verisi alınamadı.",
      error: error.message,
    });
  }
}

async function askAssistant(req, res) {
  try {
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ message: "Soru boş olamaz." });
    }

    const userId = req.user.id;
    const farmData = await collectFarmData(userId);

    if (!openai) {
      return res.json({
        mode: "local",
        answer: localAssistantAnswer(question, farmData),
      });
    }

    try {
      const response = await openai.responses.create({
        model: process.env.OPENAI_MODEL || "gpt-5.4-mini",
        input: [
          {
            role: "system",
            content:
              "Sen Akıllı Çiftlik Yönetim Sistemi içinde çalışan Türkçe bir yapay zeka asistanısın. Sadece verilen çiftlik verilerine göre cevap ver. Veri yoksa açıkça veri olmadığını söyle. Kısa, net ve uygulanabilir cevap ver. Para birimi TL olarak yaz.",
          },
          {
            role: "user",
            content: `
Çiftlik verileri:
${JSON.stringify(farmData, null, 2)}

Kullanıcının sorusu:
${question}
            `,
          },
        ],
      });

      return res.json({
        mode: "openai",
        answer: response.output_text || localAssistantAnswer(question, farmData),
      });
    } catch (openaiError) {
      console.error("OpenAI error, local fallback used:", openaiError.message);

      return res.json({
        mode: "local_fallback",
        answer: localAssistantAnswer(question, farmData),
        note: "OpenAI kotası veya bağlantısı nedeniyle yerel asistan cevabı kullanıldı.",
      });
    }
  } catch (error) {
    console.error("Assistant error:", error);

    return res.status(500).json({
      message: "Yapay zeka asistanı cevap üretemedi.",
      error: error.message,
    });
  }
}

module.exports = {
  askAssistant,
  debugAssistantData,
};