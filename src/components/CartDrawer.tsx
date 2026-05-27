import { useState, useRef, useEffect } from 'react';
import { 
  ShoppingBag, X, Trash2, 
  CreditCard, Banknote, ShieldCheck, CheckCircle2,
  ArrowRight, ArrowLeft, MessageCircle
} from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useUserStore } from '../store/useUserStore';
import { supabase } from '../lib/supabase';
import PagoSinpeAyuda from './PagoSinpeAyuda';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  localOpen: boolean;
  onRequireUser: () => void;
}

const CartDrawer = ({ isOpen, onClose, localOpen, onRequireUser }: CartDrawerProps) => {
  const { carrito, removeItem, updateCantidad, getTotal, vaciarCarrito } = useCartStore();
  const { usuario } = useUserStore();
  const [metodoPago, setMetodoPago] = useState<'sinpe' | 'efectivo' | null>(null);
  const [comprobante, setComprobante] = useState('');
  const [pedidoEnviado, setPedidoEnviado] = useState(false);
  const [pasoComprobante, setPasoComprobante] = useState(false);
  const [currentPedidoID, setCurrentPedidoID] = useState('');
  const [yaEsMiembro, setYaEsMiembro] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Verificar estado de grupo VIP al abrir éxito
  useEffect(() => {
    if (pedidoEnviado && usuario) {
      const checkMiembro = async () => {
        const { data } = await supabase
          .from('clientes')
          .select('unido_al_grupo')
          .eq('telefono', usuario.telefono)
          .single();
        if (data?.unido_al_grupo) setYaEsMiembro(true);
      };
      checkMiembro();
    }
  }, [pedidoEnviado, usuario]);

  const unirseAlGrupo = async () => {
    if (!usuario) return;
    const { error } = await supabase
      .from('clientes')
      .update({ unido_al_grupo: true })
      .eq('telefono', usuario.telefono);
    
    if (!error) setYaEsMiembro(true);
    window.open('https://chat.whatsapp.com/G5vXyzabc123', '_blank'); // Reemplazar con link real
  };

  const enfocarComprobante = () => {
    setPasoComprobante(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 600);
  };

  const handleFinalizar = async () => {
    if (!usuario) {
      onRequireUser();
      return;
    }
    if (!metodoPago) return;

    const pedidoID = Math.random().toString(36).substring(2, 6).toUpperCase();
    setCurrentPedidoID(pedidoID);
    const total = getTotal();
    const phone = "34639835391";
    const hoy = new Date().toLocaleDateString('es-CR');
    const hora = new Date().toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' });
    
    // Calcular puntos de lealtad (1 por cada lingote)
    const puntosGanados = carrito.reduce((sum, item) => {
      return item.producto.id.startsWith('lin-') ? sum + item.cantidad : sum;
    }, 0);

    // Actualización Silenciosa en Supabase
    const syncCliente = async () => {
       // 1. Obtener puntos actuales
       const { data } = await supabase
         .from('clientes')
         .select('puntos_lealtad')
         .eq('telefono', usuario.telefono)
         .single();
       
       const puntosTotales = (data?.puntos_lealtad || 0) + puntosGanados;

       // 2. Actualizar
       await supabase
         .from('clientes')
         .upsert({ 
           telefono: usuario.telefono, 
           nombre: usuario.nombre,
           puntos_lealtad: puntosTotales,
           ultima_compra: new Date().toISOString()
         });
    };

    syncCliente();

    // Construcción del mensaje con emojis estándar
    const line = "----------------------------------";
    const emojiPaella = "\u{1F958}"; 
    const emojiCheck = "\u{2705}";
    const emojiMoney = "\u{1F4B0}";
    const emojiCard = "\u{1F4B3}";
    const emojiDate = "\u{1F4C5}";
    const emojiTime = "\u{231A}";
    const emojiUser = "\u{1F464}";
    const emojiPhone = "\u{1F4F1}";

    let mensaje = `${emojiPaella} *NUEVO PEDIDO: #${pedidoID}*\n`;
    mensaje += `${line}\n`;
    mensaje += `*EL LINGOTE ESPAÑOL*\n`;
    mensaje += `_Raices Españolas, Corazon Tico_\n`;
    mensaje += `${line}\n\n`;

    mensaje += `${emojiUser} *CLIENTE:* ${usuario.nombre.toUpperCase()}\n`;
    mensaje += `${emojiPhone} *TELÉFONO:* ${usuario.telefono}\n`;
    mensaje += `${emojiCard} *PAGO:* ${metodoPago === 'sinpe' ? `📲 SINPE (Ref: ${comprobante})` : '💵 EFECTIVO (En Local)'}\n`;
    mensaje += `${emojiTime} *HORA:* ${hora}\n\n`;

    mensaje += `🛒 *DETALLE DEL PEDIDO:*\n`;
    mensaje += `──────────────────\n`;
    
    carrito.forEach(item => {
      mensaje += `${emojiCheck} *${item.cantidad}x* ${item.producto.nombre.toUpperCase()}\n`;
      mensaje += `   → ₡${(item.precioTotal * item.cantidad).toLocaleString()}\n\n`;
    });
    
    mensaje += `──────────────────\n`;
    mensaje += `${emojiMoney} *TOTAL A PAGAR: ₡${total.toLocaleString()}*\n`;
    mensaje += `──────────────────\n\n`;
    
    mensaje += `${emojiDate} *FECHA:* ${hoy}\n`;
    mensaje += `\n📍 _Enviado desde el Menu Digital_`;

    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(mensaje)}`;

    window.open(whatsappUrl, '_blank');
    setPedidoEnviado(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-[#F8FAFC] shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 overflow-hidden">
        
        {/* PANTALLA DE ÉXITO (POST-WHATSAPP) */}
        {pedidoEnviado ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8 animate-in zoom-in duration-500">
             <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center shadow-inner">
                <CheckCircle2 size={48} strokeWidth={3} />
             </div>
             <div className="space-y-4">
                <h2 className="text-3xl font-black text-slate-900 uppercase italic leading-none">¡Pedido Recibido!</h2>
                
                {metodoPago === 'sinpe' ? (
                  <div className="space-y-4">
                    <p className="text-sm font-bold text-slate-500 uppercase leading-relaxed text-center">
                      Gracias por tu pago. Tu pedido ya está en fila de cocina y estará listo en aproximadamente <span className="text-slate-900 underline">15-20 minutos</span>.
                    </p>
                    <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl space-y-4">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40 mb-1">ID de Pedido (Cocina)</p>
                        <p className="text-3xl font-black tracking-widest text-lingote-gold italic">{currentPedidoID}</p>
                      </div>
                      <div className="pt-3 border-t border-white/10">
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40 mb-1">Tu Comprobante SINPE</p>
                        <p className="text-xl font-bold tracking-[0.5em]">{comprobante}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm font-bold text-slate-500 uppercase leading-relaxed text-center">
                      ¡Ingredientes reservados! Te esperamos en caja para el pago. Tu pedido tendrá <span className="text-slate-900 underline">prioridad inmediata</span> en cocina una vez abonado.
                    </p>
                    <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl">
                       <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40 mb-1">ID de Pedido (Reserva)</p>
                       <p className="text-3xl font-black tracking-widest text-lingote-gold italic">{currentPedidoID}</p>
                    </div>
                  </div>
                )}

                {/* BANNER GRUPO VIP (SÓLO SI NO SE HA UNIDO) */}
                {!yaEsMiembro && (
                  <div className="bg-green-50 border-2 border-dashed border-green-200 p-6 rounded-[2.5rem] space-y-4 animate-in fade-in zoom-in duration-700 delay-500">
                    <div className="flex items-center justify-center gap-3">
                      <div className="bg-[#25D366] p-2 rounded-xl text-white shadow-lg"><MessageCircle size={18} /></div>
                      <p className="text-xs font-black text-green-900 uppercase italic">¿Querés ser VIP?</p>
                    </div>
                    <p className="text-[10px] text-green-800 font-bold leading-tight uppercase">
                      Unite a nuestro grupo de WhatsApp para recibir <span className="underline">promos exclusivas</span> y noticias de cocina antes que nadie.
                    </p>
                    <button 
                      onClick={unirseAlGrupo}
                      className="w-full py-3 bg-[#25D366] text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:shadow-lg transition-all active:scale-95"
                    >
                      Unirse a la Comunidad 🥘
                    </button>
                  </div>
                )}

                {!yaEsMiembro && metodoPago === 'efectivo' && (
                  <div className="bg-amber-100 border border-amber-200 text-amber-800 p-4 rounded-2xl">
                    <p className="text-[10px] font-black uppercase italic leading-tight">Mantené esta pantalla abierta o mostrá tu WhatsApp en el local.</p>
                  </div>
                )}
             </div>

             <button 
               onClick={() => {
                 vaciarCarrito();
                 setPedidoEnviado(false);
                 setMetodoPago(null);
                 setComprobante('');
                 setPasoComprobante(false);
                 onClose();
               }}
               className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all"
             >
               Volver al Menú
             </button>
          </div>
        ) : (
          <>
            {/* HEADER */}
            <div className="p-6 bg-white border-b border-slate-100 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3 text-slate-800">
                <div className="bg-slate-900 p-2 rounded-xl text-white shadow-lg"><ShoppingBag size={20} /></div>
                <h2 className="text-xl font-black uppercase tracking-tighter italic">Tu Pedido</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400"><X size={24} /></button>
            </div>

            {/* CONTENIDO SCROLLABLE */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
              {carrito.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 text-center space-y-4">
                  <ShoppingBag size={64} strokeWidth={1} className="opacity-20" />
                  <p className="font-black uppercase tracking-widest text-xs">El carrito está vacío</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {carrito.map((item) => (
                    <div key={item.idUnico} className="bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm flex gap-4 items-center animate-in slide-in-from-right-2 duration-300">
                      <div className="flex-1 text-left">
                        <p className="font-black text-slate-800 uppercase text-xs italic leading-tight">{item.producto.nombre}</p>
                        <p className="text-[10px] font-bold text-lingote-gold mt-1">₡{(item.precioTotal * item.cantidad).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-3 bg-slate-50 p-1 rounded-xl border border-slate-100">
                        <button onClick={() => updateCantidad(item.idUnico, -1)} className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-slate-300 hover:text-red-500 transition-colors">－</button>
                        <span className="font-black text-xs w-4 text-center text-slate-700">{item.cantidad}</span>
                        <button onClick={() => updateCantidad(item.idUnico, 1)} className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-slate-300 hover:text-green-500 transition-colors">＋</button>
                      </div>
                      <button onClick={() => removeItem(item.idUnico)} className="text-slate-200 hover:text-red-400 transition-colors p-2"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* FOOTER & PAGOS */}
            {carrito.length > 0 && (
              <div className="p-6 bg-white border-t border-slate-100 space-y-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] shrink-0">
                
                <div className="space-y-3">
                   <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-left italic">¿Cómo deseas pagar?</p>
                   <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => setMetodoPago('sinpe')}
                        className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${metodoPago === 'sinpe' ? 'border-slate-900 bg-slate-900 text-white shadow-xl' : 'border-slate-100 bg-slate-50 text-slate-400'}`}
                      >
                        <CreditCard size={20} />
                        <span className="text-[10px] font-black uppercase tracking-tighter">SINPE Móvil</span>
                      </button>
                      <button 
                        onClick={() => setMetodoPago('efectivo')}
                        className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${metodoPago === 'efectivo' ? 'border-slate-900 bg-slate-900 text-white shadow-xl' : 'border-slate-100 bg-slate-50 text-slate-400'}`}
                      >
                        <Banknote size={20} />
                        <span className="text-[10px] font-black uppercase tracking-tighter">Efectivo</span>
                      </button>
                   </div>
                </div>

                {metodoPago === 'sinpe' && !pasoComprobante && (
                  <div className="space-y-4 animate-in zoom-in duration-300">
                    <PagoSinpeAyuda 
                      montoTotal={getTotal()} 
                      onBancoClick={enfocarComprobante} 
                    />
                    <div className="bg-amber-50 border-2 border-dashed border-amber-200 p-5 rounded-[2rem] text-center space-y-2">
                       <p className="text-[11px] font-black text-amber-900 uppercase italic">¿Cómo completar tu pago?</p>
                       <p className="text-[10px] text-amber-800 font-bold leading-tight uppercase text-left">
                          Copiá los datos, pagá en tu App y <span className="underline">guardá los 4 dígitos</span> finales.
                       </p>
                    </div>
                    <button 
                      onClick={() => setPasoComprobante(true)}
                      className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                    >
                      Ya realicé el pago <ArrowRight size={16} />
                    </button>
                  </div>
                )}

                {metodoPago === 'sinpe' && pasoComprobante && (
                  <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                    <button 
                      onClick={() => setPasoComprobante(false)}
                      className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase hover:text-slate-600 transition-colors pl-2"
                    >
                      <ArrowLeft size={12} /> Volver al asistente
                    </button>

                    <div className="bg-white p-6 rounded-[2.5rem] border-2 border-lingote-gold/30 shadow-xl space-y-4 text-left">
                      <div className="flex items-center gap-2 text-slate-800">
                        <ShieldCheck size={20} className="text-green-600" />
                        <p className="text-xs font-black uppercase italic tracking-tighter">Paso Final: Comprobante</p>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest">Digitá los 4 números finales:</p>
                        <input 
                          ref={inputRef}
                          type="text" 
                          maxLength={4} 
                          inputMode="numeric"
                          placeholder="0000"
                          className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl text-center font-black tracking-[0.5em] text-2xl text-slate-900 outline-none focus:border-lingote-gold transition-all"
                          value={comprobante}
                          onChange={(e) => setComprobante(e.target.value.replace(/\D/g, ''))}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100">
                   {(metodoPago !== 'sinpe' || pasoComprobante) && (
                     <div className="flex justify-between items-center mb-6 px-1 animate-in fade-in duration-500">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">Total a pagar</span>
                        <span className="text-3xl font-black text-slate-900 italic tracking-tighter tabular-nums">₡{getTotal().toLocaleString()}</span>
                     </div>
                   )}

                   <button 
                     disabled={!localOpen || !!(usuario && metodoPago === 'sinpe' && (!pasoComprobante || comprobante.length < 4))}
                     onClick={handleFinalizar}
                     className={`w-full py-5 rounded-[2rem] font-black text-base uppercase italic tracking-[0.2em] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 ${
                       pedidoEnviado ? 'bg-green-600 text-white' : 
                       (localOpen) ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                     }`}
                   >
                     {pedidoEnviado ? <><CheckCircle2 size={24} /> ¡Enviado!</> : 
                      !localOpen ? 'Cocina Cerrada' :
                      !usuario ? 'Completar mis Datos 👤' :
                      !metodoPago ? 'Elegir Pago' : 
                      (metodoPago === 'sinpe' && !pasoComprobante) ? 'Siguiente: Comprobante' : 'Confirmar Pedido ⚡'}
                   </button>

                </div>
              </div>
            )}
          </>
        )}

      </aside>
    </div>
  );
};

export default CartDrawer;
