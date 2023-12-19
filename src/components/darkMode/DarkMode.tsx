import "./DarkMode.css";

import React, { useEffect, useState } from "react";

import { ReactComponent as Moon } from "../images/Moon.svg";
import { ReactComponent as Sun } from "../images/Sun.svg";

const DarkMode = () => {
  const [isChecked, setIsChecked] = useState(
    localStorage.getItem("selectedTheme") === "dark"
  );

  const setDarkMode = () => {
    document?.querySelector("body")?.setAttribute("data-theme", "dark");
    localStorage.setItem("selectedTheme", "dark");
  };

  const setLightMode = () => {
    document?.querySelector("body")?.setAttribute("data-theme", "light");
    localStorage.setItem("selectedTheme", "light");
  };

  useEffect(() => {
    const selectedTheme = localStorage.getItem("selectedTheme");
    setIsChecked(selectedTheme === "dark");
    if (selectedTheme === "dark") {
      setDarkMode();
    } else {
      setLightMode();
    }
  }, []);

  const toggleTheme = () => {
    setIsChecked(!isChecked);
    if (!isChecked) {
      setDarkMode();
    } else {
      setLightMode();
    }
  };

  return (
    <div className="dark_mode z-0">
      <input
        className="dark_mode_input"
        type="checkbox"
        id="darkmode-toggle"
        onChange={toggleTheme}
        checked={isChecked}
      />
      <label className="dark_mode_label" htmlFor="darkmode-toggle">
        <Sun
          style={{
            fill: "#fff",
            width: "20px",
            height: "27px",
            left: "5px",
            top: "2px",
            bottom: "14px"
          }}
        />
        <Moon
          style={{
            fill: "#7e7e7e",
            width: "20px",
            height: "27px",
            left: "40px",
            top: "2px",
            bottom: "14px"
          }}
        />
      </label>
    </div>
  );
};

export default DarkMode;
