ALTER TABLE public.categories
   ALTER COLUMN "position" SET DEFAULT 1;
ALTER TABLE public.categories
   ALTER COLUMN "position" SET NOT NULL;

ALTER TABLE public.wmses
   ALTER COLUMN "position" SET DEFAULT 1;
ALTER TABLE public.wmses
   ALTER COLUMN "position" SET NOT NULL;