ALTER TABLE wn_schedulers
  ADD COLUMN active boolean DEFAULT true;


-- DROP INDEX mail_tracks_mail_id_index;

CREATE INDEX mail_tracks_mail_id_index
  ON mail_tracks
  USING btree
  (mail_id);


-- DROP TABLE wn_statuses;

CREATE TABLE public.wn_statuses
(
   id bigint, 
   group_code character varying(3), 
   scheduler_id bigint, 
   count bigint, 
   started timestamp with time zone DEFAULT now(), 
   finished timestamp with time zone, 
   success boolean, 
   PRIMARY KEY (id), 
   FOREIGN KEY (group_code) REFERENCES groups (code) ON UPDATE CASCADE ON DELETE SET NULL, 
   FOREIGN KEY (scheduler_id) REFERENCES wn_schedulers (id) ON UPDATE CASCADE ON DELETE NO ACTION
) 
WITH (
  OIDS = FALSE
)
;
ALTER TABLE public.wn_statuses
  OWNER TO vzmaileruser;


-- DROP INDEX wn_status_group_code_index;

CREATE INDEX wn_status_group_code_index
  ON wn_statuses
  USING btree
  (group_code COLLATE pg_catalog."default");


-- DROP TABLE wn_tracks;

CREATE TABLE public.wn_tracks
(
  id bigint NOT NULL,
  email_address_id bigint,
  status_id bigint,
  "time" timestamp with time zone,
  CONSTRAINT wn_tracks_pkey PRIMARY KEY (id),
  CONSTRAINT wn_tracks_email_address_id_fkey FOREIGN KEY (email_address_id)
      REFERENCES email_addresses (id) MATCH SIMPLE
      ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT wn_tracks_status_id_fkey FOREIGN KEY (status_id)
      REFERENCES wn_statuses (id) MATCH SIMPLE
      ON UPDATE CASCADE ON DELETE CASCADE
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.wn_tracks
  OWNER TO vzmaileruser;


-- DROP INDEX wn_tracks_status_id_index;

CREATE INDEX wn_tracks_status_id_index
  ON wn_tracks
  USING btree
  (status_id);