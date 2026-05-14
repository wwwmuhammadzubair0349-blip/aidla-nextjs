create table if not exists public.battle_questions (
  id uuid primary key default gen_random_uuid(),
  category_id uuid null,
  category text not null,
  difficulty text not null check (difficulty in ('easy','medium','hard')),
  question_text text not null,
  options jsonb not null,
  correct_option_index int not null check (correct_option_index between 0 and 3),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists battle_questions_pick_idx
on public.battle_questions (category, difficulty, is_active);

insert into public.battle_questions (category, difficulty, question_text, options, correct_option_index)
values
('General','easy','What is 2 + 2?','["3","4","5","6"]',1),
('General','easy','Which planet is known as the Red Planet?','["Earth","Mars","Venus","Jupiter"]',1),
('General','easy','What gas do plants absorb from air?','["Oxygen","Carbon dioxide","Nitrogen","Hydrogen"]',1),
('General','easy','How many days are in a week?','["5","6","7","8"]',2),
('General','easy','Which shape has three sides?','["Circle","Square","Triangle","Rectangle"]',2),
('General','medium','What is 15 percent of 200?','["20","25","30","35"]',2),
('General','medium','Which organ pumps blood through the body?','["Lungs","Brain","Heart","Kidney"]',2),
('General','medium','What is the next number: 3, 6, 12, 24?','["30","36","42","48"]',3),
('General','medium','Which word is a synonym of rapid?','["Slow","Fast","Late","Weak"]',1),
('General','medium','What is the boiling point of water at sea level?','["80°C","90°C","100°C","120°C"]',2),
('General','hard','If x + 7 = 19, what is x?','["10","11","12","13"]',2),
('General','hard','Which process converts light energy into chemical energy in plants?','["Respiration","Photosynthesis","Evaporation","Condensation"]',1),
('General','hard','What is the square root of 144?','["10","11","12","14"]',2),
('General','hard','Which number is prime?','["21","27","29","33"]',2),
('General','hard','What is 3/4 as a decimal?','["0.25","0.5","0.75","1.25"]',2)
on conflict do nothing;

insert into public.battle_questions (category_id, category, difficulty, question_text, options, correct_option_index)
select c.id, c.name, q.difficulty, replace(q.question_text, '{category}', c.name), q.options, q.correct_option_index
from public.battle_categories c
cross join (
  values
  ('easy','In {category}, which choice best means learning from practice?','["Guessing","Repeating with feedback","Ignoring mistakes","Skipping basics"]'::jsonb,1),
  ('easy','What helps you improve fastest in {category}?','["Clear goals","Random effort","No review","Avoiding questions"]'::jsonb,0),
  ('easy','Which habit is useful for {category}?','["Practice","Delay","Confusion","Copying blindly"]'::jsonb,0),
  ('easy','What should you do after a wrong answer in {category}?','["Quit","Review the mistake","Hide it","Change topic forever"]'::jsonb,1),
  ('easy','Which skill supports better results in {category}?','["Focus","Rushing","Guessing","Distraction"]'::jsonb,0),
  ('medium','What is the best way to solve a difficult {category} question?','["Read carefully","Pick instantly","Ignore keywords","Avoid checking"]'::jsonb,0),
  ('medium','Which method improves memory in {category}?','["Spaced practice","One long cram","Never revising","Only watching"]'::jsonb,0),
  ('medium','Why compare options in a {category} MCQ?','["To spot traps","To waste time","To avoid thinking","To skip the answer"]'::jsonb,0),
  ('medium','What does accuracy require in {category}?','["Attention to detail","Speed only","Luck only","No revision"]'::jsonb,0),
  ('medium','What should come before choosing an answer in {category}?','["Understanding the question","Closing eyes","Copying","Changing topic"]'::jsonb,0),
  ('hard','In {category}, what separates strong answers from weak ones?','["Evidence and reasoning","Guessing quickly","Long wording only","Random examples"]'::jsonb,0),
  ('hard','What is a reliable strategy for advanced {category} problems?','["Break into parts","Rush the final answer","Ignore constraints","Use one clue only"]'::jsonb,0),
  ('hard','Why track time in a {category} battle?','["Tie-breaking and pressure control","Decoration only","To skip questions","It has no value"]'::jsonb,0),
  ('hard','What should you do when two {category} options look correct?','["Find the more precise one","Pick the longer one","Pick randomly","Stop playing"]'::jsonb,0),
  ('hard','Which approach is weakest for {category}?','["Blind guessing","Checking assumptions","Reading all options","Eliminating wrong choices"]'::jsonb,0)
) q(difficulty, question_text, options, correct_option_index)
where c.is_active = true
  and not exists (
    select 1 from public.battle_questions b
    where b.category = c.name
      and b.difficulty = q.difficulty
      and b.question_text = replace(q.question_text, '{category}', c.name)
  );

create or replace function public.battle_prepare_round(p_room_id uuid, p_round int)
returns json
language plpgsql
security definer
as $$
declare
  v_room public.battle_rooms%rowtype;
  v_category text;
  v_difficulty text;
  v_needed int;
  v_cached int;
begin
  select * into v_room from public.battle_rooms where id = p_room_id;
  if not found then return json_build_object('ok', false, 'error', 'Room not found'); end if;

  v_category := case when p_round = 1 then v_room.round1_category else v_room.round2_category end;
  v_difficulty := case when p_round = 1 then v_room.round1_difficulty else v_room.round2_difficulty end;
  v_needed := case when p_round = 1 then v_room.round1_questions else v_room.round2_questions end;

  if v_category is null or v_difficulty is null or v_needed is null then
    return json_build_object('ok', false, 'error', 'Round settings missing');
  end if;

  delete from public.battle_question_cache where room_id = p_room_id and round_number = p_round;

  insert into public.battle_question_cache
    (room_id, round_number, question_order, question_text, options, correct_option_index, category)
  select p_room_id, p_round, row_number() over (), q.question_text, q.options, q.correct_option_index, v_category
  from (
    select question_text, options, correct_option_index
    from public.battle_questions
    where is_active = true
      and difficulty = v_difficulty
      and (category = v_category or category = 'General')
    order by case when category = v_category then 0 else 1 end, random()
    limit v_needed
  ) q;

  get diagnostics v_cached = row_count;

  if v_cached = 0 then
    return json_build_object('ok', false, 'error', 'No questions found for this round');
  end if;

  update public.battle_rooms
  set status = case
        when p_round = 1 then 'in_progress'
        when player1_round1_done and player2_round1_done then 'in_progress'
        else status
      end,
      current_round = case
        when p_round = 1 then 1
        when player1_round1_done and player2_round1_done then 2
        else current_round
      end
  where id = p_room_id;

  return json_build_object('ok', true, 'cached', v_cached);
end;
$$;

create or replace function public.battle_leaderboard(p_period text default 'daily'::text)
returns json
language plpgsql
security definer
as $$
declare
  v_from timestamptz;
  v_result json;
begin
  v_from := case p_period
    when 'daily' then current_date::timestamptz
    when 'weekly' then date_trunc('week', now())
    when 'monthly' then date_trunc('month', now())
    else current_date::timestamptz
  end;

  select json_agg(row_to_json(l) order by l.wins desc, l.coins_earned desc) into v_result
  from (
    select *
    from (
      select
        bh.user_id::text as participant_id,
        up.full_name,
        up.avatar_url,
        count(*) filter (where bh.result = 'won') as wins,
        count(*) filter (where bh.result = 'lost') as losses,
        count(*) filter (where bh.result = 'tie') as ties,
        count(*) as total,
        sum(case when bh.coins_change > 0 then bh.coins_change else 0 end) as coins_earned,
        false as is_bot
      from public.battle_history bh
      join public.users_profiles up on up.user_id = bh.user_id
      where bh.played_at >= v_from
      group by bh.user_id, up.full_name, up.avatar_url

      union all

      select
        br.bot_name as participant_id,
        br.bot_name as full_name,
        null as avatar_url,
        count(*) filter (where br.winner_name = br.bot_name) as wins,
        count(*) filter (where br.winner_name != br.bot_name or br.winner_name is null) as losses,
        count(*) filter (where br.is_tie = true) as ties,
        count(*) as total,
        0 as coins_earned,
        true as is_bot
      from public.battle_rooms br
      where br.is_bot = true
        and br.status = 'completed'
        and br.created_at >= v_from
      group by br.bot_name
    ) x
    where x.wins > 0
    order by x.wins desc, x.coins_earned desc
    limit 50
  ) l;

  return coalesce(v_result, '[]'::json);
end;
$$;
