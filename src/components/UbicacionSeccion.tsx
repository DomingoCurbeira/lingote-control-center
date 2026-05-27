import { MapPin, Clock, Navigation, Info } from 'lucide-react';

const UbicacionSeccion = () => {
  return (
    <section className="py-12 px-4 space-y-8 bg-white/80 backdrop-blur-md rounded-[3rem] border border-slate-100 shadow-xl max-w-lg mx-auto my-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 bg-lingote-gold/10 px-4 py-1 rounded-full text-slate-800 border border-lingote-gold/20 mb-2">
          <MapPin size={14} className="text-lingote-gold" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Donde encontrarnos</span>
        </div>
        <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
          Próximamente en <br/>
          <span className="text-lingote-gold">Cartago, Costa Rica</span>
        </h2>
        <p className="text-slate-500 text-[11px] italic font-medium max-w-[280px] mx-auto uppercase tracking-wide">
          Estamos afinando los detalles para traerte el sabor auténtico de España al corazón de la vieja metrópoli.
        </p>
      </div>

      <div className="space-y-6">
        {/* Placeholder de Mapa Elegante */}
        <div className="relative aspect-square rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white group">
          <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center p-8 text-center space-y-4">
             {/* Un diseño de mapa estilizado con CSS */}
             <div className="w-full h-full absolute inset-0 opacity-5 grayscale">
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M0,20 L100,20 M0,50 L100,50 M0,80 L100,80 M20,0 L20,100 M50,0 L50,100 M80,0 L80,100" stroke="black" strokeWidth="0.5" fill="none" />
                </svg>
             </div>
             <div className="bg-slate-900 p-6 rounded-full shadow-2xl shadow-slate-900/40 z-10 animate-bounce">
                <MapPin size={40} className="text-lingote-gold" />
             </div>
             <div className="z-10">
                <h4 className="font-black italic uppercase text-slate-800 tracking-tighter text-sm">Buscando el local ideal</h4>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">🚧 Obra en progreso</p>
             </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 to-transparent pointer-events-none" />
        </div>

        {/* Info de Recogida */}
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-50 flex items-start gap-4">
             <div className="bg-slate-900 p-3 rounded-2xl text-lingote-gold shrink-0">
                <Navigation size={20} />
             </div>
             <div className="text-left">
                <h4 className="font-black uppercase italic text-xs text-slate-800 tracking-tight">Punto de Recogida</h4>
                <p className="text-[10px] text-slate-500 font-medium italic mt-1 leading-relaxed">
                  Por ahora, trabajamos bajo la modalidad de <span className="font-bold text-slate-800">Take Away</span>. Una vez realices tu pedido por WhatsApp, te indicaremos el punto exacto en Cartago centro.
                </p>
             </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-50 flex items-start gap-4">
             <div className="bg-slate-900 p-3 rounded-2xl text-lingote-gold shrink-0">
                <Clock size={20} />
             </div>
             <div className="text-left">
                <h4 className="font-black uppercase italic text-xs text-slate-800 tracking-tight">Horario de Atención</h4>
                <p className="text-[10px] text-slate-500 font-medium italic mt-1 uppercase tracking-tighter">
                  Lunes a Sábado <br/>
                  <span className="text-slate-900 font-black text-sm">11:00 AM — 8:00 PM</span>
                </p>
             </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-3xl shadow-xl flex items-start gap-4 text-white border border-white/5">
             <div className="bg-white/10 p-3 rounded-2xl text-lingote-gold shrink-0">
                <Info size={20} />
             </div>
             <div className="text-left">
                <h4 className="font-black uppercase italic text-xs tracking-tight text-lingote-gold">Dato Importante</h4>
                <p className="text-[9px] text-slate-400 font-medium italic mt-1 leading-relaxed">
                  Todos nuestros lingotes se preparan al momento para garantizar la jugosidad. Te recomendamos pedir con al menos <span className="text-white underline">20 minutos</span> de antelación.
                </p>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UbicacionSeccion;
