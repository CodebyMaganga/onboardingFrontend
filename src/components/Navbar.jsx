import { SiNextbilliondotai } from "react-icons/si";
import { IoShieldOutline } from "react-icons/io5";

const Navbar = () => {
  return (
    <div className="flex justify-between items-center p-4 border-b-2 bg-white  border-gray-200 shadow-lg">
      <div className="flex items-center gap-2">
        <div className=" rounded-full bg-green-100 p-4">
        <SiNextbilliondotai fontSize={30} color="#00B87C" />
        </div>
      
      <div>
      <p className="font-bold text--lg">Onboarding</p>
        <p className="text-neutral-400">Financial Platform</p>
      </div>
        
      </div>
      <div className="flex items-center gap-2">
        <IoShieldOutline />
        <p>Secure and Compliant</p>
        
    </div>
    </div>
  );
}

export default Navbar;