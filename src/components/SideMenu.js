import React, { useState, useEffect } from "react";
import { v4 as uuid } from "uuid";
import NoteList from "./NoteList";
function SideMenu() {
  const [notes, setNote] = useState(['note 1','note 2']);
  const addNote = () => {
    /*const note = {
      id: uuid(),
      title: "Untitled",
      lastEdit: Date.now(),
      text: "...",
    };
    setNote([note, ...notes]);*/
    console.log(notes);
  };

  return (
    <>
      <div id="menu">
        <div id="menu-header">
          <h1 id="menu-title">Notes</h1>
          <button>+</button>
        </div>
        <div id="side-notes">
          <NoteList notes={notes} />
        </div>
      </div>
    </>
  );
}

export default SideMenu;
