import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { io } from "socket.io-client";

const API = process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.107:4000/api";
const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || "http://192.168.1.107:4000";

const client = axios.create({ baseURL: API });

client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const today = () => new Date().toISOString().slice(0, 10);

const money = (value) => `${Number(value || 0).toFixed(0)} ₺`;

const calcTotal = (qty, unitPrice) =>
  String((Number(qty || 0) * Number(unitPrice || 0)).toFixed(2));

const colors = {
  bg: "#f7faf7",
  soft: "#eef7ee",
  card: "#ffffff",
  primary: "#1f8f45",
  primary2: "#74b82e",
  border: "#dbe7dd",
  text: "#0f2d18",
  muted: "#66806f",
  danger: "#ef4444",
  warning: "#f59e0b",
};

const menuItems = [
  ["dashboard", "📊", "Anasayfa", "Genel görünüm"],
  ["animals", "🐄", "Hayvanlar", "Kayıt ve durum"],
  ["purchases", "🛒", "Hayvan Alış", "Alış hareketleri"],
  ["vaccinations", "💉", "Aşılar", "Sağlık planı"],
  ["feed-items", "🌾", "Yem Kartları", "Stok kartları"],
  ["feed-transactions", "🔄", "Yem Hareketleri", "Giriş / çıkış"],
  ["sales", "💰", "Satışlar", "Gelir kayıtları"],
  ["expenses", "🧾", "Giderler", "Masraflar"],
  ["production", "🥛", "Üretim", "Süt kayıtları"],
  ["assistant", "🤖", "AI Asistan", "Çiftliğe soru sor"],
];

const bottomTabs = [
  ["menu", "🏠", "Menü"],
  ["dashboard", "📊", "Anasayfa"],
  ["sales", "💰", "Satış"],
  ["expenses", "🧾", "Gider"],
  ["assistant", "🤖", "AI"],
];

const emptyForms = {
  animals: {
    earTag: "",
    name: "",
    animalType: "Büyükbaş",
    breed: "",
    gender: "Dişi",
    weight: "",
    purchaseDate: today(),
    status: "Aktif",
    notes: "",
  },
  purchases: {
    animalId: "",
    sellerName: "",
    purchaseType: "Hayvan Alışı",
    quantity: "1",
    unit: "adet",
    unitPrice: "",
    totalPrice: "",
    purchaseDate: today(),
    notes: "",
  },
  vaccinations: {
    animalId: "",
    vaccineName: "",
    applicationDate: today(),
    nextDate: "",
    veterinarian: "",
    status: "Tamamlandı",
    notes: "",
  },
  feedItems: {
    name: "",
    unit: "kg",
    stock: "",
    unitPrice: "",
    supplier: "",
    criticalLevel: "50",
  },
  feedTransactions: {
    feedItemId: "",
    transactionType: "IN",
    quantity: "",
    transactionDate: today(),
    notes: "",
  },
  sales: {
    saleType: "Hayvan Satışı",
    animalId: "",
    customerName: "",
    quantity: "1",
    unit: "adet",
    unitPrice: "",
    totalPrice: "",
    saleDate: today(),
    paymentStatus: "Ödendi",
    notes: "",
  },
  expenses: {
    category: "Yem",
    title: "",
    amount: "",
    expenseDate: today(),
    notes: "",
  },
  production: {
    animalId: "",
    recordDate: today(),
    milkAmount: "",
    quality: "",
    notes: "",
  },
};

const endpoints = {
  animals: "/animals",
  purchases: "/purchases",
  vaccinations: "/vaccinations",
  feedItems: "/feed/items",
  feedTransactions: "/feed/transactions",
  sales: "/sales",
  expenses: "/expenses",
  production: "/production-records",
};

const deleteEndpoints = {
  animals: "/animals",
  purchases: "/purchases",
  vaccinations: "/vaccinations",
  feedItems: "/feed/items",
  sales: "/sales",
  expenses: "/expenses",
  production: "/production-records",
};

function Input({
  label,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  readOnly = false,
  price = false,
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={price ? styles.priceBox : null}>
        <TextInput
          value={String(value ?? "")}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          editable={!readOnly}
          keyboardType={keyboardType}
          style={[
            styles.input,
            readOnly && styles.readonlyInput,
            price && styles.priceInput,
          ]}
          placeholder={label}
          placeholderTextColor="#8aa08e"
        />
        {price ? <Text style={styles.priceSymbol}>₺</Text> : null}
      </View>
    </View>
  );
}

