
-- Helper: create a confirmed auth user with password if missing, return their id
DO $$
DECLARE
  v_user_id uuid;
  v_email text;
  v_pwd text;
  v_name text;
  v_ws_id uuid;
  v_ws_name text;
  v_tier plan_tier;
  v_slug text;
  rec record;
BEGIN
  FOR rec IN
    SELECT * FROM (VALUES
      ('seed.free@photobrief.test',     'Seed!Free2026',     'Hartley Owner',    'a28e0f4d-cfa2-417c-9992-0ad95db1389e'::uuid, 'Hartley Handyman',     'free'::plan_tier,     'hartley-handyman'),
      ('seed.starter@photobrief.test',  'Seed!Starter2026',  'Bright Spark Owner','9bb02bf4-5aa7-428f-8d91-f7b180c32858'::uuid, 'Bright Spark Plumbing','starter'::plan_tier,  'bright-spark-plumbing'),
      ('seed.pro@photobrief.test',      'Seed!Pro2026',      'Northwind Owner',  '96fc42db-1f2f-40b3-b084-7de03d649c54'::uuid, 'Northwind HVAC',       'pro'::plan_tier,      'northwind-hvac'),
      ('seed.team@photobrief.test',     'Seed!Team2026',     'Cascade Owner',    'aa6d2bad-dfa4-4477-ac13-bc31236b0ced'::uuid, 'Cascade Junk Removal', 'team'::plan_tier,     'cascade-junk-removal'),
      ('seed.business@photobrief.test', 'Seed!Business2026', 'Apex Owner',       'a817bd72-e142-4270-98e9-30900e3f088e'::uuid, 'Apex Roofing Group',   'business'::plan_tier,  'apex-roofing-group')
    ) AS t(email, pwd, name, ws_id, ws_name, tier, slug)
  LOOP
    v_email := rec.email;
    v_pwd := rec.pwd;
    v_name := rec.name;
    v_ws_id := rec.ws_id;
    v_ws_name := rec.ws_name;
    v_tier := rec.tier;
    v_slug := rec.slug;

    -- Find or create auth user
    SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;
    IF v_user_id IS NULL THEN
      v_user_id := gen_random_uuid();
      INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password,
        email_confirmed_at, created_at, updated_at,
        raw_app_meta_data, raw_user_meta_data, is_super_admin
      ) VALUES (
        '00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated',
        v_email, crypt(v_pwd, gen_salt('bf')),
        now(), now(), now(),
        jsonb_build_object('provider','email','providers',array['email']),
        jsonb_build_object('name', v_name),
        false
      );
      INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), v_user_id,
        jsonb_build_object('sub', v_user_id::text, 'email', v_email, 'email_verified', true),
        'email', v_user_id::text, now(), now(), now()
      );
    END IF;

    -- Profile
    INSERT INTO public.profiles (id, email, name)
    VALUES (v_user_id, v_email, v_name)
    ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name;

    -- Workspace (with canonical id)
    INSERT INTO public.business_workspaces (id, name, slug, owner_id, plan_tier, status)
    VALUES (v_ws_id, v_ws_name, v_slug, v_user_id, v_tier, 'active')
    ON CONFLICT (id) DO UPDATE
      SET name = EXCLUDED.name,
          slug = EXCLUDED.slug,
          owner_id = EXCLUDED.owner_id,
          plan_tier = EXCLUDED.plan_tier,
          status = 'active';

    -- Default workspace pointer
    UPDATE public.profiles SET default_workspace_id = v_ws_id WHERE id = v_user_id;
  END LOOP;
END $$;
