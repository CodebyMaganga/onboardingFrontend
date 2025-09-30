import Navbar from "../components/Navbar";
import { GrUserAdmin } from "react-icons/gr";
import { HiBellAlert } from "react-icons/hi2";
import { GrStatusGoodSmall } from "react-icons/gr";
import { useEffect, useState } from "react";
import AdminDashBoard from "../components/AdminDashBoard";
import NotificationDashBoard from "../components/NotificationDashBoard";
import Overview from "../components/Overview";
import FormManagement from "../components/FormManagement";
import FormBuilder from "../components/FormBuilder";
import axios from "axios";
import api from "../api";
import { useFormStore } from "../store/context";
import { IoMdTrendingUp } from "react-icons/io";

export default function HomePage() {
  const [dashBoardState, setDashBoardState] = useState('AdminDashBoard');
  const [bottomUIState, setBottomUIState] = useState('Overview');
  const [formData, setFormData] = useState([]);
  const [activeForms, setActiveForms] = useState(0);
  const [totalForms, setTotalForms] = useState(0);
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const [pendingSubmissions, setPendingSubmissions] = useState(0);

  const { state, dispatch } = useFormStore();

  const handleDashBoardState = (state) => {
    setDashBoardState(state);
  };

  const handleBottomUIState = (state) => {
    setBottomUIState(state);
  };

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const response = await api.get("forms/");
        setFormData(response.data);
        setTotalForms(response.data.length);
        dispatch({ type: "SET_FORMS", payload: response.data });
      } catch (error) {
        console.error(error);
      }
    };

    const fetchSubmissions = async () => {
      try {
        const response = await api.get("submissions/");
        setTotalSubmissions(response.data.length);
        dispatch({ type: "SET_SUBMISSIONS", payload: response.data });
      } catch (error) {
        console.error(error);
      }
    };
  
    fetchForms();
    fetchSubmissions();
  }, [dispatch]); 

  useEffect(() => {
    const activeForms = state.forms.filter((form) => form.is_active === true);
    setActiveForms(activeForms.length);

    const pendingSubmissions = state.submissions.filter((submission) => submission.is_active === false);
    setPendingSubmissions(pendingSubmissions.length);
  
    
  }, [state.forms]); 
  

  
  return (
    <>
    <div className="bg-slate-50 h-auto">
    <Navbar />

    
    <div className="mt-8 flex flex-row justify-around ">
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
          <p>{activeForms}</p>
          <p>Active Forms</p>
        </div>
        <span className="text-gray-400">|</span> 
        <div className="flex flex-row gap-2 items-center">
          <p>{pendingSubmissions}</p>
          <p>Pending Submissions</p>
        </div>
      </div>
    </div>

    {dashBoardState === 'AdminDashBoard' && <AdminDashBoard />}
    {dashBoardState === 'NotificationDashBoard' && <NotificationDashBoard />}

   { 
   dashBoardState === 'AdminDashBoard' &&
   <div className="flex flex-row justify-around text-sm px-3 py-2 font-semibold gap-2 border-gray-50  w-[40%] ml-10 mt-8 bg-white shadow-lg rounded-lg">
      <p onClick={() => handleBottomUIState('Overview')} className="cursor-pointer">Overview</p>
      <p onClick={() => handleBottomUIState('FormManagement')} className="cursor-pointer">Form Management</p>
      <p onClick={() => handleBottomUIState('FormBuilder')} className="cursor-pointer">Form Builder</p>
      {/* <p className="cursor-pointer">Analytics</p> */}
    </div>
}
    <div>
     {(bottomUIState === 'Overview' && dashBoardState === 'AdminDashBoard') && <Overview />}
     {(bottomUIState === 'FormManagement' && dashBoardState === 'AdminDashBoard') && <FormManagement />}
     {bottomUIState === 'FormBuilder' && dashBoardState === 'AdminDashBoard' && <FormBuilder />}
    </div>
    </div>
    </>
  );
}