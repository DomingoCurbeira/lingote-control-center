import { useState, useEffect } from 'react';
import { 
  Truck, Plus, Trash2, Search, 
  MessageCircle, Mail, Phone, Loader2, Info 
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { notify } from '../utils/notifications';

export interface Proveedor {
  id: string;
  nombre: string;
  whatsapp: string;
  email: string;
  categoria: string;
  notas: string;
  created_at: string;
}

const DirectorioProveedores = () => {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [nuevoProv, setNuevoProv] = useState<Partial<Proveedor>>({
    nombre: '',
    whatsapp: '',
    email: '',
    categoria: 'Distribuidora',
    notas: ''
  });

  useEffect(() => {
    fetchProveedores();
  }, []);

  const fetchProveedores = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('proveedores')
      .select('*')
      .order('nombre', { ascending: true });

    if (!error && data) setProveedores(data);
    setLoading(false);
  };

  const agregarProveedor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoProv.nombre) return;

    const { error } = await supabase
      .from('proveedores')
      .insert([nuevoProv]);

    if (!error) {
      notify.success("Proveedor Guardado", `${nuevoProv.nombre} se ha añadido al directorio.`);
      setNuevoProv({ nombre: '', whatsapp: '', email: '', categoria: 'Distribuidora', notas: '' });
      fetchProveedores();
    } else {
      notify.error("Error", error.message);
    }
  };

  const eliminarProveedor = async (id: string) => {
    const confirm = await notify.confirm("¿Eliminar Proveedor?", "Se perderá el contacto y la vinculación histórica.");
    if (!confirm) return;

    const { error } = await supabase.from('proveedores').delete().eq('id', id);
    if (!error) {
      setProveedores(proveedores.filter(p => p.id !== id));
      notify.success("Proveedor Eliminado", "Contacto removido correctamente.");
    }
  };

  const filtrados = proveedores.filter(p => 
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.categoria.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 text-left">
      
      {/* HEADER */}
      <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl border border-white/5 mx-1">
        <div className="relative z-10">
          <h2 className="text-3xl font-black tracking-tighter uppercase italic leading-none mb-2">Directorio de Proveedores</h2>
          <p className="text-lingote-gold font-bold uppercase tracking-widest text-[10px] italic">Gestión de Socios Logísticos y Suministros</p>
        </div>
        <Truck className="absolute -right-4 -bottom-4 text-white/5" size={150} />
      </div>

      {/* FORMULARIO */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-lingote-accent shadow-sm mx-1">
         <form onSubmit={agregarProveedor} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest italic">Nombre de la Empresa</label>
               <input 
                 required
                 type="text" 
                 placeholder="Ej: Distribuidora Mayca"
                 className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold text-sm outline-none focus:border-lingote-gold transition-all"
                 value={nuevoProv.nombre}
                 onChange={e => setNuevoProv({...nuevoProv, nombre: e.target.value.toUpperCase()})}
               />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest italic">WhatsApp de Pedidos</label>
               <div className="relative">
                 <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                 <input 
                   type="tel" 
                   placeholder="Ej: 50680000000"
                   className="w-full bg-slate-50 border-2 border-slate-100 p-4 pl-12 rounded-2xl font-bold text-sm outline-none focus:border-lingote-gold transition-all"
                   value={nuevoProv.whatsapp}
                   onChange={e => setNuevoProv({...nuevoProv, whatsapp: e.target.value.replace(/\D/g, '')})}
                 />
               </div>
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest italic">Email de Contacto</label>
               <div className="relative">
                 <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                 <input 
                   type="email" 
                   placeholder="proveedor@empresa.com"
                   className="w-full bg-slate-50 border-2 border-slate-100 p-4 pl-12 rounded-2xl font-bold text-sm outline-none focus:border-lingote-gold transition-all"
                   value={nuevoProv.email}
                   onChange={e => setNuevoProv({...nuevoProv, email: e.target.value.toLowerCase()})}
                 />
               </div>
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest italic">Categoría</label>
               <select 
                 className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold text-sm outline-none focus:border-lingote-gold appearance-none uppercase"
                 value={nuevoProv.categoria}
                 onChange={e => setNuevoProv({...nuevoProv, categoria: e.target.value})}
               >
                 <option value="Distribuidora">Distribuidora</option>
                 <option value="Verdulería">Verdulería</option>
                 <option value="Lácteos">Lácteos</option>
                 <option value="Panadería">Panadería</option>
                 <option value="Carnicería">Carnicería</option>
                 <option value="Empaques">Empaques</option>
                 <option value="Otros">Otros</option>
               </select>
            </div>
            <div className="md:col-span-1 space-y-2">
               <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest italic">Notas Adicionales</label>
               <input 
                 type="text" 
                 placeholder="Ej: Entrega los martes..."
                 className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold text-sm outline-none focus:border-lingote-gold transition-all"
                 value={nuevoProv.notas}
                 onChange={e => setNuevoProv({...nuevoProv, notas: e.target.value})}
               />
            </div>
            <div className="space-y-2 flex flex-col justify-end">
               <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase italic tracking-widest flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all">
                  <Plus size={20} className="text-lingote-gold" /> Guardar Proveedor
               </button>
            </div>
         </form>
      </div>

      {/* LISTA */}
      <div className="space-y-4 mx-1">
         <div className="relative">
           <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
           <input 
             type="text" 
             placeholder="Buscar proveedor..."
             className="w-full bg-white border-2 border-slate-100 p-5 pl-14 rounded-[2rem] font-bold text-sm outline-none focus:border-lingote-gold shadow-sm transition-all"
             value={busqueda}
             onChange={e => setBusqueda(e.target.value)}
           />
         </div>

         {loading ? (
            <div className="py-20 flex flex-col items-center gap-4 text-slate-300">
               <Loader2 className="animate-spin" size={48} />
               <p className="font-black uppercase text-[10px]">Conectando con logística...</p>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {filtrados.map(p => (
                  <div key={p.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:border-lingote-gold/30 transition-all group relative overflow-hidden">
                     <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                           <div className="bg-slate-900 p-3.5 rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform">
                              <Truck size={24} className="text-lingote-gold" />
                           </div>
                           <div className="text-left">
                              <h4 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">{p.nombre}</h4>
                              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{p.categoria}</p>
                           </div>
                        </div>
                        <button 
                           onClick={() => eliminarProveedor(p.id)}
                           className="p-2 text-slate-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                           <Trash2 size={18} />
                        </button>
                     </div>

                     <div className="grid grid-cols-3 gap-2 mt-4">
                        <a 
                          href={`https://wa.me/${p.whatsapp}`} 
                          target="_blank"
                          className="flex flex-col items-center justify-center p-4 bg-[#25D366] text-white rounded-2xl shadow-lg shadow-green-100 active:scale-95 transition-all"
                        >
                           <MessageCircle size={24} />
                           <span className="text-[8px] font-black uppercase mt-1">Chat</span>
                        </a>
                        <a 
                          href={`tel:${p.whatsapp}`} 
                          className="flex flex-col items-center justify-center p-4 bg-slate-900 text-white rounded-2xl shadow-lg active:scale-95 transition-all"
                        >
                           <Phone size={24} />
                           <span className="text-[8px] font-black uppercase mt-1">Llamar</span>
                        </a>
                        <a 
                          href={`mailto:${p.email}`} 
                          className="flex flex-col items-center justify-center p-4 bg-slate-100 text-slate-400 rounded-2xl shadow-inner active:scale-95 transition-all"
                        >
                           <Mail size={24} />
                           <span className="text-[8px] font-black uppercase mt-1">Email</span>
                        </a>
                     </div>

                     {p.notas && (
                        <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex gap-3 text-left">
                           <Info size={14} className="text-slate-300 shrink-0 mt-0.5" />
                           <p className="text-[10px] text-slate-500 font-medium italic leading-relaxed">{p.notas}</p>
                        </div>
                     )}
                  </div>
               ))}
            </div>
         )}
      </div>

    </div>
  );
};

export default DirectorioProveedores;
