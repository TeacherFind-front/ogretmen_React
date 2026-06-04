import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

import { changePassword } from "../../services/authService";

export default function TutorChangePassword() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Yeni şifreler uyuşmuyor!");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("Yeni şifre en az 6 karakter olmalıdır.");
      return;
    }

    try {
      setLoading(true);
      const res = await changePassword(formData.currentPassword, formData.newPassword);
      alert(res.message || "Şifreniz başarıyla güncellendi.");
      navigate("/tutor/profile");
    } catch (err) {
      setError(err.message || "Şifre güncellenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <header className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-4 flex items-center gap-1 hover:underline"
        >
          ← Profilime Dön
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Güvenlik Ayarları</h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">
          Hesap güvenliğinizi korumak için periyodik olarak şifrenizi
          yenilemenizi öneririz.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <form onSubmit={handleSubmit} className="p-8">
              <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-6 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                Şifre Güncelleme
              </h3>

              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-100 dark:border-red-900/30">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                <FormGroup>
                  <label>Mevcut Şifre</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    required
                    value={formData.currentPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currentPassword: e.target.value,
                      })
                    }
                  />
                </FormGroup>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormGroup>
                    <label>Yeni Şifre</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      required
                      value={formData.newPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          newPassword: e.target.value,
                        })
                      }
                    />
                  </FormGroup>

                  <FormGroup>
                    <label>Yeni Şifre (Tekrar)</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                    />
                  </FormGroup>
                </div>

                <div className="pt-6 border-t border-gray-100 dark:border-slate-800 flex justify-end">
                  <SubmitButton type="submit" disabled={loading}>
                    {loading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
                  </SubmitButton>
                </div>
              </div>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <InfoCard>
            <h4>Güvenlik İpuçları</h4>
            <ul>
              <li>
                <strong>Güçlü Şifre:</strong> En az 8 karakter, büyük-küçük
                harf, rakam ve sembol içermelidir.
              </li>
              <li>
                <strong>Benzersizlik:</strong> Başka platformlarda kullandığınız
                şifreleri tercih etmeyin.
              </li>
              <li>
                <strong>Gizlilik:</strong> Şifrenizi asla kimseyle paylaşmayın;
                biz dahil kimseden şifre talep etmeyiz.
              </li>
            </ul>
            <div className="mt-6 pt-6 border-t border-blue-100">
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                Son şifre değişikliği: Henüz yapılmadı
              </p>
            </div>
          </InfoCard>
        </div>
      </div>
    </Container>
  );
}

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const Card = styled.div`
  background: white;
  border-radius: 24px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);

  .dark & {
    background: #1e293b;
    border-color: #334155;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
  }
`;

const InfoCard = styled.div`
  background: #f0f7ff;
  padding: 24px;
  border-radius: 24px;
  border: 1px solid #dbeafe;

  .dark & {
    background: #1e3a8a20;
    border-color: #1e3a8a40;
  }

  h4 {
    font-weight: 800;
    color: #1e40af;
    margin-bottom: 16px;
    font-size: 15px;
    .dark & { color: #60a5fa; }
  }

  ul {
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 16px;

    li {
      font-size: 13px;
      color: #1e3a8a;
      line-height: 1.6;
      position: relative;
      padding-left: 14px;
      .dark & { color: #94a3b8; }

      &::before {
        content: "•";
        position: absolute;
        left: 0;
        color: #2d79f3;
        font-weight: bold;
      }
    }
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-size: 13px;
    font-weight: 700;
    color: #4b5563;
    margin-left: 4px;
    .dark & { color: #94a3b8; }
  }

  input {
    padding: 14px 18px;
    border-radius: 14px;
    border: 1.5px solid #e2e8f0;
    background: #f8fafc;
    font-size: 14px;
    width: 100%;
    transition: all 0.2s;

    .dark & {
      background: #0f172a;
      border-color: #334155;
      color: #f1f5f9;
    }

    &:focus {
      outline: none;
      border-color: #2d79f3;
      background: white;
      box-shadow: 0 0 0 4px rgba(45, 121, 243, 0.05);
      .dark & { background: #0f172a; border-color: #3b82f6; }
    }
  }
`;

const SubmitButton = styled.button`
  background: #2d79f3;
  color: white;
  padding: 14px 32px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 15px;
  box-shadow: 0 4px 12px rgba(45, 121, 243, 0.2);
  transition: all 0.2s;
  &:hover {
    background: #1e40af;
    transform: translateY(-1px);
  }
`;
