# Backend Hata, DTO ve İş Mantığı Uyuşmazlık Raporu

Bu rapor, frontend ile backend entegrasyonu sırasında tespit edilen **SQL Server hatalarını, veri uyuşmazlıklarını, DTO eksikliklerini ve iş mantığı kısıtlamalarını** backend ekibinin düzeltebilmesi için hazırlanmıştır.

---

### 1. `ReminderSentAt` Sütununun Veritabanında Bulunmaması (500 Internal Server Error)
* **Endpoint:** `GET /api/bookings/occupied` & `POST /api/bookings`
* **Hata Mesajı:** `Microsoft.Data.SqlClient.SqlException: Invalid column name 'ReminderSentAt'`
* **Neden:** `Booking.cs` domain modelinde `ReminderSentAt` adında bir property tanımlı olmasına rağmen, veritabanı şemasında bu sütun mevcut değildir. EF Core sorguları atılırken bu alan arandığı için veritabanı çökmektedir.
* **Çözüm:** Aşağıdaki komutlar ile yeni bir migration oluşturulmalı ve veritabanı güncellenmelidir:
  ```bash
  # Migration oluşturma
  dotnet ef migrations add AddReminderSentAtToBookings --project TeacherFind.Infrastructure --startup-project TeacherFind.API
  
  # Veritabanını güncelleme
  dotnet ef database update --project TeacherFind.Infrastructure --startup-project TeacherFind.API
  ```

---

### 2. Rezervasyon Fiyatı Uyuşmazlığı (`PriceAtBooking`)
* **Endpoint:** `POST /api/bookings`
* **Sorun:** `BookingService.cs` (satır 88) içerisinde rezervasyon oluşturulurken dersin fiyatı doğrudan ilanın genel fiyatından set edilmektedir:
  ```csharp
  PriceAtBooking = listing.Price,
  ```
  Ancak eğitmenler her ders (branş) için kendi biyografilerinde farklı online ve yüz yüze fiyatlar (`onlinePrice` / `inPersonPrice`) tanımlayabilmektedir (Örn: Online: ₺300, Yüz Yüze: ₺450). `CreateBookingRequestDto` içinde ders tipi (`ServiceType` veya seçilen fiyat) bilgisi taşınmadığı için backend her zaman varsayılan ilan fiyatını (₺300) kaydetmektedir.
* **Çözüm Önerisi:** 
  - `CreateBookingRequestDto` içerisine öğrencinin talep ettiği ders alma tipini (`ServiceType`) ve seçilen dersin detaylarını alacak alanlar (Örn: `selectedPrice` veya `lessonType`) eklenmelidir.
  - Veya fiyata müdahale edilmesini engellemek adına backend tarafında seçilen dersin fiyatı dinamik olarak doğrulanıp set edilmelidir.

---

### 3. Ders Süresi Uyuşmazlığı (`LessonDuration` ve `EndTime`)
* **Endpoint:** `POST /api/bookings`
* **Sorun:** `BookingService.cs` (satır 349) içindeki `ResolveEndTimeUtc` metodunda, ilanın `LessonDuration` değeri 0'dan büyükse istemciden (frontend) gönderilen `request.EndTime` değeri ezilmekte ve doğrudan ilan süresi eklenmektedir:
  ```csharp
  if (listing.LessonDuration > 0)
      return startTimeUtc.AddMinutes(listing.LessonDuration);
  ```
  Ancak eğitmenin verdiği derslerin süreleri farklılık gösterebilmektedir (Örn: YDS dersi 60 dakika iken, YDT dersi 45 dakika olabilir). Bu mantık nedeniyle öğrenci 45 dakikalık ders talep etse bile backend bunu 60 dakikalık blok halinde kapatmaktadır.
* **Çözüm Önerisi:** İstemciden gelen `request.EndTime` değerine saygı duyulmalı veya ders detayına göre süre hesabı yapılmalıdır.

---

### 4. Göreli Görsel URL'leri Sorunu (Relative Path - 404 Not Found)
* **Açıklama:** API, yüklenen profil resimlerini ve ilan fotoğraflarını veritabanına bağıl yol (Örn: `/uploads/avatars/student_xxxx.jpg` veya `/uploads/listings/yyyy.jpg`) olarak kaydetmekte ve DTO'larda bu şekilde dönmektedir.
* **Sorun:** Frontend uygulaması bu görsel yollarını doğrudan `<img src={...} />` şeklinde kullandığında, tarayıcı resimleri frontend portundan (`http://localhost:5173/uploads/...`) talep etmekte ve **404 Not Found** hatası (kırık resim) oluşmaktadır.
* **Tavsiye Edilen Çözüm:** Backend ekibinin, DTO'ları map'lerken görsel yollarını `HttpContext` veya `IConfiguration` üzerinden dinamik olarak alan tam URL'e (Full URL) dönüştürmesi en kalıcı çözümdür.
  ```csharp
  // Örnek C# Dönüşümü:
  var baseUrl = $"{Request.Scheme}://{Request.Host}{Request.PathBase}";
  var fullImageUrl = $"{baseUrl}{user.ProfileImageUrl}"; // DTO'ya bu tam adres atanmalıdır.
  ```

---

### 5. Seed Verilerdeki Eksik Fiziksel Dosyalar (404 Not Found)
* **Sorun:** Veritabanı seed işlemi sırasında ilanlar için tanımlanan resim isimleri (Örn: `88d961d9-1332-4d58-9f7a-2b400d82a18a_42812e659240405c8570f6ddd1665cfd.jpg`) fiziksel olarak `wwwroot/uploads/listings/` dizininde bulunmamaktadır.
* **Çözüm:** Seed datalarında referans verilen statik resim dosyaları projenin `wwwroot/uploads/listings/` dizinine eklenmeli ya da seed kodundaki dosya isimleri mevcut olan resimlerle güncellenmelidir.
