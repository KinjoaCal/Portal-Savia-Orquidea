-- ===============================================================================
-- SCRIPT DE BASE DE DATOS PARA SUPABASE
-- Sitio Web Condominio Residencial Savia Orquídea
-- ===============================================================================
-- Copia y ejecuta este script en el SQL Editor de tu consola de Supabase (https://supabase.com)

-- 1. TABLA DE COMUNICADOS Y AVISOS
CREATE TABLE IF NOT EXISTS public.comunicados (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Comunicado',
    file_url TEXT,
    file_type TEXT, -- 'image' | 'document'
    file_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABLA DE DOCUMENTOS OFICIALES (Reglamentos, Actas, Reportes Financieros)
CREATE TABLE IF NOT EXISTS public.documentos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'General',
    file_url TEXT NOT NULL,
    file_type TEXT DEFAULT 'pdf',
    file_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. HABILITAR ROW LEVEL SECURITY (RLS)
ALTER TABLE public.comunicados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;

-- 4. POLÍTICAS DE ACCESO PARA COMUNICADOS
-- Cualquiera (público) puede leer los comunicados
CREATE POLICY "Permitir lectura pública de comunicados" 
ON public.comunicados FOR SELECT 
USING (true);

-- Solo usuarios autenticados (Mesa Directiva) pueden insertar comunicados
CREATE POLICY "Permitir inserción solo a usuarios autenticados" 
ON public.comunicados FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Solo usuarios autenticados pueden actualizar comunicados
CREATE POLICY "Permitir actualización solo a usuarios autenticados" 
ON public.comunicados FOR UPDATE 
TO authenticated 
USING (true);

-- Solo usuarios autenticados pueden eliminar comunicados
CREATE POLICY "Permitir eliminación solo a usuarios autenticados" 
ON public.comunicados FOR DELETE 
TO authenticated 
USING (true);

-- 5. POLÍTICAS DE ACCESO PARA DOCUMENTOS
-- Cualquiera (público) puede leer los documentos
CREATE POLICY "Permitir lectura pública de documentos" 
ON public.documentos FOR SELECT 
USING (true);

-- Solo usuarios autenticados pueden insertar documentos
CREATE POLICY "Permitir inserción de documentos solo a autenticados" 
ON public.documentos FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Solo usuarios autenticados pueden eliminar documentos
CREATE POLICY "Permitir eliminación de documentos solo a autenticados" 
ON public.documentos FOR DELETE 
TO authenticated 
USING (true);
