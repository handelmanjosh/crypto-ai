import BasicButton from "@/components/BasicButton";
import Loader from "@/components/Loader";
import { uploadFile } from "@/components/aws";
import { initJob } from "@/components/client";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useState } from "react";


export default function Home() {
  const { account } = useWallet();
  const [creatingJob, setCreatingJob] = useState<boolean>(false);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [feePerTask, setFeePerTask] = useState<number>(1);
  const [jobName, setJobName] = useState<string>("");
  const [jobDescription, setJobDescription] = useState<string>("");
  const [instructions, setInstructions] = useState<string>("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const wallet = useWallet();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files).map((file) => file.name);
      setFileNames(fileArray);
      setFiles(files);
    }
  };
  const createJob = async () => {
    if (files && files.length > 0) {
      try {
        setIsLoading(true);
        let fileUrls: string[] = [];
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const fileUrl = await uploadFile(file);
          // do stuff with file url
          if (fileUrl) {
            fileUrls.push(fileUrl);
          }
        }
        const response = await initJob(jobName, jobDescription, instructions, fileUrls, feePerTask, wallet.signAndSubmitTransaction);
        console.log(response);
        setIsLoading(false);
      } catch (e) {
        setIsLoading(false);
      }
    }
  };
  return (
    <div className="w-full h-screen flex flex-col justify-start items-center bg-gray-50 p-10">
      <div className="flex flex-row justify-between w-full items-center mb-6">
        <h1 className="text-4xl font-bold text-gray-800">Aptos AI Training</h1>
        <WalletSelector />
      </div>
      {account ?
        <div className="flex flex-row justify-center items-center gap-4 mb-10">
          <BasicButton text="View Account" onClick={() => window.location.href = `/accounts/${account.address}`} />
          <BasicButton text="View Jobs" onClick={() => window.location.href = "/jobs"} />
          <BasicButton text={`${creatingJob ? "Cancel" : "Create Job"}`} onClick={() => setCreatingJob(!creatingJob)} />
        </div>
        :
        <p className="text-gray-600">Connect your wallet!</p>
      }
      {creatingJob &&
        <div className="flex flex-col justify-center items-center gap-4 bg-white p-10 rounded-lg shadow-lg">
          {isLoading ?
            <Loader />
            :
            <>
              <input
                className="bg-gray-200 text-gray-700 p-2 rounded-lg w-64"
                placeholder="Fee per task"
                type="number"
                onChange={(e) => setFeePerTask(parseInt(e.target.value))}
              />
              <input
                className="bg-gray-200 text-gray-700 p-2 rounded-lg w-64"
                placeholder="Job Name"
                type="text"
                onChange={(e) => setJobName(e.target.value)}
              />
              <select
                className="bg-gray-200 text-gray-700 p-2 rounded-lg w-64"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              >
                <option value="" disabled>Select a type of Job</option>
                <option value="Image Classification">Image Classification</option>
                <option value="Text Classification">Text Classification</option>
                <option value="Image Labeling">Image Labeling</option>
              </select>
              <input
                className="bg-gray-200 text-gray-700 p-2 rounded-lg w-64"
                placeholder="Instructions"
                type="text"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
              <div className="container mx-auto mt-5 w-64">
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="bg-gray-200 text-gray-700 p-2 rounded-lg w-full"
                />
                <div className="mt-3">
                  <h4 className="text-lg font-semibold text-gray-700">Uploaded Files:</h4>
                  <ul className="list-disc ml-5 text-gray-600">
                    {fileNames.map((name, index) => (
                      <li key={index}>{name}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          }
          <BasicButton text="Submit" onClick={createJob} />
        </div>
      }
    </div>
  );
}
