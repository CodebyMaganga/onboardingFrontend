
const Card = ({ title, icon, data, description, dataChange }) => {
  return (
    <div className="py-2 h-[12rem] px-4 flex flex-col gap-2 w-[20%] border rounded-2xl justify-around border-gray-200 shadow-lg bg-white">
  <div className="flex flex-row w-full justify-between items-center">
    <p className="text-sm">{title}</p>
    <p>{icon}</p>
  </div>

  <div className="flex flex-col w-full gap-1">
    <p className="text-lg font-bold">{data}</p>
    <p className="text-neutral-400 text-sm">{description}</p>
    <p className="text-sm text-green-500">{dataChange}</p>
  </div>
</div>
 
  );
}

export default Card;