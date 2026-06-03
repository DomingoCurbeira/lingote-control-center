-- ACTUALIZACIÓN DE ESQUEMA: PRECIO DE VENTA MANUAL
-- Ejecuta esto en el SQL Editor de Supabase.

ALTER TABLE recetas 
ADD COLUMN IF NOT EXISTS precio_venta NUMERIC;
