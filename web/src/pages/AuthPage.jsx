import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setNotice("");

    try {
      setLoading(true);

      if (mode === "login") {
        await login(form.email, form.password);
      } else {
        await register(form.fullName, form.email, form.password);
      }
    } catch (err) {
      setNotice(err?.response?.data?.message || "İşlem başarısız oldu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="farm-site">
      <header className="farm-navbar">
        <div className="farm-brand">
          <div className="farm-logo">🐄</div>
          <div>
            <strong>Akıllı Çiftliğim</strong>
            <span>Sürü Takip ve Çiftlik Yönetimi</span>
          </div>
        </div>

        <nav>
          <a href="#home">Anasayfa</a>
          <a href="#control">Kontrol</a>
          <a href="#modules">Ürünler</a>
          <a href="#ai">Yapay Zeka</a>
          <a href="#faq">SSS</a>
          <a href="#login" className="nav-login">Giriş</a>
        </nav>
      </header>

      <section id="home" className="farm-hero">
        <div className="farm-hero-text">
          <span className="farm-badge">Yeni Nesil Çiftlik Otomasyonu</span>
          <h1>Akıllı Çiftliğim’e Hoş Geldiniz</h1>
          <h2>Çiftlik yönetiminde uzmanlığımızdan faydalanın.</h2>
          <p>
            İşletmenizi web ve mobil üzerinden modern araçlarla yönetin.
            Hayvan kayıtları, yem stokları, alış-satış işlemleri, aşı takibi,
            üretim kayıtları, PDF raporlar ve yapay zeka asistanı tek sistemde.
          </p>

          <div className="farm-hero-actions">
            <a href="#login" className="farm-primary-btn">Sisteme Giriş Yap</a>
            <a href="#modules" className="farm-secondary-btn">Ürünleri İncele</a>
          </div>

          <div className="farm-mini-stats">
            <div>
              <strong>Web</strong>
              <span>Yönetim Paneli</span>
            </div>
            <div>
              <strong>Mobil</strong>
              <span>Saha Kullanımı</span>
            </div>
            <div>
              <strong>AI</strong>
              <span>Akıllı Asistan</span>
            </div>
          </div>
        </div>

        <div className="farm-hero-visual">
          <div className="farm-device-card">
            <div className="farm-device-header">
              <span></span><span></span><span></span>
            </div>
            <div className="farm-device-main">
              <small>Çiftlik Net Bakiye</small>
              <strong>₺128.450</strong>
              <p>Canlı dashboard verisi</p>
            </div>
            <div className="farm-device-grid">
              <div><b>86</b><span>Hayvan</span></div>
              <div><b>12</b><span>Aşı</span></div>
              <div><b>4.2T</b><span>Yem</span></div>
              <div><b>PDF</b><span>Rapor</span></div>
            </div>
          </div>
        </div>
      </section>

      <section id="control" className="farm-section control-section">
        <div className="farm-section-title">
          <span>Her şey kontrol altında</span>
          <h2>Basit görünüm, güçlü yönetim</h2>
          <p>
            Kullanıcı dostu tasarım sayesinde çiftlikteki tüm işleri tek tuşla
            takip edebilir, çalışanların yaptığı işlemleri kontrol edebilir ve
            işletmenizin kâr-zarar durumunu anlık görebilirsiniz.
          </p>
        </div>

        <div className="control-grid">
          <InfoCard icon="🔐" title="Kayıtlarınız Güvende" text="Tüm kayıtlar kullanıcı hesabına bağlı tutulur ve yetki sistemiyle korunur." />
          <InfoCard icon="🌐" title="Her Yerden Erişim" text="Backend internete açıldığında web ve mobil farklı ağlardan kullanılabilir." />
          <InfoCard icon="🤖" title="Yapay Zeka Desteği" text="Çiftliğinize ait veriler üzerinden sorular sorabilir, hızlı analiz alabilirsiniz." />
        </div>
      </section>

      <section className="farm-section profit-section">
        <div className="profit-layout">
          <div>
            <span className="farm-badge">Kazançlı İşletme</span>
            <h2>Çiftliğim daha kazançlı ve sürdürülebilir olabilir mi?</h2>
            <p>
              Sürdürülebilir bir çiftlik için en önemli konu yönetmektir.
              Yönetmek için ise sayılabilir olmak, veriye sahip olmak ve doğru
              kararları zamanında verebilmek gerekir.
            </p>

            <ul className="profit-list">
              <li>Az personel ile daha kontrollü işletme yönetimi</li>
              <li>Yem, ilaç ve gider stoklarının düzenli takibi</li>
              <li>Satış, alış ve net bakiye analizleri</li>
              <li>Aşı ve üretim planlarının unutulmaması</li>
            </ul>
          </div>

          <div className="profit-panel">
            <h3>Akıllı Çiftliğim PRO</h3>
            <p>Damızlık ve besi işletmeleri için modern takip sistemi.</p>
            <div className="profit-number">5+</div>
            <span>Profesyonel modül</span>
          </div>
        </div>
      </section>

      <section id="modules" className="farm-section modules-section">
        <div className="farm-section-title">
          <span>Ürünler</span>
          <h2>Çiftliğinizi yönetebilmeniz için her araç burada</h2>
          <p>
            Hayvan, yem, aşı, satış, gider, üretim ve rapor süreçlerini
            tek panelde yönetin.
          </p>
        </div>

        <div className="product-grid">
          <ProductCard icon="🐄" title="Sürü Takip Programı" text="Sınırsız hayvan kaydı, küpe no takibi, tür, ırk ve durum yönetimi." />
          <ProductCard icon="🛒" title="Hayvan Alış Yönetimi" text="Satıcı, miktar, birim fiyat ve toplam alış maliyetlerini takip edin." />
          <ProductCard icon="💰" title="Satış Takibi" text="Hayvan, süt ve diğer gelirlerinizi tarih bazlı kayıt altına alın." />
          <ProductCard icon="💉" title="Aşı ve Sağlık" text="Uygulanan ve yaklaşan aşıları düzenli şekilde takip edin." />
          <ProductCard icon="🌾" title="Yem Stok Yönetimi" text="Yem kartları, kritik stok seviyeleri ve giriş-çıkış hareketleri." />
          <ProductCard icon="🥛" title="Üretim Kayıtları" text="Süt ve üretim miktarlarını hayvan veya tarih bazlı izleyin." />
          <ProductCard icon="📊" title="Grafikli Dashboard" text="Chart.js ile satış, gider, alış ve net bakiye analizleri." />
          <ProductCard icon="📄" title="PDF Raporlama" text="Genel ve detaylı raporları tek tıkla PDF olarak indirin." />
        </div>
      </section>

      <section id="ai" className="farm-section ai-farm-section">
        <div className="ai-farm-box">
          <div>
            <span className="farm-badge">Çiftlikte Yapay Zeka</span>
            <h2>Çiftliğinize soru sorun, veriler cevap versin.</h2>
            <p>
              Yapay zeka asistanı; toplam hayvan sayısı, net bakiye, düşük yem
              stokları, satış-gider durumu ve bekleyen aşılar hakkında hızlı
              yanıtlar üretir.
            </p>
          </div>

          <div className="ai-chat-box">
            <div className="ai-question">Yem stoğu düşük olanlar var mı?</div>
            <div className="ai-answer">
              Kritik seviyede 2 yem stoğu var. Besi yemi ve saman kontrol edilmeli.
            </div>
            <div className="ai-question">Net bakiye durumum nedir?</div>
            <div className="ai-answer">
              Net bakiye pozitif. Satışlarınız alış ve giderlerden yüksek görünüyor.
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="farm-section faq-section">
        <div className="farm-section-title">
          <span>SSS</span>
          <h2>Aklınıza takılan sorular</h2>
        </div>

        <div className="faq-grid">
          <Faq title="Web ve mobil aynı anda çalışır mı?" text="Evet. Socket.IO sayesinde web ve mobil arasında canlı veri akışı sağlanır." />
          <Faq title="Farklı Wi-Fi’dan kullanılabilir mi?" text="Evet. Backend canlı sunucuya alındığında dünyanın her yerinden erişilebilir." />
          <Faq title="PDF rapor alınabilir mi?" text="Evet. Genel ve detaylı raporlar PDF olarak indirilebilir." />
          <Faq title="Admin yetki sistemi var mı?" text="Evet. Kullanıcılar ADMIN veya USER rolüyle yönetilebilir." />
        </div>
      </section>

      <section id="login" className="farm-login-section">
        <div className="login-copy">
          <span className="farm-badge">Bağlantı Kurmak İstiyor musunuz?</span>
          <h2>Hemen giriş yapın ve çiftliğinizi yönetmeye başlayın.</h2>
          <p>
            Sistem web ve mobil olarak çalışır. Hemen kaydol ve giriş yap. 
          </p>
        </div>

        <form className="farm-auth-card" onSubmit={submit}>
          <h2>{mode === "login" ? "Giriş Yap" : "Yeni Hesap Oluştur"}</h2>
          <p>
            {mode === "login"
              ? "Yönetim paneline erişmek için giriş yapın."
              : "Yeni çiftlik hesabı oluşturun."}
          </p>

          {mode === "register" && (
            <label>
              Ad Soyad
              <input
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                placeholder="Ad Soyad"
              />
            </label>
          )}

          <label>
            E-posta
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="ornek@mail.com"
            />
          </label>

          <label>
            Şifre
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="******"
            />
          </label>

          {notice && <div className="farm-error">{notice}</div>}

          <button type="submit" disabled={loading}>
            {loading ? "İşleniyor..." : mode === "login" ? "Giriş Yap" : "Kayıt Ol"}
          </button>

          <button
            type="button"
            className="farm-ghost"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
          >
            {mode === "login" ? "Yeni hesap oluştur" : "Zaten hesabım var"}
          </button>
        </form>
      </section>

      <footer className="farm-footer">
        <strong>Akıllı Çiftliğim PRO</strong>
        <span>Web + Mobil + AI + PDF + Admin Yönetim Sistemi</span>
      </footer>
    </div>
  );
}

function InfoCard({ icon, title, text }) {
  return (
    <div className="info-card">
      <div>{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function ProductCard({ icon, title, text }) {
  return (
    <div className="product-card">
      <div>{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function Faq({ title, text }) {
  return (
    <div className="faq-card">
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}