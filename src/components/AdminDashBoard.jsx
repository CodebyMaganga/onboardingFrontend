import { IoMdSettings } from "react-icons/io";
import { FaWpforms } from "react-icons/fa6";
import { ImProfile } from "react-icons/im";
import { GoGraph } from "react-icons/go";
import { CiTimer } from "react-icons/ci";
import Card from "./Card";

const AdminDashBoard = () => {
    const formIcon = <FaWpforms />;
    const profileIcon = <ImProfile />;
    const graphIcon = <GoGraph />;
    const timerIcon = <CiTimer />;
      
  return (
    <div className="mt-8">
      <div className="flex flex-row justify-between mx-13">
        <div>
        <p className="font-bold text-2xl">Admin Dashboard</p>
       <p className="text-sm text-neutral-500">Manage forms, monitor submissions, and configure onboarding workflows</p>
        </div>
        <div className="flex flex-row gap-8 items-center  px-4 ">
            <div className="flex flex-row gap-2 items-center bg-white border-gray-400 shadow-lg px-4 py-2 rounded-lg">
                <IoMdSettings />
                <p>Settings</p>
            </div>
            
            <div className="bg-blue-500 text-white rounded-lg px-4 py-2 shadow-lg">
                <p >+ Add New Form</p>
            </div>
        </div>

     </div> 
     <div className="mt-6 flex flex-row justify-around ">
        <Card title={"Total Forms"} icon={formIcon} data={10} description={"Active onboarding forms"} dataChange={"+2 this month"} />
        <Card title={"Submissions"} icon={profileIcon} data={1237} description={"All-time submissions"} dataChange={"+89 this week"} />
        <Card title={"Completion Rate"} icon={graphIcon} data={'87%'} description={"Average form completion"} dataChange={"+5% vs last month"} />
        <Card title={"Avg. Process Time"} icon={timerIcon} data={'12min'} description={"Time to complete forms"} dataChange={"-3min vs last month"} />
     </div>

    </div>
  );
}

export default AdminDashBoard;

        