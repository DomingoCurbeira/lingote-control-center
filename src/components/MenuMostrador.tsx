import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { MASTER_DATABASE } from '../data/masterDatabase';
import { MENU_PROMOCIONES } from '../data/menuPublico';
import { ChevronLeft, ChevronRight, Pause, Play, Maximize } from 'lucide-react';

interface RecetaMostrador {
  id: string;
  nombre: string;
  precioVenta: number;
  categoria: string;
  imagen?: string;
  is_available?: boolean;
}

const MenuMostrador = () => {
  const [recetas, setRecetas] = useState<RecetaMostrador[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Lógica de rotación
  const [currentScreen, setCurrentScreen] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [rotationSpeed, setRotationSpeed] = useState(12); // en segundos
  
  // Pantallas activas configurables
  const [activeScreens, setActiveScreens] = useState<boolean[]>([
    true, // Screen 0: Bienvenidos / Código QR
    true, // Screen 1: Ganchos (Clásico & Bocata)
    true, // Screen 2: Estrellas 1 (Tico & Soberano)
    true, // Screen 3: Estrellas 2 (Patrón & Supremo)
    true, // Screen 4: Combo Bocata
    true, // Screen 5: La Trilogía
    true, // Screen 6: Supremo XL
    true, // Screen 7: Banquete Real
    true, // Screen 8: Salsas de Autor
  ]);

  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<any>(null);

  // 1. CARGA DE DATOS EN TIEMPO REAL CON FALLBACK LOCAL
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Obtener disponibilidad
      let stockData: any[] = [];
      try {
        const { data } = await supabase
          .from('disponibilidad')
          .select('*');
        if (data) stockData = data;
      } catch (err) {
        console.warn('No se pudo conectar a Supabase disponibilidad:', err);
      }

      // Obtener recetas de Supabase
      let recipesData: any[] = [];
      try {
        const { data } = await supabase
          .from('recetas')
          .select('id, nombre, precio_venta, categoria, imagen');
        if (data && data.length > 0) {
          recipesData = data;
        }
      } catch (err) {
        console.warn('No se pudo conectar a Supabase recetas:', err);
      }

      // Si tenemos recetas de Supabase las usamos, si no usamos MASTER_DATABASE
      const baseRecetas = recipesData.length > 0 
        ? recipesData.map(r => ({
            id: r.id,
            nombre: r.nombre,
            precioVenta: r.precio_venta || 0,
            categoria: r.categoria,
            imagen: r.imagen
          }))
        : MASTER_DATABASE.map(r => ({
            id: r.id,
            nombre: r.nombre,
            precioVenta: r.precioVenta || 0,
            categoria: r.categoria,
            imagen: r.imagen
          }));

      // Cruzamos disponibilidad
      const merged = baseRecetas.map(r => {
        const stockInfo = stockData.find(s => s.id === r.id);
        return {
          ...r,
          is_available: stockInfo ? stockInfo.is_available !== false : true
        };
      });

      setRecetas(merged);
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

  // 2. LÓGICA DE ROTACIÓN SEGÚN CONFIGURACIÓN
  const getNextScreenIndex = (currentIndex: number, screensList: boolean[], direction: 1 | -1 = 1) => {
    let nextIndex = currentIndex;
    const total = screensList.length;
    for (let i = 0; i < total; i++) {
      nextIndex = (nextIndex + direction + total) % total;
      if (screensList[nextIndex]) {
        return nextIndex;
      }
    }
    return currentIndex;
  };

  useEffect(() => {
    if (!isPlaying || recetas.length === 0) return;
    const interval = setInterval(() => {
      setCurrentScreen(prev => getNextScreenIndex(prev, activeScreens, 1));
    }, rotationSpeed * 1000);
    return () => clearInterval(interval);
  }, [isPlaying, rotationSpeed, activeScreens, recetas]);

  // Ocultar controles automáticamente después de mover el mouse
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3500);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, []);

  if (loading) {
    return (
      <div className="h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <img src="/logo_lingote_oficial_ligero.png" className="w-32 h-32 animate-pulse mb-8" alt="Logo" />
        <p className="font-black uppercase tracking-[0.5em] text-xs">Sincronizando Terminal...</p>
      </div>
    );
  }

  // Helper para mapear IDs visuales del mostrador con IDs reales en la base de datos
  const getDatabaseId = (mostradorId: string) => {
    const mapping: Record<string, string> = {
      'clasico': 'lingote-clasico',
      'bocata': 'bocata-espanol',
      'tico': 'lingote-tico',
      'soberano': 'lingote-soberano',
      'patron': 'lingote-patron',
      'supremo': 'lingote-supremo',
      'salsa-ajo': 'salsa-caribena-240ml',
      'salsa-picante': 'alioli-chipotle-240ml',
      'cas': 'fresco-cas-local',
      'chocolate': 'chocolate-local',
      'leche': 'leche-frita-tres-leches',
      'tarta': 'tarta-al-reves-maduro'
    };
    return mapping[mostradorId] || mostradorId;
  };

  // Componente para renderizar la tarjeta de producto con datos en tiempo real
  const ProductCard = ({ id, folder = 'public' }: { id: string; folder?: string }) => {
    const dbId = getDatabaseId(id);
    const p = (recetas.find(r => r.id === dbId) || MASTER_DATABASE.find(r => r.id === dbId)) as any;
    if (!p) return null;

    const name = p.nombre;
    const price = p.precioVenta;
    const img = p.imagen || `${id}.webp`;
    const isAvailable = p.is_available !== false;

    return (
      <div className={`flex-1 flex flex-col items-center justify-center p-6 relative transition-all duration-500 ${!isAvailable ? 'opacity-40 filter grayscale' : ''}`}>
        <div className="absolute inset-0 bg-lingote-gold/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="relative group">
          <img 
            src={folder === 'menu_digital' ? `/menu_digital/${id}.png` : `/${img}`} 
            className="w-[42vh] h-[42vh] object-contain relative z-10 drop-shadow-[0_45px_45px_rgba(0,0,0,0.6)] transform scale-110"
            alt={name}
          />
          {!isAvailable && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-full w-[30vh] h-[30vh] m-auto border border-red-500/30 shadow-2xl">
              <span className="text-[3.5vh] font-black text-red-500 uppercase tracking-widest rotate-12">Agotado</span>
            </div>
          )}
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
  };

  // Helper para traer precios de las promos actualizados
  const getPromoDetails = (promoId: string, defaultName: string, defaultPrice: number, defaultSavings: number) => {
    const promo = MENU_PROMOCIONES.find(p => p.id === promoId);
    if (!promo) return { nombre: defaultName, precio: defaultPrice, ahorro: defaultSavings };
    return {
      nombre: promo.nombre.replace(/⚡|🏰/g, '').trim(),
      precio: promo.precio,
      ahorro: promo.ahorro || defaultSavings
    };
  };

  // Componente Reusable para Combos
  const PromoCard = ({ 
    promoId, 
    badge, 
    badgeColor = 'bg-amber-500', 
    defaultName, 
    defaultPrice, 
    defaultSavings, 
    images 
  }: { 
    promoId: string; 
    badge: string; 
    badgeColor?: string; 
    defaultName: string; 
    defaultPrice: number; 
    defaultSavings: number; 
    images: { src: string; className: string }[] 
  }) => {
    const p = getPromoDetails(promoId, defaultName, defaultPrice, defaultSavings);
    return (
      <div className="w-full h-full flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-10 duration-1000">
         <div className="text-center mb-6">
            <span className={`${badgeColor} text-white px-8 py-2 rounded-full font-black uppercase italic tracking-[0.3em] text-xl animate-bounce inline-block mb-4 shadow-2xl`}>
              {badge}
            </span>
            <h2 className="text-[9vh] font-black text-white uppercase italic tracking-tighter leading-none">{p.nombre}</h2>
         </div>
         <div className="flex items-end justify-center relative h-[35vh] w-full">
            {images.map((img, idx) => (
              <img 
                key={idx} 
                src={img.src} 
                className={img.className} 
                alt={`Imagen combo ${idx}`} 
              />
            ))}
         </div>
         <div className="mt-10 flex items-center gap-12 bg-white/5 p-8 rounded-[3rem] border border-white/10 backdrop-blur-2xl shadow-2xl">
            <div className="text-left">
               <p className="text-slate-400 font-bold uppercase tracking-widest text-lg mb-1">Precio Combo</p>
               <p className="text-[8vh] font-black text-white italic tracking-tighter leading-none">₡{p.precio.toLocaleString()}</p>
            </div>
            <div className="w-px h-24 bg-white/20"></div>
            <div className="text-center">
               <div className="bg-lingote-gold text-slate-900 px-8 py-4 rounded-[2rem] shadow-2xl">
                  <p className="text-xs font-black uppercase tracking-[0.3em] leading-none mb-1">Ahorrás Hoy</p>
                  <p className="text-[5vh] font-black italic leading-none">₡{p.ahorro.toLocaleString()}</p>
               </div>
            </div>
         </div>
      </div>
    );
  };

  // Componente para Reloj en tiempo real
  const Clock = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
      const timer = setInterval(() => setTime(new Date()), 1000);
      return () => clearInterval(timer);
    }, []);

    return (
      <div className="bg-white/5 backdrop-blur-xl px-6 py-3 rounded-[1.5rem] border border-white/10 text-white font-black tracking-widest text-lg flex items-center gap-3 shadow-2xl">
        <span className="text-lingote-gold animate-pulse">⏰</span>
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </div>
    );
  };

  // Componente para Pantalla de Salsas de Autor
  const SalsasScreen = () => {
    const salsaAjo = MASTER_DATABASE.find(p => p.id === 'salsa-ajo') || { precioVenta: 3500 };
    const price = salsaAjo.precioVenta;
    
    return (
      <div className="flex w-full h-full items-center px-16 gap-24">
         <div className="flex-1 text-left space-y-8 animate-in slide-in-from-left-20 duration-1000">
            <span className="bg-lingote-gold text-slate-900 px-6 py-2 rounded-full font-black uppercase italic tracking-widest text-xl shadow-xl inline-block mb-6">Llevate el sabor</span>
            <h2 className="text-[10vh] font-black text-white uppercase italic leading-[0.85] tracking-tighter mb-3">Salsas de Autor</h2>
            <p className="text-[3.5vh] text-slate-400 font-bold uppercase tracking-widest leading-relaxed max-w-xl">
               Frascos Gourmet de 240ml. <br/> 
               <span className="text-white italic">Hechas a mano cada mañana.</span>
            </p>
            <div className="bg-white/10 w-fit p-6 rounded-[2rem] border border-white/10 shadow-2xl">
               <p className="text-white font-black text-[4vh] uppercase italic tracking-tighter">₡{price.toLocaleString()} <span className="text-slate-500 text-xl font-bold uppercase tracking-normal">/ Frasco</span></p>
            </div>
         </div>
         <div className="flex-1 flex justify-center items-center relative animate-in zoom-in duration-1000">
            <div className="absolute w-[60vh] h-[60vh] bg-lingote-gold/15 blur-[150px] rounded-full"></div>
            <img src="/menu_digital/caribenha.png" className="w-[40vh] transform -rotate-12 translate-x-16 relative z-20 drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)]" alt="Salsa 1" />
            <img src="/menu_digital/chipotle.png" className="w-[40vh] transform rotate-12 -translate-x-16 relative z-10 drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)]" alt="Salsa 2" />
         </div>
      </div>
    );
  };

  return (
    <div className="h-screen w-screen bg-[#050608] overflow-hidden relative cursor-none flex flex-col items-center justify-center font-sans">
      <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-lingote-gold/15 blur-[180px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-slate-800/40 blur-[180px] rounded-full"></div>
      </div>

      {/* HEADER FIJO */}
      <header className="absolute top-0 left-0 w-full p-8 flex justify-between items-start z-50">
        <div className="flex items-center gap-6">
          <img src="/logo_lingote_oficial_ligero.png" className="w-20 h-20 drop-shadow-2xl animate-pulse" alt="Logo" />
          <div className="text-left">
            <h1 className="text-[4vh] font-black text-white italic tracking-tighter leading-none uppercase">El Lingote Español</h1>
            <p className="text-lingote-gold font-bold text-xs uppercase tracking-[0.4em] mt-1.5">Artesanía Gastronómica de Autor</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Clock />
          <div className="bg-white/5 backdrop-blur-xl px-6 py-3 rounded-[1.5rem] border border-white/10 text-white font-black uppercase italic tracking-widest text-lg flex items-center gap-3 shadow-2xl">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"></div>
            Cocina Abierta
          </div>
        </div>
      </header>

      {/* RENDER DE PANTALLAS */}
      <main className="h-full w-full flex items-center justify-center px-8 pt-24 pb-12 relative z-10">
        
        {/* Screen 0: Bienvenidos y Código QR */}
        {currentScreen === 0 && (
          <div className="flex flex-col items-center justify-center w-full h-full text-center space-y-8 animate-in zoom-in duration-1000 relative">
            <div className="absolute inset-0 bg-lingote-gold/5 blur-[150px] rounded-full pointer-events-none"></div>
            <div className="space-y-4">
              <span className="bg-lingote-gold/15 text-lingote-gold px-8 py-2 rounded-full border border-lingote-gold/30 font-black uppercase italic tracking-[0.4em] text-lg inline-block shadow-2xl">
                ¡Bienvenidos!
              </span>
              <h2 className="text-[9vh] font-black text-white uppercase italic tracking-tighter leading-none">Llevá el menú en tu celular</h2>
              <p className="text-[3.2vh] text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed mt-2">
                Escanea el código QR y ordená tus platos favoritos para llevar.
              </p>
            </div>

            <div className="relative group mt-4">
              <div className="absolute inset-0 bg-lingote-gold/20 blur-[60px] rounded-3xl transition-all duration-1000 group-hover:blur-[80px]"></div>
              <div className="bg-slate-950 p-6 rounded-[2.5rem] border-2 border-lingote-gold/30 relative z-10 flex items-center justify-center shadow-2xl">
                <img src="/qr-code.png" alt="QR Menú Digital" className="w-[32vh] h-[32vh] object-contain rounded-2xl" />
              </div>
            </div>

            <p className="text-lingote-gold font-black uppercase tracking-[0.25em] text-xl animate-pulse">
              🌐 ellingoteespanol.netlify.app
            </p>
          </div>
        )}

        {/* Screen 1: Ganchos */}
        {currentScreen === 1 && (
          <div className="flex w-full h-full items-center gap-6">
            <ProductCard id="clasico" folder="menu_digital" />
            <div className="w-px h-1/2 bg-gradient-to-b from-transparent via-white/10 to-transparent self-center"></div>
            <ProductCard id="bocata" folder="menu_digital" />
          </div>
        )}

        {/* Screen 2: Estrellas 1 */}
        {currentScreen === 2 && (
          <div className="flex w-full h-full items-center gap-6">
            <ProductCard id="tico" folder="menu_digital" />
            <div className="w-px h-1/2 bg-gradient-to-b from-transparent via-white/10 to-transparent self-center"></div>
            <ProductCard id="soberano" folder="menu_digital" />
          </div>
        )}

        {/* Screen 3: Estrellas 2 */}
        {currentScreen === 3 && (
          <div className="flex w-full h-full items-center gap-6">
            <ProductCard id="patron" folder="menu_digital" />
            <div className="w-px h-1/2 bg-gradient-to-b from-transparent via-white/10 to-transparent self-center"></div>
            <ProductCard id="supremo" folder="menu_digital" />
          </div>
        )}

        {/* Screen 4: Combo Bocata */}
        {currentScreen === 4 && (
          <PromoCard 
            promoId="promoExpress"
            badge="¡Rápido y Delicioso!"
            badgeColor="bg-amber-500"
            defaultName="Combo Bocata"
            defaultPrice={3500}
            defaultSavings={600}
            images={[
              { src: '/menu_digital/cas.png', className: 'w-[30vh] transform -rotate-12 translate-x-12 relative z-10 drop-shadow-2xl' },
              { src: '/menu_digital/bocata.png', className: 'w-[50vh] relative z-20 drop-shadow-[0_45px_45px_rgba(0,0,0,0.8)] scale-110' }
            ]}
          />
        )}

        {/* Screen 5: La Trilogía */}
        {currentScreen === 5 && (
          <PromoCard 
            promoId="promoGolosa"
            badge="¡Súper Combo!"
            badgeColor="bg-red-600"
            defaultName="La Trilogía"
            defaultPrice={6000}
            defaultSavings={600}
            images={[
              { src: '/menu_digital/cas.png', className: 'w-[30vh] transform -rotate-12 translate-x-20 relative z-10 drop-shadow-2xl' },
              { src: '/menu_digital/tico.png', className: 'w-[45vh] relative z-30 drop-shadow-[0_45px_45px_rgba(0,0,0,0.8)] scale-110' },
              { src: '/menu_digital/tarta.png', className: 'w-[33vh] transform rotate-12 -translate-x-20 relative z-20 drop-shadow-2xl' }
            ]}
          />
        )}

        {/* Screen 6: Supremo XL */}
        {currentScreen === 6 && (
          <PromoCard 
            promoId="PromoSupremoIndividual"
            badge="Máxima Experiencia"
            badgeColor="bg-purple-600"
            defaultName="Supremo XL"
            defaultPrice={7500}
            defaultSavings={1100}
            images={[
              { src: '/menu_digital/chocolate.png', className: 'w-[30vh] transform -rotate-6 translate-x-20 relative z-10 drop-shadow-2xl' },
              { src: '/menu_digital/supremo.png', className: 'w-[45vh] relative z-30 drop-shadow-[0_45px_45px_rgba(0,0,0,0.8)] scale-110' },
              { src: '/menu_digital/tarta.png', className: 'w-[33vh] transform rotate-6 -translate-x-20 relative z-20 drop-shadow-2xl' }
            ]}
          />
        )}

        {/* Screen 7: Banquete Real */}
        {currentScreen === 7 && (
          <PromoCard 
            promoId="promoBanqueteTres"
            badge="¡Para Compartir! 🏰"
            badgeColor="bg-amber-500"
            defaultName="Banquete Real"
            defaultPrice={12000}
            defaultSavings={3500}
            images={[
              { src: '/menu_digital/supremo.png', className: 'w-[40vh] transform -rotate-12 translate-x-20 relative z-20 drop-shadow-2xl' },
              { src: '/menu_digital/tico.png', className: 'w-[45vh] relative z-30 drop-shadow-[0_45px_45px_rgba(0,0,0,0.8)] scale-110' },
              { src: '/menu_digital/tarta.png', className: 'w-[30vh] transform rotate-12 -translate-x-20 relative z-20 drop-shadow-2xl' }
            ]}
          />
        )}

        {/* Screen 8: Salsas de Autor */}
        {currentScreen === 8 && (
          <SalsasScreen />
        )}
      </main>

      {/* FOOTER - NAVEGACIÓN PASIVA */}
      <footer className="absolute bottom-0 left-0 w-full p-6 flex justify-center gap-4 z-50">
        {activeScreens.map((active, i) => {
          if (!active) return null;
          return (
            <div 
              key={i} 
              className={`h-2 rounded-full transition-all duration-1000 ${
                currentScreen === i 
                  ? 'w-24 bg-lingote-gold shadow-[0_0_20px_#d4b483]' 
                  : 'w-4 bg-white/10'
              }`}
            ></div>
          );
        })}
      </footer>

      {/* PANEL DE CONTROL FLOTANTE (SE ENCIENDE AL MOVER EL MOUSE) */}
      <div 
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-4xl bg-slate-950/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-6 shadow-[0_30px_60px_rgba(0,0,0,0.8)] transition-all duration-500 flex flex-col gap-4 text-white ${
          showControls ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95 pointer-events-none'
        }`}
        style={{ cursor: 'default' }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          
          {/* Lógica de reproducción y dirección */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setCurrentScreen(prev => getNextScreenIndex(prev, activeScreens, -1))}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 hover:border-white/20 transition-all cursor-pointer"
              title="Anterior"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-4 bg-lingote-gold text-slate-950 hover:bg-amber-500 rounded-full transition-all shadow-lg active:scale-95 cursor-pointer"
              title={isPlaying ? "Pausar" : "Reproducir"}
            >
              {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
            </button>
            <button 
              onClick={() => setCurrentScreen(prev => getNextScreenIndex(prev, activeScreens, 1))}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 hover:border-white/20 transition-all cursor-pointer"
              title="Siguiente"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Velocidad */}
          <div className="flex items-center gap-3 bg-white/5 px-5 py-2.5 rounded-[1.5rem] border border-white/10">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Rotación:</span>
            <input 
              type="range" 
              min={4} 
              max={30} 
              value={rotationSpeed} 
              onChange={(e) => setRotationSpeed(Number(e.target.value))}
              className="w-24 accent-lingote-gold cursor-pointer"
            />
            <span className="text-xs font-black italic text-lingote-gold">{rotationSpeed}s</span>
          </div>

          {/* Saltos directos a pantallas */}
          <div className="flex flex-wrap gap-1.5 max-w-sm justify-center">
            {activeScreens.map((active, idx) => {
              if (!active) return null;
              const screenNames = [
                "Bienvenida / QR",
                "Clásico & Bocata",
                "Tico & Soberano",
                "Patrón & Supremo",
                "Combo Bocata",
                "La Trilogía",
                "Supremo XL",
                "Banquete Real",
                "Salsas"
              ];
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentScreen(idx)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    currentScreen === idx 
                      ? 'bg-lingote-gold text-slate-950 font-black shadow-lg shadow-lingote-gold/20' 
                      : 'bg-white/5 text-slate-400 hover:text-white border border-transparent hover:border-white/10'
                  }`}
                >
                  {screenNames[idx]}
                </button>
              );
            })}
          </div>

          {/* Controles de salida / pantalla completa */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen().catch((err) => {
                    console.error('Error al entrar a pantalla completa:', err);
                  });
                } else {
                  document.exitFullscreen();
                }
              }}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all cursor-pointer"
              title="Pantalla Completa"
            >
              <Maximize size={18} />
            </button>
            <button
              onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))}
              className="px-5 py-2.5 bg-red-950/40 text-red-500 hover:bg-red-950/60 border border-red-500/30 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer active:scale-95"
            >
              Cerrar Monitor
            </button>
          </div>

        </div>

        {/* Configuración de pantallas activas */}
        <div className="border-t border-white/10 pt-4 flex flex-col gap-2">
          <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 text-left">Activar / Desactivar del Carrusel:</span>
          <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
            {activeScreens.map((active, idx) => {
              const screenNames = [
                "Bienvenida / QR",
                "Clásico & Bocata",
                "Tico & Soberano",
                "Patrón & Supremo",
                "Combo Bocata",
                "La Trilogía",
                "Supremo XL",
                "Banquete Real",
                "Salsas"
              ];
              return (
                <label 
                  key={idx} 
                  className={`flex items-center gap-1.5 cursor-pointer p-1.5 rounded-lg border text-[8px] font-bold uppercase transition-all select-none ${
                    active 
                      ? 'bg-lingote-gold/5 border-lingote-gold/20 text-lingote-gold' 
                      : 'bg-transparent border-white/5 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => {
                      const copy = [...activeScreens];
                      copy[idx] = e.target.checked;
                      
                      // Asegurar que al menos una pantalla esté activa
                      if (copy.filter(Boolean).length > 0) {
                        setActiveScreens(copy);
                        if (currentScreen === idx && !e.target.checked) {
                          setCurrentScreen(getNextScreenIndex(idx, copy, 1));
                        }
                      }
                    }}
                    className="accent-lingote-gold scale-75"
                  />
                  <span className="truncate">{screenNames[idx]}</span>
                </label>
              );
            })}
          </div>
        </div>

      </div>

      <style>{`
        @keyframes bounce-x { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(20px); } }
        .animate-bounce-x { animation: bounce-x 1.5s infinite; }
        .cursor-none { cursor: ${showControls ? 'default' : 'none'}; }
      `}</style>
    </div>
  );
};

export default MenuMostrador;
