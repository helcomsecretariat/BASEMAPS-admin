ALTER TABLE public.metadata
  ADD COLUMN description text;

ALTER TABLE public.wms_infos
  ADD COLUMN fees text;
ALTER TABLE public.wms_infos
  ADD COLUMN access_constraints text;