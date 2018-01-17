CREATE OR REPLACE FUNCTION public.on_wms_insert()
  RETURNS trigger AS
$BODY$
BEGIN
	UPDATE wmses SET position = position + 1
	WHERE position >= NEW.position AND id != NEW.id AND CASE WHEN NEW.parent IS NULL THEN parent IS NULL ELSE parent = NEW.parent END;
	RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION public.on_wms_insert()
  OWNER TO basemapsuser;



CREATE OR REPLACE FUNCTION public.on_wms_delete()
  RETURNS trigger AS
$BODY$
BEGIN
	UPDATE wmses SET position = position - 1
	WHERE position > OLD.position AND CASE WHEN OLD.parent IS NULL THEN parent IS NULL ELSE parent = OLD.parent END;
	RETURN OLD;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION public.on_wms_delete()
  OWNER TO basemapsuser;



CREATE OR REPLACE FUNCTION public.on_wms_reposition()
  RETURNS trigger AS
$BODY$
BEGIN
	IF (pg_trigger_depth() = 1) THEN
		IF OLD.position < NEW.position THEN
			UPDATE wmses SET position = position - 1
			WHERE position > OLD.position AND position <= NEW.position AND id != NEW.id AND CASE WHEN NEW.parent IS NULL THEN parent IS NULL ELSE parent = NEW.parent END;
		ELSEIF OLD.position > NEW.position THEN
			UPDATE wmses SET position = position + 1
			WHERE position < OLD.position AND position >= NEW.position AND id != NEW.id AND CASE WHEN NEW.parent IS NULL THEN parent IS NULL ELSE parent = NEW.parent END;
		END IF;
	END IF;
	RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION public.on_wms_reposition()
  OWNER TO basemapsuser;


CREATE TRIGGER wms_create
  AFTER INSERT
  ON public.wmses
  FOR EACH ROW
  EXECUTE PROCEDURE public.on_wms_insert();

CREATE TRIGGER wms_delete
  AFTER DELETE
  ON public.wmses
  FOR EACH ROW
  EXECUTE PROCEDURE public.on_wms_delete();

CREATE TRIGGER wms_reposition
  AFTER UPDATE OF "position"
  ON public.wmses
  FOR EACH ROW
  EXECUTE PROCEDURE public.on_wms_reposition();
