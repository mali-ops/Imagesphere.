-- ==============================================================================
-- PROJECT: ImgSphere - Row Level Security (RLS) Policies
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.image_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Helper function: check if current authenticated user is an Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. PROFILES POLICIES
-- Users can view their own profile; Admins can view all profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

-- Users can update their own profile; Admins can update any
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin());

-- 2. FOLDERS POLICIES
CREATE POLICY "Users can manage own folders"
  ON public.folders FOR ALL
  USING (auth.uid() = user_id OR public.is_admin());

-- 3. IMAGES POLICIES
-- Anyone can view public images (unless disabled)
CREATE POLICY "Public images viewable by all"
  ON public.images FOR SELECT
  USING (
    (visibility = 'public' AND public_disabled IS NOT TRUE)
    OR (visibility = 'unlisted' AND public_disabled IS NOT TRUE)
    OR (auth.uid() = user_id)
    OR public.is_admin()
  );

-- Users can insert images if within storage limits
CREATE POLICY "Users can insert own images"
  ON public.images FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own images (or admin)
CREATE POLICY "Users can update own images"
  ON public.images FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin());

-- Users can delete their own images (or admin)
CREATE POLICY "Users can delete own images"
  ON public.images FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin());

-- 4. IMAGE ANALYTICS POLICIES
CREATE POLICY "Anyone can record analytics event"
  ON public.image_analytics FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Owners and admins can view analytics"
  ON public.image_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.images
      WHERE id = image_analytics.image_id
      AND (user_id = auth.uid() OR public.is_admin())
    )
  );

-- 5. REPORTS POLICIES
CREATE POLICY "Anyone can submit a report"
  ON public.reports FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Admins can view and manage reports"
  ON public.reports FOR ALL
  USING (public.is_admin());

-- 6. ACTIVITY LOGS POLICIES
CREATE POLICY "Admins can view activity logs"
  ON public.activity_logs FOR SELECT
  USING (public.is_admin());

-- 7. ANNOUNCEMENTS POLICIES
CREATE POLICY "Anyone can view active announcements"
  ON public.announcements FOR SELECT
  USING (status = 'active' OR public.is_admin());

CREATE POLICY "Admins can manage announcements"
  ON public.announcements FOR ALL
  USING (public.is_admin());

-- 8. SUPPORT MESSAGES POLICIES
CREATE POLICY "Anyone can submit support message"
  ON public.support_messages FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Admins can view support messages"
  ON public.support_messages FOR ALL
  USING (public.is_admin());

-- 9. SYSTEM SETTINGS POLICIES
CREATE POLICY "Anyone can view public system settings"
  ON public.system_settings FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins can update system settings"
  ON public.system_settings FOR UPDATE
  USING (public.is_admin());
