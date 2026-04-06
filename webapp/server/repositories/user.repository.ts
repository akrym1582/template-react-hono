import type { TableEntityResult } from "@azure/data-tables";
import { env } from "../lib/env.js";
import { normalizeEmail } from "../lib/normalize.js";
import type { User } from "../../shared/types/index.js";
import { getTableClient } from "./table.js";

const USER_PARTITION_KEY = "USER";

interface UserTableEntity {
  partitionKey: string;
  rowKey: string;
  type: "user";
  name: string;
  email: string;
  userId: string;
  displayName?: string;
  passwordHash?: string;
  hasLocalPassword: boolean;
  msalOid?: string;
  msalTenantId?: string;
  msalEmail?: string;
  rolesJson: string;
  isActive: boolean;
  sessionVersion: number;
  createdAt: string;
  updatedAt: string;
}

function toODataString(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

function buildUserFilter(...conditions: string[]): string {
  return conditions.join(" and ");
}

function compactEntity<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== undefined)
  ) as T;
}

function toUser(entity: UserTableEntity | TableEntityResult<Record<string, unknown>>): User {
  const rolesJson = typeof entity.rolesJson === "string" ? entity.rolesJson : "[]";
  let roles: User["roles"] = [];

  try {
    roles = JSON.parse(rolesJson) as User["roles"];
  } catch {
    roles = [];
  }

  return {
    id: String(entity.rowKey ?? ""),
    type: "user",
    name: String(entity.name ?? ""),
    email: String(entity.email ?? ""),
    userId: String(entity.userId ?? ""),
    displayName: typeof entity.displayName === "string" ? entity.displayName : undefined,
    passwordHash: typeof entity.passwordHash === "string" ? entity.passwordHash : undefined,
    hasLocalPassword: Boolean(entity.hasLocalPassword),
    msalOid: typeof entity.msalOid === "string" ? entity.msalOid : undefined,
    msalTenantId: typeof entity.msalTenantId === "string" ? entity.msalTenantId : undefined,
    msalEmail: typeof entity.msalEmail === "string" ? entity.msalEmail : undefined,
    roles,
    isActive: Boolean(entity.isActive),
    sessionVersion: Number(entity.sessionVersion ?? 0),
    createdAt: String(entity.createdAt ?? ""),
    updatedAt: String(entity.updatedAt ?? ""),
  };
}

function toEntity(user: User): UserTableEntity {
  return compactEntity({
    partitionKey: USER_PARTITION_KEY,
    rowKey: user.id,
    type: "user" as const,
    name: user.name,
    email: user.email,
    userId: user.userId,
    displayName: user.displayName,
    passwordHash: user.passwordHash,
    hasLocalPassword: user.hasLocalPassword,
    msalOid: user.msalOid,
    msalTenantId: user.msalTenantId,
    msalEmail: normalizeEmail(user.msalEmail),
    rolesJson: JSON.stringify(user.roles ?? []),
    isActive: user.isActive,
    sessionVersion: user.sessionVersion,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
}

async function readFirstEntity(filter: string): Promise<User | null> {
  const tableClient = getTableClient(env.USER_TABLE_NAME);

  for await (const entity of tableClient.listEntities<UserTableEntity>({
    queryOptions: { filter },
  })) {
    return toUser(entity);
  }

  return null;
}

export class UserRepository {
  async findAll(): Promise<User[]> {
    const tableClient = getTableClient(env.USER_TABLE_NAME);
    const users: User[] = [];

    for await (const entity of tableClient.listEntities<UserTableEntity>({
      queryOptions: { filter: `PartitionKey eq '${USER_PARTITION_KEY}'` },
    })) {
      users.push(toUser(entity));
    }

    return users;
  }

  async findById(id: string): Promise<User | null> {
    const tableClient = getTableClient(env.USER_TABLE_NAME);

    try {
      const entity = await tableClient.getEntity<UserTableEntity>(USER_PARTITION_KEY, id);
      return toUser(entity);
    } catch (error) {
      if (error instanceof Error && /status code 404/i.test(error.message)) {
        return null;
      }
      throw error;
    }
  }

  async findByUserId(userId: string): Promise<User | null> {
    return readFirstEntity(buildUserFilter(
      `PartitionKey eq ${toODataString(USER_PARTITION_KEY)}`,
      `userId eq ${toODataString(userId)}`
    )
    );
  }

  async findByMsalIdentity(tenantId: string, oid: string, email?: string): Promise<User | null> {
    const emailFilter = email
      ? ` or msalEmail eq ${toODataString(normalizeEmail(email) ?? "")}`
      : "";
    return readFirstEntity(buildUserFilter(
      `PartitionKey eq ${toODataString(USER_PARTITION_KEY)}`,
      `((msalTenantId eq ${toODataString(tenantId)} and msalOid eq ${toODataString(oid)})${emailFilter})`
    )
    );
  }

  async create(data: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
    const tableClient = getTableClient(env.USER_TABLE_NAME);
    const now = new Date().toISOString();
    const user: User = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    await tableClient.createEntity(toEntity(user));
    return user;
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const tableClient = getTableClient(env.USER_TABLE_NAME);
    const updated: User = {
      ...existing,
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };

    await tableClient.updateEntity(toEntity(updated), "Replace");
    return updated;
  }

  async delete(id: string): Promise<void> {
    const tableClient = getTableClient(env.USER_TABLE_NAME);
    await tableClient.deleteEntity(USER_PARTITION_KEY, id);
  }
}
