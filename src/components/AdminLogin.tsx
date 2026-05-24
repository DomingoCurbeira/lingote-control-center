import { useState } from 'react';
import { Lock } from 'lucide-react';

interface AdminLoginProps {
  onSuccess: () => void;
}

const AdminLogin = ({ onSuccess }: AdminLoginProps) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  
  // PIN SECRETO: Cámbialo aquí a tu gusto
  const SECRET_PIN = '1234'; 

  const handlePinInput = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      if (newPin.length === 4) {
        if (newPin === SECRET_PIN) {
          onSuccess();
        } else {
          setError(true);
          setTimeout(() => {
            setPin('');
            setError(false);
          }, 800);
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center p-6 z-[9999] animate-in fade-in duration-500">
      <div className="w-full max-w-sm space-y-12 text-center">
        <div className="space-y-4">
           <div className="bg-white/5 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto border border-white/10 shadow-2xl">
              <Lock className={`${error ? 'text-red-500 animate-bounce' : 'text-lingote-gold'} transition-colors`} size={40} />
           </div>
           <div>
             <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">Acceso Restringido</h2>
             <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2">Introduce el PIN de Administración</p>
           </div>
        </div>

        {/* PIN DISPLAY */}
        <div className="flex justify-center gap-4">
           {[...Array(4)].map((_, i) => (
             <div key={i} className={`w-14 h-20 rounded-2xl border-2 flex items-center justify-center text-3xl font-black transition-all duration-300 ${error ? 'border-red-500 bg-red-500/10' : pin.length > i ? 'border-lingote-gold bg-lingote-gold/10 text-lingote-gold' : 'border-white/10 bg-white/5 text-white/20'}`}>
                {pin.length > i ? '•' : ''}
             </div>
           ))}
        </div>

        {/* KEYPAD */}
        <div className="grid grid-cols-3 gap-4">
           {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'DEL'].map((btn) => (
             <button 
                key={btn} 
                onClick={() => {
                  if (btn === 'C') setPin('');
                  else if (btn === 'DEL') setPin(pin.slice(0, -1));
                  else handlePinInput(btn);
                }}
                className={`h-16 rounded-2xl text-xl font-black transition-all active:scale-95 ${btn === 'C' || btn === 'DEL' ? 'bg-white/5 text-slate-400 text-xs' : 'bg-white/10 text-white hover:bg-lingote-gold hover:text-slate-900'}`}
             >
                {btn}
             </button>
           ))}
        </div>

        <p className="text-white/20 font-bold text-[8px] uppercase tracking-[0.5em] pt-8">Propiedad de El Lingote Español • 2026</p>
      </div>
    </div>
  );
};

export default AdminLogin;
