import { CreateStampFormValues } from "@/types/form";
import { CreateStampDialog } from "./create-stamp-dialog";

interface StampHeaderProps {
    admin: boolean;
    handleCreateStamp: (values: CreateStampFormValues) => Promise<void>;
  }
  
  export function StampHeader({ admin, handleCreateStamp }: StampHeaderProps) {
    return (
      <div className="lg:max-w-sm flex flex-col">
        <div className="flex justify-between items-center">
          <p className="text-4xl font-bold py-6">Stamps</p>
          <div className="lg:hidden">
            {admin && <CreateStampDialog handleCreateStamp={handleCreateStamp} />}
          </div>
        </div>
        <p className="text-lg py-9">
          Here are the latest stamps awarded to the Sui community, celebrating achievements and contributions.
        </p>
        <div className="lg:block hidden mt-auto">
          {admin && <CreateStampDialog handleCreateStamp={handleCreateStamp} />}
        </div>
      </div>
    );
  }