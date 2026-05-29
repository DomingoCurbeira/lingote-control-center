import { useState, useEffect } from 'react';
import { 
  BarChart3, Calendar, 
  Loader2, UtensilsCrossed, Zap, IceCream, Droplet, TrendingUp,
  Crown, AlertTriangle
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SalesData {
  id: string;
  nombre: string;
  cantidad: number;
  total: number;
}

const AnalisisVentas = () => {
  const [data, setData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState<'mes' | 'total'>('mes');

  useEffect(() => {
    fetchVentas();
  }, [periodo]);

  const fetchVentas = async () => {
    setLoading(true);
    let query = supabase.from('bitacora_ventas').select('ventas');

    if (periodo === 'mes') {
      const hoy = new Date();
      const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString();
      query = query.gte('fecha', primerDiaMes);
    }

    const { data: rawData, error } = await query;

    if (!error && rawData) {
      const aggregados: Record<string, SalesData> = {};
      
      rawData.forEach((row: any) => {
        row.ventas.forEach((item: any) => {
          if (!aggregados[item.id]) {
            aggregados[item.id] = { id: item.id, nombre: item.nombre, cantidad: 0, total: 0 };
          }
          aggregados[item.id].cantidad += item.cantidad;
          aggregados[item.id].total += (item.cantidad * item.precio);
        });
      });

      setData(Object.values(aggregados).sort((a, b) => b.cantidad - a.cantidad));
    }
    setLoading(false);
  };

  const renderChart = (title: string, icon: any, filterPrefix: string) => {
    const items = data.filter(d => d.id.startsWith(filterPrefix));
    if (items.length === 0) return null;

    const maxCantidad = Math.max(...items.map(i => i.cantidad));
    const minCantidad = Math.min(...items.map(i => i.cantidad));

    return (
      <div className="bg-white p-8 rounded-[2.5rem] border border-lingote-accent shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2.5 rounded-xl text-lingote-gold">{icon}</div>
            <h4 className="text-xl font-black uppercase tracking-tighter italic">{title}</h4>
          </div>
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Unidades Vendidas</p>
        </div>

        <div className="space-y-6">
          {items.map(item => {
            const percentage = (item.cantidad / maxCantidad) * 100;
            const isTop = item.cantidad === maxCantidad && maxCantidad > 0;
            const isBottom = item.cantidad === minCantidad && items.length > 1 && item.cantidad < (maxCantidad * 0.3);

            return (
              <div key={item.id} className="space-y-2">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-2 min-w-0">
                    {isTop && <Crown size={12} className="text-green-500 shrink-0" fill="currentColor" />}
                    {isBottom && <AlertTriangle size={12} className="text-red-500 shrink-0" fill="currentColor" />}
                    <p className={`text-[11px] font-black uppercase italic leading-none truncate pr-4 ${isBottom ? 'text-red-500' : 'text-slate-700'}`}>
                      {item.nombre}
                    </p>
                  </div>
                  <p className={`text-sm font-black italic leading-none ${isTop ? 'text-green-600' : isBottom ? 'text-red-600' : 'text-slate-900'}`}>
                    {item.cantidad}
                  </p>
                </div>
                <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out relative group ${isTop ? 'bg-green-500' : isBottom ? 'bg-red-500' : 'bg-slate-900'}`}
                    style={{ width: `${percentage}%` }}
                  >
                    {isTop && <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse"></div>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 text-left">
      
      {/* HEADER */}
      <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl border border-white/5 mx-1">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <h2 className="text-3xl font-black tracking-tighter uppercase italic leading-none mb-2">Ingeniería de Popularidad</h2>
            <p className="text-lingote-gold font-bold uppercase tracking-widest text-[10px] italic">Mapa de Ventas y Rendimiento de Menú</p>
          </div>
          
          <div className="flex bg-white/10 backdrop-blur-xl p-1 rounded-2xl border border-white/10 shadow-inner">
            <button 
              onClick={() => setPeriodo('mes')}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${periodo === 'mes' ? 'bg-white text-slate-900 shadow-xl' : 'text-white/40 hover:text-white'}`}
            >
              Mes Actual
            </button>
            <button 
              onClick={() => setPeriodo('total')}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${periodo === 'total' ? 'bg-white text-slate-900 shadow-xl' : 'text-white/40 hover:text-white'}`}
            >
              Histórico Total
            </button>
          </div>
        </div>
        <BarChart3 className="absolute -right-4 -bottom-4 text-white/5" size={150} />
      </div>

      {loading ? (
        <div className="py-40 flex flex-col items-center gap-4 text-slate-300">
           <Loader2 className="animate-spin" size={64} strokeWidth={1} />
           <p className="font-black uppercase tracking-widest text-xs italic">Procesando Big Data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mx-1">
           {renderChart("Lingotes", <UtensilsCrossed size={20} />, "lin-")}
           {renderChart("Promociones", <Zap size={20} />, "promo-")}
           {renderChart("Postres", <IceCream size={20} />, "pos-")}
           {renderChart("Extras y Salsas", <Droplet size={20} />, "beb-")}
           {renderChart("Venta por Frasco", <TrendingUp size={20} />, "sal-240")}
        </div>
      )}

      {/* LEYENDA ESTRATÉGICA */}
      <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/5 mx-1 shadow-2xl space-y-8">
         <div className="text-left space-y-1">
            <h4 className="text-lg font-black text-lingote-gold uppercase italic tracking-tighter">Guía de Decisiones Estratégicas</h4>
            <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">¿Qué hacer según el rendimiento del plato?</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 flex gap-4 items-start">
               <div className="bg-green-500/20 p-2 rounded-xl text-green-400 shrink-0"><Crown size={18} /></div>
               <div className="text-left">
                  <p className="font-black text-[10px] text-white uppercase italic">Plato Estrella (Verde)</p>
                  <p className="text-[9px] text-slate-400 uppercase mt-1 leading-relaxed">Alta Popularidad + Alta Rentabilidad. <span className="text-green-400">Acción:</span> No tocar, es tu motor de éxito.</p>
               </div>
            </div>

            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 flex gap-4 items-start">
               <div className="bg-lingote-gold/20 p-2 rounded-xl text-lingote-gold shrink-0"><TrendingUp size={18} /></div>
               <div className="text-left">
                  <p className="font-black text-[10px] text-white uppercase italic">Caballito de Batalla</p>
                  <p className="text-[9px] text-slate-400 uppercase mt-1 leading-relaxed">Alta Popularidad + Baja Rentabilidad. <span className="text-lingote-gold">Acción:</span> Intentar subir precio ₡100 o reducir costos.</p>
               </div>
            </div>

            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 flex gap-4 items-start">
               <div className="bg-blue-500/20 p-2 rounded-xl text-blue-400 shrink-0"><BarChart3 size={18} /></div>
               <div className="text-left">
                  <p className="font-black text-[10px] text-white uppercase italic">Rompecabezas</p>
                  <p className="text-[9px] text-slate-400 uppercase mt-1 leading-relaxed">Baja Popularidad + Alta Rentabilidad. <span className="text-blue-400">Acción:</span> Darle más publicidad o bajar un poco el precio.</p>
               </div>
            </div>

            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 flex gap-4 items-start">
               <div className="bg-red-500/20 p-2 rounded-xl text-red-400 shrink-0"><AlertTriangle size={18} /></div>
               <div className="text-left">
                  <p className="font-black text-[10px] text-white uppercase italic">Plato Crítico (Rojo)</p>
                  <p className="text-[9px] text-slate-400 uppercase mt-1 leading-relaxed">Baja Popularidad + Baja Rentabilidad. <span className="text-red-400">Acción:</span> Eliminar del menú después de 90 días.</p>
               </div>
            </div>
         </div>
      </div>

      {/* NOTA ESTRATÉGICA */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-lingote-accent shadow-sm mx-1 flex gap-6 items-center">
         <div className="bg-slate-50 p-4 rounded-3xl text-slate-400 shrink-0"><Calendar size={32} strokeWidth={1} /></div>
         <div className="space-y-1">
            <h5 className="font-black text-slate-800 uppercase italic tracking-tighter text-sm">Consejo de Ingeniería de Menú</h5>
            <p className="text-[10px] text-slate-400 font-medium leading-relaxed uppercase">
              Los productos con barras más largas son tus "Estrellas". Los que tienen barras mínimas deben ser <span className="text-red-400">revisados o eliminados</span> para optimizar tus costos operativos y espacio en cocina.
            </p>
         </div>
      </div>

    </div>
  );
};

export default AnalisisVentas;
