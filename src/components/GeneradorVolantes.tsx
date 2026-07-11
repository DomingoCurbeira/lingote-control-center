import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Printer, Sparkles, QrCode, Layout, Eye, Info, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import { MASTER_DATABASE } from '../data/masterDatabase';

// Definición de Temas Visuales
interface TemaDiseno {
  id: string;
  nombre: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  accentText: string;
  badgeBg: string;
  badgeText: string;
  footerBg: string;
  footerText: string;
  fontClass: string;
}

const TEMAS: TemaDiseno[] = [
  {
    id: 'gold-clean',
    nombre: 'Dorado Limpio',
    bgColor: '#FFFFFF',
    borderColor: '#E2E8F0', // slate-200
    textColor: '#1E293B',    // slate-800
    accentText: '#D4AF37',   // lingote-gold
    badgeBg: '#F1F5F9',      // slate-100
    badgeText: '#475569',    // slate-600
    footerBg: '#0F172A',     // slate-900
    footerText: '#94A3B8',   // slate-400
    fontClass: 'font-sans'
  },
  {
    id: 'premium-dark', // Changed to match the inline check
    nombre: 'Negro Premium',
    bgColor: '#090D16',      // slate-950 equivalent
    borderColor: '#1E293B',  // slate-800
    textColor: '#FFFFFF',
    accentText: '#D4AF37',
    badgeBg: 'rgba(255, 255, 255, 0.1)',
    badgeText: '#F3CF7A',
    footerBg: '#020617',     // black
    footerText: '#64748B',   // slate-500
    fontClass: 'font-sans'
  },
  {
    id: 'rustic-traditional',
    nombre: 'Rústico Español',
    bgColor: '#FAF8F5',
    borderColor: 'rgba(139, 92, 26, 0.2)',
    textColor: '#1C1917',    // stone-900
    accentText: '#8B5A2B',   // amber-800
    badgeBg: 'rgba(139, 92, 26, 0.1)',
    badgeText: '#5C3A21',
    footerBg: '#1A0F0A',
    footerText: '#A8A29E',   // stone-400
    fontClass: 'font-serif'
  }
];

// Opciones de imágenes precargadas de productos principales
const IMAGENES_PRESET = MASTER_DATABASE
  .filter(p => p.categoria === 'lingotes' || p.categoria === 'postres')
  .map(p => ({
    nombre: p.nombre,
    path: `/${p.imagen}`
  }));

