import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { 
  Settings, 
  Globe, 
  CreditCard, 
  ShieldCheck, 
  Save, 
  Bell, 
  Lock,
  Percent,
  HardDrive,
  Loader2
} from "lucide-react";
import { getAdminSettings, updateAdminSettings } from "@/services/adminService";
import toast from "react-hot-toast";

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [settings, setSettings] = useState({
    siteTitle: "",
    contactEmail: "",
    maintenanceMode: false,
    commissionRate: 0,
    minWithdrawal: 0,
    googleAnalyticsId: "",
    siteDescription: "",
    siteKeywords: "",
    facebookLink: "",
    instagramLink: "",
    twitterLink: "",
    linkedinLink: "",
    youtubeLink: ""
  });

  React.useEffect(() => {
    async function load() {
      try {
        const data = await getAdminSettings();
        const socialLinks = data.socialLinks || {};
        setSettings({
          ...data,
          facebookLink: socialLinks.facebook || "",
          instagramLink: socialLinks.instagram || "",
          twitterLink: socialLinks.twitter || "",
          linkedinLink: socialLinks.linkedin || "",
          youtubeLink: socialLinks.youtube || ""
        });
      } catch (err) {
        toast.error("Ayarlar yüklenemedi.");
      } finally {
        setInitialLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateAdminSettings(settings);
      toast.success("Ayarlar başarıyla güncellendi.");
    } catch (err) {
      toast.error("Ayarlar kaydedilemedi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Sistem Ayarları Yükleniyor...</p>
      </div>
    );
  }

  const tabs = [
    { id: "general", label: "Genel Ayarlar", icon: Globe },
    { id: "financial", label: "Finansal", icon: CreditCard },
    { id: "security", label: "Güvenlik & SEO", icon: ShieldCheck },
    { id: "notifications", label: "Bildirimler", icon: Bell },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Sistem Ayarları</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Platformun global parametrelerini ve güvenlik ayarlarını yönetin.</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={loading}
          className="h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-lg shadow-blue-200 flex items-center gap-2 transition-all active:scale-95"
        >
          {loading ? "Kaydediliyor..." : <><Save size={18} /> Tümünü Kaydet</>}
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-72 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${
                activeTab === tab.id 
                  ? "bg-slate-900 dark:bg-blue-600 text-white shadow-xl shadow-slate-200 dark:shadow-none" 
                  : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700"
              }`}
            >
              <tab.icon size={20} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1">
          {activeTab === "general" && (
            <Card className="border-none shadow-sm bg-white dark:bg-[#1e293b] rounded-[2.5rem] overflow-hidden border border-slate-100/50 dark:border-slate-800/50 transition-colors">
               <CardHeader className="p-8 border-b border-slate-50 dark:border-slate-800">
                  <CardTitle className="text-xl font-black flex items-center gap-3 dark:text-white">
                     <Settings className="text-blue-600 dark:text-blue-400" /> Site Bilgileri
                  </CardTitle>
               </CardHeader>
               <CardContent className="p-8 space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Site Başlığı</label>
                        <Input 
                          value={settings.siteTitle} 
                          onChange={(e) => setSettings({...settings, siteTitle: e.target.value})}
                          className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 font-bold focus:bg-white dark:focus:bg-slate-900 dark:text-slate-200"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">İletişim E-postası</label>
                        <Input 
                          value={settings.contactEmail} 
                          onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
                          className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 font-bold focus:bg-white dark:focus:bg-slate-900 dark:text-slate-200"
                        />
                     </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Instagram</label>
                        <Input 
                          value={settings.instagramLink} 
                          onChange={(e) => setSettings({...settings, instagramLink: e.target.value})}
                          className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 font-bold focus:bg-white dark:focus:bg-slate-900 dark:text-slate-200"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Facebook</label>
                        <Input 
                          value={settings.facebookLink} 
                          onChange={(e) => setSettings({...settings, facebookLink: e.target.value})}
                          className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 font-bold focus:bg-white dark:focus:bg-slate-900 dark:text-slate-200"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Twitter</label>
                        <Input 
                          value={settings.twitterLink} 
                          onChange={(e) => setSettings({...settings, twitterLink: e.target.value})}
                          className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 font-bold focus:bg-white dark:focus:bg-slate-900 dark:text-slate-200"
                        />
                     </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">LinkedIn</label>
                        <Input 
                          value={settings.linkedinLink} 
                          onChange={(e) => setSettings({...settings, linkedinLink: e.target.value})}
                          className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 font-bold focus:bg-white dark:focus:bg-slate-900 dark:text-slate-200"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Youtube</label>
                        <Input 
                          value={settings.youtubeLink} 
                          onChange={(e) => setSettings({...settings, youtubeLink: e.target.value})}
                          className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 font-bold focus:bg-white dark:focus:bg-slate-900 dark:text-slate-200"
                        />
                     </div>
                  </div>

                  <div className="p-6 bg-blue-50 dark:bg-blue-500/10 rounded-2xl border border-blue-100 dark:border-blue-900/50 flex items-center justify-between">
                     <div>
                        <h4 className="text-blue-900 dark:text-blue-200 font-black text-sm">Bakım Modu</h4>
                        <p className="text-blue-600 dark:text-blue-400 text-xs font-bold mt-1">Aktif edilirse site ziyaretçilere kapatılır.</p>
                     </div>
                     <button 
                        onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})}
                        className={`w-14 h-8 rounded-full p-1 transition-all ${settings.maintenanceMode ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                      >
                        <div className={`w-6 h-6 bg-white rounded-full transition-all ${settings.maintenanceMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                     </button>
                  </div>
               </CardContent>
            </Card>
          )}

          {activeTab === "financial" && (
             <Card className="border-none shadow-sm bg-white dark:bg-[#1e293b] rounded-[2.5rem] overflow-hidden border border-slate-100/50 dark:border-slate-800/50 transition-colors">
                <CardHeader className="p-8 border-b border-slate-50 dark:border-slate-800">
                   <CardTitle className="text-xl font-black flex items-center gap-3 dark:text-white">
                      <Percent className="text-emerald-600 dark:text-emerald-400" /> Finansal Parametreler
                   </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                   <div className="grid md:grid-cols-2 gap-8">
                      <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-[2rem] space-y-4">
                         <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center justify-center"><Percent size={16} /></div>
                            <span className="text-sm font-black text-slate-900 dark:text-white">Komisyon Oranı (%)</span>
                         </div>
                         <Input 
                           type="number"
                           value={settings.commissionRate} 
                           onChange={(e) => setSettings({...settings, commissionRate: e.target.value})}
                           className="h-12 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-black text-xl dark:text-white"
                         />
                         <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Her başarılı ödemeden alınacak pay.</p>
                      </div>

                      <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-[2rem] space-y-4">
                         <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center"><HardDrive size={16} /></div>
                            <span className="text-sm font-black text-slate-900 dark:text-white">Min. Çekim Tutarı (₺)</span>
                         </div>
                         <Input 
                           type="number"
                           value={settings.minWithdrawal} 
                           onChange={(e) => setSettings({...settings, minWithdrawal: e.target.value})}
                           className="h-12 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-black text-xl dark:text-white"
                         />
                         <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Eğitmenlerin talep edebileceği alt limit.</p>
                      </div>
                   </div>
                </CardContent>
             </Card>
          )}

          {activeTab === "security" && (
             <Card className="border-none shadow-sm bg-white dark:bg-[#1e293b] rounded-[2.5rem] overflow-hidden border border-slate-100/50 dark:border-slate-800/50 transition-colors">
                <CardHeader className="p-8 border-b border-slate-50 dark:border-slate-800">
                   <CardTitle className="text-xl font-black flex items-center gap-3 dark:text-white">
                      <Lock className="text-purple-600 dark:text-purple-400" /> Güvenlik & SEO
                   </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                   <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Google Analytics ID</label>
                        <Input 
                          value={settings.googleAnalyticsId} 
                          onChange={(e) => setSettings({...settings, googleAnalyticsId: e.target.value})}
                          className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 font-mono dark:text-slate-200"
                          placeholder="UA-XXXXXX-X"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">SEO Anahtar Kelimeler</label>
                        <Input 
                          value={settings.siteKeywords} 
                          onChange={(e) => setSettings({...settings, siteKeywords: e.target.value})}
                          className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 dark:text-slate-200"
                          placeholder="özel hoca, matematik dersi, online eğitim"
                        />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Site Açıklaması (Meta Description)</label>
                      <textarea 
                        value={settings.siteDescription} 
                        onChange={(e) => setSettings({...settings, siteDescription: e.target.value})}
                        className="w-full h-32 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4 text-sm font-medium outline-none focus:border-purple-300 dark:focus:border-purple-600 transition-all dark:text-slate-200"
                        placeholder="Türkiye'nin en büyük özel ders platformu..."
                      />
                   </div>
                   <div className="p-6 bg-purple-50 dark:bg-purple-500/10 rounded-2xl border border-purple-100 dark:border-purple-900/50">
                      <h4 className="text-purple-900 dark:text-purple-200 font-black text-sm mb-2 flex items-center gap-2">
                         <ShieldCheck size={18} /> Güvenlik Katmanı
                      </h4>
                      <p className="text-purple-600 dark:text-purple-400 text-xs font-bold leading-relaxed">
                         Platformda gerçekleşen tüm veri trafiği SSL sertifikası ile korunmaktadır. SEO ve Analytics ayarları sitenizin görünürlüğünü doğrudan etkiler.
                      </p>
                   </div>
                </CardContent>
             </Card>
          )}
        </div>
      </div>
    </div>
  );
}
