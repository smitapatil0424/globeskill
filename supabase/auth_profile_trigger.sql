-- ==============================================================================
-- GlobeSkill - Secure Supabase Auth to Public Profile Trigger
-- ==============================================================================
-- Purpose:
--   Automatically creates a matching record in public.profiles whenever
--   a user registers through Supabase Auth (Email/Password, Google, etc.).
--
-- Security Best Practices Included:
--   1. SECURITY DEFINER: Executes with elevated privileges to insert into profiles.
--   2. SET search_path = public, auth: Guards against search_path hijacking vulnerabilities.
--   3. ON CONFLICT (id) DO NOTHING: Guarantees idempotency (prevents race condition crashes).
--   4. Exception Handling: Falls back gracefully if custom role casting fails.
-- ==============================================================================

-- Step 1: Create or Replace the Trigger Function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    default_role public.user_role := 'Student';
    assigned_role public.user_role;
    user_name TEXT;
BEGIN
    -- Extract full name from signup metadata or fallback to email username
    user_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        split_part(NEW.email, '@', 1),
        'GlobeSkill Learner'
    );

    -- Safely parse the role from user metadata
    BEGIN
        assigned_role := COALESCE(
            (NEW.raw_user_meta_data->>'role')::public.user_role,
            default_role
        );
    EXCEPTION
        WHEN OTHERS THEN
            -- If an invalid role string was passed, safely default to 'Student'
            assigned_role := default_role;
    END;

    -- Insert into public.profiles
    INSERT INTO public.profiles (
        id,
        full_name,
        email,
        role,
        avatar_url,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        user_name,
        NEW.email,
        assigned_role,
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL),
        now(),
        now()
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        updated_at = now();

    RETURN NEW;
END;
$$;

-- Step 2: Drop existing trigger if it exists to allow clean re-runs
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 3: Attach the Trigger to auth.users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Verification comment
COMMENT ON FUNCTION public.handle_new_user() IS 
    'Syncs new auth.users accounts directly into public.profiles with role and metadata.';
