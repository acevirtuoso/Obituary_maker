import ReactQuill from "react-quill";
// import "react-quill/dist/quill.snow.css";
function Overlay(addingObitBool) {
  function checkAdding() {
    if (addingObitBool === true) {
      return (
        <>
          <div id="overlay">
            <div id="title"></div>
            <div id="name-input"></div>
            <div id="date-inputs">
              <input
                className="date-input"
                type="datetime-local"
                // value={}
                // onChange={(e) => setDate(e.target.value)}
              />
              <input
                className="date-input"
                type="datetime-local"
                // value={date}
                // onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div id="write-button">
              <button>Write Obituary</button>
            </div>
          </div>
        </>
      );
    } else {
      return <></>;
    }
  }

  return <>{checkAdding()}</>;
}

export default Overlay;
