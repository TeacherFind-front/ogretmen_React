import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Search, Globe, Star, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary/5 py-20 px-6">
        <div className="container mx-auto max-w-6xl flex flex-col items-center text-center">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-6">
            Uzman öğretmenler ile potansiyelini açığa çıkar
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl">
            Dünyanın en iyi öğretmenlerinden online olarak diller, akademik
            konular ve profesyonel beceriler öğrenin.
          </p>

          <div className="w-full max-w-3xl flex flex-col md:flex-row gap-4 bg-background p-4 rounded-xl shadow-lg border">
            <div className="flex-1 relative flex items-center">
              <Search className="absolute left-3 text-muted-foreground w-5 h-5" />
              <input
                type="text"
                placeholder="Ne öğrenmek istiyorsunuz?"
                className="w-full h-12 pl-10 pr-4 bg-transparent outline-none text-foreground"
              />
            </div>
            <Button size="lg" className="md:w-auto w-full h-12 text-lg">
              Öğretmen Ara
            </Button>
          </div>
        </div>
      </section>

      {/* Popular Subjects */}
      <section className="py-20 px-6 bg-background">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-10 text-center">
            Popüler dersler
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              "İngilizce",
              "İspanyolca",
              "Matematik",
              "Python",
              "Fransızca",
              "Almanca",
              "Fizik",
              "Kimya",
            ].map((subject) => (
              <Card
                key={subject}
                className="hover:shadow-md transition-shadow cursor-pointer border-muted"
              >
                <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                    <Globe className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-lg">{subject}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    1,200+ öğretmen
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto max-w-6xl text-center">
          <h2 className="text-3xl font-bold mb-16">Nasıl çalışır?</h2>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">1. Öğretmenini Bul</h3>
              <p className="text-muted-foreground">
                İhtiyaçlarına ve bütçene uygun öğretmeni bulmak için filtreleri kullan.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">2. Ücretsiz deneme dersi</h3>
              <p className="text-muted-foreground">
                İlk dersi planlayın ve öğrenme hedeflerinizi görüşün.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Star className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">3. Derslere Başla</h3>
              <p className="text-muted-foreground">
                İç entegre derslik aracılığıyla kolayca bağlanın ve hedeflerinize ulaşın.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
