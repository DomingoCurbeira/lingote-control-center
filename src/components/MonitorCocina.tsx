import { useState, useEffect } from 'react';
import { 
  ChefHat, CheckCircle2, Trash2, Clock, 
  CreditCard, Banknote, ShieldCheck, Loader2, Info
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { notify } from '../utils/notifications';

interface Pedido {
  id: string;
  cliente_telefono: string;
  nombre_cliente: string;
  items: any[];
  total: number;
  metodo_pago: 'sinpe' | 'efectivo';
  comprobante?: string;
  estado: 'pendiente' | 'completado' | 'cancelado';
  created_at: string;
}

const MonitorCocina = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPedidos();

    // SUSCRIPCIÓN EN TIEMPO REAL
    const channel = supabase
      .channel('monitor-cocina')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pedidos' },
        () => {
          fetchPedidos(); // Recargar al haber cualquier cambio
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPedidos = async () => {
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .eq('estado', 'pendiente')
      .order('created_at', { ascending: true });

    if (!error && data) setPedidos(data);
    setLoading(false);
  };

  const completarPedido = async (pedido: Pedido) => {
    const confirm = await notify.confirm(
      "¿Completar y Entregar?", 
      `Se sumarán los puntos al cliente y se registrará la venta de ₡${pedido.total.toLocaleString()}.`
    );
    if (!confirm) return;

    // 1. Calcular puntos ganados (1 por cada lingote)
    const puntosGanados = pedido.items.reduce((sum, item) => {
      return item.producto.id.startsWith('lin-') ? sum + item.cantidad : sum;
    }, 0);

    // 2. Actualizar Puntos del Cliente
    const { data: cliente } = await supabase
      .from('clientes')
      .select('puntos_lealtad, nombre')
      .eq('telefono', pedido.cliente_telefono)
      .single();
    
    const nuevosPuntos = (cliente?.puntos_lealtad || 0) + puntosGanados;

    await supabase
      .from('clientes')
      .update({ puntos_lealtad: nuevosPuntos, ultima_compra: new Date().toISOString() })
      .eq('telefono', pedido.cliente_telefono);

    // 3. Registrar en Bitácora (Opcional, pero recomendado automatizarlo aquí)
    const fechaHoy = new Date().toISOString().split('T')[0];
    const { data: bitacoraExistente } = await supabase
      .from('bitacora_ventas')
      .select('*')
      .eq('fecha', fechaHoy)
      .single();

    if (bitacoraExistente) {
      // Actualizar bitácora del día
      const nuevasVentas = [...bitacoraExistente.ventas];
      pedido.items.forEach(item => {
        const idx = nuevasVentas.findIndex(v => v.id === item.producto.id);
        if (idx !== -1) nuevasVentas[idx].cantidad += item.cantidad;
        else nuevasVentas.push({ id: item.producto.id, nombre: item.producto.nombre, precio: item.producto.precio, cantidad: item.cantidad });
      });
      const nuevoTotal = Number(bitacoraExistente.total_bruto) + pedido.total;
      
      await supabase
        .from('bitacora_ventas')
        .update({ ventas: nuevasVentas, total_bruto: nuevoTotal })
        .eq('fecha', fechaHoy);
    } else {
      // Crear bitácora del día
      const nuevasVentas = pedido.items.map(item => ({
        id: item.producto.id,
        nombre: item.producto.nombre,
        precio: item.producto.precio,
        cantidad: item.cantidad
      }));
      await supabase
        .from('bitacora_ventas')
        .insert([{ fecha: fechaHoy, ventas: nuevasVentas, total_bruto: pedido.total }]);
    }

    // 4. Marcar pedido como completado
    await supabase
      .from('pedidos')
      .update({ estado: 'completado' })
      .eq('id', pedido.id);

    notify.success("¡Pedido Entregado!", `Puntos sumados a ${pedido.nombre_cliente}.`);
    fetchPedidos();
  };

  const cancelarPedido = async (id: string) => {
    const confirm = await notify.confirm("¿Cancelar Pedido?", "Esta acción removerá el pedido del monitor sin sumar puntos.");
    if (!confirm) return;

    await supabase
      .from('pedidos')
      .update({ estado: 'cancelado' })
      .eq('id', id);
    
    notify.success("Pedido Cancelado", "El monitor ha sido limpiado.");
    fetchPedidos();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 text-left">
      
      {/* HEADER */}
      <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl border border-white/5 mx-1">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h2 className="text-3xl font-black tracking-tighter uppercase italic leading-none mb-2">Monitor de Cocina</h2>
            <p className="text-lingote-gold font-bold uppercase tracking-widest text-[10px] italic">Gestión de Comandas en Tiempo Real</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-3">
             <div className="w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
             <span className="text-[10px] font-black uppercase tracking-widest italic">{pedidos.length} Pedidos Pendientes</span>
          </div>
        </div>
        <ChefHat className="absolute -right-4 -bottom-4 text-white/5" size={150} />
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center gap-4 text-slate-300">
           <Loader2 className="animate-spin" size={48} />
           <p className="font-black uppercase text-[10px]">Esperando comandas...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mx-1">
           {pedidos.length === 0 ? (
             <div className="md:col-span-2 lg:col-span-3 bg-white p-20 rounded-[3rem] border border-dashed border-lingote-accent text-center opacity-30">
                <ChefHat size={64} className="mx-auto mb-4" />
                <p className="font-black uppercase tracking-widest text-xs italic">Cocina limpia. No hay pedidos pendientes.</p>
             </div>
           ) : (
             pedidos.map((p) => (
               <div key={p.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col animate-in zoom-in duration-500">
                  {/* CABECERA COMANDA */}
                  <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-start">
                     <div>
                        <p className="text-xl font-black text-slate-400 uppercase tracking-widest mb-1">ID: #{p.id}</p>
                        <h4 className="text-xl font-black text-slate-900 uppercase italic leading-none truncate">{p.nombre_cliente}</h4>
                     </div>
                     <div className="flex flex-col items-end gap-2">
                        <div className={`px-3 py-1 rounded-full flex items-center gap-2 ${p.metodo_pago === 'sinpe' ? 'bg-[#25D366]/10 text-[#25D366]' : 'bg-slate-900 text-white'}`}>
                           {p.metodo_pago === 'sinpe' ? <CreditCard size={10} /> : <Banknote size={10} />}
                           <span className="text-[8px] font-black uppercase tracking-widest">{p.metodo_pago}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[8px] font-bold text-slate-400">
                           <Clock size={10} /> 
                           {new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                     </div>
                  </div>

                  {/* DETALLE PEDIDO */}
                  <div className="flex-1 p-6 space-y-4">
                     {p.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                           <div className="flex items-center gap-3">
                              <span className="w-6 h-6 bg-slate-900 text-white rounded-lg flex items-center justify-center font-black text-[10px] italic">{item.cantidad}x</span>
                              <span className="font-black text-slate-700 uppercase italic text-xs">{item.producto.nombre}</span>
                           </div>
                        </div>
                     ))}
                  </div>

                  {/* INFO SINPE SI APLICA */}
                  {p.metodo_pago === 'sinpe' && p.comprobante && (
                    <div className="px-6 pb-4">
                       <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex items-center gap-3">
                          <ShieldCheck size={20} className="text-amber-600" />
                          <div>
                             <p className="text-[8px] font-black text-amber-800 uppercase tracking-widest leading-none mb-1">Ref. Comprobante</p>
                             <p className="text-lg font-black text-amber-900 tracking-[0.3em] leading-none italic">{p.comprobante}</p>
                          </div>
                       </div>
                    </div>
                  )}

                  {/* PIE Y ACCIONES */}
                  <div className="p-6 bg-white border-t border-slate-50 space-y-4">
                     <div className="flex justify-between items-center px-1">
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">Total a Cobrar</span>
                        <span className="text-2xl font-black text-slate-900 italic tracking-tighter">₡{p.total.toLocaleString()}</span>
                     </div>

                     <div className="grid grid-cols-4 gap-2">
                        <button 
                          onClick={() => completarPedido(p)}
                          className="col-span-3 bg-green-500 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-green-100 flex items-center justify-center gap-2 active:scale-95 transition-all"
                        >
                           <CheckCircle2 size={16} /> Entregar y Sumar Puntos
                        </button>
                        <button 
                          onClick={() => cancelarPedido(p.id)}
                          className="bg-slate-50 text-slate-300 py-4 rounded-2xl border border-slate-100 flex items-center justify-center hover:text-red-500 hover:bg-red-50 transition-all"
                        >
                           <Trash2 size={16} />
                        </button>
                     </div>
                  </div>
               </div>
             ))
           )}
        </div>
      )}

      {/* NOTA OPERATIVA */}
      <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex gap-4 mx-1">
         <div className="bg-white p-3 rounded-xl shadow-sm text-blue-600 shrink-0 h-fit"><Info size={20} /></div>
         <div className="space-y-1">
            <p className="font-black text-[10px] text-blue-800 uppercase italic leading-none text-left">Control de Higiene y Puntos</p>
            <p className="text-[9px] font-bold text-blue-700/60 uppercase leading-relaxed text-left">
              Priorizá el SINPE para evitar manipular dinero. Los puntos de lealtad SOLO se suman cuando tocás el botón "Entregar". Pedidos falsos deben ser enviados al basurero inmediatamente.
            </p>
         </div>
      </div>

    </div>
  );
};

export default MonitorCocina;
