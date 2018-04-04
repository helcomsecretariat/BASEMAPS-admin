ALTER TABLE public.wms_infos
  ADD COLUMN description text;
ALTER TABLE public.wms_infos
  ADD COLUMN bound_west double precision;
ALTER TABLE public.wms_infos
  ADD COLUMN bound_east double precision;
ALTER TABLE public.wms_infos
  ADD COLUMN bound_south double precision;
ALTER TABLE public.wms_infos
  ADD COLUMN bound_north double precision;


ALTER TABLE public.services
  DROP COLUMN label;
ALTER TABLE public.services
  DROP COLUMN helcom_metadata;
