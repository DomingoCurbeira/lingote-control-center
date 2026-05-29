import { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, Plus, Trash2, Download, Upload, Save, 
  CheckCircle2, AlertTriangle, Image as ImageIcon,
  Edit3, Eye, FileText, Camera, Loader2, Cloud
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { supabase } from '../lib/supabase';
import { notify } from '../utils/notifications';

// --- INTERFACES ---
interface PasoSOP {
  id: string;
  titulo: string;
  descripcion: string;
  esCritico: boolean;
  imagen?: string;
}

interface ItemLista {
  id: string;
  nombre: string;
  cantidad: string;
}

interface SOP {
  id: string;
  titulo: string;
  objetivo: string;
  imagenPrincipal?: string;
  ingredientes: ItemLista[];
  herramientas: ItemLista[];
  pasos: PasoSOP[];
}

const ManualesSOP = () => {
  const [manuales, setManuales] = useState<SOP[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sopRef1 = useRef<HTMLDivElement>(null);
  const sopRef2 = useRef<HTMLDivElement>(null);

  // --- PERSISTENCIA Y CARGA CLOUD ---
  useEffect(() => {
    fetchCloudSOPs();
  }, []);

  const fetchCloudSOPs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('manuales_sop')
      .select('*')
      .order('titulo', { ascending: true });

    if (!error && data) {
      const mapped: SOP[] = data.map(r => ({
        id: r.id,
        titulo: r.titulo,
        objetivo: r.objetivo,
        imagenPrincipal: r.imagen_principal,
        ingredientes: r.ingredientes || [],
        herramientas: r.herramientas || [],
        pasos: r.pasos || []
      }));
      setManuales(mapped);
      if (mapped.length > 0) setActiveId(mapped[0].id);
    }
    setLoading(false);
  };

  const activeSOP = manuales.find(m => m.id === activeId) || null;

  // --- ACCIONES CLOUD ---

  const guardarEnNube = async (sop: SOP) => {
    const { error } = await supabase
      .from('manuales_sop')
      .upsert({
        id: sop.id,
        titulo: sop.titulo,
        objetivo: sop.objetivo,
        imagen_principal: sop.imagenPrincipal,
        ingredientes: sop.ingredientes,
        herramientas: sop.herramientas,
        pasos: sop.pasos,
        updated_at: new Date().toISOString()
      });
    
    if (error) notify.error("Error al sincronizar SOP", error.message);
  };

  const crearNuevoManual = async () => {
    const nuevo: SOP = {
      id: Date.now().toString(),
      titulo: 'NUEVO PROCEDIMIENTO',
      objetivo: 'Lograr la estandarización total de este proceso.',
      ingredientes: [],
      herramientas: [],
      pasos: [
        { id: '1', titulo: 'Paso 1', descripcion: 'Descripción del primer paso...', esCritico: false }
      ]
    };
    
    setManuales(prev => [...prev, nuevo]);
    setActiveId(nuevo.id);
    setIsEditing(true);
    await guardarEnNube(nuevo);
    notify.success("Manual Creado", "Empezá a documentar tu secreto industrial.");
  };

  const actualizarManual = (data: Partial<SOP>) => {
    if (!activeId) return;
    const actualizado = manuales.find(m => m.id === activeId);
    if (!actualizado) return;

    const nuevaVersion = { ...actualizado, ...data };
    setManuales(prev => prev.map(m => m.id === activeId ? nuevaVersion : m));
    
    // Guardado silencioso
    guardarEnNube(nuevaVersion);
  };

  const eliminarManual = async () => {
    if (!activeId) return;
    const confirm = await notify.confirm("¿Eliminar Manual?", `¿Estás seguro de borrar "${activeSOP?.titulo}"? Esta acción es irreversible.`);
    if (confirm) {
      const { error } = await supabase.from('manuales_sop').delete().eq('id', activeId);
      if (!error) {
        setManuales(manuales.filter(m => m.id !== activeId));
        setActiveId(null);
        notify.success("SOP Eliminado", "Removido del búnker digital.");
      }
    }
  };

  const handleImageUpload = (tipo: 'principal' | string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          let width = img.width;
          let height = img.height;
          if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const base64 = canvas.toDataURL('image/webp', 0.7);
          
          if (tipo === 'principal') {
            actualizarManual({ imagenPrincipal: base64 });
          } else {
            const nuevosPasos = activeSOP?.pasos.map(p => p.id === tipo ? { ...p, imagen: base64 } : p);
            if (nuevosPasos) actualizarManual({ pasos: nuevosPasos });
          }
        };
        img.src = evt.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadPart = async (ref: React.RefObject<HTMLDivElement | null>, partName: string) => {
    if (ref.current === null || !activeSOP) return;
    try {
      const dataUrl = await toPng(ref.current, { 
        quality: 1, 
        backgroundColor: '#ffffff',
        pixelRatio: 3,
        style: { margin: '0', padding: '0', transform: 'none' }
      });
      const link = document.createElement('a');
      link.download = `SOP-${activeSOP.titulo.toLowerCase().replace(/\s+/g, '-')}-${partName}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) { notify.error('Error al generar imagen'); }
  };

  const exportarManuales = () => {
    const blob = new Blob([JSON.stringify(manuales, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lingote_sops_backup.json`;
    a.click();
  };

  const importarManuales = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data: SOP[] = JSON.parse(evt.target?.result as string);
        const confirm = await notify.confirm("¿Importar Backup?", `Se cargarán ${data.length} manuales en la nube.`);
        if (!confirm) return;

        for (const sop of data) {
          await guardarEnNube(sop);
        }

        setManuales(data);
        if (data.length > 0) setActiveId(data[0].id);
        notify.success("SOPs Restaurados", "Todos tus manuales están seguros en la nube.");
      } catch (err) { notify.error('Error al importar'); }
    };
    reader.readAsText(file);
  };

  // --- VISTA PREVIA A4 (SEGMENTADA) ---
  if (showPreview && activeSOP) {
    return (
      <div className="min-h-screen bg-slate-100 p-4 md:p-12 animate-in zoom-in duration-300 text-left">
        <div className="max-w-4xl mx-auto space-y-12 text-slate-800">
          <div className="no-print flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-lingote-accent gap-4">
            <button onClick={() => setShowPreview(false)} className="px-6 py-2 bg-slate-100 text-slate-600 rounded-xl font-black uppercase text-xs hover:bg-slate-200 transition-all italic leading-none">Volver al Editor</button>
            <div className="flex flex-wrap justify-center gap-3">
              <button onClick={() => downloadPart(sopRef1, 'parte-1')} className="px-6 py-2 bg-lingote-gold text-white rounded-xl font-black shadow-lg flex items-center gap-2 hover:bg-amber-600 transition-all uppercase text-[10px] active:scale-95 leading-none italic"><Download size={14} /> P1: Bases</button>
              <button onClick={() => downloadPart(sopRef2, 'parte-2')} className="px-6 py-2 bg-slate-900 text-white rounded-xl font-black shadow-lg flex items-center gap-2 hover:bg-slate-800 transition-all uppercase text-[10px] active:scale-95 leading-none italic"><Download size={14} /> P2: Proceso</button>
            </div>
          </div>

          <div className="no-print w-full overflow-x-auto bg-slate-200/50 p-4 md:p-12 rounded-[2rem] shadow-inner flex justify-start md:justify-center">
            <div className="scale-[0.45] sm:scale-[0.6] md:scale-[0.8] lg:scale-100 origin-top shrink-0">
              <div className="mx-auto shadow-2xl rounded-sm border border-slate-200 overflow-hidden w-[210mm]">
                <div ref={sopRef1} className="bg-white w-[210mm] h-[297mm] font-sans overflow-hidden">
                   <div className="p-16 h-full flex flex-col">
                      <div className="flex justify-between items-start border-b-8 border-slate-900 pb-6 mb-8 gap-8">
                         <div className="flex-1 text-left text-slate-900">
                           <h1 className="text-4xl font-black tracking-tighter uppercase mb-2 leading-none">Manual de Operaciones Estándar (SOP)</h1>
                           <p className="text-2xl font-black text-lingote-gold uppercase leading-none italic">{activeSOP.titulo}</p>
                           <p className="text-[10px] font-black uppercase text-slate-400 mt-4 tracking-widest leading-none">Parte 1 de 2 • Ficha de Bases</p>
                         </div>
                         {activeSOP.imagenPrincipal && <img src={activeSOP.imagenPrincipal} alt="Master" className="w-40 h-40 object-cover rounded-3xl shadow-xl border-4 border-white shrink-0" />}
                      </div>
                      <div className="bg-amber-50 p-8 rounded-[2.5rem] border-2 border-amber-200 mb-12 text-left">
                         <h4 className="text-[10px] font-black uppercase text-amber-600 tracking-[0.3em] mb-3 leading-none text-slate-900 text-left">Objetivo Maestro del Proceso</h4>
                         <p className="text-xl font-bold text-amber-900 leading-tight italic uppercase font-black italic font-serif text-left">"{activeSOP.objetivo}"</p>
                      </div>
                      <div className="grid grid-cols-2 gap-12 mb-10 text-left">
                         <section className="text-left space-y-4">
                           <h4 className="text-xs font-black uppercase text-slate-400 tracking-[0.3em] border-b-2 border-slate-100 pb-2 leading-none text-left">1. Ingredientes Necesarios</h4>
                           <ul className="space-y-2">
                             {activeSOP.ingredientes.map(i => (
                               <li key={i.id} className="flex justify-between text-base border-b border-slate-50 pb-1 font-bold italic text-slate-800">
                                 <span className="uppercase text-slate-800">{i.nombre}</span>
                                 <span className="text-lingote-gold italic font-black">{i.cantidad}</span>
                               </li>
                             ))}
                           </ul>
                         </section>
                         <section className="text-left space-y-4">
                           <h4 className="text-xs font-black uppercase text-slate-400 tracking-[0.3em] border-b-2 border-slate-100 pb-2 leading-none text-left">2. Herramientas de Trabajo</h4>
                           <ul className="space-y-2">
                             {activeSOP.herramientas.map(h => (
                               <li key={h.id} className="flex gap-3 text-base border-b border-slate-50 pb-1 font-bold italic text-slate-800">
                                 <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" />
                                 <span className="uppercase text-slate-800">{h.nombre}</span>
                               </li>
                             ))}
                           </ul>
                         </section>
                      </div>
                      <div className="mt-auto pt-20 text-center text-slate-500">
                         <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 mb-8">
                            <p className="text-sm font-bold uppercase tracking-widest leading-none text-center">Este documento es propiedad de El Lingote Español</p>
                            <p className="text-[10px] text-slate-300 mt-2 uppercase font-black tracking-tighter text-center">Prohibida su reproducción sin autorización</p>
                         </div>
                         <p className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-200 italic font-serif text-center">El Lingote Español • PROPIETARY SOP • 2026</p>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>

          <div className="no-print w-full overflow-x-auto bg-slate-200/50 p-4 md:p-12 rounded-[2rem] shadow-inner flex justify-start md:justify-center">
            <div className="scale-[0.45] sm:scale-[0.6] md:scale-[0.8] lg:scale-100 origin-top shrink-0">
              <div className="mx-auto shadow-2xl rounded-sm border border-slate-200 overflow-hidden w-[210mm]">
                <div ref={sopRef2} className="bg-white w-[210mm] h-[297mm] font-sans overflow-hidden">
                   <div className="p-16 h-full flex flex-col">
                      <div className="flex justify-between items-center border-b-8 border-slate-900 pb-6 mb-10 gap-8 text-left text-left">
                         <div className="text-slate-900 text-left text-left">
                            <h1 className="text-3xl font-black tracking-tighter uppercase mb-1 leading-none text-left">Procedimiento de Cocina</h1>
                            <p className="text-xl font-black text-lingote-gold uppercase leading-none italic text-left">{activeSOP.titulo}</p>
                            <p className="text-[10px] font-black uppercase text-slate-400 mt-3 tracking-widest leading-none text-left">Parte 2 de 2 • Guía de Ejecución</p>
                         </div>
                         <img src="/logo_lingote_oficial_ligero.png" alt="Logo" className="w-16 h-16 object-contain opacity-20" />
                      </div>
                      <section className="flex-1 text-left text-left">
                         <div className="space-y-2 text-left">
                            {activeSOP.pasos.map((p, idx) => (
                              <div key={p.id} className={`p-4 rounded-2xl flex gap-6 items-start transition-colors ${p.esCritico ? 'bg-red-50 border-2 border-red-100 ring-1 ring-red-50' : 'bg-slate-50 border border-slate-100 shadow-sm'} text-left`}>
                                 <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-black text-sm shadow-md italic ${p.esCritico ? 'bg-red-600 text-white' : 'bg-slate-900 text-white'}`}>{idx + 1}</div>
                                 <div className="flex-1 space-y-1 text-left text-left">
                                    <div className="flex items-center gap-3 text-left">
                                      <h5 className="font-black uppercase text-sm leading-none text-slate-900 italic font-serif tracking-tighter text-left">{p.titulo}</h5>
                                      {p.esCritico && <span className="bg-red-600 text-white text-[6px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter leading-none">CRÍTICO</span>}
                                    </div>
                                    <p className="text-[11px] font-bold text-slate-600 leading-tight italic uppercase font-black italic text-left">{p.descripcion}</p>
                                 </div>
                                 {p.imagen && <img src={p.imagen} className="w-16 h-16 object-cover rounded-xl shadow-lg border border-white shrink-0" alt="Step" />}
                              </div>
                            ))}
                         </div>
                      </section>
                      <div className="mt-auto pt-12 text-center text-slate-200">
                         <p className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-200 italic font-serif leading-none text-center">El Lingote Español • PROPIETARY SOP • 2026</p>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in duration-700 pb-20 text-slate-800">
      <aside className="no-print w-full lg:w-72 shrink-0 space-y-4">
        <div className="bg-white p-6 rounded-[2.5rem] border border-lingote-accent shadow-sm text-left">
          <div className="flex items-center justify-between mb-8">
            <div className="text-left">
               <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400 pl-2 leading-none">Códice SOP</h3>
               <div className="flex items-center gap-1 pl-2 mt-1">
                  <Cloud size={8} className="text-lingote-gold" />
                  <span className="text-[7px] font-black text-lingote-gold uppercase tracking-widest">Nube Activa</span>
               </div>
            </div>
            <button onClick={crearNuevoManual} className="p-2 bg-lingote-gold text-white rounded-xl hover:scale-110 shadow-lg leading-none transition-all"><Plus size={18} /></button>
          </div>
          {loading ? (
             <div className="h-40 flex flex-col items-center justify-center text-slate-300 gap-3">
                <Loader2 className="animate-spin" size={32} />
                <p className="text-[8px] font-black uppercase tracking-widest">Descifrando Códice...</p>
             </div>
          ) : (
            <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto pb-4 lg:pb-0 scrollbar-hide text-slate-600 font-black uppercase text-[10px] italic">
              {manuales.length === 0 ? (
                <p className="text-[10px] text-slate-400 italic text-center py-6 w-full opacity-40 uppercase tracking-widest">Sin manuales</p>
              ) : (
                manuales.map(m => (
                  <button key={m.id} onClick={() => { setActiveId(m.id); setIsEditing(false); setShowPreview(false); }} className={`flex-none w-48 lg:w-full text-left px-5 py-4 rounded-2xl transition-all ${activeId === m.id ? 'bg-lingote-text text-white shadow-xl scale-[1.02]' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}><span className="truncate">{m.titulo}</span></button>
                ))
              )}
            </div>
          )}
          <div className="mt-6 pt-6 border-t border-slate-100 space-y-2">
             <button onClick={exportarManuales} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-lingote-accent text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-colors italic"><Download size={14} /> Backup</button>
             <label className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-lingote-accent text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 cursor-pointer transition-colors italic text-center leading-none"><Upload size={14} /> Cargar<input type="file" className="hidden" accept=".json" onChange={importarManuales} /></label>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 space-y-6 md:space-y-8">
        {!activeSOP ? (
          <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-lingote-accent opacity-30"><BookOpen size={64} className="mx-auto mb-4 text-slate-300" /><p className="font-black uppercase tracking-widest text-slate-300">Selecciona o crea un manual operativo</p></div>
        ) : (
          <div className="space-y-6 md:space-y-8 animate-in slide-in-from-right-4 duration-500 text-left">
            <div className="flex flex-col md:flex-row gap-4 no-print justify-between items-start md:items-center text-left">
               <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase text-slate-800 italic leading-none text-left">{activeSOP.titulo}</h2>
               <div className="flex gap-2 w-full md:w-auto font-black uppercase text-[10px] italic">
                  <button onClick={() => setIsEditing(!isEditing)} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl transition-all ${isEditing ? 'bg-lingote-text text-white shadow-lg' : 'bg-white border-2 border-slate-100 text-slate-400 hover:border-lingote-text hover:text-lingote-text shadow-sm'}`}>{isEditing ? <Eye size={16} /> : <Edit3 size={16} />} {isEditing ? 'Ver Guía' : 'Editar SOP'}</button>
                  <button onClick={() => setShowPreview(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl shadow-lg hover:bg-slate-800 italic"><FileText size={16} /> Previsualizar A4</button>
               </div>
            </div>
            {isEditing ? (
              <div className="bg-white p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] border border-lingote-accent shadow-xl space-y-10 md:space-y-12 text-left">
                <div className="flex flex-col xl:flex-row gap-8 md:gap-12 text-left">
                   <div className="flex-1 space-y-6 md:space-y-8 text-left">
                      <div className="text-left">
                        <label className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2 md:mb-3 pl-2 italic text-left">Título del Procedimiento</label>
                        <input className="text-2xl md:text-3xl font-black text-slate-800 w-full bg-slate-50 p-4 rounded-2xl md:rounded-3xl outline-none focus:ring-2 focus:ring-lingote-gold uppercase italic text-left" value={activeSOP.titulo} onChange={(e)=>actualizarManual({titulo: e.target.value})} />
                      </div>
                      <div className="text-left">
                        <label className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2 md:mb-3 pl-2 italic text-left">Objetivo Estándar</label>
                        <textarea className="text-lg md:text-xl font-bold text-slate-600 w-full bg-slate-50 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] outline-none focus:ring-2 focus:ring-lingote-gold h-32 italic leading-relaxed text-left" value={activeSOP.objetivo} onChange={(e)=>actualizarManual({objetivo: e.target.value})} />
                      </div>
                   </div>
                   <div className="w-full md:w-64 xl:w-72 mx-auto text-left">
                      <label className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-3 pl-2 italic text-center">Foto de Portada</label>
                      <div className="w-full aspect-square bg-slate-50 rounded-[2rem] md:rounded-[3rem] border-2 border-dashed border-lingote-accent relative overflow-hidden group shadow-inner flex items-center justify-center">
                         {activeSOP.imagenPrincipal ? <><img src={activeSOP.imagenPrincipal} className="w-full h-full object-cover" alt="Cover" /><button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"><Camera size={32} /></button></> : <button onClick={() => fileInputRef.current?.click()} className="text-slate-300 hover:text-lingote-gold transition-colors"><Plus size={48} /></button>}
                         <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e)=>handleImageUpload('principal', e)} />
                      </div>
                   </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 pt-8 border-t border-slate-100 italic text-left">
                   <div className="space-y-4 md:space-y-6 text-left">
                      <div className="flex justify-between items-center pr-2"><h4 className="font-black uppercase text-[10px] md:text-xs text-slate-400 tracking-widest">Ingredientes</h4><button onClick={()=>actualizarManual({ingredientes: [...activeSOP.ingredientes, {id: Date.now().toString(), nombre: '', cantidad: ''}]})} className="p-1.5 bg-lingote-gold text-white rounded-lg hover:scale-110 transition-transform"><Plus size={14} /></button></div>
                      <div className="space-y-2">
                         {activeSOP.ingredientes.map(ing => (
                           <div key={ing.id} className="flex gap-2 animate-in slide-in-from-left-2 duration-300"><input className="flex-1 bg-slate-50 p-2.5 rounded-lg text-xs md:text-sm font-bold outline-none uppercase italic text-left" placeholder="Nombre" value={ing.nombre} onChange={(e)=>{const nuevos = activeSOP.ingredientes.map(i => i.id === ing.id ? {...i, nombre: e.target.value} : i); actualizarManual({ingredientes: nuevos});}} /><input className="w-16 md:w-24 bg-slate-50 p-2.5 rounded-lg text-xs md:text-sm font-bold outline-none italic text-left" placeholder="Cant." value={ing.cantidad} onChange={(e)=>{const nuevos = activeSOP.ingredientes.map(i => i.id === ing.id ? {...i, cantidad: e.target.value} : i); actualizarManual({ingredientes: nuevos});}} /><button onClick={()=>{actualizarManual({ingredientes: activeSOP.ingredientes.filter(i => i.id !== ing.id)});}} className="p-2 text-slate-200 hover:text-red-500 rounded-lg transition-all"><Trash2 size={14} /></button></div>
                         ))}
                      </div>
                   </div>
                   <div className="space-y-4 md:space-y-6 italic text-left">
                      <div className="flex justify-between items-center pr-2"><h4 className="font-black uppercase text-[10px] md:text-xs text-slate-400 tracking-widest">Herramientas</h4><button onClick={()=>actualizarManual({herramientas: [...activeSOP.herramientas, {id: Date.now().toString(), nombre: '', cantidad: ''}]})} className="p-1.5 bg-slate-900 text-white rounded-lg hover:scale-110 transition-transform"><Plus size={14} /></button></div>
                      <div className="space-y-2">
                         {activeSOP.herramientas.map(her => (
                           <div key={her.id} className="flex gap-2 animate-in slide-in-from-right-2 duration-300 italic text-left"><input className="flex-1 bg-slate-50 p-2.5 rounded-lg text-xs md:text-sm font-bold outline-none uppercase italic text-left" placeholder="Herramienta" value={her.nombre} onChange={(e)=>{const nuevos = activeSOP.herramientas.map(h => h.id === her.id ? {...h, nombre: e.target.value} : h); actualizarManual({herramientas: nuevos});}} /><button onClick={()=>{actualizarManual({herramientas: activeSOP.herramientas.filter(h => h.id !== her.id)});}} className="p-2 text-slate-200 hover:text-red-500 rounded-lg transition-all"><Trash2 size={14} /></button></div>
                         ))}
                      </div>
                   </div>
                </div>
                <div className="pt-8 md:pt-12 border-t border-slate-100 space-y-6 md:space-y-8 italic text-left">
                   <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left"><h4 className="font-black uppercase text-[10px] md:text-xs text-slate-400 tracking-widest text-left">Procedimiento Detallado</h4><button onClick={()=>actualizarManual({pasos: [...activeSOP.pasos, {id: Date.now().toString(), titulo: 'Nuevo Paso', descripcion: '', esCritico: false}]})} className="w-full md:w-auto px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-[9px] md:text-[10px] uppercase flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg active:scale-95 italic leading-none"><Plus size={14} /> Añadir Paso</button></div>
                   <div className="space-y-4 md:space-y-6 text-left">
                      {activeSOP.pasos.map((p, idx) => (
                        <div key={p.id} className="bg-slate-50 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 flex flex-col md:flex-row gap-6 md:gap-8 animate-in slide-in-from-bottom-2 duration-400 italic text-left">
                           <div className="flex flex-row md:flex-col items-center justify-between md:justify-start gap-4 text-left"><div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-lg md:text-xl shadow-xl italic">{idx + 1}</div><button onClick={()=>{const nuevos = activeSOP.pasos.map(step => step.id === p.id ? {...step, esCritico: !step.esCritico} : step); actualizarManual({pasos: nuevos});}} className={`p-2.5 md:p-3 rounded-full transition-all ${p.esCritico ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 'bg-white text-slate-200 hover:text-red-400 shadow-sm'}`} title="Marcar como Punto Crítico"><AlertTriangle size={18} /></button></div>
                           <div className="flex-1 space-y-3 md:space-y-4 text-left text-left"><input className="text-lg md:text-xl font-black text-slate-800 w-full bg-white p-3 rounded-xl border border-slate-200 outline-none uppercase italic text-left" placeholder="Título..." value={p.titulo} onChange={(e)=>{const nuevos = activeSOP.pasos.map(step => step.id === p.id ? {...step, titulo: e.target.value} : step); actualizarManual({pasos: nuevos});}} /><textarea className="text-sm md:text-base font-bold text-slate-500 w-full bg-white p-4 md:p-5 rounded-xl md:rounded-2xl border border-slate-200 outline-none h-24 italic leading-relaxed text-left" placeholder="Detalle técnico..." value={p.descripcion} onChange={(e)=>{const nuevos = activeSOP.pasos.map(step => step.id === p.id ? {...step, descripcion: e.target.value} : step); actualizarManual({pasos: nuevos});}} /></div>
                           <div className="flex flex-row md:flex-col gap-3 justify-end md:justify-start text-left"><div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-xl md:rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center relative overflow-hidden group shadow-inner text-left">{p.imagen ? <><img src={p.imagen} className="w-full h-full object-cover" alt="Step" /><button onClick={() => {const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*'; input.onchange = (e) => handleImageUpload(p.id, e as any); input.click();}} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"><Camera size={18} /></button></> : <button onClick={() => {const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*'; input.onchange = (e) => handleImageUpload(p.id, e as any); input.click();}} className="text-slate-200 hover:text-lingote-gold transition-colors"><ImageIcon size={20} /></button>}</div><button onClick={()=>{actualizarManual({pasos: activeSOP.pasos.filter(step => step.id !== p.id)});}} className="p-2 text-slate-200 hover:text-red-500 transition-colors self-center"><Trash2 size={18} /></button></div>
                        </div>
                      ))}
                   </div>
                </div>
                <div className="pt-8 md:pt-10 border-t-4 border-lingote-accent flex flex-col md:flex-row justify-between items-center gap-6 italic text-left"><button onClick={eliminarManual} className="text-[10px] md:text-xs font-black uppercase text-red-300 hover:text-red-600 transition-colors tracking-widest italic">Eliminar Permanente</button><button onClick={()=>setIsEditing(false)} className="w-full md:w-auto px-10 md:px-12 py-4 md:py-5 bg-green-600 text-white rounded-2xl md:rounded-3xl font-black text-[10px] md:text-xs uppercase shadow-2xl shadow-green-100 hover:bg-green-700 active:scale-95 transition-all flex items-center justify-center gap-2 italic leading-none"><Save size={16} /> Guardar Manual</button></div>
              </div>
            ) : (
              <div className="bg-white p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] border border-lingote-accent shadow-xl space-y-8 md:space-y-10 text-left italic">
                 <div className="flex flex-col xl:flex-row gap-8 md:gap-10 items-start italic leading-none uppercase font-black text-left">
                    {activeSOP.imagenPrincipal && <img src={activeSOP.imagenPrincipal} className="w-full xl:w-64 h-64 md:h-80 xl:h-64 object-cover rounded-[2rem] md:rounded-[3rem] shadow-2xl border-4 border-white shrink-0 italic leading-none" alt="Master" />}
                    <div className="flex-1 space-y-6 italic leading-none uppercase font-black text-left">
                       <div className="bg-amber-50 p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-2 border-amber-100 italic leading-none text-left"><h4 className="text-[8px] md:text-[10px] font-black uppercase text-amber-600 tracking-widest mb-2 md:mb-3 pl-1 italic leading-none text-left">Objetivo</h4><p className="text-lg md:text-xl font-bold text-amber-900 leading-tight italic uppercase font-black leading-none text-left">"{activeSOP.objetivo}"</p></div>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 italic leading-none uppercase font-black text-left">
                          <div className="space-y-3 italic leading-none uppercase font-black text-left"><h4 className="text-[8px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1 italic leading-none text-left">Ingredientes</h4><div className="space-y-1.5 italic leading-none uppercase font-black text-left">{activeSOP.ingredientes.map(i => (<div key={i.id} className="flex justify-between border-b border-slate-50 pb-1 text-xs md:text-sm font-bold uppercase italic leading-none text-left"><span>{i.nombre}</span><span className="text-slate-400">{i.cantidad}</span></div>))}</div></div>
                          <div className="space-y-3 italic leading-none uppercase font-black text-left"><h4 className="text-[8px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1 italic leading-none text-left">Herramientas</h4><div className="space-y-1.5 italic leading-none uppercase font-black text-left">{activeSOP.herramientas.map(h => (<div key={h.id} className="flex items-center gap-2 border-b border-slate-50 pb-1 text-xs md:text-sm font-bold uppercase italic leading-none text-left"><CheckCircle2 size={14} className="text-green-500 opacity-30 italic leading-none" /> <span>{h.nombre}</span></div>))}</div></div>
                       </div>
                    </div>
                 </div>
                 <div className="space-y-6 md:space-y-8 pt-8 border-t border-slate-100 italic leading-none uppercase font-black text-left italic">
                    <h4 className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1 italic leading-none text-left">Instrucciones de Cocina</h4>
                    <div className="grid grid-cols-1 gap-4 md:gap-6 italic leading-none uppercase font-black text-left">
                       {activeSOP.pasos.map((p, idx) => (
                         <div key={p.id} className={`p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] flex flex-col md:flex-row gap-6 md:gap-8 transition-all ${p.esCritico ? 'bg-red-50/50 border-4 border-red-100 ring-4 ring-red-50' : 'bg-slate-50 border border-slate-100'} italic leading-none uppercase font-black text-left italic`}>
                            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center font-black text-xl md:text-2xl shadow-xl shrink-0 italic leading-none ${p.esCritico ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-900 text-white'}`}>{idx + 1}</div>
                            <div className="flex-1 space-y-3 italic leading-none uppercase font-black text-left text-left"><div className="flex items-center gap-4 italic leading-none uppercase font-black text-left"><h5 className="text-lg md:text-xl font-black text-slate-900 leading-none italic uppercase font-black italic text-left">{p.titulo}</h5>{p.esCritico && <span className="bg-red-600 text-white text-[8px] md:text-[10px] font-black px-2 md:px-3 py-1 rounded-full uppercase tracking-tighter leading-none text-left">Punto Crítico</span>}</div><p className="text-base md:text-lg font-bold text-slate-600 leading-relaxed italic uppercase font-black italic text-left">{p.descripcion}</p></div>
                            {p.imagen && <img src={p.imagen} className="w-full md:w-40 xl:w-48 h-48 md:h-40 xl:h-48 object-cover rounded-2xl md:rounded-[2rem] shadow-2xl border-4 border-white shrink-0 italic leading-none mx-auto md:mx-0" alt="Step" />}
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ManualesSOP;
