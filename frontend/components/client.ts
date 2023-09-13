import { createClient } from "@thalalabs/surf";
import { Network, Provider } from "aptos";
import { ABI } from "./abi";
import { createEntryPayload } from "@thalalabs/surf";
import { Types } from 'aptos';

export const network =
    process.env.NEXT_PUBLIC_NETWORK === "devnet"
        ? Network.DEVNET
        : process.env.NEXT_PUBLIC_NETWORK === "testnet"
            ? Network.TESTNET
            : process.env.NEXT_PUBLIC_NETWORK === "mainnet"
                ? Network.MAINNET
                : Network.LOCAL;

export const provider = new Provider(network);
export const client = createClient({
    nodeUrl: provider.aptosClient.nodeUrl,
}).useABI(ABI);


export async function initJob(name: string, description: string, instructions: string, questionUrls: string[], feePerTask: number, sign: any) {
    const payload = {
        type: "entry_function_payload",
        ...createEntryPayload(ABI,
            {
                function: "init_job",
                type_arguments: [],
                arguments: [name, description, instructions, questionUrls, feePerTask],
            },
        ).rawPayload
    };
    const response = await sign(payload);
    const result = (await provider.waitForTransactionWithResult(response.hash)) as Types.UserTransaction;
    return result;
}

export async function addTasks(job_id: number, questionUrls: string[], sign: any) {
    const payload = {
        type: "entry_function_payload",
        ...createEntryPayload(ABI,
            {
                function: "add_tasks",
                type_arguments: [],
                arguments: [job_id, questionUrls],
            },
        ).rawPayload
    };
    const response = await sign(payload);
    const result = (await provider.waitForTransactionWithResult(response.hash)) as Types.UserTransaction;
    return result;
}

export async function completeTask(job_id: number, task_id: number, answer_url: string, sign: any) {
    const payload = {
        type: "entry_function_payload",
        ...createEntryPayload(ABI,
            {
                function: "complete_task",
                type_arguments: [],
                arguments: [job_id, task_id, answer_url],
            },
        ).rawPayload
    };
    const response = await sign(payload);
    const result = (await provider.waitForTransactionWithResult(response.hash)) as Types.UserTransaction;
    return result;
}

export async function approveTask(job_id: number, task_id: number, status: boolean, sign: any) {
    const payload = {
        type: "entry_function_payload",
        ...createEntryPayload(ABI,
            {
                function: "approve_task",
                type_arguments: [],
                arguments: [job_id, task_id, status],
            },
        ).rawPayload
    };
    const response = await sign(payload);
    const result = (await provider.waitForTransactionWithResult(response.hash)) as Types.UserTransaction;
    return result;
}
export async function getJobs() {
    return await client.view.get_jobs({ type_arguments: [], arguments: [] });
}
export async function getJob(id: number) {
    return await client.view.get_job({ type_arguments: [], arguments: [id] });
}