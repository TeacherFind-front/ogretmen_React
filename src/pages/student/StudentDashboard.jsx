import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Calendar, Clock, Video, BookOpen } from "lucide-react";

export default function StudentDashboard() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold">Tekrar Hoş Geldin, Öğrenci!</h1>
      
      {/* Stats row */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yaklaşan Dersler</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Sonraki ders 3 saat içinde</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tamamlanan Dersler</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14</div>
            <p className="text-xs text-muted-foreground">Geçen haftaya göre +2</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Abonelikler</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">Bu ay kalan 8 saat</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Next Lessons List */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Sıradaki Dersler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-4">
                <img src="https://i.pravatar.cc/150?u=sarah" alt="Tutor" className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <h4 className="font-semibold">Sarah Jenkins</h4>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Bugün, 18:00 - 19:00
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm">
                  <Video className="w-4 h-4 mr-2" /> Katıl
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
              <div className="flex items-center gap-4">
                <img src="https://i.pravatar.cc/150?u=carlos" alt="Tutor" className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <h4 className="font-semibold">Carlos Mendoza</h4>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Yarın, 10:00 - 11:00
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Detaylar</Button>
              </div>
            </div>
            
            <Button variant="outline" className="w-full">Takvimi Görüntüle</Button>
          </CardContent>
        </Card>

        {/* Goals & Progress */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Öğrenme İlerlemesi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium text-sm">İngilizce Seviyesi (B2)</span>
                <span className="text-sm text-muted-foreground">%75</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary w-3/4"></div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-3">Son Geri Bildirimler</h4>
              <div className="p-3 border rounded-lg text-sm bg-muted/20">
                <span className="font-semibold">Sarah:</span> "Bugün telaffuzunda büyük gelişme var! R seslerini pratik etmeye devam et."
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
