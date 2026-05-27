import { useState, useRef } from 'react';
import { 
  ShoppingBag, X, Trash2, 
  CreditCard, Banknote, ShieldCheck, CheckCircle2,
  ArrowRight, ArrowLeft
} from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import PagoSinpeAyuda from './PagoSinpeAyuda';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  localOpen: boolean;
}

const CartDrawer = ({ isOpen, onClose, localOpen }: CartDrawerProps) => {
  const { carrito, removeItem, updateCantidad, getTotal, vaciarCarrito } = useCartStore();
  const [metodoPago, setMetodoPago] = useState<'sinpe' | 'efectivo' | null>(null);
  const [comprobante, setComprobante] = useState('');
  const [pedidoEnviado, setPedidoEnviado] = useState(false);
  const [pasoComprobante, setPasoComprobante] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const enfocarComprobante = () => {
    setPasoComprobante(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 600);
  };

  const handleFinalizar = () => {
    if (!metodoPago) return;

    // Generar ID de pedido aleatorio (4 caracteres alfanuméricos)
    const pedidoID = Math.random().toString(36).substring(2, 6).toUpperCase();
    const total = getTotal();
    const phone = "34639835391"; // Tu número de WhatsApp real
    
    // Generar mensaje de WhatsApp profesional
    let mensaje = `🥘 *NUEVO PEDIDO: ${pedidoID}*\n`;
    mensaje += `━━━━━━━━━━━━━━━━━━\n\n`;
    
    carrito.forEach(item => {
      mensaje += `✅ *${item.cantidad}x* ${item.producto.nombre}\n`;
      mensaje += `   _₡${(item.precioTotal * item.cantidad).toLocaleString()}_\n\n`;
    });
    
    mensaje += `━━━━━━━━━━━━━━━━━━\n`;
    mensaje += `💰 *TOTAL A PAGAR: ₡${total.toLocaleString()}*\n`;
    mensaje += `💳 *MÉTODO DE PAGO:* ${metodoPago.toUpperCase()}\n`;
    
    if (metodoPago === 'sinpe') {
      mensaje += `📝 *COMPROBANTE:* ${comprobante}\n`;
    }
    
    mensaje += `\n📍 _Enviado desde el Menú Digital_\n`;
    mensaje += `⌚ _${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}_`;

    const encoded = encodeURIComponent(mensaje);
    const whatsappUrl = `https://wa.me/${phone}?text=${encoded}`;

    window.open(whatsappUrl, '_blank');
    setPedidoEnviado(true);
    
    setTimeout(() => {
      vaciarCarrito();
      setPedidoEnviado(false);
      onClose();
    }, 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-[#F8FAFC] shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
        
        {/* HEADER */}
        <div className="p-6 bg-white border-b border-slate-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3 text-slate-800">
            <div className="bg-slate-900 p-2 rounded-xl text-white shadow-lg"><ShoppingBag size={20} /></div>
            <h2 className="text-xl font-black uppercase tracking-tighter italic">Tu Pedido</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400"><X size={24} /></button>
        </div>

        {/* CONTENIDO */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
          <div className="p-6 bg-white border-t border-slate-100 space-y-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
            
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
                   <p className="text-[10px] text-amber-800 font-bold leading-tight uppercase">
                      Copiá los datos, pagá en tu App Bancaria y <span className="underline">guardá los últimos 4 dígitos</span> del comprobante.
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

                <div className="bg-white p-6 rounded-[2.5rem] border-2 border-lingote-gold/30 shadow-xl space-y-4">
                  <div className="flex items-center gap-2 text-slate-800">
                    <ShieldCheck size={20} className="text-green-600" />
                    <p className="text-xs font-black uppercase italic tracking-tighter text-left">Paso Final: Comprobante</p>
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

            <div className="pt-4">
               {(metodoPago !== 'sinpe' || pasoComprobante) && (
                 <div className="flex justify-between items-center mb-6 px-1 animate-in fade-in duration-500">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">Total a pagar</span>
                    <span className="text-3xl font-black text-slate-900 italic tracking-tighter">₡{getTotal().toLocaleString()}</span>
                 </div>
               )}

               <button 
                 disabled={!localOpen || !metodoPago || (metodoPago === 'sinpe' && (!pasoComprobante || comprobante.length < 4))}
                 onClick={handleFinalizar}
                 className={`w-full py-5 rounded-[2rem] font-black text-base uppercase italic tracking-[0.2em] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 ${
                   pedidoEnviado ? 'bg-green-600 text-white' : 
                   (localOpen && metodoPago && (metodoPago !== 'sinpe' || (pasoComprobante && comprobante.length >= 4))) ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                 }`}
               >
                 {pedidoEnviado ? <><CheckCircle2 size={24} /> ¡Pedido Enviado!</> : 
                  !localOpen ? 'Cocina Cerrada' :
                  !metodoPago ? 'Elegir Pago' : 
                  (metodoPago === 'sinpe' && !pasoComprobante) ? 'Primero pagar en banco' : 'Confirmar Pedido ⚡'}
               </button>
            </div>
          </div>
        )}

      </aside>
    </div>
  );
};

export default CartDrawer;
