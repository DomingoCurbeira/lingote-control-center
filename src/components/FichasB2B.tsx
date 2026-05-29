import { useState, useEffect, useRef } from 'react';
import { FileText, ChevronRight, ShieldCheck, Clock, Download, Image as ImageIcon } from 'lucide-react';
import { INFO_FABRICANTE } from '../data/masterDatabase';
import { toPng } from 'html-to-image';
import { supabase } from '../lib/supabase';

interface Ingrediente {
  id: string;
  nombre: string;
  cantidadReceta: number;
}

interface Nutricion {
  calorias: number;
  grasaTotal: number;
  grasaSaturada: number;
  grasasTrans: number;
  colesterol: number;
  carbohidratos: number;
  azucares: number;
  fibraDietetica: number;
  proteina: number;
  sodio: number;
}

interface EscandalloCompleto {
  id: string;
  nombre: string;
  categoria: string;
  imagen?: string;
  ingredientes: Ingrediente[];
  porciones: number;
  margenObjetivo: number;
  nutricion?: Nutricion;
  // Nuevos campos para el estándar 10/10
  denominacion?: string;
  descripcion?: string;
  alergenos?: string;
  vidaUtil?: string;
  conservacion?: string;
  instrucciones?: string;
  registroSanitario?: string;
  pesoNeto?: string;
}

