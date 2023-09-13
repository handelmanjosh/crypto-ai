import BasicButton from "@/components/BasicButton";
import { getJobs } from "@/components/client";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import { useEffect, useState } from "react";

type ReturnableJob = {
    id: number,
    name: string,
    description: string,
    instructions: string,
    admin: string,
    fee_per_task: number;
};

export default function Jobs() {
    const [jobs, setJobs] = useState<ReturnableJob[]>([]);
    useEffect(() => {
        getJobs().then(jobs => {
            let newJobs = jobs[0] as unknown as ReturnableJob[];
            console.log(jobs);
            setJobs(newJobs);
        });
    }, []);
    return (
        <div className="w-full h-screen flex flex-col justify-start items-center bg-gray-50 p-10">
            <div className="flex flex-row justify-between w-full items-center mb-6">
                <h1 onClick={() => window.location.href = "/"} className="text-4xl hover:cursor-pointer font-bold text-gray-800">Aptos AI Training</h1>
                <WalletSelector />
            </div>
            <div className="grid grid-cols-5 gap-8 w-full">
                {jobs &&
                    jobs.map((job, index) => <ReturnableJobModal {...job} key={index} />)
                }
            </div>
        </div>
    );
}
function ReturnableJobModal({ id, name, description, instructions, admin, fee_per_task }: ReturnableJob) {
    return (
        <div className="w-full flex flex-col justify-center items-center p-6 bg-white rounded-lg shadow-lg">
            <p className="text-lg text-center font-semibold text-gray-800 mb-2">{name}</p>
            <p className="text-sm text-center text-gray-600 mb-2">{description}</p>
            <p className="text-sm text-center text-gray-600 mb-2">{instructions}</p>
            <p className="text-sm text-center text-gray-600 mb-2">{fee_per_task}</p>
            <BasicButton
                text="Do Tasks"
                onClick={() => window.location.href = `/jobs/${id}`}
            />
        </div>
    );
}