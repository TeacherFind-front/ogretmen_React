import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Star, MessageCircle, Heart } from "lucide-react";
import { Link } from "react-router-dom";

export function TutorCard({ tutor }) {
  return (
    <Card className="flex flex-col md:flex-row overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="md:w-64 bg-muted/30 p-6 flex flex-col items-center justify-center border-r">
        <div className="relative">
          <img 
            src={tutor.avatar} 
            alt={tutor.name} 
            className="w-24 h-24 rounded-full object-cover shadow-sm mb-4"
          />
          <span className="absolute bottom-4 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
        </div>
        <h3 className="font-bold text-lg text-center mb-1">{tutor.name}</h3>
        <p className="text-sm text-primary font-medium flex items-center gap-1 mb-3">
          <Star className="w-4 h-4 fill-primary text-primary" /> {tutor.rating} ({tutor.reviews} değerlendirme)
        </p>
        <p className="font-bold text-xl">{tutor.hourlyRate}₺<span className="text-sm font-normal text-muted-foreground">/saat</span></p>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-semibold text-lg">{tutor.headline}</h4>
          <button className="text-muted-foreground hover:text-primary transition-colors">
            <Heart className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {tutor.bio}
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          <Badge variant="secondary">Konuştuğu Diller: {tutor.languages}</Badge>
          <Badge variant="outline">{tutor.activeStudents} aktif öğrenci</Badge>
        </div>

        <div className="mt-auto flex flex-col sm:flex-row gap-3">
          <Link to={`/tutors/${tutor.id}`} className="flex-1">
            <Button className="w-full">Deneme Dersi Al</Button>
          </Link>
          <Button variant="outline" className="flex-1">
            <MessageCircle className="w-4 h-4 mr-2" /> Mesaj Gönder
          </Button>
        </div>
      </div>
    </Card>
  );
}
