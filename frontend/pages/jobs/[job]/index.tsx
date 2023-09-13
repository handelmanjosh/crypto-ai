import { getJob } from "@/components/client";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type Job = {
    id: number;
    name: string;
    description: string;
    instructions: string;
    tasks: { data: { key: string, value: Task; }[]; };
    next_task_id: number;
    admin: string;
    fee_per_task: number;
};
type Task = {
    id: number,
    question_url: string;
    answer_url: { vec: [string | undefined]; };
    completed: boolean;
    completed_by: { vec: [string | undefined]; };
    approved: { vec: [boolean | undefined]; };
};
export default function Job() {
    const [job, setJob] = useState<Job>();
    const router = useRouter();
    useEffect(() => {
        if (router.isReady) {
            const { job } = router.query;
            if (!Number.isNaN(Number(job))) {
                let job_id = Number(job);
                getJob(job_id).then(job => {
                    let newJob = job[0] as unknown as Job;
                    console.log(newJob);
                    setJob(newJob);
                });
            }
        }
    }, [router.isReady]);
    return (
        <div className="w-full h-screen flex flex-col justify-start items-center bg-gray-50 p-10">
            <div className="flex flex-row justify-between w-full items-center mb-6">
                <h1 onClick={() => window.location.href = "/"} className="text-4xl hover:cursor-pointer font-bold text-gray-800">Aptos AI Training</h1>
                <WalletSelector />
            </div>
            {job &&
                <div className="flex flex-col justify-center items-center w-full gap-4">
                    <p className="text-2xl font-semibold text-gray-800">{`Job ${job.id} named ${job.name}`}</p>
                    <p className="text-sm text-gray-600">{`Instructions: ${job.instructions}`}</p>
                    <div className="grid grid-cols-5 gap-8 w-full">
                        {job.tasks.data.map((value: { key: string, value: Task; }, index: number) =>
                            <TaskModal {...value.value} job_id={job.id} key={index} />
                        )}
                    </div>
                </div>
            }
        </div>
    );
};

function TaskModal({ id, job_id }: Task & { job_id: number; }) {
    return (
        <div className="rounded-lg bg-gray-200 p-4 hover:cursor-pointer hover:scale-105 transition-all duration-200 ease-in-out"
            onClick={() => window.location.href = `/jobs/${job_id}/${id}`}>
            <p className="text-center text-lg text-gray-700">{id}</p>
        </div>
    );
}