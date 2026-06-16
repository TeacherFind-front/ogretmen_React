import { useState, useEffect } from "react";
import { 
  getAdminListings, 
  approveListing, 
  getAdminListingDetail,
  deleteAdminListing 
} from "@/services/adminService";
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
  ThumbsDown,
  Trash2,
  AlertCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function AdminTutors() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedListingDetail, setSelectedListingDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  
  // Custom Modals State
  const [deleteConfirmListing, setDeleteConfirmListing] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [rejectConfirmListing, setRejectConfirmListing] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Sekmeler: 'All', 'PendingApproval', 'Active', 'Passive', 'Rejected'
  const [activeTab, setActiveTab] = useState("PendingApproval");

  useEffect(() => {
    loadListings();
  }, [activeTab]);

  async function loadListings() {
    setLoading(true);
    try {
      const query = {
        page: 1,
        pageSize: 50
      };
      
      if (activeTab !== "All") {
        query.status = activeTab;
      }
      
      const data = await getAdminListings(query);
      setListings(data.items || []);
    } catch (err) {
      toast.error("İlanlar yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id, isApproved) {
    if (!isApproved) {
      setRejectConfirmListing({ id });
      setRejectReason("");
      return;
    }

    setActionLoading(true);
    try {
      await approveListing(id, true);
      toast.success("İlan başarıyla onaylandı.");
      loadListings();
      if (selectedListingDetail?.id === id) {
        setSelectedListingDetail(null);
      }
    } catch (err) {
      toast.error(err.message || "İşlem sırasında bir hata oluştu.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRejectSubmit() {
    if (!rejectConfirmListing) return;
    const { id } = rejectConfirmListing;
    
    if (!rejectReason.trim()) {
      toast.error("Lütfen red sebebini yazınız.");
      return;
    }

    setActionLoading(true);
    try {
      await approveListing(id, false, rejectReason.trim());
      toast.success("İlan reddedildi.");
      setRejectConfirmListing(null);
      setRejectReason("");
      loadListings();
      if (selectedListingDetail?.id === id) {
        setSelectedListingDetail(null);
      }
    } catch (err) {
      toast.error(err.message || "İşlem sırasında bir hata oluştu.");
    } finally {
      setActionLoading(false);
    }
  }

  function handleDelete(id, title) {
    setDeleteConfirmListing({ id, title });
  }

  async function handleDeleteSubmit() {
    if (!deleteConfirmListing) return;
    const { id } = deleteConfirmListing;

    setDeleteLoading(true);
    try {
      await deleteAdminListing(id);
      setListings(listings.filter(l => l.id !== id));
      toast.success("İlan başarıyla silindi.");
      setDeleteConfirmListing(null);
      if (selectedListingDetail?.id === id) {
        setSelectedListingDetail(null);
      }
    } catch (err) {
      toast.error(err.message || "İlan silinirken bir hata oluştu.");
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleViewDetails(id) {
    setDetailLoading(true);
    try {
      const detail = await getAdminListingDetail(id);
      setSelectedListingDetail(detail);
    } catch (err) {
      toast.error(err.message || "Detaylar yüklenemedi.");
    } finally {
      setDetailLoading(false);
    }
  }

  const filteredListings = listings.filter(l => 
    l.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.tutorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabItems = [
    { id: "PendingApproval", label: "Onay Bekleyenler", color: "border-amber-500 text-amber-500" },
    { id: "Active", label: "Yayında (Onaylı)", color: "border-emerald-500 text-emerald-500" },
    { id: "Passive", label: "Pasif", color: "border-slate-500 text-slate-500" },
    { id: "Rejected", label: "Reddedilenler", color: "border-red-500 text-red-500" },
    { id: "All", label: "Tümü", color: "border-blue-500 text-blue-500" }
  ];

  function getStatusBadge(status) {
    switch (status) {
      case "PendingApproval":
        return <Badge className="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-none">Onay Bekliyor</Badge>;
      case "Active":
        return <Badge className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none">Yayında</Badge>;
      case "Passive":
        return <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-none">Pasif</Badge>;
      case "Rejected":
        return <Badge className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-none">Reddedildi</Badge>;
      default:
        return <Badge className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-none">{status}</Badge>;
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">İlan Yönetimi</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Sistemdeki tüm öğretmen ilanlarını denetleyin, onaylayın veya tamamen silin.</p>
        </div>
        <div className="flex bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm w-full md:w-auto transition-colors">
           <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="İlan adı veya öğretmen ara..." 
                className="w-full h-11 bg-transparent border-none pl-11 pr-4 text-sm font-medium outline-none dark:text-slate-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
        </div>
      </div>

      {/* Modern Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-px">
        {tabItems.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 text-sm font-black transition-all border-b-2 -mb-px outline-none ${
              activeTab === tab.id
                ? `${tab.color} font-black`
                : "border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
           <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
           <p className="text-slate-400 font-bold animate-pulse">İlan listesi yükleniyor...</p>
        </div>
      ) : filteredListings.length === 0 ? (
        <Card className="border-none shadow-sm bg-white dark:bg-[#1e293b] rounded-[2.5rem] py-20 transition-colors">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
               <AlertCircle className="h-12 w-12 text-slate-400" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">İlan Bulunamadı</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm font-medium">Bu kategoride veya arama kriterinde herhangi bir ilan bulunmuyor.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredListings.map((listing) => (
            <Card key={listing.id} className="border-none shadow-sm bg-white dark:bg-[#1e293b] rounded-[2rem] overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all duration-500 border border-slate-100/50 dark:border-slate-800/50">
              <div className="flex flex-col lg:flex-row">
                <div className="p-8 flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <Badge className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-none px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                       {listing.category}
                    </Badge>
                    {getStatusBadge(listing.status)}
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
                  <a 
                    href={`/tutors/${listing.id}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full"
                  >
                    <Button 
                      variant="outline" 
                      className="w-full h-12 rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-bold text-sm shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all dark:text-slate-200"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" /> Detayları Gör
                    </Button>
                  </a>
                  
                  {listing.status === "PendingApproval" && (
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        className="h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black shadow-lg shadow-emerald-200"
                        onClick={() => handleApprove(listing.id, true)}
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="destructive"
                        className="h-12 rounded-xl font-black shadow-lg shadow-red-200"
                        onClick={() => handleApprove(listing.id, false)}
                      >
                        <ThumbsDown className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  <Button
                    onClick={() => handleDelete(listing.id, listing.title)}
                    className="w-full h-12 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-bold transition-all border border-red-500/20"
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> İlanı Sil
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* İlan Detay Modalı */}
      {selectedListingDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border-none shadow-2xl rounded-3xl relative">
            <button 
              onClick={() => setSelectedListingDetail(null)}
              className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <XCircle className="w-6 h-6 text-slate-500" />
            </button>
            <CardContent className="p-8">
              <div className="mb-6">
                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-none mb-3 px-3 py-1 text-xs">
                  {selectedListingDetail.category}
                </Badge>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{selectedListingDetail.title}</h2>
                <div className="flex items-center gap-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1"><User className="w-4 h-4"/> {selectedListingDetail.tutorName || selectedListingDetail.teacherName}</span>
                  <span className="flex items-center gap-1"><Tag className="w-4 h-4"/> ₺{selectedListingDetail.price} / saat</span>
                </div>
              </div>

              <div className="prose dark:prose-invert max-w-none">
                <h4 className="text-lg font-bold mb-2">İlan Açıklaması</h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                  {selectedListingDetail.description}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                {selectedListingDetail.status === 'PendingApproval' && (
                  <>
                    <Button 
                      className="flex-1 h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black"
                      onClick={() => handleApprove(selectedListingDetail.id, true)}
                    >
                      <ThumbsUp className="w-4 h-4 mr-2" /> Onayla
                    </Button>
                    <Button 
                      variant="destructive"
                      className="flex-1 h-12 rounded-xl font-black"
                      onClick={() => handleApprove(selectedListingDetail.id, false)}
                    >
                      <ThumbsDown className="w-4 h-4 mr-2" /> Reddet
                    </Button>
                  </>
                )}
                
                <Button
                  onClick={() => handleDelete(selectedListingDetail.id, selectedListingDetail.title)}
                  className="h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black flex-1"
                >
                  <Trash2 className="w-4 h-4 mr-2" /> İlanı Tamamen Sil
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Silme Onay Modalı */}
      {deleteConfirmListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-md bg-white dark:bg-[#1e293b] border-none shadow-2xl rounded-3xl relative overflow-hidden">
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
                  <Trash2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">İlanı Silmek İstediğinize Emin misiniz?</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm leading-relaxed">
                  <span className="font-bold text-slate-700 dark:text-slate-200">"{deleteConfirmListing.title}"</span> başlıklı ilan kalıcı olarak silinecektir. Bu işlem geri alınamaz!
                </p>
              </div>
              <div className="flex gap-3 mt-8">
                <Button
                  variant="outline"
                  className="flex-1 h-12 rounded-xl border-slate-200 dark:border-slate-700 font-bold dark:text-slate-200"
                  onClick={() => setDeleteConfirmListing(null)}
                  disabled={deleteLoading}
                >
                  Vazgeç
                </Button>
                <Button
                  className="flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black"
                  onClick={handleDeleteSubmit}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
                  Evet, Sil
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Red Gerekçesi Modalı */}
      {rejectConfirmListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-md bg-white dark:bg-[#1e293b] border-none shadow-2xl rounded-3xl relative overflow-hidden">
            <CardContent className="p-8">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-50 dark:bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">İlanı Reddet</h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Lütfen eğitmenin görebileceği bir gerekçe yazın.</p>
                  </div>
                </div>

                <div className="mt-4">
                  <textarea
                    rows={4}
                    className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-transparent text-sm font-medium outline-none focus:border-blue-500 dark:focus:border-blue-400 dark:text-slate-200 resize-none transition-colors"
                    placeholder="Red gerekçesini buraya yazın..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  className="flex-1 h-12 rounded-xl border-slate-200 dark:border-slate-700 font-bold dark:text-slate-200"
                  onClick={() => setRejectConfirmListing(null)}
                  disabled={actionLoading}
                >
                  Vazgeç
                </Button>
                <Button
                  className="flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black"
                  onClick={handleRejectSubmit}
                  disabled={actionLoading}
                >
                  {actionLoading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
                  Reddet
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

