import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  Zap,
  Plus,
  Search,
  Filter,
  Edit,
  Copy,
  Power,
  CheckCircle2,
  XCircle,
  Package,
  BadgePercent,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  X,
  PlusCircle,
  Trash2,
  Tag,
  DollarSign,
} from "lucide-react";
import toast from "react-hot-toast";
import adminDopingPackageService from "@/services/adminDopingPackageService";

// Doping Türü Etiketleri
const FEATURE_NAMES = {
  1: "Anasayfa Öne Çıkan Eğitmen",
  2: "Anasayfa Ders İlanları",
  3: "Kategori Listesi",
  4: "Sosyal Medya Dopingi",
  5: "Ögretmenler Arama Listesi",
  6: "Kalın Yazı & Renkli Çerçeve",
};

// Entitlement Türleri (1: TimeBased, 2: QuantityBased, 3: ListingLifetime)
const ENTITLEMENT_TYPES = [
  { value: "TimeBased", label: "Zaman Bazlı (Gün)" },
  { value: "QuantityBased", label: "Adet Bazlı (Kullanım)" },
  { value: "ListingLifetime", label: "İlan Yayın Süresince" },
];

export default function AdminDopingPackages() {
  const [packages, setPackages] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtreler
  const [filters, setFilters] = useState({
    search: "",
    isActive: "",
    packageType: "",
    page: 1,
    pageSize: 10,
  });

  // Modal State'leri
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null); // null = yeni oluştur
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [targetDuplicatePkg, setTargetDuplicatePkg] = useState(null);
  const [statusConfirmModalOpen, setStatusConfirmModalOpen] = useState(false);
  const [targetStatusPkg, setTargetStatusPkg] = useState(null);

  const [featuresList, setFeaturesList] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadPackages();
  }, [filters]);

  useEffect(() => {
    loadFeatures();
  }, []);

  const loadPackages = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminDopingPackageService.getPackages(filters);
      if (data) {
        setPackages(data.items || data || []);
        setTotalCount(data.totalCount || (data.items ? data.items.length : 0));
      }
    } catch (err) {
      console.error("Doping paketleri yüklenemedi:", err);
      setError(err.message || "Doping paketleri yüklenirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const loadFeatures = async () => {
    try {
      const data = await adminDopingPackageService.getFeatures();
      if (data && Array.isArray(data)) {
        setFeaturesList(data);
      }
    } catch (e) {
      console.warn("Features çağrılamadı, varsayılan liste kullanılacak:", e);
    }
  };

  // Para Biçimlendirme (formatCurrency)
  const formatCurrency = (val, currency = "TRY") => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: currency || "TRY",
    }).format(Number(val || 0));
  };

  // Tarih Biçimlendirme
  const formatDate = (val) => {
    if (!val) return "Süresiz";
    try {
      return new Intl.DateTimeFormat("tr-TR", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(val));
    } catch (e) {
      return val;
    }
  };

  // Modal Açma Yardımcıları
  const handleCreateNew = () => {
    setEditingPackage(null);
    setFormModalOpen(true);
  };

  const handleEdit = (pkg) => {
    setEditingPackage(pkg);
    setFormModalOpen(true);
  };

  const handleOpenDuplicate = (pkg) => {
    setTargetDuplicatePkg(pkg);
    setDuplicateModalOpen(true);
  };

  const handleOpenStatusConfirm = (pkg) => {
    setTargetStatusPkg(pkg);
    setStatusConfirmModalOpen(true);
  };

  // Aktif/Pasif Durum Değiştirme Submit
  const handleToggleStatus = async () => {
    if (!targetStatusPkg) return;
    setActionLoading(true);
    try {
      await adminDopingPackageService.updatePackageStatus(
        targetStatusPkg.id,
        !targetStatusPkg.isActive
      );
      toast.success(
        `Paket ${!targetStatusPkg.isActive ? "aktifleştirildi" : "pasifleştirildi"}.`
      );
      setStatusConfirmModalOpen(false);
      setTargetStatusPkg(null);
      loadPackages();
    } catch (err) {
      toast.error(err.message || "Durum güncellenemedi.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <PageWrapper>
      {/* ── Page Header ── */}
      <HeaderRow>
        <div>
          <PageTitle>
            <Zap className="text-amber-500" size={28} />
            Doping Paket Yönetimi
          </PageTitle>
          <PageSubtitle>
            Eğitmenler ve İlanlar için Doping Paketleri, Fiyatlandırma ve İndirim Tanımlamaları
          </PageSubtitle>
        </div>
        <CreateBtn onClick={handleCreateNew}>
          <Plus size={18} /> Yeni Paket Oluştur
        </CreateBtn>
      </HeaderRow>

      {/* ── Filters Bar ── */}
      <FilterCard>
        <SearchInputWrap>
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            placeholder="Paket adı veya kodu ara..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
          />
        </SearchInputWrap>

        <FilterGroup>
          <select
            value={filters.isActive}
            onChange={(e) => setFilters({ ...filters, isActive: e.target.value, page: 1 })}
          >
            <option value="">Tüm Durumlar</option>
            <option value="true">Aktif</option>
            <option value="false">Pasif</option>
          </select>

          <select
            value={filters.packageType}
            onChange={(e) => setFilters({ ...filters, packageType: e.target.value, page: 1 })}
          >
            <option value="">Tüm Türler</option>
            <option value="Single">Tekli Paket</option>
            <option value="Bundle">Toplu Paket (Bundle)</option>
          </select>
        </FilterGroup>
      </FilterCard>

      {/* ── Table List ── */}
      {loading ? (
        <LoadingState>
          <RefreshCw className="animate-spin text-green-500 mb-2" size={32} />
          <p className="text-sm font-semibold text-slate-500">Doping paketleri yükleniyor...</p>
        </LoadingState>
      ) : error ? (
        <ErrorState>
          <AlertCircle size={36} className="text-red-500 mb-2" />
          <p className="font-bold text-red-600 text-sm mb-3">{error}</p>
          <RetryButton onClick={loadPackages}>
            <RefreshCw size={14} /> Yeniden Dene
          </RetryButton>
        </ErrorState>
      ) : packages.length === 0 ? (
        <EmptyState>
          <Package size={44} className="text-slate-300 mb-3" />
          <h3 className="font-bold text-slate-700 dark:text-slate-200">Henüz doping paketi oluşturulmamış.</h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            Yeni bir paket oluşturarak satış kataloğunu hazırlayabilirsiniz.
          </p>
          <CreateBtn onClick={handleCreateNew}>
            <Plus size={16} /> İlk Paketi Oluştur
          </CreateBtn>
        </EmptyState>
      ) : (
        <TableWrapper>
          <StyledTable>
            <thead>
              <tr>
                <th>Paket Bilgisi</th>
                <th>Tür</th>
                <th>İçerik Özellikleri</th>
                <th>Normal Fiyat</th>
                <th>İndirim</th>
                <th>Güncel Fiyat</th>
                <th>Satış Dönemi</th>
                <th>Durum</th>
                <th>Sıra</th>
                <th className="text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {packages.map((pkg) => {
                const isBundle = pkg.packageType === "Bundle" || pkg.items?.length > 1;
                const finalPriceVal = pkg.finalPrice ?? pkg.basePrice ?? 0;
                const hasDiscount = pkg.discountType && pkg.discountType !== "None" && pkg.discountValue > 0;

                return (
                  <tr key={pkg.id || pkg.code}>
                    <td>
                      <PkgNameCell>
                        <div className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-1.5">
                          {pkg.name}
                          {pkg.isRecommended && (
                            <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                              ⭐ Önerilen
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">
                          {pkg.code}
                        </span>
                        {pkg.badgeText && (
                          <span className="inline-block mt-1 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {pkg.badgeText}
                          </span>
                        )}
                      </PkgNameCell>
                    </td>

                    <td>
                      <TypeBadge $isBundle={isBundle}>
                        {isBundle ? "Toplu Paket" : "Tekli Paket"}
                      </TypeBadge>
                    </td>

                    <td>
                      <ItemsCell>
                        {pkg.items && pkg.items.length > 0 ? (
                          pkg.items.map((item, i) => (
                            <ItemTag key={i}>
                              {FEATURE_NAMES[item.dopingType] || `Özellik #${item.dopingType}`}
                              {item.durationDays ? ` (${item.durationDays} Gün)` : ""}
                              {item.quantity ? ` (${item.quantity} Adet)` : ""}
                            </ItemTag>
                          ))
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </ItemsCell>
                    </td>

                    <td>
                      <span className={hasDiscount ? "line-through text-slate-400 text-xs" : "font-bold text-slate-800 dark:text-slate-200 text-sm"}>
                        {formatCurrency(pkg.basePrice, pkg.currency)}
                      </span>
                    </td>

                    <td>
                      {hasDiscount ? (
                        <DiscountBadge>
                          <BadgePercent size={12} />
                          {pkg.discountType === "Percentage"
                            ? `%${pkg.discountValue} İndirim`
                            : `${formatCurrency(pkg.discountValue)} İndirim`}
                        </DiscountBadge>
                      ) : (
                        <span className="text-slate-400 text-xs">Yok</span>
                      )}
                    </td>

                    <td>
                      <span className="font-extrabold text-green-600 dark:text-green-400 text-base">
                        {formatCurrency(finalPriceVal, pkg.currency)}
                      </span>
                    </td>

                    <td>
                      <span className="text-xs text-slate-600 dark:text-slate-400 block">
                        {formatDate(pkg.availableFrom || pkg.discountStartAt)}
                      </span>
                      {pkg.availableUntil && (
                        <span className="text-[11px] text-slate-400 block">
                          Bitiş: {formatDate(pkg.availableUntil || pkg.discountEndAt)}
                        </span>
                      )}
                    </td>

                    <td>
                      <StatusBadge $isActive={pkg.isActive}>
                        {pkg.isActive ? (
                          <>
                            <CheckCircle2 size={12} /> Aktif
                          </>
                        ) : (
                          <>
                            <XCircle size={12} /> Pasif
                          </>
                        )}
                      </StatusBadge>
                    </td>

                    <td>
                      <span className="font-bold text-xs text-slate-600 dark:text-slate-400">
                        {pkg.sortOrder ?? 0}
                      </span>
                    </td>

                    <td className="text-right">
                      <ActionGroup>
                        <ActionButton
                          onClick={() => handleEdit(pkg)}
                          title="Düzenle"
                          className="hover:bg-blue-50 text-blue-600"
                        >
                          <Edit size={16} />
                        </ActionButton>
                        <ActionButton
                          onClick={() => handleOpenDuplicate(pkg)}
                          title="Kopyala"
                          className="hover:bg-amber-50 text-amber-600"
                        >
                          <Copy size={16} />
                        </ActionButton>
                        <ActionButton
                          onClick={() => handleOpenStatusConfirm(pkg)}
                          title={pkg.isActive ? "Pasifleştir" : "Aktifleştir"}
                          className={pkg.isActive ? "hover:bg-red-50 text-red-600" : "hover:bg-green-50 text-green-600"}
                        >
                          <Power size={16} />
                        </ActionButton>
                      </ActionGroup>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </StyledTable>
        </TableWrapper>
      )}

      {/* ── Status Confirm Modal ── */}
      {statusConfirmModalOpen && targetStatusPkg && (
        <ModalOverlay onClick={() => setStatusConfirmModalOpen(false)}>
          <ModalCard onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Power size={20} className={targetStatusPkg.isActive ? "text-red-500" : "text-green-500"} />
                Paket Durumunu Değiştir
              </h3>
              <button onClick={() => setStatusConfirmModalOpen(false)}>
                <X size={18} />
              </button>
            </ModalHeader>

            <div className="py-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {targetStatusPkg.isActive ? (
                <p>
                  <strong>"{targetStatusPkg.name}"</strong> paketini <strong>pasifleştirmek</strong> istediğinizden emin misiniz?
                  <br />
                  <span className="text-xs text-slate-400 mt-2 block">
                    • Bu paket pasifleştirildiğinde yeni satın alımlarda gösterilmeyecektir.
                    <br />• Mevcut satın alımlar ve aktif dopingler etkilenmeyecektir.
                  </span>
                </p>
              ) : (
                <p>
                  <strong>"{targetStatusPkg.name}"</strong> paketini <strong>aktifleştirmek</strong> üzeresiniz. Paket satış kataloğunda görüntülenecektir.
                </p>
              )}
            </div>

            <ModalFooter>
              <CancelBtn onClick={() => setStatusConfirmModalOpen(false)}>Vazgeç</CancelBtn>
              <ConfirmBtn
                $isDanger={targetStatusPkg.isActive}
                disabled={actionLoading}
                onClick={handleToggleStatus}
              >
                {actionLoading ? "İşleniyor..." : targetStatusPkg.isActive ? "Pasifleştir" : "Aktifleştir"}
              </ConfirmBtn>
            </ModalFooter>
          </ModalCard>
        </ModalOverlay>
      )}

      {/* ── Duplicate Package Modal ── */}
      {duplicateModalOpen && targetDuplicatePkg && (
        <DuplicateModal
          pkg={targetDuplicatePkg}
          onClose={() => setDuplicateModalOpen(false)}
          onSuccess={(duplicatedPkg) => {
            setDuplicateModalOpen(false);
            loadPackages();
            handleEdit(duplicatedPkg);
          }}
        />
      )}

      {/* ── Form Modal (Create / Edit) ── */}
      {formModalOpen && (
        <AdminDopingPackageFormModal
          editingPackage={editingPackage}
          featuresList={featuresList}
          onClose={() => setFormModalOpen(false)}
          onSuccess={() => {
            setFormModalOpen(false);
            loadPackages();
          }}
        />
      )}
    </PageWrapper>
  );
}

// ─── ADMIN DOPING PACKAGE FORM MODAL ──────────────────────────────────────────
function AdminDopingPackageFormModal({ editingPackage, featuresList, onClose, onSuccess }) {
  const isEdit = !!editingPackage;

  const [formData, setFormData] = useState({
    code: editingPackage?.code || "",
    name: editingPackage?.name || "",
    description: editingPackage?.description || "",
    packageType: editingPackage?.packageType || "Single",
    basePrice: editingPackage?.basePrice ?? 100,
    currency: editingPackage?.currency || "TRY",
    discountType: editingPackage?.discountType || "None",
    discountValue: editingPackage?.discountValue ?? null,
    discountStartAt: editingPackage?.discountStartAt ? editingPackage.discountStartAt.substring(0, 16) : "",
    discountEndAt: editingPackage?.discountEndAt ? editingPackage.discountEndAt.substring(0, 16) : "",
    badgeText: editingPackage?.badgeText || "",
    highlightText: editingPackage?.highlightText || "",
    isRecommended: editingPackage?.isRecommended || false,
    isActive: editingPackage?.isActive ?? true,
    sortOrder: editingPackage?.sortOrder ?? 1,
    availableFrom: editingPackage?.availableFrom ? editingPackage.availableFrom.substring(0, 16) : "",
    availableUntil: editingPackage?.availableUntil ? editingPackage.availableUntil.substring(0, 16) : "",
    items: editingPackage?.items || [
      {
        dopingType: 1,
        entitlementType: "TimeBased",
        durationDays: 7,
        quantity: null,
        frameColor: null,
        sortOrder: 1,
      },
    ],
  });

  const [saving, setSaving] = useState(false);

  // Kebab-case Otomatik Formatlama (Code alanı için)
  const handleCodeChange = (val) => {
    const formatted = val
      .toLocaleLowerCase("tr-TR")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    setFormData((prev) => ({ ...prev, code: formatted }));
  };

  // İndirimli Fiyat Önizleme İstemci Hesaplaması (Client-side estimate preview)
  const calculateEstimatedPrice = () => {
    const base = Number(formData.basePrice || 0);
    if (!formData.discountType || formData.discountType === "None" || !formData.discountValue) {
      return base;
    }
    const val = Number(formData.discountValue);
    if (formData.discountType === "Percentage") {
      return Math.max(0, base - (base * val) / 100);
    }
    if (formData.discountType === "FixedAmount") {
      return Math.max(0, base - val);
    }
    return base;
  };

  // İçerik Ekleme / Çıkarma
  const handleAddItem = () => {
    if (formData.packageType === "Single" && formData.items.length >= 1) {
      toast.error("Tekli paketlerde yalnızca 1 adet doping içeriği bulunabilir.");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          dopingType: 2,
          entitlementType: "TimeBased",
          durationDays: 7,
          quantity: null,
          frameColor: null,
          sortOrder: prev.items.length + 1,
        },
      ],
    }));
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length <= 1) {
      toast.error("En az 1 adet doping içeriği bulunmalıdır.");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedItems = [...prev.items];
      updatedItems[index] = { ...updatedItems[index], [field]: value };
      return { ...prev, items: updatedItems };
    });
  };

  // Form Doğrulama
  const validateForm = () => {
    if (!formData.code.trim()) {
      toast.error("Paket kodu boş bırakılamaz.");
      return false;
    }
    if (!formData.name.trim()) {
      toast.error("Paket adı boş bırakılamaz.");
      return false;
    }
    if (Number(formData.basePrice) < 0) {
      toast.error("Paket fiyatı negatif olamaz.");
      return false;
    }

    if (formData.discountType === "Percentage") {
      if (Number(formData.discountValue) < 0 || Number(formData.discountValue) > 100) {
        toast.error("Yüzdelik indirim 0 ile 100 arasında olmalıdır.");
        return false;
      }
    }

    if (formData.discountType === "FixedAmount") {
      if (Number(formData.discountValue) > Number(formData.basePrice)) {
        toast.error("Sabit indirim tutarı normal fiyattan büyük olamaz.");
        return false;
      }
    }

    if (formData.packageType === "Single" && formData.items.length !== 1) {
      toast.error("Tekli (Single) paket tam olarak 1 içerik barındırmalıdır.");
      return false;
    }

    if (formData.packageType === "Bundle" && formData.items.length < 2) {
      toast.error("Toplu (Bundle) paket en az 2 adet içerik barındırmalıdır.");
      return false;
    }

    // Aynı dopingType kontrolü
    const types = formData.items.map((i) => Number(i.dopingType));
    const hasDuplicate = new Set(types).size !== types.length;
    if (hasDuplicate) {
      toast.error("Bir pakette aynı doping türü birden fazla kez seçilemez.");
      return false;
    }

    return true;
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);

    const payload = {
      code: formData.code,
      name: formData.name,
      description: formData.description,
      packageType: formData.packageType,
      basePrice: Number(formData.basePrice),
      currency: formData.currency,
      discountType: formData.discountType,
      discountValue: formData.discountValue ? Number(formData.discountValue) : null,
      discountStartAt: formData.discountStartAt ? new Date(formData.discountStartAt).toISOString() : null,
      discountEndAt: formData.discountEndAt ? new Date(formData.discountEndAt).toISOString() : null,
      badgeText: formData.badgeText || null,
      highlightText: formData.highlightText || null,
      isRecommended: formData.isRecommended,
      isActive: formData.isActive,
      sortOrder: Number(formData.sortOrder || 1),
      availableFrom: formData.availableFrom ? new Date(formData.availableFrom).toISOString() : null,
      availableUntil: formData.availableUntil ? new Date(formData.availableUntil).toISOString() : null,
      items: formData.items.map((it, i) => ({
        dopingType: Number(it.dopingType),
        entitlementType: it.entitlementType === "QuantityBased" ? 2 : it.entitlementType === "ListingLifetime" ? 3 : 1,
        durationDays: it.entitlementType === "TimeBased" ? Number(it.durationDays || 7) : null,
        quantity: it.entitlementType === "QuantityBased" ? Number(it.quantity || 1) : null,
        frameColor: it.frameColor || null,
        sortOrder: i + 1,
      })),
    };

    try {
      if (isEdit) {
        await adminDopingPackageService.updatePackage(editingPackage.id, payload);
        toast.success("Paket başarıyla güncellendi.");
      } else {
        await adminDopingPackageService.createPackage(payload);
        toast.success("Yeni doping paketi başarıyla oluşturuldu.");
      }
      onSuccess();
    } catch (err) {
      console.error("Form submit error:", err);
      toast.error(err.message || "Paket kaydedilirken hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  const estimatedPrice = calculateEstimatedPrice();

  return (
    <ModalOverlay onClick={() => !saving && onClose()}>
      <ModalFormContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h3 className="font-extrabold text-xl text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Zap className="text-amber-500" size={24} />
            {isEdit ? "Doping Paketini Düzenle" : "Yeni Doping Paketi Oluştur"}
          </h3>
          <button disabled={saving} onClick={onClose}>
            <X size={20} />
          </button>
        </ModalHeader>

        <FormScrollBody onSubmit={handleSubmit}>
          {/* Genel Bilgiler */}
          <FormSectionTitle>1. Genel Paket Bilgileri</FormSectionTitle>
          <FormGrid cols={2}>
            <FormGroup>
              <label>Paket Kodu (Unique Slug) *</label>
              <input
                type="text"
                placeholder="homepage-vip-bundle"
                value={formData.code}
                onChange={(e) => handleCodeChange(e.target.value)}
                required
              />
              <span className="text-[10px] text-slate-400">Benzersiz kısa kod (ör: premium-30-days)</span>
            </FormGroup>

            <FormGroup>
              <label>Paket Adı *</label>
              <input
                type="text"
                placeholder="Anasayfa VIP Paketi"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </FormGroup>
          </FormGrid>

          <FormGroup>
            <label>Açıklama</label>
            <textarea
              rows={2}
              placeholder="Paketin sağladığı avantajlar ve detaylı bilgi..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </FormGroup>

          <FormGrid cols={3}>
            <FormGroup>
              <label>Paket Türü *</label>
              <select
                value={formData.packageType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    packageType: e.target.value,
                    // Eğer Single'a çekildiyse 1 öğeye düşür
                    items: e.target.value === "Single" ? [formData.items[0]] : formData.items,
                  })
                }
              >
                <option value="Single">Tekli Paket (Single)</option>
                <option value="Bundle">Toplu Paket (Bundle)</option>
              </select>
            </FormGroup>

            <FormGroup>
              <label>Normal Fiyat (TRY) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.basePrice}
                onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                required
              />
            </FormGroup>

            <FormGroup>
              <label>Sıralama (Sort Order)</label>
              <input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
              />
            </FormGroup>
          </FormGrid>

          <FormGrid cols={2}>
            <FormGroup>
              <label>Rozet Metni (Badge)</label>
              <input
                type="text"
                placeholder="Ör: Yaz Kampanyası"
                value={formData.badgeText}
                onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
              />
            </FormGroup>
            <FormGroup>
              <label>Vurgu Metni (Highlight)</label>
              <input
                type="text"
                placeholder="Ör: %20 Avantajlı"
                value={formData.highlightText}
                onChange={(e) => setFormData({ ...formData, highlightText: e.target.value })}
              />
            </FormGroup>
          </FormGrid>

          {/* İndirim Tanımları */}
          <FormSectionTitle>2. İndirim ve Fiyatlandırma</FormSectionTitle>
          <FormGrid cols={2}>
            <FormGroup>
              <label>İndirim Türü</label>
              <select
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
              >
                <option value="None">İndirim Yok</option>
                <option value="Percentage">Yüzdelik İndirim (%)</option>
                <option value="FixedAmount">Sabit Tutar İndirimi (₺)</option>
              </select>
            </FormGroup>

            {formData.discountType !== "None" && (
              <FormGroup>
                <label>
                  İndirim Miktarı ({formData.discountType === "Percentage" ? "%" : "₺"})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.discountValue || ""}
                  onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                />
              </FormGroup>
            )}
          </FormGrid>

          {formData.discountType !== "None" && (
            <PricePreviewBox>
              <div className="text-xs text-slate-500">Tahmini İndirimli Fiyat Önizlemesi:</div>
              <div className="font-black text-lg text-green-600">
                ₺{estimatedPrice.toFixed(2)}
              </div>
              <span className="text-[10px] text-slate-400">
                (Kesin indirim tutarı kaydedildikten sonra backend tarafından doğrulanır)
              </span>
            </PricePreviewBox>
          )}

          <FormGrid cols={2}>
            <FormGroup>
              <label>İndirim Başlangıç Tarihi</label>
              <input
                type="datetime-local"
                value={formData.discountStartAt}
                onChange={(e) => setFormData({ ...formData, discountStartAt: e.target.value })}
              />
            </FormGroup>
            <FormGroup>
              <label>İndirim Bitiş Tarihi</label>
              <input
                type="datetime-local"
                value={formData.discountEndAt}
                onChange={(e) => setFormData({ ...formData, discountEndAt: e.target.value })}
              />
            </FormGroup>
          </FormGrid>

          {/* Doping İçerikleri */}
          <FormSectionTitle>
            3. Paket Doping İçerikleri ({formData.items.length} Adet)
          </FormSectionTitle>

          <ItemsContainer>
            {formData.items.map((item, idx) => (
              <ItemBox key={idx}>
                <ItemBoxHeader>
                  <span className="font-bold text-xs text-slate-700 dark:text-slate-300">
                    İçerik #{idx + 1}
                  </span>
                  {formData.items.length > 1 && (
                    <RemoveItemBtn type="button" onClick={() => handleRemoveItem(idx)}>
                      <Trash2 size={14} /> Kaldır
                    </RemoveItemBtn>
                  )}
                </ItemBoxHeader>

                <FormGrid cols={2}>
                  <FormGroup>
                    <label>Doping Özelliği *</label>
                    <select
                      value={item.dopingType}
                      onChange={(e) =>
                        handleItemChange(idx, "dopingType", Number(e.target.value))
                      }
                    >
                      {featuresList.length > 0
                        ? featuresList.map((f) => (
                            <option key={f.dopingType} value={f.dopingType}>
                              {f.name}
                            </option>
                          ))
                        : Object.entries(FEATURE_NAMES).map(([id, name]) => (
                            <option key={id} value={id}>
                              {name}
                            </option>
                          ))}
                    </select>
                  </FormGroup>

                  <FormGroup>
                    <label>Hak Türü (Entitlement) *</label>
                    <select
                      value={item.entitlementType}
                      onChange={(e) => handleItemChange(idx, "entitlementType", e.target.value)}
                    >
                      {ENTITLEMENT_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </FormGroup>
                </FormGrid>

                <FormGrid cols={2}>
                  {item.entitlementType === "TimeBased" && (
                    <FormGroup>
                      <label>Süre (Gün Sayısı)</label>
                      <input
                        type="number"
                        min="1"
                        value={item.durationDays || 7}
                        onChange={(e) =>
                          handleItemChange(idx, "durationDays", Number(e.target.value))
                        }
                      />
                    </FormGroup>
                  )}

                  {item.entitlementType === "QuantityBased" && (
                    <FormGroup>
                      <label>Kullanım Adedi</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity || 1}
                        onChange={(e) =>
                          handleItemChange(idx, "quantity", Number(e.target.value))
                        }
                      />
                    </FormGroup>
                  )}

                  <FormGroup>
                    <label>Çerçeve Vurgu Rengi (Renk Kodu)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        className="w-10 h-10 rounded cursor-pointer border-0"
                        value={item.frameColor || "#16a34a"}
                        onChange={(e) => handleItemChange(idx, "frameColor", e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="#16a34a"
                        value={item.frameColor || ""}
                        onChange={(e) => handleItemChange(idx, "frameColor", e.target.value)}
                      />
                    </div>
                  </FormGroup>
                </FormGrid>
              </ItemBox>
            ))}

            {(formData.packageType === "Bundle" || formData.items.length < 1) && (
              <AddItemBtn type="button" onClick={handleAddItem}>
                <PlusCircle size={16} /> Doping İçeriği Ekle
              </AddItemBtn>
            )}
          </ItemsContainer>

          {/* Durum & Checkboxlar */}
          <FormGrid cols={2}>
            <CheckboxLabel>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              <span>Paket Satışta Aktif Olsun</span>
            </CheckboxLabel>

            <CheckboxLabel>
              <input
                type="checkbox"
                checked={formData.isRecommended}
                onChange={(e) => setFormData({ ...formData, isRecommended: e.target.checked })}
              />
              <span>Önerilen Paket Olarak İşaretle ⭐</span>
            </CheckboxLabel>
          </FormGrid>

          <ModalFooter className="pt-4 border-t">
            <CancelBtn type="button" onClick={onClose} disabled={saving}>
              İptal
            </CancelBtn>
            <SubmitBtn type="submit" disabled={saving}>
              {saving ? "Kaydediliyor..." : isEdit ? "Paketi Güncelle" : "Paketi Oluştur"}
            </SubmitBtn>
          </ModalFooter>
        </FormScrollBody>
      </ModalFormContent>
    </ModalOverlay>
  );
}

