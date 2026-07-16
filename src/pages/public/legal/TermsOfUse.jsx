import React, { useEffect } from "react";
import { BookOpen } from "lucide-react";

export default function TermsOfUse() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const rules = [
    "Üyeler, kullanıcı içeriklerinde; hakaret içeren, küçük düşürücü, müstehcen, pornografik, kötü niyetli, saldırı amaçlı ve üçüncü şahısların hak ve hukukunu ihlal edici ifadeler kullanamayacaklarını kabul ve taahhüt ederler.",
    "Üyeler, suç teşkil edecek, yasal açıdan takip gerektirecek ya da yerel, ülke çapında veya uluslararası düzeyde yasalara ters düşecek, veya yalnızca diğer bir üyeyi rahatsız edecek bir durum yaratan, ya da bu durumlardan herhangi birini teşvik eden, hiçbir tür yasadışı, tehditkar, hakaret, küfür içeren, küçük düşürücü, kaba, pornografik, genel ahlaka ve sitenin amacına aykırı bilgi yayımlayamaz ve iletemez.",
    "Üyeler, başka bir üye ile alaycı, kötü niyetli, hakaret içeren, küçük düşürücü, pornografik mesajlaş iletemez.",
    "Üyeler, profil oluştururken verdikleri bilgilerin doğruluğunu kabul eder. Yanlış bilgi tespiti durumunda Özel Ders VIP ilgili üye hakkında işlem yapma hakkına sahiptir.",
    "Üyeler, verdikleri genel bilgilere başkalarının ulaşabileceğini kabul ederler (isim, soyisim, telefon numarası (isteğe bağlı), mezuniyet bilgisi, tecrübe bilgisi vb. gibi).",
    "Üyeler, bir başkasının gizlilik veya yayın haklarını çiğneyen ya da telif hakları, ticari marka hakları veya başka mülkiyet hakları tarafından korunan ya da bu belirtilen sınıflara giren materyallerden uyarlananlar da dahil olmak üzere; sahibinden ya da haklarını elinde tutandan önceden izin almaksızın, başkalarının haklarını çiğneyen ya da ters düşen, hiçbir bilgi, yazılım ya da başka materyal yayımlayamaz ya da iletemez. Kendisinin mevcut olan bir telif hakkının ihlal edildiğine inanan kişiler Özel Ders VIP ile temasa geçmelidirler.",
    "Sitede yer alan özel öğretmenlerin sitede belirtmiş olduğu bilgilerin doğruluğunu teyit etmek ve referanslarının takibini yapmak üyelerin sorumluluğundadır.",
    "Özel Ders VIP üye ve kullanıcılarına SPAM mesaj gönderimi kesinlikle yasaktır. Sitenin amacı dışında ve amacına uygun olmayan şekilde kullanılması, üye ve kullanıcıların rahatsız edilmesi veya üyelere rahatsız edici mesajlar yollanması yasaktır. Tespiti durumunda ilgili üye hakkında Özel Ders VIP yasal işlem yapma hakkına sahiptir.",
    "Üyeler, en az 18 yaşında olduğunu teyit eder. 18 yaşının altındaki bir kullanıcı anne, baba veya velisi gözetiminde siteye üye olabilir.",
    "Site kullanıcılar içindir; şirketler, işletmeler veya örgütler sitede sunulan hizmetleri sitenin amacı dışında herhangi bir ticari amaç için kullanamaz. Sitede yer alan bilgiler, fotoğraflar, kullanıcı videoları, linkler kopyalanarak başka bir ürün veya hizmet için kullanılamaz.",
    "Özel Ders VIP üyeliği kişiye özeldir. Bir başkasına ödünç verilemez ya da devredilemez. Bu ve benzeri durumlarda oluşabilecek sorunlardan Özel Ders VIP sorumlu değildir ve sorumlu tutulamaz.",
    "Özel Ders VIP'e üye olurken belirlediğiniz şifre sadece size özeldir ve sizin tarafınızdan bilinmektedir. Şifrenizin seçimi ve korunması üyenin sorumluluğundadır. Özel Ders VIP şifre kullanımından doğacak sorunlardan sorumlu tutulamaz.",
    "Özel Ders VIP'e üye olurken isim, soyisim, branşınız, sloganınız, kendinizi tanıttığınız yazılı metin, profil fotoğrafı, ders verdiğiniz branşlar, ders verdiğiniz yerler tam ve doğru girilmelidir. Tam girilmemesi durumunda üye hesabı onaylanmayabilir veya Özel Ders VIP değişiklik yapma hakkına sahiptir.",
    "Özel Ders VIP, herhangi bir sebepten ötürü ve üyelere önceden haber vermeksizin üyelerinin profil sayfalarında ve profil bilgilerinde değişiklik yapma hakkını elinde tutar.",
    "Özel Ders VIP'e üye olurken verilen e-mail adresinin üyeye ait ve aktif bir e-mail adresi olma zorunluluğu esastır. Üyelikle ilgili tüm yazışmalarda sisteme üye olurken verilen e-mail adresi esas alınır. Kullanıcı verilen mail adresinin doğruluğunu kabul eder. Yanlış olması durumunda oluşacak hatadan Özel Ders VIP sorumlu değildir.",
    "Özel Ders VIP'e üye olurken isteğe bağlı olarak verilen telefon numarasının doğru olduğunu kabul eder ve ona göre davranır. Yanlış olması durumunda oluşacak hatadan Özel Ders VIP sorumlu değildir.",
    "Öğretmen profiline yapılan yorumlar uygun görülmesi durumunda onaylanacaktır. Herhangi bir şekilde alay edici, hakaret, pornografik, küçük düşürücü yorumlar kabul edilemez.",
    "Üyeler verdikleri mail adresine ve telefon numarasına Özel Ders VIP'den bilgilendirici ve tanıtıcı bilgiler alacağını kabul eder.",
    "Blog sayfasında mevcut olan tüm yazılar Özel Ders VIP'e aittir, kaynak gösterilmeden çoğaltılamaz.",
    "Blog yazılarına yapılan yorumlar uygun görülmesi durumunda onaylanacaktır. Alay edici, hakaret içeren, küçük düşürücü yorumlar kabul edilemez.",
    "Ders talebinde bulunan veli veya öğrencilerin iletişim bilgisi aracılığı ile veya sistem üzerinden ders dışında farklı bir sebepten dolayı iletişime geçen üyelerin tespiti durumunda ilgili üyenin hesabı kapatılacaktır.",
    "Ders talebinde bulunan üyeler taleplerini ilgili sayfada paylaşabilir ve talebine uygun ders verenler tarafından sistem üzerinden veya mesaj olarak iletişime geçileceğini kabul eder. Talebine uygun dönüş aldıktan sonra ilgili talebini sistemden kaldırmayan veya kaldırılması için başvurmayan üyelerden dolayı doğacak sorunlardan Özel Ders VIP sorumlu değildir.",
    "Özel Ders VIP, 6698 Sayılı Kişisel Verilerin Korunması Kanunu (KVKK) gereği, kullanıcılarının bilgilerini izni olmaksızın hiçbir şekilde üçüncü kişilerle paylaşmamaktadır.",
    "Özel Ders VIP üzerinden ders vermek için üye olan eğitmenlerin profillerine girmiş oldukları bazı bilgiler (kullanıcı adı, tecrübe, fotoğraf, ders ücretleri vb.) Google gibi arama motorlarında indeks almakta ve arama sonuçlarında çıkmaktadır. İnternet ortamında paylaşılmasını istemediğiniz kişisel bilgilerinizi profilinize eklememenizi tavsiye ederiz. Gizlilik politikamız ve KVKK gereği kişisel bilgilerini silen veya silmeyi talep eden kişilerin bilgileri sunucularımızdan kaldırılır. Ancak arama motorlarının ön bellekleme sebebiyle bazı bilgiler geçici bir süre kalmaya devam edebilir.",
    "Etik ve ahlaki değerlere uygun olmayan (sınava girme, başkasının yerine ödev/tez yapma vb.) talep içerikleri oluşturulmamalı, bu tip taleplere eğitmenler tarafından dönüş yapılmamalıdır. Bu tür eylemlerden doğacak tüm sorumluluk taraflara aittir. Tespiti halinde kullanıcı profilleri Özel Ders VIP tarafından kaldırılır ve yasal mercilerle paylaşılır."
  ];

  const generalClauses = [
    "Özel Ders VIP, sözleşme çerçevesinde Hizmet Veren (özel ders veren üye) profilini üyelerin kendilerinin paylaştığı bilgilere göre sitede yayınlayan ve Hizmet Alan (ders talep eden) kullanıcıların taleplerini üyelere ulaştırma hizmeti sağlayan bir platformdur.",
    "Özel Ders VIP yalnızca bir platformdur, Web Sitesi’nde yer alan hizmetlerin sahibi veya sağlayıcısı değildir. 6563 Sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun uyarınca, Özel Ders VIP aracı hizmet sağlayıcıdır ve içerikleri kontrol etmek veya hukuka aykırı bir faaliyeti araştırmakla yükümlü değildir.",
    "Özel Ders VIP, sitede profil oluşturan üyelerin MEB tarafından tanımlanan “Öğretmen” tanımına uygunluğunu kontrol etmekle yükümlü değildir. Üyelerin beyanları tamamen kendi sorumluluğundadır.",
    "Özel Ders VIP, ders veren eğitimcilerle hizmet almak isteyenleri bir araya getiren bir yazılım şirketidir. 5580 kanun numaralı Özel Öğretim Kurumları Kanunu kapsamında eğitim kurumu değildir veya aracılık yapan bir kurum sayılmaz.",
    "Özel Ders VIP ders talep eden kullanıcılardan hiçbir ücret talep etmez. Gelirini hizmet vermek isteyen (üyelik vs.) üyelerinden sağlar. Hizmet veren üyeler yasal olarak serbest meslek mensubu sayılır, kendi mali ve vergi yükümlülüklerinden bizzat sorumludurlar.",
    "Kullanıcı adı ve şifresinin paylaşılmaması ve özenle korunması üyenin sorumluluğundadır. Kendi kusuru nedeniyle hesabının kötü niyetle kullanılmasından doğrudan sorumludur.",
    "Web Sitesi’ne beyan edilen isim, adres, telefon, e-posta gibi bilgilerin eksiksiz ve güncel olması gerekmektedir.",
    "Özel Ders VIP'de hizmet vermek için kayıt olan eğitmenler, iletişim bilgisi (telefon, e-posta, sosyal medya hesabı vb.) alanı dışında profil açıklamalarına iletişim bilgisi yazmaları durumunda hesapları silinebilir.",
    "Ders Talebi’nin içeriğine ilişkin tüm sorumluluk Ders Talep Eden’e aittir.",
    "Ders talep eden, anlaştığı üye ile kendi şartları altında çalışır. Hizmet alımı esnasında doğabilecek güvenlik sorunlarından site yönetimi sorumlu değildir.",
    "Hizmet Alanlar ile Hizmet Verenler arasındaki ödemeler esnasında çıkan anlaşmazlıklardan Özel Ders VIP sorumlu değildir.",
    "Özel Ders VIP, Hizmet Veren ile Hizmet Alan arasındaki sözlü veya yazılı anlaşmaları garanti edemez.",
    "Özel Ders VIP, taraflar arasında herhangi bir istihdam, danışmanlık, acentelik ilişkisi kurmaz.",
    "Özel Ders VIP, sistemin çalışmasını geçici bir süre askıya alabilir veya durdurabilir.",
    "Kullanıcılar arasında fikri hakların ihlaline ilişkin ihtilaf olduğunda, mahkeme kararlarına istinaden Özel Ders VIP işlem yapmakla yükümlüdür.",
    "Web Sitesinin tasarım, yazılım ve telif hakları Özel Ders VIP’e aittir. Kopyalanması veya tersine mühendislik yapılması yasaktır.",
    "Kullanıcılar tarafından yapılan yorum ve eleştiriler üzerinde Özel Ders VIP'nin düzenleme ve kaldırma hakkı saklıdır.",
    "Özel Ders VIP sisteminde kayıtlı veriler teknik bir sorun olmadığı müddetçe saklanır. Yasal uyuşmazlıklarda yetkili mercilerin talepleri doğrultusunda bu bilgiler paylaşılabilir.",
    "Bu Sözleşme Web Sitesi kullanılmaya devam edildiği ve kullanıcılara yeni bir sözleşme sunulmadığı sürece yürürlükte kalacaktır."
  ];

  return (
    <div className="min-h-screen pt-32 pb-24 transition-colors duration-300 dark:bg-[var(--bg-primary)]" style={{ backgroundColor: "#f5f3ec" }}>
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Başlık Alanı */}
        <div className="mb-10 text-left">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1e293b] dark:text-white mb-4 uppercase tracking-wide">
            Kullanım Şartları
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
            <span>Özel Ders VIP</span>
            <span>›</span>
            <span>KULLANIM ŞARTLARI</span>
          </div>
        </div>

        {/* İçerik */}
        <div>
          <div className="text-gray-700 dark:text-gray-300 text-base md:text-lg leading-relaxed">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)] mb-6">
              Genel Kurallar ve Şartlar
            </h2>
            <p className="mb-8 leading-relaxed">
              Kullanıcılar üyelik oluşturduktan sonra aşağıdaki koşullara uymayı
              kabul etmiş sayılırlar. Kullanıcının bu kurallara uymadığına dair
              başka bir kullanıcıdan şikayet gelmesi durumunda veya Özel Ders VIP (ozeldersvip.com) 
              tarafından tespit edilmesi durumunda kullanıcının hesabı ve diğer kullanıcılara göndermiş olduğu 
              mesajlar incelemeye alınabilir. Kullanım şartları ihlali tespit edilmesi durumunda kullanıcının hesabı 
              askıya alınabilir veya tamamen kapatılabilir. Gerekli durumlarda yasal soruşturma için bu bilgiler adli 
              makamlar ile paylaşılabilir. Kullanıcının aşağıdaki koşullara uymaması durumunda kendisine veya 
              başka bir kullanıcıya gelecek zarardan kullanıcı kendisi sorumludur, Özel Ders VIP herhangi bir şekilde sorumlu değildir.
            </p>

            <div className="space-y-4 mb-12">
              {rules.map((rule, idx) => (
                <div key={idx} className="flex gap-4 items-start">
                  <p className="m-0 leading-relaxed"><span className="font-bold mr-1">{idx + 1}-</span> {rule}</p>
                </div>
              ))}
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)] mb-6 mt-12 border-t pt-8 dark:border-[var(--card-border)]">
              Platform Sorumlulukları ve Genel Şartlar
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
                Bu sözleşmeyi kabul etmeyen üyeler ve kullanıcılar, sitedeki verilerinin silinmesi için{" "}
                <a href="mailto:info@ozeldersvip.com" className="text-blue-600 hover:underline">info@ozeldersvip.com</a>{" "}
                adresine e-posta göndererek talepte bulunabilirler. Sitede verileri bulunmayan üyelerin sistem ile 
                olan bağlayıcılığı sonlanmış olur. Kullanıcıların geçmiş işlemleri sözleşme kapsamındadır, 
                sonradan feshedilemez.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
