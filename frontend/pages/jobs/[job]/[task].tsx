import BasicButton from "@/components/BasicButton";
import Loader from "@/components/Loader";
import { getText, uploadString } from "@/components/aws";
import { completeTask, getJob } from "@/components/client";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
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
export default function Task() {
    const [job, setJob] = useState<Job>();
    const [task, setTask] = useState<Task>();
    const [submission, setSubmission] = useState<string>("");
    const [type, setType] = useState<"text" | "image">();
    const [imgSrc, setImgSrc] = useState<string>("");
    const [text, setText] = useState<string>("");
    const router = useRouter();
    const wallet = useWallet();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    useEffect(() => {
        if (router.isReady) {
            const { job, task } = router.query;
            if (!Number.isNaN(Number(job)) && !Number.isNaN(Number(task))) {
                let job_id = Number(job);
                let task_id = Number(task);
                getJob(job_id).then(job => {
                    let newJob = job[0] as unknown as Job;
                    console.log(newJob);
                    let task: Task = newJob.tasks.data[task_id]?.value;
                    if (!task) {
                        window.location.href = `/jobs/${router.query.job}`;
                    } else {
                        console.log(task);
                        setTask(task);
                        setJob(newJob);
                        const type = newJob.description.includes("Image") ? "image" : "text";
                        setType(type);
                        draw(type, task);
                    }
                });
            }
        }
    }, [router.isReady]);
    const draw = (type: "text" | "image", task: Task) => {
        if (type === "image") {
            setImgSrc(task.question_url);
        } else {
            getText(task.question_url).then(text => setText(text));
        }
    };
    const submit = async () => {
        try {
            setIsLoading(true);
            const url = await uploadString(submission);
            if (url) {
                const response = await completeTask(job!.id, task!.id, url, wallet.signAndSubmitTransaction);
                window.location.href = `/jobs/${router.query.job}/${Number(router.query.task) + 1}`;
                console.log(response);
            }
            setIsLoading(false);
        } catch (e) {
            setIsLoading(false);
        }
    };
    return (
        <div className="w-full h-screen flex flex-col justify-start items-center bg-gray-50 p-10">
            <div className="flex flex-row justify-between w-full items-center mb-6">
                <h1 onClick={() => window.location.href = "/"} className="text-4xl hover:cursor-pointer font-bold text-gray-800">Aptos AI Training</h1>
                <WalletSelector />
            </div>
            <div className="flex flex-col justify-center items-center w-full gap-4">
                {job &&
                    <>
                        {isLoading ?
                            <Loader />
                            :
                            <>
                                <p className="text-lg text-gray-700 mb-2">{`Task: ${job.description}`}</p>
                                <p className="text-sm text-gray-600 mb-4">{`Instructions: ${job.instructions}`}</p>
                                {type == "image" ?
                                    <img className="w-full max-w-xs rounded-lg" src={imgSrc} alt="Task Image" />
                                    :
                                    <p className="text-base text-gray-700">{text}</p>
                                }
                                <input
                                    className="w-full max-w-md mt-4 p-2 border rounded-lg focus:ring focus:ring-opacity-50"
                                    type="text"
                                    placeholder="Answer"
                                    value={submission}
                                    onChange={(e) => setSubmission(e.target.value)}
                                />
                                <BasicButton text="Submit" onClick={submit} />
                            </>
                        }
                    </>
                }
            </div>
        </div>
    );
};