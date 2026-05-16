import { useState } from "react";
import { ChevronDown, MessageCircle, HelpCircle, BookOpen, Users } from "lucide-react";

const FAQ_DATA = [
  {
    category: "Genel Sorular",
    icon: HelpCircle,
    items: [
      {
        q: "Öğrenmenin Çilingirleri nedir ve nasıl çalışır?",
        a: "Öğrenmenin Çilingirleri, yeni bir dil öğrenmek, okul derslerine takviye almak veya yeni bir beceri edinmek isteyen öğrencileri, alanında uzman ve doğrulanmış öğretmenlerle buluşturan bir eğitim platformudur. Platform üzerinden öğretmenleri inceleyebilir, yorumlarını okuyabilir ve size en uygun olanından ders alabilirsiniz."
      },
      {
        q: "Dersler nerede ve nasıl yapılıyor?",
        a: "Dersler, tamamen sizin tercihinize bağlıdır. Öğretmenin profiline göre dersleri 'Çevrimiçi' (platformumuzun kendi güvenli video altyapısı üzerinden) veya 'Yüz Yüze' olarak gerçekleştirebilirsiniz."
      },
      {
        q: "Ödemeler güvenli mi?",
        a: "Evet, tüm ödemeler 256-bit SSL şifreleme teknolojisi ve 3D Secure ile korunmaktadır. Ödemeniz, ders gerçekleşip onaylanana kadar güvenli havuz hesabımızda tutulur."
      }
    ]
  },
  {
    category: "Öğrenciler İçin",
    icon: BookOpen,
    items: [
      {
        q: "Nasıl deneme dersi alabilirim?",
        a: "Beğendiğiniz öğretmenin profilinde bulunan 'Deneme Dersi Al' butonuna tıklayarak, öğretmenin takviminden size uygun bir saat seçebilirsiniz. Deneme dersleri genellikle normal derslerden daha uygun fiyatlıdır veya öğretmenin inisiyatifine göre ücretsiz olabilir."
      },
      {
        q: "Dersten memnun kalmazsam ne olur?",
        a: "Öğrenci memnuniyeti bizim için çok önemlidir. Eğer aldığınız ilk dersten (deneme dersi) memnun kalmazsanız, %100 Memnuniyet Garantimiz kapsamında paranız iade edilir veya farklı bir öğretmenden ücretsiz ders hakkı tanımlanır."
      },
      {
        q: "Ders paketleri alırsam indirim oluyor mu?",
        a: "Evet! Çoğu öğretmenimiz 5, 10 veya 20 derslik paketlerde %5 ile %20 arasında değişen oranlarda indirimler sunmaktadır. Satın alma ekranında bu paket seçeneklerini görebilirsiniz."
      }
    ]
  },
  {
    category: "Öğretmenler İçin",
    icon: Users,
    items: [
      {
        q: "Nasıl öğretmen olabilirim?",
        a: "Platformumuzda öğretmen olmak için 'Kayıt Ol' sayfasından 'Öğretmen' profilini seçerek başvuru yapmalısınız. Eğitim belgeleriniz ve kimlik doğrulamanız ekibimiz tarafından incelendikten sonra profiliniz onaylanır ve yayına alınır."
      },
      {
        q: "Platform komisyon oranları nedir?",
        a: "Öğrenmenin Çilingirleri, platform altyapısı ve pazarlama giderleri için ders başı ücret üzerinden komisyon almaktadır. Komisyon oranlarımız %15'ten başlar ve platformda verdiğiniz ders sayısı arttıkça %8'e kadar düşer."
      },
      {
        q: "Ödememi ne zaman alabilirim?",
        a: "Tamamlanan derslerin ödemeleri, öğrenci onayından sonraki 24 saat içerisinde öğretmen bakiyenize yansır. Bakiyenizi haftanın her günü IBAN numaranıza kesintisiz olarak çekebilirsiniz."
      }
    ]
  }
];

function FaqAccordionItem({ question, answer, isOpen, onClick }) {
  return (
    <div className={`border rounded-xl transition-all duration-300 overflow-hidden ${isOpen ? 'border-primary shadow-md bg-white' : 'border-gray-200 bg-gray-50/50 hover:border-primary/50 hover:bg-white'}`}>
      <button
        className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
        onClick={onClick}
      >
        <span className={`font-semibold text-lg transition-colors duration-200 ${isOpen ? 'text-primary' : 'text-gray-800'}`}>
          {question}
        </span>
        <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 ${isOpen ? 'bg-primary/10 text-primary rotate-180' : 'bg-gray-100 text-gray-500'}`}>
          <ChevronDown className="w-5 h-5" />
        </div>
      </button>
      
      <div 
        className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="p-5 pt-0 text-gray-600 leading-relaxed">
          {answer}
        </div>
      </div>
    </div>
  );
}

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (catIdx, itemIdx) => {
    const key = `${catIdx}-${itemIdx}`;
    setOpenItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-16 px-6 relative overflow-hidden">
      
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/5 to-transparent -z-10"></div>
      <div className="absolute top-20 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-20 w-80 h-80 bg-green-400/10 rounded-full blur-3xl -z-10"></div>

      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block py-1.5 px-4 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-4">
            Destek Merkezi
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            Sıkça Sorulan Sorular
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Aklınıza takılan soruların cevaplarını burada bulabilirsiniz. Bulamazsanız, bizimle iletişime geçmekten çekinmeyin.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {FAQ_DATA.map((category, idx) => {
            const Icon = category.icon;
            const isActive = activeCategory === idx;
            return (
              <button
                key={idx}
                onClick={() => setActiveCategory(idx)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-105' 
                    : 'bg-white text-gray-600 shadow-sm border border-gray-200 hover:border-primary/50 hover:text-primary'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-primary'}`} />
                {category.category}
              </button>
            )
          })}
        </div>

        {/* FAQ Items */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100">
          <div className="space-y-4">
            {FAQ_DATA[activeCategory].items.map((item, idx) => (
              <FaqAccordionItem 
                key={idx}
                question={item.q}
                answer={item.a}
                isOpen={!!openItems[`${activeCategory}-${idx}`]}
                onClick={() => toggleItem(activeCategory, idx)}
              />
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="mt-16 text-center bg-primary/5 rounded-3xl p-8 border border-primary/10">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-primary">
            <MessageCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Sorunuzun cevabını bulamadınız mı?</h2>
          <p className="text-gray-600 mb-6">
            Destek ekibimiz size yardımcı olmak için her zaman hazır. Bize ulaşarak aklınızdaki tüm soruları sorabilirsiniz.
          </p>
          <button className="bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-8 rounded-xl shadow-lg transition-all hover:-translate-y-0.5">
            Bize Ulaşın
          </button>
        </div>

      </div>
    </div>
  );
}
