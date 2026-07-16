import React, { useEffect } from "react";
import { FileText } from "lucide-react";

export default function DistanceSelling() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const numberedRules = [
    "Özel Ders VIP, standart üyelerden (hizmet alanlardan) ders talebi oluşturmaları için bir ücret talebinde bulunmaz. Profillerinin ana sayfada, eğitmen arama sayfalarında ve arama sonuçlarında üst sıralarda listelenmesini veya ek özelliklerden faydalanmasını isteyen eğitmen üyeler (hizmet verenler), belirtilen paket ödemelerini yapar ve tercihe bağlı olarak tanıtım videosu vb. ekleyebilirler.",
    "Puanlama sistemine göre ilgili sayfalarda öğretmen profilleri listelenecektir. Arama sonuçlarında üst sıralarda listelenmek isteyen kullanıcılar, platformun belirlediği puanlama ve öne çıkma kriterlerini yerine getirmelidir.",
    "Üyelik iptallerinde, kullanıcıların tarafımızı bilgilendirici bir e-posta ya da mesaj atmaları gerekmektedir. Bunun haricinde iptal işlemleri için üyelerden herhangi bir ek ücret ya da evrak talep edilmez.",
    "Üyelik bilgilerinde istenilen içeriklerin (telefon, adres, e-mail, fotoğraf vb.) doğru ve eksiksiz doldurulması gereklidir. Üyelerin isteği ve onayı olmadan bu bilgiler üçüncü kişilerle paylaşılmaz.",
    "Özel Ders VIP, özel ders veren öğretmen veya eğitmenlerin ilanlarının yayınlanmasına ve taleplerle eşleşmelerine aracılık eden bir teknoloji platformudur. Üye olan bu öğretmen veya eğitmenlerin kesin olarak öğrenci bulmalarını garanti etmez.",
    "Özel Ders VIP üyeliği bireyseldir. Başkasına ödünç olarak verilemez ya da devredilemez. Bu durumda oluşabilecek sorunlardan tarafımız sorumlu değildir.",
    "Her kullanıcı, Özel Ders VIP adresinde yalnızca bir üyelik kaydı açma hakkına sahiptir. Birden çok kayıt açıldığı tespit edilirse bu durum kuralların kesin bir ihlali sayılır ve kullanıcının tüm kayıtları askıya alınabilir.",
    "Özel Ders VIP, öğretmenlerine ve özel ders alan öğrencilerine değer verdiğini göstermek için zaman zaman promosyon, indirim veya hediye fırsatları sunabilir.",
    "18 yaşından küçük olan ve siteye üye olup ders almak/vermek isteyen kullanıcılar; anne, baba veya velilerinin onayı ve gözetimi altında işlem yapabilirler.",
    "Özel Ders VIP, ders talebinde bulunan kullanıcıların taleplerini onayladıktan sonra uygun eğitmenlere yönlendirir. Talebe belirli bir süre içinde yanıt vermeyen eğitmenler yerine talep başka eğitmenlere yönlendirilebilir.",
    "Üyelerin ders talebi alması ve derslere başlaması gibi durumlarda üyeler, kendi fiziksel veya dijital güvenliklerini kendileri sağlamakla yükümlüdür. Doğacak zararlardan Özel Ders VIP sorumlu değildir.",
    "Üyelerin (hizmet verenlerin) verdikleri derslerden elde ettikleri ücretlerden doğacak olası vergilerden veya mali yükümlülüklerden Özel Ders VIP sorumlu değildir.",
    "Üyeler profil bilgilerini doğru bir şekilde doldurmak ve güncel tutmak zorundadır. Kendilerine gelecek olan sistem mesajlarını kabul ederler.",
    "Özel Ders VIP, ihtiyaç duyduğu durumlarda bu sözleşmedeki maddeleri değiştirme, madde ekleme veya çıkarma haklarına sahiptir.",
    "Özel Ders VIP, platform içerisindeki reklam alanlarını kiralama veya kullanma hakkına sahiptir.",
    "Hizmet vermek için kayıt olan eğitmen profilleri arama motorlarında indeks alabilir. Üyelerimiz, beyan etmiş oldukları herkese açık profil bilgilerinin internet ortamında yayınlanmasını kabul etmiş olurlar. İsteyen kullanıcılar bu ayarları panellerinden sınırlandırabilir veya tamamen silebilir.",
    "Hizmet vermek için kayıt olan kişilerin profillerinde, kullanıcıları sistem dışına yönlendirecek telefon, mail, sosyal medya linki vb. iletişim bilgilerini açıkça yazmaları yasaktır (Sadece onaylı alanlarda belirtilmelidir). Tespiti durumunda üyelik askıya alınabilir.",
    "Üyelerin kendi profillerinde veya blog kısmında yazdıkları içeriklerin tüm hukuki sorumluluğu yazan kullanıcıya aittir.",
    "Özel Ders VIP, platformun güvenliğini sağlamak amacıyla ve üyelere önceden haber vermeksizin üyelerinin profil sayfalarında, ilanlarında değişiklik yapma veya yayından kaldırma hakkını elinde tutar.",
    "Platform üzerinden ders talebinde bulunan kişilerin iletişim bilgisini üçüncü kişilerle izinsiz paylaşan üyelerin hesapları askıya alınacak ve gerekirse yasal yollara başvurulacaktır.",
    "Site üzerinden alınan premium / ücretli üyelik paketlerinin tüm özellikleri, paket süresi boyunca geçerlidir. Süre bitiminde veya iptalinde kalan haklar devredilemez."
  ];

  const generalClauses = [
    "Özel Ders VIP, sözleşme çerçevesinde Hizmet Veren (özel ders veren üye) profilini yayınlayan ve Hizmet Alan (ders talep eden) kullanıcıların taleplerini üyelere ulaştırma hizmeti sağlayan bir ilan platformudur.",
    "Özel Ders VIP yalnızca bir platformdur, Web Sitesi’nde yer alan özel ders hizmetlerinin bizzat sahibi veya sağlayıcısı değildir. Özel Ders VIP aracı hizmet sağlayıcı konumundadır.",
    "Özel Ders VIP, sitede profil oluşturan üyelerin MEB tarafından tanımlanan “Öğretmen” tanımına uygunluğunu teyit etmekle yükümlü değildir. Üyelerin beyanları kendi sorumluluğundadır.",
    "Özel Ders VIP, 5580 sayılı Özel Öğretim Kurumları Kanunu kapsamında bir eğitim kurumu değildir. Elektronik Ticarette Hizmet Sağlayıcı ve Aracı Hizmet Sağlayıcılar Hakkında Yönetmelik kapsamında bir hizmet sağlayıcı platformdur.",
    "Hizmet Alanlar (öğrenciler), hizmet veren eğitmen ile aralarında anlaştıkları ders ücretini Özel Ders VIP kontrolü dışında doğrudan eğitmene ödeyebilir veya platformun sunduğu güvenli ödeme sistemini kullanabilirler. Ancak platform dışında yapılan ödemelerden doğacak anlaşmazlıklardan Özel Ders VIP sorumlu değildir.",
    "Hizmet alanların hizmet veren üyelere yapmış oldukları doğrudan ödemelere ilişkin fatura/fiş düzenleme yükümlülüğü tamamen Hizmet Veren'e (eğitmene) aittir.",
    "Özel Ders VIP, Hizmet Veren ve Hizmet Alan arasındaki ilişkiden sorumlu olmayıp, eğitmenin sağlayacağı hizmet sırasında veya herhangi bir zamanda tarafların veya 3. kişilerin göreceği zararlardan ötürü hiçbir sorumluluk kabul etmemektedir.",
    "Kullanıcılar arasında fikri hakların veya diğer hukuki hakların ihlaline ilişkin herhangi ihtilaf olduğu takdirde Özel Ders VIP, yasal mevzuata ve kendisine ibraz edilecek mahkeme kararına istinaden işlem yapmakla yükümlüdür.",
    "Bu Sözleşme, Web Sitesi kullanılmaya devam edildiği veya üyelik devam ettiği sürece yürürlükte kalacaktır."
  ];

  return (
    <div className="min-h-screen pt-32 pb-24 transition-colors duration-300 dark:bg-[var(--bg-primary)]" style={{ backgroundColor: "#f5f3ec" }}>
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Header */}
        <div className="mb-10 text-left">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1e293b] dark:text-white mb-4 uppercase tracking-wide">
            Mesafeli Satış Sözleşmesi
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
            <span>Özel Ders VIP</span>
            <span>›</span>
            <span>MESAFELİ SATIŞ SÖZLEŞMESİ</span>
          </div>
        </div>

        {/* Content */}
        <div>
          <div className="text-gray-700 dark:text-gray-300 text-base md:text-lg leading-relaxed">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)] mb-6">
              Sözleşme Konusu ve Taraflar
            </h2>
            <p className="mb-8 leading-relaxed">
              İşbu sözleşme, Özel Ders VIP (ozeldersvip.com) üzerinden sunulan aracılık ve ilan hizmetlerinden,
              üyelik paketlerinden veya diğer dijital hizmetlerden faydalanan kullanıcıların hak ve yükümlülüklerini,
              hizmetin ifası ve iptal süreçlerini düzenlemektedir. Siteye üye olan veya platform üzerinden hizmet satın alan 
              herkes bu şartları peşinen kabul etmiş sayılır.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)] mb-6 mt-12 border-t pt-8 dark:border-[var(--card-border)]">
              Mesafeli Satış ve Hizmet Şartları
            </h2>
            
            <div className="space-y-4 mb-12">
              {numberedRules.map((rule, idx) => (
                <div key={idx} className="flex gap-4 items-start">
                  <p className="m-0 leading-relaxed"><span className="font-bold mr-1">{idx + 1}-</span> {rule}</p>
                </div>
              ))}
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)] mb-6 mt-12 border-t pt-8 dark:border-[var(--card-border)]">
              Platform İşleyişi ve Yasal Sorumluluklar
            </h2>
            
            <div className="space-y-4">
              {generalClauses.map((clause, idx) => (
                <div key={idx} className="flex gap-4 items-start p-4 rounded-2xl bg-gray-50 dark:bg-[var(--section-alt)]">
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2.5"></div>
                  <p className="m-0 text-sm md:text-base leading-relaxed">{clause}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-12 pt-6 border-t border-gray-300 dark:border-gray-700">
              <p className="m-0 font-medium">
                Bu Sözleşme, Özel Ders VIP hizmetlerinin kullanılmaya devam edildiği sürece geçerlidir. 
                Sözleşmeyi kabul etmeyen üyeler, profillerinin silinmesi talebiyle 
                <a href="mailto:info@ozeldersvip.com" className="text-blue-600 hover:underline ml-1">info@ozeldersvip.com</a> 
                adresine e-posta gönderebilirler. Sisteme üye olan ve ödeme yaparak hizmet alan her kullanıcı 
                işbu sözleşme hükümlerini onaylamış sayılır.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
