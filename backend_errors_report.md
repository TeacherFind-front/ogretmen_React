# Backend Hata ve Uyuşmazlık Raporu (API & DTO)

Bu rapor, frontend ile backend API entegrasyonu sırasında tespit edilen **veri modeli (property) uyuşmazlıklarını** ve **dosya yolları (URL) ile ilgili sorunları** backend ekibinin düzeltebilmesi için hazırlanmıştır.

---

### 1. Göreli Görsel URL'leri Sorunu (Relative Path)
* **Açıklama:** API, yüklenen profil resimlerini ve ilan fotoğraflarını veritabanına bağıl yol (Örn: `/uploads/avatars/student_xxxx.jpg` veya `/uploads/listings/yyyy.jpg`) olarak kaydetmekte ve DTO'larda bu şekilde dönmektedir.
* **Sorun:** Frontend uygulaması bu görsel yollarını doğrudan `<img src={...} />` şeklinde kullandığında, tarayıcı resimleri frontend portundan (`http://localhost:5173/uploads/...`) talep etmekte ve **404 Not Found** hatası (kırık resim) oluşmaktadır.
* **Tavsiye Edilen Çözüm:** Backend ekibinin, DTO'ları map'lerken görsel yollarını `HttpContext` veya `IConfiguration` üzerinden dinamik olarak alan tam URL'e (Full URL) dönüştürmesi en kalıcı çözümdür.
  ```csharp
  // Örnek C# Dönüşümü:
  var baseUrl = $"{Request.Scheme}://{Request.Host}{Request.PathBase}";
  var fullImageUrl = $"{baseUrl}{user.ProfileImageUrl}"; // DTO'ya bu tam adres atanmalıdır.
  ```

---

### 2. Eğitmen Profil Resmi (Avatar) Yükleme Uyuşmazlığı
* **Endpoint:** `POST /api/tutors/avatar` (`TutorsController.cs` - Satır 103)
* **API Yanıt Modeli:**
  ```json
  {
      "message": "Avatar başarıyla yüklendi.",
      "profileImageUrl": "/uploads/avatars/..."
  }
  ```
* **Frontend Beklentisi:** Frontend'deki `TutorProfile.jsx` ve `tutorService.js` dosyalarında bu yanıtın `avatarUrl` olarak okunmaya çalışıldığı görülmüştür.
* **Çözüm Seçenekleri:** 
  1. API yanıtındaki property ismi `avatarUrl` olarak değiştirilebilir.
  2. Veya frontend tarafında `result.profileImageUrl` okunacak şekilde bırakılabilir. (Şu an frontend tarafında bunu `profileImageUrl` okuyacak şekilde güncelledim.)

---

### 3. Eğitmen Profil DTO Uyuşmazlığı
* **Endpoint:** `GET /api/tutors/profile` (`TutorsController.cs` - Satır 56)
* **Model:** `TutorProfileDto` içindeki property `ProfileImageUrl` olarak dönmektedir.
* **Sorun:** Frontend tarafında eğitmen bilgileri yüklendiğinde profil resmi alanı olarak `avatarUrl` aranmaktadır. API `ProfileImageUrl` döndüğü için eğitmen profil resmi ekranda hiç yüklenmemekteydi.
* **Tavsiye Edilen Çözüm:** İsimlendirme standardı açısından tüm profil/avatar resim alanlarının API tarafında tek bir standarda (örneğin sadece `AvatarUrl` veya sadece `ProfileImageUrl`) çekilmesi karmaşıklığı önleyecektir.

---

### 4. İlan Fotoğrafları DTO Uyuşmazlığı
* **Endpoint:** `GET /api/tutors` ve `GET /api/tutors/{id}`
* **Model:** `ListingPhotoDto` (`TutorService.cs` - Satır 767)
  ```csharp
  public class ListingPhotoDto
  {
      public Guid Id { get; set; }
      public string PhotoUrl { get; set; } // <--- Sorunlu Alan
      public bool IsMain { get; set; }
      public int SortOrder { get; set; }
  }
  ```
* **Sorun:** Frontend tarafında eğitmen kartları listelenirken resim kaynağı olarak `photos[0].url` adında bir property aranmaktadır. Fakat backend DTO'sunda bu alan `PhotoUrl` olarak tanımlıdır. Bu uyuşmazlık nedeniyle ilan resimleri ekranda hiçbir zaman gösterilememiştir.
* **Çözüm Seçenekleri:**
  1. Backend DTO'sundaki `PhotoUrl` property ismi `Url` olarak değiştirilebilir.
  2. Ya da frontend tarafında tüm `photos[0].url` kullanımları `photos[0].photoUrl` olarak güncellenmelidir. (Frontend tarafında bu alanı `photoUrl` okuyacak şekilde güncelledim.)
