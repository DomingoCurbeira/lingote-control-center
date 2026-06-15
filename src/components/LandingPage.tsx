import { useState, useEffect } from 'react';
import { 
  Star, Clock, Package, 
  UtensilsCrossed, Zap, Coffee, IceCream, Droplet, Info, Plus, ChevronRight, UserCheck, AlertTriangle,
  Smartphone, Download, X as XIcon, Users
} from 'lucide-react';
import { 
  MENU_LINGOTES, 
  MENU_PROMOCIONES, 
  MENU_BEBIDAS, 
  MENU_POSTRES, 
  MENU_SALSAS,
  MENU_FAMILIAR,
  HORARIO_LOCAL
} from '../data/menuPublico';
import { supabase } from '../lib/supabase';
import { useCartStore } from '../store/useCartStore';
import { useUserStore } from '../store/useUserStore';
import CartDrawer from './CartDrawer';
import ModalUsuario from './ModalUsuario';
import UbicacionSeccion from './UbicacionSeccion';

interface LandingPageProps {
  // Ya no se requiere onAdminClick
}

const WhatsAppIcon = ({ className, size = 20 }: { className?: string; size?: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.634 1.437h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const LandingPage = ({ }: LandingPageProps) => {
  const [activeCategory, setActiveCategory] = useState('lingotes');
  const [stock, setStock] = useState<Record<string, boolean>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(true);
  const { addItem, itemsCount } = useCartStore();
  const { usuario } = useUserStore();

  // 1. Cargar estado inicial de stock y Suscribirse a cambios en TIEMPO REAL
  useEffect(() => {
    // Escuchar evento de instalación PWA
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    const fetchInitialStock = async () => {
      const { data, error } = await supabase
        .from('disponibilidad')
        .select('id, is_available');
      
      if (!error && data) {
        const state: Record<string, boolean> = {};
        data.forEach(row => state[row.id] = row.is_available);
        setStock(state);
      }
    };

    fetchInitialStock();

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'disponibilidad' },
        (payload) => {
          const { id, is_available } = payload.new as any;
          setStock(prev => ({ ...prev, [id]: is_available }));
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      supabase.removeChannel(channel);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  // Lógica de Horario Dinámico
  const checkStatus = () => {
    const ahora = new Date();
    const dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const diaHoy = dias[ahora.getDay()];
    const h = HORARIO_LOCAL[diaHoy];

    if (h.cerradoTodoElDia) return false;

    const [ha, ma] = h.abierto.split(':').map(Number);
    const [hc, mc] = h.cerrado.split(':').map(Number);
    const minAhora = ahora.getHours() * 60 + ahora.getMinutes();
    
    return minAhora >= (ha * 60 + ma) && minAhora < (hc * 60 + mc);
  };

  const isOpen = checkStatus();

  const categories = [
    { id: 'lingotes', label: 'Lingotes', icon: UtensilsCrossed, data: MENU_LINGOTES },
    { id: 'promos', label: 'Promos', icon: Zap, data: MENU_PROMOCIONES },
    { id: 'postres', label: 'Postres', icon: IceCream, data: MENU_POSTRES },
    { id: 'bebidas', label: 'Bebidas', icon: Coffee, data: MENU_BEBIDAS },
    { id: 'salsas', label: 'Extras', icon: Droplet, data: MENU_SALSAS },
    { id: 'familiar', label: 'Eventos', icon: Package, data: MENU_FAMILIAR },
  ];

  const activeData = categories.find(c => c.id === activeCategory)?.data || [];

  const handleAddItem = (item: any) => {
    addItem(item);
    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-32 animate-in fade-in duration-700 w-full overflow-x-clip text-left">
      
      {/* HERO SECTION */}
      <section className="relative h-[45vh] w-full flex flex-col items-center justify-center p-6 overflow-hidden bg-slate-900">
        <div className="absolute inset-0 opacity-40">
           <img src="/bodegon.webp" className="w-full h-full object-cover" alt="Hero" />
           <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
        </div>
        
        <div className="relative z-10 text-center space-y-4">
           <div className="block mx-auto">
             <img src="/logo_lingote_oficial_ligero.png" alt="Logo" className="w-24 h-24 mx-auto drop-shadow-2xl animate-in zoom-in duration-1000" />
           </div>
           <div className="space-y-1">
             <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic leading-none">El Lingote Español</h1>
             <p className="text-lingote-gold font-bold uppercase tracking-[0.3em] text-[8px]">Raíces Españolas, Corazón Tico</p>
           </div>
        </div>

        <div className="absolute bottom-6 left-0 w-full px-6 flex justify-between items-center z-10">
           <button 
             onClick={() => setIsUserModalOpen(true)}
             className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 active:scale-95 transition-all"
           >
              <UserCheck className={usuario ? "text-green-400" : "text-white"} size={14} />
              <span className="text-white text-[10px] font-black uppercase tracking-widest italic">
                {usuario ? `Hola, ${usuario.nombre.split(' ')[0]}` : 'Identificarse'}
              </span>
           </button>
           <div className={`flex items-center gap-2 backdrop-blur-md px-3 py-1.5 rounded-full border ${isOpen ? 'bg-white/10 border-white/10' : 'bg-red-500/10 border-red-500/20'}`}>
              <Clock className={isOpen ? 'text-lingote-gold' : 'text-red-400'} size={12} />
              <span className={`text-[9px] font-black uppercase tracking-widest italic ${isOpen ? 'text-white' : 'text-red-400'}`}>
                {isOpen ? 'Abierto' : 'Cerrado'}
              </span>
           </div>
        </div>
      </section>

      {/* CATEGORY SELECTOR */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-100 px-2 py-3 no-print">
         <div className="grid grid-cols-6 gap-1 max-w-lg mx-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex flex-col items-center justify-center gap-1.5 py-2 rounded-2xl transition-all ${
                  activeCategory === cat.id 
                  ? 'bg-slate-900 text-white shadow-lg' 
                  : 'bg-transparent text-slate-400 hover:bg-slate-50'
                }`}
              >
                <cat.icon size={16} className={activeCategory === cat.id ? 'text-lingote-gold' : ''} />
                <span className="text-[7px] font-black uppercase tracking-tighter text-center leading-none px-0.5">{cat.label}</span>
              </button>
            ))}
         </div>
      </div>

      {/* CONTENIDO DEL MENÚ */}
      <main className="p-4 md:p-6 space-y-6 max-w-lg mx-auto min-h-[60vh]">
         {/* NOTA INFORMATIVA O MODO TEST ADMIN */}
         {usuario?.isAdmin ? (
            <div className="bg-slate-900 border-2 border-lingote-gold p-4 rounded-2xl flex gap-3 items-center shadow-xl animate-pulse">
               <AlertTriangle size={20} className="text-lingote-gold shrink-0" />
               <div className="text-left">
                  <p className="text-[10px] font-black text-lingote-gold uppercase italic leading-tight">Modo Administrador Activo</p>
                  <p className="text-[8px] text-white/60 font-bold uppercase mt-0.5">Los botones de compra están habilitados para pruebas técnicas.</p>
               </div>
            </div>
         ) : activeCategory === 'familiar' ? (
            <div className="bg-slate-900 border-2 border-lingote-gold/50 p-6 rounded-[2.5rem] space-y-3 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-lingote-gold/5 blur-3xl rounded-full -mr-16 -mt-16" />
               <div className="flex gap-4 items-center relative z-10">
                  <div className="bg-lingote-gold/20 p-3 rounded-2xl text-lingote-gold">
                    <Clock size={20} />
                  </div>
                  <div className="text-left">
                     <p className="text-xs font-black text-white uppercase italic leading-none">Servicio de Catering & Eventos</p>
                     <p className="text-[9px] text-lingote-gold font-bold uppercase tracking-widest mt-1">Requiere 24h a 48h de anticipación</p>
                  </div>
               </div>
               <p className="text-[10px] text-slate-400 font-medium leading-relaxed relative z-10">
                  Nuestras ediciones familiares son piezas de autor elaboradas bajo pedido. Consultá disponibilidad de fecha para garantizar la frescura absoluta en tu evento.
               </p>
            </div>
         ) : (
            <div className="bg-amber-50/50 border border-amber-100/50 p-4 rounded-2xl flex gap-3 items-center">
               <Info size={16} className="text-amber-600 shrink-0" />
               <p className="text-[9px] font-bold text-amber-800 uppercase italic leading-tight text-left">
                  Imágenes con fines ilustrativos. Los lingotes se sirven al natural; salsas y extras se venden por separado.
               </p>
            </div>
         )}

         <div className="grid grid-cols-1 gap-6">
            {activeData.map((item: any) => {
              const isAvailable = stock[item.id] !== false;
              const isActivo = item.activo !== false;

              // Si el producto no está activo y no es admin, no lo mostramos
              if (!isActivo && !usuario?.isAdmin) return null;

              if (activeCategory === 'familiar') {
                const isBestia = item.id === 'fam-supremo';
                
                return (
                  <div key={item.id} className={`group rounded-[2rem] border shadow-2xl overflow-hidden flex flex-col active:scale-[0.98] transition-all relative ${
                    isBestia 
                    ? 'bg-slate-900 border-amber-500/50 shadow-[0_0_40px_rgba(245,158,11,0.15)] ring-2 ring-amber-500/20' 
                    : 'bg-slate-900 border-lingote-gold/30'
                  } ${isAvailable ? '' : 'border-red-900/50 opacity-70 grayscale'}`}>
                     
                     {!isActivo && (
                       <div className="absolute top-4 left-4 z-40 bg-indigo-600 text-white px-3 py-1 rounded-full font-black text-[8px] uppercase tracking-widest border border-white/20 shadow-xl">
                         MODO PREVIEW (OCULTO AL PÚBLICO)
                       </div>
                     )}

                     {!isAvailable && (
                       <div className="absolute inset-0 z-30 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center">
                          <div className="bg-red-600 text-white px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl border-2 border-white">No Disponible</div>
                       </div>
                     )}

                     <div className={`p-8 space-y-6 text-center relative z-10 flex flex-col items-center ${isBestia ? 'md:p-12' : ''}`}>
                        <div className="flex flex-col items-center gap-3">
                           <div className="bg-lingote-gold/10 text-lingote-gold px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest border border-lingote-gold/20 flex items-center gap-2">
                             <Users size={12} /> EDICIÓN CATERING (10-12 PAX)
                           </div>
                           {item.apodo && (
                              <div className={`font-serif italic font-medium ${isBestia ? 'text-2xl text-amber-400' : 'text-lg text-lingote-gold/80'}`}>
                                {item.apodo}
                              </div>
                           )}
                        </div>
                        
                        <div>
                           <h3 className={`${isBestia ? 'text-3xl md:text-4xl' : 'text-2xl'} font-black text-white uppercase tracking-tighter leading-none italic`}>{item.nombre}</h3>
                           <div className={`h-1 bg-lingote-gold mx-auto mt-4 rounded-full ${isBestia ? 'w-24' : 'w-12'}`}></div>
                        </div>
                        
                        <p className={`text-slate-400 leading-relaxed font-medium px-4 ${isBestia ? 'text-sm' : 'text-xs'}`}>{item.descripcion || item.desc}</p>
                        
                        {item.vinculoIndividual && (
                           <button 
                             onClick={(e) => {
                               e.stopPropagation();
                               setActiveCategory(item.vinculoIndividual.categoria);
                               window.scrollTo({ top: 0, behavior: 'smooth' });
                             }}
                             className="text-[10px] font-black text-lingote-gold/60 uppercase tracking-widest hover:text-lingote-gold transition-colors flex items-center gap-1 italic"
                           >
                             Ver versión individual <ChevronRight size={12} />
                           </button>
                        )}

                        <div className={`text-lingote-gold font-black border-t border-white/10 w-full pt-4 ${isBestia ? 'text-3xl' : 'text-2xl'}`}>
                           ₡{item.precio.toLocaleString()}
                        </div>

                        <button 
                          onClick={() => {
                            const phone = "34639835391";
                            const msg = `Hola! Me interesa reservar el ${item.nombre.toUpperCase()} (${item.apodo || ''}) para un evento. Me podrían confirmar disponibilidad de fecha y detalles? Muchas gracias!`;
                            window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
                          }}
                          className={`w-full mt-2 py-4 rounded-2xl shadow-xl active:scale-95 transition-transform flex items-center justify-center gap-2 font-black uppercase text-sm ${
                            isBestia ? 'bg-amber-500 text-slate-950 shadow-amber-500/20' : 'bg-white text-slate-900'
                          }`}
                        >
                          <WhatsAppIcon className={isBestia ? 'text-slate-900' : 'text-[#25D366]'} /> 
                          {isBestia ? 'Consultar La Bestia' : 'Consultar Disponibilidad'}
                        </button>
                     </div>
                  </div>
                );
              }

              return (
                <div key={item.id} className={`group bg-white rounded-[2rem] border shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col active:scale-[0.98] transition-all relative ${isAvailable ? 'border-slate-100' : 'border-red-50 opacity-70 grayscale'}`}>

                   {!isAvailable && (
                     <div className="absolute inset-0 z-30 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center">
                        <div className="bg-red-600 text-white px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl border-2 border-white">Agotado</div>
                     </div>
                     )}
                   {item.ahorro && (
                     <div className="absolute top-4 left-4 z-20 bg-green-500 text-white px-4 py-1 rounded-full font-black text-[10px] uppercase italic shadow-lg animate-pulse">
                       Ahorras ₡{item.ahorro.toLocaleString()}
                     </div>
                   )}

                   {item.formatoRetail && (
                     <div className="absolute top-4 left-4 z-20 bg-slate-900 text-lingote-gold px-4 py-1.5 rounded-full font-black text-[9px] uppercase tracking-widest border border-white/20 shadow-xl flex items-center gap-2">
                       <Package size={12} /> FRASCO GOURMET
                     </div>
                   )}

                   <div className={`${item.imagen ? 'h-52' : 'h-24 bg-slate-50'} overflow-hidden relative`}>
                      {item.imagen ? (
                        <img src={`/${item.imagen}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={item.nombre} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center opacity-10"><UtensilsCrossed size={48} /></div>
                      )}
                      <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur-md text-white px-4 py-1.5 rounded-full font-black text-sm border border-white/10 italic shadow-2xl">
                         ₡{item.precio.toLocaleString()}
                      </div>
                   </div>

                   <div className="p-5 space-y-3 text-left">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                           <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight leading-none italic">{item.nombre}</h3>
                           {item.apodo && (
                              <p className="text-sm font-serif italic text-amber-600 mt-1 font-bold tracking-wide">
                                 {item.apodo}
                              </p>
                           )}
                           {item.precioAnterior && <p className="text-slate-300 text-[10px] font-bold line-through mt-1">Antes ₡{item.precioAnterior.toLocaleString()}</p>}
                           <p className="text-slate-500 text-[11px] leading-relaxed font-medium mt-2">{item.descripcion || item.desc}</p>
                           
                           {item.vinculoCatering && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveCategory('familiar');
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="mt-2 text-[9px] font-black text-amber-600 uppercase tracking-widest hover:text-amber-700 transition-colors flex items-center gap-1 italic"
                              >
                                ¿Planeas un evento especial? Disponible en Edición Catering <ChevronRight size={10} />
                              </button>
                           )}

                           {item.proximamenteCatering && (
                              <div className="mt-3 inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full shadow-sm">
                                <span className="w-1.5 h-1.5 bg-lingote-gold rounded-full animate-ping"></span>
                                <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.15em]">Edición Catering Próximamente</span>
                              </div>
                           )}
                        </div>
                        {((isAvailable && isOpen) || usuario?.isAdmin) && (
                          <button 
                            onClick={() => handleAddItem(item)}
                            className={`p-3 rounded-2xl shadow-lg active:scale-90 transition-transform ${usuario?.isAdmin ? 'bg-lingote-gold text-slate-900 border-2 border-slate-900' : 'bg-slate-900 text-white'}`}
                          >
                            <Plus size={20} />
                          </button>
                        )}
                      </div>

                      {item.ingredientesBase && (
                         <div className="flex flex-wrap gap-1.5 pt-1">
                            {item.ingredientesBase.map((ing: string) => (
                              <span key={ing} className="bg-slate-50 text-slate-400 text-[8px] font-black uppercase px-2 py-0.5 rounded-md border border-slate-100/50">{ing}</span>
                            ))}
                         </div>
                      )}
                   </div>
                </div>
              );
            })}
         </div>
      </main>

      <UbicacionSeccion />

      {/* FOOTER */}
      <footer className="mt-12 p-8 text-center space-y-6 pb-40">
         <div className="flex justify-center gap-4">
            <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg"><Star size={18} /></div>
            <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg"><Star size={18} /></div>
            <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg"><Star size={18} /></div>
         </div>
         <div className="space-y-1">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em]">El Lingote Español</p>
            <p className="text-[8px] font-bold uppercase text-slate-300 tracking-[0.2em]">Gastronomía de Autor • Cartago</p>
         </div>
      </footer>

      {/* BARRA DE PEDIDO FLOTANTE (CARRITO) */}
      {itemsCount() > 0 && (
        <div className="fixed bottom-6 left-0 w-full px-6 z-50 flex justify-center">
           <button 
             onClick={() => setIsCartOpen(true)}
             className="w-full max-w-sm bg-slate-900 text-white py-5 rounded-[2rem] font-black text-sm uppercase italic tracking-widest shadow-2xl flex items-center justify-between px-8 active:scale-95 transition-all border border-white/10"
           >
              <div className="flex items-center gap-3">
                 <div className="bg-lingote-gold text-slate-900 w-6 h-6 rounded-full flex items-center justify-center text-[10px]">{itemsCount()}</div>
                 <span>Ver mi Pedido</span>
              </div>
              <ChevronRight size={20} className="text-lingote-gold" />
           </button>
        </div>
      )}

      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        localOpen={isOpen} 
        onRequireUser={() => {
          setIsCartOpen(false);
          setIsUserModalOpen(true);
        }}
      />

      <ModalUsuario 
        isOpen={isUserModalOpen} 
        onClose={() => setIsUserModalOpen(false)} 
      />

      {/* BANNER DE INSTALACIÓN PWA */}
      {installPrompt && showInstallBanner && (
        <div className="fixed bottom-24 left-0 w-full px-6 z-[60] animate-in slide-in-from-bottom-10 duration-700">
           <div className="bg-slate-900 border-2 border-lingote-gold p-6 rounded-[2.5rem] shadow-2xl flex items-center justify-between gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-lingote-gold/5 blur-3xl rounded-full -mr-16 -mt-16" />
              
              <div className="flex items-center gap-4 relative z-10">
                 <div className="bg-white/10 p-3 rounded-2xl text-lingote-gold shadow-lg">
                    <Smartphone size={24} />
                 </div>
                 <div className="text-left">
                    <p className="text-xs font-black text-white uppercase italic leading-none">Instalá nuestra App</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Más rápido y sin internet</p>
                 </div>
              </div>

              <div className="flex items-center gap-3 relative z-10">
                 <button 
                   onClick={handleInstall}
                   className="bg-lingote-gold text-slate-900 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all shadow-lg flex items-center gap-2"
                 >
                    <Download size={14} /> Instalar
                 </button>
                 <button 
                   onClick={() => setShowInstallBanner(false)}
                   className="p-2 text-white/30 hover:text-white transition-colors"
                 >
                    <XIcon size={18} />
                 </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default LandingPage;
