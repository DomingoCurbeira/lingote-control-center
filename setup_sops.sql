-- Crear tabla para los Manuales SOP
create table if not exists manuales_sop (
  id text primary key,
  titulo text not null,
  objetivo text,
  imagen_principal text,
  ingredientes jsonb,
  herramientas jsonb,
  pasos jsonb,
  updated_at timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- Habilitar RLS
alter table manuales_sop enable row level security;

-- Política: Solo Administradores (usuarios autenticados) pueden hacer TODO
create policy "Admin total manuales" on manuales_sop for all to authenticated using (true);

-- Nota: No creamos política para el público, así los manuales son secretos industriales.
