import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Send, Paperclip } from "lucide-react";

export default function StudentMessages() {
  return (
    <div className="bg-background rounded-xl border flex h-[calc(100vh-140px)] max-w-6xl mx-auto overflow-hidden">
      
      {/* Sidebar - Conversations list */}
      <div className="w-80 border-r flex flex-col hidden md:flex">
        <div className="p-4 border-b">
          <Input placeholder="Mesajlarda ara..." />
        </div>
        <div className="flex-1 overflow-y-auto">
          {/* Active conversation */}
          <div className="flex items-center gap-3 p-4 bg-muted/50 border-l-4 border-primary cursor-pointer">
            <img src="https://i.pravatar.cc/150?u=sarah" alt="Sarah" className="w-12 h-12 rounded-full object-cover" />
            <div className="flex-1 overflow-hidden">
              <div className="flex justify-between items-center mb-1">
                <h4 className="font-semibold text-sm">Sarah Jenkins</h4>
                <span className="text-xs text-muted-foreground">10:42</span>
              </div>
              <p className="text-xs text-muted-foreground truncate">Evet, bir sonraki ders telaffuz üzerine yoğunlaşabiliriz!</p>
            </div>
          </div>
          
          {/* Unread conversation */}
          <div className="flex items-center gap-3 p-4 hover:bg-muted/30 cursor-pointer border-l-4 border-transparent">
            <img src="https://i.pravatar.cc/150?u=carlos" alt="Carlos" className="w-12 h-12 rounded-full object-cover" />
            <div className="flex-1 overflow-hidden">
              <div className="flex justify-between items-center mb-1">
                <h4 className="font-semibold text-sm">Carlos Mendoza</h4>
                <span className="text-xs text-muted-foreground">Dün</span>
              </div>
              <p className="text-xs font-semibold truncate text-foreground">İşte ev ödevi materyalleri.</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0"></div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="h-16 border-b flex items-center px-6 justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img src="https://i.pravatar.cc/150?u=sarah" alt="Sarah" className="w-10 h-10 rounded-full object-cover" />
            <div>
              <h3 className="font-semibold">Sarah Jenkins</h3>
              <p className="text-xs text-green-500">Çevrimiçi</p>
            </div>
          </div>
          <Button variant="outline" size="sm">Ders Ayırt</Button>
        </div>

        {/* Messages list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-muted/10">
          
          {/* Tutor message */}
          <div className="flex items-start gap-3">
            <img src="https://i.pravatar.cc/150?u=sarah" alt="Sarah" className="w-8 h-8 rounded-full object-cover" />
            <div>
              <div className="bg-card border p-3 rounded-2xl rounded-tl-none shadow-sm max-w-sm">
                <p className="text-sm">Merhaba! Hafta sonun nasıl geçti? Bugünkü derse hazır mısın?</p>
              </div>
              <span className="text-xs text-muted-foreground mt-1 ml-1">10:30</span>
            </div>
          </div>

          {/* Student message */}
          <div className="flex items-start gap-3 flex-row-reverse">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
              BEN
            </div>
            <div className="flex flex-col items-end">
              <div className="bg-primary text-primary-foreground p-3 rounded-2xl rounded-tr-none shadow-sm max-w-sm">
                <p className="text-sm">Merhaba Sarah! Evet, gönderdiğin makaleyi okudum. Üzerine konuşmaya hazırım.</p>
              </div>
              <span className="text-xs text-muted-foreground mt-1 mr-1">10:40</span>
            </div>
          </div>

          {/* Tutor message */}
          <div className="flex items-start gap-3">
            <img src="https://i.pravatar.cc/150?u=sarah" alt="Sarah" className="w-8 h-8 rounded-full object-cover" />
            <div>
              <div className="bg-card border p-3 rounded-2xl rounded-tl-none shadow-sm max-w-sm">
                <p className="text-sm">Harika! Evet, bir sonraki ders telaffuz üzerine yoğunlaşabiliriz!</p>
              </div>
              <span className="text-xs text-muted-foreground mt-1 ml-1">10:42</span>
            </div>
          </div>
          
        </div>

        {/* Input Area */}
        <div className="p-4 border-t bg-background shrink-0 flex items-center gap-2">
          <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground">
            <Paperclip className="w-5 h-5" />
          </Button>
          <Input placeholder="Mesajınızı yazın..." className="flex-1 h-10 rounded-full bg-muted/50 border-transparent focus-visible:ring-transparent focus-visible:bg-background focus-visible:border-primary" />
          <Button size="icon" className="rounded-full shrink-0 h-10 w-10">
            <Send className="w-4 h-4 ml-[-2px]" />
          </Button>
        </div>
      </div>
    </div>
  );
}
