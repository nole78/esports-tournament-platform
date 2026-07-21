import { PoolConnection } from "mysql2/promise";
import { AsyncLocalStorage } from "node:async_hooks";

export const transactionStorage = new AsyncLocalStorage<PoolConnection>();