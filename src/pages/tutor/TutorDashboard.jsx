import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Users, DollarSign, Calendar, TrendingUp } from "lucide-react";

export default function TutorDashboard() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Öğretmen Kontrol Paneli</h1>
        <Button variant="outline">Açık Profili Görüntüle</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aylık Kazanç</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14.200₺</div>
            <p className="text-xs text-muted-foreground">Geçen aya göre +%20.1</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Öğrenciler</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">Bu hafta +3 yeni</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verilen Dersler</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">84</div>
            <p className="text-xs text-muted-foreground">Bu hafta planlanan 12 ders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profil Dönüşümü</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">%18.2</div>
            <p className="text-xs text-muted-foreground">En iyi %10 öğretmen</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Bugünün Programı</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg bg-card">
              <div>
                 <p className="font-semibold">Ayşe Yılmaz (Deneme)</p>
                 <p className="text-sm text-muted-foreground">14:00 - 15:00</p>
              </div>
              <Button size="sm">Odaya Gir</Button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg bg-card">
              <div>
                 <p className="font-semibold">Burak Kara</p>
                 <p className="text-sm text-muted-foreground">16:00 - 17:00</p>
              </div>
              <Button size="sm" variant="outline">Hazırlan</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Son İşlem Maddeleri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 border rounded-lg border-l-4 border-l-orange-500 bg-orange-500/10">
              <p className="font-semibold text-sm">Yeniden Planlama İsteği</p>
              <p className="text-xs text-muted-foreground mt-1">Burak Kara perşembe dersini cumaya taşımak istedi.</p>
              <div className="flex gap-2 mt-2">
                <Button size="sm" className="h-7 text-xs bg-orange-500 hover:bg-orange-600">Kabul Et</Button>
                <Button size="sm" variant="outline" className="h-7 text-xs">Reddet</Button>
              </div>
            </div>
            <div className="p-3 border rounded-lg border-l-4 border-l-primary bg-primary/10">
              <p className="font-semibold text-sm">Yeni Değerlendirme Alındı</p>
              <p className="text-xs text-muted-foreground mt-1">Ayşe 5 yıldızlı bir değerlendirme bıraktı: "Harika öğretmen..."</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
