-- DROP TABLE public.wfs_infos;

CREATE TABLE public.wfs_infos
(
  parent bigint NOT NULL,
  updated timestamp with time zone NOT NULL DEFAULT now(),
  version character varying(7),
  organisation character varying(200),
  title character varying(200),
  keywords character varying(200)[],
  formats character varying(100)[],
  crs character varying(20)[],
  description text,
  languages character varying(3)[],
  lower_long double precision,
  lower_lat double precision,
  upper_long double precision,
  upper_lat double precision,
  fees text,
  access_constraints text,
  CONSTRAINT wfs_infos_pkey PRIMARY KEY (parent),
  CONSTRAINT wfs_infos_parent_fkey FOREIGN KEY (parent)
      REFERENCES public.services (id) MATCH SIMPLE
      ON UPDATE CASCADE ON DELETE CASCADE
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.wfs_infos
  OWNER TO basemapsuser;