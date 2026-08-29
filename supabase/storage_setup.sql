-- ==============================================================================
-- GlobeSkill - Supabase Storage Setup: Private 'learning-assets' Bucket
-- ==============================================================================
-- Purpose:
--   1. Create private storage bucket 'learning-assets' for certificates & course PDFs.
--   2. Enforce Row-Level Security (RLS) on storage.objects.
--   3. NGO Administrators and Trainers: Allowed to UPLOAD, UPDATE, and DELETE.
--   4. Authenticated Students: Allowed to READ and DOWNLOAD.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Create Private Storage Bucket
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'learning-assets',
    'learning-assets',
    false, -- Private bucket (no anonymous public URLs allowed)
    10485760, -- 10MB file limit
    ARRAY[
        'application/pdf',
        'image/png',
        'image/jpeg',
        'image/webp'
    ]
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];

-- ------------------------------------------------------------------------------
-- 2. Storage RLS Policies on storage.objects
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins and Trainers can upload learning assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read learning assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins and Trainers can delete learning assets" ON storage.objects;

-- POLICY 1: Upload (INSERT) - Only NGO Administrators and Trainers
CREATE POLICY "Admins and Trainers can upload learning assets"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'learning-assets'
        AND (
            public.is_ngo_admin()
            OR public.is_trainer()
        )
    );

-- POLICY 2: Read / Download (SELECT) - All Authenticated Users (Students, Trainers, Admins)
CREATE POLICY "Authenticated users can read learning assets"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'learning-assets'
    );

-- POLICY 3: Delete / Update - Only NGO Administrators and Trainers
CREATE POLICY "Admins and Trainers can delete learning assets"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'learning-assets'
        AND (
            public.is_ngo_admin()
            OR public.is_trainer()
        )
    );
