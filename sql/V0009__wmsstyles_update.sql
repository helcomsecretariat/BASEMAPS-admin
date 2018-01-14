-- DROP TABLE public.wmsstyles;

CREATE TABLE public.wmsstyles
(
  id bigint NOT NULL,
  parent bigint NOT NULL,
  name character varying(100),
  urls character varying(400)[],
  main boolean,
  CONSTRAINT wmsstyles_pkey PRIMARY KEY (id),
  CONSTRAINT wmsstyles_parent_fkey FOREIGN KEY (parent)
      REFERENCES public.wms_infos (parent) MATCH SIMPLE
      ON UPDATE CASCADE ON DELETE CASCADE
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.wmsstyles
  OWNER TO basemapsuser;


ALTER TABLE public.wmses
   ALTER COLUMN url TYPE character varying(400);