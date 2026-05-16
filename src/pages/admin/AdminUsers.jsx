import { useState, useEffect } from "react";
import { getAdminUsers, updateUserStatus, makeAdmin } from "@/services/adminService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { 
  Search, 
  UserCheck, 
  UserX, 
  Loader2, 
  ShieldAlert, 
  MoreVertical, 
  Mail, 
  Calendar,
  Filter,
  ArrowUpDown
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import toast from "react-hot-toast";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    try {
      const data = await getAdminUsers();
      setUsers(data.items || []);
    } catch (err) {
      toast.error("Kullanıcılar yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }

  async function toggleStatus(userId, currentStatus) {
    try {
      await updateUserStatus(userId, !currentStatus);
      setUsers(users.map(u => u.id === userId ? { ...u, isActive: !currentStatus } : u));
      toast.success(currentStatus ? "Kullanıcı pasife alındı." : "Kullanıcı aktif edildi.");
    } catch (err) {
      toast.error("Durum güncellenirken hata oluştu.");
    }
  }

  async function handleMakeAdmin(userId, name) {
    if (!window.confirm(`${name} isimli kullanıcıyı yönetici yapmak istediğinize emin misiniz?`)) return;
    try {
      await makeAdmin(userId);
      setUsers(users.map(u => u.id === userId ? { ...u, role: 'Admin' } : u));
      toast.success("Kullanıcı artık bir yönetici!");
    } catch (err) {
      toast.error("İşlem başarısız oldu.");
    }
  }

  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Kullanıcı Yönetimi</h1>
          <p className="text-slate-500 font-medium mt-1">Platformdaki tüm öğrenci, eğitmen ve yönetici hesaplarını denetleyin.</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm w-full md:w-auto">
           <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="İsim veya e-posta ile ara..." 
                className="w-full h-11 bg-transparent border-none pl-11 pr-4 text-sm font-medium outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
           <Button variant="ghost" className="h-11 rounded-xl text-slate-500 font-bold">
              <Filter className="w-4 h-4 mr-2" /> Filtrele
           </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm bg-white rounded-[2.5rem] overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
              <p className="text-slate-400 font-bold animate-pulse">Kullanıcılar listeleniyor...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-left">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Kullanıcı Bilgisi</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Rol</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Kayıt Tarihi</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Durum</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Eylemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xs group-hover:bg-blue-600 group-hover:text-white transition-colors">
                               {user.fullName.charAt(0)}
                            </div>
                            <div>
                               <p className="text-sm font-bold text-slate-900 leading-none mb-1">{user.fullName}</p>
                               <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
                                  <Mail size={12} /> {user.email}
                               </p>
                            </div>
                         </div>
                      </td>
                      <td className="px-8 py-5">
                        <Badge className={`border-none px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          user.role === 'Admin' || user.role === 'SuperAdmin' 
                            ? 'bg-purple-50 text-purple-600' 
                            : user.role === 'Tutor' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-500'
                        }`}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-8 py-5">
                         <span className="text-xs font-bold text-slate-500 flex items-center gap-2">
                            <Calendar size={14} className="text-slate-300" />
                            {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                         </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                           <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                           <span className={`text-xs font-black uppercase tracking-tighter ${user.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                             {user.isActive ? 'Aktif' : 'Pasif'}
                           </span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                           {user.role !== 'Admin' && user.role !== 'SuperAdmin' && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-9 rounded-xl border-slate-200 text-slate-600 font-bold hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200"
                                onClick={() => handleMakeAdmin(user.id, user.fullName)}
                              >
                                 <ShieldAlert className="w-4 h-4 mr-2" /> Yönetici Yap
                              </Button>
                           )}
                           <Button 
                             variant="ghost" 
                             size="sm"
                             onClick={() => toggleStatus(user.id, user.isActive)}
                             className={`h-9 rounded-xl font-bold ${user.isActive ? 'text-red-500 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                           >
                             {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                           </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

