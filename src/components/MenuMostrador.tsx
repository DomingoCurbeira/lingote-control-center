import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

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
      const { data: recipes } = await supabase
        .from('recetas')
        .select('id, nombre, precio_venta, categoria, imagen');
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
      setCurrentScreen(prev => (prev + 1) % 8); // 8 pantallas en total (QR eliminado)
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

  const ProductCard = ({ id, name, price, img, folder = 'public' }: any) => (
    <div className="flex-1 flex flex-col items-center justify-center p-6 animate-in zoom-in fade-in duration-1000">
      <div className="relative group">
        <div className="absolute inset-0 bg-lingote-gold/10 blur-[120px] rounded-full"></div>
        <img 
          src={folder === 'menu_digital' ? `/menu_digital/${id}.png` : `/${img}`} 
          className="w-[45vh] h-[45vh] object-contain relative z-10 drop-shadow-[0_45px_45px_rgba(0,0,0,0.6)] transform scale-110"
          alt={name}
        />
      </div>
      <div className="mt-16 text-center space-y-4 relative z-20">
        <h2 className="text-[6vh] font-black text-white uppercase italic tracking-tighter leading-none">{name}</h2>
        <div className="flex justify-center pt-2">
          <div className="bg-lingote-gold text-slate-900 px-8 py-2 rounded-[1.5rem] font-black text-[5vh] italic shadow-2xl">
            ₡{price.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-screen bg-[#050608] overflow-hidden relative cursor-none flex flex-col items-center justify-center font-sans">
      {/* FONDO DECORATIVO */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-lingote-gold/15 blur-[180px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-slate-800/40 blur-[180px] rounded-full"></div>
      </div>

      {/* HEADER FIJO */}
      <header className="absolute top-0 left-0 w-full p-8 flex justify-between items-start z-50">
        <div className="flex items-center gap-6">
          <img src="/logo_lingote_oficial_ligero.png" className="w-20 h-20 drop-shadow-2xl" alt="Logo" />
          <div className="text-left">
            <h1 className="text-[4vh] font-black text-white italic tracking-tighter leading-none uppercase">El Lingote Español</h1>
            {/* <p className="text-lingote-gold font-bold text-sm uppercase tracking-[0.6em] mt-2">Artesanía Gastronómica de Autor</p> */}
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-xl px-6 py-3 rounded-[1.5rem] border border-white/10 text-white font-black uppercase italic tracking-widest text-lg flex items-center gap-3 shadow-2xl">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
          Cocina Abierta
        </div>
      </header>

      <main className="h-full w-full flex items-center justify-center px-8 pt-24 pb-12 relative z-10">
        
        {/* 0. GANCHOS */}
        {currentScreen === 0 && (
          <div className="flex w-full h-full items-center gap-6">
            <ProductCard id="clasico" name="Lingote Clásico" price={1500} img="clasico.webp" folder="menu_digital" />
            <div className="w-px h-1/2 bg-gradient-to-b from-transparent via-white/10 to-transparent self-center"></div>
            <ProductCard id="bocata" name="Bocata Español" price={2500} img="bocata.webp" folder="menu_digital" />
          </div>
        )}

        {/* 1. ESTRELLAS 1 */}
        {currentScreen === 1 && (
          <div className="flex w-full h-full items-center gap-6">
            <ProductCard id="tico" name="Lingote Tico" price={2000} img="tico.webp" folder="menu_digital" />
            <div className="w-px h-1/2 bg-gradient-to-b from-transparent via-white/10 to-transparent self-center"></div>
            <ProductCard id="soberano" name="Lingote Soberano" price={3500} img="soberano.webp" folder="menu_digital" />
          </div>
        )}

        {/* 2. ESTRELLAS 2 */}
        {currentScreen === 2 && (
          <div className="flex w-full h-full items-center gap-6">
            <ProductCard id="patron" name="Lingote Patrón" price={3000} img="patron.webp" folder="menu_digital" />
            <div className="w-px h-1/2 bg-gradient-to-b from-transparent via-white/10 to-transparent self-center"></div>
            <ProductCard id="supremo" name="Lingote Supremo" price={4000} img="supremo.webp" folder="menu_digital" />
          </div>
        )}

        {/* 3. PROMO: COMBO BOCATA */}
        {currentScreen === 3 && (
          <div className="w-full h-full flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-10 duration-1000">
             <div className="text-center mb-6">
                <span className="bg-amber-500 text-slate-900 px-8 py-2 rounded-full font-black uppercase italic tracking-[0.3em] text-xl animate-bounce inline-block mb-4 shadow-2xl">¡Rápido y Delicioso!</span>
                <h2 className="text-[9vh] font-black text-white uppercase italic tracking-tighter leading-none">Combo Bocata</h2>
             </div>
             <div className="flex items-end justify-center relative h-[35vh] w-full">
                <img src="/menu_digital/cas.png" className="w-[30vh] transform -rotate-12 translate-x-12 relative z-10 drop-shadow-2xl" alt="Bebida" />
                <img src="/menu_digital/bocata.png" className="w-[50vh] relative z-20 drop-shadow-[0_45px_45px_rgba(0,0,0,0.8)] scale-110" alt="Bocata" />
             </div>
             <div className="mt-10 flex items-center gap-12 bg-white/5 p-8 rounded-[3rem] border border-white/10 backdrop-blur-2xl shadow-2xl">
                <div className="text-left">
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-lg mb-1">Precio Combo</p>
                   <p className="text-[8vh] font-black text-white italic tracking-tighter leading-none">₡3,500</p>
                </div>
                <div className="w-px h-24 bg-white/20"></div>
                <div className="text-center">
                   <div className="bg-lingote-gold text-slate-900 px-8 py-4 rounded-[2rem] shadow-2xl">
                      <p className="text-xs font-black uppercase tracking-[0.3em] leading-none mb-1">Ahorrás Hoy</p>
                      <p className="text-[5vh] font-black italic leading-none">₡600</p>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* 4. PROMO: LA TRILOGÍA */}
        {currentScreen === 4 && (
          <div className="w-full h-full flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-10 duration-1000">
             <div className="text-center mb-6">
                <span className="bg-red-600 text-white px-8 py-2 rounded-full font-black uppercase italic tracking-[0.3em] text-xl animate-bounce inline-block mb-4 shadow-2xl">¡Súper Combo!</span>
                <h2 className="text-[9vh] font-black text-white uppercase italic tracking-tighter leading-none">La Trilogía</h2>
             </div>
             <div className="flex items-end justify-center relative h-[35vh] w-full">
                <img src="/menu_digital/cas.png" className="w-[30vh] transform -rotate-12 translate-x-20 relative z-10 drop-shadow-2xl" alt="Bebida" />
                <img src="/menu_digital/tico.png" className="w-[45vh] relative z-30 drop-shadow-[0_45px_45px_rgba(0,0,0,0.8)] scale-110" alt="Lingote" />
                <img src="/menu_digital/torrijona.png" className="w-[33vh] transform rotate-12 -translate-x-20 relative z-20 drop-shadow-2xl" alt="Postre" />
             </div>
             <div className="mt-10 flex items-center gap-12 bg-white/5 p-8 rounded-[3rem] border border-white/10 backdrop-blur-2xl shadow-2xl">
                <div className="text-left">
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-lg mb-1">Precio Combo</p>
                   <p className="text-[8vh] font-black text-white italic tracking-tighter leading-none">₡5,500</p>
                </div>
                <div className="w-px h-24 bg-white/20"></div>
                <div className="text-center">
                   <div className="bg-lingote-gold text-slate-900 px-8 py-4 rounded-[2rem] shadow-2xl">
                      <p className="text-xs font-black uppercase tracking-[0.3em] leading-none mb-1">Ahorrás Hoy</p>
                      <p className="text-[5vh] font-black italic leading-none">₡600</p>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* 5. PROMO: SUPREMO XL */}
        {currentScreen === 5 && (
          <div className="w-full h-full flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-10 duration-1000">
             <div className="text-center mb-6">
                <span className="bg-purple-600 text-white px-8 py-2 rounded-full font-black uppercase italic tracking-[0.3em] text-xl animate-bounce inline-block mb-4 shadow-2xl">Máxima Experiencia</span>
                <h2 className="text-[9vh] font-black text-white uppercase italic tracking-tighter leading-none">Supremo XL</h2>
             </div>
             <div className="flex items-end justify-center relative h-[35vh] w-full">
                <img src="/menu_digital/chocolate.png" className="w-[30vh] transform -rotate-6 translate-x-20 relative z-10 drop-shadow-2xl" alt="Bebida" />
                <img src="/menu_digital/supremo.png" className="w-[45vh] relative z-30 drop-shadow-[0_45px_45px_rgba(0,0,0,0.8)] scale-110" alt="Lingote" />
                <img src="/menu_digital/torrijona.png" className="w-[33vh] transform rotate-6 -translate-x-20 relative z-20 drop-shadow-2xl" alt="Postre" />
             </div>
             <div className="mt-10 flex items-center gap-12 bg-white/5 p-8 rounded-[3rem] border border-white/10 backdrop-blur-2xl shadow-2xl">
                <div className="text-left">
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-lg mb-1">Precio Combo</p>
                   <p className="text-[8vh] font-black text-white italic tracking-tighter leading-none">₡7,500</p>
                </div>
                <div className="w-px h-24 bg-white/20"></div>
                <div className="text-center">
                   <div className="bg-lingote-gold text-slate-900 px-8 py-4 rounded-[2rem] shadow-2xl">
                      <p className="text-xs font-black uppercase tracking-[0.3em] leading-none mb-1">Ahorrás Hoy</p>
                      <p className="text-[5vh] font-black italic leading-none">₡400</p>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* 6. PROMO: BANQUETE REAL */}
        {currentScreen === 6 && (
          <div className="w-full h-full flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-10 duration-1000">
             <div className="text-center mb-4">
                <span className="bg-lingote-gold text-slate-900 px-8 py-2 rounded-full font-black uppercase italic tracking-[0.3em] text-xl animate-bounce inline-block mb-4 shadow-2xl">¡Para Compartir! 🏰</span>
                <h2 className="text-[8vh] font-black text-white uppercase italic tracking-tighter leading-none">Banquete Real</h2>
             </div>
             <div className="flex items-end justify-center relative h-[35vh] w-full">
                <img src="/menu_digital/supremo.png" className="w-[40vh] transform -rotate-12 translate-x-20 relative z-20 drop-shadow-2xl" alt="Lingote 1" />
                <img src="/menu_digital/tico.png" className="w-[45vh] relative z-30 drop-shadow-[0_45px_45px_rgba(0,0,0,0.8)] scale-110" alt="Lingote 2" />
                <img src="/menu_digital/torrijona.png" className="w-[30vh] transform rotate-12 -translate-x-20 relative z-20 drop-shadow-2xl" alt="Postre" />
             </div>
             <div className="mt-8 flex items-center gap-12 bg-white/5 p-8 rounded-[3rem] border border-white/10 backdrop-blur-2xl shadow-2xl">
                <div className="text-left">
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-lg mb-1">Precio Banquete</p>
                   <p className="text-[7vh] font-black text-white italic tracking-tighter leading-none">₡12,000</p>
                </div>
                <div className="w-px h-24 bg-white/20"></div>
                <div className="text-center">
                   <div className="bg-green-500 text-white px-8 py-4 rounded-[2rem] shadow-2xl">
                      <p className="text-xs font-black uppercase tracking-[0.3em] leading-none mb-1">Ahorrás Hoy</p>
                      <p className="text-[4vh] font-black italic leading-none">₡2,000</p>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* 7. RETAIL */}
        {currentScreen === 7 && (
          <div className="flex w-full h-full items-center px-16 gap-24">
             <div className="flex-1 text-left space-y-8 animate-in slide-in-from-left-20 duration-1000">
                <span className="bg-lingote-gold text-slate-900 px-6 py-2 rounded-full font-black uppercase italic tracking-widest text-xl shadow-xl my-4">Llevate el sabor</span>
                <h2 className="text-[10vh] font-black text-white uppercase italic leading-[0.85] tracking-tighter mb-3">Salsas de Autor</h2>
                <p className="text-[3.5vh] text-slate-400 font-bold uppercase tracking-widest leading-relaxed max-w-xl">
                   Frascos Gourmet de 240ml. <br/> 
                   <span className="text-white italic">Hechas a mano cada mañana.</span>
                </p>
                <div className="bg-white/10 w-fit p-6 rounded-[2rem] border border-white/10 shadow-2xl">
                   <p className="text-white font-black text-[4vh] uppercase italic tracking-tighter">₡3,500 <span className="text-slate-500 text-xl font-bold uppercase tracking-normal">/ Frasco</span></p>
                </div>
             </div>
             <div className="flex-1 flex justify-center items-center relative animate-in zoom-in duration-1000">
                <div className="absolute w-[60vh] h-[60vh] bg-lingote-gold/15 blur-[150px] rounded-full"></div>
                <img src="/menu_digital/caribenha.webp" className="w-[40vh] transform -rotate-12 translate-x-16 relative z-20 drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)]" alt="Salsa 1" />
                <img src="/menu_digital/chipotle.webp" className="w-[40vh] transform rotate-12 -translate-x-16 relative z-10 drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)]" alt="Salsa 2" />
             </div>
          </div>
        )}
      </main>

      <footer className="absolute bottom-0 left-0 w-full p-6 flex justify-center gap-4 z-50">
        {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
          <div key={i} className={`h-2 rounded-full transition-all duration-1000 ${currentScreen === i ? 'w-24 bg-lingote-gold shadow-[0_0_20px_#d4b483]' : 'w-4 bg-white/10'}`}></div>
        ))}
      </footer>

      <style>{`
        @keyframes bounce-x { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(20px); } }
        .animate-bounce-x { animation: bounce-x 1.5s infinite; }
        .cursor-none { cursor: none; }
      `}</style>
    </div>
  );
};

export default MenuMostrador;
