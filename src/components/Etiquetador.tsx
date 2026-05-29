import { useState, useEffect } from 'react';
import { INFO_FABRICANTE } from '../data/masterDatabase';
import { Printer, Loader2, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';

// Tipo adaptado a la tabla de recetas en Supabase
interface RecetaEtiqueta {
  id: string;
  nombre: string;
  ingredientes: { nombre: string }[];
  nutricion: any;
  alergenos: string;
  vidaUtilDias: number; // Intentaremos sacar el número de vida_util
  pesoNeto: string;
}

const Etiquetador = () => {
  const [productos, setProductos] = useState<RecetaEtiqueta[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [lote, setLote] = useState('');
  const [envasado, setEnvasado] = useState(new Date().toISOString().split('T')[0]);
  const [vencimiento, setVencimiento] = useState('');
  const [loading, setLoading] = useState(true);

  // 1. Cargar desde Supabase los productos marcados como Finales
  useEffect(() => {
    const fetchProductos = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('recetas')
        .select('*')
        .eq('es_producto_final', true)
        .order('nombre', { ascending: true });

      if (!error && data) {
        const mapped = data.map(r => {
          // Extraer número de vida util ("10 Días" -> 10)
          const diasMatch = r.vida_util ? String(r.vida_util).match(/\d+/) : null;
          const dias = diasMatch ? parseInt(diasMatch[0]) : 1; // 1 día por defecto
          
          return {
            id: r.id,
            nombre: r.nombre,
            ingredientes: r.ingredientes || [],
            nutricion: r.nutricion || {
              calorias: 0, grasaTotal: 0, grasaSaturada: 0, grasasTrans: 0,
              colesterol: 0, carbohidratos: 0, azucares: 0, fibraDietetica: 0,
              proteina: 0, sodio: 0
            },
            alergenos: r.alergenos || 'Sin declarar',
            vidaUtilDias: dias,
            pesoNeto: r.peso_neto || 'Garantizado'
          };
        });
        
        setProductos(mapped);
        if (mapped.length > 0) {
          setSelectedId(mapped[0].id);
        }
      }
      setLoading(false);
    };

    fetchProductos();
  }, []);

  const producto = productos.find(x => x.id === selectedId) || null;

  // 2. Calcular Fechas y Lotes cuando cambia el producto o el envasado
  useEffect(() => {
    if (producto) {
      const dateVence = new Date(envasado);
      dateVence.setMinutes(dateVence.getMinutes() + dateVence.getTimezoneOffset());
      dateVence.setDate(dateVence.getDate() + producto.vidaUtilDias);
      setVencimiento(dateVence.toISOString().split('T')[0]);

      const envDate = new Date(envasado);
      envDate.setMinutes(envDate.getMinutes() + envDate.getTimezoneOffset());
      const loteSugerido = `L-${envDate.getFullYear().toString().slice(-2)}${(envDate.getMonth() + 1).toString().padStart(2, '0')}${envDate.getDate().toString().padStart(2, '0')}`;
      setLote(loteSugerido);
    }
  }, [selectedId, envasado, producto]);

  const hasCalorieStamp = producto ? producto.nutricion.calorias > 275 : false;
  const hasSatFatStamp = producto ? (producto.nutricion.grasaSaturada * 9 / producto.nutricion.calorias) > 0.1 : false;
  const hasSodiumStamp = producto ? producto.nutricion.sodio > 300 : false;
  
  const renderIngredientes = () => {
     if (!producto || !producto.ingredientes || producto.ingredientes.length === 0) return 'Ingredientes no especificados.';
     return producto.ingredientes.map(i => i.nombre).join(', ') + '.';
  };

  return (
    <div className="flex flex-col lg:flex-row gap-10 xl:gap-16 animate-in fade-in duration-500 pb-20">
      <aside className="no-print w-full lg:w-96 xl:w-[450px] space-y-6">
        <div className="bg-white p-8 xl:p-10 rounded-[2.5rem] border border-lingote-accent shadow-sm text-left">
          <h3 className="text-sm xl:text-base font-black uppercase text-slate-400 mb-6 tracking-widest pl-2 italic">Configuración de Impresión</h3>
          
          {loading ? (
             <div className="py-10 flex flex-col items-center justify-center gap-3 text-slate-300">
               <Loader2 className="animate-spin" size={32} />
               <p className="text-[10px] font-black uppercase tracking-widest">Conectando a la nube...</p>
             </div>
          ) : productos.length === 0 ? (
             <div className="py-10 text-center opacity-50">
                <FileText size={32} className="mx-auto mb-2 text-slate-300" />
                <p className="text-[10px] font-black uppercase tracking-widest">No hay productos marcados como "Venta Final" en Rentabilidad.</p>
             </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-[11px] xl:text-xs font-black uppercase text-slate-400 mb-3 pl-2 tracking-wider">Seleccionar Producto</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-100 p-4 xl:p-5 rounded-2xl text-base font-bold text-slate-700 focus:ring-2 focus:ring-lingote-gold outline-none appearance-none cursor-pointer"
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                >
                  {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] xl:text-xs font-black uppercase text-slate-400 mb-3 pl-2 tracking-wider">F. Envasado</label>
                  <input type="date" className="w-full bg-slate-50 border border-slate-100 p-4 xl:p-5 rounded-2xl text-sm font-bold" value={envasado} onChange={(e)=>setEnvasado(e.target.value)} />
                </div>
                <div>
                  <label className="block text-[11px] xl:text-xs font-black uppercase text-slate-400 mb-3 pl-2 tracking-wider">Vencimiento</label>
                  <input type="date" className="w-full bg-slate-50 border border-slate-100 p-4 xl:p-5 rounded-2xl text-sm font-bold text-red-600 bg-red-50/50" value={vencimiento} readOnly />
                </div>
              </div>

              <div>
                <label className="block text-[11px] xl:text-xs font-black uppercase text-slate-400 mb-3 pl-2 tracking-wider">Número de Lote</label>
                <input type="text" className="w-full bg-slate-50 border border-slate-100 p-4 xl:p-5 rounded-2xl text-base font-bold tracking-widest" value={lote} onChange={(e)=>setLote(e.target.value)} />
              </div>
            </div>
          )}
          
          <button 
             onClick={() => window.print()} 
             disabled={loading || productos.length === 0}
             className="w-full mt-10 bg-slate-900 text-white font-black py-5 xl:py-6 rounded-3xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Printer size={22} /> GENERAR ETIQUETA (10x10)
          </button>
        </div>
      </aside>

      <main id="label-container" className="flex-1 flex justify-center lg:justify-start items-start p-4">
        {producto ? (
          <div className="bg-white w-[96mm] h-[96mm] shadow-2xl p-6 border border-slate-200 flex flex-col justify-start text-slate-900 leading-[1.1] overflow-hidden text-left">
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-2 mb-3">
              <div className="flex items-center gap-3">
                <img src="/logo_lingote_oficial_ligero.png" alt="Logo" className="w-10 h-10 object-contain" />
                <div className="text-left">
                  <h2 className="text-lg font-black tracking-tighter leading-none">{INFO_FABRICANTE.nombre}</h2>
                  <p className="text-[10px] font-black uppercase text-slate-500">{producto.nombre}</p>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                 {hasCalorieStamp && <div className="w-9 h-9 bg-black text-white text-[5px] flex items-center justify-center text-center font-bold px-0.5 rounded-full border border-white leading-none tracking-tighter uppercase">Exceso Calorías</div>}
                 {hasSatFatStamp && <div className="w-9 h-9 bg-black text-white text-[5px] flex items-center justify-center text-center font-bold px-0.5 rounded-full border border-white leading-none tracking-tighter uppercase">Exceso Grasas Sat.</div>}
                 {hasSodiumStamp && <div className="w-9 h-9 bg-black text-white text-[5px] flex items-center justify-center text-center font-bold px-0.5 rounded-full border border-white leading-none tracking-tighter uppercase">Exceso Sodio</div>}
              </div>
            </div>

            <div className="space-y-2 mb-3 text-left">
              <p className="text-[8px] leading-tight"><span className="font-black uppercase text-[9px]">Ingredientes:</span> {renderIngredientes()}</p>
              <p className="text-[9px] font-black underline italic uppercase">{producto.alergenos}</p>
              
              <div className="border-[1.5px] border-slate-900 text-[8px] rounded-lg overflow-hidden">
                <div className="bg-slate-900 text-white font-black py-1 text-center uppercase tracking-tighter text-[9px]">Información Nutricional (por 100g)</div>
                <div className="p-2 grid grid-cols-2 gap-x-4 gap-y-1 font-black">
                  <div className="space-y-1 border-r border-slate-200 pr-2">
                    <div className="flex justify-between border-b border-slate-100 pb-0.5"><span>Energía</span><span>{producto.nutricion.calorias} kcal</span></div>
                    <div className="flex justify-between border-b border-slate-100 pb-0.5"><span>Proteína</span><span>{producto.nutricion.proteina}g</span></div>
                    <div className="flex justify-between border-b border-slate-100 pb-0.5"><span>Carbohidratos</span><span>{producto.nutricion.carbohidratos}g</span></div>
                    <div className="flex justify-between pl-2 text-[7px] italic text-slate-500"><span>- Azúcares</span><span>{producto.nutricion.azucares}g</span></div>
                    <div className="flex justify-between pl-2 text-[7px] italic text-slate-500"><span>- Fibra</span><span>{producto.nutricion.fibraDietetica}g</span></div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between border-b border-slate-100 pb-0.5"><span>Grasas Totales</span><span>{producto.nutricion.grasaTotal}g</span></div>
                    <div className="flex justify-between pl-2 text-[7px] italic text-slate-500"><span>- Saturadas</span><span>{producto.nutricion.grasaSaturada}g</span></div>
                    <div className="flex justify-between pl-2 text-[7px] italic text-slate-500"><span>- Trans</span><span>{producto.nutricion.grasasTrans}g</span></div>
                    <div className="flex justify-between border-b border-slate-100 pb-0.5"><span>Colesterol</span><span>{producto.nutricion.colesterol}mg</span></div>
                    <div className="flex justify-between text-slate-900 font-black"><span>Sodio</span><span>{producto.nutricion.sodio}mg</span></div>
                  </div>
                </div>
              </div>
              
              {/* Raciones de Intercambio (Etiqueta Retail) */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-center mt-1">
                 <p className="text-[6px] font-black text-slate-500 uppercase tracking-widest mb-0.5 leading-none">Raciones de Intercambio (1 Ración = 10g)</p>
                 <div className="flex justify-center gap-4 text-[9px] font-black uppercase italic tracking-tighter leading-none">
                    <div className="flex items-center gap-1"><span className="text-blue-500">HC:</span><span className="text-slate-900">{((producto.nutricion?.carbohidratos || 0) / 10).toFixed(1)}</span></div>
                    <div className="flex items-center gap-1"><span className="text-red-500">PROT:</span><span className="text-slate-900">{((producto.nutricion?.proteina || 0) / 10).toFixed(1)}</span></div>
                    <div className="flex items-center gap-1"><span className="text-amber-500">GRASA:</span><span className="text-slate-900">{((producto.nutricion?.grasaTotal || 0) / 10).toFixed(1)}</span></div>
                 </div>
              </div>
            </div>

            <div className="mt-auto pt-2 border-t border-slate-200 text-center space-y-1">
              <div className="flex justify-between font-black uppercase text-[8px] gap-2">
                <div className="border border-slate-300 px-2 py-0.5 flex-1">LOTE: {lote}</div>
                <div className="border border-slate-300 px-2 py-0.5 flex-1 text-slate-500">ENV: {envasado}</div>
                <div className="border border-slate-300 px-2 py-0.5 flex-1 text-red-600 italic">VENCE: {vencimiento}</div>
              </div>
              <p className="font-bold text-[7px] tracking-tight">{INFO_FABRICANTE.nombre} • Cartago, CR • {INFO_FABRICANTE.contacto}</p>
              <p className="text-[12px] font-black pt-1 uppercase">PESO NETO: {producto.pesoNeto}</p>
            </div>
          </div>
        ) : (
          <div className="bg-white w-[96mm] h-[96mm] shadow-2xl p-6 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300">
             <FileText size={48} className="mb-4" />
             <p className="font-black uppercase tracking-widest text-[10px]">Esperando Producto...</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Etiquetador;
