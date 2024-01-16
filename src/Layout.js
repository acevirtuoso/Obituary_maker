import React, { useState, useEffect } from "react";
import { v4 as uuid } from "uuid";
import Overlay from "./Overlay";
import ObitList from "./components/ObitList";
// import { useNavigate } from "react-router-dom";

import ToggleDark from "./buttons/ToggleDark";
import Obituary from "./components/Obituary";
// import NoteList from "../components/NoteList";

function Layout() {
  const [name, setName] = useState("");
  const [born, setBorn] = useState("");
  const [died, setDied] = useState("");
  const [image, setImage] = useState(null);
  const [showOverlay, setShow] = useState(false);
  var wait = false;

  const [obitList, setObitList] = useState([]);

  window.onload = () => {
    getObits();
  };

  async function getObits() {
    const response = await fetch(
      "https://2nue753tay4c5jqzj5kr6i5yni0qntwg.lambda-url.ca-central-1.on.aws/",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (response.status === 200) {
      console.log(response);
      const data = await response.json();
      console.log(data);
      setObitList(data);
      // console.log(data);
    }
  }

  function displayingname() {
    if (image) {
      return image["name"];
    } else return null;
  }

  function toggleWait() {
    if (wait) {
      wait = false;
    } else {
      wait = true;
    }
  }

  async function addObitToList(event) {
    event.preventDefault();
    const formData = new FormData();

    formData.append("uuid", uuid());
    formData.append("audio", "");
    formData.append("image", image);
    formData.append("name", name);
    formData.append("born", born);
    formData.append("death", died);
    formData.append("time", 1);
    formData.append("text", "");

    document.getElementById("submit-button-box").className = "wait";
    document.getElementById("submit-button").disabled = true;
    document.getElementById("submit-button").value =
      "Please wait, its not like you have anything else to do ¯_( ͡° ͜ʖ ͡°)_/¯";
    const response = await fetch(
      "https://vylkb4766cm4gwxu7dc5cazdxq0clzaj.lambda-url.ca-central-1.on.aws/",
      {
        method: "POST",
        body: formData,
      }
    );
    document.getElementById("submit-button").disabled = false;
    document.getElementById("submit-button").value = "Write Obituary";
    document.getElementById("submit-button-box").className = "";

    const data = await response.json();
    // console.log(data);
    const newObit = data["data"];

    setObitList((prevObits) => {
      return [...prevObits, newObit];
    });
    // sleep(2000).then(() => {
    //   console.log("End of wait");
    // });
    // const data = await res.json();
    // console.log(data);

    // console.log(res);
    // getObits();
    toggleWait();
    cancelForm();
    // toggleOverlay();
    // console.log(newObitList);
  }

  function toggleOverlay() {
    setShow(!showOverlay);
  }

  function cancelForm() {
    toggleOverlay();
    setName("");
    setBorn("");
    setDied("");
    setImage(null);
  }

  return (
    <>
      <nav>
        <div id="invis-left">
          {/* <button onClick={toggleDisplay}>&#9776;</button> */}
        </div>
        <div id="title">
          <h2>The Last Show</h2>
          {/* <h6>Like Notion, but worse</h6> */}
        </div>
        <div id="invis-right">
          <button id="addObit" onClick={toggleOverlay}>
            + New Obituary
          </button>
        </div>

        {/* <ToggleDark /> */}
      </nav>

      <div id="content">
        {showOverlay && (
          <div id="overlay">
            <form onSubmit={(e) => addObitToList(e)}>
              <div id="cancel-button-box">
                <button id="cancel-button" onClick={cancelForm}>
                  X
                </button>
              </div>
              <div id="overlay-content">
                <h1 id="overlay-title">Create a New Obituary</h1>
                <div>
                  <img id="divider" src="/Divider3.png" alt="divider" />
                </div>
                <div id="image-input-box">
                  <label id="underline-hover" htmlFor="image-input">
                    Click here to select an image for the deceased
                    <input
                      id="image-input"
                      type="file"
                      accept="image/*"
                      required
                      style={{ display: "none" }}
                      onChange={(e) => setImage(e.target.files[0])}
                    ></input>
                  </label>
                  <div id="display-name">{displayingname()}</div>
                </div>
                <div id="name-input-box">
                  <input
                    className="name-input"
                    required
                    type="text"
                    placeholder="Name of the deceased"
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div id="date-inputs">
                  <p id="born-display">Born:</p>
                  <input
                    className="date-input"
                    type="date"
                    required
                    onChange={(e) =>
                      setBorn(
                        e.target.value === undefined
                          ? "not born"
                          : e.target.value
                      )
                    }
                  />
                  <br />

                  <p id="died-display">Died:</p>
                  <input
                    className="date-input"
                    type="date"
                    required
                    onChange={(e) =>
                      setDied(
                        e.target.value === undefined
                          ? "not dead"
                          : e.target.value
                      )
                    }
                  />
                </div>

                <div id="submit-button-box">
                  <input
                    id="submit-button"
                    type="submit"
                    value="Write Obituary"
                  />
                </div>
              </div>
            </form>
          </div>
        )}

        <div id="note-container">
          <ObitList obitList={obitList} />
          {/* <div className="grid"> */}
          {/* {displayObits()} */}
          {/* {displayObits() */}

          {/* <Outlet context={[notes, setNotes, formatDate]} /> */}
        </div>
        {/* </div> */}
      </div>
    </>
  );
}

export default Layout;
