ALTER TABLE public.wmses
  DROP COLUMN label;


ALTER TABLE public.wmsmetadata
  RENAME TO metadata;
ALTER TABLE public.metadata
  DROP CONSTRAINT wmsmetadata_pkey;
ALTER TABLE public.metadata
  ADD PRIMARY KEY (id);
ALTER TABLE public.metadata
  DROP CONSTRAINT wmsmetadata_parent_fkey;
UPDATE public.metadata SET parent = w.parent FROM wmses w WHERE metadata.parent = w.id;
ALTER TABLE public.metadata
  ADD FOREIGN KEY (parent) REFERENCES public.categories (id) ON UPDATE CASCADE ON DELETE CASCADE;