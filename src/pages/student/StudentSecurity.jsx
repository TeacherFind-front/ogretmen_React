import React, { useState } from "react";
import styled from "styled-components";
import { Shield, Lock, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { changePassword } from "@/services/authService";

export default function StudentSecurity() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" });
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setStatus({ type: "error", message: "Yeni şifreler eşleşmiyor." });
      return;
    }

    setLoading(true);
    setStatus({ type: null, message: "" });

    try {
      await changePassword(formData.currentPassword, formData.newPassword);
      setStatus({ type: "success", message: "Şifreniz başarıyla güncellendi!" });
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setStatus({ type: "error", message: err.message || "Bir hata oluştu." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <header className="mb-10">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Güvenlik Ayarları</h1>
        <p className="text-gray-500 font-medium mt-2">Hesabınızın güvenliğini yönetin ve şifrenizi güncelleyin.</p>
      </header>

      <div className="max-w-2xl">
        <Card>
          <div className="p-8 border-b border-gray-50 bg-gray-50/30">
            <h3 className="text-lg font-black text-gray-900 flex items-center gap-3">
              <Shield className="w-6 h-6 text-blue-600" /> Şifre Değiştir
            </h3>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {status.message && (
              <AlertBox $type={status.type}>
                {status.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                {status.message}
              </AlertBox>
            )}

            <FormGroup>
              <label>Mevcut Şifre</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  type="password" 
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                  required 
                />
              </div>
            </FormGroup>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormGroup>
                <label>Yeni Şifre</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input 
                    type="password" 
                    value={formData.newPassword}
                    onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                    required 
                  />
                </div>
              </FormGroup>

              <FormGroup>
                <label>Yeni Şifre (Tekrar)</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input 
                    type="password" 
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    required 
                  />
                </div>
              </FormGroup>
            </div>

            <div className="pt-4 flex justify-end">
              <SubmitButton type="submit" disabled={loading}>
                {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                Şifreyi Güncelle
              </SubmitButton>
            </div>
          </form>
        </Card>

        <div className="mt-10 p-6 bg-blue-50 rounded-3xl border border-blue-100 flex items-start gap-4">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
            <Shield size={20} />
          </div>
          <div>
            <p className="font-black text-blue-900 text-sm mb-1">Güvenlik İpucu</p>
            <p className="text-xs text-blue-700 font-bold leading-relaxed">
              Güçlü bir şifre en az 8 karakterden oluşmalı; büyük harf, küçük harf, rakam ve sembol içermelidir. 
              Şifrenizi kimseyle paylaşmayın.
            </p>
          </div>
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
  border-radius: 32px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 10px 30px rgba(0,0,0,0.04);
  overflow: hidden;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-size: 13px;
    font-weight: 800;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-left: 4px;
  }

  input {
    padding: 14px 20px 14px 44px;
    border-radius: 18px;
    border: 2px solid #f1f5f9;
    background: #f8fafc;
    font-size: 15px;
    font-weight: 600;
    width: 100%;
    transition: all 0.2s;
    &:focus { outline: none; border-color: #2d79f3; background: white; }
  }
`;

const SubmitButton = styled.button`
  background: #111827;
  color: white;
  padding: 16px 32px;
  border-radius: 20px;
  font-weight: 900;
  font-size: 15px;
  display: flex;
  align-items: center;
  transition: all 0.2s;
  &:hover { background: #000; transform: translateY(-1px); }
  &:disabled { opacity: 0.7; cursor: not-allowed; }
`;

const AlertBox = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  border-radius: 18px;
  font-weight: 700;
  font-size: 14px;
  ${props => props.$type === 'success' ? `
    background: #ecfdf5;
    color: #065f46;
    border: 1px solid #10b98120;
  ` : `
    background: #fef2f2;
    color: #991b1b;
    border: 1px solid #ef444420;
  `}
`;
