import { useState, useEffect } from 'react';
import { 
  TrendingUp, Wallet, AlertTriangle, 
  CheckCircle2, ArrowUpRight, Info
} from 'lucide-react';

interface Ingrediente {
  id: string;
  nombre: string;
  precioCompra: number; 
  cantidadReceta: number; 
  merma: number; 
}

interface EscandalloCompleto {
  id: string;
  nombre: string;
  porciones: number;
  margenObjetivo: number;
  packaging: number;
  ingredientes: Ingrediente[];
}

interface GastosGlobales {
  alquiler: number;
  luz: number;
  agua: number;
  gas: number;
  internet: number;
  impuestos: number;
  seguros: number;
  salarioPropietario: number;
  metaVentasMensual: number;
}

const Dashboard = () => {
  const [recetas, setRecetas] = useState<EscandalloCompleto[]>([]);
  const [gastos, setGastos] = useState<GastosGlobales | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('lingote_escandallos');
    const savedGastos = localStorage.getItem('lingote_gastos_globales');
    if (saved) setRecetas(JSON.parse(saved));
    if (savedGastos) setGastos(JSON.parse(savedGastos));
  }, []);

  // --- LÓGICA DE INTELIGENCIA ---
  
  // 1. Gastos Fijos Totales
  const totalGastosFijos = gastos ? (
    gastos.alquiler + gastos.luz + gastos.agua + gastos.gas + 
    gastos.internet + gastos.impuestos + gastos.seguros + gastos.salarioPropietario
  ) : 0;

  // 2. Cálculo de métricas por producto (INCLUYENDO GASTOS FIJOS)
  const productosAnalizados = recetas.map(r => {
    const cuotaOpUnidad = totalGastosFijos / Math.max(1, gastos?.metaVentasMensual || 1);
    
    const costoInsumos = r.ingredientes.reduce((sum, ing) => {
      const costoBase = (ing.cantidadReceta / 1000) * ing.precioCompra;
      const factorMerma = ing.merma >= 100 ? 1 : 1 / (1 - (ing.merma / 100));
      return sum + (costoBase * factorMerma);
    }, 0);

    const costoBatchTotal = costoInsumos + r.packaging + (cuotaOpUnidad * r.porciones);
    const costoUnidad = costoBatchTotal / r.porciones;
    const divisorMargen = (100 - r.margenObjetivo) / 100;
    const pvp = divisorMargen > 0 ? (costoUnidad / divisorMargen) : 0;
    const utilidadUnidad = pvp - costoUnidad;

    // Margen de Contribución: Lo que cada lingote aporta para pagar Alquiler + Tu Sueldo
    // Se calcula restando solo los ingredientes y el empaque del PVP
    const costoVariableUnidad = (costoInsumos + r.packaging) / r.porciones;
    const margenContribucion = pvp - costoVariableUnidad;

    return {
      nombre: r.nombre,
      utilidad: utilidadUnidad,
      margenContribucion: margenContribucion,
      margen: r.margenObjetivo,
      costo: costoUnidad,
      pvp: pvp
    };
  }).filter(p => p.pvp > 0);

  // 3. Punto de Equilibrio (Breakeven) REAL
  // ¿Cuántas unidades de "Margen de Contribución" promedio necesito para pagar el total de gastos fijos?
  const utilidadPromedio = productosAnalizados.length > 0 
    ? productosAnalizados.reduce((sum, p) => sum + p.utilidad, 0) / productosAnalizados.length 
    : 0;

  const contribucionPromedio = productosAnalizados.length > 0 
    ? productosAnalizados.reduce((sum, p) => sum + p.margenContribucion, 0) / productosAnalizados.length 
    : 0;
  
  const breakevenUnidades = contribucionPromedio > 0 ? Math.ceil(totalGastosFijos / contribucionPromedio) : 0;

  // 4. Rankings
  const topRentables = [...productosAnalizados].sort((a, b) => b.utilidad - a.utilidad).slice(0, 3);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 text-left">
      
      {/* 1. KPIS PRINCIPALES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group border border-white/5">
           <div className="relative z-10">
              <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1 italic">Gastos Fijos / Mes</p>
              <h3 className="text-3xl font-black tracking-tighter text-lingote-gold leading-none italic">₡{totalGastosFijos.toLocaleString()}</h3>
           </div>
           <Wallet className="absolute -right-4 -bottom-4 text-white/5 group-hover:scale-110 transition-transform" size={120} />
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-lingote-accent shadow-sm relative overflow-hidden group">
           <div className="relative z-10">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1 italic">Punto de Equilibrio</p>
              <h3 className="text-3xl font-black tracking-tighter text-slate-900 leading-none italic">{breakevenUnidades} <span className="text-xs font-bold text-slate-300">Unid / Mes</span></h3>
           </div>
           <CheckCircle2 className="absolute -right-4 -bottom-4 text-slate-50 group-hover:text-green-50 transition-colors" size={120} />
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-lingote-accent shadow-sm relative overflow-hidden group">
           <div className="relative z-10">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1 italic">Margen Promedio</p>
              <h3 className="text-3xl font-black tracking-tighter text-green-600 leading-none italic">
                {productosAnalizados.length > 0 
                  ? Math.round(productosAnalizados.reduce((sum, p) => sum + p.margen, 0) / productosAnalizados.length)
                  : 0}%
              </h3>
           </div>
           <TrendingUp className="absolute -right-4 -bottom-4 text-slate-50 group-hover:text-green-50 transition-colors" size={120} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* RANKING DE RENTABILIDAD */}
        <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-lingote-accent shadow-sm space-y-6">
           <div className="flex items-center gap-3">
              <div className="bg-slate-900 p-2 rounded-xl text-lingote-gold"><ArrowUpRight size={18} /></div>
              <h4 className="text-lg font-black uppercase tracking-tighter italic">Top 3 Rentabilidad</h4>
           </div>
           
           <div className="space-y-4">
              {topRentables.length === 0 ? (
                <p className="text-[10px] text-slate-300 italic uppercase py-10 text-center">No hay datos suficientes</p>
              ) : topRentables.map((prod, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:border-lingote-gold/30 transition-all">
                   <div className="flex items-center gap-4">
                      <span className="text-2xl font-black text-slate-200">#{i+1}</span>
                      <div>
                         <p className="font-black text-slate-800 uppercase text-xs italic leading-none">{prod.nombre}</p>
                         <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Utilidad: ₡{Math.round(prod.utilidad).toLocaleString()}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-black text-green-600 uppercase italic">PVP: ₡{Math.round(prod.pvp).toLocaleString()}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* ALERTA DE COSTOS / MERMAS */}
        <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-lingote-accent shadow-sm space-y-6">
           <div className="flex items-center gap-3">
              <div className="bg-amber-100 p-2 rounded-xl text-amber-600"><AlertTriangle size={18} /></div>
              <h4 className="text-lg font-black uppercase tracking-tighter italic text-amber-600">Alerta de Operación</h4>
           </div>

           <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100 space-y-4 relative overflow-hidden">
              <div className="relative z-10 space-y-2">
                 <p className="text-[11px] font-bold text-amber-800 leading-relaxed uppercase italic">
                    Para cubrir tus gastos fijos (₡{totalGastosFijos.toLocaleString()}) necesitas vender al menos <span className="font-black text-lg underline">{breakevenUnidades} lingotes</span> mensuales con el margen actual.
                 </p>
                 <div className="flex items-center gap-2 pt-2">
                    <Info size={14} className="text-amber-400" />
                    <p className="text-[8px] font-black text-amber-600 uppercase tracking-widest leading-none">Dato basado en utilidad promedio por unidad</p>
                 </div>
              </div>
           </div>

           <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
              <p className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest italic">Costo de Insumos Activos</p>
              <div className="flex items-end gap-2">
                 <h3 className="text-4xl font-black text-slate-700 tracking-tighter italic leading-none">{recetas.length}</h3>
                 <p className="text-[10px] font-bold text-slate-300 uppercase mb-1">Escandallos en Sistema</p>
              </div>
           </div>
        </div>

      </div>

      {/* FOOTER ESTRATÉGICO */}
      <div className="bg-lingote-text p-6 rounded-[2rem] text-white flex flex-col md:flex-row justify-between items-center gap-4 shadow-lg border border-white/5">
         <div className="text-center md:text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 leading-none mb-1">Tu Meta Mensual</p>
            <p className="text-xl font-black tracking-tighter italic text-lingote-gold uppercase leading-none">Vender {gastos?.metaVentasMensual || 0} Unidades</p>
         </div>
         <div className="h-px w-full md:h-10 md:w-px bg-white/10"></div>
         <div className="text-center md:text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 leading-none mb-1">Tu Utilidad Mensual Proyectada</p>
            <p className="text-xl font-black tracking-tighter italic text-green-400 uppercase leading-none">
              + ₡{Math.round(utilidadPromedio * (gastos?.metaVentasMensual || 0)).toLocaleString()}
            </p>
         </div>
      </div>

    </div>
  );
};

export default Dashboard;
