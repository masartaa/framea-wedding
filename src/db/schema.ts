import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import type { SiteConfig } from "../lib/config-schema.ts";

export const mediaKindEnum = pgEnum("media_kind", [
  "hero",
  "mempelai",
  "galeri",
  "musik",
]);

export const invitations = pgTable("invitations", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 80 }).notNull().unique(),
  label: varchar("label", { length: 120 }).notNull(),
  passwordHash: text("password_hash"),
  data: jsonb("data").$type<SiteConfig>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Dipertahankan sementara demi migrasi non-destruktif dari Versi 1 ke Versi 2
export const siteConfig = pgTable("site_config", {
  id: integer("id").primaryKey(),
  data: jsonb("data").$type<SiteConfig>().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const guests = pgTable(
  "guests",
  {
    id: serial("id").primaryKey(),
    invitationId: integer("invitation_id").references(() => invitations.id, {
      onDelete: "cascade",
    }),
    name: varchar("name", { length: 120 }).notNull(),
    slug: varchar("slug", { length: 140 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("guests_invitation_slug_idx").on(
      table.invitationId,
      table.slug
    ),
  ]
);

export const wishes = pgTable(
  "wishes",
  {
    id: serial("id").primaryKey(),
    invitationId: integer("invitation_id").references(() => invitations.id, {
      onDelete: "cascade",
    }),
    name: varchar("name", { length: 50 }).notNull(),
    message: varchar("message", { length: 300 }).notNull(),
    isHidden: boolean("is_hidden").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("wishes_invitation_created_idx").on(
      table.invitationId,
      table.createdAt
    ),
  ]
);

export const media = pgTable(
  "media",
  {
    id: serial("id").primaryKey(),
    invitationId: integer("invitation_id").references(() => invitations.id, {
      onDelete: "cascade",
    }),
    kind: mediaKindEnum("kind").notNull(),
    url: text("url").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("media_invitation_idx").on(table.invitationId)]
);
