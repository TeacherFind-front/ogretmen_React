import { TutorCard } from "@/components/shared/TutorCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const MOCK_TUTORS = [
  {
    id: "1",
    name: "Sarah Jenkins",
    avatar: "https://i.pravatar.cc/150?u=sarah",
    rating: 4.9,
    reviews: 124,
    hourlyRate: 25,
    headline: "5 Yıllık Deneyime Sahip Sertifikalı ESL Öğretmeni",
    bio: "Merhaba! Konuşma İngilizcesi ve iş İngilizcesi konularında uzmanım. Derslerim oldukça etkileşimli ve kişisel hedeflerinize göre uyarlanmıştır.",
    languages: "İngilizce (Anadil), İspanyolca (B2)",
    activeStudents: 15
  },
  {
    id: "2",
    name: "Carlos Mendoza",
    avatar: "https://i.pravatar.cc/150?u=carlos",
    rating: 4.8,
    reviews: 89,
    hourlyRate: 18,
    headline: "Anadili İspanyolca | DELE Hazırlık Uzmanı",
    bio: "İspanyolcayı doğal yollarla öğrenin! Öğrencilerin DELE sınavlarına hazırlanmalarına ve konuşma akıcılıklarını hızlı ve verimli bir şekilde geliştirmelerine yardımcı oluyorum.",
    languages: "İspanyolca (Anadil), İngilizce (C1)",
    activeStudents: 22
  },
  {
    id: "3",
    name: "Emma Watson",
    avatar: "https://i.pravatar.cc/150?u=emma",
    rating: 5.0,
    reviews: 312,
    hourlyRate: 35,
    headline: "Üniversite Profesörü | İleri Düzey İngiliz Edebiyatı",
    bio: "İngilizce öğrenimine titiz ancak ilgi çekici bir yaklaşım getiriyorum. Nüans, kelime bilgisi ve yazma konularında uzmanlaşmak isteyen ileri düzey öğrenciler için mükemmel.",
    languages: "İngilizce (Anadil), Fransızca (C2)",
    activeStudents: 8
  }
];

export default function TutorsList() {
  return (
    <div className="container mx-auto py-8 px-6 flex flex-col md:flex-row gap-8">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 flex-shrink-0">
        <div className="sticky top-24 space-y-6">
          <div>
            <h3 className="font-semibold mb-3">Dil</h3>
            <select className="w-full h-10 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
              <option>İngilizce</option>
              <option>İspanyolca</option>
              <option>Fransızca</option>
              <option>Almanca</option>
            </select>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Saatlik Ücret</h3>
            <div className="flex items-center gap-2">
              <Input type="number" placeholder="Min" defaultValue={5} />
              <span>-</span>
              <Input type="number" placeholder="Max" defaultValue={40} />
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Öğretmenin Ülkesi</h3>
            <select className="w-full h-10 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
              <option>Fark Etmez</option>
              <option>Amerika Birleşik Devletleri</option>
              <option>Birleşik Krallık</option>
              <option>İspanya</option>
            </select>
          </div>

          <Button className="w-full h-10">Filtreleri Uygula</Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 shrink min-w-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{MOCK_TUTORS.length} öğretmen müsait</h1>
          <select className="h-10 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
            <option>Sırala: Önerilen</option>
            <option>Sırala: Fiyat (Düşükten Yükseğe)</option>
            <option>Sırala: Fiyat (Yüksekten Düşüğe)</option>
            <option>Sırala: Değerlendirme</option>
          </select>
        </div>

        <div className="space-y-6">
          {MOCK_TUTORS.map(tutor => (
            <TutorCard key={tutor.id} tutor={tutor} />
          ))}
        </div>
        
        <div className="mt-8 flex justify-center">
          <Button variant="outline">Daha Fazla Öğretmen Yükle</Button>
        </div>
      </main>
    </div>
  );
}
