import {sqliteTable,text,integer,index} from 'drizzle-orm/sqlite-core';
export const visitors=sqliteTable('analytics_visitors',{
 id:text('id').primaryKey(),firstDay:text('first_day').notNull(),lastDay:text('last_day').notNull(),traffic:text('traffic').notNull(),
});
export const events=sqliteTable('analytics_events',{
 id:text('id').primaryKey(),visitor:text('visitor').notNull(),session:text('session').notNull(),day:text('day').notNull(),
 at:integer('at').notNull(),seq:integer('seq').notNull(),kind:text('kind').notNull(),action:text('action').notNull().default(''),
 screen:text('screen').notNull(),entity:text('entity').notNull().default(''),activeMs:integer('active_ms').notNull().default(0),
 value:integer('value').notNull().default(0),device:text('device').notNull(),traffic:text('traffic').notNull(),
},t=>[index('analytics_day_idx').on(t.day,t.traffic),index('analytics_session_idx').on(t.session,t.at,t.seq),index('analytics_visitor_idx').on(t.visitor,t.day)]);
export const rollups=sqliteTable('analytics_daily',{
 id:text('id').primaryKey(),day:text('day').notNull(),traffic:text('traffic').notNull(),visitors:integer('visitors').notNull(),
 sessions:integer('sessions').notNull(),newVisitors:integer('new_visitors').notNull(),returningVisitors:integer('returning_visitors').notNull(),
 pageViews:integer('page_views').notNull(),clicks:integer('clicks').notNull(),activeMs:integer('active_ms').notNull(),
 guideViews:integer('guide_views').notNull(),plans:integer('plans').notNull(),errors:integer('errors').notNull(),
 globeLoads:integer('globe_loads').notNull(),globeLoadMs:integer('globe_load_ms').notNull(),updatedAt:integer('updated_at').notNull(),
},t=>[index('analytics_daily_day_idx').on(t.day,t.traffic)]);