const FichasB2B = () => {
  const [recetas, setRecetas] = useState<EscandalloCompleto[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [lote, setLote] = useState('L-001');
  const [fechaProduccion, setFechaProduccion] = useState(new Date().toISOString().split('T')[0]);
  const fichaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchRecetas = async () => {
      console.log("FichasB2B: Iniciando carga de recetas desde Supabase...");
      const { data, error } = await supabase
        .from('recetas')
        .select('*');

      if (error) {
        console.error("FichasB2B: Error de Supabase:", error);
        return;
      }

      if (data) {
        console.log("FichasB2B: Datos crudos recibidos:", data);
        console.log("FichasB2B: Cantidad de recetas encontradas:", data.length);
        
        const mapped = data.map(r => ({
          id: r.id,
          nombre: r.nombre || 'Sin nombre',
          categoria: r.categoria || 'Sin categoría',
          imagen: r.imagen,
          ingredientes: r.ingredientes || [],
          porciones: r.porciones || 1,
          margenObjetivo: r.margen_objetivo || 0,
          nutricion: r.nutricion,
          denominacion: r.denominacion,
          descripcion: r.descripcion,
          alergenos: r.alergenos,
          vidaUtil: r.vida_util,
          conservacion: r.conservacion,
          instrucciones: r.instrucciones,
          registroSanitario: r.registro_sanitario,
          pesoNeto: r.peso_neto
        }));

        console.log("FichasB2B: Recetas mapeadas listas para el estado:", mapped);
        setRecetas(mapped);
        if (mapped.length > 0) {
          console.log("FichasB2B: Activando primera receta:", mapped[0].id);
          setActiveId(mapped[0].id);
        }
      } else {
        console.warn("FichasB2B: No se recibieron datos de Supabase.");
      }
    };
    fetchRecetas();
  }, []);

  const activeReceta = recetas.find(r => r.id === activeId) || null;

  const downloadImage = async () => {
    if (fichaRef.current === null || !activeReceta) return;
    try {
      const dataUrl = await toPng(fichaRef.current, { 
        quality: 0.95,
        backgroundColor: '#ffffff',
        pixelRatio: 3,
        style: { margin: '0', transform: 'none' }
      });
      const link = document.createElement('a');
      link.download = `ficha-b2b-${activeReceta.nombre.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) { alert('Error imagen'); }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 animate-in fade-in duration-700 pb-20 text-slate-800 w-full max-w-full overflow-x-hidden box-border px-1 md:px-0">
      
      {/* 1. SELECTOR */}
      <aside className="no-print w-full lg:w-72 shrink-0 space-y-4 max-w-full overflow-hidden">
        <div className="bg-white p-3 md:p-6 rounded-[1.5rem] border border-lingote-accent shadow-sm">
          <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-4 pl-1">Trazabilidad (Impresión)</h3>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Número de Lote</label>
              <input 
                type="text" 
                className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl font-bold text-xs outline-none focus:border-lingote-gold"
                value={lote}
                onChange={(e) => setLote(e.target.value.toUpperCase())}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Fecha de Producción</label>
              <input 
                type="date" 
                className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl font-bold text-xs outline-none focus:border-lingote-gold"
                value={fechaProduccion}
                onChange={(e) => setFechaProduccion(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-3 md:p-6 rounded-[1.5rem] border border-lingote-accent shadow-sm">
          <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-4 pl-1">Selector B2B</h3>
          <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto pb-2 scrollbar-hide">
            {recetas.length === 0 ? (
              <p className="text-[10px] text-slate-400 italic text-center py-4 w-full uppercase tracking-widest opacity-40">Vacío</p>
            ) : (
              recetas.map(r => (
                <button 
                  key={r.id} 
                  onClick={() => setActiveId(r.id)} 
                  className={`flex-none w-36 lg:w-full text-left px-4 py-3 rounded-xl font-bold flex items-center justify-between transition-all ${activeId === r.id ? 'bg-lingote-text text-white shadow-xl scale-[1.02]' : 'bg-slate-50 text-slate-500'}`}
                >
                  <span className="truncate uppercase text-[9px] tracking-tight">{r.nombre}</span>
                  <ChevronRight size={12} className={activeId === r.id ? 'opacity-100' : 'opacity-20'} />
                </button>
              ))
            )}
          </div>
        </div>
      </aside>

      {/* 2. VISTA PREVIA */}
      <main className="flex-1 w-full max-w-full min-w-0 overflow-hidden space-y-4 md:space-y-8 box-border">
        {!activeReceta ? (
          <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-8 md:p-12 text-center border-2 border-dashed border-lingote-accent opacity-30 w-full flex flex-col items-center justify-center min-h-[300px]">
            <FileText size={48} className="mb-4 text-slate-300" />
            <p className="font-black uppercase tracking-widest text-slate-300 text-[10px] md:text-xs">Selecciona un producto para generar ficha</p>
          </div>
        ) : (
          <div className="space-y-4 md:space-y-6 w-full max-w-full overflow-hidden">
            <div className="no-print flex flex-col sm:flex-row justify-end gap-2 px-1">
              <button onClick={downloadImage} className="flex-1 sm:flex-none px-6 py-3.5 bg-lingote-gold text-white rounded-xl font-black text-[10px] uppercase shadow-lg flex items-center justify-center gap-2 hover:bg-amber-600 transition-all italic leading-none"><Download size={16} /> Imagen</button>
            </div>

            <div className="no-print w-full bg-slate-200/50 py-12 md:p-16 rounded-[1.5rem] lg:rounded-[3rem] shadow-inner flex justify-center items-center min-h-[500px]">
               {/* FIX DE HUELLA VISUAL: Centrado perfecto con origin-center */}
               <div className="scale-container shrink-0">
                  <div className="scale-[0.38] min-[400px]:scale-[0.42] min-[450px]:scale-[0.48] sm:scale-[0.6] md:scale-[0.8] lg:scale-100 origin-center shrink-0">
                     <div ref={fichaRef} id="ficha-b2b-document" className="bg-white p-12 text-slate-900 shadow-2xl rounded-sm w-[210mm] min-h-[297mm] flex flex-col relative overflow-hidden border border-slate-100 print:p-8">
                        <div className="absolute top-0 left-0 w-full h-2 bg-slate-900"></div>
                        <header className="flex justify-between items-start mb-8 border-b-4 border-slate-900 pb-6 print:pb-4 print:mb-6">
                           <div className="flex items-center gap-4">
                             <img src="/logo_lingote_oficial_ligero.png" alt="Logo" className="w-16 h-16 object-contain print:w-12 print:h-12" />
                             <div className="text-left">
                               <h1 className="text-3xl font-black tracking-tighter uppercase leading-none mb-1 print:text-xl text-left break-words">{INFO_FABRICANTE.nombre}</h1>
                               <p className="text-lg font-bold text-lingote-gold tracking-[0.2em] uppercase italic leading-none print:text-sm text-left">Ficha Técnica Comercial</p>
                             </div>
                           </div>
                           <div className="text-right text-slate-300 font-bold uppercase text-[9px] tracking-widest leading-none print:text-[7px]">ORIGEN: COSTA RICA<br/>CPG - CARTAGO</div>
                        </header>

                        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-10 flex-1">
                           <div className="lg:col-span-5 space-y-8 text-left">
                             <div className="w-full max-w-[320px] lg:max-w-none mx-auto aspect-square bg-slate-50 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl ring-1 ring-slate-100 print:rounded-2xl print:max-w-[150px]">
                                {activeReceta.imagen ? ( <img src={activeReceta.imagen} alt="Product" className="w-full h-full object-cover" /> ) : ( <div className="w-full h-full flex items-center justify-center text-slate-200"><ImageIcon size={48} /></div> )}
                             </div>
                             <div className="space-y-4">
                                <h3 className="font-black uppercase text-[10px] tracking-[0.3em] text-slate-400 border-b border-slate-100 pb-2 print:text-[8px]">Calidad Garantizada</h3>
                                <div className="grid grid-cols-1 gap-3">
                                   <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl print:p-2 print:rounded-xl">
                                     <ShieldCheck className="text-green-600 shrink-0 print:w-3 print:h-3" size={20} />
                                     <div className="text-left leading-none"><p className="font-black text-[11px] uppercase text-slate-700 print:text-[8px]">Quinta Gama</p><p className="text-[8px] text-slate-400 uppercase tracking-tighter print:hidden">Listo para servicio</p></div>
                                   </div>
                                   <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl print:p-2 print:rounded-xl">
                                     <Clock className="text-lingote-gold shrink-0 print:w-3 print:h-3" size={20} />
                                     <div className="text-left leading-none"><p className="font-black text-[11px] uppercase text-slate-700 print:text-[8px]">Trazabilidad</p><p className="text-[8px] text-slate-400 uppercase tracking-tighter print:hidden">Control de lote</p></div>
                                   </div>
                                </div>
                             </div>
                           </div>

                           <div className="lg:col-span-7 space-y-8 text-left">
                             <section className="text-left">
                               <h2 className="text-4xl lg:text-5xl font-black text-slate-900 uppercase tracking-tighter mb-1 leading-none print:text-2xl break-words">{activeReceta.nombre}</h2>
                               <p className="text-lingote-gold font-black uppercase text-[10px] tracking-widest mb-3 print:text-[8px]">{activeReceta.denominacion || 'Producto Gourmet de Autor'}</p>
                               <p className="text-slate-500 leading-relaxed italic text-sm lg:text-base print:text-xs">{activeReceta.descripcion || 'Elaborado con técnicas tradicionales españolas y materias primas seleccionadas para garantizar una experiencia gastronómica superior.'}</p>
                             </section>

                             <section className="space-y-6 print:space-y-4">
                               <div className="text-left">
                                 <h4 className="font-black uppercase text-[10px] tracking-widest text-slate-400 mb-2 leading-none print:text-[8px]">Composición (RTCA)</h4>
                                 <p className="text-xs lg:text-sm font-bold text-slate-700 leading-snug uppercase tracking-tight print:text-[9px]">
                                   {activeReceta.ingredientes.length > 0 ? activeReceta.ingredientes.map(i => i.nombre).join(', ') : 'Ingredientes seleccionados de alta calidad.'}.
                                 </p>
                               </div>
                               <div className="grid grid-cols-2 gap-4 print:gap-2">
                                 <div className="bg-red-50 p-4 rounded-2xl border border-red-100 leading-none print:p-2 print:rounded-xl text-left">
                                   <h4 className="font-black uppercase text-[9px] text-red-600 mb-1 leading-none print:text-[7px]">Alérgenos</h4>
                                   <p className="text-[10px] font-black uppercase text-red-700 print:text-[8px]">{activeReceta.alergenos || 'Huevo, Lácteos, Gluten'}</p>
                                 </div>
                                 <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 leading-none print:p-2 print:rounded-xl text-left">
                                   <h4 className="font-black uppercase text-[9px] text-blue-600 mb-1 leading-none print:text-[7px]">Conservación</h4>
                                   <p className="text-[10px] font-black uppercase text-blue-700 print:text-[8px]">{activeReceta.conservacion || '0-5°C (Refrigerado)'}</p>
                                 </div>
                               </div>

                               {/* Sugerencia del Chef / Instrucciones */}
                               <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 text-left space-y-3 print:p-3 print:rounded-xl">
                                  <h4 className="font-black uppercase text-[9px] text-slate-400 tracking-widest leading-none print:text-[7px]">Sugerencia del Chef (Maridaje y Regeneración)</h4>
                                  <p className="text-[11px] font-medium text-slate-600 italic leading-relaxed print:text-[8px]">
                                     {activeReceta.instrucciones || 'Calentar ligeramente antes de servir para potenciar los aromas. Maridar con vinos blancos jóvenes o café de especialidad.'}
                                  </p>
                               </div>
                               <div className="border-[3px] border-slate-900 rounded-[2rem] overflow-hidden bg-white shadow-xl print:border-2 print:rounded-xl">
                                 <div className="bg-slate-900 text-white font-black text-center py-3 uppercase text-xs tracking-[0.2em] print:py-1 print:text-[8px]">Información Nutricional (por 100g)</div>
                                 <div className="p-6 lg:p-8 grid grid-cols-2 gap-x-8 lg:gap-x-16 gap-y-3 text-[11px] lg:text-xs font-black print:p-3 print:text-[8px] print:gap-y-1">
                                    <div className="space-y-3 border-r border-slate-100 pr-4 lg:pr-8 print:space-y-1">
                                       <div className="flex justify-between border-b-2 border-slate-50 pb-2 print:pb-0.5"><span className="text-left">Energía</span><span>{activeReceta.nutricion?.calorias || 0} kcal</span></div>
                                       <div className="flex justify-between border-b border-slate-50 pb-2 print:pb-0.5"><span className="text-left">Proteína</span><span>{activeReceta.nutricion?.proteina || 0}g</span></div>
                                       <div className="flex justify-between border-b border-slate-50 pb-2 print:pb-0.5"><span className="text-left">Carbos</span><span>{activeReceta.nutricion?.carbohidratos || 0}g</span></div>
                                       <div className="flex justify-between pl-3 font-bold text-slate-400 italic text-[10px] print:text-[7px] print:pl-1"><span className="text-left">- Azúcares</span><span>{activeReceta.nutricion?.azucares || 0}g</span></div>
                                       <div className="flex justify-between pl-3 font-bold text-slate-400 italic text-[10px] print:text-[7px] print:pl-1"><span className="text-left">- Fibra</span><span>{activeReceta.nutricion?.fibraDietetica || 0}g</span></div>
                                    </div>
                                    <div className="space-y-3 pl-2 lg:pl-0 print:space-y-1">
                                       <div className="flex justify-between border-b border-slate-50 pb-2 print:pb-0.5"><span className="text-left">Grasas T.</span><span>{activeReceta.nutricion?.grasaTotal || 0}g</span></div>
                                       <div className="flex justify-between pl-3 font-bold text-slate-400 italic text-[10px] print:text-[7px] print:pl-1"><span className="text-left">- Sat.</span><span>{activeReceta.nutricion?.grasaSaturada || 0}g</span></div>
                                       <div className="flex justify-between pl-3 font-bold text-slate-400 italic text-[10px] print:text-[7px] print:pl-1"><span className="text-left">- Trans</span><span>{activeReceta.nutricion?.grasasTrans || 0}g</span></div>
                                       <div className="flex justify-between border-b border-slate-50 pb-2 print:pb-0.5"><span className="text-left">Colest.</span><span>{activeReceta.nutricion?.colesterol || 0}mg</span></div>
                                       <div className="flex justify-between font-black text-slate-900 mt-1 print:mt-0"><span className="text-left">Sodio</span><span>{activeReceta.nutricion?.sodio || 0}mg</span></div>
                                    </div>
                                 </div>
                                 {/* RACIONES PARA DIABÉTICOS / NUTRICIÓN CLÍNICA */}
                                 <div className="bg-slate-50 border-t border-slate-200 p-4 print:p-2 text-center">
                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2 print:mb-1">Sistema de Intercambio Clínico (1 Ración = 10g)</p>
                                    <div className="flex justify-center gap-8 print:gap-4 text-[11px] lg:text-sm print:text-[8px] font-black uppercase italic tracking-tighter">
                                       <div className="flex items-center gap-2"><span className="text-blue-500">HC:</span><span className="text-slate-900">{((activeReceta.nutricion?.carbohidratos || 0) / 10).toFixed(1)}</span></div>
                                       <div className="flex items-center gap-2"><span className="text-red-500">PROT:</span><span className="text-slate-900">{((activeReceta.nutricion?.proteina || 0) / 10).toFixed(1)}</span></div>
                                       <div className="flex items-center gap-2"><span className="text-amber-500">GRASAS:</span><span className="text-slate-900">{((activeReceta.nutricion?.grasaTotal || 0) / 10).toFixed(1)}</span></div>
                                    </div>
                                 </div>
                               </div>
                             </section>
                           </div>
                        </div>

                        {/* SECCIÓN INFERIOR: AHORA FUERA DE LA COLUMNA 7 PARA TOMAR TODO EL ANCHO */}
                        <div className="mt-12 pt-8 border-t-2 border-slate-900 print:mt-6 print:pt-4">
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="text-left w-full sm:w-auto">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none mb-1 print:text-[8px]">Procedencia</p>
                              <p className="text-2xl lg:text-3xl font-black text-slate-900 uppercase leading-none print:text-lg">HECHO EN COSTA RICA</p>
                            </div>

                            <div className="text-left sm:text-center w-full sm:w-auto bg-slate-900 text-white p-5 rounded-[2rem] print:p-3 print:rounded-2xl shadow-xl">
                              <p className="text-[9px] font-black text-lingote-gold uppercase tracking-[0.4em] leading-none mb-2 print:text-[7px]">Trazabilidad de Lote</p>
                              <div className="flex gap-6 justify-between sm:justify-center items-center">
                                 <div className="text-left sm:text-center">
                                    <p className="text-[8px] font-bold opacity-40 uppercase mb-0.5">Lote</p>
                                    <p className="text-lg font-black italic leading-none">{lote}</p>
                                 </div>
                                 <div className="w-px bg-white/20 h-8"></div>
                                 <div className="text-right sm:text-center">
                                    <p className="text-[8px] font-bold opacity-40 uppercase mb-0.5">Producción</p>
                                    <p className="text-lg font-black italic leading-none">{new Date(fechaProduccion).toLocaleDateString('es-CR')}</p>
                                 </div>
                              </div>
                            </div>

                            <div className="text-left sm:text-right w-full sm:w-auto">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none mb-1 print:text-[8px]">Peso Neto</p>
                              <p className="text-2xl lg:text-3xl font-black text-slate-900 italic uppercase leading-none print:text-lg">{activeReceta.pesoNeto || 'Garantizado'}</p>
                            </div>
                          </div>
                        </div>

                        <footer className="mt-auto pt-8 border-t border-slate-100 flex justify-between items-end text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em] leading-none print:pt-4 print:text-[6px]">
                           <div className="text-left leading-tight"><p>{INFO_FABRICANTE.nombre}</p><p className="mt-1 opacity-50">{INFO_FABRICANTE.direccion}</p></div>
                           <div className="text-right italic">{INFO_FABRICANTE.contacto}</div>
                        </footer>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        )}
      </main>

      <style>{`
        .scale-container {
          width: calc(210mm * 0.38);
          height: calc(297mm * 0.38 + 40px);
          display: flex;
          justify-content: center;
          align-items: center;
        }
        @media (min-width: 400px) {
          .scale-container { width: calc(210mm * 0.42); height: calc(297mm * 0.42 + 40px); }
        }
        @media (min-width: 450px) {
          .scale-container { width: calc(210mm * 0.48); height: calc(297mm * 0.48 + 40px); }
        }
        @media (min-width: 640px) {
          .scale-container { width: calc(210mm * 0.6); height: calc(297mm * 0.6 + 40px); }
        }
        @media (min-width: 768px) {
          .scale-container { width: calc(210mm * 0.8); height: calc(297mm * 0.8 + 40px); }
        }
        @media (min-width: 1024px) {
          .scale-container { width: 210mm; height: calc(297mm + 40px); }
        }
        @media print {
          html, body { height: 100vh; margin: 0 !important; padding: 0 !important; overflow: hidden !important; background: white !important; }
          #root { display: none !important; }
          .no-print, aside, header, nav, button, .kpis, main > div:not(#ficha-b2b-document) { display: none !important; }
          #ficha-b2b-document { 
            display: flex !important; position: fixed !important; top: 0 !important; left: 0 !important; 
            width: 210mm !important; height: 297mm !important; margin: 0 !important; padding: 15mm !important; 
            border: none !important; box-shadow: none !important; z-index: 999999 !important; background: white !important; 
            transform: scale(1) !important; visibility: visible !important; flex-direction: column; font-family: sans-serif;
          }
          @page { size: A4; margin: 0; }
        }
      `}</style>
    </div>
  );
};

export default FichasB2B;
