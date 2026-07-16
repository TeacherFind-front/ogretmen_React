import React, { useEffect } from "react";
import { ShieldCheck } from "lucide-react";

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen pt-32 pb-24 transition-colors duration-300 dark:bg-[var(--bg-primary)]" style={{ backgroundColor: "#f5f3ec" }}>
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Header */}
        <div className="mb-10 text-left">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1e293b] dark:text-white mb-4 uppercase tracking-wide">
            Gizlilik Politikası
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
            <span>Özel Ders VIP</span>
            <span>›</span>
            <span>GİZLİLİK POLİTİKASI</span>
          </div>
        </div>

        {/* Content */}
        <div>
          <div className="text-gray-700 dark:text-gray-300 text-base md:text-lg leading-relaxed">
            <p className="mb-8 leading-relaxed font-medium">
              Özel Ders VIP (ozeldersvip.com) web sitesine ders vermek için üye olan, ders almak için
              üye olan, hizmet almak için ders talebinde bulunan kişiler ve siteyi ziyaret eden 
              tüm kullanıcılar aşağıdaki şartları, kuralları ve politikayı kabul etmiş sayılmaktadır.
            </p>
            <p className="mb-8 leading-relaxed">
              Özel Ders VIP, ders vermek için başvuru yapan öğretmenlerden ve ders almak için
              başvuruda bulunan kişilerden bazı kişisel bilgileri talep eder. Kişisel bilgilerin 
              korunması ve gizliliğin sürdürülmesi Özel Ders VIP ekibi olarak birinci önceliğimizdir. 
              Kullanıcıların vermiş olduğu tüm bilgiler izni olmadan, aşağıda belirtilen şartlar, 
              Üyelik Sözleşmesinde ve kullanım şartlarında belirtilen kurallar ve amaçlar dışında 
              hiçbir şekilde üçüncü şahıslarla paylaşılmayacaktır. Ders veren kişilerin panelinde 
              paylaşılmasını istediği bilgileri kendisi belirlemektedir. Kullanıcının izin vermediği 
              hiçbir bilgi üçüncü kişilerle paylaşılmamaktadır. Sistemi aktif olarak kullanmak için 
              Online Ödeme yapılması durumunda kart bilgileriniz site yönetimi dahil hiç kimsenin 
              müdahalesi olmadan banka aracılığı ile sonuçlandırılır ve güvenliğinizin sağlanması için 
              gerekli tedbirler alınır.
            </p>
            <p className="mb-8 leading-relaxed">
              <strong>6698 sayılı Kişisel Verilerin Korunması Kanunu (“Kanun”)</strong> kapsamında 
              Özel Ders VIP, kullanıcıların kişisel verilerini özenle korur ve izniniz olmayan hiçbir 
              kişisel verinizi üçüncü kişiler ile paylaşmaz. 
            </p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)] mb-6 mt-12 border-t pt-8 dark:border-[var(--card-border)]">
              1. Genel Politika
            </h2>
            <div className="space-y-4 mb-8">
              <p><strong>1.a.</strong> Özel Ders VIP, hizmet almak veya hizmet vermek için kayıt olurken, kullanıcılarından aldığı bilgilerinin gizliliğine oldukça önem vermektedir.</p>
              <p><strong>1.b.</strong> Sizinle ilgili söz konusu bilgilerin bu Gizlilik Politikası uyarınca toplanmasına, kullanılmasına ve açıklanmasına rıza göstermekte ve bu politikaya tabii olduğunuzu kabul etmektesiniz.</p>
              <p><strong>1.c.</strong> Şirketimiz, Türk Hukukunda kabul edilmiş olan kişisel verilerin korunmasına dair düzenlemelere uygun olarak hareket etmeyi taahhüt etmektedir.</p>
              <div className="pl-6 border-l-2 border-primary/30 mt-4 space-y-2 text-sm md:text-base">
                <p><strong>Kullanıcılarımızın hakları:</strong></p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Kişisel verilerinin işlenip işlenmediğini öğrenme,</li>
                  <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
                  <li>Eksik veya yanlış işlenmiş olması hâlinde düzeltilmesini isteme,</li>
                  <li>Yürürlükteki mevzuata uygun olarak silinmesini veya yok edilmesini isteme,</li>
                  <li>İletişim bilgilerini (hizmet verenler/alanlar için) kimlerle paylaşılacağını seçme hakkı.</li>
                </ul>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)] mb-6 mt-12 border-t pt-8 dark:border-[var(--card-border)]">
              2. Kullanım Politikamız
            </h2>
            <ul className="space-y-3 list-none pl-0">
              {[
                "Sitemizi daha iyi hizmet veren bir sistem haline getirmek ve iyileştirmek.",
                "Hizmet alanların taleplerini en güvenilir şekilde hizmet verenlere aktarmak.",
                "Sizinle sisteme bıraktığınız iletişim kanalları üzerinden gerektiğinde iletişime geçebilmek.",
                "Kullanıcıların siteyi nasıl kullandığını ölçümlemek.",
                "Kullanım koşullarına ve kurallara uygun davranış sergilenip sergilenmediğini belirlemek.",
                "Bilgileriniz hiçbir şekilde üçüncü kişilere satılmaz. İletişim bilgileri sadece onaylanan talepler doğrultusunda ilgili taraflar (hizmet veren ve alan) arasında paylaşılır.",
                "Hizmet verenlerin ve alanların doğruluğunu onaylamak."
              ].map((item, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2.5"></div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)] mb-6 mt-12 border-t pt-8 dark:border-[var(--card-border)]">
              3. Kişisel Bilgilere Değişiklik Yapma Politikamız
            </h2>
            <p className="mb-4">Bu site üzerinde bulunan tüm bilgilerinizi düzenleme, pasif hale getirme veya silme hakkına sahipsiniz. Bildirim ayarlarınızı (mail, SMS vb.) kullanıcı paneliniz üzerinden güncelleyebilirsiniz.</p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)] mb-6 mt-12 border-t pt-8 dark:border-[var(--card-border)]">
              4. Başka Sitelere Bağlantı Vermesi
            </h2>
            <p className="mb-4">Özel Ders VIP, site dahilinde başka sitelere link verebilir. Link vasıtasıyla erişilen sitelerin gizlilik uygulamaları ve içeriklerinden Özel Ders VIP sorumlu değildir.</p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)] mb-6 mt-12 border-t pt-8 dark:border-[var(--card-border)]">
              5. Çerez (Cookie) Politikası
            </h2>
            <p className="mb-4">
              Çerez, bilgisayarınızda yerel olarak saklanan veridir. Sitede çerezleri, kullanıcıların site içi hareketlerini takip etmek ve deneyimi iyileştirmek için kullanıyoruz. 
              Çerezleri kabul etme veya reddetme seçeneğiniz tarayıcı ayarlarınızda bulunmaktadır.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)] mb-6 mt-12 border-t pt-8 dark:border-[var(--card-border)]">
              6. Bilgilerinizin Paylaşılması ve Korunması
            </h2>
            <p className="mb-4">
              Sitenin tüm sayfaları HTTPS protokolü ve şifreleme ile korunur. Özel Ders VIP hiçbir kullanıcısının kredi kartı bilgisine erişemez.
              Kişisel verileriniz, yürürlükteki mevzuat hükümleri gereğince resmi makamlarca talep edilmesi halinde sadece yetkili mercilerle paylaşılabilir.
              Verileriniz, hizmet aldığınız veya üyeliğinizin devam ettiği sürece sistemimizde saklanır.
            </p>

            <div className="mt-12 pt-6 border-t border-gray-300 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-[var(--text-primary)] mb-4">
                İletişim ve Şirket Bilgileri
              </h3>
              <ul className="space-y-3 text-sm md:text-base m-0 list-none pl-0">
                <li><strong>Unvan:</strong> Özel Ders VIP Eğitim Teknolojileri</li>
                <li><strong>E-mail:</strong> <a href="mailto:info@ozeldersvip.com" className="text-blue-600 hover:underline">info@ozeldersvip.com</a></li>
                <li><strong>Adres:</strong> İstanbul, Türkiye</li>
                <li><strong>Web Adresi:</strong> <a href="https://www.ozeldersvip.com" className="text-blue-600 hover:underline" target="_blank" rel="noreferrer">https://www.ozeldersvip.com</a></li>
              </ul>
              <p className="text-sm text-gray-500 mt-6 m-0">
                Gizlilik politikamız ile ilgili her türlü soru ve öneri için e-posta gönderebilirsiniz.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
