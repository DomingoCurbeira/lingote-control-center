import { useState, useEffect } from 'react';
import { 
  Calendar, Save, ChevronDown, ChevronUp, 
  UtensilsCrossed, Zap, Coffee, IceCream, Droplet, 
  CheckCircle2, AlertCircle, Download, Upload
} from 'lucide-react';
import { 
  MENU_LINGOTES, MENU_PROMOCIONES, MENU_POSTRES, 
  MENU_BEBIDAS, MENU_SALSAS 
} from '../data/menuPublico';

interface VentaItem {
  id: string | number;
  nombre: string;
  cantidad: number;
  precio: number;
}

interface RegistroDia {
  fecha: string; // YYYY-MM-DD
  ventas: VentaItem[];
  totalBruto: number;
}

const BitacoraVentas = () => {
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [ventasActuales, setVentasActuales] = useState<VentaItem[]>([]);
  const [historico, setHistorico] = useState<RegistroDia[]>([]);
  const [expandCategory, setExpandCategory] = useState<string | null>('lingotes');
  const [mensajeGuardado, setMensajeGuardado] = useState(false);

  // --- CARGA DE DATOS ---
  useEffect(() => {
    const savedVentas = localStorage.getItem('lingote_bitacora_ventas');
    if (savedVentas) {
      setHistorico(JSON.parse(savedVentas));
    }
  }, []);

  // Sincronizar el formulario con la fecha seleccionada
  useEffect(() => {
    const registroExistente = historico.find(r => r.fecha === fecha);
    if (registroExistente) {
      setVentasActuales(registroExistente.ventas);
    } else {
      // Inicializar con todos los productos del menú en 0
      const inicial: VentaItem[] = [
        ...MENU_LINGOTES.map(p => ({ id: p.id, nombre: p.nombre, precio: p.precio, cantidad: 0 })),
        ...MENU_PROMOCIONES.map(p => ({ id: p.id, nombre: p.nombre, precio: p.precio, cantidad: 0 })),
        ...MENU_POSTRES.map(p => ({ id: p.id, nombre: p.nombre, precio: p.precio, cantidad: 0 })),
        ...MENU_BEBIDAS.map(p => ({ id: p.id, nombre: p.nombre, precio: p.precio, cantidad: 0 })),
        ...MENU_SALSAS.map(p => ({ id: p.id, nombre: p.nombre, precio: p.precio, cantidad: 0 })),
      ];
      setVentasActuales(inicial);
    }
  }, [fecha, historico]);

  // --- ACCIONES ---
  const updateCantidad = (id: string | number, delta: number) => {
    setVentasActuales(prev => prev.map(v => 
      v.id === id ? { ...v, cantidad: Math.max(0, v.cantidad + delta) } : v
    ));
  };

  const setCantidadDirecta = (id: string | number, valor: string) => {
    const num = parseInt(valor) || 0;
    setVentasActuales(prev => prev.map(v => 
      v.id === id ? { ...v, cantidad: Math.max(0, num) } : v
    ));
  };

  const guardarRegistro = () => {
    const total = ventasActuales.reduce((sum, v) => sum + (v.cantidad * v.precio), 0);
    const nuevoRegistro: RegistroDia = {
      fecha,
      ventas: ventasActuales,
      totalBruto: total
    };

    const nuevoHistorico = historico.filter(r => r.fecha !== fecha);
    nuevoHistorico.push(nuevoRegistro);
    
    setHistorico(nuevoHistorico);
    localStorage.setItem('lingote_bitacora_ventas', JSON.stringify(nuevoHistorico));
    
    setMensajeGuardado(true);
    setTimeout(() => setMensajeGuardado(false), 2000);
  };

  const exportarHistorico = () => {
    const blob = new Blob([JSON.stringify(historico, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bitacora_ventas_backup.json`;
    a.click();
  };

  const importarHistorico = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target?.result as string);
        setHistorico(data);
        localStorage.setItem('lingote_bitacora_ventas', JSON.stringify(data));
        alert('✅ Histórico de ventas cargado');
      } catch (err) { alert('❌ Error al importar histórico'); }
    };
    reader.readAsText(file);
  };

  const totalDelDia = ventasActuales.reduce((sum, v) => sum + (v.cantidad * v.precio), 0);

  const renderCategory = (title: string, icon: any, id: string, items: any[]) => {
    const isExpanded = expandCategory === id;
    const itemsVentas = ventasActuales.filter(v => items.some(item => item.id === v.id));
    const itemsVendidos = itemsVentas.filter(v => v.cantidad > 0).length;

    return (
      <div className="bg-white rounded-[2rem] border border-lingote-accent shadow-sm overflow-hidden transition-all duration-300">
        <button 
          onClick={() => setExpandCategory(isExpanded ? null : id)}
          className="w-full p-6 flex justify-between items-center hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-4">
             <div className={`p-3 rounded-2xl ${isExpanded ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400'}`}>
                {icon}
             </div>
             <div className="text-left">
                <h4 className="text-lg font-black uppercase tracking-tighter italic leading-none">{title}</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                   {itemsVendidos} {itemsVendidos === 1 ? 'Producto registrado' : 'Productos registrados'}
                </p>
             </div>
          </div>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        {isExpanded && (
          <div className="px-6 pb-8 space-y-4 animate-in slide-in-from-top-2 duration-300">
            {itemsVentas.map((v) => (
              <div key={v.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                <div className="flex-1 text-left min-w-0 pr-4">
                   <p className="font-black text-slate-800 uppercase text-xs italic leading-none truncate">{v.nombre}</p>
                   <p className="text-[10px] text-slate-400 font-bold mt-1">₡{v.precio.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3 bg-white p-1 rounded-xl shadow-sm border border-slate-100">
                   <button onClick={() => updateCantidad(v.id, -1)} className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-slate-300 hover:bg-slate-100 hover:text-red-500 transition-colors">－</button>
                   <input 
                      type="number" 
                      className="w-10 text-center font-black text-sm text-slate-700 bg-transparent outline-none"
                      value={v.cantidad || ''}
                      onChange={(e) => setCantidadDirecta(v.id, e.target.value)}
                      placeholder="0"
                   />
                   <button onClick={() => updateCantidad(v.id, 1)} className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-slate-300 hover:bg-slate-100 hover:text-green-500 transition-colors">＋</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-32 text-left max-w-full overflow-x-hidden box-border">
      
      {/* HEADER BITÁCORA */}
      <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl border border-white/5 mx-1">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
           <div className="text-center md:text-left">
              <h2 className="text-3xl font-black tracking-tighter uppercase italic leading-none mb-2">Bitácora de Ventas</h2>
              <p className="text-lingote-gold font-bold uppercase tracking-widest text-[10px] italic">Control de Cierre Diario</p>
           </div>
           <div className="bg-white/10 backdrop-blur-xl p-4 rounded-3xl border border-white/10 flex items-center gap-4">
              <Calendar className="text-lingote-gold" size={24} />
              <input 
                type="date" 
                className="bg-transparent text-white font-black text-base outline-none cursor-pointer"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mx-1">
        
        {/* FORMULARIO DE REGISTRO */}
        <div className="lg:col-span-8 space-y-4">
           {renderCategory('Lingotes Base', <UtensilsCrossed size={20} />, 'lingotes', MENU_LINGOTES)}
           {renderCategory('Promociones', <Zap size={20} />, 'promos', MENU_PROMOCIONES)}
           {renderCategory('Postres', <IceCream size={20} />, 'postres', MENU_POSTRES)}
           {renderCategory('Bebidas', <Coffee size={20} />, 'bebidas', MENU_BEBIDAS)}
           {renderCategory('Extras y Salsas', <Droplet size={20} />, 'salsas', MENU_SALSAS)}
        </div>

        {/* RESUMEN DEL DÍA */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-white p-8 rounded-[2.5rem] border border-lingote-accent shadow-xl sticky top-24 space-y-8">
              <div className="text-center space-y-2">
                 <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] italic">Venta Total del Día</p>
                 <h3 className="text-5xl font-black text-slate-900 tracking-tighter leading-none italic">
                   ₡{totalDelDia.toLocaleString()}
                 </h3>
              </div>

              <div className="space-y-3">
                 <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-slate-600">
                    <CheckCircle2 size={18} className="text-green-500" />
                    <span className="text-[10px] font-black uppercase italic">Venta Bruta Calculada</span>
                 </div>
                 <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-slate-600">
                    <AlertCircle size={18} className="text-amber-500" />
                    <span className="text-[10px] font-black uppercase italic">Sincronizado con Dashboard</span>
                 </div>
              </div>

              <button 
                onClick={guardarRegistro}
                className={`w-full py-6 rounded-[2rem] font-black text-xs uppercase italic tracking-widest shadow-2xl flex items-center justify-center gap-3 transition-all active:scale-95 ${mensajeGuardado ? 'bg-green-600 text-white animate-in zoom-in duration-300' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
              >
                {mensajeGuardado ? (
                  <> <CheckCircle2 size={20} /> ¡Dato Guardado! </>
                ) : (
                  <> <Save size={20} /> Guardar Cierre </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-3 pt-2">
                 <button 
                   onClick={exportarHistorico}
                   className="flex items-center justify-center gap-2 py-3 rounded-2xl border border-lingote-accent text-[9px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all italic"
                 >
                   <Download size={14} /> Backup
                 </button>
                 <label className="flex items-center justify-center gap-2 py-3 rounded-2xl border border-lingote-accent text-[9px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all cursor-pointer italic text-center">
                   <Upload size={14} /> Cargar
                   <input type="file" className="hidden" accept=".json" onChange={importarHistorico} />
                 </label>
              </div>

              <div className="pt-6 border-t border-slate-100">
                 <p className="text-[8px] font-bold text-slate-300 uppercase text-center leading-relaxed">
                   Los registros se guardan en la memoria local de este dispositivo.
                 </p>
              </div>
           </div>
        </div>
      </div>

    </div>
  );
};

export default BitacoraVentas;
