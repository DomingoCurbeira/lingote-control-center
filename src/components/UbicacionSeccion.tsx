import { useEffect, useRef } from 'react';
import { MapPin, Clock, Navigation, Info } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const UbicacionSeccion = () => {
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    // Si ya existe la instancia, no la recreamos
    if (mapRef.current) return;

    const lat = 9.856133;
    const lng = -83.946012;

    // Inicializar mapa
    const map = L.map('map-container', {
      center: [lat, lng],
      zoom: 17,
      zoomControl: false, // Desactivamos por defecto
    });

    // Agregar zoom en la esquina inferior derecha
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Cargar mapa base Voyager de CartoDB (elegante y minimalista)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    // Icono de pin dorado personalizado
    const goldIcon = L.divIcon({
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 bg-amber-500/40 rounded-full animate-ping"></div>
          <div class="relative bg-slate-950 p-2 rounded-full border border-amber-500 shadow-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d4af37" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
        </div>
      `,
      className: 'custom-div-icon',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    // Añadir marcador y abrir Popup inicial
    const marker = L.marker([lat, lng], { icon: goldIcon }).addTo(map);
    marker.bindPopup(`
      <div style="font-family: 'Inter', sans-serif; padding: 4px; min-width: 140px;">
        <h4 style="margin: 0 0 2px 0; font-weight: 900; text-transform: uppercase; font-style: italic; color: #0f172a; font-size: 11px; letter-spacing: 0.05em;">EL LINGOTE ESPAÑOL</h4>
        <p style="margin: 0; font-size: 9px; color: #d4af37; font-weight: 800; text-transform: uppercase; margin-bottom: 4px;">📍 Punto de Recogida</p>
        <p style="margin: 0; font-size: 9px; color: #475569; font-weight: 500; line-height: 1.3;">Residencial Hacienda del Rey, Guadalupe, Cartago (cerca de El Guarco).</p>
      </div>
    `).openPopup();

    mapRef.current = map;

    // Limpieza al desmontar
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <section className="py-12 px-4 space-y-8 bg-white/80 backdrop-blur-md rounded-[3rem] border border-slate-100 shadow-xl max-w-lg mx-auto my-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 bg-lingote-gold/10 px-4 py-1 rounded-full text-slate-800 border border-lingote-gold/20 mb-2">
          <MapPin size={14} className="text-lingote-gold" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Donde encontrarnos</span>
        </div>
        <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
          Nuestra Ubicación <br/>
          <span className="text-lingote-gold">Guadalupe, Cartago</span>
        </h2>
        <p className="text-slate-500 text-[11px] italic font-medium max-w-[280px] mx-auto uppercase tracking-wide">
          El sabor auténtico de España en Residencial Hacienda del Rey, cerca de El Guarco.
        </p>
      </div>

      <div className="space-y-6">
        {/* Mapa Interactivo Leaflet */}
        <div className="relative aspect-square rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white z-0 group">
          <div id="map-container" className="w-full h-full" style={{ zIndex: 0 }} />
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-slate-900/10 to-transparent pointer-events-none z-10" />
        </div>

        {/* Info de Recogida */}
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-50 flex items-start gap-4">
             <div className="bg-slate-900 p-3 rounded-2xl text-lingote-gold shrink-0">
                <Navigation size={20} />
             </div>
             <div className="text-left">
                <h4 className="font-black uppercase italic text-xs text-slate-800 tracking-tight">Punto de Recogida</h4>
                <p className="text-[10px] text-slate-500 font-medium italic mt-1 leading-relaxed">
                  Por ahora, trabajamos bajo la modalidad de <span className="font-bold text-slate-800">Take Away</span>. Una vez realices tu pedido por WhatsApp, te indicaremos el punto exacto en Residencial Hacienda del Rey, Guadalupe, Cartago (cerca de El Guarco).
                </p>
             </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-50 flex items-start gap-4">
             <div className="bg-slate-900 p-3 rounded-2xl text-lingote-gold shrink-0">
                <Clock size={20} />
             </div>
             <div className="text-left">
                <h4 className="font-black uppercase italic text-xs text-slate-800 tracking-tight">Horario de Atención</h4>
                <p className="text-[10px] text-slate-500 font-medium italic mt-1 uppercase tracking-tighter">
                  Lunes a Sábado <br/>
                  <span className="text-slate-900 font-black text-sm">11:00 AM — 8:00 PM</span>
                </p>
             </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-3xl shadow-xl flex items-start gap-4 text-white border border-white/5">
             <div className="bg-white/10 p-3 rounded-2xl text-lingote-gold shrink-0">
                <Info size={20} />
             </div>
             <div className="text-left">
                <h4 className="font-black uppercase italic text-xs tracking-tight text-lingote-gold">Dato Importante</h4>
                <p className="text-[9px] text-slate-400 font-medium italic mt-1 leading-relaxed">
                  Todos nuestros lingotes se preparan al momento para garantizar la jugosidad. Te recomendamos pedir con al menos <span className="text-white underline">20 minutos</span> de antelación.
                </p>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UbicacionSeccion;
