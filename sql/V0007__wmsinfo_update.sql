-- DROP TABLE public.wms_infos;

CREATE TABLE public.wms_infos
(
  parent bigint NOT NULL,
  updated timestamp with time zone NOT NULL DEFAULT now(),
  version character varying(7),
  organisation character varying(200),
  title character varying(50),
  keywords character varying(50)[],
  queryable boolean,
  formats character varying(20)[],
  crs character varying(20)[],
  scale_min double precision,
  scale_max double precision,
  CONSTRAINT wms_infos_pkey PRIMARY KEY (parent),
  CONSTRAINT wms_infos_parent_fkey FOREIGN KEY (parent)
      REFERENCES public.wmses (id) MATCH SIMPLE
      ON UPDATE CASCADE ON DELETE CASCADE
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.wms_infos
  OWNER TO basemapsuser;


ALTER TABLE public.wmses
  DROP COLUMN meta_data_url;
ALTER TABLE public.wmses
  DROP COLUMN view_url;
ALTER TABLE public.wmses
  DROP COLUMN download_url;
ALTER TABLE public.wmses
  DROP COLUMN catalogue_meta_id;
