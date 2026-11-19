alter table public.digital_nursery_items
  add column gallery_photos jsonb not null default '[]'::jsonb,
  add constraint nursery_gallery_photos_limit check (
    case when jsonb_typeof(gallery_photos) = 'array'
      then jsonb_array_length(gallery_photos) <= 6
      else false
    end
  );

grant select (gallery_photos) on public.digital_nursery_items to anon, authenticated;
notify pgrst, 'reload schema';
