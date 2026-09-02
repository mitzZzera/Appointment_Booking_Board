import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const appointments = sqliteTable('appointments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  ownerId: text('owner_id').notNull(),
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email').notNull().default(''),
  customerPhone: text('customer_phone').notNull().default(''),
  service: text('service').notNull(),
  staffName: text('staff_name').notNull(),
  appointmentDate: text('appointment_date').notNull(),
  startTime: text('start_time').notNull(),
  durationMins: integer('duration_mins').notNull(),
  status: text('status').notNull().default('confirmed'),
  notes: text('notes').notNull().default(''),
  price: integer('price').notNull().default(0),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index('idx_appointments_owner_date').on(table.ownerId, table.appointmentDate),
]);
