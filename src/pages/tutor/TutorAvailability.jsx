import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function TutorAvailability() {
  const days = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Uygunluk Durumu</h1>
        <Button>Değişiklikleri Kaydet</Button>
      </div>
      
      <p className="text-muted-foreground">
        Haftalık yinelenen programınızı belirleyin. Öğrenciler sadece bu saatler arasında ders alabilecektir.
      </p>

      <div className="grid gap-4 mt-6">
        {days.map((day) => (
          <Card key={day}>
            <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-32 flex items-center gap-3">
                <input type="checkbox" className="w-4 h-4 rounded text-primary" defaultChecked={day !== "Pazar"} />
                <span className="font-semibold">{day}</span>
              </div>
              
              {day !== "Pazar" ? (
                <div className="flex-1 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <select className="border rounded-md px-3 py-1.5 text-sm bg-transparent">
                      <option>09:00</option>
                      <option>10:00</option>
                      <option>11:00</option>
                    </select>
                    <span>ile</span>
                    <select className="border rounded-md px-3 py-1.5 text-sm bg-transparent">
                      <option>12:00</option>
                      <option>13:00</option>
                      <option selected>17:00</option>
                    </select>
                    <button className="text-destructive text-sm font-medium ml-2">Kaldır</button>
                  </div>
                  <Button variant="ghost" size="sm" className="w-max hidden md:flex text-primary">
                    + Saat Dilimi Ekle
                  </Button>
                </div>
              ) : (
                <div className="flex-1 text-muted-foreground text-sm italic">
                  Müsait Değil (İzin Günü)
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
