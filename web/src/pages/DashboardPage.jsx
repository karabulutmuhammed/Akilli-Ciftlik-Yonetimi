import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from "chart.js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import useSocketRefresh from "../hooks/useSocketRefresh";
import CrudSection from "../components/CrudSection";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,

  plugins: {
    legend: {
      labels: {
        color: "#284431",
        font: {
          size: 14,
          weight: "bold"
        }
      }
    }
  },

  scales: {
    x: {
      ticks: {
        color: "#284431"
      }
    },
    y: {
      ticks: {
        color: "#284431"
      }
    }
  }
};

const sections = [
  { key: "dashboard", label: "Anasayfa" },
  { key: "reports", label: "PDF Raporlar" },
  { key: "assistant", label: "🤖 AI Asistan" },
  { key: "animals", label: "Hayvanlar" },
  { key: "purchases", label: "Hayvan Alış" },
  { key: "vaccinations", label: "Aşılar" },
  { key: "feed", label: "Yem Yönetimi" },
  { key: "sales", label: "Satışlar" },
  { key: "expenses", label: "Giderler" },
  { key: "production", label: "Üretim" }
];

const adminSection = { key: "admin", label: "Admin Yetki" };

const money = (v) => `${Number(v || 0).toFixed(2)} ₺`;
const todayLabel = () => new Date().toLocaleString("tr-TR");

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [active, setActive] = useState("dashboard");
  const [summary, setSummary] = useState(null);
  const [animals, setAnimals] = useState([]);
  const [feedItems, setFeedItems] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminForm, setAdminForm] = useState({ fullName: "", email: "", password: "", role: "USER" });
  const [notice, setNotice] = useState("");

  const allSections = useMemo(() => (isAdmin ? [...sections, adminSection] : sections), [isAdmin]);

  const loadSummary = useCallback(async () => {
    try {
      const { data } = await client.get("/dashboard/summary");
      setSummary(data);
    } catch (error) {
      console.error("Dashboard yüklenemedi", error);
    }
  }, []);

  const loadRefs = useCallback(async () => {
    try {
      const [animalsRes, feedItemsRes] = await Promise.all([
        client.get("/animals"),
        client.get("/feed/items")
      ]);
      setAnimals(animalsRes.data || []);
      setFeedItems(feedItemsRes.data || []);
    } catch (error) {
      console.error("Referans veriler yüklenemedi", error);
    }
  }, []);

  const loadAdminUsers = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const { data } = await client.get("/admin/users");
      setAdminUsers(data || []);
    } catch (error) {
      console.error("Kullanıcılar yüklenemedi", error);
    }
  }, [isAdmin]);

  const refreshAll = useCallback(() => {
    loadSummary();
    loadRefs();
    loadAdminUsers();
  }, [loadSummary, loadRefs, loadAdminUsers]);

  useEffect(() => { refreshAll(); }, [refreshAll]);
  useSocketRefresh(refreshAll);

  const animalOptions = useMemo(
    () => animals.map((a) => ({ value: a.id, label: `${a.name} • ${a.earTag}` })),
    [animals]
  );

  const feedItemOptions = useMemo(
    () => feedItems.map((f) => ({ value: f.id, label: `${f.name} • ${f.stock} ${f.unit}` })),
    [feedItems]
  );

  const toast = (text) => {
    setNotice(text);
    setTimeout(() => setNotice(""), 2500);
  };

  const updateRole = async (id, role) => {
    try {
      await client.put(`/admin/users/${id}/role`, { role });
      toast("Kullanıcı rolü güncellendi.");
      loadAdminUsers();
    } catch (error) {
      toast(error?.response?.data?.message || "Rol güncellenemedi.");
    }
  };

  const createAdminUser = async (e) => {
    e.preventDefault();
    try {
      await client.post("/admin/users", adminForm);
      setAdminForm({ fullName: "", email: "", password: "", role: "USER" });
      toast("Kullanıcı oluşturuldu.");
      loadAdminUsers();
    } catch (error) {
      toast(error?.response?.data?.message || "Kullanıcı oluşturulamadı.");
    }
  };

  const deleteUser = async (id) => {
    if (!confirm("Kullanıcı silinsin mi?")) return;
    try {
      await client.delete(`/admin/users/${id}`);
      toast("Kullanıcı silindi.");
      loadAdminUsers();
    } catch (error) {
      toast(error?.response?.data?.message || "Kullanıcı silinemedi.");
    }
  };

  const generatePdfReport = async (type = "overview") => {
    const doc = new jsPDF();
    const title = type === "overview" ? "Akilli Ciftlik Genel Rapor" : "Akilli Ciftlik Detayli Rapor";
    doc.setFontSize(16);
    doc.text(title, 14, 16);
    doc.setFontSize(10);
    doc.text(`Olusturma tarihi: ${todayLabel()}`, 14, 23);
    doc.text(`Kullanici: ${user?.fullName || user?.email || "-"}`, 14, 29);

    const cards = summary?.cards || {};
    autoTable(doc, {
      startY: 36,
      head: [["Metrik", "Deger"]],
      body: [
        ["Toplam Hayvan", cards.animalCount || 0],
        ["Bekleyen Asi", cards.pendingVaccinations || 0],
        ["Dusuk Stok", cards.lowStockCount || 0],
        ["Toplam Satis", money(cards.totalSales)],
        ["Toplam Gider", money(cards.totalExpenses)],
        ["Toplam Alis", money(cards.totalPurchases)],
        ["Net Bakiye", money(cards.netBalance)],
        ["Toplam Sut", `${Number(cards.totalMilk || 0).toFixed(2)} L`]
      ]
    });

    let y = doc.lastAutoTable.finalY + 8;

    if (type === "detail") {
      const [animalRes, saleRes, expenseRes, feedRes, vaccinationRes] = await Promise.all([
        client.get("/animals"),
        client.get("/sales"),
        client.get("/expenses"),
        client.get("/feed/items"),
        client.get("/vaccinations")
      ]);

      autoTable(doc, {
        startY: y,
        head: [["Hayvan", "Kupe", "Tur", "Durum"]],
        body: (animalRes.data || []).map((x) => [x.name, x.earTag, x.animalType, x.status])
      });
      y = doc.lastAutoTable.finalY + 8;

      autoTable(doc, {
        startY: y,
        head: [["Satis", "Musteri", "Tarih", "Tutar"]],
        body: (saleRes.data || []).map((x) => [x.saleType, x.customerName, x.saleDate, money(x.totalPrice)])
      });
      y = doc.lastAutoTable.finalY + 8;

      autoTable(doc, {
        startY: y,
        head: [["Gider", "Baslik", "Tarih", "Tutar"]],
        body: (expenseRes.data || []).map((x) => [x.category, x.title, x.expenseDate, money(x.amount)])
      });
      y = doc.lastAutoTable.finalY + 8;

      if (y > 240) { doc.addPage(); y = 16; }
      autoTable(doc, {
        startY: y,
        head: [["Yem", "Stok", "Birim", "Kritik"]],
        body: (feedRes.data || []).map((x) => [x.name, x.stock, x.unit, x.criticalLevel])
      });
      y = doc.lastAutoTable.finalY + 8;

      if (y > 240) { doc.addPage(); y = 16; }
      autoTable(doc, {
        startY: y,
        head: [["Asi", "Tarih", "Sonraki", "Durum"]],
        body: (vaccinationRes.data || []).map((x) => [x.vaccineName, x.applicationDate, x.nextDate || "-", x.status])
      });
    } else {
      autoTable(doc, {
        startY: y,
        head: [["Son Satislar", "Tip", "Tarih", "Tutar"]],
        body: (summary?.recentSales || []).map((x) => [x.customerName, x.saleType, x.saleDate, money(x.totalPrice)])
      });
    }

    doc.save(type === "overview" ? "akilli-ciftlik-genel-rapor.pdf" : "akilli-ciftlik-detayli-rapor.pdf");
  };

  return (
    <div className="page enhanced">
      <aside className="sidebar enhanced">
        <div>
          <h2>Akıllı Çiftlik</h2>
          <div className="muted">{user.fullName || user.email} • {user.role}</div>
        </div>
        <div className="nav-list">
          {allSections.map((item) => (
            <button key={item.key} className={active === item.key ? "active" : ""} onClick={() => setActive(item.key)} type="button">
              {item.label}
            </button>
          ))}
        </div>
        <button type="button" className="danger" onClick={logout}>Çıkış Yap</button>
      </aside>

      <main className="content enhanced">
        <div className="topbar enhanced">
          <div>
            <h1 style={{ margin: 0 }}>{allSections.find(s => s.key === active)?.label}</h1>
        
          </div>
          <span className="badge">{todayLabel()}</span>
        </div>

        {notice ? <div className="alert success">{notice}</div> : null}

        {active === "dashboard" && summary && (
          <DashboardView summary={summary} onPdf={generatePdfReport} />
        )}

        {active === "reports" && (
          <ReportsView summary={summary} onPdf={generatePdfReport} />
        )}

        {active === "assistant" && (
          <AssistantPanel />
        )}

        {active === "admin" && isAdmin && (
          <AdminView
            users={adminUsers}
            form={adminForm}
            setForm={setAdminForm}
            onCreate={createAdminUser}
            onRole={updateRole}
            onDelete={deleteUser}
            currentUserId={user.id}
          />
        )}

        {active === "animals" && (
          <CrudSection title="Hayvan Yönetimi" endpoint="/animals"
            fields={[
              { name: "earTag", label: "Küpe No" },
              { name: "name", label: "Ad" },
              { name: "animalType", label: "Tür", type: "select", options: ["Büyükbaş", "Küçükbaş"] },
              { name: "breed", label: "Irk" },
              { name: "gender", label: "Cinsiyet", type: "select", options: ["Dişi", "Erkek"] },
              { name: "birthDate", label: "Doğum Tarihi", type: "date" },
              { name: "weight", label: "Ağırlık", type: "number" },
              { name: "purchaseDate", label: "Alış Tarihi", type: "date" },
              { name: "status", label: "Durum", type: "select", options: ["Aktif", "Satıldı", "Pasif"] },
              { name: "notes", label: "Not", type: "textarea" }
            ]}
            columns={[
              { key: "earTag", label: "Küpe" },
              { key: "name", label: "Ad" },
              { key: "animalType", label: "Tür" },
              { key: "breed", label: "Irk" },
              { key: "status", label: "Durum", render: (x) => <span className="badge">{x.status}</span> }
            ]}
          />
        )}

        {active === "purchases" && (
          <CrudSection title="Hayvan Alış Yönetimi" endpoint="/purchases"
            fields={[
              { name: "animalId", label: "Hayvan", type: "select", options: animalOptions, emptyLabel: "Hayvan seçmeden geç" },
              { name: "sellerName", label: "Satıcı" },
              { name: "purchaseType", label: "Alış Tipi", type: "select", options: ["Hayvan Alışı", "Malzeme Alışı"] },
              { name: "quantity", label: "Miktar", type: "number", defaultValue: 1 },
              { name: "unit", label: "Birim", type: "select", options: ["adet", "kg", "lt"] },
              { name: "unitPrice", label: "Birim Fiyat", type: "number" },
              { name: "totalPrice", label: "Toplam", type: "number" },
              { name: "purchaseDate", label: "Tarih", type: "date" },
              { name: "notes", label: "Not", type: "textarea" }
            ]}
            columns={[
              { key: "sellerName", label: "Satıcı" },
              { key: "purchaseType", label: "Tip" },
              { key: "purchaseDate", label: "Tarih" },
              { key: "totalPrice", label: "Tutar" }
            ]}
          />
        )}

        {active === "vaccinations" && (
          <CrudSection title="Aşı Takibi" endpoint="/vaccinations"
            fields={[
              { name: "animalId", label: "Hayvan", type: "select", options: animalOptions },
              { name: "vaccineName", label: "Aşı Adı" },
              { name: "applicationDate", label: "Uygulama Tarihi", type: "date" },
              { name: "nextDate", label: "Sonraki Tarih", type: "date" },
              { name: "veterinarian", label: "Veteriner" },
              { name: "status", label: "Durum", type: "select", options: ["Tamamlandı", "Bekliyor"] },
              { name: "notes", label: "Not", type: "textarea" }
            ]}
            columns={[
              { key: "animal", label: "Hayvan", render: (x) => x.animal ? `${x.animal.name} • ${x.animal.earTag}` : "-" },
              { key: "vaccineName", label: "Aşı" },
              { key: "applicationDate", label: "Tarih" },
              { key: "nextDate", label: "Sonraki" },
              { key: "status", label: "Durum", render: (x) => <span className="badge">{x.status}</span> }
            ]}
          />
        )}

        {active === "feed" && (
          <>
            <CrudSection title="Yem Kartları" endpoint="/feed/items"
              fields={[
                { name: "name", label: "Yem Adı" },
                { name: "unit", label: "Birim", type: "select", options: ["kg", "çuval", "lt"] },
                { name: "stock", label: "Stok", type: "number" },
                { name: "unitPrice", label: "Birim Fiyat", type: "number" },
                { name: "supplier", label: "Tedarikçi" },
                { name: "criticalLevel", label: "Kritik Seviye", type: "number", defaultValue: 50 }
              ]}
              columns={[
                { key: "name", label: "Ad" },
                { key: "stock", label: "Stok" },
                { key: "unit", label: "Birim" },
                { key: "unitPrice", label: "Fiyat" },
                { key: "criticalLevel", label: "Kritik", render: (x) => <span className={Number(x.stock) <= Number(x.criticalLevel) ? "badge low" : "badge"}>{x.criticalLevel}</span> }
              ]}
            />
            <CrudSection title="Yem Hareketleri" endpoint="/feed/transactions"
              fields={[
                { name: "feedItemId", label: "Yem Kartı", type: "select", options: feedItemOptions },
                { name: "transactionType", label: "İşlem Türü", type: "select", options: [{ value: "IN", label: "Giriş" }, { value: "OUT", label: "Çıkış" }], defaultValue: "IN", hideEmptyOption: true },
                { name: "quantity", label: "Miktar", type: "number" },
                { name: "transactionDate", label: "Tarih", type: "date" },
                { name: "notes", label: "Not", type: "textarea" }
              ]}
              columns={[
                { key: "feedItem", label: "Yem", render: (x) => x.feedItem ? x.feedItem.name : x.feedItemId },
                { key: "transactionType", label: "İşlem" },
                { key: "quantity", label: "Miktar" },
                { key: "transactionDate", label: "Tarih" }
              ]}
            />
          </>
        )}

        {active === "sales" && (
          <CrudSection title="Satışlar" endpoint="/sales"
            fields={[
              { name: "saleType", label: "Satış Tipi", type: "select", options: ["Hayvan Satışı", "Süt Satışı", "Gübre Satışı"] },
              { name: "animalId", label: "Hayvan", type: "select", options: animalOptions, emptyLabel: "Hayvan seçmeden geç" },
              { name: "customerName", label: "Müşteri" },
              { name: "quantity", label: "Miktar", type: "number", defaultValue: 1 },
              { name: "unit", label: "Birim", type: "select", options: ["adet", "lt", "kg"] },
              { name: "unitPrice", label: "Birim Fiyat", type: "number" },
              { name: "totalPrice", label: "Toplam", type: "number" },
              { name: "saleDate", label: "Tarih", type: "date" },
              { name: "paymentStatus", label: "Ödeme Durumu", type: "select", options: ["Ödendi", "Bekliyor"] },
              { name: "notes", label: "Not", type: "textarea" }
            ]}
            columns={[
              { key: "customerName", label: "Müşteri" },
              { key: "saleType", label: "Tip" },
              { key: "saleDate", label: "Tarih" },
              { key: "totalPrice", label: "Tutar" }
            ]}
          />
        )}

        {active === "expenses" && (
          <CrudSection title="Giderler" endpoint="/expenses"
            fields={[
              { name: "category", label: "Kategori", type: "select", options: ["Yem", "Veteriner", "Bakım", "Nakliye", "Diğer"] },
              { name: "title", label: "Başlık" },
              { name: "amount", label: "Tutar", type: "number" },
              { name: "expenseDate", label: "Tarih", type: "date" },
              { name: "notes", label: "Not", type: "textarea" }
            ]}
            columns={[
              { key: "category", label: "Kategori" },
              { key: "title", label: "Başlık" },
              { key: "amount", label: "Tutar" },
              { key: "expenseDate", label: "Tarih" }
            ]}
          />
        )}

        {active === "production" && (
          <CrudSection title="Üretim Kayıtları" endpoint="/production-records"
            fields={[
              { name: "animalId", label: "Hayvan", type: "select", options: animalOptions, emptyLabel: "Toplu üretim kaydı" },
              { name: "recordDate", label: "Tarih", type: "date" },
              { name: "milkAmount", label: "Süt Miktarı", type: "number" },
              { name: "quality", label: "Kalite" },
              { name: "notes", label: "Not", type: "textarea" }
            ]}
            columns={[
              { key: "animal", label: "Hayvan", render: (x) => x.animal ? `${x.animal.name} • ${x.animal.earTag}` : "-" },
              { key: "recordDate", label: "Tarih" },
              { key: "milkAmount", label: "Süt (L)" },
              { key: "quality", label: "Kalite" }
            ]}
          />
        )}
      </main>
    </div>
  );
}

