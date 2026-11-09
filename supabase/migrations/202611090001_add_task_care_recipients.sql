-- NULL keeps existing tasks compatible with their single elder_id.
alter table public.tasks add column if not exists care_recipient_ids uuid[];
