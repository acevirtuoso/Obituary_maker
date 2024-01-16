import Obituary from "./Obituary";

function ObitList({ obitList }) {
  return obitList.length > 0 ? (
    obitList.map((obituary) => {
      return (
        <Obituary
          key={obituary.uuid}
          obituary={obituary}
          last={obitList[obitList.length - 1] === obituary}
        />
      );
    })
  ) : (
    <>
      <div id="none-selected">
        <h2>No Obituaries</h2>
      </div>
    </>
  );
}

export default ObitList;
