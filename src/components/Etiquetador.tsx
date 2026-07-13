import { useState, useEffect } from 'react';
import { INFO_FABRICANTE, MASTER_DATABASE } from '../data/masterDatabase';
import { Printer, Loader2, FileText, Tag, Layout, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

// Tipo adaptado a la tabla de recetas en Supabase o MASTER_DATABASE
interface RecetaEtiqueta {
  id: string;
  nombre: string;
  ingredientes: { nombre: string }[] | string;
  nutricion: any;
  alergenos: string;
  vidaUtilDias: number;
  pesoNeto: string;
}

const Etiquetador = () => {
  const [productos, setProductos] = useState<RecetaEtiqueta[]>([]);
  const [selectedId, setSelectedId] = useState('custom');
  const [lote, setLote] = useState('');
  const [envasado, setEnvasado] = useState(new Date().toISOString().split('T')[0]);
  const [vencimiento, setVencimiento] = useState('');
  const [loading, setLoading] = useState(true);

  // Subpestañas para elegir tipo de etiqueta
  const [etiquetaMode, setEtiquetaMode] = useState<'nutricional' | 'pegatina' | 'seguridad'>('nutricional');
  
  // Opciones de configuración de fechas en etiquetas
  const [showDates, setShowDates] = useState(true);
  const [handwrittenDates, setHandwrittenDates] = useState(false);

  // States para producto personalizado (Crear Producto Personalizado)
  const [customName, setCustomName] = useState('Salsa Especial');
  const [customIngredientes, setCustomIngredientes] = useState('Aceite de girasol, huevo pasteurizado, vinagre, sal, culantro.');
  const [customAlergenos, setCustomAlergenos] = useState('CONTIENE: HUEVO.');
  const [customCalorias, setCustomCalorias] = useState(350);
  const [customGrasa, setCustomGrasa] = useState(32);
  const [customSodio, setCustomSodio] = useState(480);
  const [customCarbos, setCustomCarbos] = useState(4);
  const [customProteinas, setCustomProteinas] = useState(1);
  const [customPesoNeto, setCustomPesoNeto] = useState('240 ml');
  const [customVidaUtil, setCustomVidaUtil] = useState(15);

  // States para la personalización de pegatina circular
  const [stickerName, setStickerName] = useState('');
  const [stickerDesc, setStickerDesc] = useState('');
  const [stickerWeight, setStickerWeight] = useState('240 ml');
  const [stickerBadge, setStickerBadge] = useState('100% Artesanal');
  const [stickerDiameter, setStickerDiameter] = useState<60 | 80 | 90>(80); // en mm

  // 1. Cargar desde Supabase los productos con fallback de MASTER_DATABASE
  useEffect(() => {
    const fetchProductos = async () => {
      setLoading(true);
      
      let supabaseData: any[] = [];
      try {
        const { data } = await supabase
          .from('recetas')
          .select('*')
          .eq('es_producto_final', true)
          .order('nombre', { ascending: true });
        if (data) supabaseData = data;
      } catch (err) {
        console.warn('No se pudo conectar a Supabase recetas:', err);
      }

      // Si Supabase falló o no tiene productos, usamos los de retail, salsas y postres de MASTER_DATABASE
      const localList = MASTER_DATABASE.filter(p => p.esParaRetail || p.categoria === 'salsas' || p.categoria === 'postres');
      const combined = supabaseData.length > 0 ? supabaseData : localList;

      const mapped = combined.map(r => {
        const diasMatch = r.vida_util || r.vidaUtilDias ? String(r.vida_util || r.vidaUtilDias).match(/\d+/) : null;
        const dias = diasMatch ? parseInt(diasMatch[0]) : (r.vidaUtilDias || 1);
        
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
          pesoNeto: r.pesoNeto || r.peso_neto || '240 ml'
        };
      });
      
      setProductos(mapped);
      setSelectedId('custom');
      setLoading(false);
    };

    fetchProductos();
  }, []);

  // Lógica para obtener el producto activo (preset o personalizado)
  const getActiveProduct = (): RecetaEtiqueta | null => {
    if (selectedId === 'custom') {
      return {
        id: 'custom',
        nombre: customName,
        ingredientes: customIngredientes,
        nutricion: {
          calorias: customCalorias,
          grasaTotal: customGrasa,
          grasaSaturada: Math.max(0, Math.floor(customGrasa * 0.15)),
          grasasTrans: 0,
          colesterol: 0,
          carbohidratos: customCarbos,
          azucares: Math.max(0, Math.floor(customCarbos * 0.5)),
          fibraDietetica: 0,
          proteina: customProteinas,
          sodio: customSodio
        },
        alergenos: customAlergenos,
        vidaUtilDias: customVidaUtil,
        pesoNeto: customPesoNeto
      };
    }
    return productos.find(x => x.id === selectedId) || null;
  };

  const producto = getActiveProduct();

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
  }, [selectedId, envasado, producto, customVidaUtil]);

  // 3. Sincronizar campos de pegatina cuando cambia el producto
  useEffect(() => {
    if (producto) {
      setStickerName(producto.nombre.replace(/\(.*\)/g, '').trim());
      const masterP = MASTER_DATABASE.find(x => x.id === producto.id);
      setStickerDesc(masterP?.denominacion || 'Salsa artesanal premium');
      setStickerWeight(masterP?.pesoNeto || producto.pesoNeto || '240 ml');
      setStickerBadge('100% Artesanal • Receta Casera');
    }
  }, [selectedId, producto]);

  // 4. Lógica de sellos nutricionales
  const hasCalorieStamp = producto ? producto.nutricion.calorias > 275 : false;
  const hasSatFatStamp = producto ? (producto.nutricion.grasaSaturada * 9 / (producto.nutricion.calorias || 1)) > 0.1 : false;
  const hasSodiumStamp = producto ? producto.nutricion.sodio > 300 : false;
  
  const renderIngredientes = () => {
    if (!producto) return 'Ingredientes no especificados.';
    if (typeof producto.ingredientes === 'string') return producto.ingredientes;
    if (producto.ingredientes.length === 0) return 'Ingredientes no especificados.';
    return producto.ingredientes.map((i: any) => i.nombre).join(', ') + '.';
  };

  // 5. Configurar el tema visual de las pegatinas circulares según el producto
  const getStickerTheme = (productId: string) => {
    if (productId.includes('caribena') || productId === 'salsa-caribena-240ml' || (productId === 'custom' && customName.toLowerCase().includes('caribe'))) {
      return {
        bgColor: '#FFFDF5',
        borderColor: '#D97706',
        textColor: '#78350F',
        accentColor: '#D97706',
        badgeBg: '#FEF3C7',
        badgeText: '#B45309',
        image: '/menu_digital/caribenha.png'
      };
    } else if (productId.includes('chipotle') || productId === 'alioli-chipotle-240ml' || (productId === 'custom' && customName.toLowerCase().includes('chipotle'))) {
      return {
        bgColor: '#FFF5F5',
        borderColor: '#DC2626',
        textColor: '#7A1515',
        accentColor: '#DC2626',
        badgeBg: '#FEE2E2',
        badgeText: '#B91C1C',
        image: '/menu_digital/chipotle.png'
      };
    }
    // Tema genérico
    return {
      bgColor: '#FAFAFA',
      borderColor: '#0F172A',
      textColor: '#0F172A',
      accentColor: '#D4B483',
      badgeBg: '#F1F5F9',
      badgeText: '#475569',
      image: '/logo_lingote_oficial_ligero.png'
    };
  };

  const theme = producto ? getStickerTheme(producto.id) : getStickerTheme('');

  return (
    <div className="flex flex-col lg:flex-row gap-10 xl:gap-16 animate-in fade-in duration-500 pb-20">
      
      {/* PANEL DE CONFIGURACIÓN LATERAL */}
      <aside className="no-print w-full lg:w-96 xl:w-[450px] space-y-6">
        
        {/* Selector de Tipo de Etiqueta (Subtabs) */}
        <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => setEtiquetaMode('nutricional')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              etiquetaMode === 'nutricional' 
                ? 'bg-slate-900 text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layout size={14} /> Ficha (10x10)
          </button>
          <button
            onClick={() => setEtiquetaMode('pegatina')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              etiquetaMode === 'pegatina' 
                ? 'bg-slate-900 text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Tag size={14} /> Pegatina Tarro
          </button>
          <button
            onClick={() => setEtiquetaMode('seguridad')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              etiquetaMode === 'seguridad' 
                ? 'bg-slate-900 text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck size={14} /> Sello Seguridad
          </button>
        </div>

        <div className="bg-white p-8 xl:p-10 rounded-[2.5rem] border border-lingote-accent shadow-sm text-left">
          <h3 className="text-sm xl:text-base font-black uppercase text-slate-400 mb-6 tracking-widest pl-2 italic">
            Configuración de Impresión
          </h3>
          
          {loading ? (
             <div className="py-10 flex flex-col items-center justify-center gap-3 text-slate-300">
               <Loader2 className="animate-spin" size={32} />
               <p className="text-[10px] font-black uppercase tracking-widest">Cargando...</p>
             </div>
          ) : (
            <div className="space-y-6">
              
              {/* Selector de Origen de Datos */}
              <div>
                <label className="block text-[11px] xl:text-xs font-black uppercase text-slate-400 mb-3 pl-2 tracking-wider">Seleccionar Producto</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-100 p-4 xl:p-5 rounded-2xl text-base font-bold text-slate-700 focus:ring-2 focus:ring-lingote-gold outline-none appearance-none cursor-pointer"
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                >
                  <option value="custom">✨ [Crear Salsa / Producto Personalizado]</option>
                  {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              </div>

              {/* FORMULARIO DINÁMICO PARA PRODUCTO PERSONALIZADO */}
              {selectedId === 'custom' && (
                <div className="space-y-4 bg-slate-50/50 p-4 rounded-3xl border border-slate-100">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block border-b pb-1.5">Datos de Salsa Personalizada</span>
                  
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 pl-1">Nombre Salsa</label>
                    <input type="text" className="w-full bg-white border border-slate-100 p-3 rounded-xl text-sm font-bold" value={customName} onChange={(e)=>setCustomName(e.target.value)} />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 pl-1">Ingredientes</label>
                    <textarea className="w-full bg-white border border-slate-100 p-3 rounded-xl text-xs font-bold h-16 leading-normal resize-none" value={customIngredientes} onChange={(e)=>setCustomIngredientes(e.target.value)} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 pl-1">Alérgenos</label>
                      <input type="text" className="w-full bg-white border border-slate-100 p-3 rounded-xl text-xs font-bold" value={customAlergenos} onChange={(e)=>setCustomAlergenos(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 pl-1">Vida Útil (Días)</label>
                      <input type="number" className="w-full bg-white border border-slate-100 p-3 rounded-xl text-sm font-bold" value={customVidaUtil} onChange={(e)=>setCustomVidaUtil(Number(e.target.value))} />
                    </div>
                  </div>

                  {etiquetaMode === 'nutricional' && (
                    <>
                      <div className="grid grid-cols-3 gap-2 border-t pt-3 border-slate-100">
                        <div>
                          <label className="block text-[8px] font-black uppercase text-slate-400 mb-1">Calorías</label>
                          <input type="number" className="w-full bg-white border border-slate-100 p-2 rounded-lg text-xs font-bold text-center" value={customCalorias} onChange={(e)=>setCustomCalorias(Number(e.target.value))} />
                        </div>
                        <div>
                          <label className="block text-[8px] font-black uppercase text-slate-400 mb-1">Grasa (g)</label>
                          <input type="number" className="w-full bg-white border border-slate-100 p-2 rounded-lg text-xs font-bold text-center" value={customGrasa} onChange={(e)=>setCustomGrasa(Number(e.target.value))} />
                        </div>
                        <div>
                          <label className="block text-[8px] font-black uppercase text-slate-400 mb-1">Sodio (mg)</label>
                          <input type="number" className="w-full bg-white border border-slate-100 p-2 rounded-lg text-xs font-bold text-center" value={customSodio} onChange={(e)=>setCustomSodio(Number(e.target.value))} />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 pt-2">
                        <div>
                          <label className="block text-[8px] font-black uppercase text-slate-400 mb-1">Carbos (g)</label>
                          <input type="number" className="w-full bg-white border border-slate-100 p-2 rounded-lg text-xs font-bold text-center" value={customCarbos} onChange={(e)=>setCustomCarbos(Number(e.target.value))} />
                        </div>
                        <div>
                          <label className="block text-[8px] font-black uppercase text-slate-400 mb-1">Prot (g)</label>
                          <input type="number" className="w-full bg-white border border-slate-100 p-2 rounded-lg text-xs font-bold text-center" value={customProteinas} onChange={(e)=>setCustomProteinas(Number(e.target.value))} />
                        </div>
                        <div>
                          <label className="block text-[8px] font-black uppercase text-slate-400 mb-1">Peso Neto</label>
                          <input type="text" className="w-full bg-white border border-slate-100 p-2 rounded-lg text-xs font-bold text-center" value={customPesoNeto} onChange={(e)=>setCustomPesoNeto(e.target.value)} />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
              
              {/* Fechas de Envasado y Vencimiento */}
              {showDates && !handwrittenDates && (
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
              )}

              {/* Lote */}
              {showDates && !handwrittenDates && (
                <div>
                  <label className="block text-[11px] xl:text-xs font-black uppercase text-slate-400 mb-3 pl-2 tracking-wider">Número de Lote</label>
                  <input type="text" className="w-full bg-slate-50 border border-slate-100 p-4 xl:p-5 rounded-2xl text-base font-bold tracking-widest" value={lote} onChange={(e)=>setLote(e.target.value)} />
                </div>
              )}

              {/* OPCIONES DE CONFIGURACIÓN DE FECHA / LOTE */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-3xl border border-slate-100 mt-4 text-left">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block border-b pb-1.5 mb-2">Configuración de Fechas</span>
                
                <label className="flex items-center gap-3 cursor-pointer text-xs font-bold text-slate-600">
                  <input 
                    type="checkbox" 
                    className="rounded text-slate-900 focus:ring-slate-900 h-4 w-4 cursor-pointer" 
                    checked={showDates} 
                    onChange={(e)=>setShowDates(e.target.checked)} 
                  />
                  <span>Mostrar Fechas y Lote en el Sticker</span>
                </label>

                {showDates && (
                  <label className="flex items-center gap-3 cursor-pointer text-xs font-bold text-slate-600 mt-2">
                    <input 
                      type="checkbox" 
                      className="rounded text-slate-900 focus:ring-slate-900 h-4 w-4 cursor-pointer" 
                      checked={handwrittenDates} 
                      onChange={(e)=>setHandwrittenDates(e.target.checked)} 
                    />
                    <span>Escribir a mano (Líneas vacías)</span>
                  </label>
                )}
              </div>

              {/* CAMPOS DINÁMICOS EXCLUSIVOS DE LA PEGATINA CIRCULAR */}
              {etiquetaMode === 'pegatina' && (
                <div className="space-y-4 border-t pt-4 border-slate-100">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Diseño del Sticker de Tapa</span>
                  
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 pl-1.5 tracking-wider">Nombre en el Sticker</label>
                    <input type="text" className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-sm font-bold" value={stickerName} onChange={(e)=>setStickerName(e.target.value)} />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 pl-1.5 tracking-wider">Descripción Breve</label>
                    <input type="text" className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-sm font-bold" value={stickerDesc} onChange={(e)=>setStickerDesc(e.target.value)} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 pl-1.5 tracking-wider">Cont. Neto</label>
                      <input type="text" className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-sm font-bold" value={stickerWeight} onChange={(e)=>setStickerWeight(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 pl-1.5 tracking-wider">Diám. Círculo</label>
                      <select 
                        className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-sm font-bold cursor-pointer" 
                        value={stickerDiameter}
                        onChange={(e)=>setStickerDiameter(Number(e.target.value) as any)}
                      >
                        <option value={60}>60 mm (Línea Fina)</option>
                        <option value={80}>80 mm (Estándar)</option>
                        <option value={90}>90 mm (Grande)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 pl-1.5 tracking-wider">Sello / Atributo</label>
                    <input type="text" className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-sm font-bold" value={stickerBadge} onChange={(e)=>setStickerBadge(e.target.value)} />
                  </div>

                </div>
              )}

            </div>
          )}
          
          <button 
             onClick={() => window.print()} 
             disabled={loading}
             className="w-full mt-10 bg-slate-900 text-white font-black py-5 xl:py-6 rounded-3xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Printer size={22} /> IMPRIMIR ETIQUETA
          </button>
        </div>
      </aside>

      {/* ÁREA DE VISUALIZACIÓN / IMPRESIÓN */}
      <main id="label-container" className="flex-1 flex justify-center lg:justify-start items-start p-4">
        {producto ? (
          etiquetaMode === 'nutricional' ? (
            /* VISTA DE LA FICHA NUTRICIONAL CUADRADA INDUSTRIAL (10x10) */
            <div className="bg-white w-[96mm] h-[96mm] shadow-2xl p-6 border border-slate-200 flex flex-col justify-start text-slate-900 leading-[1.1] overflow-hidden text-left animate-in zoom-in duration-300">
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
                {showDates && (
                  <div className="flex justify-between font-black uppercase text-[8px] gap-2 mb-1">
                    <div className="border border-slate-300 px-2 py-0.5 flex-1">LOTE: {handwrittenDates ? '_______________' : lote}</div>
                    <div className="border border-slate-300 px-2 py-0.5 flex-1 text-slate-500">ENV: {handwrittenDates ? '_______________' : envasado}</div>
                    <div className="border border-slate-300 px-2 py-0.5 flex-1 text-red-600 italic">VENCE: {handwrittenDates ? '_______________' : vencimiento}</div>
                  </div>
                )}
                <p className="font-bold text-[7px] tracking-tight">{INFO_FABRICANTE.nombre} • Cartago, CR • {INFO_FABRICANTE.contacto}</p>
                <p className="text-[12px] font-black pt-1 uppercase">PESO NETO: {producto.pesoNeto}</p>
              </div>
            </div>
          ) : etiquetaMode === 'pegatina' ? (
            /* VISTA DE LA PEGATINA CUADRADA DE TARRO (LID/JAR STICKER) */
            <div 
              className="bg-white flex items-center justify-center relative print:border-none border border-slate-100 shadow-2xl overflow-hidden rounded-[2rem] animate-in zoom-in duration-300"
              style={{ 
                width: `${stickerDiameter + 10}mm`, 
                height: `${stickerDiameter + 10}mm`, 
                boxSizing: 'border-box' 
              }}
            >
              {/* Caja Principal de la Pegatina */}
              <div 
                className="rounded-[1.5rem] flex flex-col justify-between p-4 relative box-border text-center select-none overflow-hidden"
                style={{ 
                  width: `${stickerDiameter}mm`, 
                  height: `${stickerDiameter}mm`, 
                  backgroundColor: theme.bgColor,
                  border: `3px double ${theme.borderColor}`,
                  color: theme.textColor
                }}
              >
                {/* Borde interior fino decorativo */}
                <div 
                  className="absolute inset-2 rounded-[1.2rem] pointer-events-none"
                  style={{ border: `1px dashed ${theme.borderColor}40` }}
                ></div>

                {/* Encabezado de Marca */}
                <div className="mt-2 space-y-0.5 relative z-10">
                  <span className="text-[7.5px] font-black uppercase tracking-[0.3em] block" style={{ color: theme.accentColor }}>
                    EL LINGOTE ESPAÑOL
                  </span>
                  <span className="text-[6px] font-bold uppercase tracking-widest block opacity-70">
                    Artesanía Gastronómica
                  </span>
                </div>

                {/* Imagen del producto en marca de agua transparente */}
                <div className="absolute inset-0 flex items-center justify-center opacity-15 pointer-events-none z-0">
                  <img 
                    src={theme.image} 
                    alt={stickerName} 
                    className="w-[70%] h-[70%] object-contain filter drop-shadow-xl" 
                  />
                </div>

                {/* Bloque central de contenido */}
                <div className="my-auto space-y-1 relative z-10 px-2 flex flex-col items-center">
                  <img src="/logo_lingote_oficial_ligero.png" alt="Logo" className="h-6 w-6 object-contain mb-0.5" />
                  
                  {/* Nombre de la Salsa */}
                  <h2 className="text-[15px] font-black italic uppercase tracking-tighter leading-none" style={{ color: theme.textColor }}>
                    {stickerName}
                  </h2>
                  
                  {/* Denominación/Descripción */}
                  <p className="text-[7px] font-bold leading-tight opacity-90 italic max-w-[65mm] mx-auto">
                    {stickerDesc}
                  </p>

                  {/* Sello de Atributo */}
                  <div className="inline-block px-2.5 py-0.5 rounded-full text-[5.5px] font-black uppercase tracking-wider mt-1" style={{ backgroundColor: theme.badgeBg, color: theme.badgeText }}>
                    {stickerBadge}
                  </div>
                </div>

                {/* Información inferior de Lote, Fechas y peso neto */}
                <div className="mb-2 relative z-10 space-y-1">
                  {showDates && (
                    <div className="flex justify-center gap-2 text-[5.5px] font-black uppercase tracking-wider" style={{ borderTop: `1px solid ${theme.borderColor}30`, borderBottom: `1px solid ${theme.borderColor}30`, padding: '2px 0' }}>
                      <span>Lote: {handwrittenDates ? '__________' : lote}</span>
                      <span className="opacity-40">•</span>
                      <span>Env: {handwrittenDates ? '__________' : envasado}</span>
                      <span className="opacity-40">•</span>
                      <span className="text-red-600">Vence: {handwrittenDates ? '__________' : vencimiento}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center px-4">
                    <span className="text-[6.5px] font-black uppercase tracking-widest opacity-60">Consérvese frío</span>
                    <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: theme.accentColor }}>{stickerWeight}</span>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            /* VISTA DEL SELLO DE SEGURIDAD PARA CAJAS (RECTANGULAR - 90x60mm) */
            <div 
              className="bg-white shadow-2xl p-4 flex flex-col justify-between text-slate-900 leading-tight overflow-hidden text-left relative animate-in zoom-in duration-300"
              style={{ 
                width: '90mm', 
                height: '60mm', 
                boxSizing: 'border-box',
                border: '1.5px solid #0F172A',
                borderRadius: '1rem'
              }}
            >
              {/* Encabezado Negro Premium con Letras Oro */}
              <div className="bg-slate-950 text-lingote-gold text-center py-1.5 px-4 font-black uppercase tracking-[0.2em] text-[8.5px] rounded-lg">
                🔒 SELLO DE SEGURIDAD Y FRESCURA
              </div>

              {/* Contenido Central */}
              <div className="grid grid-cols-5 gap-3 my-2 items-center">
                {/* Lado izquierdo: Logo */}
                <div className="col-span-2 flex flex-col items-center justify-center border-r border-slate-100 pr-2">
                  <img src="/logo_lingote_oficial_ligero.png" alt="Logo" className="w-12 h-12 object-contain mb-1" />
                  <span className="text-[7px] font-black uppercase tracking-wider text-slate-400 block">EL LINGOTE</span>
                  <span className="text-[6px] font-bold uppercase tracking-widest text-slate-500 block leading-none">ESPAÑOL</span>
                </div>
                
                {/* Lado derecho: Instrucciones de seguridad */}
                <div className="col-span-3 text-left space-y-1">
                  <h4 className="text-[8.5px] font-black uppercase text-slate-800 tracking-wide">¡Garantía de Origen!</h4>
                  <p className="text-[7px] leading-tight text-slate-500 font-bold leading-normal">
                    Fresco, higiénico y hecho con amor. Si este precinto de seguridad se encuentra roto, favor reportarlo de inmediato.
                  </p>
                  <div className="inline-block bg-amber-50 px-2 py-0.5 rounded text-[5.5px] font-black uppercase text-amber-800 tracking-wider">
                    Hecho a Mano
                  </div>
                </div>
              </div>

              {/* Información inferior de Lote, Fechas y Peso */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5 mt-auto">
                {showDates && (
                  <div className="flex justify-between font-black uppercase text-[6.5px] gap-2">
                    <div className="border border-slate-200 px-1 py-0.5 flex-1 text-center font-mono">LOTE: {handwrittenDates ? '___________' : lote}</div>
                    <div className="border border-slate-200 px-1 py-0.5 flex-1 text-center text-slate-500 font-mono">ENV: {handwrittenDates ? '___________' : envasado}</div>
                    <div className="border border-slate-200 px-1 py-0.5 flex-1 text-center text-red-600 italic font-mono">VENCE: {handwrittenDates ? '___________' : vencimiento}</div>
                  </div>
                )}
                
                {/* Dirección y Contacto */}
                <div className="flex justify-between items-center text-[6px] font-black text-slate-400 uppercase tracking-tight">
                  <span>📍 Guadalupe, Cartago, CR</span>
                  <span>📞 Whatsapp: +(506) 8000-0000</span>
                </div>
              </div>
            </div>
          )
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
