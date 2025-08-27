import {
  pgTable,
  text,
  uuid,
  boolean,
  timestamp,
  integer,
  pgEnum,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { user } from './auth'

// Notification types we might send
export const notificationType = pgEnum('notification_type', [
  'info',
  'success',
  'warning',
  'error',
  'action_required',
])

// Delivery channels
export const notificationChannel = pgEnum('notification_channel', [
  'in_app',
  'email',
])

// Notifications table
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  type: notificationType('type').notNull().default('info'),
  channel: notificationChannel('channel').notNull().default('in_app'),
  title: text('title'),
  body: text('body'),
  // optional url / action payload for click-through or CTA
  url: text('url'),
  // whether the user has seen the notification in-app
  read: boolean('read')
    .$defaultFn(() => false)
    .notNull(),
  // priority to help ordering/deduplication
  priority: integer('priority').default(0),
  // optional external id for dedup across systems (eg. email provider id)
  externalId: text('external_id'),
  createdAt: timestamp('created_at')
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp('updated_at')
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
})

export const notificationRelations = relations(notifications, ({ one }) => ({
  user: one(user, {
    fields: [notifications.userId],
    references: [user.id],
  }),
}))