function Button({ title, onPress, variant = "primary", small = false }) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === "secondary" && styles.secondaryButton,
        variant === "danger" && styles.dangerButton,
        small && styles.smallButton,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.buttonText,
          variant === "secondary" && styles.secondaryButtonText,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

function Card({ title, children, style }) {
  return (
    <View style={[styles.card, style]}>
      {title ? <Text style={styles.cardTitle}>{title}</Text> : null}
      {children}
    </View>
  );
}

function Header({ title, subtitle, onBack, onLogout }) {
  return (
    <View style={styles.headerRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {onBack ? <Button title="Menü" variant="secondary" small onPress={onBack} /> : null}
      {onLogout ? <Button title="Çıkış" variant="danger" small onPress={onLogout} /> : null}
    </View>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ListRow({ title, subtitle, right, onDelete }) {
  return (
    <View style={styles.listItem}>
      <View style={{ flex: 1 }}>
        <Text style={styles.listTitle}>{title || "-"}</Text>
        <Text style={styles.listMeta}>{subtitle || "-"}</Text>
      </View>
      {right ? <Text style={styles.listRight}>{right}</Text> : null}
      {onDelete ? <Button title="Sil" variant="danger" small onPress={onDelete} /> : null}
    </View>
  );
}

function BottomNav({ page, setPage }) {
  return (
    <View style={styles.bottomNav}>
      {bottomTabs.map(([key, icon, label]) => (
        <TouchableOpacity
          key={key}
          style={[styles.bottomItem, page === key && styles.bottomItemActive]}
          onPress={() => setPage(key)}
        >
          <Text style={styles.bottomIcon}>{icon}</Text>
          <Text
            style={[
              styles.bottomLabel,
              page === key && styles.bottomLabelActive,
            ]}
          >
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("menu");
  const [authForm, setAuthForm] = useState({ fullName: "", email: "", password: "" });

  const [summary, setSummary] = useState(null);
  const [animals, setAnimals] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [feedItems, setFeedItems] = useState([]);
  const [feedTransactions, setFeedTransactions] = useState([]);
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [production, setProduction] = useState([]);

  const [forms, setForms] = useState(JSON.parse(JSON.stringify(emptyForms)));
  const [assistantQuestion, setAssistantQuestion] = useState("");
  const [assistantAnswer, setAssistantAnswer] = useState("");
  const [assistantLoading, setAssistantLoading] = useState(false);

  const cards = summary?.cards || {};

  const animalOptionsText = useMemo(
    () => animals.map((a) => `${a.id}: ${a.name} (${a.earTag || "-"})`).join("\n"),
    [animals]
  );

  const feedOptionsText = useMemo(
    () => feedItems.map((f) => `${f.id}: ${f.name} (${f.stock || 0} ${f.unit || "kg"})`).join("\n"),
    [feedItems]
  );

  useEffect(() => {
    bootstrap();
  }, []);

  useEffect(() => {
    if (!user) return;

    const socket = io(SOCKET_URL);
    socket.on("data:changed", () => {
      loadAll().catch(() => {});
    });

    return () => socket.disconnect();
  }, [user]);

  async function bootstrap() {
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      setReady(true);
      return;
    }

    try {
      const { data } = await client.get("/auth/me");
      setUser(data);
      await loadAll();
    } catch {
      await AsyncStorage.removeItem("token");
      setUser(null);
    } finally {
      setReady(true);
    }
  }

  async function loadAll() {
    const [
      summaryRes,
      animalsRes,
      purchasesRes,
      vaccinationsRes,
      feedItemsRes,
      feedTransactionsRes,
      salesRes,
      expensesRes,
      productionRes,
    ] = await Promise.all([
      client.get("/dashboard/summary"),
      client.get("/animals"),
      client.get("/purchases"),
      client.get("/vaccinations"),
      client.get("/feed/items"),
      client.get("/feed/transactions"),
      client.get("/sales"),
      client.get("/expenses"),
      client.get("/production-records"),
    ]);

    setSummary(summaryRes.data);
    setAnimals(animalsRes.data || []);
    setPurchases(purchasesRes.data || []);
    setVaccinations(vaccinationsRes.data || []);
    setFeedItems(feedItemsRes.data || []);
    setFeedTransactions(feedTransactionsRes.data || []);
    setSales(salesRes.data || []);
    setExpenses(expensesRes.data || []);
    setProduction(productionRes.data || []);
  }

  async function login() {
    try {
      const { data } = await client.post("/auth/login", {
        email: authForm.email.trim(),
        password: authForm.password.trim(),
      });

      await AsyncStorage.setItem("token", data.token);
      setUser(data.user);
      await loadAll();
      setPage("menu");
    } catch (e) {
      Alert.alert("Giriş Hatası", e?.response?.data?.message || "Giriş yapılamadı.");
    }
  }

  async function register() {
    try {
      const { data } = await client.post("/auth/register", authForm);

      await AsyncStorage.setItem("token", data.token);
      setUser(data.user);
      await loadAll();
      setPage("menu");
    } catch (e) {
      Alert.alert("Kayıt Hatası", e?.response?.data?.message || "Kayıt yapılamadı.");
    }
  }

  async function logout() {
    await AsyncStorage.removeItem("token");
    setUser(null);
    setPage("menu");
  }

  function resetForm(key) {
    setForms((prev) => ({ ...prev, [key]: { ...emptyForms[key] } }));
  }

  function updateForm(key, field, value) {
    setForms((prev) => {
      const next = {
        ...prev[key],
        [field]: value,
      };

      if ((key === "purchases" || key === "sales") && (field === "quantity" || field === "unitPrice")) {
        next.totalPrice = calcTotal(
          field === "quantity" ? value : next.quantity,
          field === "unitPrice" ? value : next.unitPrice
        );
      }

      return { ...prev, [key]: next };
    });
  }

  async function save(moduleKey) {
    try {
      await client.post(endpoints[moduleKey], forms[moduleKey]);
      resetForm(moduleKey);
      await loadAll();
      Alert.alert("Başarılı", "Kayıt eklendi.");
    } catch (e) {
      Alert.alert("Hata", e?.response?.data?.message || "Kaydedilemedi.");
    }
  }

  async function remove(moduleKey, id) {
    try {
      if (!deleteEndpoints[moduleKey]) {
        Alert.alert("Bilgi", "Bu kayıt tipi için silme kapalı.");
        return;
      }

      await client.delete(`${deleteEndpoints[moduleKey]}/${id}`);
      await loadAll();
      Alert.alert("Başarılı", "Kayıt silindi.");
    } catch (e) {
      Alert.alert("Hata", e?.response?.data?.message || "Silinemedi.");
    }
  }

  async function askAssistant() {
    if (!assistantQuestion.trim()) {
      Alert.alert("Uyarı", "Soru yazınız.");
      return;
    }

    try {
      setAssistantLoading(true);
      const { data } = await client.post("/assistant/ask", {
        question: assistantQuestion,
      });
      setAssistantAnswer(data.answer || "Cevap üretilemedi.");
    } catch (e) {
      Alert.alert("Hata", e?.response?.data?.message || "Asistan cevap veremedi.");
    } finally {
      setAssistantLoading(false);
    }
  }

  const renderPageHeader = (title, subtitle = "Web paneli ile uyumlu mobil bölüm") => (
    <Header title={title} subtitle={subtitle} onBack={() => setPage("menu")} />
  );

  const listFor = (moduleKey, rows, titleBuilder, subtitleBuilder, rightBuilder, deleteEnabled = true) => (
    <Card title="Kayıtlar">
      {rows.length === 0 ? (
        <Text style={styles.empty}>Henüz kayıt yok.</Text>
      ) : (
        rows.map((row) => (
          <ListRow
            key={row.id}
            title={titleBuilder(row)}
            subtitle={subtitleBuilder(row)}
            right={rightBuilder ? rightBuilder(row) : null}
            onDelete={deleteEnabled ? () => remove(moduleKey, row.id) : undefined}
          />
        ))
      )}
    </Card>
  );

  if (!ready) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <ScrollView contentContainerStyle={styles.authWrap}>
          <View style={styles.authHero}>
            <Text style={styles.logoText}>🐄</Text>
            <Text style={styles.authTitle}>Akıllı Çiftliğim</Text>
            <Text style={styles.authSubtitle}>
              Web + Mobil + AI destekli profesyonel çiftlik yönetimi
            </Text>
          </View>

          <Card title={authMode === "login" ? "Giriş Yap" : "Yeni Hesap Oluştur"}>
            {authMode === "register" ? (
              <Input
                label="Ad Soyad"
                value={authForm.fullName}
                onChangeText={(v) => setAuthForm({ ...authForm, fullName: v })}
              />
            ) : null}

            <Input
              label="E-posta"
              value={authForm.email}
              onChangeText={(v) => setAuthForm({ ...authForm, email: v })}
            />

            <Input
              label="Şifre"
              value={authForm.password}
              secureTextEntry
              onChangeText={(v) => setAuthForm({ ...authForm, password: v })}
            />

            <Button title={authMode === "login" ? "Giriş Yap" : "Kayıt Ol"} onPress={authMode === "login" ? login : register} />

            <Button
              title={authMode === "login" ? "Yeni hesap oluştur" : "Giriş ekranına dön"}
              variant="secondary"
              onPress={() => setAuthMode(authMode === "login" ? "register" : "login")}
            />
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const pageContent = {
    dashboard: (
      <>
        {renderPageHeader("Anasayfa", "Çiftlik genel görünümü")}
        <View style={styles.dashboardGrid}>
          <StatCard label="Hayvan" value={cards.animalCount || 0} icon="🐄" />
          <StatCard label="Aşı" value={cards.pendingVaccinations || 0} icon="💉" />
          <StatCard label="Satış" value={money(cards.totalSales)} icon="💰" />
          <StatCard label="Alış" value={money(cards.totalPurchases)} icon="🛒" />
          <StatCard label="Gider" value={money(cards.totalExpenses)} icon="🧾" />
          <StatCard label="Net" value={money(cards.netBalance)} icon="📈" />
        </View>
        <Card title="Kritik Durumlar">
          <Text style={styles.line}>Düşük stok: {cards.lowStockCount || 0}</Text>
          <Text style={styles.line}>Toplam süt: {Number(cards.totalMilk || 0).toFixed(2)} L</Text>
          <Text style={styles.line}>Net bakiye: {money(cards.netBalance)}</Text>
        </Card>
      </>
    ),

    animals: (
      <>
        {renderPageHeader("Hayvanlar")}
        <Card title="Hayvan Ekle">
          <Input label="Küpe No" value={forms.animals.earTag} onChangeText={(v) => updateForm("animals", "earTag", v)} />
          <Input label="Ad" value={forms.animals.name} onChangeText={(v) => updateForm("animals", "name", v)} />
          <Input label="Tür" value={forms.animals.animalType} onChangeText={(v) => updateForm("animals", "animalType", v)} />
          <Input label="Irk" value={forms.animals.breed} onChangeText={(v) => updateForm("animals", "breed", v)} />
          <Input label="Cinsiyet" value={forms.animals.gender} onChangeText={(v) => updateForm("animals", "gender", v)} />
          <Input label="Ağırlık" value={forms.animals.weight} keyboardType="numeric" onChangeText={(v) => updateForm("animals", "weight", v)} />
          <Input label="Alış Tarihi (YYYY-AA-GG)" value={forms.animals.purchaseDate} onChangeText={(v) => updateForm("animals", "purchaseDate", v)} />
          <Button title="Kaydet" onPress={() => save("animals")} />
        </Card>
        {listFor("animals", animals, (r) => `${r.name} (${r.earTag})`, (r) => `${r.animalType || "-"} • ${r.status || "-"} • ${r.purchaseDate || "-"}`)}
      </>
    ),

    purchases: (
      <>
        {renderPageHeader("Hayvan Alış")}
        <Card title="Yeni Alış Kaydı">
          <Text style={styles.helper}>Hayvan seçimleri:</Text>
          <Text style={styles.helperList}>{animalOptionsText || "Önce hayvan ekleyin veya boş bırakın."}</Text>
          <Input label="Hayvan ID (opsiyonel)" value={forms.purchases.animalId} keyboardType="numeric" onChangeText={(v) => updateForm("purchases", "animalId", v)} />
          <Input label="Satıcı" value={forms.purchases.sellerName} onChangeText={(v) => updateForm("purchases", "sellerName", v)} />
          <Input label="Alış Tipi" value={forms.purchases.purchaseType} onChangeText={(v) => updateForm("purchases", "purchaseType", v)} />
          <Input label="Miktar" value={forms.purchases.quantity} keyboardType="numeric" onChangeText={(v) => updateForm("purchases", "quantity", v)} />
          <Input label="Birim" value={forms.purchases.unit} onChangeText={(v) => updateForm("purchases", "unit", v)} />
          <Input label="Birim Fiyat" value={forms.purchases.unitPrice} keyboardType="numeric" onChangeText={(v) => updateForm("purchases", "unitPrice", v)} />
          <Input label="Toplam" value={forms.purchases.totalPrice} readOnly price />
          <Input label="Tarih (YYYY-AA-GG)" value={forms.purchases.purchaseDate} onChangeText={(v) => updateForm("purchases", "purchaseDate", v)} />
          <Button title="Kaydet" onPress={() => save("purchases")} />
        </Card>
        {listFor("purchases", purchases, (r) => r.sellerName || "Alış", (r) => `${r.purchaseType || "-"} • ${r.purchaseDate || "-"}`, (r) => money(r.totalPrice))}
      </>
    ),

    vaccinations: (
      <>
        {renderPageHeader("Aşılar")}
        <Card title="Aşı Ekle">
          <Text style={styles.helper}>Hayvan seçimleri:</Text>
          <Text style={styles.helperList}>{animalOptionsText || "Önce hayvan ekleyin."}</Text>
          <Input label="Hayvan ID" value={forms.vaccinations.animalId} keyboardType="numeric" onChangeText={(v) => updateForm("vaccinations", "animalId", v)} />
          <Input label="Aşı Adı" value={forms.vaccinations.vaccineName} onChangeText={(v) => updateForm("vaccinations", "vaccineName", v)} />
          <Input label="Uygulama Tarihi (YYYY-AA-GG)" value={forms.vaccinations.applicationDate} onChangeText={(v) => updateForm("vaccinations", "applicationDate", v)} />
          <Input label="Sonraki Tarih" value={forms.vaccinations.nextDate} onChangeText={(v) => updateForm("vaccinations", "nextDate", v)} />
          <Input label="Veteriner" value={forms.vaccinations.veterinarian} onChangeText={(v) => updateForm("vaccinations", "veterinarian", v)} />
          <Input label="Durum" value={forms.vaccinations.status} onChangeText={(v) => updateForm("vaccinations", "status", v)} />
          <Button title="Kaydet" onPress={() => save("vaccinations")} />
        </Card>
        {listFor("vaccinations", vaccinations, (r) => r.vaccineName, (r) => `Hayvan ${r.animalId || "-"} • ${r.applicationDate || "-"} • ${r.status || "-"}`)}
      </>
    ),

    "feed-items": (
      <>
        {renderPageHeader("Yem Kartları")}
        <Card title="Yem Kartı Ekle">
          <Input label="Yem Adı" value={forms.feedItems.name} onChangeText={(v) => updateForm("feedItems", "name", v)} />
          <Input label="Birim" value={forms.feedItems.unit} onChangeText={(v) => updateForm("feedItems", "unit", v)} />
          <Input label="Stok" value={forms.feedItems.stock} keyboardType="numeric" onChangeText={(v) => updateForm("feedItems", "stock", v)} />
          <Input label="Birim Fiyat" value={forms.feedItems.unitPrice} keyboardType="numeric" onChangeText={(v) => updateForm("feedItems", "unitPrice", v)} />
          <Input label="Tedarikçi" value={forms.feedItems.supplier} onChangeText={(v) => updateForm("feedItems", "supplier", v)} />
          <Input label="Kritik Seviye" value={forms.feedItems.criticalLevel} keyboardType="numeric" onChangeText={(v) => updateForm("feedItems", "criticalLevel", v)} />
          <Button title="Kaydet" onPress={() => save("feedItems")} />
        </Card>
        {listFor("feedItems", feedItems, (r) => r.name, (r) => `${r.stock} ${r.unit} • Kritik ${r.criticalLevel}`, (r) => money(r.unitPrice))}
      </>
    ),

    "feed-transactions": (
      <>
        {renderPageHeader("Yem Hareketleri")}
        <Card title="Yeni Hareket">
          <Text style={styles.helper}>Yem kartları:</Text>
          <Text style={styles.helperList}>{feedOptionsText || "Önce yem kartı ekleyin."}</Text>
          <Input label="Yem Kartı ID" value={forms.feedTransactions.feedItemId} keyboardType="numeric" onChangeText={(v) => updateForm("feedTransactions", "feedItemId", v)} />
          <Input label="İşlem Türü (IN/OUT)" value={forms.feedTransactions.transactionType} onChangeText={(v) => updateForm("feedTransactions", "transactionType", v)} />
          <Input label="Miktar" value={forms.feedTransactions.quantity} keyboardType="numeric" onChangeText={(v) => updateForm("feedTransactions", "quantity", v)} />
          <Input label="Tarih (YYYY-AA-GG)" value={forms.feedTransactions.transactionDate} onChangeText={(v) => updateForm("feedTransactions", "transactionDate", v)} />
          <Button title="Kaydet" onPress={() => save("feedTransactions")} />
        </Card>
        {listFor("feedTransactions", feedTransactions, (r) => `Yem ${r.feedItemId}`, (r) => `${r.transactionType} • ${r.quantity} • ${r.transactionDate}`, null, false)}
      </>
    ),

    sales: (
      <>
        {renderPageHeader("Satışlar")}
        <Card title="Satış Ekle">
          <Text style={styles.helper}>Hayvan seçimleri:</Text>
          <Text style={styles.helperList}>{animalOptionsText || "Önce hayvan ekleyin veya boş bırakın."}</Text>
          <Input label="Satış Tipi" value={forms.sales.saleType} onChangeText={(v) => updateForm("sales", "saleType", v)} />
          <Input label="Hayvan ID" value={forms.sales.animalId} keyboardType="numeric" onChangeText={(v) => updateForm("sales", "animalId", v)} />
          <Input label="Müşteri" value={forms.sales.customerName} onChangeText={(v) => updateForm("sales", "customerName", v)} />
          <Input label="Miktar" value={forms.sales.quantity} keyboardType="numeric" onChangeText={(v) => updateForm("sales", "quantity", v)} />
          <Input label="Birim" value={forms.sales.unit} onChangeText={(v) => updateForm("sales", "unit", v)} />
          <Input label="Birim Fiyat" value={forms.sales.unitPrice} keyboardType="numeric" onChangeText={(v) => updateForm("sales", "unitPrice", v)} />
          <Input label="Toplam" value={forms.sales.totalPrice} readOnly price />
          <Input label="Tarih (YYYY-AA-GG)" value={forms.sales.saleDate} onChangeText={(v) => updateForm("sales", "saleDate", v)} />
          <Input label="Ödeme Durumu" value={forms.sales.paymentStatus} onChangeText={(v) => updateForm("sales", "paymentStatus", v)} />
          <Button title="Kaydet" onPress={() => save("sales")} />
        </Card>
        {listFor("sales", sales, (r) => r.customerName || "Satış", (r) => `${r.saleType || "-"} • ${r.saleDate || "-"} • ${r.paymentStatus || "-"}`, (r) => money(r.totalPrice))}
      </>
    ),

    expenses: (
      <>
        {renderPageHeader("Giderler")}
        <Card title="Gider Ekle">
          <Input label="Kategori" value={forms.expenses.category} onChangeText={(v) => updateForm("expenses", "category", v)} />
          <Input label="Başlık" value={forms.expenses.title} onChangeText={(v) => updateForm("expenses", "title", v)} />
          <Input label="Tutar" value={forms.expenses.amount} keyboardType="numeric" onChangeText={(v) => updateForm("expenses", "amount", v)} />
          <Input label="Tarih (YYYY-AA-GG)" value={forms.expenses.expenseDate} onChangeText={(v) => updateForm("expenses", "expenseDate", v)} />
          <Button title="Kaydet" onPress={() => save("expenses")} />
        </Card>
        {listFor("expenses", expenses, (r) => r.title || r.category, (r) => `${r.category || "-"} • ${r.expenseDate || "-"}`, (r) => money(r.amount))}
      </>
    ),

    production: (
      <>
        {renderPageHeader("Üretim")}
        <Card title="Üretim Ekle">
          <Text style={styles.helper}>Hayvan seçimleri:</Text>
          <Text style={styles.helperList}>{animalOptionsText || "Önce hayvan ekleyin veya boş bırakın."}</Text>
          <Input label="Hayvan ID" value={forms.production.animalId} keyboardType="numeric" onChangeText={(v) => updateForm("production", "animalId", v)} />
          <Input label="Tarih (YYYY-AA-GG)" value={forms.production.recordDate} onChangeText={(v) => updateForm("production", "recordDate", v)} />
          <Input label="Süt Miktarı" value={forms.production.milkAmount} keyboardType="numeric" onChangeText={(v) => updateForm("production", "milkAmount", v)} />
          <Input label="Kalite" value={forms.production.quality} onChangeText={(v) => updateForm("production", "quality", v)} />
          <Button title="Kaydet" onPress={() => save("production")} />
        </Card>
        {listFor("production", production, (r) => `Hayvan ${r.animalId || "-"}`, (r) => `${r.milkAmount || 0} L • ${r.recordDate || "-"} • ${r.quality || "-"}`)}
      </>
    ),

    assistant: (
      <>
        {renderPageHeader("AI Asistan", "Çiftliğinize soru sorun")}
        <Card title="Soru Sor">
          <Input label="Sorunuz" value={assistantQuestion} onChangeText={setAssistantQuestion} />
          <Button title={assistantLoading ? "Cevap hazırlanıyor..." : "Sor"} onPress={askAssistant} />
        </Card>

        {assistantAnswer ? (
          <Card title="Cevap">
            <Text style={styles.line}>{assistantAnswer}</Text>
          </Card>
        ) : null}

        <Card title="Örnek Sorular">
          {[
            "Toplam hayvan sayım kaç?",
            "Satış ve gider durumum nasıl?",
            "Yem stoğu düşük olanlar var mı?",
            "Yaklaşan aşılar hangileri?",
            "Net bakiye durumum nedir?",
          ].map((q) => (
            <TouchableOpacity key={q} style={styles.sampleQuestion} onPress={() => setAssistantQuestion(q)}>
              <Text style={styles.sampleQuestionText}>{q}</Text>
            </TouchableOpacity>
          ))}
        </Card>
      </>
    ),
  };

  if (page === "menu") {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <ScrollView contentContainerStyle={styles.pageWrapWithBottom}>
          <Header
            title={`Hoş geldin, ${user.fullName || user.email}`}
            subtitle="Akıllı Çiftliğim Mobil"
            onLogout={logout}
          />

          <View style={styles.heroMobile}>
            <Text style={styles.heroBadge}>Yeni Nesil Çiftlik Otomasyonu</Text>
            <Text style={styles.heroTitle}>Her şey kontrol altında</Text>
            <Text style={styles.heroText}>
              Web ve mobil arasında canlı senkronize çalışan profesyonel çiftlik yönetim sistemi.
            </Text>
          </View>

          <View style={styles.dashboardGrid}>
            <StatCard label="Hayvan" value={cards.animalCount || 0} icon="🐄" />
            <StatCard label="Aşı" value={cards.pendingVaccinations || 0} icon="💉" />
            <StatCard label="Satış" value={money(cards.totalSales)} icon="💰" />
            <StatCard label="Net" value={money(cards.netBalance)} icon="📈" />
          </View>

          <Text style={styles.sectionTitle}>Bölümler</Text>
          <View style={styles.menuGrid}>
            {menuItems.map(([key, icon, label, hint]) => (
              <TouchableOpacity key={key} style={styles.menuCard} onPress={() => setPage(key)}>
                <Text style={styles.menuIcon}>{icon}</Text>
                <Text style={styles.menuLabel}>{label}</Text>
                <Text style={styles.menuHint}>{hint}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        <BottomNav page={page} setPage={setPage} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.pageWrapWithBottom}>
        {pageContent[page]}
      </ScrollView>
      <BottomNav page={page} setPage={setPage} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  loadingText: { color: colors.text, fontSize: 20, fontWeight: "800", margin: 24 },
  authWrap: { flexGrow: 1, justifyContent: "center", padding: 22 },
  authHero: { alignItems: "center", marginBottom: 20 },
  logoText: { fontSize: 52, marginBottom: 8 },
  authTitle: { color: colors.text, fontSize: 32, fontWeight: "900", textAlign: "center" },
  authSubtitle: { color: colors.muted, textAlign: "center", marginTop: 8, lineHeight: 20 },
  pageWrapWithBottom: { padding: 18, paddingBottom: 110 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 14 },
  title: { color: colors.text, fontSize: 24, fontWeight: "900", marginBottom: 4 },
  subtitle: { color: colors.muted, fontSize: 13 },
  heroMobile: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 26, padding: 20, marginBottom: 14, shadowColor: colors.primary, shadowOpacity: 0.12, shadowRadius: 20, elevation: 3 },
  heroBadge: { alignSelf: "flex-start", backgroundColor: "#e4f6df", color: colors.primary, borderRadius: 999, paddingVertical: 7, paddingHorizontal: 12, fontWeight: "900", marginBottom: 12 },
  heroTitle: { color: colors.text, fontSize: 28, fontWeight: "900" },
  heroText: { color: colors.muted, marginTop: 8, lineHeight: 20 },
  card: { backgroundColor: colors.card, borderRadius: 22, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 14, shadowColor: colors.primary, shadowOpacity: 0.08, shadowRadius: 16, elevation: 2 },
  cardTitle: { color: colors.text, fontSize: 18, fontWeight: "900", marginBottom: 12 },
  inputGroup: { marginBottom: 10 },
  label: { color: colors.text, fontSize: 13, marginBottom: 6, fontWeight: "800" },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 13, color: colors.text, backgroundColor: "#ffffff" },
  readonlyInput: { backgroundColor: "#dcfce7", borderColor: "#22c55e", color: "#166534", fontWeight: "900" },
  priceBox: { position: "relative" },
  priceInput: { paddingRight: 42 },
  priceSymbol: { position: "absolute", right: 14, top: 13, color: "#166534", fontWeight: "900", fontSize: 16 },
  helper: { color: colors.primary, marginBottom: 4, fontWeight: "800" },
  helperList: { color: colors.muted, marginBottom: 10, lineHeight: 18 },
  button: { backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 13, paddingHorizontal: 14, marginTop: 8, alignItems: "center" },
  secondaryButton: { backgroundColor: "#e4f6df", borderWidth: 1, borderColor: "#bde5b6" },
  dangerButton: { backgroundColor: colors.danger },
  smallButton: { paddingVertical: 8, paddingHorizontal: 12, marginTop: 0 },
  buttonText: { color: "#ffffff", fontWeight: "900" },
  secondaryButtonText: { color: colors.primary },
  dashboardGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 14 },
  statCard: { width: "48%", backgroundColor: colors.card, borderRadius: 20, borderWidth: 1, borderColor: colors.border, padding: 15 },
  statIcon: { fontSize: 24, marginBottom: 8 },
  statValue: { color: colors.text, fontSize: 20, fontWeight: "900" },
  statLabel: { color: colors.muted, fontSize: 13, marginTop: 4 },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: "900", marginBottom: 10, marginTop: 4 },
  menuGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  menuCard: { width: "48%", minHeight: 120, backgroundColor: colors.card, borderRadius: 20, borderWidth: 1, borderColor: colors.border, padding: 15, justifyContent: "space-between" },
  menuIcon: { fontSize: 28 },
  menuLabel: { color: colors.text, fontWeight: "900", fontSize: 16 },
  menuHint: { color: colors.muted, fontSize: 12 },
  listItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  listTitle: { color: colors.text, fontWeight: "900", marginBottom: 3 },
  listMeta: { color: colors.muted, fontSize: 12 },
  listRight: { color: colors.primary, fontWeight: "900", marginRight: 6 },
  empty: { color: colors.muted },
  line: { color: colors.text, lineHeight: 22, marginBottom: 8 },
  sampleQuestion: { backgroundColor: colors.soft, borderRadius: 14, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: colors.border },
  sampleQuestionText: { color: colors.text, fontWeight: "800" },
  bottomNav: { position: "absolute", left: 10, right: 10, bottom: 10, height: 74, backgroundColor: "#ffffff", borderRadius: 26, borderWidth: 1, borderColor: colors.border, flexDirection: "row", alignItems: "center", justifyContent: "space-around", shadowColor: colors.primary, shadowOpacity: 0.16, shadowRadius: 20, elevation: 6 },
  bottomItem: { alignItems: "center", justifyContent: "center", minWidth: 58, padding: 8, borderRadius: 18 },
  bottomItemActive: { backgroundColor: "#e4f6df" },
  bottomIcon: { fontSize: 20 },
  bottomLabel: { color: colors.muted, fontSize: 10, fontWeight: "800", marginTop: 4 },
  bottomLabelActive: { color: colors.primary },
});
