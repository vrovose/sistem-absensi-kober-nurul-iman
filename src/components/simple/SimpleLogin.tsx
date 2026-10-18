import React, { useState } from 'react';
import { storage, ADMIN_CREDENTIALS } from '../../services/storage';
import { Lock, User, Eye, EyeOff, School, ArrowRight, ShieldCheck } from 'lucide-react';

interface SimpleLoginProps {
  onLoginSuccess: () => void;
}

export const SimpleLogin: React.FC<SimpleLoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const res = storage.login(username.trim(), password);
    if (res.success) {
      onLoginSuccess();
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleUseDefaultCredentials = () => {
    setUsername(ADMIN_CREDENTIALS.username);
    setPassword(ADMIN_CREDENTIALS.password);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-5">
        {/* Logo & Judul Ringkas */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-400/30 items-center justify-center shadow-lg">
            <School className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            KOBER NURUL IMAN
          </h1>
          <p className="text-xs text-slate-400">
            Sistem Administrasi & Presensi · Kota Bandung
          </p>
        </div>

        {/* Card Login */}
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Masuk Akun</h2>
            <ShieldCheck className="w-4 h-4 text-sky-600" />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="AdminKOBERNurul_Iman"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium text-xs sm:text-sm focus:outline-hidden focus:border-sky-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium text-xs sm:text-sm focus:outline-hidden focus:border-sky-500 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <span>Masuk</span>
              <ArrowRight className="w-4 h-4 text-sky-300" />
            </button>
          </form>

          {/* Quick-fill */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleUseDefaultCredentials}
              className="w-full py-2 px-3 bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 rounded-xl text-xs font-semibold flex items-center justify-between"
            >
              <span>Gunakan Akun Admin Resmi</span>
              <span className="text-[11px] text-sky-700 font-mono">Auto-fill</span>
            </button>
          </div>
        </div>

        <p className="text-center text-slate-500 text-xs">
          KOBER Nurul Iman Kota Bandung
        </p>
      </div>
    </div>
  );
};
