-- DROP TABLE public.password_reset_tokens;

CREATE TABLE public.password_reset_tokens
(
  id bigint NOT NULL,
  user_id bigint,
  browser character varying(500),
  ip character varying(15),
  created timestamp with time zone NOT NULL DEFAULT now(),
  expire timestamp with time zone NOT NULL,
  code character varying(64),
  finished boolean,
  CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id),
  CONSTRAINT password_reset_tokens_user_id_fkey FOREIGN KEY (user_id)
      REFERENCES public.users (id) MATCH SIMPLE
      ON UPDATE CASCADE ON DELETE CASCADE
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.password_reset_tokens
  OWNER TO basemapsuser;