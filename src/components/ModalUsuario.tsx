import { useState, useEffect } from 'react';
import { Smartphone, User, ChevronRight, X, Loader2, Mail, CheckCircle2, Lock, LogOut } from 'lucide-react';
import { useUserStore } from '../store/useUserStore';
import { supabase } from '../lib/supabase';
import { notify } from '../utils/notifications';
import StampCard from './StampCard';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isAdminLogin?: boolean;
}

const ModalUsuario = ({ isOpen, onClose, isAdminLogin = false }: Props) => {
  const { usuario, setUsuario, borrarUsuario } = useUserStore();
  const [email, setEmail] = useState(usuario?.email || '');
  const [nombre, setNombre] = useState(usuario?.nombre || '');
  const [telefono, setTelefono] = useState(usuario?.telefono || '');
  const [puntos, setPuntos] = useState(0);
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [buscando, setBuscando] = useState(false);
  const [esNuevo, setEsNuevo] = useState(true);
  const [mostrarPassword, setMostrarPassword] = useState(isAdminLogin);
  const [mensajeExito, setMensajeExito] = useState('');

  useEffect(() => {
    if (isOpen) {
      setEmail(usuario?.email || '');
      setNombre(usuario?.nombre || '');
      setTelefono(usuario?.telefono || '');
      setEsNuevo(!usuario);
      setMensajeExito('');

      // Cargar puntos si ya existe usuario
      if (usuario) {
        const fetchPuntos = async () => {
          const { data } = await supabase
            .from('clientes')
            .select('puntos_lealtad')
            .eq('email', usuario.email.toLowerCase())
            .single();
          if (data) setPuntos(data.puntos_lealtad);
        };
        fetchPuntos();
      }
    }
  }, [isOpen, usuario]);

  // Función para buscar cliente cuando el email cambia y es válido
  const handleEmailBlur = async () => {
    if (!email.includes('@') || !email.includes('.')) return;
    
    setBuscando(true);
    
    // 1. Verificar si es un email de Administrador
    const adminEmails = ['domingocurbeira@gmail.com', 'ellingoteespanol@gmail.com'];
    if (adminEmails.includes(email.toLowerCase().trim())) {
      setMostrarPassword(true);
      setEsNuevo(false);
      setBuscando(false);
      return;
    }

    // 2. Buscar en la tabla de clientes
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (!error && data) {
      setNombre(data.nombre);
      setTelefono(data.telefono);
      setEsNuevo(false);
      notify.success(`¡Bienvenido de nuevo, ${data.nombre.split(' ')[0]}!`, "Tus datos han sido cargados automáticamente.");
    } else {
      setEsNuevo(true);
    }
    setBuscando(false);
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mostrarPassword) {
      // Lógica de Login Admin con Supabase Auth
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password: password
      });

      if (authError) {
        notify.alertError("Error de Acceso", authError.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        setUsuario({ 
          nombre: "ADMINISTRADOR", 
          telefono: "00000000", 
          email: email.toLowerCase(),
          isAdmin: true 
        });
        onClose();
      }
    } else {
      // Lógica de Cliente
      if (nombre.length > 2 && telefono.length >= 8) {
        const { error } = await supabase
          .from('clientes')
          .upsert({ 
            email: email.toLowerCase(),
            telefono, 
            nombre: nombre.toUpperCase(),
            ultima_compra: new Date().toISOString()
          });

        if (error) console.error("Error sync:", error);

        setUsuario({ nombre: nombre.toUpperCase(), telefono, email: email.toLowerCase() });
        setLoading(false);
        onClose();
      }
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-sm rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in duration-500 border border-slate-100 flex flex-col max-h-[90vh]">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-300 hover:text-slate-500 transition-colors z-10 bg-white/80 backdrop-blur-sm rounded-full p-1">
          <X size={24} />
        </button>

        <div className="p-8 md:p-10 overflow-y-auto scrollbar-hide">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-inner">
              <img src="/logo_lingote_oficial_ligero.png" alt="Logo" className="w-12 h-12 object-contain" />
            </div>
            <h3 className="text-xl font-black italic text-slate-800 uppercase tracking-tighter leading-none">
              {usuario ? 'Tu Perfil' : mostrarPassword ? 'Acceso' : 'Hola,'} <span className="text-lingote-gold">{usuario ? 'VIP' : mostrarPassword ? 'Admin' : 'Bienvenido!'}</span>
            </h3>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">
              {usuario ? 'Gestioná tus puntos y datos' : mostrarPassword ? 'Introduce tus credenciales' : 'Identifícate para tu pedido'}
            </p>
          </div>

          {usuario && !usuario.isAdmin && (
             <div className="mb-8 animate-in zoom-in duration-500">
                <StampCard puntos={puntos} />
             </div>
          )}

          {mensajeExito && (
            <div className="mb-6 bg-green-50 text-green-600 p-3 rounded-xl flex items-center gap-2 animate-in slide-in-from-top-2 duration-300">
              <CheckCircle2 size={16} />
              <p className="text-[10px] font-black uppercase italic">{mensajeExito}</p>
            </div>
          )}

          <form onSubmit={handleGuardar} className="space-y-4">
            {/* EMAIL (BLOQUEADO SI YA EXISTE) */}
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                required
                disabled={!!usuario}
                type="email" 
                placeholder="TU EMAIL"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={handleEmailBlur}
                className={`w-full border-2 rounded-2xl py-4 pl-14 pr-10 font-black text-xs outline-none transition-all ${usuario ? 'bg-slate-100 border-slate-100 text-slate-400' : 'bg-slate-50 border-slate-100 focus:border-lingote-gold text-slate-700'}`}
              />
              {buscando && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-lingote-gold animate-spin" size={16} />}
            </div>

            {mostrarPassword ? (
              /* CAMPO PASSWORD PARA ADMIN (SI NO ESTÁ LOGUEADO) */
              !usuario && (
                <div className="relative animate-in slide-in-from-bottom-2">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    required
                    type="password" 
                    placeholder="CONTRASEÑA"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-14 pr-4 font-black text-xs outline-none focus:border-lingote-gold transition-all"
                  />
                </div>
              )
            ) : (
              /* CAMPOS NOMBRE Y TELÉFONO */
              <div className="space-y-4 animate-in fade-in duration-500">
                <div className="relative">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    required
                    type="text" 
                    placeholder="TU NOMBRE"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-14 pr-4 font-black text-xs outline-none focus:border-lingote-gold transition-all placeholder:text-slate-200"
                  />
                </div>

                <div className="relative">
                  <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    required
                    type="tel" 
                    placeholder="TU WHATSAPP"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-14 pr-4 font-black text-xs outline-none focus:border-lingote-gold transition-all placeholder:text-slate-200"
                  />
                </div>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading || buscando}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase italic flex items-center justify-center gap-2 shadow-2xl active:scale-95 transition-all mt-4 tracking-widest text-xs disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>{usuario ? 'Actualizar Perfil' : mostrarPassword ? 'Iniciar Sesión' : esNuevo ? 'Registrarme' : 'Confirmar Datos'} <ChevronRight size={18} /></>
              )}
            </button>
          </form>
          
          <div className="mt-8 flex flex-col items-center gap-4">
            {usuario && (
              <button 
                onClick={() => {
                  borrarUsuario();
                  onClose();
                  notify.success("Sesión cerrada", "Has salido de tu perfil correctamente.");
                }}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-red-50 text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-100 transition-all border border-red-100"
              >
                <LogOut size={16} /> Cerrar Sesión en este equipo
              </button>
            )}
            <button 
              onClick={onClose}
              className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] hover:text-slate-400 transition-colors italic"
            >
              Cerrar Ventana
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalUsuario;
