import { useState, useEffect } from 'react';
import { Power, CheckCircle2, XCircle, Package, UtensilsCrossed, Zap, Coffee, IceCream, Droplet, Info, Loader2 } from 'lucide-react';
import { 
  MENU_LINGOTES, MENU_PROMOCIONES, MENU_POSTRES, 
  MENU_BEBIDAS, MENU_SALSAS 
} from '../data/menuPublico';
import { supabase } from '../lib/supabase';

interface StockState {
  [key: string]: boolean;
}

const GestionStock = () => {
  const [stock, setStock] = useState<StockState>({});
  const [activeCategory, setActiveCategory] = useState('lingotes');
  const [loading, setLoading] = useState(true);

  // Cargar estado inicial desde Supabase
  useEffect(() => {
    const fetchStock = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('disponibilidad')
        .select('*');

      if (!error && data) {
        const state: StockState = {};
        data.forEach((row: any) => {
          state[row.id] = row.is_available;
        });
        
        // Combinar con los productos del menú (por si hay nuevos)
        const allProducts = [...MENU_LINGOTES, ...MENU_PROMOCIONES, ...MENU_POSTRES, ...MENU_BEBIDAS, ...MENU_SALSAS];
        allProducts.forEach(p => {
          if (state[p.id] === undefined) state[p.id] = true;
        });

        setStock(state);
      }
      setLoading(false);
    };

    fetchStock();
  }, []);

  const toggleProduct = async (id: string | number) => {
    const currentState = stock[id] !== false;
    const newState = !currentState;

    // Actualización optimista en la UI
    setStock(prev => ({ ...prev, [id]: newState }));

    // Guardar en Supabase (Upsert: Inserta si no existe, actualiza si sí)
    const { error } = await supabase
      .from('disponibilidad')
      .upsert({ id: String(id), is_available: newState, updated_at: new Date().toISOString() });

    if (error) {
      console.error("Error al actualizar stock:", error);
      // Revertir si hay error
      setStock(prev => ({ ...prev, [id]: currentState }));
      alert("Error al conectar con la nube");
    }
  };

  const categories = [
    { id: 'lingotes', label: 'Lingotes', icon: UtensilsCrossed, data: MENU_LINGOTES },
    { id: 'promos', label: 'Promociones', icon: Zap, data: MENU_PROMOCIONES },
    { id: 'postres', label: 'Postres', icon: IceCream, data: MENU_POSTRES },
    { id: 'bebidas', label: 'Bebidas', icon: Coffee, data: MENU_BEBIDAS },
    { id: 'salsas', label: 'Salsas/Extras', icon: Droplet, data: MENU_SALSAS },
  ];

  const currentProducts = categories.find(c => c.id === activeCategory)?.data || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 text-left">
      
      {/* HEADER GESTIÓN */}
      <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl border border-white/5 mx-1">
        <div className="relative z-10">
          <h2 className="text-3xl font-black tracking-tighter uppercase italic leading-none mb-2">Monitor de Stock</h2>
          <p className="text-lingote-gold font-bold uppercase tracking-widest text-[10px] italic">Control GLOBAL en tiempo real</p>
        </div>
        <Power className="absolute -right-4 -bottom-4 text-white/5" size={150} />
      </div>

      {/* SELECTOR DE CATEGORÍA */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide px-1 no-print">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex-none flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-[10px] uppercase transition-all ${
              activeCategory === cat.id ? 'bg-slate-900 text-white shadow-lg scale-[1.02]' : 'bg-white text-slate-400 border border-slate-100'
            }`}
          >
            <cat.icon size={14} />
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-300 gap-4">
           <Loader2 className="animate-spin" size={48} />
           <p className="font-black uppercase tracking-widest text-[10px]">Conectando con la nube...</p>
        </div>
      ) : (
        /* LISTA DE PRODUCTOS CON SWITCHES */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mx-1">
          {currentProducts.map((p) => {
            const isAvailable = stock[p.id] !== false;
            return (
              <div key={p.id} className={`bg-white p-6 rounded-[2rem] border transition-all duration-500 flex items-center justify-between shadow-sm ${isAvailable ? 'border-lingote-accent' : 'border-red-100 opacity-60 bg-red-50/20'}`}>
                <div className="flex items-center gap-4">
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isAvailable ? 'bg-slate-50 text-slate-400' : 'bg-red-100 text-red-500'}`}>
                      <Package size={24} />
                   </div>
                   <div className="text-left">
                      <p className={`font-black uppercase text-sm italic leading-none ${isAvailable ? 'text-slate-800' : 'text-slate-400 line-through'}`}>{p.nombre}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">ID: {p.id}</p>
                   </div>
                </div>

                <button 
                  onClick={() => toggleProduct(p.id)}
                  className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none ${isAvailable ? 'bg-green-500' : 'bg-slate-300'}`}
                >
                  <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${isAvailable ? 'translate-x-9' : 'translate-x-1'}`} />
                  {isAvailable ? <CheckCircle2 className="absolute left-2 text-white" size={12} /> : <XCircle className="absolute right-2 text-white" size={12} />}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* PIE DE GESTIÓN */}
      <div className="bg-slate-900 p-6 rounded-2xl shadow-xl flex gap-4 mx-1 text-left border border-white/10">
         <div className="bg-white/10 p-3 rounded-xl shadow-sm text-lingote-gold shrink-0 h-fit"><Info size={20} /></div>
         <div className="space-y-1 text-white">
            <p className="font-black text-[10px] text-lingote-gold uppercase italic leading-none">Cloud Sincronizada</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase leading-relaxed">
              Modo Profesional Activo: Los cambios afectan a todos los clientes que escaneen el QR en tiempo real.
            </p>
         </div>
      </div>

    </div>
  );
};

export default GestionStock;
