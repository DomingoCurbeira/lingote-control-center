import { Sparkles, CheckCircle2 } from 'lucide-react';

interface Props {
  puntos: number;
}

const StampCard = ({ puntos }: Props) => {
  const totalSellos = 10;
  // Solo mostramos los puntos hasta el siguiente premio (módulo 10)
  const sellosActuales = puntos % totalSellos;
  const premiosGanados = Math.floor(puntos / totalSellos);
  
  return (
    <div className="bg-slate-900 p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-white/10 text-left">
      {/* Brillos decorativos */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-lingote-gold/5 blur-3xl rounded-full -mr-16 -mt-16" />
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h4 className="text-lingote-gold font-black uppercase italic tracking-tighter text-lg leading-none">Club VIP Lingote</h4>
            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Acumulá puntos y canjeá regalías</p>
          </div>
          {premiosGanados > 0 && (
            <div className="bg-lingote-gold text-slate-900 px-3 py-1 rounded-full text-[9px] font-black uppercase italic animate-pulse">
               {premiosGanados} {premiosGanados === 1 ? 'Regalo Listo' : 'Regalos Listos'} 🎁
            </div>
          )}
        </div>

        <div className="grid grid-cols-5 gap-3">
          {Array.from({ length: totalSellos }).map((_, i) => {
            const isStamped = i < sellosActuales;
            const isLast = i === totalSellos - 1;

            return (
              <div 
                key={i} 
                className={`aspect-square rounded-2xl flex items-center justify-center relative transition-all duration-500 ${
                  isStamped 
                    ? 'bg-lingote-gold shadow-lg shadow-lingote-gold/20' 
                    : 'bg-white/5 border-2 border-dashed border-white/10'
                }`}
              >
                {isStamped ? (
                  <div className="text-slate-900">
                    <CheckCircle2 size={20} strokeWidth={3} />
                  </div>
                ) : (
                  <span className="text-[10px] font-black text-white/10 italic">{i + 1}</span>
                )}

                {isLast && !isStamped && (
                  <div className="absolute -top-1 -right-1">
                    <div className="bg-red-500 text-white text-[6px] font-black px-1.5 py-0.5 rounded-full uppercase animate-bounce">
                      FREE
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-6 border-t border-white/5">
          <p className="text-[9px] text-slate-400 font-medium italic text-center leading-relaxed uppercase tracking-widest">
            {sellosActuales === 9 
              ? "🥘 ¡TU PRÓXIMO LINGOTE ES GRATIS! 🎉" 
              : `Llegá a 10 puntos y llevate un Lingote Clásico GRATIS. Te faltan ${10 - sellosActuales} puntos.`}
          </p>
          <div className="flex items-center justify-center gap-2 mt-4 text-[8px] font-black text-slate-500 uppercase">
             <Sparkles size={10} className="text-lingote-gold" />
             <span>Cada lingote en tu pedido suma 1 punto</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StampCard;
