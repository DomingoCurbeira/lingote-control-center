import { useState, useEffect } from 'react';
import { 
  Star, Clock, Package, 
  UtensilsCrossed, Zap, Coffee, IceCream, Droplet, Info, Plus, ChevronRight, UserCheck 
} from 'lucide-react';
import { 
  MENU_LINGOTES, 
  MENU_PROMOCIONES, 
  MENU_BEBIDAS, 
  MENU_POSTRES, 
  MENU_SALSAS,
  HORARIO_LOCAL
} from '../data/menuPublico';
import { supabase } from '../lib/supabase';
import { useCartStore } from '../store/useCartStore';
import { useUserStore } from '../store/useUserStore';
import CartDrawer from './CartDrawer';
import ModalUsuario from './ModalUsuario';

interface LandingPageProps {
  // Ya no se requiere onAdminClick
}

const LandingPage = ({ }: LandingPageProps) => {
  const [activeCategory, setActiveCategory] = useState('lingotes');
  const [stock, setStock] = useState<Record<string, boolean>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const { addItem, itemsCount } = useCartStore();
  const { usuario } = useUserStore();

  // 1. Cargar estado inicial de stock y Suscribirse a cambios en TIEMPO REAL
  useEffect(() => {
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
      supabase.removeChannel(channel);
    };
  }, []);

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
  ];

  const activeData = categories.find(c => c.id === activeCategory)?.data || [];

  const handleAddItem = (item: any) => {
    addItem(item);
    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-32 animate-in fade-in duration-700 max-w-full overflow-x-hidden text-left">
      
      {/* HERO SECTION */}
      <section className="relative h-[45vh] flex flex-col items-center justify-center p-6 overflow-hidden bg-slate-900">
        <div className="absolute inset-0 opacity-40">
           <img src="/lingote_tortilla.jpg" className="w-full h-full object-cover" alt="Hero" />
           <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
        </div>
        
        <div className="relative z-10 text-center space-y-4">
           <div className="block mx-auto">
             <img src="/logo_lingote_oficial_ligero.png" alt="Logo" className="w-24 h-24 mx-auto drop-shadow-2xl animate-in zoom-in duration-1000" />
           </div>
           <div className="space-y-1">
             <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic leading-none">El Lingote Español</h1>
             <p className="text-lingote-gold font-bold uppercase tracking-[0.3em] text-[8px]">Artesanía Gastronómica Premium</p>
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
         <div className="grid grid-cols-5 gap-1 max-w-lg mx-auto">
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
         {/* NOTA INFORMATIVA */}
         <div className="bg-amber-50/50 border border-amber-100/50 p-4 rounded-2xl flex gap-3 items-center">
            <Info size={16} className="text-amber-600 shrink-0" />
            <p className="text-[9px] font-bold text-amber-800 uppercase italic leading-tight text-left">
               Imágenes con fines ilustrativos. Los lingotes se sirven al natural; salsas y extras se venden por separado.
            </p>
         </div>

         <div className="grid grid-cols-1 gap-6">
            {activeData.map((item: any) => {
              const isAvailable = stock[item.id] !== false;
              
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
                           {item.precioAnterior && <p className="text-slate-300 text-[10px] font-bold line-through mt-1">Antes ₡{item.precioAnterior.toLocaleString()}</p>}
                           <p className="text-slate-500 text-[11px] leading-relaxed font-medium mt-2">{item.descripcion || item.desc}</p>
                        </div>
                        {isAvailable && isOpen && (
                          <button 
                            onClick={() => handleAddItem(item)}
                            className="bg-slate-900 text-white p-3 rounded-2xl shadow-lg active:scale-90 transition-transform"
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

    </div>
  );
};

export default LandingPage;
