import { useState, useEffect } from "react";
// Not completely implemented!
const ToggleDark = () => {
  const [colorMode, SetColorMode] = useState("light");
  const toggleDark = () => {
    if (colorMode === "light") {
      SetColorMode("dark");
    } else {
      SetColorMode("light");
    }
  };
  useEffect(() => {
    document.body.className = colorMode;
  }, [colorMode]);

  return (
    <div id="invis-right">
      {/* <button onClick={toggleDark}>&#9681;</button> */}
      {/* Uncomment ^ to make darkmode button active */}
    </div>
  );
};

export default ToggleDark;
