import { useState } from 'react';
import { Copy, CheckCircle2, Smartphone } from 'lucide-react';

interface Props {
  montoTotal: number;
  onBancoClick: () => void;
}

const PagoSinpeAyuda = ({ montoTotal, onBancoClick }: Props) => {
  const [copiadoNum, setCopiadoNum] = useState(false);
  const [copiadoMonto, setCopiadoMonto] = useState(false);
  
  const numeroSinpe = "60437179"; // Chef, recordá poner aquí tu número real

  const copiarDato = (texto: string, setStatus: (v: boolean) => void) => {
    const limpio = texto.replace(/[-₡.]/g, '');
    navigator.clipboard.writeText(limpio);
    setStatus(true);
    setTimeout(() => setStatus(false), 2000);
  };

  const abrirBanco = (url: string) => {
    window.open(url, '_blank');
    setTimeout(() => {
      onBancoClick();
    }, 500);
  };

  const bancos = [
    { 
      nombre: 'BAC', 
      logo: '/BAC_Credomatic.svg',
      protocolo: 'https://www1.sucursalelectronica.com/',
      bg: 'bg-white' 
    },
    { 
      nombre: 'BN', 
      logo: '/Banco_Nacional_de_Costa_Rica.png',
      protocolo: 'https://auth.bncr.fi.cr/adfs/ls?version=1.0&action=signin&realm=urn%3AAppProxy%3Acom&appRealm=37d0e840-bdc3-e911-90f3-005056b6cfbb&returnUrl=https%3A%2F%2Fbncr.bnonline.fi.cr%2FBNCR.InternetBanking.Web&client-request-id=8EE4B71C-A9BF-0002-D6EF-D691BFA9DB01',
      bg: 'bg-white'
    },
    { 
      nombre: 'BCR', 
      logo: '/banco-de-costa-rica.png',
      protocolo: 'https://www.personas.bancobcr.com/',
      bg: 'bg-white'
    }
  ];

  return (
    <div className="bg-white border-2 border-lingote-gold/30 rounded-[2.5rem] p-6 shadow-inner space-y-4 my-2 text-left">
      <div className="flex items-center gap-2 mb-1">
        <Smartphone className="text-slate-800" size={18} />
        <h4 className="font-black text-slate-800 uppercase italic text-[10px] tracking-tight text-left">
          Asistente de Pago SINPE
        </h4>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <button 
          onClick={() => copiarDato(numeroSinpe, setCopiadoNum)}
          className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100 active:scale-[0.98] transition-all"
        >
          <div className="text-left">
            <p className="text-[8px] font-black text-slate-400 uppercase italic">Copiar Número</p>
            <p className="text-sm font-black text-slate-800 italic leading-none">{numeroSinpe}</p>
          </div>
          <div className={`${copiadoNum ? 'bg-green-500' : 'bg-slate-900'} text-white p-1.5 rounded-lg transition-colors`}>
            {copiadoNum ? <CheckCircle2 size={14} /> : <Copy size={14} />}
          </div>
        </button>

        <button 
          onClick={() => copiarDato(montoTotal.toString(), setCopiadoMonto)}
          className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100 active:scale-[0.98] transition-all"
        >
          <div className="text-left">
            <p className="text-[8px] font-black text-slate-400 uppercase italic">Copiar Monto</p>
            <p className="text-sm font-black text-lingote-gold italic leading-none">₡{montoTotal.toLocaleString()}</p>
          </div>
          <div className={`${copiadoMonto ? 'bg-green-500' : 'bg-lingote-gold'} text-white p-1.5 rounded-lg transition-colors`}>
            {copiadoMonto ? <CheckCircle2 size={14} /> : <Copy size={14} />}
          </div>
        </button>
      </div>

      <div className="space-y-3 pt-2 border-t border-slate-100">
        <p className="text-[9px] font-black text-slate-400 uppercase italic text-center">Abrir mi App bancaria:</p>
        <div className="flex justify-center gap-4">
          {bancos.map((banco) => (
            <button
              key={banco.nombre}
              onClick={() => abrirBanco(banco.protocolo)}
              className="flex flex-col items-center gap-1 active:scale-90 transition-all group"
            >
              <div className={`${banco.bg} w-14 h-14 rounded-2xl flex items-center justify-center p-2 shadow-sm border border-slate-100 group-hover:shadow-md group-hover:border-lingote-gold/50`}>
                <img 
                  src={banco.logo} 
                  alt={banco.nombre} 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-[8px] font-black text-slate-400 uppercase italic tracking-widest">{banco.nombre}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="text-[8px] text-center text-slate-300 font-bold uppercase italic px-2 leading-tight">
        Copiá los datos y tocá tu banco para pagar. <br/>
        <span className="text-slate-400">Guardá tu comprobante, se pedirá en caja.</span>
      </p>
    </div>
  );
};

export default PagoSinpeAyuda;
