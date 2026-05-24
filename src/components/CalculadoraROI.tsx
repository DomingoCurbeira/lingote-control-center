import { useState, useEffect } from 'react';
import { Target, TrendingUp, ArrowRight, DollarSign, Package, Calendar, Info } from 'lucide-react';

interface EscandalloCompleto {
  id: string;
  nombre: string;
  porciones: number;
  margenObjetivo: number;
  ingredientes: any[];
  packaging: number;
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

const CalculadoraROI = () => {
  const [recetas, setRecetas] = useState<EscandalloCompleto[]>([]);
  const [gastos, setGastos] = useState<GastosGlobales | null>(null);
  const [selectedProductId, setSelectedId] = useState<string>('');
  const [montoInversion, setInversion] = useState<number>(0);
  const [metaVentasDiarias, setMetaDiaria] = useState<number>(30);

  useEffect(() => {
    const saved = localStorage.getItem('lingote_escandallos');
    const savedGastos = localStorage.getItem('lingote_gastos_globales');
    if (saved) {
      const parsed = JSON.parse(saved);
      setRecetas(parsed);
      if (parsed.length > 0) setSelectedId(parsed[0].id);
    }
    if (savedGastos) {
      setGastos(JSON.parse(savedGastos));
    }
  }, []);

  const activeReceta = recetas.find(r => r.id === selectedProductId);

  // --- CÁLCULOS ---
  const calcularUtilidadUnidad = () => {
    if (!activeReceta || !gastos) return 0;
    
    const totalGastosFijos = gastos.alquiler + gastos.luz + gastos.agua + gastos.gas + gastos.internet + gastos.impuestos + gastos.seguros + gastos.salarioPropietario;
    const cuotaOp = totalGastosFijos / Math.max(1, gastos.metaVentasMensual);
    
    // Simulación simplificada del costo (basada en la lógica de Rentabilidad.tsx)
    // Para ser exactos, necesitaríamos la función calcularCostoIngrediente aquí también.
    // Usaremos un porcentaje aproximado o el margen guardado si no queremos duplicar toda la lógica.
    // Pero mejor duplicamos la lógica mínima para precisión.
    
    const costoInsumosTotal = activeReceta.ingredientes.reduce((sum, ing) => {
      const costoBase = (ing.cantidadReceta / 1000) * ing.precioCompra;
      const factorMerma = ing.merma >= 100 ? 1 : 1 / (1 - (ing.merma / 100));
      return sum + (costoBase * factorMerma);
    }, 0);

    const costoBatchTotal = costoInsumosTotal + activeReceta.packaging + (cuotaOp * activeReceta.porciones);
    const costoUnidad = costoBatchTotal / activeReceta.porciones;
    
    const divisorMargen = (100 - activeReceta.margenObjetivo) / 100;
    const pvpSugerido = divisorMargen > 0 ? (costoUnidad / divisorMargen) : 0;
    
    return pvpSugerido - costoUnidad;
  };

  const utilidadNetaUnidad = calcularUtilidadUnidad();
  const unidadesParaROI = utilidadNetaUnidad > 0 ? Math.ceil(montoInversion / utilidadNetaUnidad) : 0;
  const diasParaROI = unidadesParaROI > 0 ? Math.ceil(unidadesParaROI / metaVentasDiarias) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-20 max-w-full overflow-x-hidden">
      
      {/* HEADER ESTRATÉGICO */}
      <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl border border-white/5 mx-1">
        <div className="relative z-10 text-left">
          <h2 className="text-3xl font-black tracking-tighter uppercase italic leading-none mb-2">Simulador de ROI</h2>
          <p className="text-lingote-gold font-bold uppercase tracking-widest text-[10px] italic">Ingeniería de Recuperación de Inversión</p>
        </div>
        <Target className="absolute -right-4 -bottom-4 text-white/5" size={180} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mx-1">
        {/* PANEL DE ENTRADA */}
        <div className="bg-white p-6 md:p-10 rounded-[2rem] border border-lingote-accent shadow-sm space-y-8">
           <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest italic text-left">1. ¿Qué quieres amortizar?</label>
                <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-4 border border-slate-100 focus-within:border-lingote-gold transition-colors">
                  <div className="bg-white p-3 rounded-xl shadow-sm text-lingote-gold"><DollarSign size={20} /></div>
                  <input 
                    type="number" 
                    placeholder="Monto de la inversión (₡)"
                    className="flex-1 bg-transparent border-none outline-none text-xl font-black text-slate-700"
                    value={montoInversion || ''}
                    onChange={(e) => setInversion(Number(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest italic text-left">2. Producto que pagará la cuenta</label>
                <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-4 border border-slate-100">
                  <div className="bg-white p-3 rounded-xl shadow-sm text-slate-400"><Package size={20} /></div>
                  <select 
                    className="flex-1 bg-transparent border-none outline-none text-base font-bold text-slate-700 appearance-none cursor-pointer"
                    value={selectedProductId}
                    onChange={(e) => setSelectedId(e.target.value)}
                  >
                    {recetas.length === 0 && <option>No hay recetas guardadas</option>}
                    {recetas.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                  </select>
                </div>
                {activeReceta && (
                  <div className="mt-2 flex items-center gap-2 px-4 py-1 text-[9px] font-bold text-green-600 bg-green-50 w-fit rounded-full uppercase tracking-tighter">
                    Utilidad Actual: ₡{Math.round(utilidadNetaUnidad).toLocaleString()} / unidad
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest italic text-left">3. Volumen de Venta Diario</label>
                <div className="bg-slate-50 p-6 rounded-2xl space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-3xl font-black text-slate-800 italic">{metaVentasDiarias}</span>
                    <span className="text-[10px] font-black text-slate-300 uppercase mb-1">Unid / Día</span>
                  </div>
                  <input 
                    type="range" min="1" max="200" step="5"
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-lingote-gold"
                    value={metaVentasDiarias}
                    onChange={(e) => setMetaDiaria(Number(e.target.value))}
                  />
                </div>
              </div>
           </div>

           <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 flex gap-4 text-left">
              <Info className="text-amber-600 shrink-0" size={20} />
              <p className="text-[10px] font-bold text-amber-800 leading-tight uppercase italic">
                El cálculo incluye el costo de ingredientes, empaque y tu cuota mensual de gastos operativos fijada en Finanzas.
              </p>
           </div>
        </div>

        {/* RESULTADOS ROI */}
        <div className="flex flex-col gap-4">
           <div className="bg-white p-8 rounded-[2rem] border border-lingote-accent shadow-xl flex-1 flex flex-col justify-center items-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><TrendingUp size={80} /></div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4 italic">Esfuerzo de Recuperación</p>
              <h3 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-none">{unidadesParaROI.toLocaleString()}</h3>
              <p className="text-xs md:text-sm font-black uppercase text-lingote-gold tracking-widest mt-2">Unidades Totales</p>
              <div className="mt-8 pt-8 border-t border-slate-100 w-full flex flex-col items-center">
                 <div className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-2xl hover:scale-105 transition-transform cursor-default">
                    <Calendar size={24} className="text-lingote-gold" />
                    <div className="text-left">
                       <p className="text-[8px] font-black uppercase tracking-widest opacity-50 leading-none mb-1">Tiempo Estimado</p>
                       <p className="text-xl font-black tracking-tighter leading-none italic uppercase">{diasParaROI} Días</p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-lingote-text p-6 rounded-[2rem] text-white flex justify-between items-center group overflow-hidden relative shadow-lg">
              <div className="relative z-10 text-left">
                 <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">Impacto Mensual</p>
                 <h4 className="text-2xl font-black tracking-tighter text-lingote-gold uppercase italic">₡{(utilidadNetaUnidad * metaVentasDiarias * 30).toLocaleString()}</h4>
                 <p className="text-[8px] font-bold text-white/60 uppercase mt-1">Utilidad Bruta Proyectada</p>
              </div>
              <ArrowRight className="text-white/10 group-hover:translate-x-2 transition-transform relative z-10" size={48} />
           </div>
        </div>
      </div>

    </div>
  );
};

export default CalculadoraROI;
