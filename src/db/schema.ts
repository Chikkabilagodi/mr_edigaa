import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Define the 'users' table.
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define 'chat_sessions' table
export const chatSessions = pgTable('chat_sessions', {
  id: text('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  title: text('title').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Define 'messages' table
export const messages = pgTable('messages', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').references(() => chatSessions.id, { onDelete: 'cascade' }).notNull(),
  sender: text('sender').notNull(),
  text: text('text').notNull(),
  timestamp: timestamp('timestamp').defaultNow(),
  imageUrl: text('image_url'),
  audioUrl: text('audio_url'),
  reaction: text('reaction'),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(chatSessions),
}));

export const chatSessionsRelations = relations(chatSessions, ({ one, many }) => ({
  user: one(users, {
    fields: [chatSessions.userId],
    references: [users.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  session: one(chatSessions, {
    fields: [messages.sessionId],
    references: [chatSessions.id],
  }),
}));
