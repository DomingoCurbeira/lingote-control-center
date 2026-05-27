import React from 'react';
import { 
  TrendingUp, Wallet, Star, 
  BarChart3, Award, CheckCircle2 
} from 'lucide-react';

interface Props {
  mes: string;
  resumen: {
    ventaBruta: number;
    gastosFijos: number;
    utilidadNeta: number;
    totalPedidos: number;
  };
  topProductos: { nombre: string; cantidad: number }[];
  clienteVIP: { nombre: string; puntos: number };
  style?: React.CSSProperties;
}

const ReporteMensual = React.forwardRef<HTMLDivElement, Props>(({ mes, resumen, topProductos, clienteVIP, style }, ref) => {
  return (
    <div 
      ref={ref}
      style={style}
      className="w-[794px] h-[1123px] bg-white p-12 shadow-2xl flex flex-col relative text-left"
    >
      {/* HEADER REPORTE */}
      <div className="flex justify-between items-start mb-12 pb-10 border-b-4 border-slate-900">
        <div className="space-y-4">
          <img src="/logo_lingote_oficial_ligero.png" className="w-24 h-24 object-contain" alt="Logo" />
          <div>
            <h2 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">Informe Ejecutivo</h2>
            <p className="text-xs font-black text-lingote-gold uppercase tracking-[0.3em] mt-1">Balance de Operaciones • {mes}</p>
          </div>
        </div>
        <div className="text-right space-y-1">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">El Lingote Español</p>
          <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest leading-none">Cartago, Costa Rica</p>
          <div className="mt-4 bg-slate-900 text-white p-4 rounded-2xl inline-block">
             <p className="text-[8px] font-black uppercase tracking-widest opacity-50 mb-1">Estado del Mes</p>
             <p className="text-xl font-black italic tracking-tighter leading-none text-green-400 uppercase">Saludable ✅</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-12 flex-1">
         {/* COLUMNA IZQUIERDA: FINANZAS */}
         <div className="space-y-10">
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-2">
                 <Wallet size={16} className="text-lingote-gold" />
                 <h4 className="text-sm font-black uppercase italic tracking-widest text-slate-800">Resumen Financiero</h4>
              </div>
              <div className="space-y-4">
                 <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[9px] font-black uppercase text-slate-400">Venta Bruta Total</span>
                    <span className="text-xl font-black italic text-slate-900">₡{resumen.ventaBruta.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[9px] font-black uppercase text-slate-400">Gastos Operativos (Fijos)</span>
                    <span className="text-xl font-black italic text-red-500">₡{resumen.gastosFijos.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between items-center p-6 bg-slate-900 rounded-3xl shadow-xl">
                    <span className="text-[10px] font-black uppercase text-lingote-gold tracking-widest">Utilidad Neta Real</span>
                    <span className="text-3xl font-black italic text-white tracking-tighter">₡{resumen.utilidadNeta.toLocaleString()}</span>
                 </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-2">
                 <BarChart3 size={16} className="text-lingote-gold" />
                 <h4 className="text-sm font-black uppercase italic tracking-widest text-slate-800">Métricas de Actividad</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm text-center">
                    <p className="text-[8px] font-black text-slate-300 uppercase mb-2">Total Pedidos</p>
                    <p className="text-3xl font-black italic text-slate-900">{resumen.totalPedidos}</p>
                 </div>
                 <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm text-center">
                    <p className="text-[8px] font-black text-slate-300 uppercase mb-2">Ticket Promedio</p>
                    <p className="text-xl font-black italic text-slate-900">₡{resumen.totalPedidos > 0 ? Math.round(resumen.ventaBruta / resumen.totalPedidos).toLocaleString() : 0}</p>
                 </div>
              </div>
            </div>
         </div>

         {/* COLUMNA DERECHA: PRODUCTOS Y CLIENTES */}
         <div className="space-y-10">
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-2">
                 <TrendingUp size={16} className="text-lingote-gold" />
                 <h4 className="text-sm font-black uppercase italic tracking-widest text-slate-800">Top 5 Popularidad</h4>
              </div>
              <div className="space-y-3">
                 {topProductos.map((prod, i) => (
                   <div key={prod.nombre} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-slate-300">#{i+1}</span>
                        <span className="text-[10px] font-black uppercase text-slate-700 italic">{prod.nombre}</span>
                      </div>
                      <span className="text-xs font-black text-slate-900">{prod.cantidad} unid.</span>
                   </div>
                 ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-2">
                 <Award size={16} className="text-lingote-gold" />
                 <h4 className="text-sm font-black uppercase italic tracking-widest text-slate-800">Inteligencia VIP</h4>
              </div>
              <div className="bg-slate-900 p-8 rounded-[2.5rem] relative overflow-hidden text-center group shadow-2xl">
                 <div className="relative z-10 space-y-4">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto border border-white/10">
                       <Star className="text-lingote-gold" size={32} fill="currentColor" />
                    </div>
                    <div>
                       <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 mb-1">Cliente del Mes</p>
                       <p className="text-2xl font-black italic text-white uppercase tracking-tighter leading-none">{clienteVIP.nombre}</p>
                       <p className="text-[10px] font-black text-lingote-gold uppercase mt-2">{clienteVIP.puntos} Puntos Acumulados</p>
                    </div>
                 </div>
                 <CheckCircle2 className="absolute -right-4 -bottom-4 text-white/5 group-hover:text-white/10 transition-colors" size={100} />
              </div>
            </div>
         </div>
      </div>

      {/* PIE DE PÁGINA */}
      <div className="mt-auto pt-10 border-t border-slate-100 flex justify-between items-end">
         <div className="flex gap-12">
            <div>
               <p className="text-[7px] font-black text-slate-300 uppercase mb-1 italic">Fecha de Generación</p>
               <p className="text-[10px] font-black text-slate-800">{new Date().toLocaleDateString('es-CR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            </div>
            <div>
               <p className="text-[7px] font-black text-slate-300 uppercase mb-1 italic">Certificación</p>
               <div className="flex items-center gap-1">
                  <CheckCircle2 size={10} className="text-green-500" />
                  <p className="text-[9px] font-black text-slate-800 tracking-widest uppercase">DATOS NUBE SUPABASE</p>
               </div>
            </div>
         </div>
         <div className="text-right">
            <p className="text-sm font-black italic text-slate-900 tracking-tighter leading-none uppercase">EL LINGOTE ESPAÑOL</p>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic leading-none">Cartago, Costa Rica</p>
         </div>
      </div>
      
      {/* Marca de agua */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45 pointer-events-none opacity-[0.03]">
         <img src="/logo_lingote_oficial_ligero.png" className="w-[500px] h-[500px] object-contain" alt="Watermark" />
      </div>
    </div>
  );
});

ReporteMensual.displayName = 'ReporteMensual';

export default ReporteMensual;
