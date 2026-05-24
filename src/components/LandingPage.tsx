import { useState } from 'react';
import { 
  Star, Clock, Package, 
  UtensilsCrossed, Zap, Coffee, IceCream, Droplet 
} from 'lucide-react';
import { 
  MENU_LINGOTES, 
  MENU_PROMOCIONES, 
  MENU_BEBIDAS, 
  MENU_POSTRES, 
  MENU_SALSAS
} from '../data/menuPublico';

interface LandingPageProps {
  onAdminClick: () => void;
}

const LandingPage = ({ onAdminClick }: LandingPageProps) => {
  const [activeCategory, setActiveCategory] = useState('lingotes');
  const [tapCount, setTapCount] = useState(0);

  const categories = [
    { id: 'lingotes', label: 'Lingotes', icon: UtensilsCrossed, data: MENU_LINGOTES },
    { id: 'promos', label: 'Promos', icon: Zap, data: MENU_PROMOCIONES },
    { id: 'postres', label: 'Postres', icon: IceCream, data: MENU_POSTRES },
    { id: 'bebidas', label: 'Bebidas', icon: Coffee, data: MENU_BEBIDAS },
    { id: 'salsas', label: 'Extras', icon: Droplet, data: MENU_SALSAS },
  ];

  const activeData = categories.find(c => c.id === activeCategory)?.data || [];

  // Función secreta para activar admin (Triple Tap en el logo)
  const handleSecretTap = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);
    if (newCount >= 3) {
      onAdminClick();
      setTapCount(0);
    }
    setTimeout(() => setTapCount(0), 2000); // Reset si no completa los 3 taps rápido
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
           {/* BOTÓN SECRETO EN EL LOGO */}
           <button onClick={handleSecretTap} className="block mx-auto active:scale-95 transition-transform">
             <img src="/logo_lingote_oficial_ligero.png" alt="Logo" className="w-24 h-24 mx-auto drop-shadow-2xl animate-in zoom-in duration-1000" />
           </button>
           <div className="space-y-1">
             <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic leading-none">El Lingote Español</h1>
             <p className="text-lingote-gold font-bold uppercase tracking-[0.3em] text-[8px]">Raíces Españolas, Corazón Tico</p>
           </div>
        </div>

        <div className="absolute bottom-6 left-0 w-full px-6 flex justify-between items-center z-10">
           <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              <Star className="text-lingote-gold" size={12} fill="currentColor" />
              <span className="text-white text-[9px] font-black uppercase tracking-widest italic">4.9 Estrellas</span>
           </div>
           <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              <Clock className="text-lingote-gold" size={12} />
              <span className="text-white text-[9px] font-black uppercase tracking-widest italic">Abierto</span>
           </div>
        </div>
      </section>

      {/* CATEGORY SELECTOR (OPTIMIZADO PARA NO SCROLL EN MÓVIL) */}
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
         <div className="grid grid-cols-1 gap-6">
            {activeData.map((item: any) => (
              <div key={item.id} className="group bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col active:scale-[0.98] transition-all relative">
                 
                 {item.ahorro && (
                   <div className="absolute top-4 left-4 z-20 bg-green-500 text-white px-4 py-1 rounded-full font-black text-[10px] uppercase italic shadow-lg animate-pulse">
                     Ahorras ₡{item.ahorro.toLocaleString()}
                   </div>
                 )}

                 <div className={`${item.imagen ? 'h-52' : 'h-24 bg-slate-50'} overflow-hidden relative`}>
                    {item.imagen ? (
                      <img src={`/${item.imagen}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={item.nombre} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center opacity-10">
                        <UtensilsCrossed size={48} />
                      </div>
                    )}
                    
                    <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur-md text-white px-4 py-1.5 rounded-full font-black text-sm border border-white/10 italic shadow-2xl">
                       ₡{item.precio.toLocaleString()}
                    </div>
                 </div>

                 <div className="p-5 space-y-3 text-left">
                    <div>
                       <div className="flex justify-between items-center mb-1">
                          <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight leading-none italic">{item.nombre}</h3>
                          {item.alergenos && <div className="flex gap-1 text-[10px] opacity-60">{item.alergenos}</div>}
                       </div>
                       
                       {item.precioAnterior && (
                         <p className="text-slate-300 text-[10px] font-bold line-through mb-1">Antes ₡{item.precioAnterior.toLocaleString()}</p>
                       )}

                       <p className="text-slate-500 text-[11px] leading-relaxed font-medium">
                          {item.descripcion || item.desc}
                       </p>
                    </div>

                    {item.ingredientesBase && (
                       <div className="flex flex-wrap gap-1.5 pt-1">
                          {item.ingredientesBase.map((ing: string) => (
                            <span key={ing} className="bg-slate-50 text-slate-400 text-[7px] font-black uppercase px-2 py-0.5 rounded-md border border-slate-100/50">{ing}</span>
                          ))}
                       </div>
                    )}
                 </div>
              </div>
            ))}
         </div>
      </main>

      {/* FOOTER */}
      <footer className="mt-12 p-8 text-center space-y-6">
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

      <div className="fixed bottom-6 left-0 w-full px-6 z-50 sm:hidden flex justify-center">
         <a href="https://wa.me/506" className="w-full max-w-sm bg-slate-900 text-white py-5 rounded-[2rem] font-black text-sm uppercase italic tracking-widest shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all border border-white/5">
            <Package size={20} className="text-lingote-gold" />
            Pedir por WhatsApp
         </a>
      </div>

    </div>
  );
};

export default LandingPage;
