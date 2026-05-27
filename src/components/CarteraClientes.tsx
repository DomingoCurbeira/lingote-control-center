import { useState, useEffect } from 'react';
import { Users, Search, Phone, Calendar, Star, Loader2, TrendingUp, UserCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Cliente {
  telefono: string;
  nombre: string;
  puntos_lealtad: number;
  ultima_compra: string;
  created_at: string;
}

const CarteraClientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClientes = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('ultima_compra', { ascending: false });

      if (!error && data) {
        setClientes(data);
      }
      setLoading(false);
    };

    fetchClientes();
  }, []);

  const clientesFiltrados = clientes.filter(c => 
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
    c.telefono.includes(busqueda)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 text-left">
      
      {/* HEADER */}
      <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl border border-white/5 mx-1">
        <div className="relative z-10">
          <h2 className="text-3xl font-black tracking-tighter uppercase italic leading-none mb-2">Cartera de Clientes</h2>
          <p className="text-lingote-gold font-bold uppercase tracking-widest text-[10px] italic">Base de Datos VIP en la Nube</p>
        </div>
        <Users className="absolute -right-4 -bottom-4 text-white/5" size={150} />
      </div>

      {/* BUSCADOR */}
      <div className="relative mx-1">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Buscar por nombre o teléfono..."
          className="w-full bg-white border-2 border-slate-100 p-5 pl-14 rounded-[2rem] font-bold text-sm outline-none focus:border-lingote-gold shadow-sm transition-all"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-300 gap-4">
           <Loader2 className="animate-spin" size={48} />
           <p className="font-black uppercase tracking-widest text-[10px]">Cargando clientes...</p>
        </div>
      ) : (
        <div className="space-y-4 mx-1">
          {clientesFiltrados.length === 0 ? (
            <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 text-center text-slate-300">
               <p className="font-black uppercase tracking-widest text-xs">No se encontraron clientes</p>
            </div>
          ) : (
            clientesFiltrados.map((cliente) => (
              <div key={cliente.telefono} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:border-lingote-gold/30 transition-all group">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform">
                       <UserCheck size={28} className={cliente.puntos_lealtad >= 10 ? 'text-lingote-gold' : 'text-white'} />
                    </div>
                    <div className="text-left">
                       <h4 className="text-lg font-black text-slate-800 uppercase tracking-tighter italic leading-none">{cliente.nombre}</h4>
                       <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                             <Phone size={10} className="text-slate-300" /> {cliente.telefono}
                          </div>
                          <div className="h-3 w-px bg-slate-100"></div>
                          <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                             <Calendar size={10} className="text-slate-300" /> 
                             {new Date(cliente.ultima_compra).toLocaleDateString('es-CR', { day: '2-digit', month: 'short' })}
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="flex-1 md:flex-none bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Puntos Lealtad</p>
                       <div className="flex items-center justify-center gap-1">
                          <span className="text-xl font-black text-slate-900 leading-none">{cliente.puntos_lealtad}</span>
                          <Star size={14} className="text-lingote-gold" fill="currentColor" />
                       </div>
                    </div>
                    <div className="flex-1 md:flex-none bg-lingote-gold/10 p-4 rounded-2xl border border-lingote-gold/20 text-center">
                       <p className="text-[8px] font-black text-lingote-gold uppercase tracking-[0.2em] mb-1">Nivel</p>
                       <span className="text-[10px] font-black text-slate-800 uppercase italic">
                          {cliente.puntos_lealtad >= 20 ? 'Premium' : cliente.puntos_lealtad >= 10 ? 'Frecuente' : 'Nuevo'}
                       </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ESTADÍSTICAS RÁPIDAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mx-1">
         <div className="bg-slate-900 p-6 rounded-[2rem] text-white flex items-center justify-between border border-white/5">
            <div>
               <p className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-1 italic">Total Clientes</p>
               <h3 className="text-3xl font-black tracking-tighter italic leading-none">{clientes.length}</h3>
            </div>
            <Users className="text-white/10" size={48} />
         </div>
         <div className="bg-white p-6 rounded-[2rem] border border-lingote-accent flex items-center justify-between shadow-sm">
            <div>
               <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 italic">Promedio Puntos</p>
               <h3 className="text-3xl font-black tracking-tighter text-slate-900 italic leading-none">
                  {clientes.length > 0 ? (clientes.reduce((sum, c) => sum + c.puntos_lealtad, 0) / clientes.length).toFixed(1) : 0}
               </h3>
            </div>
            <TrendingUp className="text-slate-100" size={48} />
         </div>
      </div>

    </div>
  );
};

export default CarteraClientes;
