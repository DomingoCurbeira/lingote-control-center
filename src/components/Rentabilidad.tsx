import { useState, useEffect, useRef } from 'react';
import { 
  Calculator, Image as ImageIcon, 
  Plus, Trash2, Download, Save, CheckCircle2, X
} from 'lucide-react';
import { toPng } from 'html-to-image';

// --- INTERFACES ---
interface Ingrediente {
  id: string;
  nombre: string;
  precioCompra: number; 
  cantidadReceta: number; 
  merma: number; 
}

interface EscandalloCompleto {
  id: string;
  nombre: string;
  categoria: string;
  porciones: number;
  packaging: number;
  margenObjetivo: number;
  imagen?: string; 
  ingredientes: Ingrediente[];
}
interface GastosGlobales {
  alquiler: number;
  luz: number;
  agua: number;
  gas: number;
  internet: number;
  impuestos: number;
  seguros: number;
  salarioPropietario: number;
  metaVentasMensual: number;
}

const Rentabilidad = () => {
  // --- ESTADO ---
  const [recetas, setRecetas] = useState<EscandalloCompleto[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showFichaPreview, setShowFichaPreview] = useState(false);
  const [showConfigGastos, setShowConfigGastos] = useState(false);
  const [gastos, setGastos] = useState<GastosGlobales>({
    alquiler: 520000,
    luz: 80000,
    agua: 20000,
    gas: 25000,
    internet: 30000,
    impuestos: 15000,
    seguros: 5000,
    salarioPropietario: 400000,
    metaVentasMensual: 800
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const fichaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('lingote_escandallos');
    const savedGastos = localStorage.getItem('lingote_gastos_globales');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setRecetas(parsed);
        if (parsed.length > 0) setActiveId(parsed[0].id);
      } catch (e) { console.error("Error data"); }
    }
    if (savedGastos) {
      try { setGastos(JSON.parse(savedGastos)); } catch (e) { console.error("Error expenses"); }
    }
  }, []);

  useEffect(() => {
    if (recetas.length > 0) localStorage.setItem('lingote_escandallos', JSON.stringify(recetas));
    localStorage.setItem('lingote_gastos_globales', JSON.stringify(gastos));
  }, [recetas, gastos]);

  const activeReceta = recetas.find(r => r.id === activeId) || null;

  const totalGastosFijos = gastos.alquiler + gastos.luz + gastos.agua + gastos.gas + gastos.internet + gastos.impuestos + gastos.seguros + gastos.salarioPropietario;
  const cuotaOperativaPorUnidad = totalGastosFijos / Math.max(1, gastos.metaVentasMensual);

  const crearNuevaReceta = () => {
    const nueva: EscandalloCompleto = {
      id: Date.now().toString(),
      nombre: 'NUEVO PRODUCTO',
      categoria: 'lingotes',
      porciones: 1,
      packaging: 0,
      margenObjetivo: 65,
      ingredientes: [{ id: '1', nombre: 'Insumo 1', precioCompra: 0, cantidadReceta: 0, merma: 0 }]
    };
    setRecetas(prev => [...prev, nueva]);
    setActiveId(nueva.id);
    setShowFichaPreview(false);
  };

  const actualizarReceta = (data: Partial<EscandalloCompleto>) => {
    if (!activeId) return;
    setRecetas(prev => prev.map(r => r.id === activeId ? { ...r, ...data } : r));
  };

  const updateIngrediente = (ingId: string, data: Partial<Ingrediente>) => {
    if (!activeReceta) return;
    const nuevos = activeReceta.ingredientes.map(i => i.id === ingId ? { ...i, ...data } : i);
    actualizarReceta({ ingredientes: nuevos });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
          actualizarReceta({ imagen: canvas.toDataURL('image/webp', 0.8) });
        };
        img.src = evt.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const calcularCostoIngrediente = (ing: Ingrediente) => {
    const costoBase = (ing.cantidadReceta / 1000) * ing.precioCompra;
    const factorMerma = ing.merma >= 100 ? 1 : 1 / (1 - (ing.merma / 100));
    return costoBase * factorMerma;
  };

  const costoInsumosTotal = activeReceta?.ingredientes.reduce((sum, ing) => sum + calcularCostoIngrediente(ing), 0) || 0;
  const costoBatchInsumos = costoInsumosTotal + (activeReceta?.packaging || 0);
  const costoBatchTotalReal = costoBatchInsumos + (cuotaOperativaPorUnidad * (activeReceta?.porciones || 1));
  const costoPorPorcion = costoBatchTotalReal / (activeReceta?.porciones || 1);
  const divisorMargen = (100 - (activeReceta?.margenObjetivo || 65)) / 100;

  const pvpSugerido = divisorMargen > 0 ? (costoPorPorcion / divisorMargen) : 0;
  const gananciaNetaUnidad = pvpSugerido - costoPorPorcion;

  const exportarDatos = () => {
    const backup = { recetas, gastos };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `lingote_backup.json`; a.click();
  };

  const importarDatos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target?.result as string);
        if (data.recetas) setRecetas(data.recetas);
        if (data.gastos) setGastos(data.gastos);
        alert('✅ Cargado');
      } catch (err) { alert('❌ Error'); }
    };
    reader.readAsText(file);
  };

  const downloadFichaImage = async () => {
    if (fichaRef.current === null || !activeReceta) return;
    try {
      const dataUrl = await toPng(fichaRef.current, { 
        quality: 1, backgroundColor: '#ffffff', pixelRatio: 3,
        style: { margin: '0', transform: 'none' }
      });
      const link = document.createElement('a');
      link.download = `ficha-rentabilidad-${activeReceta.nombre.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = dataUrl; link.click();
    } catch (err) { alert('Error imagen'); }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 animate-in fade-in duration-700 pb-20 text-slate-800 w-full max-w-full overflow-x-hidden box-border px-1 md:px-0">
      
      {/* 1. SELECTOR (Oculto en previsualización móvil) */}
      {!showFichaPreview && (
        <aside className="no-print w-full lg:w-72 shrink-0 space-y-4 max-w-full overflow-hidden">
          <div className="bg-white p-3 md:p-5 rounded-[1.5rem] border border-lingote-accent shadow-sm text-left">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 leading-none">Recetas</h3>
              <button onClick={crearNuevaReceta} className="p-1.5 bg-lingote-gold text-white rounded-lg hover:scale-110 shadow-md transition-transform"><Plus size={14} /></button>
            </div>
            <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto pb-2 lg:pb-0 scrollbar-hide text-slate-600 font-bold uppercase text-[9px]">
              {recetas.map(r => (
                <button key={r.id} onClick={() => { setActiveId(r.id); setShowFichaPreview(false); setShowConfigGastos(false); }} className={`flex-none w-32 lg:w-full text-left px-3 py-2 rounded-xl transition-all ${activeId === r.id && !showConfigGastos && !showFichaPreview ? 'bg-lingote-text text-white shadow-xl' : 'bg-slate-50 text-slate-500'}`}><span className="truncate">{r.nombre}</span></button>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
               <button onClick={() => { setShowConfigGastos(!showConfigGastos); setShowFichaPreview(false); }} className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${showConfigGastos ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-600'}`}><Calculator size={14} /> Gastos Globales</button>
               <div className="grid grid-cols-2 gap-2">
                 <button onClick={exportarDatos} className="w-full py-2 rounded-xl border border-lingote-accent text-[9px] font-black uppercase tracking-widest text-slate-400">Backup</button>
                 <label className="w-full py-2 rounded-xl border border-lingote-accent text-[9px] font-black uppercase tracking-widest text-slate-400 cursor-pointer text-center">Cargar<input type="file" className="hidden" accept=".json" onChange={importarDatos} /></label>
               </div>
            </div>
          </div>
        </aside>
      )}

      {/* 2. CONTENIDO PRINCIPAL */}
      <main className="flex-1 w-full max-w-full min-w-0 overflow-hidden space-y-4 md:space-y-8 box-border">
        
        {showFichaPreview && activeReceta ? (
          /* VISTA PREVIA (Idéntica lógica a B2B) */
          <div className="space-y-4 md:space-y-6 w-full max-w-full overflow-hidden">
            <div className="no-print flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-lingote-accent mx-1">
              <button onClick={() => setShowFichaPreview(false)} className="px-6 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold uppercase text-xs italic">Volver</button>
              <div className="flex gap-2">
                <button onClick={downloadFichaImage} className="px-4 py-2 bg-lingote-gold text-white rounded-xl font-black shadow-lg flex items-center gap-2 text-[10px] uppercase italic"><Download size={14} /> Imagen</button>
              </div>
            </div>

            <div className="no-print w-full bg-slate-200/50 py-12 md:p-16 rounded-[1.5rem] lg:rounded-[3rem] shadow-inner flex justify-center items-center min-h-[500px] overflow-hidden">
              <div className="scale-container-rent shrink-0 flex justify-center">
                <div className="scale-[0.38] min-[400px]:scale-[0.42] min-[450px]:scale-[0.48] sm:scale-[0.6] md:scale-[0.8] lg:scale-100 origin-center shrink-0">
                  <div ref={fichaRef} id="ficha-tecnica-print" className="bg-white p-12 text-slate-900 shadow-2xl rounded-sm border border-slate-200 min-h-[297mm] w-[210mm] flex flex-col print:p-8">
                     <div className="flex justify-between items-start border-b-4 border-slate-900 pb-6 mb-6 print:pb-2">
                        <div className="flex-1 text-left">
                          <h1 className="text-3xl font-black tracking-tighter uppercase mb-1 text-left">Ficha Técnica de Producción</h1>
                          <p className="text-2xl font-bold text-slate-500 uppercase leading-none text-left">{activeReceta.nombre}</p>
                          <div className="flex items-center gap-2 mt-4 text-green-600 font-bold bg-green-50 px-4 py-2 rounded-full w-fit border border-green-100 print:text-[8px]">
                             <CheckCircle2 size={18} /><span className="uppercase text-xs tracking-widest">Rentabilidad {activeReceta.margenObjetivo}%</span>
                          </div>
                        </div>
                        {activeReceta.imagen && <img src={activeReceta.imagen} alt="Product" className="w-48 h-48 object-cover rounded-[2rem] shadow-xl border-4 border-white shrink-0 print:w-20 print:h-20" />}
                     </div>
                     <div className="grid grid-cols-2 gap-12 print:gap-8">
                        <section className="space-y-8 text-left">
                          <div>
                            <h4 className="text-xs font-black uppercase text-slate-400 tracking-[0.3em] mb-4 border-b border-slate-100 pb-2 print:text-[8px]">Costos (Batch)</h4>
                            <table className="w-full text-base print:text-[9px]">
                              <tbody className="divide-y divide-slate-100 font-bold text-slate-600 uppercase">
                                <tr><td className="py-3 text-left">Materia Prima</td><td className="py-3 text-right font-black text-slate-800">₡{Math.round(costoInsumosTotal).toLocaleString()}</td></tr>
                                <tr><td className="py-3 text-left">Packaging</td><td className="py-3 text-right font-black text-slate-800">₡{activeReceta.packaging.toLocaleString()}</td></tr>
                                <tr><td className="py-3 italic text-slate-400 text-left">Cuota Op.</td><td className="py-3 text-right text-slate-400 font-black">₡{Math.round(cuotaOperativaPorUnidad * activeReceta.porciones).toLocaleString()}</td></tr>
                                <tr className="border-t-2 border-slate-900 pt-2"><td className="py-4 text-xl font-black uppercase text-slate-900 print:text-xs">Total Lote</td><td className="py-4 text-right text-3xl font-black text-slate-900 italic print:text-sm">₡{Math.round(costoBatchTotalReal).toLocaleString()}</td></tr>
                              </tbody>
                            </table>
                          </div>
                          <div className="bg-slate-50 p-8 rounded-[2rem] text-center border border-slate-100">
                             <span className="text-[10px] font-black uppercase text-slate-400 block mb-2">PVP Sugerido x Porción</span>
                             <span className="text-5xl font-black text-slate-900 tracking-tighter block leading-none">₡{Math.round(pvpSugerido).toLocaleString()}</span>
                             <div className="pt-4 border-t border-slate-200 flex justify-between items-center px-4">
                                <span className="text-[10px] font-black uppercase text-slate-400">Utilidad neta</span>
                                <span className="text-xl font-bold text-green-600">+ ₡{Math.round(gananciaNetaUnidad).toLocaleString()}</span>
                             </div>
                          </div>
                        </section>
                        <section className="space-y-6 text-left font-bold uppercase">
                          <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] border-b border-slate-100 pb-2 print:text-[8px]">Ingredientes Receta</h4>
                          <div className="space-y-2">
                            {activeReceta.ingredientes.map(ing => (
                              <div key={ing.id} className="flex justify-between items-center text-sm border-b border-slate-50 pb-2 print:text-[8px] leading-none">
                                 <div className="flex-1 min-w-0 pr-4 text-left leading-tight"><p className="truncate text-slate-800">{ing.nombre}</p><p className="text-[10px] text-slate-400 font-medium lowercase">{ing.cantidadReceta}g | {ing.merma}% merma</p></div>
                                 <p className="font-black text-slate-600 tracking-tighter shrink-0">₡{Math.round(calcularCostoIngrediente(ing)).toLocaleString()}</p>
                              </div>
                            ))}
                          </div>
                        </section>
                     </div>
                     <div className="mt-auto pt-20 text-center text-[10px] font-bold text-slate-300 uppercase tracking-[0.5em] print:text-[6px]">El Lingote Español • PROPIETARY INFORMATION • 2026</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : showConfigGastos ? (
          /* CONFIGURACIÓN GASTOS */
          <div className="bg-white p-4 md:p-10 rounded-[2rem] border border-lingote-accent shadow-2xl animate-in slide-in-from-top-4 duration-500 mx-1">
             <div className="flex justify-between items-center mb-6 text-left leading-none">
                <div><h2 className="text-xl md:text-3xl font-black text-slate-800 uppercase leading-none mb-1 text-left">Gastos Operativos</h2><p className="text-slate-400 text-[8px] md:text-xs font-bold uppercase tracking-widest text-left">Mensual</p></div>
                <button onClick={() => setShowConfigGastos(false)} className="p-1.5 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100 transition-colors shadow-sm"><X size={18} /></button>
             </div>

             {/* RESUMEN DE GASTOS TOTALES */}
             <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900 p-6 rounded-[2rem] text-white shadow-xl flex flex-col justify-center">
                   <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1 italic">Total Gastos Fijos</p>
                   <h3 className="text-3xl font-black tracking-tighter text-lingote-gold leading-none italic">₡{totalGastosFijos.toLocaleString()}</h3>
                </div>
                <div className="bg-lingote-gold/10 p-6 rounded-[2rem] border border-lingote-gold/20 flex flex-col justify-center text-left">
                   <p className="text-lingote-gold text-[10px] font-black uppercase tracking-widest mb-1 italic">Cuota de Alquiler/Sueldo por Lingote</p>
                   <h3 className="text-3xl font-black tracking-tighter text-slate-800 leading-none italic">₡{Math.round(cuotaOperativaPorUnidad).toLocaleString()} <span className="text-xs font-bold text-slate-400">/ unidad</span></h3>
                </div>
             </div>

             <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6 text-slate-700 font-bold text-left leading-none">
                {Object.entries(gastos).filter(([k]) => k !== 'metaVentasMensual').map(([key, val]) => (
                  <div key={key} className="bg-slate-50 p-3 md:p-6 rounded-xl border border-slate-100 group hover:border-lingote-gold/30 transition-all hover:bg-white">
                    <label className="text-[7px] md:text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest text-left">{key}</label>
                    <div className="flex items-center gap-1 text-base md:text-2xl font-black text-slate-700 leading-none">
                      <span className="text-slate-300 italic text-xs md:text-lg">₡</span>
                      <input type="number" className="w-full bg-transparent outline-none uppercase font-black italic tracking-tighter" value={val} onChange={(e)=>setGastos({...gastos, [key]: Number(e.target.value)})} />
                    </div>
                  </div>
                ))}
             </div>
             <div className="mt-6 bg-amber-900 p-4 md:p-10 rounded-2xl text-white relative overflow-hidden flex flex-col xl:flex-row items-center justify-between gap-6 border-4 border-amber-800 shadow-2xl text-left leading-none">
                <div className="flex-1 w-full text-center md:text-left relative z-10 leading-none">
                   <p className="text-amber-200/50 text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-left">Meta de Ventas</p>
                   <input type="range" min="100" max="3000" step="50" className="w-full h-3 bg-amber-800 rounded-lg appearance-none cursor-pointer accent-lingote-gold" value={gastos.metaVentasMensual} onChange={(e)=>setGastos({...gastos, metaVentasMensual: Number(e.target.value)})} />
                   <div className="flex justify-between text-[9px] font-bold text-amber-200/30 mt-3 uppercase tracking-[0.2em]"><span>100 Unid.</span><span>3,000 Unid.</span></div>
                </div>
                <div className="bg-white/10 p-5 rounded-[1.5rem] border border-white/10 text-center min-w-[120px] md:min-w-[150px] backdrop-blur-xl relative z-10 shadow-2xl leading-none">
                   <p className="text-3xl md:text-7xl font-black text-white tracking-tighter italic">{gastos.metaVentasMensual}</p>
                   <p className="text-[8px] font-black uppercase text-lingote-gold tracking-widest mt-2">Unid / Mes</p>
                </div>
             </div>
          </div>
        ) : !activeReceta ? (
          <div className="bg-white rounded-[2rem] p-12 text-center border-2 border-dashed border-lingote-accent opacity-30 w-full"><Calculator size={48} className="mx-auto mb-4 text-slate-300" /><p className="font-black uppercase tracking-widest text-slate-300 text-xs">Selecciona una receta</p></div>
        ) : (
          /* EDITOR DE RECETA */
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2 no-print text-slate-700 text-left leading-none uppercase font-black w-full px-1">
               <div className="bg-slate-900 p-4 md:p-8 rounded-xl md:rounded-[2rem] text-white shadow-xl border border-white/5 leading-none">
                  <p className="text-white/40 text-[8px] md:text-[10px] font-black uppercase tracking-widest mb-1 italic text-left">Costo Neto</p>
                  <p className="text-2xl md:text-4xl font-black text-lingote-gold tracking-tight italic">₡{Math.round(costoPorPorcion).toLocaleString()}</p>
               </div>
               <div className="bg-white p-4 md:p-8 rounded-xl md:rounded-[2rem] border border-lingote-accent shadow-sm leading-none">
                  <p className="text-slate-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest mb-1 text-left">PVP Sugerido</p>
                  <p className="text-2xl md:text-4xl font-black text-green-600 tracking-tighter italic">₡{Math.round(pvpSugerido).toLocaleString()}</p>
               </div>
               <div className="bg-white p-4 md:p-8 rounded-xl md:rounded-[2rem] border border-lingote-accent shadow-sm leading-none">
                  <p className="text-slate-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest mb-1 text-left">Utilidad</p>
                  <p className="text-2xl md:text-4xl font-black text-slate-800 tracking-tighter italic">₡{Math.round(gananciaNetaUnidad).toLocaleString()}</p>
               </div>
               <div className="bg-white p-4 md:p-8 rounded-xl md:rounded-[2rem] border border-lingote-accent shadow-sm flex flex-col items-center justify-center leading-none">
                  <p className="text-[8px] font-black text-slate-400 uppercase leading-none mb-1 tracking-widest">Rinde</p>
                  <p className="text-3xl md:text-5xl font-black text-lingote-text tracking-tighter italic">{activeReceta.porciones}</p>
               </div>
            </div>

            <div className="bg-white p-3 md:p-12 rounded-xl md:rounded-[3rem] border border-lingote-accent shadow-xl no-print text-slate-800 font-bold uppercase text-xs leading-none w-full box-border overflow-hidden mx-1">
              <div className="flex flex-col xl:flex-row gap-6 md:gap-12 mb-6 md:mb-12 w-full items-center xl:items-start">
                <div className="w-24 h-24 md:w-48 md:h-48 shrink-0">
                   <div className="w-48 h-48 bg-slate-50 rounded-xl md:rounded-[3.5rem] border-2 border-dashed border-lingote-accent relative overflow-hidden group shadow-inner flex items-center justify-center">
                      {activeReceta.imagen ? (
                        <>
                          <img src={activeReceta.imagen} className="w-48 h-48 object-cover" alt="Preview" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                             <button onClick={() => fileInputRef.current?.click()} className="p-1.5 bg-white rounded-full text-slate-900 shadow-2xl scale-90 hover:scale-100 transition-transform"><ImageIcon size={16} /></button>
                          </div>
                        </>
                      ) : (
                        <button onClick={() => fileInputRef.current?.click()} className="w-full h-full flex flex-col items-center justify-center gap-1 text-slate-300 hover:text-lingote-gold transition-colors font-black italic">
                           <Plus size={18} /><span className="text-[7px] font-black uppercase text-center">Subir</span>
                        </button>
                      )}
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                   </div>
                </div>

                <div className="flex-1 space-y-4 md:space-y-6 text-left leading-none font-black italic w-full">
                  <div className="w-full">
                    <label className="text-[8px] md:text-[10px] font-black uppercase text-slate-400 block tracking-widest mb-1 text-left">Nombre Receta</label>
                    <input className="text-base md:text-4xl font-black text-slate-800 w-full bg-slate-50 p-2.5 md:p-0 md:bg-transparent rounded-lg outline-none border-b-2 border-transparent focus:border-lingote-gold uppercase tracking-tighter" value={activeReceta.nombre} onChange={(e) => actualizarReceta({ nombre: e.target.value })} />
                  </div>
                  <div className="flex flex-col sm:grid sm:grid-cols-3 gap-2 md:gap-6 w-full">
                    <div className="bg-slate-50 p-3 rounded-lg md:rounded-[2rem] border border-slate-100 shadow-inner text-slate-700 flex justify-between items-center sm:block">
                      <label className="text-[8px] md:text-[10px] font-black uppercase text-lingote-gold block mb-1 tracking-widest text-left">Rinde</label>
                      <input type="number" min="1" className="w-20 sm:w-full bg-transparent font-black text-base md:text-3xl outline-none italic uppercase text-right sm:text-left" value={activeReceta.porciones} onChange={(e)=>actualizarReceta({ porciones: Math.max(1, Number(e.target.value)) })} />
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg md:rounded-[2rem] border border-slate-100 shadow-inner text-slate-700 flex justify-between items-center sm:block">
                      <label className="text-[8px] md:text-[10px] font-black uppercase text-slate-400 block mb-1 tracking-widest text-left">Empaque</label>
                      <input type="number" className="w-20 sm:w-full bg-transparent font-black text-base md:text-3xl outline-none italic uppercase text-right sm:text-left" value={activeReceta.packaging} onChange={(e)=>actualizarReceta({ packaging: Number(e.target.value) })} />
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg md:rounded-[2rem] border border-green-100 shadow-inner text-green-600 flex justify-between items-center sm:block">
                      <label className="text-[8px] md:text-[10px] font-black uppercase text-green-600 block mb-1 tracking-widest text-left">% Margen</label>
                      <input type="number" className="w-20 sm:w-full bg-transparent font-black text-base md:text-3xl outline-none italic uppercase text-right sm:text-left" value={activeReceta.margenObjetivo} onChange={(e)=>actualizarReceta({ margenObjetivo: Number(e.target.value) })} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 w-full">
                <div className="md:hidden space-y-2">
                  <h4 className="font-black uppercase text-[8px] text-slate-300 tracking-widest pl-2 italic text-left">Insumos</h4>
                  {activeReceta.ingredientes.map((ing) => (
                    <div key={ing.id} className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300 w-full box-border">
                      <div className="flex justify-between items-center gap-2">
                        <input className="flex-1 bg-transparent font-black text-slate-800 outline-none text-[13px] uppercase italic" value={ing.nombre} onChange={(e) => updateIngrediente(ing.id, { nombre: e.target.value })} placeholder="Insumo" />
                        <button onClick={() => actualizarReceta({ ingredientes: activeReceta.ingredientes.filter(i => i.id !== ing.id) })} className="p-1 text-slate-200 hover:text-red-500"><Trash2 size={16} /></button>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="bg-white p-2.5 rounded-lg border border-slate-100 flex justify-between items-center">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-tighter text-left">Precio Kilo</label>
                          <div className="flex items-center gap-1 font-black text-slate-600 text-base italic">
                            <span className="font-serif">₡</span>
                            <input type="number" className="w-20 bg-transparent text-right outline-none font-black" value={ing.precioCompra} onChange={(e) => updateIngrediente(ing.id, { precioCompra: Number(e.target.value) })} />
                          </div>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-slate-100 flex justify-between items-center">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-tighter text-left">Cant. (g)</label>
                          <input type="number" className="w-20 bg-transparent font-black text-slate-600 text-base text-right outline-none italic" value={ing.cantidadReceta} onChange={(e) => updateIngrediente(ing.id, { cantidadReceta: Number(e.target.value) })} />
                        </div>
                        <div className="flex justify-between items-center px-1">
                           <div className="flex items-center gap-1">
                             <label className="text-[7px] font-black text-slate-400 uppercase italic text-left">Merma:</label>
                             <div className="flex items-center bg-white border border-slate-100 rounded-lg px-2 py-1 shadow-sm">
                               <input type="number" min="0" max="99" className="w-8 bg-transparent font-black text-slate-400 text-center text-[10px] outline-none" value={ing.merma} onChange={(e) => updateIngrediente(ing.id, { merma: Math.max(0, Math.min(99, Number(e.target.value))) })} />
                               <span className="text-[7px] text-slate-300">%</span>
                             </div>
                           </div>
                           <div className="text-right leading-none">
                             <p className="text-[6px] font-black text-slate-400 uppercase mb-1">Costo Real</p>
                             <p className="text-[15px] font-black text-slate-900 italic font-serif tracking-tighter">₡{Math.round(calcularCostoIngrediente(ing)).toLocaleString()}</p>
                           </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="hidden md:block overflow-x-auto rounded-[2rem] border border-slate-50 shadow-inner">
                  <table className="w-full min-w-[700px] text-slate-700 uppercase font-black italic">
                    <thead><tr className="text-[11px] font-black uppercase text-slate-300 border-b border-slate-100 text-left tracking-widest"><th className="pb-5 pl-6 text-left font-black uppercase">Insumo / Ingrediente</th><th className="pb-5 text-left font-black uppercase">P. Kilo/Litro</th><th className="pb-5 text-center font-black uppercase">Cant. Receta (g/ml)</th><th className="pb-5 text-center font-black uppercase">% Merma</th><th className="pb-5 text-right font-black uppercase">Subtotal</th><th className="pb-5 text-right pr-6 font-black uppercase"></th></tr></thead>
                    <tbody className="divide-y divide-slate-50 text-sm font-bold text-slate-700">
                      {activeReceta.ingredientes.map((ing) => (
                        <tr key={ing.id} className="group hover:bg-slate-50/80 transition-colors">
                          <td className="py-6 pl-6 text-left"><input className="w-full bg-transparent font-black text-slate-700 outline-none uppercase tracking-tight" value={ing.nombre} onChange={(e) => updateIngrediente(ing.id, { nombre: e.target.value })} /></td>
                          <td className="py-6 font-bold text-slate-400 italic text-left tracking-widest font-serif">₡<input type="number" className="w-24 bg-transparent outline-none font-black text-slate-600 text-lg italic tracking-tighter" value={ing.precioCompra} onChange={(e) => updateIngrediente(ing.id, { precioCompra: Number(e.target.value) })} /></td>
                          <td className="py-6 text-center font-black text-base text-slate-600"><input type="number" className="w-20 bg-transparent outline-none text-center font-black" value={ing.cantidadReceta} onChange={(e) => updateIngrediente(ing.id, { cantidadReceta: Number(e.target.value) })} /></td>
                          <td className="py-6 text-center font-bold text-slate-300">
                             <div className="flex items-center justify-center bg-white border border-slate-100 rounded-lg px-2 py-1 shadow-sm w-fit mx-auto">
                               <input type="number" min="0" max="99" className="w-10 bg-transparent font-black text-slate-400 text-center text-sm outline-none" value={ing.merma} onChange={(e) => updateIngrediente(ing.id, { merma: Math.max(0, Math.min(99, Number(e.target.value))) })} />
                               <span className="text-[10px] text-slate-300">%</span>
                             </div>
                          </td>
                          <td className="py-6 text-right font-black text-slate-800 tracking-tighter text-2xl italic font-serif">₡{Math.round(calcularCostoIngrediente(ing)).toLocaleString()}</td>
                          <td className="py-6 text-right pr-6 text-slate-200 group-hover:text-red-500 transition-colors"><button onClick={() => actualizarReceta({ ingredientes: activeReceta.ingredientes.filter(i => i.id !== ing.id) })} className="p-2.5 hover:bg-red-50 rounded-xl transition-all shadow-sm"><Trash2 size={20} /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <button onClick={() => actualizarReceta({ ingredientes: [...activeReceta.ingredientes, { id: Date.now().toString(), nombre: '', precioCompra: 0, cantidadReceta: 0, merma: 0 }] })} className="mt-6 md:mt-10 flex items-center gap-2 md:gap-3 px-6 md:px-8 py-3 md:py-4 bg-white border-2 border-slate-100 rounded-xl md:rounded-2xl text-[9px] md:text-[11px] font-black uppercase text-lingote-gold hover:border-lingote-gold transition-all shadow-sm active:scale-95 italic"><Plus size={14} /> Insumo</button>
              <div className="mt-8 md:mt-16 pt-6 md:pt-10 border-t border-lingote-accent flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8 text-slate-600 font-black italic w-full">
                <button onClick={() => { if(window.confirm('¿Eliminar?')) { setRecetas(recetas.filter(r => r.id !== activeId)); setActiveId(null); } }} className="text-[9px] md:text-[11px] font-black uppercase text-red-300 hover:text-red-500 transition-all tracking-[0.1em]">Eliminar Receta</button>
                <div className="flex gap-2 md:gap-4 w-full md:w-auto">
                  <button onClick={() => setShowFichaPreview(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-12 py-3.5 md:py-5 bg-slate-100 text-slate-600 rounded-xl md:rounded-[1.5rem] font-black text-[10px] md:text-xs uppercase hover:bg-slate-200 transition-all shadow-sm italic">Previsualizar</button>
                  <button onClick={()=>{}} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-12 py-3.5 md:py-5 bg-green-600 text-white rounded-xl md:rounded-[1.5rem] font-black text-[10px] md:text-xs uppercase shadow-2xl shadow-green-100 hover:bg-green-700 active:scale-95 transition-all italic"><Save size={16} /> Guardar</button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <style>{`
        .scale-container-rent {
          width: calc(210mm * 0.38);
          height: calc(297mm * 0.38 + 60px);
          display: flex;
          justify-content: center;
          align-items: center;
        }
        @media (min-width: 400px) {
          .scale-container-rent { width: calc(210mm * 0.42); height: calc(297mm * 0.42 + 60px); }
        }
        @media (min-width: 450px) {
          .scale-container-rent { width: calc(210mm * 0.48); height: calc(297mm * 0.48 + 60px); }
        }
        @media (min-width: 640px) {
          .scale-container-rent { width: calc(210mm * 0.6); height: calc(297mm * 0.6 + 60px); }
        }
        @media (min-width: 768px) {
          .scale-container-rent { width: calc(210mm * 0.8); height: calc(297mm * 0.8 + 60px); }
        }
        @media (min-width: 1024px) {
          .scale-container-rent { width: 210mm; height: calc(297mm + 60px); }
        }
        @media print {
          html, body { height: 100vh; margin: 0 !important; padding: 0 !important; overflow: hidden !important; background: white !important; }
          #root { display: none !important; }
          .no-print, aside, header, nav, button, .kpis, main > div:not(#ficha-tecnica-print) { display: none !important; }
          #ficha-tecnica-print { 
            display: flex !important; position: fixed !important; top: 0 !important; left: 0 !important; 
            width: 210mm !important; height: 297mm !important; margin: 0 !important; padding: 20mm !important; 
            border: none !important; box-shadow: none !important; z-index: 999999 !important; background: white !important; 
            transform: scale(1) !important; visibility: visible !important; flex-direction: column; font-family: sans-serif;
          }
          @page { size: A4; margin: 0; }
        }
      `}</style>
    </div>
  );
};

export default Rentabilidad;
