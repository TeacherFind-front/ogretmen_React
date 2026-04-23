import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Calendar, Clock, Video } from "lucide-react";

export default function StudentLessons() {
  const lessons = [
    { id: 1, tutor: "Sarah Jenkins", date: "15 Eki 2026", time: "18:00 - 19:00", subject: "İngilizce", status: "Yaklaşan", img: "https://i.pravatar.cc/150?u=sarah" },
    { id: 2, tutor: "Carlos Mendoza", date: "16 Eki 2026", time: "10:00 - 11:00", subject: "İspanyolca", status: "Yaklaşan", img: "https://i.pravatar.cc/150?u=carlos" },
    { id: 3, tutor: "Sarah Jenkins", date: "12 Eki 2026", time: "18:00 - 19:00", subject: "İngilizce", status: "Tamamlandı", img: "https://i.pravatar.cc/150?u=sarah" },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Derslerim</h1>
        <Button>Yeni ders ayırt</Button>
      </div>

      <div className="flex gap-4 border-b pb-2 mb-6">
        <button className="text-primary font-semibold border-b-2 border-primary pb-2 -mb-[10px]">Yaklaşanlar</button>
        <button className="text-muted-foreground hover:text-foreground pb-2">Geçmiş</button>
      </div>

      <div className="grid gap-4">
        {lessons.map((lesson) => (
          <Card key={lesson.id} className="opacity-100">
            <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <img src={lesson.img} alt={lesson.tutor} className="w-16 h-16 rounded-full object-cover border" />
                <div>
                  <h3 className="font-semibold text-lg">{lesson.tutor}</h3>
                  <div className="text-sm text-muted-foreground flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {lesson.date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {lesson.time}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                <div>
                  <Badge variant={lesson.status === "Yaklaşan" ? "default" : "secondary"}>
                    {lesson.status}
                  </Badge>
                </div>
                {lesson.status === "Yaklaşan" ? (
                  <Button>
                    <Video className="w-4 h-4 mr-2" /> Sınıfa Katıl
                  </Button>
                ) : (
                  <Button variant="outline">Notları Görüntüle</Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
