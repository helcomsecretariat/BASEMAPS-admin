ALTER TABLE public.categories
  ADD COLUMN description character varying(5000);
ALTER TABLE public.categories
  ADD COLUMN tags character varying(500);