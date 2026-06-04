import { useState, useEffect } from "react";
import { 
  getAdminDashboard, 
  getAdminMetrics, 
  getRecentActivities, 
  exportDashboardReport 
} from "@/services/adminService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { 
  Users, 
  BookOpen, 
  ShieldCheck, 
  Clock, 
  MessageSquare, 
  Star, 
  TrendingUp, 
  TrendingDown,
  Activity,
  ArrowUpRight,
  Search,
  Download
} from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [dashData, metricsData, activitiesData] = await Promise.all([
          getAdminDashboard(),
          getAdminMetrics(),
          getRecentActivities()
        ]);
        if (dashData) setStats(dashData);
        if (metricsData) setMetrics(metricsData);
        if (activitiesData) setActivities(activitiesData || []);
      } catch (err) {
        console.error("Dashboard yükleme hatası:", err);
        toast.error("Veriler yüklenirken bir sorun oluştu.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleExport = async () => {
    try {
      toast.promise(exportDashboardReport(), {
        loading: 'Rapor hazırlanıyor...',
        success: 'Rapor başarıyla indirildi.',
        error: 'Rapor indirilirken bir hata oluştu.'
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <Skeleton height="60px" width="300px" borderRadius="16px" />
        <div className="grid gap-6 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} height="140px" borderRadius="24px" />)}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton height="400px" borderRadius="32px" />
          <Skeleton height="400px" borderRadius="32px" />
        </div>
      </div>
    );
  }

  const mainStats = [
    { title: "Öğretmen Sayısı", value: stats?.totalTutors || 0, trend: "+12.5%", icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "Toplam Öğrenci", value: stats?.totalStudents || 0, trend: "+8.2%", icon: BookOpen, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Eğitmen Onayı", value: stats?.pendingListings || 0, trend: "Acil", icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
    { title: "İlan Sayısı", value: stats?.activeListings || 0, trend: "+2.4%", icon: Activity, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Yönetim Paneli</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Hoş geldiniz, platformun genel performansını buradan takip edebilirsiniz.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="rounded-xl border-slate-200 dark:border-slate-700 dark:text-slate-200 font-bold flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800"
            onClick={handleExport}
          >
            <Download size={18} /> Rapor İndir
          </Button>
          <Button className="rounded-xl bg-slate-900 dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-700 text-white font-bold flex items-center gap-2 px-6">
            <Activity size={18} /> Canlı İzle
          </Button>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {mainStats.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm bg-white dark:bg-[#1e293b] rounded-3xl overflow-hidden hover:shadow-xl dark:hover:shadow-none transition-all border border-slate-100/50 dark:border-slate-800/50">
            <CardContent className="p-7">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} dark:bg-opacity-10`}>
                  <stat.icon size={24} />
                </div>
                <Badge className={`${stat.trend.includes('+') ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400'} border-none font-bold text-[10px]`}>
                  {stat.trend}
                </Badge>
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">{stat.value}</div>
              <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{stat.title}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Activity Chart */}
        <Card className="lg:col-span-2 border-none shadow-sm bg-white dark:bg-[#1e293b] rounded-[2.5rem] overflow-hidden transition-colors">
          <CardHeader className="p-8 border-b border-slate-50 dark:border-slate-800 flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-black text-slate-900 dark:text-white">Platform Trafiği</CardTitle>
            <div className="flex gap-2">
              {['Haftalık', 'Aylık'].map(t => (
                <button key={t} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${t === 'Aylık' ? 'bg-slate-900 dark:bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>{t}</button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="p-8">
              <div className="h-64 w-full flex items-end gap-1.5 px-2">
                {(stats?.registrationsLast30Days || []).map((item, i) => {
                  const val = typeof item === 'object' ? item.count : item;
                  const max = Math.max(...(stats?.registrationsLast30Days?.map(d => d.count) || [100]));
                  const height = (val / (max || 1)) * 100;
                  
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="relative w-full">
                        <div 
                          className={`w-full rounded-t-lg transition-all duration-500 group-hover:bg-blue-600 ${i % 2 === 0 ? 'bg-slate-100 dark:bg-slate-800' : 'bg-blue-500'}`} 
                          style={{ height: `${Math.max(height, 5)}%` }}
                        ></div>
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-blue-600 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                          {val} Kayıt
                        </div>
                      </div>
                      <span className="text-[8px] font-bold text-slate-300 dark:text-slate-600 hidden md:block">
                        {typeof item === 'object' ? item.date.split('-')[2] : i+1}
                      </span>
                    </div>
                  );
                })}
              </div>
          </CardContent>
        </Card>

        {/* Quick Stats Sidebar */}
        <Card className="border-none shadow-sm bg-slate-900 rounded-[2.5rem] overflow-hidden text-white">
           <CardHeader className="p-8 border-b border-white/10">
              <CardTitle className="text-xl font-black">Hızlı Özet</CardTitle>
           </CardHeader>
           <CardContent className="p-8 space-y-8">
              <div className="space-y-4">
                 <div className="flex justify-between items-end">
                    <span className="text-sm font-bold text-slate-400">Öğrenci Doluluk</span>
                    <span className="text-xl font-black">%{metrics?.studentOccupancyRate || 0}</span>
                 </div>
                 <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-1000"
                      style={{ width: `${metrics?.studentOccupancyRate || 0}%` }}
                    ></div>
                 </div>
              </div>
              
              <div className="space-y-4">
                 <div className="flex justify-between items-end">
                    <span className="text-sm font-bold text-slate-400">İlan Onay Hızı</span>
                    <span className="text-xl font-black">{metrics?.avgApprovalHours || 0}sa</span>
                 </div>
                 <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000"
                      style={{ width: `${Math.min((metrics?.avgApprovalHours || 1) * 10, 100)}%` }}
                    ></div>
                 </div>
              </div>

              <div className="pt-6 border-t border-white/10">
                 <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Son İşlemler</h4>
                 <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {activities.length > 0 ? activities.map((act, i) => (
                      <div key={i} className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs">
                           {act.type === 'NewUser' ? '👤' : act.type === 'NewListing' ? '📝' : act.type === 'NewReport' ? '🚩' : '⭐'}
                         </div>
                         <div>
                            <p className="text-xs font-bold line-clamp-1">{act.message}</p>
                            <p className="text-[10px] text-slate-500">{new Date(act.createdAt).toLocaleString('tr-TR')}</p>
                         </div>
                      </div>
                    )) : (
                      <p className="text-xs text-slate-500 italic">Henüz aktivite bulunmuyor.</p>
                    )}
                 </div>
              </div>
           </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Badge({ children, className }) {
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${className}`}>
      {children}
    </span>
  );
}

