import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Star, Video, MessageCircle, Heart, Calendar } from "lucide-react";

export default function TutorDetail() {
  const { slug } = useParams();

  // Mock data fetching based on slug
  const tutor = {
    id: slug || "1",
    name: "Sarah Jenkins",
    avatar: "https://i.pravatar.cc/300?u=sarah",
    rating: 4.9,
    reviews: 124,
    hourlyRate: 25,
    headline: "5 Yıllık Deneyime Sahip Sertifikalı ESL Öğretmeni",
    bio: "Merhaba! Konuşma İngilizcesi ve iş İngilizcesi konularında uzmanım. Derslerim oldukça etkileşimli ve kişisel hedeflerinize göre uyarlanmıştır. Dünya çapında 500'den fazla öğrenciye eğitim verdim ve profesyonellerin sunumlar, toplantılar ve mülakatlar için iletişim becerilerini geliştirmelerine yardımcı oluyorum.",
    aboutMe: "Dilbilim diplomasına ve TEFL sertifikasına sahibim. Boş zamanlarımda seyahat etmeyi, klasik edebiyat okumayı ve yeni diller öğrenmeyi çok seviyorum, bu yüzden dil öğrenmenin zorluklarını gerçekten anlıyorum!",
    teachingStyle: "Öğretim tarzım iletişimsel ve öğrenci merkezlidir. Dersleri ilgi çekici kılmak için makaleler, podcast'ler ve videolar gibi gerçek dünya materyallerini kullanıyorum.",
    languages: ["İngilizce (Anadil)", "İspanyolca (B2)"],
    activeStudents: 15,
    totalLessons: 1240,
  };

  return (
    <div className="container mx-auto py-8 px-6 max-w-5xl">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Main Content */}
        <main className="flex-1 space-y-8">
          {/* Header Info */}
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <img 
              src={tutor.avatar} 
              alt={tutor.name} 
              className="w-32 h-32 rounded-xl object-cover shadow-sm border"
            />
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h1 className="text-3xl font-bold">{tutor.name}</h1>
                <button className="p-2 border rounded-full hover:bg-muted transition-colors">
                  <Heart className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <h2 className="text-xl font-medium text-primary mt-1 mb-3">{tutor.headline}</h2>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                <span className="flex items-center text-foreground font-medium">
                  <Star className="w-5 h-5 fill-primary text-primary mr-1" /> {tutor.rating}
                  <span className="text-muted-foreground ml-1 font-normal">({tutor.reviews} değerlendirme)</span>
                </span>
                <span className="flex items-center">
                  <Video className="w-4 h-4 mr-1" /> {tutor.totalLessons} ders
                </span>
                <span>{tutor.activeStudents} aktif öğrenci</span>
              </div>
              
              <div className="flex gap-2 mt-4 flex-wrap">
                {tutor.languages.map((lang, idx) => (
                  <Badge key={idx} variant="secondary">{lang}</Badge>
                ))}
              </div>
            </div>
          </div>

          <hr className="border-border" />

          {/* About */}
          <section>
            <h3 className="text-2xl font-bold mb-4">Öğretmen Hakkında</h3>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line mb-4">
              {tutor.bio}
            </p>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {tutor.aboutMe}
            </p>
          </section>

          {/* Teaching Style */}
          <section>
            <h3 className="text-2xl font-bold mb-4">Öğretim Tarzı</h3>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {tutor.teachingStyle}
            </p>
          </section>

          {/* Mock Schedule/Calendar Area Placeholder */}
          <section>
            <h3 className="text-2xl font-bold mb-4">Program</h3>
            <div className="h-64 border rounded-xl flex items-center justify-center bg-muted/10">
              <div className="text-center text-muted-foreground">
                <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>Etkileşimli Takvim Bileşeni Buraya Gelecek</p>
              </div>
            </div>
          </section>

        </main>

        {/* Sticky Sidebar (Booking Widget) */}
        <aside className="w-full lg:w-80 flex-shrink-0">
          <div className="border rounded-xl p-6 shadow-lg lg:sticky lg:top-24 bg-card">
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm text-muted-foreground">Saatlik ücret</span>
              <span className="text-2xl font-bold">{tutor.hourlyRate}$</span>
            </div>
            
            <div className="space-y-3 mb-6">
              <Link to="/app/bookings/new" className="block">
                <Button className="w-full h-12 text-lg">Deneme dersi ayırt</Button>
              </Link>
              <Button variant="outline" className="w-full h-12">
                <MessageCircle className="w-5 h-5 mr-2" /> Mesaj gönder
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Star className="w-4 h-4 fill-primary text-primary" />
              <span className="font-medium text-foreground">{tutor.rating}</span>
              Süper popüler! Bu öğretmenin programı hızla doluyor.
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
