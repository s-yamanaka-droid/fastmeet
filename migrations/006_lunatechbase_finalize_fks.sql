-- Add the two circular FastMeet foreign keys after the data copy completes.

BEGIN;

ALTER TABLE public.fastmeet_organizations
  ADD CONSTRAINT fastmeet_organizations_owner_user_id_fkey
  FOREIGN KEY (owner_user_id) REFERENCES public.fastmeet_users(id) ON DELETE RESTRICT;

ALTER TABLE public.fastmeet_users
  ADD CONSTRAINT fastmeet_users_default_organization_id_fkey
  FOREIGN KEY (default_organization_id) REFERENCES public.fastmeet_organizations(id);

COMMIT;
