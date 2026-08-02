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

-- 3. TABLA DE OBRAS Y PROYECTOS (Con Galerías de Fotos)
CREATE TABLE IF NOT EXISTS public.proyectos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'en_proceso', -- 'en_proceso', 'programado', 'completado'
    progress INT DEFAULT 0,
    budget NUMERIC DEFAULT 0,
    start_date TEXT DEFAULT 'Pendiente',
    estimated_end TEXT DEFAULT 'Pendiente',
    images TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. HABILITAR ROW LEVEL SECURITY (RLS)
ALTER TABLE public.comunicados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proyectos ENABLE ROW LEVEL SECURITY;

-- 5. POLÍTICAS DE ACCESO PARA COMUNICADOS
CREATE POLICY "Permitir lectura pública de comunicados" 
ON public.comunicados FOR SELECT USING (true);

CREATE POLICY "Permitir inserción solo a usuarios autenticados" 
ON public.comunicados FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Permitir actualización solo a usuarios autenticados" 
ON public.comunicados FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Permitir eliminación solo a usuarios autenticados" 
ON public.comunicados FOR DELETE TO authenticated USING (true);

-- 6. POLÍTICAS DE ACCESO PARA DOCUMENTOS
CREATE POLICY "Permitir lectura pública de documentos" 
ON public.documentos FOR SELECT USING (true);

CREATE POLICY "Permitir inserción de documentos solo a autenticados" 
ON public.documentos FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Permitir eliminación de documentos solo a autenticados" 
ON public.documentos FOR DELETE TO authenticated USING (true);

-- 7. POLÍTICAS DE ACCESO PARA PROYECTOS / OBRAS
CREATE POLICY "Permitir lectura pública de proyectos" 
ON public.proyectos FOR SELECT USING (true);

CREATE POLICY "Permitir inserción de proyectos solo a autenticados" 
ON public.proyectos FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Permitir actualización de proyectos solo a autenticados" 
ON public.proyectos FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Permitir eliminación de proyectos solo a autenticados" 
ON public.proyectos FOR DELETE TO authenticated USING (true);
