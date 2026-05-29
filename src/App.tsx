import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Tag, Wallet, FileText, Menu, X, BookOpen, TrendingUp, ClipboardList, Power, Users, Database, Truck, BarChart3, ChefHat 
} from 'lucide-react';
import Rentabilidad from './components/Rentabilidad';
import FichasB2B from './components/FichasB2B';
import ManualesSOP from './components/ManualesSOP';
import CalculadoraROI from './components/CalculadoraROI';
import LandingPage from './components/LandingPage';
import Etiquetador from './components/Etiquetador';
import Dashboard from './components/Dashboard';
import BitacoraVentas from './components/BitacoraVentas';
import CajaBalances from './components/CajaBalances';
import GestionStock from './components/GestionStock';
import MonitorCocina from './components/MonitorCocina';
import CarteraClientes from './components/CarteraClientes';
import InventarioMaestro from './components/InventarioMaestro';
import DirectorioProveedores from './components/DirectorioProveedores';
import AnalisisVentas from './components/AnalisisVentas';
import { useUserStore } from './store/useUserStore';
import { Toaster } from 'sonner';

function App() {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('lingote_active_tab') || 'dashboard';
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { usuario, borrarUsuario } = useUserStore();

  // Guardar pestaña activa en localStorage
  useEffect(() => {
    localStorage.setItem('lingote_active_tab', activeTab);
  }, [activeTab]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'cocina', label: 'Monitor Cocina', icon: ChefHat },
    { id: 'stock', label: 'Estado del Local', icon: Power },
    { id: 'proveedores', label: 'Proveedores', icon: Truck },
    { id: 'insumos', label: 'Maestro Insumos', icon: Database },
    { id: 'finanzas', label: 'Rentabilidad', icon: Wallet },
    { id: 'fichas', label: 'Fichas B2B', icon: FileText },
    { id: 'sop', label: 'Códice SOP', icon: BookOpen },
    { id: 'ventas', label: 'Bitácora', icon: ClipboardList },
    { id: 'caja', label: 'Caja y Balances', icon: Wallet },
    { id: 'graficos', label: 'Popularidad', icon: BarChart3 },
    { id: 'etiquetas', label: 'Etiquetador', icon: Tag },
    { id: 'roi', label: 'Calculadora ROI', icon: TrendingUp },
    { id: 'clientes', label: 'Cartera VIP', icon: Users },
  ];

  // Si no hay usuario logueado como Admin, mostramos la cara pública (Landing)
  if (!usuario?.isAdmin) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen flex bg-lingote-bg text-lingote-text max-w-full overflow-x-hidden">
      
      {/* SIDEBAR DESKTOP */}
      <aside className="no-print hidden lg:flex flex-col w-64 bg-white border-r border-lingote-accent fixed h-full z-30 shadow-sm text-left">
        <div className="p-8 border-b border-lingote-accent flex flex-col items-center gap-4 text-center">
          <img src="/logo_lingote_oficial_ligero.png" alt="Logo" className="w-20 h-20 object-contain drop-shadow-sm" />
          <h1 className="text-xl font-black tracking-tighter text-lingote-gold uppercase italic leading-none">Lingote Control</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${
                activeTab === item.id ? 'bg-lingote-text text-white shadow-xl scale-[1.02]' : 'hover:bg-slate-50 text-slate-400'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-lingote-accent space-y-4">
          <button 
            onClick={() => borrarUsuario()}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-red-400 hover:bg-red-50 hover:text-red-600 transition-all border border-red-50"
          >
            <X size={16} /> Cerrar Sesión
          </button>
          <div className="text-[10px] text-slate-300 font-bold uppercase tracking-widest text-center">
            v1.0 • Pura Vida
          </div>
        </div>
      </aside>

      {/* HEADER MOBILE */}
      <header className="no-print lg:hidden fixed top-0 w-full h-16 bg-white/80 backdrop-blur-xl border-b border-lingote-accent flex items-center justify-between px-6 z-40">
        <div className="flex items-center gap-3">
          <img src="/logo_lingote_oficial_ligero.png" alt="Logo" className="h-10 w-10 object-contain" />
          <h1 className="text-lg font-black tracking-tighter text-lingote-gold uppercase italic leading-none">Lingote Admin</h1>
        </div>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-lingote-gold">
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </header>

      {/* MOBILE MENU OVERLAY */}
      {isMenuOpen && (
        <div className="no-print lg:hidden fixed inset-0 bg-white z-30 pt-20 overflow-y-auto animate-in fade-in duration-300">
          <nav className="p-6 space-y-4 pb-20">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMenuOpen(false);
                }}
                className={`w-full flex items-center gap-6 px-8 py-6 rounded-[2rem] text-xl font-black transition-all ${
                  activeTab === item.id ? 'bg-lingote-text text-white shadow-2xl' : 'bg-slate-50 text-slate-400'
                }`}
              >
                <item.icon size={28} />
                {item.label}
              </button>
            ))}
            <button 
              onClick={() => {
                borrarUsuario();
                setIsMenuOpen(false);
              }}
              className="w-full flex items-center gap-6 px-8 py-6 rounded-[2rem] text-xl font-black text-red-500 bg-red-50 mt-12"
            >
              <X size={28} /> Cerrar Sesión
            </button>
          </nav>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 lg:ml-64 p-2 md:p-8 lg:p-12 pt-20 lg:pt-12 min-h-screen max-w-full overflow-x-hidden">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'cocina' && <MonitorCocina />}
          {activeTab === 'stock' && <GestionStock />}
          {activeTab === 'proveedores' && <DirectorioProveedores />}
          {activeTab === 'clientes' && <CarteraClientes />}
          {activeTab === 'insumos' && <InventarioMaestro />}
          {activeTab === 'etiquetas' && <Etiquetador />}
          {activeTab === 'ventas' && <BitacoraVentas />}
          {activeTab === 'caja' && <CajaBalances />}
          {activeTab === 'graficos' && <AnalisisVentas />}
          {activeTab === 'finanzas' && <Rentabilidad />}
          {activeTab === 'fichas' && <FichasB2B />}
          {activeTab === 'roi' && <CalculadoraROI />}
          {activeTab === 'sop' && <ManualesSOP />}
        </div>
      </main>

      <Toaster position="bottom-right" expand={false} richColors />
    </div>
  );
}

export default App;