// ─── DUPLICATE PACKAGE MODAL ──────────────────────────────────────────────────
function DuplicateModal({ pkg, onClose, onSuccess }) {
  const [newCode, setNewCode] = useState(`${pkg.code}-copy`);
  const [newName, setNewName] = useState(`${pkg.name} – Kopya`);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newCode.trim() || !newName.trim()) {
      toast.error("Paket kodu ve adı gereklidir.");
      return;
    }
    setLoading(true);
    try {
      const duplicated = await adminDopingPackageService.duplicatePackage(pkg.id, {
        code: newCode,
        name: newName,
      });
      toast.success("Paket başarıyla kopyalandı.");
      onSuccess(duplicated);
    } catch (err) {
      toast.error(err.message || "Kopyalama başarısız.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalOverlay onClick={() => !loading && onClose()}>
      <ModalCard onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Copy size={20} className="text-amber-500" />
            Paketi Kopyala
          </h3>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </ModalHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-3">
          <p className="text-xs text-slate-500">
            <strong>"{pkg.name}"</strong> paketini kopyalamak üzeresiniz. Yeni paket için benzersiz bir kod ve isim belirleyin.
          </p>
          <FormGroup>
            <label>Yeni Paket Kodu *</label>
            <input
              type="text"
              value={newCode}
              onChange={(e) =>
                setNewCode(
                  e.target.value
                    .toLocaleLowerCase("tr-TR")
                    .replace(/\s+/g, "-")
                    .replace(/[^a-z0-9-]/g, "")
                )
              }
              required
            />
          </FormGroup>
          <FormGroup>
            <label>Yeni Paket Adı *</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
            />
          </FormGroup>
          <ModalFooter>
            <CancelBtn type="button" onClick={onClose} disabled={loading}>
              İptal
            </CancelBtn>
            <ConfirmBtn type="submit" disabled={loading}>
              {loading ? "Kopyalanıyor..." : "Kopyala ve Düzenle"}
            </ConfirmBtn>
          </ModalFooter>
        </form>
      </ModalCard>
    </ModalOverlay>
  );
}

