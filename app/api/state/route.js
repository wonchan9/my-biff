import { auth } from '@clerk/nextjs/server';
import { getDb } from '@/lib/db';

export async function GET(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const year = new URL(request.url).searchParams.get('year');
  if (!year) return Response.json({ error: 'year required' }, { status: 400 });

  const sql = getDb();
  const rows = await sql`
    SELECT picks, schedule FROM user_data WHERE user_id = ${userId} AND year = ${year}
  `;
  const row = rows[0];
  return Response.json({ picks: row?.picks ?? [], schedule: row?.schedule ?? [] });
}

export async function PUT(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { year, picks, schedule } = await request.json();
  if (!year) return Response.json({ error: 'year required' }, { status: 400 });

  const sql = getDb();
  await sql`
    INSERT INTO user_data (user_id, year, picks, schedule, updated_at)
    VALUES (${userId}, ${year}, ${JSON.stringify(picks ?? [])}, ${JSON.stringify(schedule ?? [])}, now())
    ON CONFLICT (user_id, year)
    DO UPDATE SET picks = EXCLUDED.picks, schedule = EXCLUDED.schedule, updated_at = now()
  `;
  return Response.json({ ok: true });
}
