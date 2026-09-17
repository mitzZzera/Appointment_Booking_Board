import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const appointments = sqliteTable('appointments', {
  id: integer('id').primaryKey({ autoIncrement: true }), ownerId: text('owner_id').notNull(), customerName: text('customer_name').notNull(), customerEmail: text('customer_email').notNull().default(''), customerPhone: text('customer_phone').notNull().default(''), service: text('service').notNull(), staffName: text('staff_name').notNull(), appointmentDate: text('appointment_date').notNull(), startTime: text('start_time').notNull(), durationMins: integer('duration_mins').notNull(), status: text('status').notNull().default('confirmed'), notes: text('notes').notNull().default(''), price: integer('price').notNull().default(0), createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
}, table => [index('idx_appointments_owner_date').on(table.ownerId,table.appointmentDate)]);

export const services = sqliteTable('services', {
  id: integer('id').primaryKey({autoIncrement:true}), ownerId:text('owner_id').notNull(), name:text('name').notNull(), duration:integer('duration').notNull(), price:integer('price').notNull().default(0), description:text('description').notNull().default(''), createdAt:text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
}, table => [uniqueIndex('idx_services_owner_name').on(table.ownerId,table.name)]);

export const archivedCustomers = sqliteTable('archived_customers', {
  id:integer('id').primaryKey({autoIncrement:true}), ownerId:text('owner_id').notNull(), email:text('email').notNull(), archivedAt:text('archived_at').notNull().default(sql`CURRENT_TIMESTAMP`),
}, table => [uniqueIndex('idx_archived_customers_owner_email').on(table.ownerId,table.email)]);
