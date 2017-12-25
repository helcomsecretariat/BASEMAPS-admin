-- DROP TABLE public.users;

CREATE TABLE public.users
(
  id bigint NOT NULL,
  email character varying(200),
  name character varying(200),
  password character varying(50),
  role character varying(10),
  created timestamp with time zone NOT NULL DEFAULT now(),
  login_count integer,
  last_login timestamp with time zone,
  CONSTRAINT users_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.users
  OWNER TO basemapsuser;

-- Index: public.users_email_idx

-- DROP INDEX public.users_email_idx;

CREATE UNIQUE INDEX users_email_idx
  ON public.users
  USING btree
  (email COLLATE pg_catalog."default");


-- DROP TABLE public.categories;

CREATE TABLE public.categories
(
  id bigint NOT NULL,
  label character varying(100),
  "position" integer,
  parent bigint,
  created timestamp with time zone NOT NULL DEFAULT now(),
  updated timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT categories_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.categories
  OWNER TO basemapsuser;

ALTER TABLE public.categories
  ADD FOREIGN KEY (parent) REFERENCES public.categories (id) ON UPDATE CASCADE ON DELETE CASCADE;


-- DROP TABLE public.wmses;

CREATE TABLE public.wmses
(
  id bigint NOT NULL,
  label character varying(100),
  "position" integer,
  parent bigint,
  created timestamp with time zone NOT NULL DEFAULT now(),
  updated timestamp with time zone NOT NULL DEFAULT now(),
  name character varying(100),
  url character varying(300),
  meta_data_url character varying(300),
  view_url character varying(300),
  download_url character varying(300),
  catalogue_meta_id character varying(40),
  CONSTRAINT wmses_pkey PRIMARY KEY (id),
  CONSTRAINT wmses_parent_fkey FOREIGN KEY (parent)
      REFERENCES public.categories (id) MATCH SIMPLE
      ON UPDATE CASCADE ON DELETE CASCADE
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.wmses
  OWNER TO basemapsuser;
