ALTER TABLE public.wmses
  RENAME TO services;

ALTER TABLE public.services RENAME CONSTRAINT wmses_pkey TO services_pkey;
ALTER TABLE public.services RENAME CONSTRAINT wmses_parent_fkey TO services_parent_fkey;

ALTER TABLE public.services
  ADD COLUMN type character varying(10) NOT NULL DEFAULT 'WMS';
ALTER TABLE public.services ALTER COLUMN type DROP DEFAULT;

ALTER TABLE public.wms_infos
  ADD COLUMN languages character varying(3)[];