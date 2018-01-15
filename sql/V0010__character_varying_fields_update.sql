ALTER TABLE public.categories
   ALTER COLUMN label TYPE character varying(200);
ALTER TABLE public.wms_infos
   ALTER COLUMN title TYPE character varying(200);
ALTER TABLE public.wms_infos
   ALTER COLUMN keywords TYPE character varying(200)[];
ALTER TABLE public.wms_infos
   ALTER COLUMN formats TYPE character varying(100)[];
ALTER TABLE public.wmses
   ALTER COLUMN label TYPE character varying(200);
ALTER TABLE public.wmses
   ALTER COLUMN name TYPE character varying(200);
ALTER TABLE public.wmses
   ALTER COLUMN url TYPE character varying(500);
ALTER TABLE public.wmsstyles
   ALTER COLUMN name TYPE character varying(200);
ALTER TABLE public.wmsstyles
   ALTER COLUMN urls TYPE character varying(500)[];