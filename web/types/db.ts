import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { users, stamps } from '@/lib/db/schema';

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
export type UpdateUser = Partial<NewUser>;

export type Stamp = InferSelectModel<typeof stamps>;
export type NewStamp = InferInsertModel<typeof stamps>;
export type UpdateStamp = Partial<NewStamp>;

export type DbUserResponse = User;
export type RawStampResponse = Stamp; 