export default function GeneradorVolantes() {
  const [activeStep, setActiveStep] = useState<'diseño' | 'previsualizar'>('diseño');
  const [temaId, setTemaId] = useState('gold-clean');
  
  // Estados del Formulario
  const [titulo, setTitulo] = useState('¡HOLA VECINO!');
  const [subtitulo, setSubtitulo] = useState('Tu Lingote de Tortilla Española está más cerca que nunca.');
  const [oferta, setOferta] = useState('10% DE DESCUENTO');
  const [descOferta, setDescOferta] = useState('En tu primer pedido de Lingotes Familiares o Individuales indicándonos que eres de la zona.');
  const [slogan, setSlogan] = useState('Artesanales, jugosos y hechos con amor en el Residencial.');
  const [imagenUrl, setImagenUrl] = useState('/clasico.webp');
  const [qrUrl, setQrUrl] = useState('https://wa.me/50680000000?text=Hola!%20Soy%20vecino%20y%20quiero%20hacer%20un%20pedido%20con%20el%20descuento%20especial.');
  const [mostrarGuias, setMostrarGuias] = useState(true);

  // Obtener el tema seleccionado
  const tema = TEMAS.find(t => t.id === temaId) || TEMAS[0];

  // Dirección física predeterminada que acordamos
  const direccionReferencia = 'Residencial Hacienda del Rey, Guadalupe, Cartago (cerca de El Guarco)';

  const volanteRef = useRef<HTMLDivElement | null>(null);
  const [descargando, setDescargando] = useState(false);

  const descargarImagen = async () => {
    if (volanteRef.current) {
      setDescargando(true);
      try {
        const canvas = await html2canvas(volanteRef.current, {
          scale: 3, // Calidad óptima de alta resolución (3x píxeles)
          backgroundColor: null, // Transparencia en esquinas redondeadas
          useCORS: true, // Soporte para imágenes de servidores externos como el generador del QR
          logging: false,
          width: 352,
          height: 756,
        });

        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `volante-${titulo.toLowerCase().replace(/\s+/g, '-')}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Error al descargar la imagen:', err);
      } finally {
        setDescargando(false);
      }
    }
  };



  const handlePrint = () => {
    window.print();
  };

  // Renderizador de un volante individual para reusar en pantalla y en la hoja de impresión
  const VolanteView = ({ scaleClass = '', isForPreview = false }: { scaleClass?: string; isForPreview?: boolean }) => {
    // Generar la URL del QR de forma dinámica usando un generador gratuito confiable
    const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=0f172a&data=${encodeURIComponent(qrUrl)}`;

    const sizeClasses = isForPreview ? 'w-[352px] h-[756px]' : 'w-[93mm] h-[200mm]';

    return (
      <div 
        ref={isForPreview ? volanteRef : null}
        className={`${sizeClasses} rounded-[2rem] overflow-hidden flex flex-col justify-between p-6 border relative select-none box-border ${tema.fontClass} ${scaleClass}`}
        style={{ 
          backgroundColor: tema.bgColor, 
          borderColor: tema.borderColor, 
          color: tema.textColor,
          boxShadow: isForPreview ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' : 'none'
        }}
      >
        {/* Encabezado */}
        <div className="space-y-3 text-center">
          <div className="flex justify-center mb-1">
            <img 
              src="/logo_lingote_oficial_ligero.png" 
              alt="Logo El Lingote" 
              className="h-12 w-12 object-contain"
            />
          </div>
          <span 
            className="text-[9px] font-black uppercase tracking-[0.25em] py-1 px-3 rounded-full inline-block"
            style={{ 
              backgroundColor: tema.badgeBg, 
              color: tema.badgeText 
            }}
          >
            El Lingote Español
          </span>
          <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-none" style={{ color: tema.textColor }}>
            {titulo}
          </h3>
          <p className="text-[10px] opacity-80 leading-relaxed max-w-[220px] mx-auto font-medium" style={{ color: tema.textColor }}>
            {subtitulo}
          </p>
        </div>

        {/* Imagen del Producto en un contenedor estilizado */}
        <div className="my-4 relative aspect-[4/3] rounded-2xl overflow-hidden border shadow-md" style={{ borderColor: tema.borderColor }}>
          <img 
            src={imagenUrl} 
            alt="Producto Lingote" 
            className="w-full h-full object-cover rounded-2xl"
            onError={(e) => {
              // Fallback si la imagen falla
              (e.target as HTMLImageElement).src = '/clasico.webp';
            }}
          />
        </div>

        {/* Zona de Oferta */}
        <div 
          className="space-y-2 text-center py-3 px-4 rounded-2xl border border-dashed"
          style={{ 
            backgroundColor: tema.id === 'premium-dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(212, 175, 55, 0.05)', 
            borderColor: tema.accentText 
          }}
        >
          <h4 className="text-xl font-black uppercase tracking-tight italic" style={{ color: tema.accentText }}>
            {oferta}
          </h4>
          <p className="text-[9px] leading-relaxed font-bold opacity-90" style={{ color: tema.textColor }}>
            {descOferta}
          </p>
        </div>

        {/* QR y Detalles de Pedido */}
        <div 
          className="grid grid-cols-12 gap-3 items-center my-4 p-3 rounded-2xl border"
          style={{ 
            backgroundColor: tema.id === 'premium-dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(241, 245, 249, 0.5)', 
            borderColor: tema.id === 'premium-dark' ? 'rgba(255, 255, 255, 0.05)' : '#E2E8F0' 
          }}
        >
          <div className="col-span-8 space-y-1 text-left">
            <span className="text-[8px] font-black uppercase tracking-wider flex items-center gap-1" style={{ color: tema.accentText }}>
              <QrCode size={10} /> Escanea para Pedir
            </span>
            <p className="text-[8px] font-bold opacity-80 leading-normal" style={{ color: tema.textColor }}>
              Apunta con la cámara de tu celular para abrir nuestro chat de WhatsApp y realizar tu pedido directamente.
            </p>
          </div>
          <div className="col-span-4 flex justify-end">
            <div className="bg-white p-1 rounded-xl shadow-md border flex items-center justify-center" style={{ borderColor: '#E2E8F0' }}>
              <img 
                src={qrSrc} 
                alt="QR Pedido WhatsApp" 
                className="w-16 h-16 object-contain"
              />
            </div>
          </div>
        </div>

        {/* Pie de página con dirección */}
        <div 
          className="mt-auto -mx-6 -mb-6 p-4 text-center rounded-b-[2rem] space-y-1"
          style={{ 
            backgroundColor: tema.footerBg, 
            color: tema.footerText 
          }}
        >
          <p className="text-[9px] font-black tracking-widest uppercase italic" style={{ color: tema.accentText }}>
            {slogan}
          </p>
          <p className="text-[8px] font-medium leading-tight max-w-[260px] mx-auto opacity-70" style={{ color: tema.footerText }}>
            📍 {direccionReferencia}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* TÍTULO Y PRESENTACIÓN */}
      <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 bg-lingote-gold/10 px-3 py-1 rounded-full text-slate-800 border border-lingote-gold/20">
            <Sparkles size={14} className="text-lingote-gold" />
            <span className="text-[9px] font-black uppercase tracking-wider">Herramienta de Marketing</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Generador de Volantes</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Diseña y exporta volantes listos para el vecindario</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {activeStep === 'previsualizar' && (
            <>
              <button
                onClick={descargarImagen}
                disabled={descargando}
                className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-lingote-gold text-slate-950 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-500 transition-all shadow-lg active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Download size={16} /> {descargando ? 'Generando...' : 'Descargar Imagen'}
              </button>
              <button
                onClick={handlePrint}
                className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95 cursor-pointer"
              >
                <Printer size={16} /> Imprimir Hoja
              </button>
            </>
          )}
        </div>
      </div>

      {/* PESTAÑAS DE NAVEGACIÓN MÓVIL (MOBILE FIRST) */}
      <div className="no-print lg:hidden flex bg-white p-2 rounded-2xl border border-slate-100 shadow-sm gap-2">
        <button
          onClick={() => setActiveStep('diseño')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            activeStep === 'diseño' ? 'bg-lingote-gold text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Layout size={16} /> 1. Diseñar
        </button>
        <button
          onClick={() => setActiveStep('previsualizar')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            activeStep === 'previsualizar' ? 'bg-lingote-gold text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Eye size={16} /> 2. Previsualizar
        </button>
      </div>

      {/* DISEÑO EN PANTALLAS GRANDES Y LÓGICA DE VISIBILIDAD */}
      <div className="no-print grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* PANEL DE FORMULARIO - Visible en paso 'diseño' en móvil, siempre visible en desktop */}
        <div className={`lg:col-span-6 space-y-6 ${activeStep === 'diseño' ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 border-b border-slate-50 pb-3 flex items-center gap-2">
              <Sparkles size={16} className="text-lingote-gold" /> Personalizar Diseño
            </h3>

            {/* SELECCIÓN DE TEMA */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Estilo del Volante</label>
              <div className="grid grid-cols-3 gap-2">
                {TEMAS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTemaId(t.id)}
                    className={`py-3 px-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all text-center ${
                      temaId === t.id 
                        ? 'border-lingote-gold bg-lingote-gold/5 text-slate-800 font-black' 
                        : 'border-slate-100 bg-slate-50 text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    {t.nombre}
                  </button>
                ))}
              </div>
            </div>

            {/* CAMPOS DE TEXTO */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Título</label>
                  <input
                    type="text"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-100 focus:outline-none focus:border-lingote-gold font-bold text-xs uppercase"
                    placeholder="Ej: ¡HOLA VECINO!"
                  />
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Oferta Principal</label>
                  <input
                    type="text"
                    value={oferta}
                    onChange={(e) => setOferta(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-100 focus:outline-none focus:border-lingote-gold font-bold text-xs uppercase"
                    placeholder="Ej: 10% DE DESCUENTO"
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Descripción del Volante</label>
                <textarea
                  value={subtitulo}
                  onChange={(e) => setSubtitulo(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-slate-100 focus:outline-none focus:border-lingote-gold font-medium text-xs"
                  placeholder="Mensaje introductorio o descripción del local..."
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Condiciones / Detalles Oferta</label>
                <textarea
                  value={descOferta}
                  onChange={(e) => setDescOferta(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-slate-100 focus:outline-none focus:border-lingote-gold font-medium text-xs"
                  placeholder="Detalles sobre cómo aplicar la promoción..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Eslogan de Cierre</label>
                  <input
                    type="text"
                    value={slogan}
                    onChange={(e) => setSlogan(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-100 focus:outline-none focus:border-lingote-gold font-bold text-xs"
                    placeholder="Frase final..."
                  />
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Imagen del Producto</label>
                  <select
                    value={imagenUrl}
                    onChange={(e) => setImagenUrl(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-100 focus:outline-none focus:border-lingote-gold font-bold text-xs bg-white"
                  >
                    {IMAGENES_PRESET.map((img) => (
                      <option key={img.path} value={img.path}>{img.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Enlace del Código QR (WhatsApp / Web)</label>
                <input
                  type="text"
                  value={qrUrl}
                  onChange={(e) => setQrUrl(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-100 focus:outline-none focus:border-lingote-gold font-medium text-xs"
                  placeholder="URL para generar el QR..."
                />
              </div>
            </div>

            {/* OPCIONES EXTRAS */}
            <div className="border-t border-slate-50 pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mostrarGuias}
                  onChange={(e) => setMostrarGuias(e.target.checked)}
                  className="w-5 h-5 rounded-lg border-slate-100 accent-lingote-gold"
                />
                <div className="text-left">
                  <span className="text-xs font-black uppercase tracking-tight text-slate-800 block">Guías de Corte en Impresión</span>
                  <span className="text-[9px] text-slate-400 font-medium">Imprime guías de puntos para cortar con tijera</span>
                </div>
              </label>
            </div>
            
            {/* NOTA INFORMATIVA */}
            <div className="bg-slate-50 p-4 rounded-2xl flex gap-3 text-left border border-slate-100">
              <Info size={16} className="text-slate-400 shrink-0 mt-0.5" />
              <p className="text-[9px] text-slate-400 leading-normal font-bold uppercase tracking-wider">
                La dirección de contacto se jala automáticamente como <span className="text-slate-800">{direccionReferencia}</span>.
              </p>
            </div>
          </div>
        </div>

        {/* VISTA PREVIA - Visible en paso 'previsualizar' en móvil, siempre en desktop */}
        <div className={`lg:col-span-6 space-y-6 ${activeStep === 'previsualizar' ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm text-center space-y-6">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 border-b border-slate-50 pb-3 flex items-center justify-center gap-2">
              <Eye size={16} className="text-lingote-gold" /> Previsualización
            </h3>

            {/* Vista Previa Móvil del Volante Unitario */}
            <div className="flex justify-center p-2 bg-slate-50/50 rounded-3xl border border-slate-100 overflow-hidden relative">
              <div className="scale-[0.8] md:scale-95 lg:scale-90 origin-top my-4">
                <VolanteView isForPreview={true} />
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Para una experiencia óptima de impresión:</p>
              <ul className="text-[9px] text-slate-500 font-medium space-y-1 max-w-sm mx-auto list-disc list-inside text-left leading-normal">
                <li>Usa una hoja tamaño <strong className="text-slate-700">Carta / Letter</strong>.</li>
                <li>Configura la impresora en orientación <strong className="text-slate-700">Horizontal / Landscape</strong>.</li>
                <li>Establece los márgenes en <strong className="text-slate-700">Ninguno</strong> o <strong className="text-slate-700">Mínimos</strong>.</li>
                <li>Habilita los <strong className="text-slate-700">Gráficos de fondo</strong> si usas el Tema Negro o Rústico.</li>
              </ul>
            </div>

            {/* Botones de acción principales */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={descargarImagen}
                disabled={descargando}
                className="flex-1 flex items-center justify-center gap-2 bg-lingote-gold text-slate-950 py-5 rounded-[2rem] font-black text-sm uppercase italic tracking-widest hover:bg-amber-500 transition-all shadow-xl active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Download size={18} /> {descargando ? 'Generando...' : 'Descargar Imagen'}
              </button>
              <button
                onClick={handlePrint}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white py-5 rounded-[2rem] font-black text-sm uppercase italic tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-95 cursor-pointer"
              >
                <Printer size={18} /> Imprimir Hoja
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ÁREA EXCLUSIVA DE IMPRESIÓN (OCULTA EN PANTALLA, APARECE AL IMPRIMIR Y RENDERIZADA CON PORTAL DE REACT DIRECTO A BODY) */}
      {createPortal(
        <div 
          id="printable-volantes"
          className="fixed top-[-9999px] left-[-9999px] print:top-0 print:left-0 print:inset-0 print:grid print:grid-cols-3 print:gap-x-[4.5mm] print:p-[5mm] print:bg-white print:z-[9999] print:box-border print:w-[279.4mm] print:h-[215.9mm]"
        >
          {/* Renderizamos 3 volantes uno al lado del otro */}
          <div className={`relative flex items-center justify-center ${mostrarGuias ? 'border-r border-dashed border-slate-300' : ''}`}>
            <VolanteView scaleClass="scale-[0.98]" />
          </div>
          <div className={`relative flex items-center justify-center ${mostrarGuias ? 'border-r border-dashed border-slate-300' : ''}`}>
            <VolanteView scaleClass="scale-[0.98]" />
          </div>
          <div className="relative flex items-center justify-center">
            <VolanteView scaleClass="scale-[0.98]" />
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
