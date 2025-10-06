import { IoMdSettings } from "react-icons/io";
import { FaWpforms } from "react-icons/fa6";
import { ImProfile } from "react-icons/im";
import { GoGraph } from "react-icons/go";
import { CiTimer } from "react-icons/ci";
import Card from "./Card";
import { useFormStore } from "../store/context";

const AdminDashBoard = () => {
    const formIcon = <FaWpforms />;
    const profileIcon = <ImProfile />;
    const graphIcon = <GoGraph />;
    const timerIcon = <CiTimer />;

    const { state, dispatch } = useFormStore();

 function getTodayNotifications(notifications) {
  const today = new Date().toDateString();
  return notifications.filter(n => {
    const createdDate = new Date(n.created_at).toDateString();
    return createdDate === today;
  });
}

    const todayNotifications = Array.isArray(state.notifications) ? getTodayNotifications(state.notifications) : [];
    const totalToday = todayNotifications.length;

      
  return (
    <div className="mt-8">
      <div className="flex flex-row justify-between mx-13">
        <div>
        <p className="font-bold text-2xl">Admin Dashboard</p>
       <p className="text-sm text-neutral-500">Manage forms, monitor submissions, and configure onboarding workflows</p>
        </div>
       

     </div> 
     <div className="mt-6 flex flex-row justify-around ">
        <Card title={"Total Forms"} icon={formIcon} data={state?.forms?.length} description={"Active onboarding forms"} dataChange={"+2 this month"} />
        <Card title={"Submissions"} icon={profileIcon} data={state?.submissions?.length} description={"All-time submissions"} dataChange={"+89 this week"} />
        <Card title={"All Notifications"} icon={graphIcon} data={state?.notifications?.length} description={"All Notifications"} dataChange={"+5% vs last month"} />
        <Card title={"Todays Notification"} icon={timerIcon} data={totalToday} description={"Check your notifications"} dataChange={"+2 in the last hour"} />
     </div>

    </div>
  );
}

export default AdminDashBoard;

        