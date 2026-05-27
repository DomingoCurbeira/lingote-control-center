import Swal from 'sweetalert2';
import { toast } from 'sonner';

// --- ESTILOS BASE PREMIUM ---
const swalBase = Swal.mixin({
  customClass: {
    popup: 'rounded-[2.5rem] border-none shadow-2xl font-sans',
    title: 'font-black uppercase italic tracking-tighter text-slate-800',
    htmlContainer: 'text-slate-500 font-medium leading-relaxed',
    confirmButton: 'bg-slate-900 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all border-none shadow-lg outline-none',
    cancelButton: 'bg-slate-100 text-slate-400 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all border-none outline-none'
  },
  buttonsStyling: false
});

export const notify = {
  // TOASTS RÁPIDOS (SONNER)
  success: (msg: string, desc?: string) => {
    toast.success(msg, {
      description: desc,
      className: 'rounded-3xl border-slate-100 shadow-xl p-5',
    });
  },
  
  error: (msg: string, desc?: string) => {
    toast.error(msg, {
      description: desc,
      className: 'rounded-3xl border-red-50 shadow-xl p-5',
    });
  },

  info: (msg: string, desc?: string) => {
    toast(msg, {
      description: desc,
      className: 'rounded-3xl border-slate-100 shadow-xl p-5',
    });
  },

  // MODALES DE IMPACTO (SWEETALERT2)
  confirm: async (title: string, text: string, icon: 'warning' | 'question' = 'warning') => {
    const result = await swalBase.fire({
      title,
      text,
      icon,
      showCancelButton: true,
      confirmButtonText: 'SÍ, PROCEDER',
      cancelButtonText: 'CANCELAR',
      reverseButtons: true
    });
    return result.isConfirmed;
  },

  alertSuccess: (title: string, text: string) => {
    swalBase.fire({
      title,
      text,
      icon: 'success',
      confirmButtonText: '¡ENTENDIDO, CHEF!',
    });
  },

  alertError: (title: string, text: string) => {
    swalBase.fire({
      title,
      text,
      icon: 'error',
      confirmButtonText: 'VOLVER A INTENTAR',
    });
  }
};