function DashboardView({ summary, onPdf }) {
  const cards = summary?.cards || {};

  const financialData = {
    labels: ["Satış", "Gider", "Alış", "Net"],
    datasets: [
      {
        label: "₺",
        data: [
          Number(cards.totalSales || 0),
          Number(cards.totalExpenses || 0),
          Number(cards.totalPurchases || 0),
          Number(cards.netBalance || 0)
        ],
        backgroundColor: [
          "#22c55e", // Satış
          "#ef4444", // Gider
          "#3b82f6", // Alış
          "#f59e0b"  // Net
        ],
        borderColor: [
          "#16a34a",
          "#dc2626",
          "#2563eb",
          "#d97706"
        ],
        borderWidth: 2,
        borderRadius: 14,
        borderSkipped: false
      }
    ]
  };

  const countData = {
    labels: ["Hayvan", "Bekleyen Aşı", "Düşük Stok", "Süt L"],
    datasets: [
      {
        label: "Adet / Litre",
        data: [
          Number(cards.animalCount || 0),
          Number(cards.pendingVaccinations || 0),
          Number(cards.lowStockCount || 0),
          Number(cards.totalMilk || 0)
        ],
        borderColor: "#1f8f45",
        backgroundColor: "rgba(31, 143, 69, 0.18)",
        pointBackgroundColor: "#1f8f45",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
        fill: true,
        tension: 0.42
      }
    ]
  };

  const doughnutData = {
    labels: ["Satış", "Gider", "Alış"],
    datasets: [
      {
        data: [
          Number(cards.totalSales || 0),
          Number(cards.totalExpenses || 0),
          Number(cards.totalPurchases || 0)
        ],
        backgroundColor: [
          "#22c55e",
          "#ef4444",
          "#3b82f6"
        ],
        hoverBackgroundColor: [
          "#16a34a",
          "#dc2626",
          "#2563eb"
        ],
        borderColor: "#ffffff",
        borderWidth: 4
      }
    ]
  };

  const chartOptionsWithScales = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      tooltip: {
        backgroundColor: "#0f2d18",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        padding: 12,
        cornerRadius: 12
      }
    },
    scales: {
      x: {
        grid: {
          color: "rgba(31, 143, 69, 0.08)"
        },
        ticks: {
          color: "#284431",
          font: {
            weight: "700"
          }
        }
      },
      y: {
        grid: {
          color: "rgba(31, 143, 69, 0.10)"
        },
        ticks: {
          color: "#284431",
          font: {
            weight: "700"
          }
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "62%",
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#284431",
          font: {
            size: 14,
            weight: "bold"
          },
          usePointStyle: true,
          pointStyle: "circle",
          padding: 18
        }
      },
      tooltip: {
        backgroundColor: "#0f2d18",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        padding: 12,
        cornerRadius: 12
      }
    }
  };

  return (
    <>
      <div className="hero-card">
        <div>
          <h2>Çiftlik genel görünümü</h2>
          <p>Gelir, gider, stok ve sağlık verilerini grafiklerle izleyin.</p>
        </div>
        <div className="flex">
          <button type="button" onClick={() => onPdf("overview")}>Genel PDF</button>
          <button type="button" className="secondary" onClick={() => onPdf("detail")}>Detaylı PDF</button>
        </div>
      </div>

      <div className="card-grid">
        <Stat title="Toplam Hayvan" value={cards.animalCount} />
        <Stat title="Bekleyen Aşı" value={cards.pendingVaccinations} />
        <Stat title="Düşük Stok" value={cards.lowStockCount} />
        <Stat title="Toplam Satış" value={money(cards.totalSales)} />
        <Stat title="Toplam Gider" value={money(cards.totalExpenses)} />
        <Stat title="Toplam Alış" value={money(cards.totalPurchases)} />
        <Stat title="Net Bakiye" value={money(cards.netBalance)} />
        <Stat title="Toplam Süt" value={`${Number(cards.totalMilk || 0).toFixed(2)} L`} />
      </div>

      <div className="chart-grid">
        <div className="panel chart-panel">
          <h3>Finans Grafiği</h3>
          <div className="chart-box">
            <Bar data={financialData} options={chartOptionsWithScales} />
          </div>
        </div>

        <div className="panel chart-panel">
          <h3>Kayıt Özeti</h3>
          <div className="chart-box">
            <Line data={countData} options={chartOptionsWithScales} />
          </div>
        </div>

        <div className="panel chart-panel">
          <h3>Gelir/Gider Dağılımı</h3>
          <div className="chart-box">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      <div className="section-grid">
        <div className="panel scroll-x">
          <h3>Son Satışlar</h3>
          <table>
            <thead><tr><th>Müşteri</th><th>Tip</th><th>Tarih</th><th>Tutar</th></tr></thead>
            <tbody>
              {summary.recentSales?.length === 0 ? <tr><td colSpan="4">Henüz satış yok.</td></tr> : summary.recentSales?.map((x) => (
                <tr key={x.id}><td>{x.customerName}</td><td>{x.saleType}</td><td>{x.saleDate}</td><td>{money(x.totalPrice)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="panel scroll-x">
          <h3>Düşük Stoklar</h3>
          <table>
            <thead><tr><th>Yem</th><th>Stok</th><th>Kritik</th></tr></thead>
            <tbody>
              {summary.lowStockItems?.length === 0 ? <tr><td colSpan="3">Kritik stok yok.</td></tr> : summary.lowStockItems?.map((x) => (
                <tr key={x.id}><td>{x.name}</td><td>{x.stock}</td><td>{x.criticalLevel}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function ReportsView({ summary, onPdf }) {
  return (
    <div className="panel report-panel">
      <h2>PDF Rapor Sistemi</h2>
      <p className="muted">Tek tuşla genel veya detaylı teslim raporu oluşturabilirsiniz.</p>
      <div className="card-grid">
        <div className="card stat"><div className="muted">Net Bakiye</div><div className="value">{money(summary?.cards?.netBalance)}</div></div>
        <div className="card stat"><div className="muted">Satış</div><div className="value">{money(summary?.cards?.totalSales)}</div></div>
        <div className="card stat"><div className="muted">Gider</div><div className="value">{money(summary?.cards?.totalExpenses)}</div></div>
        <div className="card stat"><div className="muted">Alış</div><div className="value">{money(summary?.cards?.totalPurchases)}</div></div>
      </div>
      <div className="flex">
        <button type="button" onClick={() => onPdf("overview")}>Genel Rapor PDF İndir</button>
        <button type="button" className="secondary" onClick={() => onPdf("detail")}>Detaylı Rapor PDF İndir</button>
      </div>
    </div>
  );
}

function AdminView({ users, form, setForm, onCreate, onRole, onDelete, currentUserId }) {
  return (
    <div className="split improved">
      <form className="panel form-panel" onSubmit={onCreate}>
        <h2>Yeni Kullanıcı</h2>
        <div className="form-grid improved">
          <label className="field"><span>Ad Soyad</span><input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></label>
          <label className="field"><span>E-posta</span><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
          <label className="field"><span>Şifre</span><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
          <label className="field"><span>Rol</span><select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option value="USER">USER</option><option value="ADMIN">ADMIN</option></select></label>
          <div className="form-actions full"><button type="submit">Kullanıcı Oluştur</button></div>
        </div>
      </form>
      <div className="panel scroll-x">
        <h2>Kullanıcı Yetkileri</h2>
        <table>
          <thead><tr><th>Ad</th><th>E-posta</th><th>Rol</th><th>İşlem</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.fullName}</td><td>{u.email}</td>
                <td><select value={u.role} onChange={(e) => onRole(u.id, e.target.value)}><option value="USER">USER</option><option value="ADMIN">ADMIN</option></select></td>
                <td><button type="button" className="danger" disabled={u.id === currentUserId} onClick={() => onDelete(u.id)}>Sil</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
function AssistantPanel() {
  const [question, setQuestion] = React.useState("");
  const [answer, setAnswer] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const ask = async () => {
    if (!question.trim()) {
      alert("Soru yaz.");
      return;
    }

    try {
      setLoading(true);
      const res = await client.post("/assistant/ask", { question });
      setAnswer(res.data.answer);
    } catch (err) {
      alert(err?.response?.data?.message || "Asistan cevap veremedi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="panel report-panel">
      <div className="section-head">
        <div>
          <h2>🤖 Yapay Zeka Asistanı</h2>
          <p>Çiftlik verilerini sor, sistem analiz etsin.</p>
        </div>
      </div>

      <label>
        <span>Sorun</span>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Örn: Bu ay satışlarım ne kadar?"
        />
      </label>

      <button className="submit-btn" onClick={ask}>
        {loading ? "Cevap hazırlanıyor..." : "Sor"}
      </button>

      {answer && (
        <div className="panel" style={{ marginTop: 16 }}>
          <h3>Cevap</h3>
          <p className="muted" style={{ whiteSpace: "pre-wrap" }}>
            {answer}
          </p>
        </div>
      )}

      <div className="panel" style={{ marginTop: 16 }}>
        <h3>Örnek Sorular</h3>
        <div className="quick-list">
          {[
            "Toplam hayvan sayım kaç?",
            "Satış ve gider durumum nasıl?",
            "Yem stoğu düşük olanlar var mı?",
            "Yaklaşan aşılar hangileri?",
            "Net kâr zarar durumum nedir?",
          ].map((q) => (
            <button key={q} onClick={() => setQuestion(q)}>
              {q}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stat({ title, value }) {
  return <div className="card stat"><div className="muted">{title}</div><div className="value">{value || 0}</div></div>;
}
