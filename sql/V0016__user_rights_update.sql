ALTER TABLE public.services
  ADD COLUMN label character varying(200);


-- DROP TABLE public.user_rights;

CREATE TABLE public.user_rights
(
  id bigint NOT NULL,
  user_id bigint NOT NULL,
  category_id bigint,
  rights character varying(5),
  created timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_rights_pkey PRIMARY KEY (id),
  CONSTRAINT user_rights_user_fkey FOREIGN KEY (user_id)
      REFERENCES public.users (id) MATCH SIMPLE
      ON UPDATE CASCADE ON DELETE CASCADE
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.user_rights
  OWNER TO basemapsuser;
