DROP TRIGGER wms_create ON public.services;
DROP TRIGGER wms_delete ON public.services;
DROP TRIGGER wms_reposition ON public.services;

DROP FUNCTION public.on_wms_delete();

CREATE OR REPLACE FUNCTION public.on_service_delete()
  RETURNS trigger AS
$BODY$
BEGIN
	UPDATE services SET position = position - 1
	WHERE position > OLD.position AND CASE WHEN OLD.parent IS NULL THEN parent IS NULL ELSE parent = OLD.parent END;
	RETURN OLD;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION public.on_service_delete()
  OWNER TO basemapsuser;


DROP FUNCTION public.on_wms_insert();

CREATE OR REPLACE FUNCTION public.on_service_insert()
  RETURNS trigger AS
$BODY$
BEGIN
	UPDATE services SET position = position + 1
	WHERE position >= NEW.position AND id != NEW.id AND CASE WHEN NEW.parent IS NULL THEN parent IS NULL ELSE parent = NEW.parent END;
	RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION public.on_service_insert()
  OWNER TO basemapsuser;


DROP FUNCTION public.on_wms_reposition();

CREATE OR REPLACE FUNCTION public.on_service_reposition()
  RETURNS trigger AS
$BODY$
BEGIN
	IF (pg_trigger_depth() = 1) THEN
		IF OLD.position < NEW.position THEN
			UPDATE services SET position = position - 1
			WHERE position > OLD.position AND position <= NEW.position AND id != NEW.id AND CASE WHEN NEW.parent IS NULL THEN parent IS NULL ELSE parent = NEW.parent END;
		ELSEIF OLD.position > NEW.position THEN
			UPDATE services SET position = position + 1
			WHERE position < OLD.position AND position >= NEW.position AND id != NEW.id AND CASE WHEN NEW.parent IS NULL THEN parent IS NULL ELSE parent = NEW.parent END;
		END IF;
	END IF;
	RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION public.on_service_reposition()
  OWNER TO basemapsuser;


CREATE TRIGGER service_create
  AFTER INSERT
  ON public.services
  FOR EACH ROW
  EXECUTE PROCEDURE public.on_service_insert();

CREATE TRIGGER service_delete
  AFTER DELETE
  ON public.services
  FOR EACH ROW
  EXECUTE PROCEDURE public.on_service_delete();

CREATE TRIGGER service_reposition
  AFTER UPDATE OF "position"
  ON public.services
  FOR EACH ROW
  EXECUTE PROCEDURE public.on_service_reposition();
