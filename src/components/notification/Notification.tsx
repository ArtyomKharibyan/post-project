import React from "react";

interface NotificationProps {
	show: boolean;
}

const Notification: React.FC<NotificationProps> = ({show}) => {

  return (
    <>
      {show && (
        <div
          className="fixed w-96 bg-green-100  right-1 border border-slate-400 top-1 transform transition-transform duration-300 ease-in-out translate-y-0 opacity-100 translate-y-full opacity-0">
          <div className="p-7 shadow-lg flex items-center space-x-2">
            <span className="text-3xl">
              <i className="bx bx-check"/>
            </span>
            <p className="font-bold text-lime-800">Post Created Successfully!</p>
          </div>
        </div>
      )}
    </>
  );
}

export default Notification;
