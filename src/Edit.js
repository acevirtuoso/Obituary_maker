import React, { useEffect, useState } from "react";
import { useOutletContext, useParams, Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

function Edit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [notes, setNotes] = useOutletContext();
  const currrentNote = notes.find((element) => element.ID === id);

  const [title, setTitle] = useState(currrentNote.title);
  const [date, setDate] = useState(currrentNote.dateTime || getCurrentDate());
  const [content, setContent] = useState(currrentNote.content);

  function getCurrentDate() {
    var date = new Date();
    date = date.toISOString();
    date = date.substring(0, date.length - 1);
    let replace = date.split("T");
    let corrected = parseInt(date.substring(11, 13)) - 7;
    if (corrected < 0) {
      corrected += 24;
    }
    return (
      replace[0] +
      "T" +
      corrected +
      replace[1].substring(2, replace[1].length - 4)
    );
  }
  function save() {
    currrentNote.title = title;
    currrentNote.dateTime = date;
    currrentNote.content = content;
    localStorage.setItem("noteMenu.notes", JSON.stringify(notes));
    navigate(`/notes/${id}`, { replace: true });
  }

  function deleteNote() {
    const index = notes.indexOf(currrentNote);
    if (index > -1) notes.splice(index, 1);
    localStorage.setItem("noteMenu.notes", JSON.stringify(notes));
  }

  function handleDelete() {
    const answer = window.confirm("Are you sure?");
    if (answer) deleteNote();
    if (!notes[0]) {
      navigate("/notes", { replace: true });
    } else {
      navigate(`/notes/${notes[0].ID}`, { replace: true });
    }
  }

  return (
    <>
      <div id="edit-header">
        <div id="edit-info">
          <input
            className="edit-note-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            className="date-input"
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="button-group">
          <button id="save-button" onClick={save}>
            Save
          </button>
          <button id="delete-button" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </div>
      <ReactQuill
        id="edit-box"
        theme="snow"
        placeholder="Your Note Here"
        value={content}
        onChange={setContent}
      />
    </>
  );
}

export default Edit;
