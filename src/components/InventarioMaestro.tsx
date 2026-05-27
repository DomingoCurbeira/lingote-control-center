import { useState, useEffect } from 'react';
import { 
  Database, Plus, Trash2, Save, Search, 
  Truck, Loader2, AlertCircle, TrendingDown, TrendingUp 
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { notify } from '../utils/notifications';
import type { Proveedor } from './DirectorioProveedores';

export interface InsumoMaestro {
  id: string;
  nombre: string;
  proveedor: string;
  unidad: string;
  precio_costo: number;
  categoria: string;
  updated_at: string;
}

const InventarioMaestro = () => {
  const [insumos, setInsumos] = useState<InsumoMaestro[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [nuevoInsumo, setNuevoInsumo] = useState<Partial<InsumoMaestro>>({
    nombre: '',
    proveedor: '',
    unidad: 'kilo',
    precio_costo: 0,
    categoria: 'vegetales'
  });

  useEffect(() => {
    fetchInsumos();
    fetchProveedores();
  }, []);

  const fetchInsumos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('insumos')
      .select('*')
      .order('nombre', { ascending: true });

    if (!error && data) setInsumos(data);
    setLoading(false);
  };

  const fetchProveedores = async () => {
    const { data } = await supabase.from('proveedores').select('nombre');
    if (data) setProveedores(data as any);
  };

  const agregarInsumo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoInsumo.nombre || nuevoInsumo.precio_costo === undefined) return;

    const { error } = await supabase
      .from('insumos')
      .insert([nuevoInsumo]);

    if (!error) {
      notify.success("Insumo Registrado", `${nuevoInsumo.nombre} se ha añadido al maestro.`);
      setNuevoInsumo({ nombre: '', proveedor: '', unidad: 'kilo', precio_costo: 0, categoria: 'vegetales' });
      fetchInsumos();
    } else {
      notify.error("Error al registrar", error.message);
    }
  };

  const actualizarPrecio = async (id: string, nuevoPrecio: number) => {
    const { error } = await supabase
      .from('insumos')
      .update({ precio_costo: nuevoPrecio, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      notify.success("Precio Actualizado", "El nuevo costo se ha sincronizado con la nube.");
      setInsumos(insumos.map(i => i.id === id ? { ...i, precio_costo: nuevoPrecio } : i));
      setEditId(null);
    }
  };

  const eliminarInsumo = async (id: string) => {
    const confirmacion = await notify.confirm("¿Eliminar Insumo?", "Esta acción podría afectar el cálculo de tus recetas activas.");
    if (!confirmacion) return;
    
    const { error } = await supabase.from('insumos').delete().eq('id', id);
    if (!error) {
      notify.success("Insumo Eliminado", "Se ha removido el ingrediente del maestro.");
      setInsumos(insumos.filter(i => i.id !== id));
    }
  };

  const filtrados = insumos.filter(i => 
    i.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    i.proveedor.toLowerCase().includes(busqueda.toLowerCase())
  );

  const categorias = ['vegetales', 'lacteos', 'carnes', 'abarrotes', 'empaques', 'otros'];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 text-left">
      
      {/* HEADER */}
      <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl border border-white/5 mx-1">
        <div className="relative z-10">
          <h2 className="text-3xl font-black tracking-tighter uppercase italic leading-none mb-2">Inventario Maestro</h2>
          <p className="text-lingote-gold font-bold uppercase tracking-widest text-[10px] italic">Control Central de Proveedores y Precios</p>
        </div>
        <Database className="absolute -right-4 -bottom-4 text-white/5" size={150} />
      </div>

      {/* FORMULARIO RÁPIDO */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-lingote-accent shadow-sm mx-1">
         <form onSubmit={agregarInsumo} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 space-y-2">
               <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest italic">Nuevo Ingrediente</label>
               <input 
                 required
                 type="text" 
                 placeholder="Ej: Patata Lavada"
                 className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold text-sm outline-none focus:border-lingote-gold transition-all"
                 value={nuevoInsumo.nombre}
                 onChange={e => setNuevoInsumo({...nuevoInsumo, nombre: e.target.value})}
               />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest italic">Proveedor</label>
               <select 
                 className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold text-sm outline-none focus:border-lingote-gold appearance-none uppercase"
                 value={nuevoInsumo.proveedor}
                 onChange={e => setNuevoInsumo({...nuevoInsumo, proveedor: e.target.value})}
               >
                 <option value="">Seleccionar...</option>
                 {proveedores.map(p => <option key={p.nombre} value={p.nombre}>{p.nombre}</option>)}
                 <option value="OTRO">OTRO / VARIOS</option>
               </select>
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest italic">Precio x Unidad</label>
               <div className="relative">
                 <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">₡</span>
                 <input 
                   required
                   type="number" 
                   className="w-full bg-slate-50 border-2 border-slate-100 p-4 pl-8 rounded-2xl font-bold text-sm outline-none focus:border-lingote-gold transition-all"
                   value={nuevoInsumo.precio_costo}
                   onChange={e => setNuevoInsumo({...nuevoInsumo, precio_costo: Number(e.target.value)})}
                 />
               </div>
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest italic">Categoría</label>
               <select 
                 className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold text-sm outline-none focus:border-lingote-gold appearance-none uppercase"
                 value={nuevoInsumo.categoria}
                 onChange={e => setNuevoInsumo({...nuevoInsumo, categoria: e.target.value})}
               >
                 {categorias.map(c => <option key={c} value={c}>{c}</option>)}
               </select>
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest italic">Unidad</label>
               <select 
                 className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold text-sm outline-none focus:border-lingote-gold appearance-none uppercase"
                 value={nuevoInsumo.unidad}
                 onChange={e => setNuevoInsumo({...nuevoInsumo, unidad: e.target.value})}
               >
                 <option value="kilo">Kilo</option>
                 <option value="litro">Litro</option>
                 <option value="unidad">Unidad</option>
                 <option value="gramo">Gramo</option>
               </select>
            </div>
            <div className="md:col-span-4 pt-2">
               <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase italic tracking-widest flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all">
                  <Plus size={20} className="text-lingote-gold" /> Registrar en el Maestro
               </button>
            </div>
         </form>
      </div>

      {/* BUSCADOR Y LISTA */}
      <div className="space-y-4 mx-1">
         <div className="relative">
           <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
           <input 
             type="text" 
             placeholder="Buscar ingrediente o proveedor..."
             className="w-full bg-white border-2 border-slate-100 p-5 pl-14 rounded-[2rem] font-bold text-sm outline-none focus:border-lingote-gold shadow-sm transition-all"
             value={busqueda}
             onChange={e => setBusqueda(e.target.value)}
           />
         </div>

         {loading ? (
            <div className="py-20 flex flex-col items-center gap-4 text-slate-300">
               <Loader2 className="animate-spin" size={48} />
               <p className="font-black uppercase text-[10px]">Actualizando precios...</p>
            </div>
         ) : (
            <div className="space-y-12">
               {categorias.map(cat => {
                 const insumosCategoria = filtrados.filter(i => i.categoria === cat);
                 if (insumosCategoria.length === 0) return null;

                 return (
                   <div key={cat} className="space-y-6">
                     <div className="flex items-center gap-4 px-2">
                        <div className="h-px flex-1 bg-slate-100"></div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 italic">{cat}</h3>
                        <div className="h-px flex-1 bg-slate-100"></div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {insumosCategoria.map(insumo => (
                           <div key={insumo.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:border-lingote-gold/30 transition-all group relative overflow-hidden">
                              <div className="flex justify-between items-start mb-4">
                                 <div className="bg-slate-50 p-3 rounded-2xl text-slate-400 group-hover:bg-slate-900 group-hover:text-lingote-gold transition-colors">
                                    <Truck size={20} />
                                 </div>
                                 <div className="flex flex-col items-end gap-2">
                                    <span className="bg-lingote-gold/10 text-lingote-gold px-3 py-1 rounded-full text-[7px] font-black uppercase tracking-[0.2em] border border-lingote-gold/20">
                                       {insumo.categoria}
                                    </span>
                                    <p className="text-[10px] font-black text-slate-900 uppercase italic mt-0.5">{insumo.proveedor || 'S/P'}</p>
                                 </div>
                              </div>

                              <div className="space-y-1">
                                 <h4 className="text-lg font-black text-slate-800 uppercase tracking-tighter italic leading-none">{insumo.nombre}</h4>
                                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Base: 1 {insumo.unidad}</p>
                              </div>

                              <div className="mt-6 flex items-center justify-between">
                                 {editId === insumo.id ? (
                                    <div className="flex items-center gap-2 w-full animate-in slide-in-from-left-2 duration-300">
                                       <input 
                                         autoFocus
                                         type="number"
                                         className="flex-1 bg-slate-50 border-2 border-lingote-gold p-2 rounded-xl font-black text-sm outline-none"
                                         defaultValue={insumo.precio_costo}
                                         onBlur={e => actualizarPrecio(insumo.id, Number(e.target.value))}
                                         onKeyDown={e => e.key === 'Enter' && actualizarPrecio(insumo.id, Number((e.target as any).value))}
                                       />
                                       <Save size={16} className="text-lingote-gold" />
                                    </div>
                                 ) : (
                                    <button 
                                      onClick={() => setEditId(insumo.id)}
                                      className="text-2xl font-black text-slate-900 italic tracking-tighter hover:text-lingote-gold transition-colors"
                                    >
                                       ₡{insumo.precio_costo.toLocaleString()}
                                    </button>
                                 )}
                                 
                                 <button 
                                    onClick={() => eliminarInsumo(insumo.id)}
                                    className="p-2 text-slate-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                 >
                                    <Trash2 size={16} />
                                 </button>
                              </div>

                              <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                                 <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest italic">
                                    Actualizado: {new Date(insumo.updated_at).toLocaleDateString('es-CR')}
                                 </p>
                                 <div className="flex gap-1">
                                    <TrendingDown size={12} className="text-slate-100" />
                                    <TrendingUp size={12} className="text-slate-100" />
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                   </div>
                 );
               })}
               
               {filtrados.length === 0 && (
                  <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 text-center text-slate-300">
                    <p className="font-black uppercase tracking-widest text-xs italic">No se encontraron insumos</p>
                  </div>
               )}
            </div>
         )}
      </div>

      {/* NOTA DE CONECTIVIDAD */}
      <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 flex gap-4 mx-1">
         <div className="bg-white p-3 rounded-xl shadow-sm text-amber-600 shrink-0 h-fit"><AlertCircle size={20} /></div>
         <div className="space-y-1">
            <p className="font-black text-[10px] text-amber-800 uppercase italic leading-none">Cerebro Central Activo</p>
            <p className="text-[9px] font-bold text-amber-700/60 uppercase leading-relaxed">
              Cualquier cambio de precio aquí se reflejará automáticamente en todos tus escandallos de Rentabilidad que estén vinculados a este ingrediente.
            </p>
         </div>
      </div>

    </div>
  );
};

export default InventarioMaestro;
