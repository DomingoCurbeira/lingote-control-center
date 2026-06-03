import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { INFO_FABRICANTE } from '../data/masterDatabase';
import { 
  ArrowRight
} from 'lucide-react';

interface RecetaMostrador {
  id: string;
  nombre: string;
  precio_venta: number;
  categoria: string;
  imagen?: string;
  is_available?: boolean;
}

const MenuMostrador = () => {
  const [recetas, setRecetas] = useState<RecetaMostrador[]>([]);
  const [currentScreen, setCurrentScreen] = useState(0);
  const [loading, setLoading] = useState(true);

  // 1. CARGA DE DATOS EN TIEMPO REAL
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Obtener recetas (precios manuales)
      const { data: recipes } = await supabase
        .from('recetas')
        .select('id, nombre, precio_venta, categoria, imagen');
      
      // Obtener disponibilidad
      const { data: stock } = await supabase
        .from('disponibilidad')
        .select('*');

      if (recipes) {
        const merged = recipes.map(r => ({
          ...r,
          is_available: stock?.find(s => s.id === r.id)?.is_available !== false
        }));
        setRecetas(merged);
      }
      setLoading(false);
    };

    fetchData();

    // Suscribirse a cambios en tiempo real
    const channel = supabase.channel('mostrador-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'disponibilidad' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'recetas' }, fetchData)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // 2. LÓGICA DE ROTACIÓN (12 Segundos)
  useEffect(() => {
    if (recetas.length === 0) return;
    const interval = setInterval(() => {
      setCurrentScreen(prev => (prev + 1) % 6); // 6 pantallas en total
    }, 12000);
    return () => clearInterval(interval);
  }, [recetas]);

  if (loading) {
    return (
      <div className="h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <img src="/logo_lingote_oficial_ligero.png" className="w-32 h-32 animate-pulse mb-8" alt="Logo" />
        <p className="font-black uppercase tracking-[0.5em] text-xs">Sincronizando Terminal...</p>
      </div>
    );
  }

  // --- COMPONENTES DE PANTALLA ---

  const PriceTag = ({ price }: { price: number }) => (
    <div className="bg-lingote-gold text-slate-900 px-6 py-2 rounded-2xl font-black text-4xl italic shadow-2xl">
      ₡{price.toLocaleString()}
    </div>
  );

  const ProductCard = ({ id, name, price, img, folder = 'public' }: any) => (
    <div className="flex-1 flex flex-col items-center justify-center p-10 animate-in zoom-in fade-in duration-700">
      <div className="relative group">
        <div className="absolute inset-0 bg-lingote-gold/20 blur-[100px] rounded-full group-hover:bg-lingote-gold/30 transition-all"></div>
        <img 
          src={folder === 'menu_digital' ? `/menu_digital/${id}.png` : `/${img}`} 
          className="w-[450px] h-[450px] object-contain relative z-10 drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)] transform hover:scale-105 transition-transform"
          alt={name}
        />
      </div>
      <div className="mt-12 text-center space-y-4 relative z-20">
        <h2 className="text-6xl font-black text-white uppercase italic tracking-tighter leading-none">{name}</h2>
        <div className="flex justify-center pt-4">
          <PriceTag price={price} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-screen bg-[#050608] overflow-hidden relative cursor-none">
      {/* FONDO DECORATIVO */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-lingote-gold/20 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-slate-800/40 blur-[150px] rounded-full"></div>
      </div>

      {/* HEADER FIJO */}
      <header className="absolute top-0 left-0 w-full p-10 flex justify-between items-center z-50">
        <div className="flex items-center gap-6">
          <img src="/logo_lingote_oficial_ligero.png" className="w-20 h-20" alt="Logo" />
          <div className="text-left">
            <h1 className="text-4xl font-black text-white italic tracking-tighter leading-none uppercase">El Lingote Español</h1>
            <p className="text-lingote-gold font-bold text-xs uppercase tracking-[0.4em] mt-2">Artesanía Gastronómica de Autor</p>
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 text-white font-black uppercase italic tracking-widest text-sm flex items-center gap-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
          Cocina Abierta
        </div>
      </header>

      {/* RENDERIZADO DE PANTALLAS */}
      <main className="h-full w-full flex items-center justify-center pt-20">
        
        {/* PANTALLA 1: GANCHOS (Clásico y Bocata) */}
        {currentScreen === 0 && (
          <div className="flex w-full h-full items-center">
            <ProductCard id="clasico" name="Lingote Clásico" price={1500} img="clasico.webp" folder="menu_digital" />
            <div className="w-px h-2/3 bg-white/10 self-center"></div>
            <ProductCard id="bocata" name="Bocata Español" price={2500} img="bocata.webp" folder="menu_digital" />
          </div>
        )}

        {/* PANTALLA 2: ESTRELLAS 1 (Tico y Soberano) */}
        {currentScreen === 1 && (
          <div className="flex w-full h-full items-center">
            <ProductCard id="tico" name="Lingote Tico" price={2000} img="tico.webp" folder="menu_digital" />
            <div className="w-px h-2/3 bg-white/10 self-center"></div>
            <ProductCard id="soberano" name="Lingote Soberano" price={3500} img="soberano.webp" folder="menu_digital" />
          </div>
        )}

        {/* PANTALLA 3: ESTRELLAS 2 (Patrón y Supremo) */}
        {currentScreen === 2 && (
          <div className="flex w-full h-full items-center">
            <ProductCard id="patron" name="Lingote Patrón" price={3000} img="patron.webp" folder="menu_digital" />
            <div className="w-px h-2/3 bg-white/10 self-center"></div>
            <ProductCard id="supremo" name="Lingote Supremo" price={4000} img="supremo.webp" folder="menu_digital" />
          </div>
        )}

        {/* PANTALLA 4: PROMO "LA TRILOGÍA" (Composición Digital) */}
        {currentScreen === 3 && (
          <div className="w-full h-full flex flex-col items-center justify-center p-20 animate-in fade-in slide-in-from-bottom-10 duration-1000">
             <div className="text-center mb-12">
                <span className="bg-red-600 text-white px-6 py-2 rounded-full font-black uppercase italic tracking-widest text-lg animate-bounce inline-block mb-4">¡Súper Combo!</span>
                <h2 className="text-8xl font-black text-white uppercase italic tracking-tighter">La Trilogía</h2>
             </div>
             
             <div className="flex items-end justify-center gap-[-50px] relative h-[400px]">
                {/* Composición de imágenes con desfase y sombras */}
                <img src="/menu_digital/cas.png" className="w-[300px] transform -rotate-12 translate-x-12 relative z-10 drop-shadow-2xl" alt="Bebida" />
                <img src="/menu_digital/tico.png" className="w-[450px] relative z-30 drop-shadow-[0_35px_35px_rgba(0,0,0,0.8)]" alt="Lingote" />
                <img src="/menu_digital/torrijona.png" className="w-[320px] transform rotate-12 -translate-x-12 relative z-20 drop-shadow-2xl" alt="Postre" />
             </div>

             <div className="mt-16 flex items-center gap-10 bg-white/5 p-8 rounded-[3rem] border border-white/10 backdrop-blur-xl">
                <div className="text-left">
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-sm mb-1">Precio Combo</p>
                   <p className="text-7xl font-black text-white italic tracking-tighter">₡5,500</p>
                </div>
                <div className="w-px h-20 bg-white/20"></div>
                <div className="text-center">
                   <div className="bg-lingote-gold text-slate-900 px-6 py-4 rounded-3xl">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] leading-none mb-1">Ahorrás Hoy</p>
                      <p className="text-4xl font-black italic leading-none">₡600</p>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* PANTALLA 5: RETAIL (Salsas Gourmet) */}
        {currentScreen === 4 && (
          <div className="flex w-full h-full items-center p-20 gap-20">
             <div className="flex-1 text-left space-y-8 animate-in slide-in-from-left-20 duration-1000">
                <span className="bg-lingote-gold text-slate-900 px-6 py-2 rounded-full font-black uppercase italic tracking-widest text-lg">Llevate el sabor</span>
                <h2 className="text-[120px] font-black text-white uppercase italic leading-[0.8] tracking-tighter">Salsas de Autor</h2>
                <p className="text-3xl text-slate-400 font-bold uppercase tracking-widest leading-relaxed max-w-xl">
                   Frascos Gourmet de 240ml. <br/> 
                   <span className="text-white">Hechas a mano cada mañana.</span>
                </p>
                <div className="flex gap-6">
                   <div className="bg-white/10 p-6 rounded-3xl border border-white/10">
                      <p className="text-white font-black text-2xl uppercase italic">₡3,500 <span className="text-slate-500 text-sm">/ Frasco</span></p>
                   </div>
                </div>
             </div>
             <div className="flex-1 flex justify-center items-center relative animate-in zoom-in duration-1000">
                <div className="absolute w-[600px] h-[600px] bg-lingote-gold/10 blur-[120px] rounded-full"></div>
                <img src="/menu_digital/caribenha.webp" className="w-[400px] transform -rotate-6 translate-x-10 relative z-20 drop-shadow-2xl" alt="Salsa 1" />
                <img src="/menu_digital/chipotle.webp" className="w-[400px] transform rotate-6 -translate-x-10 relative z-10 drop-shadow-2xl" alt="Salsa 2" />
             </div>
          </div>
        )}

        {/* PANTALLA 6: QR CIERRE GIGANTE */}
        {currentScreen === 5 && (
          <div className="w-full h-full flex flex-col items-center justify-center p-20 animate-in zoom-in fade-in duration-1000">
             <div className="bg-white p-12 rounded-[4rem] shadow-[0_0_100px_rgba(212,180,131,0.3)] relative group">
                <div className="absolute -inset-4 bg-gradient-to-tr from-lingote-gold to-amber-200 rounded-[4.5rem] blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <img src="/qr-code.png" className="w-[450px] h-[450px] relative z-10" alt="QR Code" />
             </div>
             <div className="mt-16 text-center space-y-6">
                <h2 className="text-7xl font-black text-white uppercase italic tracking-tighter leading-none">¿Mucha Fila?</h2>
                <div className="flex items-center gap-6 justify-center">
                   <p className="text-3xl text-lingote-gold font-black uppercase tracking-[0.3em] italic">Escanéa y Pedí desde tu Celular</p>
                   <ArrowRight className="text-white animate-bounce-x" size={40} />
                </div>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Recogé en ventanilla sin esperas • WhatsApp: {INFO_FABRICANTE.contacto}</p>
             </div>
          </div>
        )}

      </main>

      {/* FOOTER DE PANTALLA (Barra de Progreso) */}
      <footer className="absolute bottom-0 left-0 w-full p-4 flex justify-center gap-4 z-50">
        {[0, 1, 2, 3, 4, 5].map(i => (
          <div 
            key={i} 
            className={`h-2 rounded-full transition-all duration-1000 ${currentScreen === i ? 'w-24 bg-lingote-gold shadow-[0_0_15px_#d4b483]' : 'w-4 bg-white/10'}`}
          ></div>
        ))}
      </footer>

      <style>{`
        @keyframes bounce-x {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(20px); }
        }
        .animate-bounce-x {
          animation: bounce-x 1.5s infinite;
        }
        .cursor-none { cursor: none; }
      `}</style>
    </div>
  );
};

export default MenuMostrador;
