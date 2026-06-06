import { useState, useEffect } from "react";
import { getAdminListings, approveListing } from "@/services/adminService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { 
  CheckCircle, 
  XCircle, 
  ExternalLink, 
  Loader2, 
  Search, 
  Filter, 
  Clock, 
  MapPin, 
  Tag, 
  User,
  MoreVertical,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function AdminTutors() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadListings();
  }, []);

  async function loadListings() {
    setLoading(true);
    try {
      const data = await getAdminListings({ status: 'PendingApproval' });
      console.log("Yüklenen Admin İlanları:", data);
      setListings(data.items || []);
    } catch (err) {
      toast.error("İlanlar yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id, isApproved) {
    try {
      await approveListing(id, isApproved);
      setListings(listings.filter(l => l.id !== id));
      toast.success(isApproved ? "İlan başarıyla onaylandı." : "İlan reddedildi.");
    } catch (err) {
      toast.error("İşlem sırasında bir hata oluştu.");
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Eğitmen Onayları</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Sisteme yeni eklenen veya güncellenen ilanları buradan kontrol edin.</p>
        </div>
        <div className="flex bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm w-full md:w-auto transition-colors">
           <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="İlanlarda ara..." 
                className="w-full h-11 bg-transparent border-none pl-11 pr-4 text-sm font-medium outline-none dark:text-slate-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <Button variant="ghost" className="h-11 rounded-xl text-slate-500 dark:text-slate-400 font-bold hover:dark:bg-slate-700">
              <Filter className="w-4 h-4 mr-2" /> Filtrele
           </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
           <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
           <p className="text-slate-400 font-bold animate-pulse">İlanlar taranıyor...</p>
        </div>
      ) : listings.length === 0 ? (
        <Card className="border-none shadow-sm bg-white dark:bg-[#1e293b] rounded-[2.5rem] py-20 transition-colors">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
               <CheckCircle className="h-12 w-12 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Harika! Her Şey Güncel</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm font-medium">Şu an onay bekleyen herhangi bir eğitmen ilanı bulunmuyor.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {listings.map((listing) => (
            <Card key={listing.id} className="border-none shadow-sm bg-white dark:bg-[#1e293b] rounded-[2rem] overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all duration-500 border border-slate-100/50 dark:border-slate-800/50">
              <div className="flex flex-col lg:flex-row">
                <div className="p-8 flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <Badge className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-none px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                       {listing.category}
                    </Badge>
                    <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest flex items-center gap-1">
                       <Clock className="w-3 h-3" /> {new Date(listing.createdAt).toLocaleDateString('tr-TR')}
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{listing.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium mb-6 line-clamp-2 text-sm leading-relaxed">{listing.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">
                           <User className="w-5 h-5" />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">Eğitmen</p>
                           <p className="text-sm font-bold text-slate-900 dark:text-slate-200">{listing.tutorName}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">
                           <Tag className="w-5 h-5" />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">Saatlik Ücret</p>
                           <p className="text-sm font-black text-blue-600 dark:text-blue-400">₺{listing.price}</p>
                        </div>
                     </div>
                  </div>
                </div>

                <div className="bg-slate-50/50 dark:bg-slate-800/50 p-8 flex flex-col justify-center gap-4 lg:w-80 border-l border-slate-100 dark:border-slate-700">
                  <Link to={`/tutors/${listing.id}`} target="_blank" className="w-full">
                    <Button variant="outline" className="w-full h-12 rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-bold text-sm shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all dark:text-slate-200">
                      <ExternalLink className="w-4 h-4 mr-2" /> Detayları Gör
                    </Button>
                  </Link>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <Button 
                      className="h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black shadow-lg shadow-emerald-200"
                      onClick={() => handleApprove(listing.id, true)}
                    >
                      <ThumbsUp className="w-4 h-4 mr-2" /> Onayla
                    </Button>
                    <Button 
                      variant="destructive"
                      className="h-12 rounded-xl font-black shadow-lg shadow-red-200"
                      onClick={() => handleApprove(listing.id, false)}
                    >
                      <ThumbsDown className="w-4 h-4 mr-2" /> Reddet
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

