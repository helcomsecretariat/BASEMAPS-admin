-- DROP FUNCTION public.on_category_insert();

CREATE OR REPLACE FUNCTION public.on_category_insert()
  RETURNS trigger AS
$BODY$
BEGIN
	UPDATE categories SET position = position + 1
	WHERE position >= NEW.position AND id != NEW.id AND CASE WHEN NEW.parent IS NULL THEN parent IS NULL ELSE parent = NEW.parent END;
	RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION public.on_category_insert()
  OWNER TO basemapsuser;


-- DROP TRIGGER category_create ON public.categories;

CREATE TRIGGER category_create
  AFTER INSERT
  ON public.categories
  FOR EACH ROW
  EXECUTE PROCEDURE public.on_category_insert();


-- DROP FUNCTION public.on_category_reposition();

CREATE OR REPLACE FUNCTION public.on_category_reposition()
  RETURNS trigger AS
$BODY$
BEGIN
	IF (pg_trigger_depth() = 1) THEN
		IF OLD.position < NEW.position THEN
			UPDATE categories SET position = position - 1
			WHERE position > OLD.position AND position <= NEW.position AND id != NEW.id AND CASE WHEN NEW.parent IS NULL THEN parent IS NULL ELSE parent = NEW.parent END;
		ELSEIF OLD.position > NEW.position THEN
			UPDATE categories SET position = position + 1
			WHERE position < OLD.position AND position >= NEW.position AND id != NEW.id AND CASE WHEN NEW.parent IS NULL THEN parent IS NULL ELSE parent = NEW.parent END;
		END IF;
	END IF;
	RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION public.on_category_reposition()
  OWNER TO basemapsuser;


-- DROP TRIGGER category_reposition ON public.categories;

CREATE TRIGGER category_reposition
  AFTER UPDATE OF "position"
  ON public.categories
  FOR EACH ROW
  EXECUTE PROCEDURE public.on_category_reposition();


-- DROP FUNCTION public.on_category_delete();

CREATE OR REPLACE FUNCTION public.on_category_delete()
  RETURNS trigger AS
$BODY$
BEGIN
	UPDATE categories SET position = position - 1
	WHERE position > OLD.position AND CASE WHEN OLD.parent IS NULL THEN parent IS NULL ELSE parent = OLD.parent END;
	RETURN OLD;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION public.on_category_delete()
  OWNER TO basemapsuser;


-- DROP TRIGGER category_delete ON public.categories;

CREATE TRIGGER category_delete
  AFTER DELETE
  ON public.categories
  FOR EACH ROW
  EXECUTE PROCEDURE public.on_category_delete();
