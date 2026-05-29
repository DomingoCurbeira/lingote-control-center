-- SCRIPT DE MIGRACIÓN: LISTA MAESTRA -> SUPABASE
-- Copia y pega este contenido en el SQL Editor de tu Dashboard de Supabase.

-- 1. Asegurar que RLS permita la inserción pública (opcional, pero recomendado para el prototipo)
ALTER TABLE insumos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir inserción pública temporal" ON insumos FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Permitir lectura pública" ON insumos FOR SELECT TO anon USING (true);
CREATE POLICY "Permitir actualización pública" ON insumos FOR UPDATE TO anon USING (true);

-- 2. Limpiar tabla si es necesario (opcional)
-- DELETE FROM insumos;

-- 3. Insertar Lista Maestra
INSERT INTO insumos (nombre, categoria, proveedor, unidad, precio_costo, kcal, carbs, protein, fat, sodium) VALUES
('Pan blanco artesanal', 'abarrotes', 'POR DEFINIR', 'unidad', 0, 0, 0, 0, 0, 0),
('patatas', 'vegetales', 'POR DEFINIR', 'kilo', 0, 0, 0, 0, 0, 0),
('frijoles negros', 'abarrotes', 'POR DEFINIR', 'kilo', 0, 0, 0, 0, 0, 0),
('arroz', 'abarrotes', 'POR DEFINIR', 'kilo', 0, 0, 0, 0, 0, 0),
('platano maduro', 'vegetales', 'POR DEFINIR', 'kilo', 0, 0, 0, 0, 0, 0),
('harina de trigo', 'abarrotes', 'POR DEFINIR', 'kilo', 0, 0, 0, 0, 0, 0),
('Huevos', 'carnes', 'POR DEFINIR', 'kilo', 0, 0, 0, 0, 0, 0),
('leche', 'lacteos', 'POR DEFINIR', 'litro', 0, 0, 0, 0, 0, 0),
('crema dulce', 'lacteos', 'POR DEFINIR', 'litro', 0, 0, 0, 0, 0, 0),
('leche en polvo pinito', 'lacteos', 'POR DEFINIR', 'litro', 0, 0, 0, 0, 0, 0),
('posta de cerdo', 'carnes', 'POR DEFINIR', 'kilo', 0, 0, 0, 0, 0, 0),
('queso crema', 'lacteos', 'POR DEFINIR', 'litro', 0, 0, 0, 0, 0, 0),
('Aceite de Girasol', 'otros', 'POR DEFINIR', 'litro', 0, 0, 0, 0, 0, 0),
('aceite de oliva', 'otros', 'POR DEFINIR', 'litro', 0, 0, 0, 0, 0, 0),
('Chile dulce', 'vegetales', 'POR DEFINIR', 'kilo', 0, 0, 0, 0, 0, 0),
('tomate', 'vegetales', 'POR DEFINIR', 'kilo', 0, 0, 0, 0, 0, 0),
('cebollas', 'vegetales', 'POR DEFINIR', 'kilo', 0, 0, 0, 0, 0, 0),
('culantro castilla', 'vegetales', 'POR DEFINIR', 'kilo', 0, 0, 0, 0, 0, 0),
('ajos', 'vegetales', 'POR DEFINIR', 'kilo', 0, 0, 0, 0, 0, 0),
('aguacate hass', 'vegetales', 'POR DEFINIR', 'kilo', 0, 0, 0, 0, 0, 0),
('limones mesinos', 'vegetales', 'POR DEFINIR', 'kilo', 0, 0, 0, 0, 0, 0),
('limones mandarinos', 'vegetales', 'POR DEFINIR', 'kilo', 0, 0, 0, 0, 0, 0),
('moras', 'vegetales', 'POR DEFINIR', 'kilo', 0, 0, 0, 0, 0, 0),
('cas', 'vegetales', 'POR DEFINIR', 'kilo', 0, 0, 0, 0, 0, 0),
('chile panameño', 'vegetales', 'POR DEFINIR', 'kilo', 0, 0, 0, 0, 0, 0),
('Coco lopez', 'abarrotes', 'POR DEFINIR', 'abarrotes', 0, 0, 0, 0, 0, 0),
('mahonesa hellmann''s', 'abarrotes', 'POR DEFINIR', 'abarrotes', 0, 0, 0, 0, 0, 0),
('chile chipotle asado', 'abarrotes', 'POR DEFINIR', 'abarrotes', 0, 0, 0, 0, 0, 0),
('sal fina', 'abarrotes', 'POR DEFINIR', 'abarrotes', 0, 0, 0, 0, 0, 0),
('donas', 'abarrotes', 'POR DEFINIR', 'abarrotes', 0, 0, 0, 0, 0, 0),
('salsa lizano', 'abarrotes', 'POR DEFINIR', 'abarrotes', 0, 0, 0, 0, 0, 0),
('sazon completa', 'abarrotes', 'POR DEFINIR', 'abarrotes', 0, 0, 0, 0, 0, 0),
('azúcar', 'abarrotes', 'POR DEFINIR', 'abarrotes', 0, 0, 0, 0, 0, 0),
('vino blanco', 'abarrotes', 'POR DEFINIR', 'abarrotes', 0, 0, 0, 0, 0, 0),
('paprika', 'abarrotes', 'POR DEFINIR', 'abarrotes', 0, 0, 0, 0, 0, 0),
('oregano', 'abarrotes', 'POR DEFINIR', 'abarrotes', 0, 0, 0, 0, 0, 0),
('seco', 'abarrotes', 'POR DEFINIR', 'abarrotes', 0, 0, 0, 0, 0, 0),
('ajo en polvo', 'abarrotes', 'POR DEFINIR', 'abarrotes', 0, 0, 0, 0, 0, 0),
('helado de vainilla', 'abarrotes', 'POR DEFINIR', 'abarrotes', 0, 0, 0, 0, 0, 0),
('dulce de leche', 'abarrotes', 'POR DEFINIR', 'abarrotes', 0, 0, 0, 0, 0, 0),
('nesquik', 'abarrotes', 'POR DEFINIR', 'abarrotes', 0, 0, 0, 0, 0, 0),
('levadura panadero', 'abarrotes', 'POR DEFINIR', 'abarrotes', 0, 0, 0, 0, 0, 0),
('natilla', 'lacteos', 'POR DEFINIR', 'litro', 0, 0, 0, 0, 0, 0),
('café', 'abarrotes', 'POR DEFINIR', 'abarrotes', 0, 0, 0, 0, 0, 0),
('vinagre balsámico', 'abarrotes', 'POR DEFINIR', 'abarrotes', 0, 0, 0, 0, 0, 0),
('vinagre blanco', 'abarrotes', 'POR DEFINIR', 'abarrotes', 0, 0, 0, 0, 0, 0);
