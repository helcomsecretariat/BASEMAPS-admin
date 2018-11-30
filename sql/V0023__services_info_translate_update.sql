ALTER TABLE public.wms_infos
  ADD COLUMN title_en character varying(200);
ALTER TABLE public.wms_infos
  ADD COLUMN keywords_en character varying(200)[];
ALTER TABLE public.wms_infos
  ADD COLUMN description_en text;
ALTER TABLE public.wms_infos
  ADD COLUMN fees_en text;
ALTER TABLE public.wms_infos
  ADD COLUMN access_constraints_en text;

ALTER TABLE public.wfs_infos
  ADD COLUMN title_en character varying(200);
ALTER TABLE public.wfs_infos
  ADD COLUMN keywords_en character varying(200)[];
ALTER TABLE public.wfs_infos
  ADD COLUMN description_en text;
ALTER TABLE public.wfs_infos
  ADD COLUMN fees_en text;
ALTER TABLE public.wfs_infos
  ADD COLUMN access_constraints_en text;