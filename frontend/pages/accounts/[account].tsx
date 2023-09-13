import BasicButton from "@/components/BasicButton";
import { getJobs } from "@/components/client";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type ReturnableJob = {
    id: number,
    name: string,
    description: string,
    instructions: string,
    admin: string,
    fee_per_task: number;
};
export default function Account() {
    const router = useRouter();
    const wallet = useWallet();
    const [jobs, setJobs] = useState<ReturnableJob[]>([]);
    useEffect(() => {
        if (router.isReady) {
            const { account } = router.query;
            if (account && wallet.account) {
                console.log(account, wallet.account.address);
                if (account == wallet.account.address) {
                    // get jobs for account
                    getJobs().then(jobs => {
                        let newJobs = jobs[0] as unknown as ReturnableJob[];
                        newJobs = newJobs.filter(job => job.admin == account);
                        setJobs(newJobs);
                    });
                } else {
                    window.location.href = "/";
                }
            }
        }
    }, [router.isReady, wallet]);

    return (
        <div className="w-screen h-screen flex flex-col justify-start items-center bg-gray-50 p-10">
            <div className="flex flex-row justify-between w-full items-center mb-6">
                <h1 onClick={() => window.location.href = "/"} className="text-4xl hover:cursor-pointer font-bold text-gray-800">Aptos AI Training</h1>
                <WalletSelector />
            </div>
            <p className="text-2xl font-semibold text-gray-700 mb-4">My Jobs</p>
            <div className="flex flex-col gap-4 w-full">
                {jobs &&
                    jobs.map((job, i) => <ReturnableJobModal {...job} key={i} />)
                }
            </div>
        </div>
    );
}
function ReturnableJobModal({ id, name, description, instructions, admin, fee_per_task }: ReturnableJob) {
    return (
        <div className="flex flex-col bg-white rounded-lg shadow-md p-4 w-full">
            <p className="text-lg text-center font-medium text-gray-700 mb-1">{name}</p>
            <p className="text-sm text-center text-gray-600 mb-1">{description}</p>
            <p className="text-xs text-center text-gray-500 mb-2">{instructions}</p>
            <BasicButton text="Review Completed Tasks" onClick={() => window.location.href = `/admin/${id}`} />
        </div>
    );
}