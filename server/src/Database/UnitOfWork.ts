import { IUnitOfWork } from "../Domain/IUnitOfWork";
import { ILoggerService } from "../Domain/services/logger/ILoggerService";
import { DbManager } from './connection/DbConnectionPool';
import { transactionStorage } from "./TransactionContext";

export class UnitOfWork implements IUnitOfWork
{
    constructor(
        private readonly dbManager: DbManager,
        private readonly logger: ILoggerService
    ){}

    // TODO: If error thrownig is not needed, remove
    public async runInTransaction<T>(work: () => Promise<T>): Promise<T> {
        const res = await this.dbManager.getWriteConnection();
        if(!res){
            throw new Error("Master database node is  unreachable");
        }

        const {conn} = res;

        try
        {
            await conn.beginTransaction();
            this.logger.info("UoW", "Transaction started");

            const result = await transactionStorage.run(conn, async () => {
                return await work();
            });

            if(result && typeof result === "object" && "isSuccess" in result && !result.isSuccess)
            {
                this.logger.warn("UoW", "Work returned Result.Failiure, rolling back...");
                await conn.rollback();
            }
            else
            {
                await conn.commit();
                this.logger.info("UoW", "Transaction commited succesfully");
            }
            return result;
        }
        catch (err)
        {
            this.logger.error("UoW", "Transaction failed, rolling back...", err);
            await conn.rollback();
            throw err;
        }
        finally
        {
            conn.release();
        }
    }
}