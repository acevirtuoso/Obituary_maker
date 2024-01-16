import React from "react";
import { useState, useRef } from "react";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Collapse from "react-bootstrap/Collapse";

function Obituary({ obituary, last }) {
  const [showText, setShowText] = useState(false);

  // function
  const [playing, setplay] = useState(false);
  const audioref = useRef(null);

  const formatDate = (when) => {
    const formatted = new Date(when).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (formatted === "Invalid Date") {
      return "";
    }
    return formatted;
  };

  const toggleCollapse = () => {
    setShowText(!showText);
  };
  const play = () => {
    const audio = audioref.current;
    if (!playing) {
      audio.play();
      setplay(true);
    } else {
      audio.pause();
      setplay(false);
    }
  };
  return (
    <>
      <div className="obituary-card">
        <div
          className="obituary-card-button"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target={`#${obituary.uuid}`}
        >
          <img src={obituary.image} alt="pic" />
          <h2>{obituary.name}</h2>
          <p id="dates">
            {formatDate(obituary.born)} - {formatDate(obituary.death)}
          </p>
          <div
            id={obituary.uuid}
            className={last ? "collapse in show" : "collapse in"}
          >
            <p>{obituary.text}</p>
            {/* <audio ref={audioref} src={obituary.audio}></audio>
          <div id="play-button" onClick={play}>
            {playing ? <>⏸️</> : <>▶️</>}
          </div> */}
          </div>
        </div>
        <div
          id={obituary.uuid}
          className={last ? "collapse in show" : "collapse in"}
        >
          <audio ref={audioref} src={obituary.audio} onEnded={play}></audio>
          <button id="play-button" onClick={play}>
            {playing ? <>⏸️</> : <>▶️</>}
          </button>
        </div>
      </div>
    </>
  );
}

export default Obituary;

// type="audio/mpeg"
