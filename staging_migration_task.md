# Backend Staging Migration & Deploy Task

### **Title:**
`[Staging Deploy] Apply ReminderSentAt Migration to testapi.ozeldersvip.com Database`

### **Description:**
Staging ortamında (`testapi.ozeldersvip.com`) ders rezervasyon işlemleri ve dolu slot sorgulamaları sırasında **500 Internal Server Error** hatası alınmaktadır.

**Hata Kaynağı:**
Backend `Musab` branch'inde eklenen ve veritabanı şemasında `Bookings` tablosuna `ReminderSentAt` sütununu ekleyen migration (`20260709110518_AddReminderSentAtToBookings`) yerel veritabanlarında uygulanmış olmasına rağmen, **testapi.ozeldersvip.com** veritabanına henüz yansıtılmamıştır. 

Bu nedenle EF Core sorguları veritabanında `ReminderSentAt` sütununu aramakta ve `SqlException: Invalid column name 'ReminderSentAt'` hatası fırlatarak çökmektedir.

**Etkilenen Endpointler:**
- `GET /api/bookings/occupied` (Dolu saat sorgulama)
- `POST /api/bookings` (Rezervasyon oluşturma)

### **Proposed Solution / Action:**
1. Staging CI/CD deploy pipeline'ı çalıştırılarak veritabanı migration'larının otomatik olarak hedef veritabanına (`testapi.ozeldersvip.com` DB connection dizesindeki DB'ye) uygulanması sağlanmalıdır.
2. Veya staging sunucusunda manuel olarak migration çalıştırılmalıdır:
   ```bash
   dotnet ef database update --project TeacherFind.Infrastructure --startup-project TeacherFind.API --context AppDbContext
   ```

### **Acceptance Criteria:**
- `GET /api/bookings/occupied` isteği staging ortamında 200 OK dönmeli ve dolu slotları başarıyla getirmeli (500 fırlatmamalı).
- `POST /api/bookings` isteği ile yeni rezervasyon talebi staging veritabanına başarıyla kaydedilebilmeli.
