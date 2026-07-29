# 🚀 Doping & Öne Çıkarma Sistemi - Backend Teknik Uygulama Raporu (Güncel)

> **Son Güncelleme:** 29 Temmuz 2026  
> **Proje:** TeacherFind (Özel Ders VIP) API (`TeacherFind.API`)  
> **Durum:** Frontend arayüzü ve Eğitmen Paneli aktivasyon ekranı tamamlandı. Backend veritabanı, servis ve API uçlarının (endpoints) bu rapora göre yapılandırılması gerekmektedir.

---

## 📌 1. Genel Bakış ve Modülün Son Durumu

Frontend tarafında yayınlanan ve Eğitmen Panelinde aktif edilen güncel Doping Paketleri listesi aşağıdaki gibidir:

| Doping Kodu (`DopingType`) | Doping Adı | Uygulama Alanı | Açıklama |
|---|---|---|---|
| `AnasayfaOneCikanEgitmen` | **Anasayfa Öne Çıkan Eğitmenler** | Eğitmen Profili | Ana sayfadaki "Öne Çıkan Eğitmenler" slider alanında ilk sıralarda listelenir. |
| `AnasayfaDersIlanlari` | **Anasayfa Ders İlanları** | İlan (`TeacherListing`) | Ana sayfadaki "Ders İlanları" grid alanında en üst sıralarda gösterilir. |
| `KategoriListesi` | **Kategori Listesi** | İlan (`TeacherListing`) | Kategori ve branş sayfalarındaki ilan listesinde en üst sırada yer alır. |
| `SosyalMedyaDopingi` | **Sosyal Medya Dopingi** | İlan/Profil | Sosyal medya hesaplarında paylaşım hakkı tanımlar. |
| `OgretmenlerAramaListesi` | **Ögretmenler Arama Listesi** | İlan (`TeacherListing`) | Arama sonuç sayfasında öncelikli olarak üstte listelenir. |
| `KalinYaziRenkliCerceve` | **Kalın Yazı & Renkli Çerçeve** | İlan (`TeacherListing`) | İlan kartı başlığını kalın ve belirgin yeşil çerçeveyle öne çıkarır. |

> 💡 **Önemli Not (Demo Modu):**  
> Şu an için canlı ödeme entegrasyonu (İyzico/PayTR) henüz bağlanmadığı için **aktifleştirme işlemleri geçici olarak ücretsiz (demo modunda)** yapılmaktadır. Endpoint'ler bu esnekliği desteklemeli, `PricePaid = 0` veya `IsDemo = true` parametresi alabilmelidir.

---

## 🗄️ 2. Veritabanı Modelleri (Entities & Enums)

### 2.1. `DopingType` Enum
📍 **Dosya Konumu:** `TeacherFind.Domain/Enums/DopingType.cs`

```csharp
namespace TeacherFind.Domain.Enums;

public enum DopingType
{
    AnasayfaOneCikanEgitmen = 1,
    AnasayfaDersIlanlari = 2,
    KategoriListesi = 3,
    SosyalMedyaDopingi = 4,
    OgretmenlerAramaListesi = 5,
    KalinYaziRenkliCerceve = 6
}
```

### 2.2. `TeacherDoping` Entity (Yeni Tablo)
📍 **Dosya Konumu:** `TeacherFind.Domain/Entities/TeacherDoping.cs`

```csharp
using TeacherFind.Domain.Common;
using TeacherFind.Domain.Enums;

namespace TeacherFind.Domain.Entities;

public class TeacherDoping : AuditableEntity
{
    public Guid TeacherProfileId { get; set; }
    public TeacherProfile TeacherProfile { get; set; } = default!;

    public Guid? TeacherListingId { get; set; }
    public TeacherListing? TeacherListing { get; set; }

    public DopingType DopingType { get; set; }
    
    public int DurationDays { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    
    public decimal PricePaid { get; set; } = 0; // Demo modunda 0
    public bool IsDemo { get; set; } = true;    // Ödeme entegrasyonu gelene kadar true
    public string? PaymentTransactionId { get; set; }
    
    public bool IsActive { get; set; } = true;
}
```

### 2.3. `TeacherListing` Entity Güncellemesi
📍 **Dosya Konumu:** `TeacherFind.Domain/Entities/TeacherListing.cs`  
Sorgu performansını (EF Core indexing) artırmak için `TeacherListing` sınıfına aşağıdaki alanlar eklenmelidir:

```csharp
// Doping Performans & Hızlı Sorgu Alanları
public bool IsFeaturedHomePage { get; set; } = false;
public DateTime? FeaturedHomePageUntil { get; set; }

public bool IsFeaturedCategory { get; set; } = false;
public DateTime? FeaturedCategoryUntil { get; set; }

public bool IsFeaturedSearch { get; set; } = false;
public DateTime? FeaturedSearchUntil { get; set; }

public bool HasBoldTitle { get; set; } = false;
public string? HighlightFrameColor { get; set; }
```

---

## 📡 3. API Controller & Endpoint Tasarımı

### 3.1. Doping Paketleri Listesi
- **Route:** `GET /api/dopings/packages`
- **Erişim:** Public (`[AllowAnonymous]`)
- **Açıklama:** Tanımlı tüm doping türlerini, paket seçeneklerini ve güncel fiyat bilgilerini döner.

---

