import Navbar from "../components/Navbar";
import { GrUserAdmin } from "react-icons/gr";
import { HiBellAlert } from "react-icons/hi2";
import { GrStatusGoodSmall } from "react-icons/gr";
import { useState } from "react";
import AdminDashBoard from "../components/AdminDashBoard";
import NotificationDashBoard from "../components/NotificationDashBoard";

export default function HomePage() {
  const [dashBoardState, setDashBoardState] = useState('AdminDashBoard');

  const handleDashBoardState = (state) => {
    setDashBoardState(state);
  };
  return (
    <>
    <div className="bg-neutral-100 h-screen">
    <Navbar />

    
    <div className="mt-12 flex flex-row justify-around ">
      <div className="text-sm flex flex-row gap-2 items-center border bg-white  px-4 w-[25%] rounded-2xl justify-around border-gray-50 shadow-lg">
      <div 
      onClick={() => handleDashBoardState('AdminDashBoard')}
      className="flex flex-row gap-2 items-center cursor-pointer">
      <GrUserAdmin />
        <p>Admin Dashboard</p>
      </div>

      <span className="text-gray-400">|</span> 
      
      <div 
      onClick={() => handleDashBoardState('NotificationDashBoard')}
      className="flex flex-row gap-2 items-center cursor-pointer">
        <HiBellAlert />
        <p>Notifications</p>
      </div>
      </div>  
      <div className="bg-white text-sm flex flex-row justify-around  gap-2 items-center border  p-2 w-[40%] rounded-2xl  border-gray-50 shadow-lg">
        <div className="flex flex-row gap-2 items-center">
          <GrStatusGoodSmall color="#00B87C" />
          <p>System Online</p>
        </div>
        <span className="text-gray-400">|</span> 
        <div className="flex flex-row gap-2 items-center">
          <p>3</p>
          <p>Active Forms</p>
        </div>
        <span className="text-gray-400">|</span> 
        <div className="flex flex-row gap-2 items-center">
          <p>12</p>
          <p>Pending Submissions</p>
        </div>
      </div>
    </div>

    {dashBoardState === 'AdminDashBoard' && <AdminDashBoard />}
    {dashBoardState === 'NotificationDashBoard' && <NotificationDashBoard />}

    <div className="flex flex-row justify-around text-sm px-3 py-2 font-semibold gap-2 border-gray-50  w-[40%] ml-10 mt-8 bg-white shadow-lg rounded-lg">
      <p className="cursor-pointer">Onboarding</p>
      <p className="cursor-pointer">Form Management</p>
      <p className="cursor-pointer">Form Builder</p>
      <p className="cursor-pointer">Analytics</p>
    </div>
    </div>
    </>
  );
}