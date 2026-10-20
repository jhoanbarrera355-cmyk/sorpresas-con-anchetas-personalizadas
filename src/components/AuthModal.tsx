import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, MapPin, ShieldAlert, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { BrandLogo } from './BrandLogo.tsx';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Bogotá D.C.');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    if (tab === 'login') {
      const res = await login(email, password);
      setLoading(false);
      if (res.success) {
        onClose();
        if (onSuccess) onSuccess();
      } else {
        setErrorMsg(res.error || 'Credenciales inválidas');
      }
    } else {
      if (!name.trim() || !phone.trim()) {
        setErrorMsg('Por favor completa nombre y teléfono');
        setLoading(false);
        return;
      }
      const res = await register({
        name,
        email,
        phone,
        password,
        address,
        city
      });
      setLoading(false);
      if (res.success) {
        onClose();
        if (onSuccess) onSuccess();
      } else {
        setErrorMsg(res.error || 'Error al crear cuenta');
      }
    }
  };

  const fillQuickCredentials = (role: 'admin' | 'customer') => {
    if (role === 'admin') {
      setEmail('admin@sorpresascons.com');
      setPassword('Admin123*');
      setTab('login');
    } else {
      setEmail('carolina@ejemplo.com');
      setPassword('Admin123*');
      setTab('login');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl animate-scale-in space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <BrandLogo size="sm" />
            <h2 className="text-lg font-bold text-stone-900">
              {tab === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta Nueva'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex p-1 bg-stone-100 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-colors ${
              tab === 'login' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Ya tengo cuenta
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-colors ${
              tab === 'register' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Registrarme
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {tab === 'register' && (
            <>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Nombre Completo *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    required
                    placeholder="Ej: Juliana Restrepo"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border rounded-xl bg-stone-50 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Celular (WhatsApp) *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="tel"
                    required
                    placeholder="Ej: 310 456 7890"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border rounded-xl bg-stone-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Dirección habitual</label>
                  <input
                    type="text"
                    placeholder="Calle 100 # 15-20"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-stone-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Ciudad</label>
                  <input
                    type="text"
                    placeholder="Bogotá D.C."
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-stone-50 focus:bg-white"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Correo Electrónico *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="email"
                required
                placeholder="tu@correo.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border rounded-xl bg-stone-50 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Contraseña *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="password"
                required
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border rounded-xl bg-stone-50 focus:bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/20 disabled:opacity-50"
          >
            <span>{loading ? 'Validando...' : tab === 'login' ? 'Ingresar a mi Cuenta' : 'Registrar mi Cuenta'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Quick Demo Access Buttons for instant testability */}
        <div className="pt-3 border-t border-stone-100 text-center space-y-2">
          <p className="text-[11px] text-stone-400">Acceso rápido para pruebas:</p>
          <div className="flex gap-2 justify-center">
            <button
              type="button"
              onClick={() => fillQuickCredentials('admin')}
              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-[11px] font-semibold transition-colors"
            >
              Probar como Administrador
            </button>
            <button
              type="button"
              onClick={() => fillQuickCredentials('customer')}
              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-[11px] font-semibold transition-colors"
            >
              Probar como Cliente
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