// ─── STYLED COMPONENTS ───────────────────────────────────────────────────────

const PageWrapper = styled.div`
  padding: 16px 0 40px;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-primary);
`;

const PageSubtitle = styled.p`
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 4px;
`;

const CreateBtn = styled.button`
  background: linear-gradient(135deg, #16a34a, #22c55e);
  color: white;
  padding: 10px 20px;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 14px rgba(22, 163, 74, 0.3);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
`;

const FilterCard = styled.div`
  background: white;
  border: 1px solid var(--card-border);
  border-radius: 16px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;

  .dark & {
    background: var(--card-bg);
  }
`;

const SearchInputWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 8px 14px;
  flex: 1;

  .dark & {
    background: var(--page-bg);
    border-color: var(--card-border);
  }

  input {
    background: transparent;
    border: none;
    outline: none;
    font-size: 13px;
    width: 100%;
    color: var(--text-primary);
  }
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  select {
    padding: 8px 14px;
    border-radius: 12px;
    border: 1px solid #cbd5e1;
    font-size: 13px;
    outline: none;
    background: white;
    color: var(--text-primary);

    .dark & {
      background: var(--card-bg);
      border-color: var(--card-border);
    }
  }
`;

const TableWrapper = styled.div`
  background: white;
  border: 1px solid var(--card-border);
  border-radius: 20px;
  overflow: hidden;

  .dark & {
    background: var(--card-bg);
  }
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;

  th {
    background: #f8fafc;
    color: #64748b;
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 14px 18px;
    border-bottom: 1px solid #e2e8f0;

    .dark & {
      background: var(--page-bg);
      color: var(--text-muted);
      border-color: var(--card-border);
    }
  }

  td {
    padding: 16px 18px;
    border-bottom: 1px solid #f1f5f9;
    font-size: 13px;

    .dark & {
      border-color: var(--card-border);
    }
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  tbody tr:hover {
    background: #f8fafc;

    .dark & {
      background: rgba(255, 255, 255, 0.02);
    }
  }
`;

const PkgNameCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const TypeBadge = styled.span`
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 8px;
  background: ${({ $isBundle }) => ($isBundle ? "#f0fdf4" : "#f1f5f9")};
  color: ${({ $isBundle }) => ($isBundle ? "#16a34a" : "#475569")};
`;

const ItemsCell = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const ItemTag = styled.span`
  background: #f1f5f9;
  color: #475569;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;

  .dark & {
    background: rgba(255, 255, 255, 0.08);
    color: var(--text-primary);
  }
`;

const DiscountBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #fef2f2;
  color: #ef4444;
  font-size: 11px;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 6px;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 8px;
  background: ${({ $isActive }) => ($isActive ? "#f0fdf4" : "#fef2f2")};
  color: ${({ $isActive }) => ($isActive ? "#16a34a" : "#ef4444")};
`;

const ActionGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
`;

const ActionButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
`;

const LoadingState = styled.div`
  padding: 60px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ErrorState = styled.div`
  padding: 60px;
  text-align: center;
  background: #fef2f2;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const EmptyState = styled.div`
  padding: 60px;
  text-align: center;
  background: white;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;

  .dark & {
    background: var(--card-bg);
  }
`;

const RetryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: #ef4444;
  color: white;
  font-size: 12px;
  font-weight: 700;
  padding: 8px 16px;
  border-radius: 10px;
`;

// Modals
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ModalCard = styled.div`
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 480px;
  padding: 24px;

  .dark & {
    background: var(--card-bg);
  }
`;

const ModalFormContent = styled.div`
  background: white;
  border-radius: 24px;
  width: 100%;
  max-width: 760px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .dark & {
    background: var(--card-bg);
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 28px;
  border-bottom: 1px solid #f1f5f9;

  .dark & {
    border-color: var(--card-border);
  }
`;

const FormScrollBody = styled.form`
  padding: 28px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormSectionTitle = styled.h4`
  font-size: 14px;
  font-weight: 800;
  color: #16a34a;
  padding-bottom: 6px;
  border-bottom: 1.5px solid #bbf7d0;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(${({ cols }) => cols || 1}, 1fr);
  gap: 16px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 12px;
    font-weight: 700;
    color: var(--text-primary);
  }

  input,
  select,
  textarea {
    padding: 10px 14px;
    border-radius: 10px;
    border: 1.5px solid #cbd5e1;
    font-size: 13px;
    outline: none;

    .dark & {
      background: var(--page-bg);
      border-color: var(--card-border);
      color: var(--text-primary);
    }
  }
`;

const PricePreviewBox = styled.div`
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const ItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ItemBox = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  .dark & {
    background: var(--page-bg);
    border-color: var(--card-border);
  }
`;

const ItemBoxHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const RemoveItemBtn = styled.button`
  color: #ef4444;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const AddItemBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #f0fdf4;
  border: 1.5px dashed #bbf7d0;
  color: #16a34a;
  font-size: 13px;
  font-weight: 700;
  padding: 12px;
  border-radius: 14px;
  cursor: pointer;

  &:hover {
    background: #dcfce7;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  color: var(--text-primary);

  input {
    width: 18px;
    height: 18px;
    accent-color: #16a34a;
  }
`;

const ModalFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 12px;
`;

const CancelBtn = styled.button`
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  background: #f1f5f9;
  color: #64748b;

  .dark & {
    background: var(--page-bg);
    color: var(--text-muted);
  }
`;

const ConfirmBtn = styled.button`
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  background: ${({ $isDanger }) => ($isDanger ? "#ef4444" : "#16a34a")};
  color: white;

  &:disabled {
    opacity: 0.6;
  }
`;

const SubmitBtn = styled.button`
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 800;
  background: #16a34a;
  color: white;

  &:disabled {
    opacity: 0.6;
  }
`;
