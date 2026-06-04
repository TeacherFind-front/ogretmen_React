import { useState } from "react";
import { ChevronDown, MessageCircle, HelpCircle, BookOpen, Users, ArrowRight } from "lucide-react";

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
    <div className={`group border rounded-2xl transition-all duration-300 overflow-hidden ${
      isOpen 
        ? 'border-primary/30 bg-primary/5 shadow-lg shadow-primary/5 dark:bg-primary/10' 
        : 'border-gray-100 bg-white hover:border-primary/20 hover:bg-gray-50/50 dark:bg-slate-900/50 dark:border-slate-800 dark:hover:border-primary/30'
    }`}>
      <button
        className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
        onClick={onClick}
      >
        <span className={`font-bold text-lg md:text-xl transition-colors duration-200 ${
          isOpen ? 'text-primary' : 'text-gray-800 dark:text-slate-100 group-hover:text-primary'
        }`}>
          {question}
        </span>
        <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-500 ${
          isOpen ? 'bg-primary text-white rotate-180' : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 group-hover:bg-primary/10 group-hover:text-primary'
        }`}>
          <ChevronDown className="w-5 h-5" />
        </div>
      </button>
      
      <div 
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-6 pt-0 text-gray-600 dark:text-slate-400 leading-relaxed text-base md:text-lg">
          <div className="h-px w-full bg-gray-100 dark:bg-slate-800 mb-6"></div>
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
    <div className="min-h-screen bg-[#fcfdff] dark:bg-[#0f172a] py-24 px-6 relative overflow-hidden transition-colors duration-500">
      
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] dark:bg-primary/10"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-400/5 rounded-full blur-[120px] dark:bg-blue-400/10"></div>
      </div>

      <div className="container mx-auto max-w-5xl relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-widest mb-6 border border-primary/20">
            <HelpCircle size={14} />
            Destek Merkezi
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-8 tracking-tight">
            Size Nasıl <span className="text-primary">Yardımcı</span> Olabiliriz?
          </h1>
          <p className="text-xl text-gray-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Aklınıza takılan tüm soruların cevaplarını kategorize edilmiş şekilde aşağıda bulabilirsiniz.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {FAQ_DATA.map((category, idx) => {
            const Icon = category.icon;
            const isActive = activeCategory === idx;
            return (
              <button
                key={idx}
                onClick={() => setActiveCategory(idx)}
                className={`group flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-base transition-all duration-300 ${
                  isActive 
                    ? 'bg-primary text-white shadow-2xl shadow-primary/30 scale-105' 
                    : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-400 shadow-sm border border-gray-100 dark:border-slate-800 hover:border-primary/50 hover:text-primary dark:hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-white' : 'text-gray-400 dark:text-slate-500 group-hover:text-primary'}`} />
                {category.category}
              </button>
            )
          })}
        </div>

        {/* FAQ Items Container */}
        <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
          {FAQ_DATA[activeCategory].items.map((item, idx) => (
            <FaqAccordionItem 
              key={`${activeCategory}-${idx}`}
              question={item.q}
              answer={item.a}
              isOpen={!!openItems[`${activeCategory}-${idx}`]}
              onClick={() => toggleItem(activeCategory, idx)}
            />
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-24 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 dark:bg-primary/10 rounded-[40px] border border-primary/10 dark:border-primary/20 transition-transform duration-500 group-hover:scale-[1.02]"></div>
            <div className="relative p-12 md:p-16">
                <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-primary/10 text-primary border border-primary/10">
                    <MessageCircle className="w-10 h-10" />
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4">Hala sorularınız mı var?</h2>
                <p className="text-lg text-gray-600 dark:text-slate-400 mb-10 max-w-xl mx-auto">
                    Destek ekibimiz size yardımcı olmak için burada. Haftanın her günü 09:00 - 22:00 saatleri arasında bize ulaşabilirsiniz.
                </p>
                <button className="inline-flex items-center gap-3 bg-primary hover:bg-primary/90 text-white font-black py-4 px-10 rounded-2xl shadow-xl shadow-primary/25 transition-all hover:-translate-y-1 active:scale-95 group/btn">
                    Müşteri Temsilcisine Bağlan
                    <ArrowRight className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" />
                </button>
            </div>
        </div>

      </div>
    </div>
  );
}
