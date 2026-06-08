import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  Loader2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Save,
  Monitor,
  Home,
  Globe,
  Trash2,
  Clock,
} from "lucide-react";
import { getMyProfile, updateAvailability } from "@/services/tutorService";
import toast from "react-hot-toast";

const DAYS = [
  "Pazartesi",
  "Salı",
  "Çarşamba",
  "Perşembe",
  "Cuma",
  "Cumartesi",
  "Pazar",
];
const SLOTS = ["Sabah", "Öğle", "Öğleden Sonra", "Akşam"];

export default function TutorAvailability() {
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [availability, setAvailability] = useState({});
  const [status, setStatus] = useState({ type: null, message: "" });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMyProfile();
        if (data) {
          // Backend dictionary format: { "Day-Slot": "type" }
          // If availability comes as an array, we might need to convert it,
          // but based on current code it's expected as an object.
          setAvailability(data.availability || {});
        }
      } catch (err) {
        console.error("Load error", err);
        toast.error("Profil verileri yüklenemedi.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSlotClick = (day, slot) => {
    const key = `${day}-${slot}`;
    const current = availability[key];
    let next = null;

    // Cycle: null -> online -> inperson -> both -> null
    if (!current) next = "online";
    else if (current === "online") next = "inperson";
    else if (current === "inperson") next = "both";
    else next = null;

    setAvailability((prev) => ({
      ...prev,
      [key]: next,
    }));
  };

  const clearAll = () => {
    if (window.confirm("Tüm takvimi temizlemek istediğinize emin misiniz?")) {
      setAvailability({});
    }
  };

  const handleSave = async () => {
    setSaveLoading(true);
    setStatus({ type: null, message: "" });
    try {
      await updateAvailability(availability);
      setStatus({
        type: "success",
        message: "Müsaitlik takviminiz başarıyla güncellendi!",
      });
      toast.success("Müsaitlik güncellendi.");
      setTimeout(() => setStatus({ type: null, message: "" }), 3000);
    } catch (err) {
      setStatus({
        type: "error",
        message: err.message || "Kaydedilirken bir hata oluştu.",
      });
      toast.error("Hata: " + err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-6">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        <p className="text-gray-400 font-black uppercase tracking-widest text-xs">
          Takvim Yükleniyor
        </p>
      </div>
    );
  }

  return (
    <Container className="animate-in fade-in duration-700">
      <HeaderCard>
        <div className="title-area">
          <div className="icon-box">
            <Calendar size={32} />
          </div>
          <div>
            <h1>Müsaitlik Takvimi</h1>
            <p>Ders verebileceğiniz gün ve saat dilimlerini seçin.</p>
          </div>
        </div>
        <div className="flex gap-4">
          <ClearButton onClick={clearAll} type="button">
            <Trash2 size={18} /> Temizle
          </ClearButton>
          <SaveButton onClick={handleSave} disabled={saveLoading}>
            {saveLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Save size={20} /> Değişiklikleri Kaydet
              </>
            )}
          </SaveButton>
        </div>
      </HeaderCard>

      {status.message && (
        <AlertBox $type={status.type}>
          {status.type === "success" ? (
            <CheckCircle2 size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <span>{status.message}</span>
        </AlertBox>
      )}

      <GridCard>
        <div className="legend">
          <div className="legend-item">
            <div className="box online"></div> <span>Online</span>
          </div>
          <div className="legend-item">
            <div className="box inperson"></div> <span>Yüz Yüze</span>
          </div>
          <div className="legend-item">
            <div className="box both"></div> <span>Her İkisi</span>
          </div>
          <div className="legend-item">
            <div className="box empty"></div> <span>Müsait Değil</span>
          </div>
          <p className="hint text-blue-600 dark:text-blue-400 font-black flex items-center gap-2">
            <Clock size={14} /> Kutucuklara tıklayarak durumu
            değiştirebilirsiniz.
          </p>
        </div>

        <div className="overflow-x-auto w-full rounded-2xl border border-gray-100 dark:border-slate-800">
          <table className="w-full min-w-[800px] border-separate border-spacing-2">
            <thead>
              <tr>
                <th></th>
                {DAYS.map((d) => (
                  <th key={d}>{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SLOTS.map((slot) => (
                <tr key={slot}>
                  <td className="slot-label">
                    <div className="slot-pill">{slot}</div>
                  </td>
                  {DAYS.map((day) => {
                    const type = availability[`${day}-${slot}`];
                    return (
                      <td key={`${day}-${slot}`}>
                        <Cell
                          className={type || "empty"}
                          onClick={() => handleSlotClick(day, slot)}
                          title={`${day} ${slot}: ${type || "Müsait Değil"}`}
                        >
                          {type === "online" && (
                            <Monitor
                              size={20}
                              className="animate-in zoom-in duration-300"
                            />
                          )}
                          {type === "inperson" && (
                            <Home
                              size={20}
                              className="animate-in zoom-in duration-300"
                            />
                          )}
                          {type === "both" && (
                            <Globe
                              size={20}
                              className="animate-in zoom-in duration-300"
                            />
                          )}
                        </Cell>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GridCard>
    </Container>
  );
}

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px 100px;
`;

const HeaderCard = styled.div`
  background: white;
  padding: 24px 32px;
  border-radius: 1.5rem;
  border: 1px solid #f1f5f9;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  .dark & {
    background: #1e293b;
    border-color: #334155;
    box-shadow: none;
  }

  .title-area {
    display: flex;
    align-items: center;
    gap: 25px;

    .icon-box {
      width: 48px;
      height: 48px;
      background: #f0f7ff;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #2d79f3;

      svg { width: 24px; height: 24px; }

      .dark & {
        background: #1e3a8a30;
        color: #60a5fa;
      }
    }

    h1 {
      font-size: 24px;
      font-weight: 950;
      color: #0f172a;
      margin: 0;
      letter-spacing: -0.5px;
      .dark & { color: #f1f5f9; }
    }
    p {
      color: #64748b;
      font-weight: 600;
      margin-top: 4px;
      font-size: 14px;
      .dark & { color: #94a3b8; }
    }
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
    padding: 30px;
  }
`;

const GridCard = styled.div`
  background: white;
  padding: 32px;
  border-radius: 2rem;
  border: 1px solid #f1f5f9;
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.08);

  .dark & {
    background: #1e293b;
    border-color: #334155;
    box-shadow: none;
  }

  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin-bottom: 32px;
    align-items: center;
    padding: 14px 24px;
    background: #f8fafc;
    border-radius: 16px;

    .dark & { background: #0f172a50; }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 14px;
      font-weight: 900;
      color: #334155;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      .dark & { color: #f1f5f9; }

      .box {
        width: 24px;
        height: 24px;
        border-radius: 8px;
        &.online {
          background: #3b82f6;
        }
        &.inperson {
          background: #10b981;
        }
        &.both {
          background: #8b5cf6;
        }
        &.empty {
          background: white;
          border: 2px solid #e2e8f0;
          .dark & { background: #0f172a; border-color: #334155; }
        }
      }
    }

    .hint {
      margin-left: auto;
      font-size: 13px;
      text-transform: none;
    }
  }
`;

const Table = styled.table`
  width: 100%;
  min-width: 800px;
  border-collapse: separate;
  border-spacing: 8px;

  th {
    padding: 8px;
    text-align: center;
    font-size: 11px;
    font-weight: 950;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    padding-bottom: 16px;
  }

  .slot-label {
    padding-right: 16px;

    .slot-pill {
      background: #f1f5f9;
      color: #475569;
      font-size: 12px;
      font-weight: 950;
      padding: 8px 16px;
      border-radius: 12px;
      white-space: nowrap;
      text-align: center;
      .dark & { background: #334155; color: #f1f5f9; }
    }
  }
`;

const Cell = styled.div`
  width: 100%;
  height: 56px;
  min-width: 56px;
  background: white;
  border: 2px solid #f1f5f9;
  border-radius: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  color: white;

  .dark & { border-color: #334155; }

  &:hover {
    transform: scale(1.08);
    border-color: #cbd5e1;
    box-shadow: 0 15px 30px -5px rgba(0, 0, 0, 0.1);
    z-index: 10;
  }

  &.empty {
    background: white;
    .dark & { background: #0f172a; }
    &:hover {
      background: #f8fafc;
      .dark & { background: #1e293b; }
    }
  }

  &.online {
    background: #3b82f6;
    border-color: #2563eb;
    box-shadow: 0 10px 20px rgba(59, 130, 246, 0.2);
  }
  &.inperson {
    background: #10b981;
    border-color: #059669;
    box-shadow: 0 10px 20px rgba(16, 185, 129, 0.2);
  }
  &.both {
    background: #8b5cf6;
    border-color: #7c3aed;
    box-shadow: 0 10px 20px rgba(139, 92, 246, 0.2);
  }
`;

const SaveButton = styled.button`
  background: #2d79f3;
  color: white;
  padding: 12px 24px;
  border-radius: 14px;
  font-weight: 950;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s;
  box-shadow: 0 10px 20px rgba(45, 121, 243, 0.2);
  font-size: 14px;
  &:hover {
    background: #1e40af;
    transform: translateY(-3px);
    box-shadow: 0 20px 40px rgba(45, 121, 243, 0.3);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ClearButton = styled.button`
  background: white;
  color: #ef4444;
  padding: 12px 20px;
  border-radius: 14px;
  font-weight: 900;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 2px solid #fee2e2;
  transition: all 0.2s;
  font-size: 14px;

  .dark & {
    background: #450a0a20;
    border-color: #450a0a;
  }

  &:hover {
    background: #fef2f2;
    border-color: #ef4444;
    .dark & { background: #450a0a40; }
  }
`;

const AlertBox = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px 30px;
  border-radius: 24px;
  margin-bottom: 30px;
  font-weight: 800;
  font-size: 15px;
  ${(props) =>
    props.$type === "success"
      ? `
    background: #ecfdf5;
    color: #065f46;
    border: 1px solid #10b98140;
  `
      : `
    background: #fef2f2;
    color: #991b1b;
    border: 1px solid #ef444440;
  `}
`;
