import React, { useState, useRef, useEffect } from "react";
import Header from "./Header";
import { UserAuth } from "../../context/UserAuthContext";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase/firebase";

const Profile = () => {
    const { user, profileData } = UserAuth();
    const [avatarURL, setAvatarURL] = useState("");
    const fileInputRef = useRef(null);

    // @ts-ignore
    const handleAvatarChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const storageRef = ref(storage, `avatars/${file.name}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);
            setAvatarURL(downloadURL);
        }
    };

    const setDefaultAvatar = async () => {
        const defaultAvatarURL =
            "https://firebasestorage.googleapis.com/v0/b/post-project-80c0a.appspot.com/o/images%2FUserAvatar.png?alt=media&token=af9525b4-1f0e-468f-9352-f04004248dfc";
        setAvatarURL(defaultAvatarURL);
    };

    useEffect(() => {
        // @ts-ignore
        if (!profileData?.avatarURL) {
            setDefaultAvatar();
        } else {
            setAvatarURL(profileData.avatarUrl);
        }
    }, [profileData]);

    const handleButtonClick = () => {
        // @ts-ignore
        fileInputRef.current.click();
    };

    return (
        <div>
            <Header />
            <div className="flex justify-center items-center min-h-screen w-full">
                <div className="flex w-96 h-96 p-5 relative border-2 border-right/50 items-center text-center rounded-xl block bg-slate-100">
                    <div className="text-slate-950 z-10 w-full">
                        {user?.providerData[0]?.providerId === "google.com" ? (
                            <div>
                                <p className="p-2  relative text-2xl">{user.displayName}</p>
                                {avatarURL && <div className="flex justify-center align-center items-center w-full rounded-full"><img className="w-40 rounded-full h-40 object-cover border-2 border-silver" src={avatarURL} alt="Avatar" /></div>} <br />
                                <button className="bg-blue-500 text-white px-4 py-2 rounded mt-2" onClick={handleButtonClick}>Choose Avatar</button>
                                <input type="file" onChange={handleAvatarChange} ref={fileInputRef} className="hidden" />
                                <p className = "p-2 relative text-xl">{user.email}</p>
                            </div>
                        ) : (
                            <>
                                <p className="p-2 text-2xl">
                                    {profileData?.name} {profileData?.surname}
                                </p>
                                {avatarURL && <div className="flex justify-center align-center items-center w-full rounded-full">
                                    <img className="w-40 rounded-full h-40 object-cover border-2 border-silver" src={avatarURL} alt="Avatar" /></div>}
                                <button className="bg-blue-500 text-white px-4 py-2 rounded mt-2" onClick={handleButtonClick}>Choose Avatar</button>
                                <input type="file" onChange={handleAvatarChange} ref={fileInputRef} className="hidden" />
                                <p className="p-2 text-xl relative">{profileData?.email}</p>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
