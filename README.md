# Akıllı Çiftlik 

Bu paket teslim odaklı, çok modüllü bir **Akıllı Çiftlik Yönetim Sistemi** örneğidir.

## Modüller
- Kullanıcı girişi / kayıt / JWT auth
- Hayvan yönetimi
- Aşı takibi
- Yem stoğu ve yem hareketleri
- Satış kayıtları
- Gider kayıtları
- Üretim kayıtları
- Dashboard özetleri
- Socket.IO ile canlı veri güncelleme
- Web panel
- Mobil uygulama

## Dizin yapısı
- `backend`: Node.js + Express + MySQL + Sequelize + Socket.IO
- `web`: React + Vite yönetim paneli
- `mobil`: Expo React Native istemcisi
- `docker-compose.yml`: MySQL 8

## Hızlı başlatma

### 1) MySQL
Docker Desktop açıkken kök klasörde:
```powershell
docker compose up -d
```

### 2) Backend
```powershell
cd backend
copy .env.example .env
npm install
npm run dev
```

Sağlık kontrolü:
```text
http://localhost:4000/api/health
```

### 3) Web
```powershell
cd ..\web
copy .env.example .env
npm install
npm run dev
```

Adres:
```text
http://localhost:5173
```

### 4) Mobil
Önce bilgisayar IP adresini öğren:
```powershell
ipconfig
```

Sonra `.env` dosyasını düzenle:
```powershell
cd ..\mobil
copy .env.example .env
```

`.env` içine kendi IP adresini yaz:
```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:4000/api
EXPO_PUBLIC_SOCKET_URL=http://192.168.1.100:4000
```

Ardından:
```powershell
npm install
$env:REACT_NATIVE_PACKAGER_HOSTNAME="192.168.1.100"
npx expo start --lan -c
```

LAN sorun çıkarırsa:
```powershell
npx expo start --tunnel -c
```

## Varsayılan davranış
İlk kayıt olan kullanıcı `ADMIN`, sonraki kullanıcılar `USER` rolüyle açılır.

## Canlı veri akışı
Aşağıdaki kayıtlar eklendiğinde, güncellendiğinde veya silindiğinde Socket.IO olayı yayınlanır:
- animals
- vaccinations
- feed-items
- feed-transactions
- sales
- expenses
- production-records

Web panel bunları dinler ve ekranı otomatik yeniler.

## Önemli not
Bu paket konuşma içinde üretildiği için burada uçtan uca gerçek cihaz ve gerçek MySQL ile tam entegrasyon testi yapılmadı. Kod yapısı teslim odaklı, genişletilebilir ve tek dosya demo yerine modüler olacak şekilde tasarlandı.


## v3 Eklemeleri
- Mobilde ayrı bölüm ekranları: Dashboard, Hayvanlar, Hayvan Alış, Aşılar, Yem Kartları, Yem Hareketleri, Satışlar, Giderler, Üretim
- Web ve backend tarafına Hayvan Alış modülü eklendi (`/api/purchases`)
- Dashboard kartlarına toplam alış ve net bakiye güncellemesi eklendi


## v4 düzeltmeleri
- Ekleme formlarına varsayılan tarih eklendi.
- Satış ve alış formlarında toplam tutar otomatik hesaplanır.
- Web formlarında seçim listeleri ve işlem mesajları eklendi.
- Mobilde modül ekranları bölüm bazlı tutuldu ve kayıt ekranları sadeleştirildi.

## v6 Eklemeleri
- Grafik dashboard: `chart.js` ve `react-chartjs-2` ile finans, kayıt özeti ve dağılım grafikleri.
- PDF rapor sistemi: `jspdf` ve `jspdf-autotable` ile genel ve detaylı PDF rapor indirme.
- Admin yetki sistemi: ilk kayıt olan kullanıcı `ADMIN`; admin kullanıcıları listeleyebilir, yeni kullanıcı oluşturabilir, rol değiştirebilir ve kullanıcı silebilir.
- Yeni backend endpointleri:
  - `GET /api/admin/users`
  - `POST /api/admin/users`
  - `PUT /api/admin/users/:id/role`
  - `DELETE /api/admin/users/:id`

## v6 için ek web paketleri
Web klasöründe `npm install` çalıştırıldığında aşağıdaki paketler kurulur:
- chart.js
- react-chartjs-2
- jspdf
- jspdf-autotable

## Admin kullanımı
1. Veritabanı boşken ilk kullanıcıyı register ile oluşturun. Bu kullanıcı otomatik `ADMIN` olur.
2. Web panelde `Admin Yetki` menüsü sadece ADMIN rolündeki kullanıcıya görünür.
3. Admin panelinden yeni USER/ADMIN oluşturulabilir ve mevcut kullanıcı rolleri değiştirilebilir.

## PDF rapor kullanımı
Web panelde:
- Dashboard üzerindeki `Genel PDF` / `Detaylı PDF`
- veya `PDF Raporlar` menüsü
üzerinden rapor indirilebilir.
