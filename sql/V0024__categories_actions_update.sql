-- DROP TABLE public.categories_actions;

CREATE TABLE public.categories_actions
(
  id character varying(6) NOT NULL,
  created timestamp with time zone NOT NULL DEFAULT now(),
  action character varying(6),
  kind character varying(12),
  path text,
  user_id bigint,
  name character varying(200),
  email character varying(200),
  role character varying(10),
  CONSTRAINT categories_actions_pkey PRIMARY KEY (id, created)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.categories_actions
  OWNER TO basemapsuser;