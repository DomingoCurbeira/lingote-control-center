import { useState, useEffect } from 'react';
import { 
  Wallet, Plus, Trash2, Calendar, 
  ArrowUpCircle, ArrowDownCircle, PieChart, 
  Loader2, Filter
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { notify } from '../utils/notifications';

interface Compra {
  id: string;
  insumo_nombre: string;
  proveedor_nombre: string;
  monto: number;
  fecha: string;
  categoria: string;
}

const CajaBalances = () => {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [ingresosTotales, setIngresosTotales] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mesActual, setMesActual] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  
  const [nuevaCompra, setNuevaCompra] = useState({
    insumo_nombre: '',
    proveedor_nombre: '',
    monto: 0,
    fecha: new Date().toISOString().split('T')[0],
    categoria: 'Insumos'
  });

  // Gastos Fijos (Desde localStorage como el Dashboard)
  const [gastosFijos, setGastosFijos] = useState(0);

  useEffect(() => {
    fetchData();
  }, [mesActual]);

  const fetchData = async () => {
    setLoading(true);
    const primerDia = `${mesActual}-01`;
    const ultimoDia = `${mesActual}-31`;

    // 1. Cargar Compras (Egresos)
    const { data: comprasData } = await supabase
      .from('compras')
      .select('*')
      .gte('fecha', primerDia)
      .lte('fecha', ultimoDia)
      .order('fecha', { ascending: false });

    if (comprasData) setCompras(comprasData);

    // 2. Cargar Ingresos (De Bitácora)
    const { data: ventasData } = await supabase
      .from('bitacora_ventas')
      .select('total_bruto')
      .gte('fecha', primerDia)
      .lte('fecha', ultimoDia);

    const totalIngresos = ventasData?.reduce((sum, v) => sum + Number(v.total_bruto), 0) || 0;
    setIngresosTotales(totalIngresos);

    // 3. Cargar Gastos Fijos del LocalStorage
    const savedGastos = localStorage.getItem('lingote_gastos_globales');
    if (savedGastos) {
      const g = JSON.parse(savedGastos);
      const totalFijos = g.alquiler + g.luz + g.agua + g.gas + g.internet + g.impuestos + g.seguros + g.salarioPropietario;
      setGastosFijos(totalFijos);
    }

    setLoading(false);
  };

  const registrarCompra = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaCompra.insumo_nombre || nuevaCompra.monto <= 0) return;

    const { error } = await supabase.from('compras').insert([nuevaCompra]);

    if (!error) {
      notify.success("Gasto Registrado", `Se restaron ₡${nuevaCompra.monto.toLocaleString()} de la caja.`);
      setNuevaCompra({ ...nuevaCompra, insumo_nombre: '', monto: 0 });
      fetchData();
    } else {
      notify.error("Error", error.message);
    }
  };

  const eliminarCompra = async (id: string) => {
    const confirm = await notify.confirm("¿Eliminar Gasto?", "Esta acción ajustará el balance del mes.");
    if (!confirm) return;

    const { error } = await supabase.from('compras').delete().eq('id', id);
    if (!error) {
      notify.success("Gasto Eliminado", "Balance actualizado.");
      fetchData();
    }
  };

  const totalCompras = compras.reduce((sum, c) => sum + Number(c.monto), 0);
  const balanceNeto = ingresosTotales - totalCompras - gastosFijos;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 text-left">
      
      {/* HEADER FINANCIERO */}
      <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl border border-white/5 mx-1">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h2 className="text-3xl font-black tracking-tighter uppercase italic leading-none mb-2">Caja y Balances</h2>
            <p className="text-lingote-gold font-bold uppercase tracking-widest text-[10px] italic">Estado de Resultados en Tiempo Real</p>
          </div>
          <label className="bg-white/10 backdrop-blur-xl p-3 rounded-2xl border border-white/10 flex items-center gap-4 cursor-pointer hover:bg-white/20 transition-all group">
             <Calendar className="text-lingote-gold group-hover:scale-110 transition-transform" size={20} />
             <input 
               type="month" 
               className="bg-transparent text-white font-black text-sm outline-none cursor-pointer uppercase"
               value={mesActual}
               onChange={(e) => setMesActual(e.target.value)}
               onClick={(e) => (e.target as any).showPicker?.()}
             />
          </label>
        </div>
        <Wallet className="absolute -right-4 -bottom-4 text-white/5" size={150} />
      </div>

      {/* RESUMEN DE BALANCE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mx-1">
         <div className="bg-white p-8 rounded-[2.5rem] border border-lingote-accent shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-green-500 mb-2">
               <ArrowUpCircle size={20} />
               <span className="text-[10px] font-black uppercase tracking-widest">Ingresos Totales</span>
            </div>
            <h3 className="text-3xl font-black italic tracking-tighter text-slate-900">₡{ingresosTotales.toLocaleString()}</h3>
            <p className="text-[9px] text-slate-400 font-bold uppercase">Ventas brutas del mes</p>
         </div>

         <div className="bg-white p-8 rounded-[2.5rem] border border-lingote-accent shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-red-400 mb-2">
               <ArrowDownCircle size={20} />
               <span className="text-[10px] font-black uppercase tracking-widest">Egresos (Compras)</span>
            </div>
            <h3 className="text-3xl font-black italic tracking-tighter text-slate-900">₡{totalCompras.toLocaleString()}</h3>
            <p className="text-[9px] text-slate-400 font-bold uppercase">Insumos y suministros</p>
         </div>

         <div className={`p-8 rounded-[2.5rem] shadow-xl space-y-2 border-2 ${balanceNeto >= 0 ? 'bg-slate-900 border-lingote-gold text-white' : 'bg-red-50 border-red-100 text-red-900'}`}>
            <div className="flex items-center gap-2 mb-2 opacity-60">
               <PieChart size={20} />
               <span className="text-[10px] font-black uppercase tracking-widest">Resultado Neto Real</span>
            </div>
            <h3 className="text-4xl font-black italic tracking-tighter">
               {balanceNeto < 0 ? '-' : '+'} ₡{Math.abs(balanceNeto).toLocaleString()}
            </h3>
            <p className="text-[9px] font-bold uppercase opacity-60">Post-Gastos Fijos (₡{gastosFijos.toLocaleString()})</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mx-1">
         {/* FORMULARIO DE COMPRA */}
         <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-lingote-accent shadow-xl space-y-6 sticky top-24">
               <h4 className="text-xl font-black uppercase tracking-tighter italic text-slate-800">Registrar Gasto</h4>
               <form onSubmit={registrarCompra} className="space-y-4">
                  <div className="space-y-1">
                     <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Insumo / Concepto</label>
                     <input 
                       required
                       type="text" 
                       placeholder="Ej: Saco de papas"
                       className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold text-sm outline-none focus:border-lingote-gold transition-all"
                       value={nuevaCompra.insumo_nombre}
                       onChange={e => setNuevaCompra({...nuevaCompra, insumo_nombre: e.target.value})}
                     />
                  </div>
                  <div className="space-y-1">
                     <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Monto Pagado</label>
                     <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-300">₡</span>
                        <input 
                          required
                          type="number" 
                          className="w-full bg-slate-50 border-2 border-slate-100 p-4 pl-10 rounded-2xl font-black text-sm outline-none focus:border-lingote-gold transition-all"
                          value={nuevaCompra.monto || ''}
                          onChange={e => setNuevaCompra({...nuevaCompra, monto: Number(e.target.value)})}
                        />
                     </div>
                  </div>
                  <div className="space-y-1">
                     <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Proveedor (Opcional)</label>
                     <input 
                       type="text" 
                       placeholder="Ej: Mayca"
                       className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold text-sm outline-none focus:border-lingote-gold transition-all"
                       value={nuevaCompra.proveedor_nombre}
                       onChange={e => setNuevaCompra({...nuevaCompra, proveedor_nombre: e.target.value.toUpperCase()})}
                     />
                  </div>
                  <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase italic tracking-widest flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all mt-4">
                     <Plus size={20} className="text-lingote-gold" /> Anotar Gasto
                  </button>
               </form>
            </div>
         </div>

         {/* LISTA DE EGRESOS */}
         <div className="lg:col-span-8 space-y-4">
            <div className="flex justify-between items-center px-4 mb-2">
               <h4 className="text-lg font-black uppercase tracking-tighter italic text-slate-400">Detalle de Compras del Mes</h4>
               <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase">
                  <Filter size={14} /> Filtrar
               </div>
            </div>

            {loading ? (
               <div className="py-20 flex flex-col items-center gap-4 text-slate-200">
                  <Loader2 className="animate-spin" size={48} />
                  <p className="font-black uppercase text-[10px]">Cuadrando caja...</p>
               </div>
            ) : (
               <div className="space-y-3">
                  {compras.length === 0 ? (
                    <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 text-center opacity-30">
                       <p className="font-black uppercase tracking-widest text-xs italic">No hay gastos registrados este mes</p>
                    </div>
                  ) : (
                    compras.map(c => (
                      <div key={c.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex justify-between items-center group hover:border-red-100 transition-all">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-red-50 text-red-400 rounded-xl flex items-center justify-center shadow-inner">
                               <ArrowDownCircle size={20} />
                            </div>
                            <div className="text-left">
                               <h5 className="font-black text-slate-800 uppercase italic text-sm leading-none">{c.insumo_nombre}</h5>
                               <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">
                                 {new Date(c.fecha).toLocaleDateString('es-CR', { day: '2-digit', month: 'short' })} • {c.proveedor_nombre || 'Varios'}
                               </p>
                            </div>
                         </div>
                         <div className="flex items-center gap-6">
                            <span className="text-xl font-black text-slate-900 italic tracking-tighter">₡{Number(c.monto).toLocaleString()}</span>
                            <button 
                              onClick={() => eliminarCompra(c.id)}
                              className="p-2 text-slate-100 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            >
                               <Trash2 size={18} />
                            </button>
                         </div>
                      </div>
                    ))
                  )}
               </div>
            )}
         </div>
      </div>

    </div>
  );
};

export default CajaBalances;
