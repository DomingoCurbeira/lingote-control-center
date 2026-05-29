-- ACTUALIZACIÓN DE ESQUEMA: RECETAS PARA ESTÁNDAR B2B 10/10
-- Ejecuta esto en el SQL Editor de Supabase.

ALTER TABLE recetas 
ADD COLUMN IF NOT EXISTS denominacion TEXT,
ADD COLUMN IF NOT EXISTS descripcion TEXT,
ADD COLUMN IF NOT EXISTS alergenos TEXT,
ADD COLUMN IF NOT EXISTS vida_util TEXT,
ADD COLUMN IF NOT EXISTS conservacion TEXT,
ADD COLUMN IF NOT EXISTS instrucciones TEXT,
ADD COLUMN IF NOT EXISTS registro_sanitario TEXT,
ADD COLUMN IF NOT EXISTS peso_neto TEXT,
ADD COLUMN IF NOT EXISTS nutricion JSONB;

-- Asegurar que las políticas permitan manejar estos nuevos campos
DROP POLICY IF EXISTS "Admin total recetas" ON recetas;
CREATE POLICY "Admin total recetas" ON recetas FOR ALL TO anon USING (true) WITH CHECK (true);
