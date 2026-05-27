import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProductoMenu } from '../data/menuPublico';

export interface ItemCarrito {
  idUnico: string;
  producto: ProductoMenu;
  cantidad: number;
  precioTotal: number;
}

interface CartState {
  carrito: ItemCarrito[];
  addItem: (producto: ProductoMenu) => void;
  removeItem: (idUnico: string) => void;
  updateCantidad: (idUnico: string, delta: number) => void;
  vaciarCarrito: () => void;
  getTotal: () => number;
  itemsCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      carrito: [],

      addItem: (producto) => {
        set((state) => {
          const index = state.carrito.findIndex(i => i.producto.id === producto.id);

          if (index !== -1) {
            const nuevoCarrito = [...state.carrito];
            nuevoCarrito[index].cantidad += 1;
            return { carrito: nuevoCarrito };
          }

          const nuevoItem: ItemCarrito = {
            idUnico: Math.random().toString(36).substring(7),
            producto,
            cantidad: 1,
            precioTotal: producto.precio
          };

          return { carrito: [...state.carrito, nuevoItem] };
        });
      },

      removeItem: (idUnico) => {
        set((state) => ({
          carrito: state.carrito.filter((i) => i.idUnico !== idUnico),
        }));
      },

      updateCantidad: (idUnico, delta) => {
        set((state) => ({
          carrito: state.carrito.map((i) =>
            i.idUnico === idUnico 
              ? { ...i, cantidad: Math.max(1, i.cantidad + delta) } 
              : i
          ),
        }));
      },

      vaciarCarrito: () => set({ carrito: [] }),

      getTotal: () => {
        const { carrito } = get();
        return carrito.reduce((acc, item) => acc + (item.precioTotal * item.cantidad), 0);
      },

      itemsCount: () => {
        const { carrito } = get();
        return carrito.reduce((acc, item) => acc + item.cantidad, 0);
      },
    }),
    { name: 'lingote-cart-storage' }
  )
);
