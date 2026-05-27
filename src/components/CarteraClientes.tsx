import { useState, useEffect } from 'react';
import { Users, Search, Phone, Star, Loader2, TrendingUp, UserCheck, Mail, Download, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Cliente {
  telefono: string;
  nombre: string;
  email: string;
  puntos_lealtad: number;
  ultima_compra: string;
  unido_al_grupo: boolean;
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
    c.telefono.includes(busqueda) ||
    c.email?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const exportarCSV = () => {
    if (clientes.length === 0) return;
    
    const headers = ["Nombre", "Telefono", "Email", "Puntos", "Registro", "Ultima Compra", "Grupo VIP"];
    const rows = clientes.map(c => [
      c.nombre,
      c.telefono,
      c.email || "N/A",
      c.puntos_lealtad,
      new Date(c.created_at).toLocaleDateString('es-CR'),
      new Date(c.ultima_compra).toLocaleDateString('es-CR'),
      c.unido_al_grupo ? "SI" : "NO"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Clientes_LingoteEspañol_${new Date().toLocaleDateString('es-CR')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 text-left">
      
      {/* HEADER */}
      <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl border border-white/5 mx-1">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <h2 className="text-3xl font-black tracking-tighter uppercase italic leading-none mb-2">Cartera de Clientes</h2>
            <p className="text-lingote-gold font-bold uppercase tracking-widest text-[10px] italic">Base de Datos VIP en la Nube</p>
          </div>
          <button 
            onClick={exportarCSV}
            className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 hover:bg-white/20 transition-all font-black text-[10px] uppercase tracking-widest"
          >
            <Download size={14} className="text-lingote-gold" />
            Exportar CSV
          </button>
        </div>
        <Users className="absolute -right-4 -bottom-4 text-white/5" size={150} />
      </div>

      {/* BUSCADOR */}
      <div className="relative mx-1">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Buscar por nombre, email o teléfono..."
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
          {clientesFiltrados.map((cliente) => (
            <div key={cliente.telefono} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:border-lingote-gold/30 transition-all group overflow-hidden">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                
                {/* INFO CLIENTE */}
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform shrink-0">
                     <UserCheck size={28} className={cliente.puntos_lealtad >= 10 ? 'text-lingote-gold' : 'text-white'} />
                  </div>
                  <div className="text-left min-w-0">
                     <h4 className="text-lg font-black text-slate-800 uppercase tracking-tighter italic leading-none truncate">{cliente.nombre}</h4>
                     <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                        <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                           <Mail size={10} className="text-slate-300" /> {cliente.email || 'Sin Email'}
                        </div>
                        <div className="h-3 w-px bg-slate-100 hidden md:block"></div>
                        <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                           <Phone size={10} className="text-slate-300" /> {cliente.telefono}
                        </div>
                        <div className="h-3 w-px bg-slate-100 hidden md:block"></div>
                        <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                           <Calendar size={10} className="text-slate-300" /> 
                           Registro: {new Date(cliente.created_at).toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                     </div>
                  </div>
                </div>

                {/* MÉTRICAS Y ACCIONES */}
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                  
                  {/* PUNTOS */}
                  <div className="bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100 flex flex-col items-center min-w-[80px]">
                     <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Puntos</p>
                     <div className="flex items-center gap-1">
                        <span className="text-sm font-black text-slate-900">{cliente.puntos_lealtad}</span>
                        <Star size={10} className="text-lingote-gold" fill="currentColor" />
                     </div>
                  </div>

                  {/* ÚLTIMA COMPRA */}
                  <div className="bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100 flex flex-col items-center min-w-[90px]">
                     <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Última</p>
                     <span className="text-[9px] font-black text-slate-600 uppercase italic">
                        {new Date(cliente.ultima_compra).toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric' })}
                     </span>
                  </div>

                  {/* ACCIONES DE CONTACTO */}
                  <div className="flex items-center gap-2 ml-auto lg:ml-0">
                    <a 
                      href={`https://wa.me/${cliente.telefono.replace(/\D/g, '')}`} 
                      target="_blank" 
                      className="p-4 bg-[#25D366] text-white rounded-2xl shadow-lg shadow-green-100 hover:bg-[#20ba5a] active:scale-90 transition-all flex items-center justify-center"
                      title="Enviar WhatsApp"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.353-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.13.57-.074 1.758-.706 2.003-1.388.245-.682.245-1.264.172-1.388-.073-.123-.27-.198-.568-.347zM12 0C5.373 0 0 5.373 0 12c0 2.123.55 4.118 1.512 5.85L.07 23.647l5.966-1.566A11.905 11.905 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.019 0-3.923-.519-5.589-1.43l-.4-.22-3.558.93.947-3.468-.242-.384A9.954 9.954 0 0 1 2 12c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10z"/>
                      </svg>
                    </a>
                    {cliente.email && (
                      <a 
                        href={`mailto:${cliente.email}`} 
                        className="p-4 bg-slate-900 text-white rounded-2xl shadow-lg shadow-slate-200 hover:bg-slate-800 active:scale-90 transition-all"
                        title="Enviar Email"
                      >
                        <Mail size={20} />
                      </a>
                    )}
                  </div>

                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ESTADÍSTICAS RÁPIDAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mx-1">
         <div className="bg-slate-900 p-6 rounded-[2rem] text-white flex items-center justify-between border border-white/5 shadow-xl">
            <div>
               <p className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-1 italic">Total Clientes</p>
               <h3 className="text-3xl font-black tracking-tighter italic leading-none">{clientes.length}</h3>
            </div>
            <Users className="text-white/10" size={48} />
         </div>
         <div className="bg-white p-6 rounded-[2rem] border border-lingote-accent flex items-center justify-between shadow-sm">
            <div>
               <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 italic">Puntos Acumulados</p>
               <h3 className="text-3xl font-black tracking-tighter text-slate-900 italic leading-none">
                  {clientes.reduce((sum, c) => sum + c.puntos_lealtad, 0)}
               </h3>
            </div>
            <TrendingUp className="text-slate-100" size={48} />
         </div>
      </div>

    </div>
  );
};

export default CarteraClientes;