### 3.2. Eğitmenin Aktif Dopingleri
- **Route:** `GET /api/tutor/dopings/my-active`
- **Erişim:** `[Authorize(Roles = "2,tutor")]`
- **Yanıt DTO Örneği:**
```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "dopingType": 1,
    "dopingTitle": "Anasayfa Öne Çıkan Eğitmenler",
    "listingId": "c8f52631-...",
    "durationLabel": "1 Hafta",
    "startDate": "2026-07-29T16:00:00Z",
    "endDate": "2026-08-05T16:00:00Z",
    "isActive": true,
    "isDemo": true
  }
]
```

---

### 3.3. Doping Satın Alma / Toplu Aktifleştirme (Bulk & Demo Ready)
- **Route:** `POST /api/tutor/dopings/purchase` (veya `/activate`)
- **Erişim:** `[Authorize(Roles = "2,tutor")]`
- **Request Body DTO (Tekli veya Toplu):**
```json
{
  "teacherListingId": "c8f52631-5717-4562-b3fc-2c963f66afa6",
  "isDemo": true,
  "items": [
    {
      "dopingType": 1,
      "durationDays": 7
    },
    {
      "dopingType": 3,
      "durationDays": 14
    },
    {
      "dopingType": 6,
      "durationDays": 30
    }
  ]
}
```
- **İş Mantığı:**
  1. Giriş yapan kullanıcının `TeacherProfile` nesnesi doğrulanır.
  2. Gönderilen `items` dizisindeki her bir doping için `TeacherDoping` kaydı oluşturulur (`StartDate = UtcNow`, `EndDate = UtcNow.AddDays(durationDays)`).
  3. İlgili `TeacherListing` üzerindeki uygun alanlar topluca güncellenir.
     - `AnasayfaDersIlanlari` ise `IsFeaturedHomePage = true`, `FeaturedHomePageUntil = EndDate`
     - `KategoriListesi` ise `IsFeaturedCategory = true`, `FeaturedCategoryUntil = EndDate`
     - `OgretmenlerAramaListesi` ise `IsFeaturedSearch = true`, `FeaturedSearchUntil = EndDate`
     - `KalinYaziRenkliCerceve` ise `HasBoldTitle = true`, `HighlightFrameColor = "#16a34a"`

---

### 3.4. Yönetici Doping İzleme & İptal
- **Route:** `GET /api/admin/dopings`
- **Route:** `POST /api/admin/dopings/cancel/{id}`
- **Erişim:** `[Authorize(Roles = "3,admin,4,superadmin")]`

---

## 🔄 4. Arama ve Listeleme Algoritması Güncellemesi

`TutorsController.cs` ve `ListingsController.cs` içinde arama sonuçları döndürülürken LINQ sorgusu **Doping bayraklarına öncelik verecek şekilde** güncellenmelidir:

```csharp
query = query.OrderByDescending(l => l.IsFeaturedHomePage)
             .ThenByDescending(l => l.IsFeaturedSearch)
             .ThenByDescending(l => l.ViewCount)
             .ThenByDescending(l => l.CreatedDate);
```

---

## ⏱️ 5. Otomatik Süre Bitişi Takibi (Background Job)

Süresi dolan dopinglerin ilanlardan kaldırılması için `BackgroundService` veya `Quartz.NET` arka plan servisi eklenmelidir:

📍 **Dosya Konumu:** `TeacherFind.Infrastructure/BackgroundJobs/DopingExpirationJob.cs`

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using TeacherFind.Domain.Enums;
using TeacherFind.Infrastructure.Persistence;

namespace TeacherFind.Infrastructure.BackgroundJobs;

public class DopingExpirationJob : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;

    public DopingExpirationJob(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            using var scope = _serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var expiredDopings = await dbContext.Set<TeacherDoping>()
                .Where(d => d.IsActive && d.EndDate <= DateTime.UtcNow)
                .ToListAsync(stoppingToken);

            foreach (var doping in expiredDopings)
            {
                doping.IsActive = false;

                if (doping.TeacherListingId.HasValue)
                {
                    var listing = await dbContext.TeacherListings.FindAsync(doping.TeacherListingId);
                    if (listing != null)
                    {
                        if (doping.DopingType == DopingType.AnasayfaDersIlanlari)
                        {
                            listing.IsFeaturedHomePage = false;
                            listing.FeaturedHomePageUntil = null;
                        }
                        else if (doping.DopingType == DopingType.KategoriListesi)
                        {
                            listing.IsFeaturedCategory = false;
                            listing.FeaturedCategoryUntil = null;
                        }
                        else if (doping.DopingType == DopingType.OgretmenlerAramaListesi)
                        {
                            listing.IsFeaturedSearch = false;
                            listing.FeaturedSearchUntil = null;
                        }
                        else if (doping.DopingType == DopingType.KalinYaziRenkliCerceve)
                        {
                            listing.HasBoldTitle = false;
                            listing.HighlightFrameColor = null;
                        }
                    }
                }
            }

            await dbContext.SaveChangesAsync(stoppingToken);

            // 15 dakikada bir kontrol et
            await Task.Delay(TimeSpan.FromMinutes(15), stoppingToken);
        }
    }
}
```

---

## 🛠️ 6. EF Core Migration Adımları

Backend geliştiricisi veritabanını güncellemek için aşağıdaki CLI komutlarını çalıştırabilir:

```bash
dotnet ef migrations add AddDopingSystem --project TeacherFind.Infrastructure --startup-project TeacherFind.API
dotnet ef database update --project TeacherFind.Infrastructure --startup-project TeacherFind.API
```
