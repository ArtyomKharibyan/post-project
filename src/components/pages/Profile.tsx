import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

import { UserAuth } from "../../context/UserAuthContext";
import { storage } from "../../firebase/firebase";
import { defaultAvatarURL } from "../constants/AvatarUrl";
import axiosInstance from "../server/axios";

const Profile = () => {
  const {user, profileData, setProfileData} = UserAuth();
  const [avatarURL, setAvatarURL] = useState(profileData?.avatarUrl ?? defaultAvatarURL);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
	
  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const storageRef = ref(storage, `avatars/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      setAvatarURL(downloadURL);
			
      try {
        await axiosInstance.patch("/profile", {
          avatarUrl: downloadURL,
        });
        if (profileData) {
          setProfileData({
            ...profileData,
            avatarUrl: downloadURL,
          })
        }
      } catch (error) {
        toast.error("Error add avatar.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      }
    }
  };
	
  useEffect(() => {
    if (profileData) {
      if (profileData?.avatarUrl) {
        setAvatarURL(profileData.avatarUrl);
      } else {
        setAvatarURL(defaultAvatarURL);
      }
    }
  }, [profileData, setProfileData]);
	
  const handleButtonClick = () => {
    fileInputRef?.current?.click();
  };
	
  return (
    <div>
      <div className="flex justify-center items-center min-h-screen w-full">
        <div
          className="flex w-96 h-96 p-5 relative border-2 border-right/50 items-center text-center rounded-xl block bg-slate-100">
          <div className="text-slate-950 z-10 w-full">
            <div>
              <p className="p-2 text-2xl break-all">
                {user?.providerData[0]?.providerId === "google.com" ? user.displayName : `${profileData?.name} ${profileData?.surname}`}
              </p>
              {avatarURL && (
                <div className="flex justify-center align-center items-center w-full rounded-full">
                  <img className="w-40 rounded-full h-40 object-cover border-2 border-silver" src={avatarURL} alt="Avatar"/>
                </div>
              )}
              <button className="bg-blue-500 text-white px-4 py-2 rounded mt-2" onClick={handleButtonClick}>
								Choose Avatar
              </button>
              <input type="file" onChange={handleAvatarChange} ref={fileInputRef} className="hidden"/>
              <p className="p-2 break-all text-xl relative">
                {user?.providerData[0]?.providerId === "google.com" ? user.email : profileData?.email}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;