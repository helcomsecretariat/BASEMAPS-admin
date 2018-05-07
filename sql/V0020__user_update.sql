ALTER TABLE public.users
  ADD COLUMN organization character varying(500);
ALTER TABLE public.users
  ADD COLUMN phone character varying(15);
ALTER TABLE public.users
  ADD COLUMN "position" character varying(500);