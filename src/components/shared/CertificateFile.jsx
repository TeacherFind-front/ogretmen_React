import React from "react";
import { FileText, Image as ImageIcon } from "lucide-react";
import { resolveMediaUrl } from "@/utils/helpers";

/**
 * CertificateFile - Eğitmen sertifika dosyalarını görüntülemek için kullanılan bileşen.
 * Eğer bir dosya URL'i varsa, PDF veya resim formatına göre uygun bir önizleme sunar ve
 * tıklandığında dosyayı yeni sekmede açar. Dosya yoksa "Belge Yok" uyarısı gösterir.
 * 
 * @param {Object} props - Bileşen girdileri
 * @param {string} props.fileUrl - Görüntülenecek sertifikanın dosya yolu/URL'si
 * @param {string} props.title - Görsel alt etiketi (alt) için kullanılacak sertifika başlığı
 */
export default function CertificateFile({ fileUrl, title }) {
  // Eğer dosya URL'i tanımsız veya boşsa, "Belge Yok" kutusunu göster
  if (!fileUrl) {
    return (
      <div 
        className="w-[60px] h-[60px] rounded-xl flex flex-col items-center justify-center bg-[var(--card-bg)] border border-[var(--card-border)] shrink-0"
        title="Belge yok"
      >
        <span className="text-[10px] font-bold text-[var(--text-muted)] text-center leading-tight">Belge Yok</span>
      </div>
    );
  }

  // Medya URL'ini backend veya CDN yapısına göre çözümler (tam URL haline getirir)
  const resolvedUrl = resolveMediaUrl(fileUrl);
  // Dosyanın PDF olup olmadığını kontrol eder (dosya uzantısına bakarak)
  const isPdf = resolvedUrl.toLowerCase().endsWith(".pdf");

  return (
    <a
      href={resolvedUrl}
      target="_blank"
      rel="noreferrer"
      title="Belgeyi görüntüle"
      className="w-[60px] h-[60px] rounded-xl overflow-hidden relative cursor-pointer border border-[var(--card-border)] shrink-0 block group"
    >
      {isPdf ? (
        /* PDF dosyaları için ikon ve metin içeren gri bir kutu gösterir */
        <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--card-bg)] group-hover:bg-[var(--section-alt)] transition-colors">
          <FileText className="w-6 h-6 text-[var(--text-muted)] mb-1" />
          <span className="text-[9px] font-bold text-[var(--text-muted)]">PDF</span>
        </div>
      ) : (
        /* Resim dosyaları için görsel önizleme ve üzerine gelindiğinde (hover) "Görüntüle" katmanı gösterir */
        <>
          <img
            src={resolvedUrl}
            alt={title || "Sertifika"}
            className="w-full h-full object-cover"
            // Resim yüklenirken hata oluşursa (örneğin dosya bulunamazsa) yedek bir görsel (fallback avatar) yükler
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "https://ui-avatars.com/api/?name=Bozuk&background=dcfce7&color=16a34a";
            }}
          />
          {/* Üzerine gelindiğinde yeşil şeffaf bir katman açılır */}
          <div className="absolute inset-0 bg-[#16a34a]/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <span className="text-[10px] font-bold text-white">Görüntüle</span>
          </div>
        </>
      )}
    </a>
  );
}

