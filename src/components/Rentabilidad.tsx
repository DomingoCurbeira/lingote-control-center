import { useState, useEffect, useRef } from 'react';
import { 
  Calculator, Image as ImageIcon, 
  Plus, Trash2, Download, Save, X, Database, Tag, Loader2, Cloud,
  BarChart3
} from 'lucide-react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { MASTER_DATABASE } from '../data/masterDatabase';
import { supabase } from '../lib/supabase';
import { notify } from '../utils/notifications';
import type { InsumoMaestro } from './InventarioMaestro';

// --- INTERFACES ---
interface Ingrediente {
  id: string;
  nombre: string;
  precioCompra: number; 
  cantidadReceta: number; 
  merma: number; 
  insumoMaestroId?: string; // ID para vinculación con el maestro
  unidad?: string;
}

interface EscandalloCompleto {
  id: string;
  nombre: string;
  categoria: string;
  porciones: number;
  margenObjetivo: number;
  packaging: number;
  ingredientes: Ingrediente[];
  esProductoFinal: boolean;
  imagen?: string;
  nutricion?: any;
  denominacion?: string;
  descripcion?: string;
  alergenos?: string;
  vidaUtil?: string;
  conservacion?: string;
  instrucciones?: string;
  registroSanitario?: string;
  pesoNeto?: string;
  precioVentaManual?: number;
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
  const [showExecutiveTable, setShowExecutiveTable] = useState(false);
  const [insumosMaestros, setInsumosMaestros] = useState<InsumoMaestro[]>([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [loading, setLoading] = useState(true);
  const [gastos, setGastos] = useState<GastosGlobales>(() => {
    const saved = localStorage.getItem('lingote_gastos_globales');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing gastos", e);
      }
    }
    return {
      alquiler: 520000,
      luz: 80000,
      agua: 20000,
      gas: 25000,
      internet: 30000,
      impuestos: 15000,
      seguros: 5000,
      salarioPropietario: 400000,
      metaVentasMensual: 800
    };
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const fichaRef = useRef<HTMLDivElement>(null);

  // Manejar el redimensionamiento para el escalado A4
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- PERSISTENCIA Y CARGA ---
  useEffect(() => {
    const fetchCloudData = async () => {
      setLoading(true);
      
      const { data: cloudRecetas, error } = await supabase
        .from('recetas')
        .select('*')
        .order('nombre', { ascending: true });

      if (!error && cloudRecetas) {
        const mapped: EscandalloCompleto[] = cloudRecetas.map(r => ({
          id: r.id,
          nombre: r.nombre,
          categoria: r.categoria,
          porciones: Number(r.porciones),
          margenObjetivo: Number(r.margen_objetivo),
          packaging: Number(r.packaging),
          esProductoFinal: r.es_producto_final,
          imagen: r.imagen || undefined,
          ingredientes: r.ingredientes || [],
          nutricion: r.nutricion,
          denominacion: r.denominacion,
          descripcion: r.descripcion,
          alergenos: r.alergenos,
          vidaUtil: r.vida_util,
          conservacion: r.conservacion,
          instrucciones: r.instrucciones,
          registroSanitario: r.registro_sanitario,
          pesoNeto: r.peso_neto,
          precioVentaManual: r.precio_venta || undefined
        }));
        setRecetas(mapped);
        if (mapped.length > 0) setActiveId(mapped[0].id);
      }

      const { data: insumos } = await supabase.from('insumos').select('*');
      if (insumos) setInsumosMaestros(insumos);

      setLoading(false);
    };

    fetchCloudData();
  }, []);

  // Sincronización automática de precios y NUTRICIÓN vinculada
  useEffect(() => {
    if (insumosMaestros.length === 0 || recetas.length === 0) return;

    let huboCambios = false;
    const nuevasRecetas = recetas.map(r => {
      // 1. Sincronizar Insumos (Precios)
      const nuevosIngredientes = r.ingredientes.map(ing => {
        if (ing.insumoMaestroId) {
          const maestro = insumosMaestros.find(m => m.id === ing.insumoMaestroId);
          if (maestro && (maestro.precio_costo !== ing.precioCompra || maestro.unidad !== ing.unidad)) {
            huboCambios = true;
            return { ...ing, precioCompra: maestro.precio_costo, unidad: maestro.unidad };
          }
        }
        return ing;
      });

      // 2. Calcular Nutrición Automática (basada en el Maestro)
      const nutricionBase = {
        calorias: 0, grasaTotal: 0, grasaSaturada: 0, grasasTrans: 0,
        colesterol: 0, carbohidratos: 0, azucares: 0, fibraDietetica: 0,
        proteina: 0, sodio: 0
      };

      let tieneNutricionVinculada = false;
      nuevosIngredientes.forEach(ing => {
        const maestro = insumosMaestros.find(m => m.id === ing.insumoMaestroId);
        if (maestro) {
          tieneNutricionVinculada = true;
          const factor = ing.cantidadReceta / 100; // Datos maestro son por 100g
          nutricionBase.calorias += (maestro.kcal || 0) * factor;
          nutricionBase.grasaTotal += (maestro.fat || 0) * factor;
          nutricionBase.grasaSaturada += (maestro.saturadas || 0) * factor;
          nutricionBase.grasasTrans += (maestro.trans || 0) * factor;
          nutricionBase.colesterol += (maestro.colesterol || 0) * factor;
          nutricionBase.proteina += (maestro.protein || 0) * factor;
          nutricionBase.carbohidratos += (maestro.carbs || 0) * factor;
          nutricionBase.azucares += (maestro.azucares || 0) * factor;
          nutricionBase.fibraDietetica += (maestro.fibra || 0) * factor;
          nutricionBase.sodio += (maestro.sodium || 0) * factor;
        }
      });

      // Normalizar nutrición por porción (opcional, o por 100g de producto final)
      const pesoTotal = nuevosIngredientes.reduce((sum, i) => sum + i.cantidadReceta, 0);
      const factor100g = pesoTotal > 0 ? 100 / pesoTotal : 0;

      const nutricionFinal = {
        calorias: Math.round(nutricionBase.calorias * factor100g),
        grasaTotal: Number((nutricionBase.grasaTotal * factor100g).toFixed(1)),
        grasaSaturada: Number((nutricionBase.grasaSaturada * factor100g).toFixed(1)),
        grasasTrans: Number((nutricionBase.grasasTrans * factor100g).toFixed(1)),
        colesterol: Math.round(nutricionBase.colesterol * factor100g),
        proteina: Number((nutricionBase.proteina * factor100g).toFixed(1)),
        carbohidratos: Number((nutricionBase.carbohidratos * factor100g).toFixed(1)),
        azucares: Number((nutricionBase.azucares * factor100g).toFixed(1)),
        fibraDietetica: Number((nutricionBase.fibraDietetica * factor100g).toFixed(1)),
        sodio: Math.round(nutricionBase.sodio * factor100g)
      };

      // Verificar si la nutrición calculada difiere de la guardada
      if (JSON.stringify(r.nutricion) !== JSON.stringify(nutricionFinal) && tieneNutricionVinculada) {
        huboCambios = true;
        return { ...r, ingredientes: nuevosIngredientes, nutricion: nutricionFinal };
      }

      if (huboCambios) return { ...r, ingredientes: nuevosIngredientes };
      return r;
    });

    if (huboCambios) {
      setRecetas(nuevasRecetas);
    }
  }, [insumosMaestros]);

  useEffect(() => {
    localStorage.setItem('lingote_gastos_globales', JSON.stringify(gastos));
  }, [gastos]);

  const activeReceta = recetas.find(r => r.id === activeId) || null;

  const totalGastosFijos = gastos.alquiler + gastos.luz + gastos.agua + gastos.gas + gastos.internet + gastos.impuestos + gastos.seguros + gastos.salarioPropietario;
  const cuotaOperativaPorUnidad = totalGastosFijos / Math.max(1, gastos.metaVentasMensual);

  // --- ACCIONES CLOUD ---

  const guardarEnNube = async (receta: EscandalloCompleto) => {
    const { error } = await supabase
      .from('recetas')
      .upsert({
        id: receta.id,
        nombre: receta.nombre,
        categoria: receta.categoria,
        porciones: receta.porciones,
        margen_objetivo: receta.margenObjetivo,
        packaging: receta.packaging,
        es_producto_final: receta.esProductoFinal,
        imagen: receta.imagen,
        ingredientes: receta.ingredientes,
        nutricion: receta.nutricion,
        denominacion: receta.denominacion,
        descripcion: receta.descripcion,
        alergenos: receta.alergenos,
        vida_util: receta.vidaUtil,
        conservacion: receta.conservacion,
        instrucciones: receta.instrucciones,
        registro_sanitario: receta.registroSanitario,
        peso_neto: receta.pesoNeto,
        precio_venta: receta.precioVentaManual,
        updated_at: new Date().toISOString()
      });

    if (error) notify.error("Error al sincronizar", error.message);
  };


  const crearNuevaReceta = async () => {
    const nueva: EscandalloCompleto = {
      id: Date.now().toString(),
      nombre: 'NUEVO PRODUCTO',
      categoria: 'lingotes',
      porciones: 1,
      margenObjetivo: 65,
      packaging: 150,
      esProductoFinal: true,
      ingredientes: [],
      denominacion: '',
      descripcion: '',
      alergenos: '',
      vidaUtil: '',
      conservacion: '',
      instrucciones: '',
      registroSanitario: '',
      pesoNeto: '',
      nutricion: {
        calorias: 0,
        grasaTotal: 0,
        grasaSaturada: 0,
        grasasTrans: 0,
        colesterol: 0,
        carbohidratos: 0,
        azucares: 0,
        fibra: 0,
        proteina: 0,
        sodio: 0
      }
    };
    
    setRecetas([...recetas, nueva]);
    setActiveId(nueva.id);
    await guardarEnNube(nueva);
    notify.success("Receta Creada", "Inicia el escandallo ahora.");
  };

  const actualizarReceta = (data: Partial<EscandalloCompleto>) => {
    if (!activeId) return;
    const actualizada = recetas.find(r => r.id === activeId);
    if (!actualizada) return;

    const nuevaVersion = { ...actualizada, ...data };
    setRecetas(prev => prev.map(r => r.id === activeId ? nuevaVersion : r));
    guardarEnNube(nuevaVersion);
  };

  const updateIngrediente = (ingId: string, data: Partial<Ingrediente>) => {
    if (!activeReceta) return;
    
    let extraData: Partial<Ingrediente> = {};
    if (data.nombre !== undefined) {
      const coincidencia = insumosMaestros.find(m => m.nombre.toLowerCase() === data.nombre?.toLowerCase());
      if (coincidencia) {
        extraData = {
          insumoMaestroId: coincidencia.id,
          precioCompra: coincidencia.precio_costo,
          unidad: coincidencia.unidad
        };
      } else {
        extraData = { insumoMaestroId: undefined };
      }
    }

    const nuevos = activeReceta.ingredientes.map(i => i.id === ingId ? { ...i, ...data, ...extraData } : i);
    actualizarReceta({ ingredientes: nuevos });
  };

  const importarDesdeMaestro = async () => {
    const confirmacion = await notify.confirm("¿Cargar Catálogo?", "Se añadirán los productos oficiales con toda su información técnica.");
    if (!confirmacion) return;

    const nuevasRecetas: EscandalloCompleto[] = MASTER_DATABASE
      .filter(p => p.categoria !== 'insumos') 
      .map(p => ({
        id: p.id,
        nombre: p.nombre,
        categoria: p.categoria,
        porciones: 1, 
        packaging: p.escandallo.costoPackaging,
        margenObjetivo: 65,
        esProductoFinal: !['salsas', 'insumos', 'recetas base'].includes(p.categoria),
        imagen: p.imagen.startsWith('data:') ? p.imagen : undefined,
        nutricion: p.nutricion,
        denominacion: p.denominacion,
        descripcion: p.descripcionCompleta,
        alergenos: p.alergenos,
        vidaUtil: `${p.vidaUtilDias} Días`,
        conservacion: p.conservacion,
        instrucciones: p.instrucciones,
        registroSanitario: p.registroSanitario,
        pesoNeto: p.pesoNeto,
        ingredientes: [
          { id: '1', nombre: 'Materia Prima Base', precioCompra: p.escandallo.costoInsumos, cantidadReceta: 1000, merma: p.escandallo.mermaPorcentaje }
        ]
      }));

    for (const r of nuevasRecetas) {
      await guardarEnNube(r);
    }
    
    setRecetas(prev => {
      const idsExistentes = new Set(prev.map(r => r.id));
      const unicas = nuevasRecetas.filter(r => !idsExistentes.has(r.id));
      return [...prev, ...unicas];
    });
    
    notify.success("¡Sincronizado!", "Catálogo Maestro en la nube.");
  };

  const limpiarMaestro = async () => {
    const confirmacion = await notify.confirm("¿Quitar Maestro?", "Se borrarán de la nube los productos del sistema.");
    if (!confirmacion) return;

    const idsMaestros = MASTER_DATABASE.map(p => p.id);
    const { error } = await supabase.from('recetas').delete().in('id', idsMaestros);

    if (!error) {
      const idsSet = new Set(idsMaestros);
      setRecetas(prev => prev.filter(r => !idsSet.has(r.id)));
      setActiveId(null);
      notify.success("Limpieza Cloud", "Maestro removido de la nube.");
    }
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
          actualizarReceta({ imagen: canvas.toDataURL('image/webp', 0.7) });
        };
        img.src = evt.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const calcularCostoIngrediente = (ing: Ingrediente) => {
    const esUnidad = ing.unidad === 'unidad' || ing.unidad === 'unid';
    const costoBase = esUnidad 
      ? ing.cantidadReceta * ing.precioCompra 
      : (ing.cantidadReceta / 1000) * ing.precioCompra;
      
    const factorMerma = ing.merma >= 100 ? 1 : 1 / (1 - (ing.merma / 100));
    return costoBase * factorMerma;
  };

  const calcularCostoTotal = () => {
    if (!activeReceta) return 0;
    return activeReceta.ingredientes.reduce((sum, ing) => sum + calcularCostoIngrediente(ing), 0) + activeReceta.packaging + (activeReceta.esProductoFinal ? cuotaOperativaPorUnidad * activeReceta.porciones : 0);
  };

  const exportarDatos = () => {
    const blob = new Blob([JSON.stringify(recetas, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lingote_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const importarDatos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const data: EscandalloCompleto[] = JSON.parse(evt.target?.result as string);
          const confirm = await notify.confirm("¿Importar Backup?", `Se cargarán ${data.length} recetas en la nube.`);
          if (!confirm) return;
          for (const r of data) await guardarEnNube(r);
          setRecetas(data);
          if (data.length > 0) setActiveId(data[0].id);
          notify.success("Backup Restaurado", "Todas las recetas están ahora en la nube.");
        } catch (e) { notify.error("Error de Formato", "El archivo JSON no es válido."); }
      };
      reader.readAsText(file);
    }
  };

  const downloadTablePDF = async () => {
    const tableElement = document.getElementById('executive-profitability-table');
    if (!tableElement) return;

    try {
      const canvas = await html2canvas(tableElement, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Reporte-Rentabilidad-${new Date().toISOString().split('T')[0]}.pdf`);
      notify.success("PDF Generado", "Se ha descargado el reporte de rentabilidad.");
    } catch (error) {
      notify.error("Error", "No se pudo generar el PDF.");
    }
  };

  const getProfitColor = (utilidad: number) => {
    if (utilidad >= 1000) return { bg: 'bg-green-500', text: 'text-green-600', hex: '#22c55e', label: 'Estrella' };
    if (utilidad >= 500) return { bg: 'bg-cyan-500', text: 'text-cyan-600', hex: '#06b6d4', label: 'Saludable' };
    if (utilidad >= 300) return { bg: 'bg-orange-500', text: 'text-orange-600', hex: '#f97316', label: 'Gancho' };
    return { bg: 'bg-red-500', text: 'text-red-600', hex: '#ef4444', label: 'Alerta' };
  };

  const getOrderedRecetas = () => {
    const ordenCategorias = ['lingotes', 'promociones', 'bebidas', 'postres', 'salsas', 'retail', 'recetas base'];
    
    // Agrupar
    const agrupadas: Record<string, any[]> = {};
    
    recetas.forEach(r => {
      const cat = r.categoria || 'recetas base';
      if (!agrupadas[cat]) agrupadas[cat] = [];
      
      // Calcular utilidad neta para ordenar
      const costoTotal = r.ingredientes.reduce((sum, ing) => sum + calcularCostoIngrediente(ing), 0) + r.packaging + (r.esProductoFinal ? cuotaOperativaPorUnidad * r.porciones : 0);
      const cUnidad = costoTotal / (r.porciones || 1);
      const pvpCalc = cUnidad / ((100 - (r.margenObjetivo || 0)) / 100);
      const pvpFinal = r.precioVentaManual || pvpCalc;
      const utilidad = pvpFinal - cUnidad;
      const status = getProfitColor(utilidad);
      
      agrupadas[cat].push({ ...r, costoUnidad: cUnidad, pvp: pvpFinal, utilidad, status });
    });

    // Ordenar categorías y productos dentro de ellas
    return ordenCategorias.map(cat => ({
      categoria: cat,
      items: (agrupadas[cat] || []).sort((a, b) => b.utilidad - a.utilidad)
    })).filter(g => g.items.length > 0);
  };

  const eliminarReceta = async () => {
    if (!activeId) return;
    const confirmacion = await notify.confirm("¿Eliminar Receta?", `¿Estás seguro de que quieres borrar "${activeReceta?.nombre}"?`);
    if (confirmacion) {
      const { error } = await supabase.from('recetas').delete().eq('id', activeId);
      if (!error) {
        setRecetas(recetas.filter(r => r.id !== activeId));
        setActiveId(null);
        notify.success("Receta Eliminada", "Removida de la nube.");
      }
    }
  };

  const downloadFicha = async () => {
    if (fichaRef.current) {
      const dataUrl = await toPng(fichaRef.current, { 
        cacheBust: true, 
        pixelRatio: 2,
        width: 794,
        height: 1123,
      });
      const link = document.createElement('a');
      link.download = `Ficha-${activeReceta?.nombre}.png`;
      link.href = dataUrl;
      link.click();
    }
  };

  const totalCosto = calcularCostoTotal();
  const costoUnidad = totalCosto / (activeReceta?.porciones || 1);
  const pvpSugerido = costoUnidad / ((100 - (activeReceta?.margenObjetivo || 0)) / 100);

  const isMobile = windowWidth < 768;
  const scaleFactor = isMobile ? Math.min(0.48, (windowWidth - 40) / 794) : 1;
  const scaledHeight = isMobile ? (1123 * scaleFactor) + 100 : 'auto';

  return (
    <div className="flex flex-col lg:flex-row gap-6 md:gap-10 animate-in fade-in duration-700 max-w-full overflow-x-hidden box-border">
      <aside className="no-print w-full lg:w-80 space-y-6 shrink-0 order-2 lg:order-1">
        <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl border border-white/5 relative overflow-hidden text-left">
          <div className="relative z-10">
            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none mb-1">Recetario</h3>
            <div className="flex items-center gap-2">
               <Cloud size={10} className="text-lingote-gold" />
               <p className="text-lingote-gold font-bold uppercase tracking-widest text-[8px]">Sincronización Cloud</p>
            </div>
          </div>
          <button 
            onClick={() => setShowExecutiveTable(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg text-[8px] font-black uppercase text-lingote-gold hover:bg-white/20 transition-all border border-lingote-gold/20"
          >
            <BarChart3 size={12} /> Tabla Maestra
          </button>
          <Calculator className="absolute -right-4 -bottom-4 text-white/5" size={100} />
        </div>
        <div className="bg-white rounded-[2.5rem] border border-lingote-accent shadow-xl overflow-hidden p-2">
          {loading ? (
             <div className="h-40 flex flex-col items-center justify-center text-slate-300 gap-3">
                <Loader2 className="animate-spin" size={32} />
                <p className="text-[8px] font-black uppercase tracking-widest">Cargando Recetas...</p>
             </div>
          ) : (
            <div className="max-h-[60vh] overflow-y-auto space-y-1 p-2 custom-scrollbar">
              {recetas.map((r) => (
                <button key={r.id} onClick={() => setActiveId(r.id)} className={`w-full text-left p-5 rounded-2xl transition-all group ${activeId === r.id ? 'bg-slate-900 text-white shadow-xl scale-[1.02]' : 'hover:bg-slate-50 text-slate-400'}`}>
                  <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${activeId === r.id ? 'text-lingote-gold' : 'text-slate-300'}`}>{r.categoria}</p>
                  <h4 className="font-black text-sm uppercase italic leading-none">{r.nombre}</h4>
                </button>
              ))}
            </div>
          )}
          <div className="p-4 space-y-4 border-t border-slate-50 mt-2">
             <button onClick={crearNuevaReceta} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg active:scale-95"><Plus size={16} className="text-lingote-gold" /> Nueva Receta</button>
             <div className="grid grid-cols-2 gap-2">
               <button onClick={exportarDatos} className="w-full py-2 rounded-xl border border-lingote-accent text-[9px] font-black uppercase tracking-widest text-slate-400">Backup</button>
               <label className="w-full py-2 rounded-xl border border-lingote-accent text-[9px] font-black uppercase tracking-widest text-slate-400 cursor-pointer text-center">Cargar<input type="file" className="hidden" accept=".json" onChange={importarDatos} /></label>
             </div>
             <div className="grid grid-cols-2 gap-2">
               <button onClick={importarDesdeMaestro} className="flex items-center justify-center gap-2 py-2 rounded-xl border border-lingote-gold/30 text-[9px] font-black uppercase tracking-widest text-lingote-gold hover:bg-lingote-gold hover:text-white transition-all"><Database size={10} /> Cargar Maestro</button>
               <button onClick={limpiarMaestro} className="flex items-center justify-center gap-2 py-2 rounded-xl border border-red-100 text-[9px] font-black uppercase tracking-widest text-red-300 hover:bg-red-50 hover:text-red-500 transition-all"><Trash2 size={10} /> Quitar Maestro</button>
             </div>
             <button onClick={() => setShowConfigGastos(!showConfigGastos)} className="w-full py-2 rounded-xl border border-lingote-accent text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center justify-center gap-2 hover:bg-slate-50">Config. Local 🏠</button>
          </div>
        </div>
      </aside>

      <main className="flex-1 order-1 lg:order-2 space-y-8 min-w-0">
        {activeReceta ? (
          <>
            <div className="bg-white rounded-[3rem] border border-lingote-accent shadow-2xl overflow-hidden">
              <div className="p-6 md:p-6 space-y-10 md:space-y-16">
                <div className="flex flex-col md:flex-row justify-between items-start gap-8 md:gap-2 text-left">
                   <div className="space-y-4 md:col-span-2 w-full text-left">
                      <div className="flex items-center gap-3 text-left">
                        <input className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter w-full bg-transparent outline-none border-b-2 border-transparent focus:border-lingote-gold pb-2 transition-all leading-none text-left" value={activeReceta.nombre} onChange={(e) => actualizarReceta({ nombre: e.target.value })} />
                      </div>
                      <div className="flex flex-wrap gap-2 md:gap-4">
                        <select className="bg-slate-50 px-4 py-2 rounded-xl font-black text-[10px] md:text-xs text-slate-400 uppercase tracking-widest border border-slate-100 outline-none focus:border-lingote-gold" value={activeReceta.categoria} onChange={(e) => actualizarReceta({ categoria: e.target.value })}>
                          <option value="lingotes">Lingotes</option>
                          <option value="promociones">Promociones</option>
                          <option value="bebidas">Bebidas</option>
                          <option value="postres">Postres</option>
                          <option value="salsas">Salsas/Extras</option>
                          <option value="retail">Retail</option>
                          <option value="recetas base">Recetas Base</option>
                        </select>
                        <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 group">
                           <span className="text-[10px] font-black text-slate-300 uppercase italic">Venta Final:</span>
                           <button onClick={() => actualizarReceta({ esProductoFinal: !activeReceta.esProductoFinal })} className={`w-10 h-5 rounded-full transition-all relative ${activeReceta.esProductoFinal ? 'bg-slate-900' : 'bg-slate-200'}`}>
                             <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${activeReceta.esProductoFinal ? 'left-6' : 'left-1'}`} />
                           </button>
                        </div>
                      </div>
                   </div>
                   <div className="w-full md:w-96 h-full md:h-48 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 overflow-hidden relative group cursor-pointer hover:border-lingote-gold transition-all" onClick={() => fileInputRef.current?.click()}>
                      {activeReceta.imagen ? <img src={activeReceta.imagen} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="Receta" /> : <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-2"><ImageIcon size={32} /><span className="text-[8px] font-black uppercase tracking-widest italic">Subir Foto</span></div>}
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
                   <div className="bg-slate-50 p-6 md:p-8 rounded-[2.5rem] border border-slate-100 space-y-2 relative overflow-hidden group shadow-inner text-left">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] italic">Rendimiento</p>
                      <div className="flex items-end gap-2 relative z-10 text-left"><input type="number" className="text-4xl md:text-5xl font-black text-slate-900 bg-transparent w-20 outline-none tabular-nums italic tracking-tighter text-left" value={activeReceta.porciones} onChange={(e) => actualizarReceta({ porciones: Number(e.target.value) })} /><span className="text-xs font-black text-slate-400 uppercase mb-2 italic">Packs</span></div>
                   </div>
                   <div className="bg-slate-50 p-6 md:p-8 rounded-[2.5rem] border border-slate-100 space-y-2 relative overflow-hidden group shadow-inner text-left">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] italic">Margen Objetivo</p>
                      <div className="flex items-end gap-1 relative z-10 text-left"><input type="number" className="text-4xl md:text-5xl font-black text-slate-900 bg-transparent w-20 outline-none tabular-nums italic tracking-tighter text-left" value={activeReceta.margenObjetivo} onChange={(e) => actualizarReceta({ margenObjetivo: Number(e.target.value) })} /><span className="text-2xl font-black text-lingote-gold mb-1">%</span></div>
                   </div>
                   <div className="bg-slate-50 p-6 md:p-8 rounded-[2.5rem] border border-slate-100 space-y-2 relative overflow-hidden group shadow-inner text-left">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] italic">Packaging</p>
                      <div className="flex items-end gap-1 relative z-10 text-left"><span className="text-2xl font-black text-slate-300 mb-1 leading-none italic">₡</span><input type="number" className="text-4xl md:text-5xl font-black text-slate-900 bg-transparent w-full outline-none tabular-nums italic tracking-tighter text-left" value={activeReceta.packaging} onChange={(e) => actualizarReceta({ packaging: Number(e.target.value) })} /></div>
                   </div>
                </div>

                <div className="space-y-6 md:space-y-10 text-left">
                  <div className="flex justify-between items-center px-4">
                     <h4 className="text-xl md:text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Escandallo</h4>
                     <div className="bg-slate-900 text-white px-5 py-2 rounded-full text-[9px] font-black uppercase italic tracking-widest shadow-xl">{activeReceta.ingredientes.length} Insumos</div>
                  </div>
                  <div className="md:hidden space-y-4 text-left">
                    {activeReceta.ingredientes.map((ing) => (
                      <div key={ing.id} className="bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4 overflow-hidden relative group text-left">
                        <div className="flex justify-between items-center gap-3">
                           <div className="flex items-center gap-3 flex-1 min-w-0">
                             {ing.insumoMaestroId ? <div className="bg-slate-900 p-2.5 rounded-xl text-lingote-gold"><Database size={12} className="animate-pulse" /></div> : <div className="bg-slate-50 p-2.5 rounded-xl text-slate-300"><Tag size={12} /></div>}
                             <input list={`insumos-maestros-mob-${ing.id}`} className="flex-1 bg-transparent font-black text-slate-800 uppercase italic outline-none text-sm truncate text-left" value={ing.nombre} onChange={(e) => updateIngrediente(ing.id, { nombre: e.target.value })} placeholder="Insumo..." />
                             <datalist id={`insumos-maestros-mob-${ing.id}`}>{insumosMaestros.map(m => <option key={m.id} value={m.nombre} />)}</datalist>
                           </div>
                           <button onClick={() => actualizarReceta({ ingredientes: activeReceta.ingredientes.filter(i => i.id !== ing.id) })} className="p-2 text-slate-200 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-left">
                           <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100/50 text-left"><p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Cant. ({ing.unidad === 'unidad' || ing.unidad === 'unid' ? 'unid' : 'g/ml'})</p><input type="number" className="w-full bg-transparent font-black text-slate-700 outline-none text-base tabular-nums text-left" value={ing.cantidadReceta} onChange={(e) => updateIngrediente(ing.id, { cantidadReceta: Number(e.target.value) })} /></div>
                           <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100/50 text-right"><p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Merma (%)</p><div className="flex items-center justify-end gap-1"><input type="number" min="0" max="99" className="w-10 bg-transparent font-black text-slate-500 text-center text-sm outline-none" value={ing.merma} onChange={(e) => updateIngrediente(ing.id, { merma: Math.max(0, Math.min(99, Number(e.target.value))) })} /><span className="text-[8px] text-slate-300 font-black">%</span></div></div>
                           <div className="bg-slate-50/50 p-3.5 rounded-2xl border border-dashed border-slate-200 flex flex-col justify-center text-left"><p className="text-[7px] font-black text-slate-300 uppercase tracking-widest mb-0.5">P. Kilo/Litro</p><p className="text-xs font-black text-slate-400 italic tabular-nums text-left">₡{ing.precioCompra.toLocaleString()}</p></div>
                           <div className="bg-slate-900 p-3.5 rounded-2xl shadow-lg flex flex-col justify-center items-end text-right"><p className="text-[7px] font-black text-white/30 uppercase tracking-[0.2em] mb-0.5">Subtotal</p><p className="text-base font-black text-lingote-gold italic tabular-nums text-right">₡{Math.round(calcularCostoIngrediente(ing)).toLocaleString()}</p></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="hidden md:block overflow-x-auto rounded-[2rem] border border-slate-50 shadow-inner">
                    <table className="w-full min-w-[700px] text-slate-700 uppercase font-black italic text-left">
                      <thead><tr className="text-[11px] font-black uppercase text-slate-300 border-b border-slate-100 text-left tracking-widest"><th className="pb-5 pl-6 text-left">Insumo / Ingrediente</th><th className="pb-5 text-left">P. Kilo/Litro/Unid</th><th className="pb-5 text-center">Cant. Receta</th><th className="pb-5 text-center">% Merma</th><th className="pb-5 text-right">Subtotal</th><th className="pb-5 text-right pr-6"></th></tr></thead>
                      <tbody className="divide-y divide-slate-50 text-sm font-bold text-slate-700">
                        {activeReceta.ingredientes.map((ing) => (
                          <tr key={ing.id} className="group hover:bg-slate-50/80 transition-colors text-left">
                            <td className="py-6 pl-6 text-left relative text-left"><div className="flex items-center gap-2"><input list={`insumos-maestros-${ing.id}`} className="w-full bg-transparent font-black text-slate-700 outline-none uppercase tracking-tight text-left" value={ing.nombre} onChange={(e) => updateIngrediente(ing.id, { nombre: e.target.value })} placeholder="Nombre del insumo..." />{ing.insumoMaestroId && <Database size={14} className="text-lingote-gold shrink-0 animate-pulse" />}<datalist id={`insumos-maestros-${ing.id}`}>{insumosMaestros.map(m => <option key={m.id} value={m.nombre} />)}</datalist></div></td>
                            <td className="py-6 font-bold text-slate-400 italic text-left tracking-widest font-serif">₡<input type="number" className="w-24 bg-transparent outline-none font-black text-slate-600 text-lg italic tracking-tighter text-left" value={ing.precioCompra} onChange={(e) => updateIngrediente(ing.id, { precioCompra: Number(e.target.value) })} /></td>
                            <td className="py-6 text-center font-black text-base text-slate-600"><input type="number" className="w-20 bg-transparent outline-none text-center font-black" value={ing.cantidadReceta} onChange={(e) => updateIngrediente(ing.id, { cantidadReceta: Number(e.target.value) })} /></td>
                            <td className="py-6 text-center font-bold text-slate-300"><div className="flex items-center justify-center bg-white border border-slate-100 rounded-lg px-2 py-1 shadow-sm w-fit mx-auto"><input type="number" min="0" max="99" className="w-10 bg-transparent font-black text-slate-400 text-center text-sm outline-none" value={ing.merma} onChange={(e) => updateIngrediente(ing.id, { merma: Math.max(0, Math.min(99, Number(e.target.value))) })} /><span className="text-[10px] text-slate-300">%</span></div></td>
                            <td className="py-6 text-right font-black text-slate-800 tracking-tighter text-2xl italic font-serif text-right">₡{Math.round(calcularCostoIngrediente(ing)).toLocaleString()}</td>
                            <td className="py-6 text-right pr-6 text-slate-200 group-hover:text-red-500 transition-colors"><button onClick={() => actualizarReceta({ ingredientes: activeReceta.ingredientes.filter(i => i.id !== ing.id) })} className="p-2.5 hover:bg-red-50 rounded-xl transition-all shadow-sm"><Trash2 size={20} /></button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <button onClick={() => actualizarReceta({ ingredientes: [...activeReceta.ingredientes, { id: Date.now().toString(), nombre: '', precioCompra: 0, cantidadReceta: 0, merma: 0 }] })} className="mt-6 md:mt-10 flex items-center gap-2 md:gap-3 px-6 md:px-8 py-3 md:py-4 bg-white border-2 border-slate-100 rounded-xl md:rounded-2xl text-[9px] md:text-[11px] font-black uppercase text-lingote-gold hover:border-lingote-gold transition-all shadow-sm active:scale-95 italic text-left"><Plus size={14} /> Insumo</button>

                <div className="mt-8 md:mt-16 pt-6 md:pt-10 border-t border-lingote-accent flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8 text-slate-600 font-black italic w-full">
                  <button onClick={eliminarReceta} className="text-[9px] md:text-[11px] font-black uppercase text-red-300 hover:text-red-500 transition-all tracking-[0.1em]">Eliminar Receta</button>
                  <div className="flex gap-2 md:gap-4 w-full md:w-auto">
                    <button onClick={() => setShowFichaPreview(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-12 py-3.5 md:py-5 bg-slate-100 text-slate-600 rounded-xl md:rounded-[1.5rem] font-black text-[10px] md:text-xs uppercase hover:bg-slate-200 transition-all shadow-sm italic">Previsualizar</button>
                    <button onClick={() => guardarEnNube(activeReceta)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-12 py-3.5 md:py-5 bg-green-600 text-white rounded-xl md:rounded-[1.5rem] font-black text-[10px] md:text-xs uppercase shadow-2xl shadow-green-100 hover:bg-green-700 active:scale-95 transition-all italic"><Save size={16} /> Guardar</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-1 no-print text-left">
               <div className="bg-slate-900 p-6 rounded-3xl text-white border border-white/5 shadow-xl relative overflow-hidden text-left"><p className="text-[8px] font-black uppercase text-lingote-gold tracking-widest mb-1 italic">Costo Batch</p><h3 className="text-3xl font-black italic tracking-tighter text-left">₡{Math.round(totalCosto).toLocaleString()}</h3><Database className="absolute -right-4 -bottom-4 text-white/5" size={80} /></div>
               <div className="bg-white p-6 rounded-3xl border border-lingote-accent shadow-sm text-left"><p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-1 italic">Costo Unidad</p><h3 className="text-3xl font-black italic tracking-tighter text-slate-900 text-left">₡{Math.round(costoUnidad).toLocaleString()}</h3></div>
               <div className="bg-white p-6 rounded-3xl border border-lingote-accent shadow-sm text-left relative overflow-hidden">
                  <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-1 italic">PVP Sugerido ({activeReceta.margenObjetivo}%)</p>
                  <h3 className="text-3xl font-black italic tracking-tighter text-slate-400 text-left line-through">₡{Math.round(pvpSugerido).toLocaleString()}</h3>
                  <div className="mt-4 pt-4 border-t border-slate-50">
                    <p className="text-[8px] font-black uppercase text-lingote-gold tracking-widest mb-2 italic">Precio de Venta Real (Manual)</p>
                    <div className="relative">
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">₡</span>
                      <input 
                        type="number" 
                        className="w-full bg-transparent pl-8 text-4xl font-black italic tracking-tighter text-slate-900 outline-none border-b-2 border-slate-100 focus:border-lingote-gold transition-all"
                        value={activeReceta.precioVentaManual || ''} 
                        onChange={(e) => {
                          const newPrice = Number(e.target.value);
                          const newMargin = newPrice > 0 ? ((1 - (costoUnidad / newPrice)) * 100).toFixed(1) : 0;
                          actualizarReceta({ 
                            precioVentaManual: newPrice,
                            margenObjetivo: Number(newMargin)
                          });
                        }}
                        placeholder={Math.round(pvpSugerido).toString()}
                      />
                    </div>
                  </div>
               </div>
               <div className="bg-green-600 p-6 rounded-3xl text-white shadow-xl shadow-green-100 text-left flex flex-col justify-center">
                  <p className="text-[8px] font-black uppercase text-white/60 tracking-widest mb-1 italic">Utilidad Neta Real / Unid</p>
                  <h3 className="text-4xl font-black italic tracking-tighter text-left">
                    ₡{Math.round((activeReceta.precioVentaManual || pvpSugerido) - costoUnidad).toLocaleString()}
                  </h3>
                  <p className="text-[7px] font-bold uppercase mt-2 opacity-80">
                    Basado en {activeReceta.precioVentaManual ? 'Precio Manual' : 'Margen Objetivo'}
                  </p>
               </div>
            </div>
          </>
        ) : (
          <div className="h-[80vh] flex flex-col items-center justify-center text-slate-200 gap-6"><Calculator size={80} strokeWidth={1} /><div className="text-center space-y-2 text-left"><h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-300 leading-none">Seleccioná una Receta</h3><p className="text-[10px] font-black uppercase tracking-[0.2em]">O creá una nueva para empezar el escandallo</p></div></div>
        )}
      </main>

      {showConfigGastos && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-300 no-print">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowConfigGastos(false)} />
          <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-500 border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="p-8 md:p-10 border-b border-slate-50 flex justify-between items-center bg-slate-900 text-white text-left"><div className="text-left"><h3 className="text-2xl font-black uppercase italic tracking-tighter leading-none">Gastos Operativos</h3><p className="text-[8px] font-black text-lingote-gold uppercase tracking-[0.3em] mt-1 text-left">Estructura de Costos Fijos</p></div><button onClick={() => setShowConfigGastos(false)} className="text-white/40 hover:text-white transition-colors"><X size={32} /></button></div>
            <div className="p-8 md:p-10 overflow-y-auto space-y-10 custom-scrollbar text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                 {Object.entries(gastos).map(([key, value]) => (
                   <div key={key} className="space-y-3 text-left"><label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest italic text-left">{key.replace(/([A-Z])/g, ' $1')}</label><div className="relative group text-left"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold group-focus-within:text-lingote-gold transition-colors">{key === 'metaVentasMensual' ? '#' : '₡'}</span><input type="number" className="w-full bg-slate-50 border-2 border-slate-100 p-4 pl-10 rounded-2xl font-black text-slate-700 outline-none focus:border-lingote-gold transition-all text-left" value={value} onChange={(e) => setGastos({...gastos, [key]: Number(e.target.value)})} /></div></div>
                 ))}
              </div>
              <div className="bg-slate-900 p-8 rounded-[2rem] text-white flex justify-between items-center shadow-xl border border-white/5 overflow-hidden relative text-left">
                 <div className="relative z-10 text-left"><p className="text-[9px] font-black uppercase text-white/40 tracking-widest mb-1 italic">Total Gastos Fijos</p><h4 className="text-4xl font-black italic tracking-tighter text-lingote-gold leading-none text-left">₡{totalGastosFijos.toLocaleString()}</h4></div>
                 <div className="text-right relative z-10 text-right"><p className="text-[9px] font-black uppercase text-white/40 tracking-widest mb-1 italic">Cuota por Unidad</p><h4 className="text-4xl font-black italic tracking-tighter text-white leading-none text-right">₡{Math.round(cuotaOperativaPorUnidad).toLocaleString()}</h4></div>
                 <Calculator className="absolute -right-4 -bottom-4 text-white/5" size={100} />
              </div>
            </div>
            <div className="p-8 bg-slate-50 border-t border-slate-100"><button onClick={() => setShowConfigGastos(false)} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase italic tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all active:scale-95">Guardar Configuración</button></div>
          </div>
        </div>
      )}

      {showFichaPreview && activeReceta && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 md:p-10 animate-in fade-in duration-500 no-print">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-2xl" onClick={() => setShowFichaPreview(false)} />
          <div className="relative w-full max-w-5xl h-full flex flex-col items-center gap-6 animate-in zoom-in duration-500 overflow-y-auto p-6 scrollbar-hide text-left">
            <div className="flex gap-4 sticky top-0 z-10 w-full justify-center text-left">
              <button onClick={downloadFicha} className="flex-1 max-w-xs flex items-center justify-center gap-3 px-8 py-5 bg-lingote-gold text-slate-900 rounded-2xl font-black text-xs uppercase shadow-2xl active:scale-95 transition-all italic"><Download size={20} /> Descargar PNG</button>
              <button onClick={() => setShowFichaPreview(false)} className="w-16 h-16 flex items-center justify-center bg-white/10 text-white rounded-2xl hover:bg-white/20 transition-all backdrop-blur-xl border border-white/10"><X size={32} /></button>
            </div>
            <div className="w-full flex justify-center py-10 text-left" style={{ height: scaledHeight }}>
              <div style={{ transform: isMobile ? `scale(${scaleFactor})` : 'none', transformOrigin: 'top center', flexShrink: 0 }} className="text-left">
                <div ref={fichaRef} className="w-[794px] h-[1123px] bg-white p-12 shadow-2xl flex flex-col relative text-left">
                  <div className="flex justify-between items-start mb-10 pb-10 border-b-4 border-slate-900 text-left">
                    <div className="space-y-4 text-left">
                      <img src="/logo_lingote_oficial_ligero.png" className="w-24 h-24 object-contain" alt="Logo" />
                      <div className="text-left"><h2 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter leading-none text-left">{activeReceta.nombre}</h2><p className="text-xs font-black text-lingote-gold uppercase tracking-[0.3em] mt-1 text-left">Ficha Técnica de Producción</p></div>
                    </div>
                    <div className="text-right space-y-1 text-right">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">El Lingote Español</p>
                      <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest leading-none text-right">Cartago, Costa Rica</p>
                      <div className="mt-4 bg-slate-900 text-white p-4 rounded-2xl inline-block text-right"><p className="text-[8px] font-black uppercase tracking-widest opacity-50 mb-1">Costo Batch</p><p className="text-2xl font-black italic tracking-tighter leading-none text-right">₡{Math.round(totalCosto).toLocaleString()}</p></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-12 flex-1 text-left">
                     <div className="space-y-10 text-left">
                        <div className="space-y-6 text-left">
                          <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-2 text-left"><Database size={16} className="text-lingote-gold" /><h4 className="text-sm font-black uppercase italic tracking-widest text-slate-800">Escandallo Detallado</h4></div>
                          <table className="w-full text-[10px] uppercase font-bold text-slate-600 text-left">
                            <thead><tr className="border-b border-slate-100 text-[8px] text-slate-400 font-black text-left"><th className="py-2 text-left">Insumo</th><th className="py-2 text-center">Cant.</th><th className="py-2 text-right">Costo</th></tr></thead>
                            <tbody className="divide-y divide-slate-50 italic text-left">
                              {activeReceta.ingredientes.map(ing => (
                                <tr key={ing.id}><td className="py-3 font-black text-slate-800 text-left">{ing.nombre}</td><td className="py-3 text-center">{ing.cantidadReceta}g</td><td className="py-3 text-right font-black text-right">₡{Math.round(calcularCostoIngrediente(ing)).toLocaleString()}</td></tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="space-y-4 text-left">
                          <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-2 text-left"><Plus size={16} className="text-lingote-gold" /><h4 className="text-sm font-black uppercase italic tracking-widest text-slate-800">Resumen Financiero</h4></div>
                          <div className="grid grid-cols-2 gap-4 text-left">
                             <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left"><p className="text-[7px] font-black text-slate-400 uppercase mb-1">Costo Unitario</p><p className="text-xl font-black italic text-slate-900 leading-none">₡{Math.round(costoUnidad).toLocaleString()}</p></div>
                             <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-left"><p className="text-[7px] font-black text-lingote-gold uppercase mb-1 text-left">Margen</p><p className="text-xl font-black italic text-white leading-none text-left">{activeReceta.margenObjetivo}%</p></div>
                             <div className="p-4 bg-green-50 rounded-2xl border border-green-100 col-span-2 text-left"><p className="text-[7px] font-black text-green-600 uppercase mb-1">PVP Recomendado</p><p className="text-2xl font-black italic text-green-800 leading-none">₡{Math.round(pvpSugerido).toLocaleString()}</p></div>
                          </div>
                        </div>
                     </div>
                     <div className="space-y-10 text-left">
                        <div className="aspect-[4/5] rounded-[2.5rem] border-4 border-slate-50 shadow-inner overflow-hidden text-left">{activeReceta.imagen && <img src={activeReceta.imagen} className="w-full h-full object-cover" alt="Receta" />}</div>
                        <div className="p-8 bg-slate-50 rounded-[2.5rem] space-y-4 border border-slate-100 shadow-sm relative overflow-hidden text-left"><h4 className="text-[10px] font-black uppercase italic tracking-[0.2em] text-slate-400 text-left">Notas de Producción</h4><div className="h-32 border-b border-slate-200"></div><p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest text-center mt-2 italic text-center">Control de Calidad: El Lingote Español</p><Calculator className="absolute -right-6 -bottom-6 text-slate-200/50" size={100} /></div>
                     </div>
                  </div>
                  <div className="mt-10 pt-8 border-t border-slate-100 flex justify-between items-center text-left">
                     <div className="flex gap-10 text-left"><div className="text-left"><p className="text-[7px] font-black text-slate-300 uppercase mb-1 italic">Fecha Generación</p><p className="text-[10px] font-black text-slate-800">{new Date().toLocaleDateString('es-CR')}</p></div><div className="text-left"><p className="text-[7px] font-black text-slate-300 uppercase mb-1 italic">Versión</p><p className="text-[10px] font-black text-slate-800 tracking-widest uppercase">RTCA-V1</p></div></div>
                     <div className="text-right text-right"><p className="text-xs font-black italic text-slate-900 tracking-tighter leading-none text-right">EL LINGOTE ESPAÑOL</p><p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic leading-none text-right">Artesanía Gastronómica Premium</p></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {showExecutiveTable && (
        <div className="fixed inset-0 z-[70] flex flex-col bg-slate-900 animate-in fade-in duration-300 no-print">
          <header className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-900 text-white">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-2xl text-lingote-gold">
                <BarChart3 size={24} />
              </div>
              <div className="text-left">
                <h3 className="text-2xl font-black uppercase italic tracking-tighter leading-none">Tabla Maestra de Rentabilidad</h3>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Visión Ejecutiva y Análisis de Márgenes</p>
              </div>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={downloadTablePDF}
                className="flex items-center gap-2 px-6 py-3 bg-lingote-gold text-slate-900 rounded-xl font-black text-[10px] uppercase shadow-lg active:scale-95 transition-all italic"
              >
                <Download size={16} /> Exportar Reporte PDF
              </button>
              <button 
                onClick={() => setShowExecutiveTable(false)}
                className="w-12 h-12 flex items-center justify-center bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all"
              >
                <X size={24} />
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar">
            {/* CONTENEDOR PARA EL PDF (Oculto en UI pero capturado por html2canvas) */}
            <div id="executive-profitability-table" className="hidden">
              <div className="bg-white p-12 w-[210mm] min-h-[297mm] space-y-12 text-slate-900 uppercase font-black italic">
                {/* Resumen Superior PDF */}
                <div className="flex justify-between items-end border-b-4 border-slate-900 pb-10">
                  <div className="space-y-4">
                      <img src="/logo_lingote_oficial_ligero.png" className="w-20 h-20 object-contain" alt="Logo" />
                      <div className="text-left">
                        <h2 className="text-3xl font-black text-slate-900 uppercase italic leading-none">Reporte de Estrategia Comercial</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">Actualizado a: {new Date().toLocaleDateString('es-CR')}</p>
                      </div>
                  </div>
                  <div className="text-right space-y-2">
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Gastos Fijos Mensuales</p>
                      <h4 className="text-4xl font-black italic text-slate-900 tracking-tighter leading-none">₡{totalGastosFijos.toLocaleString()}</h4>
                  </div>
                </div>

                {/* Tablas por Categoría PDF */}
                <div className="space-y-12">
                  {getOrderedRecetas().map((grupo) => (
                    <div key={grupo.categoria} className="space-y-6">
                        <div className="flex items-center gap-4">
                          <h3 className="text-sm font-black uppercase tracking-[0.4em] text-lingote-gold italic">{grupo.categoria}</h3>
                          <div className="h-1 flex-1 bg-slate-50"></div>
                        </div>
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-900 text-white text-[9px] tracking-widest">
                              <th className="py-4 pl-8">Producto</th>
                              <th className="py-4 text-center">Costo Absorbente</th>
                              <th className="py-4 text-center">Margen %</th>
                              <th className="py-4 text-center">PVP Sugerido</th>
                              <th className="py-4 text-right pr-8">Utilidad Neta</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {grupo.items.map((r: any) => (
                              <tr key={r.id}>
                                <td className="py-4 pl-8 text-xs text-slate-800">{r.nombre}</td>
                                <td className="py-4 text-center text-[11px] text-slate-400">₡{Math.round(r.costoUnidad).toLocaleString()}</td>
                                <td className="py-4 text-center text-xs text-slate-600">{r.margenObjetivo}%</td>
                                <td className="py-4 text-center text-base text-slate-900 font-black">₡{Math.round(r.pvp).toLocaleString()}</td>
                                <td className="py-4 text-right pr-8 text-xl font-black font-serif" style={{ color: r.status.hex }}>₡{Math.round(r.utilidad).toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                    </div>
                  ))}
                </div>
                <footer className="mt-auto pt-10 border-t border-slate-100 flex justify-between items-center text-[9px] font-bold text-slate-300">
                  <p>Generado por Lingote Control Center • v1.5 BI</p>
                  <p>Proyección basada en {gastos.metaVentasMensual} unidades/mes</p>
                </footer>
              </div>
            </div>

            {/* VISTA PREVIA PARA EL USUARIO (Mobile Responsive) */}
            <div className="max-w-6xl mx-auto space-y-12">
               {/* Resumen Superior UI */}
               <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-xl flex flex-col md:flex-row justify-between items-center gap-6 border border-white/10">
                  <div className="text-center md:text-left space-y-2">
                     <h2 className="text-2xl md:text-3xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">Resumen de Rentabilidad</h2>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Análisis de rendimiento por unidad vendida</p>
                  </div>
                  <div className="bg-slate-900 px-8 py-4 rounded-3xl text-center shadow-lg">
                     <p className="text-[8px] font-black text-lingote-gold uppercase tracking-widest mb-1 italic">Gastos de Operación</p>
                     <h4 className="text-2xl font-black italic text-white tracking-tighter leading-none">₡{totalGastosFijos.toLocaleString()}</h4>
                  </div>
               </div>

               {/* Lista de Productos UI */}
               <div className="space-y-16 pb-20">
                 {getOrderedRecetas().map((grupo) => (
                   <div key={grupo.categoria} className="space-y-6">
                      <div className="flex items-center gap-4 px-2">
                        <h3 className="text-xs md:text-sm font-black uppercase tracking-[0.4em] text-lingote-gold italic">{grupo.categoria}</h3>
                        <div className="h-px flex-1 bg-white/10"></div>
                      </div>

                      {/* VISTA TABLA (Escritorio) */}
                      <div className="hidden md:block overflow-hidden rounded-[2.5rem] bg-white border border-white/5 shadow-2xl">
                        <table className="w-full text-left uppercase font-black italic">
                          <thead>
                            <tr className="bg-slate-900 text-white text-[9px] tracking-widest">
                              <th className="py-5 pl-8">Producto</th>
                              <th className="py-5 text-center">Costo Absorbente</th>
                              <th className="py-5 text-center">Margen %</th>
                              <th className="py-5 text-center">PVP Sugerido</th>
                              <th className="py-5 text-right pr-8">Utilidad Neta</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {grupo.items.map((r: any) => (
                              <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="py-5 pl-8">
                                  <div className="flex items-center gap-4 text-left">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-50 overflow-hidden border border-slate-100 shrink-0 shadow-inner">
                                      {r.imagen ? <img src={r.imagen} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-200"><ImageIcon size={20} /></div>}
                                    </div>
                                    <span className="text-sm text-slate-800 tracking-tight">{r.nombre}</span>
                                  </div>
                                </td>
                                <td className="py-5 text-center text-[11px] text-slate-400">₡{Math.round(r.costoUnidad).toLocaleString()}</td>
                                <td className="py-5 text-center text-xs text-slate-600">{r.margenObjetivo}%</td>
                                <td className="py-5 text-center text-lg text-slate-900 font-black tracking-tighter">₡{Math.round(r.pvp).toLocaleString()}</td>
                                <td className="py-5 text-right pr-8">
                                  <div className="flex flex-col items-end">
                                    <span className={`text-2xl font-black tracking-tighter font-serif ${r.status.text}`}>
                                      ₡{Math.round(r.utilidad).toLocaleString()}
                                    </span>
                                    <span className={`text-[7px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full bg-slate-50 ${r.status.text}`}>
                                      {r.status.label}
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* VISTA CARDS (Móvil) */}
                      <div className="md:hidden space-y-4 px-1">
                        {grupo.items.map((r: any) => (
                          <div key={r.id} className="bg-white p-6 rounded-[2.5rem] shadow-lg border border-slate-50 space-y-5 text-left">
                             <div className="flex items-center gap-4 text-left">
                                <div className="w-16 h-16 rounded-3xl bg-slate-50 overflow-hidden border border-slate-100 shrink-0 shadow-inner">
                                  {r.imagen ? <img src={r.imagen} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-200"><ImageIcon size={24} /></div>}
                                </div>
                                <div className="text-left">
                                   <h4 className="text-lg font-black text-slate-900 uppercase italic leading-tight">{r.nombre}</h4>
                                   <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1">Margen: {r.margenObjetivo}%</p>
                                </div>
                             </div>
                             
                             <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-50 p-4 rounded-2xl text-left">
                                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Costo Base</p>
                                   <p className="text-base font-black text-slate-500 italic leading-none">₡{Math.round(r.costoUnidad).toLocaleString()}</p>
                                </div>
                                <div className="bg-slate-900 p-4 rounded-2xl text-right">
                                   <p className="text-[8px] font-black text-lingote-gold uppercase tracking-widest mb-1 italic">PVP Sugerido</p>
                                   <p className="text-base font-black text-white italic leading-none">₡{Math.round(r.pvp).toLocaleString()}</p>
                                </div>
                             </div>

                             <div className="pt-4 border-t border-dashed border-slate-100 flex justify-between items-center text-left">
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Utilidad Neta / Unid.</span>
                                  <span className={`text-[7px] font-black uppercase tracking-[0.2em] w-fit ${r.status.text}`}>{r.status.label}</span>
                                </div>
                                <span className={`text-3xl font-black tracking-tighter italic font-serif ${r.status.text}`}>₡{Math.round(r.utilidad).toLocaleString()}</span>
                             </div>
                          </div>
                        ))}
                      </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rentabilidad;
