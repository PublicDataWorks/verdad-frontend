SET search_path = public, "$user";

ALTER TABLE public.snippets
ALTER COLUMN title TYPE jsonb USING title::jsonb;

ALTER TABLE public.snippets
  ALTER COLUMN summary TYPE jsonb USING summary::jsonb;
