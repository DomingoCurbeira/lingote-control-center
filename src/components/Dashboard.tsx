import { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, TrendingUp, Wallet, AlertTriangle, 
  CheckCircle2, ArrowUpRight, Info, Loader2, Star, MessageCircle, FileText, Download, X
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { supabase } from '../lib/supabase';
import ReporteMensual from './ReporteMensual';

interface Cliente {
  nombre: string;
  puntos_lealtad: number;
  telefono: string;
}

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
  const [ventasMes, setVentasMes] = useState({ unidades: 0, bruto: 0, pedidos: 0 });
  const [topVentas, setTopVentas] = useState<{ nombre: string, cantidad: number }[]>([]);
  const [clientesVIP, setClientesVIP] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReporte, setShowReporte] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const reporteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      const savedRecetas = localStorage.getItem('lingote_escandallos');
      const savedGastos = localStorage.getItem('lingote_gastos_globales');
      if (savedRecetas) setRecetas(JSON.parse(savedRecetas));
      if (savedGastos) setGastos(JSON.parse(savedGastos));

      const hoy = new Date();
      const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString();
      
      const { data: ventasData } = await supabase
        .from('bitacora_ventas')
        .select('*')
        .gte('fecha', primerDiaMes);

      if (ventasData) {
        const productStats: Record<string, { nombre: string, cantidad: number }> = {};
        const stats = ventasData.reduce((acc: any, r: any) => {
          const unidadesDia = r.ventas.reduce((sum: number, v: any) => {
            if (!productStats[v.id]) productStats[v.id] = { nombre: v.nombre, cantidad: 0 };
            productStats[v.id].cantidad += v.cantidad;
            return sum + v.cantidad;
          }, 0);
          return {
            unidades: acc.unidades + unidadesDia,
            bruto: acc.bruto + r.total_bruto,
            pedidos: acc.pedidos + 1
          };
        }, { unidades: 0, bruto: 0, pedidos: 0 });
        
        setVentasMes(stats);
        setTopVentas(Object.values(productStats).sort((a, b) => b.cantidad - a.cantidad).slice(0, 5));
      }

      const { data: clientesData } = await supabase
        .from('clientes')
        .select('nombre, puntos_lealtad, telefono')
        .order('puntos_lealtad', { ascending: false })
        .limit(5);
      
      if (clientesData) setClientesVIP(clientesData);

      setLoading(false);
    };

    fetchData();
  }, []);

  const descargarInforme = async () => {
    if (reporteRef.current) {
      const dataUrl = await toPng(reporteRef.current, { 
        cacheBust: true, 
        pixelRatio: 2,
        width: 794,
        height: 1123,
        style: { transform: 'none' }
      });
      const link = document.createElement('a');
      link.download = `Reporte-Lingote-${new Date().toLocaleDateString('es-CR')}.png`;
      link.href = dataUrl;
      link.click();
    }
  };

  // --- LÓGICA DE INTELIGENCIA ---
  
  const totalGastosFijos = gastos ? (
    gastos.alquiler + gastos.luz + gastos.agua + gastos.gas + 
    gastos.internet + gastos.impuestos + gastos.seguros + gastos.salarioPropietario
  ) : 0;

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

  const utilidadPromedio = productosAnalizados.length > 0 
    ? productosAnalizados.reduce((sum, p) => sum + p.utilidad, 0) / productosAnalizados.length 
    : 0;

  const contribucionPromedio = productosAnalizados.length > 0 
    ? productosAnalizados.reduce((sum, p) => sum + p.margenContribucion, 0) / productosAnalizados.length 
    : 0;
  
  const breakevenUnidades = contribucionPromedio > 0 ? Math.ceil(totalGastosFijos / contribucionPromedio) : 0;
  const topRentables = [...productosAnalizados].sort((a, b) => b.utilidad - a.utilidad).slice(0, 3);

  // Cálculos de Escalado A4
  const isMobile = windowWidth < 768;
  const scaleFactor = isMobile ? Math.min(0.48, (windowWidth - 40) / 794) : 1;
  const utilidadNetaReal = (contribucionPromedio * ventasMes.unidades) - totalGastosFijos;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-slate-300 gap-4">
         <Loader2 className="animate-spin" size={64} />
         <p className="font-black uppercase tracking-widest text-xs italic">Sincronizando con la nube...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 text-left">
      
      {/* HEADER DASHBOARD */}
      <div className="flex justify-between items-center px-1 mb-2">
         <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2 rounded-xl text-lingote-gold shadow-lg"><LayoutDashboard size={20} /></div>
            <h2 className="text-xl font-black uppercase tracking-tighter italic text-slate-800">Panel de Control</h2>
         </div>
         <button 
           onClick={() => setShowReporte(true)}
           className="flex items-center gap-2 px-6 py-3 bg-lingote-gold text-slate-900 rounded-2xl font-black text-[10px] uppercase shadow-2xl active:scale-95 transition-all italic border border-white/20"
         >
            <FileText size={14} /> Descargar Informe
         </button>
      </div>

      {/* PROGRESO REAL CLOUD */}
      <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-lingote-accent shadow-xl relative overflow-hidden">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            <div className="flex-1 w-full space-y-4">
               <div>
                  <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 italic">Rendimiento Real Cloud • Mayo 2026</h4>
                  <div className="flex items-end gap-3 mt-2">
                     <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-none italic">{ventasMes.unidades}</h2>
                     <p className="text-xs font-bold text-slate-400 uppercase mb-1">Unidades vendidas de {gastos?.metaVentasMensual || 0} (Meta)</p>
                  </div>
               </div>
               <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div 
                    className="h-full bg-slate-900 transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min(100, (ventasMes.unidades / (gastos?.metaVentasMensual || 1)) * 100)}%` }}
                  ></div>
               </div>
            </div>
            <div className="bg-slate-900 p-6 rounded-3xl text-white text-center min-w-[200px] shadow-2xl border border-white/10">
               <p className="text-[10px] font-black uppercase text-lingote-gold tracking-widest mb-1 italic">Venta Acumulada Mes</p>
               <h3 className="text-3xl font-black tracking-tighter italic leading-none">₡{ventasMes.bruto.toLocaleString()}</h3>
            </div>
         </div>
      </div>

      {/* KPIS PRINCIPALES */}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 md:p-10 rounded-[2.5rem] border border-lingote-accent shadow-sm space-y-6">
           <div className="flex items-center gap-3">
              <div className="bg-slate-900 p-2 rounded-xl text-lingote-gold"><ArrowUpRight size={18} /></div>
              <h4 className="text-lg font-black uppercase tracking-tighter italic">Top 3 Rentabilidad</h4>
           </div>
           <div className="space-y-4">
              {topRentables.length === 0 ? (
                <p className="text-[10px] text-slate-300 italic uppercase py-10 text-center">No hay datos suficientes</p>
              ) : topRentables.map((prod, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:border-lingote-gold/30 transition-all group">
                   <div className="flex items-center gap-4">
                      <span className="text-2xl font-black text-slate-200 group-hover:text-lingote-gold transition-colors">#{i+1}</span>
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

        <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-lingote-accent shadow-sm space-y-6">
           <div className="flex items-center gap-3">
              <div className="bg-slate-900 p-2 rounded-xl text-lingote-gold"><Star size={18} fill="currentColor" /></div>
              <h4 className="text-lg font-black uppercase tracking-tighter italic">Clientes VIP</h4>
           </div>
           <div className="space-y-4">
              {clientesVIP.length === 0 ? (
                <p className="text-[10px] text-slate-300 italic uppercase py-10 text-center">Sin clientes registrados</p>
              ) : clientesVIP.map((cliente, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:border-lingote-gold/30 transition-all group">
                   <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${i === 0 ? 'bg-lingote-gold text-slate-900' : 'bg-white text-slate-400 border border-slate-100'}`}>
                        {i + 1}
                      </div>
                      <div className="min-w-0">
                         <p className="font-black text-slate-800 uppercase text-[10px] italic leading-none truncate">{cliente.nombre}</p>
                         <div className="flex items-center gap-1 mt-1">
                            <span className="text-[10px] font-black text-slate-400">{cliente.puntos_lealtad}</span>
                            <Star size={8} className="text-lingote-gold" fill="currentColor" />
                         </div>
                      </div>
                   </div>
                   <a 
                     href={`https://wa.me/${cliente.telefono.replace(/\D/g, '')}`} 
                     target="_blank"
                     className="p-3 bg-[#25D366]/10 text-[#25D366] rounded-xl hover:bg-[#25D366] hover:text-white transition-all shadow-sm"
                   >
                     <MessageCircle size={14} />
                   </a>
                </div>
              ))}
           </div>
           {clientesVIP.length > 0 && (
              <p className="text-[7px] font-black text-slate-300 uppercase tracking-widest text-center mt-2 italic">
                Sincronizado con Cartera Cloud
              </p>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-lingote-accent shadow-sm space-y-6">
           <div className="flex items-center gap-3">
              <div className="bg-amber-100 p-2 rounded-xl text-amber-600"><AlertTriangle size={18} /></div>
              <h4 className="text-lg font-black uppercase tracking-tighter italic text-amber-600">Alerta de Operación</h4>
           </div>
           <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100 space-y-4 relative overflow-hidden">
              <div className="relative z-10 space-y-2">
                 <p className="text-[11px] font-bold text-amber-800 leading-relaxed uppercase italic">
                    Para cubrir tus gastos fijos (₡{totalGastosFijos.toLocaleString()}) necesitas vender al menos <span className="font-black text-lg underline">{breakevenUnidades} lingotes</span> mensuales.
                 </p>
                 <div className="flex items-center gap-2 pt-2">
                    <Info size={14} className="text-amber-400" />
                    <p className="text-[8px] font-black text-amber-600 uppercase tracking-widest leading-none">Cálculo real basado en margen de contribución</p>
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

        <div className="bg-lingote-text p-6 rounded-[2rem] text-white flex flex-col justify-center items-center gap-4 shadow-lg border border-white/5">
           <div className="text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 leading-none mb-1">Tu Meta Mensual</p>
              <p className="text-xl font-black tracking-tighter italic text-lingote-gold uppercase leading-none">Vender {gastos?.metaVentasMensual || 0} Unidades</p>
           </div>
           <div className="h-px w-full bg-white/10 my-2"></div>
           <div className="text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 leading-none mb-1">Tu Utilidad Mensual Proyectada</p>
              <p className="text-xl font-black tracking-tighter italic text-green-400 uppercase leading-none">
                + ₡{Math.round(utilidadPromedio * (gastos?.metaVentasMensual || 0)).toLocaleString()}
              </p>
           </div>
        </div>
      </div>

      {/* MODAL REPORTE PREVIEW */}
      {showReporte && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 md:p-10 animate-in fade-in duration-500 no-print">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-2xl" onClick={() => setShowReporte(false)} />
          <div className="relative w-full max-w-5xl h-full flex flex-col items-center gap-6 animate-in zoom-in duration-500 overflow-y-auto p-6 scrollbar-hide">
            <div className="flex gap-4 sticky top-0 z-10 w-full justify-center">
              <button 
                onClick={descargarInforme} 
                className="flex-1 max-w-xs flex items-center justify-center gap-3 px-8 py-5 bg-lingote-gold text-slate-900 rounded-2xl font-black text-xs uppercase shadow-2xl active:scale-95 transition-all italic"
              >
                <Download size={20} /> Guardar Informe
              </button>
              <button 
                onClick={() => setShowReporte(false)} 
                className="w-16 h-16 flex items-center justify-center bg-white/10 text-white rounded-2xl hover:bg-white/20 transition-all backdrop-blur-xl border border-white/10"
              >
                <X size={32} />
              </button>
            </div>
            
            <div 
              className="w-full flex justify-center py-10"
              style={{ height: isMobile ? (1123 * scaleFactor) + 100 : 'auto' }}
            >
          <ReporteMensual 
            ref={reporteRef}
            mes={new Date().toLocaleDateString('es-CR', { month: 'long', year: 'numeric' }).toUpperCase()}
            resumen={{
              ventaBruta: ventasMes.bruto,
              gastosFijos: totalGastosFijos,
              utilidadNeta: Math.round(utilidadNetaReal),
              totalPedidos: ventasMes.pedidos
            }}
            topProductos={topVentas}
            clienteVIP={clientesVIP[0] ? { nombre: clientesVIP[0].nombre, puntos: clientesVIP[0].puntos_lealtad } : { nombre: "Sin Clientes", puntos: 0 }}
            style={{ 
              transform: isMobile ? `scale(${scaleFactor})` : 'none',
              transformOrigin: 'top center',
              flexShrink: 0
            }}
          />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
