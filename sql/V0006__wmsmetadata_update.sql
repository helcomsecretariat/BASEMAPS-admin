-- DROP TABLE public.wmsmetadata;

CREATE TABLE public.wmsmetadata
(
  id bigint NOT NULL,
  parent bigint,
  format character varying(10) DEFAULT 'UNKNOWN',
  url character varying(500),
  source character varying(10),
  CONSTRAINT wmsmetadata_pkey PRIMARY KEY (id),
  CONSTRAINT wmsmetadata_parent_fkey FOREIGN KEY (parent)
      REFERENCES public.wmses (id) MATCH SIMPLE
      ON UPDATE CASCADE ON DELETE CASCADE
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.wmsmetadata
  OWNER TO basemapsuser;