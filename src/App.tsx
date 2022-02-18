import React from 'react';
import './App.css';
import { useTransition, animated, useSpring } from 'react-spring';

enum AppState {
  Setup = "Setup",
  Timer = "Timer",
  GameOver = "GameOver",
}

const RUNNING_COLOR = "#55A973";
const PAUSE_COLOR = "#F19748";
const END_COLOR = "#DC5B6E";

function App() {
  const [names, updateNames] = React.useState<string>("");
  const [timerLength, updateTimerLength] = React.useState<number>(5);
  const [appState, updateAppState] = React.useState<AppState>(AppState.Setup);
  const [namesArray, setNamesArray] = React.useState<string[]>([]);
  const [endTime, setEndTime] = React.useState(new Date().getTime() + 10000);
  const [turnNumber, setTurnNumber] = React.useState(0);
  const [waiting, setWaiting] = React.useState(false);
  const [firstIteration, setFirstIteration] = React.useState(true);
  const [pauseMsLeft, setPauseMsLeft] = React.useState(0);
  const [bgFillProps, api] = useSpring(() => ({ height: "100%", background: RUNNING_COLOR }));

  const parseAndShuffleNames = () => {
    const newNamesArray = names.split(";");
    let numberNames = newNamesArray.length;
    let i = 0;
    let temp = "";
    while (numberNames) {
      i = Math.floor(Math.random() * numberNames--);

      temp = newNamesArray[numberNames];
      newNamesArray[numberNames] = newNamesArray[i];
      newNamesArray[i] = temp;
    }

    setNamesArray(newNamesArray);
  }

  const setNewEndTime = () => {
    setWaiting(true);
    api.start({ height: "0%", background: RUNNING_COLOR});
    setTimeout(() => {
      api.start({ height: "100%" });
      if (firstIteration) {
        setFirstIteration(false);
      } else {
        setTurnNumber(turnNumber + 1);
      }
      setTimeout(() => {
        setEndTime(new Date().getTime() + (timerLength) * 1000);
        setWaiting(false);
      }, 700);
    }, 500);
  };

  const tick = () => {
    if (appState !== AppState.Timer || waiting) {
      return;
    }
    const timeLeftMs = calculateTimeLeft();
    api.start({ height: `${timeLeftMs / (timerLength * 10)}%`});

    if (timeLeftMs <= 0) {
      setNewEndTime();
    }
  };

  const calculateTimeLeft = () => {
    return endTime - new Date().getTime();
  };

  React.useEffect(() => {
    const timerID = setInterval(() => tick(), 5);
    return () => clearInterval(timerID);
  });

  React.useEffect(() => {
    const listener = (event: any) => {
      if (appState !== AppState.Timer && appState !== AppState.GameOver) {
        return;
      }
      if ((event.code === "Enter" || event.code === "NumpadEnter") && appState !== AppState.GameOver) {
        setNewEndTime();
      } else if (event.code === "Space" && appState === AppState.Timer) {
        if (waiting) {
          setWaiting(false);
          setEndTime(new Date().getTime() + pauseMsLeft);
          api.start({ background: RUNNING_COLOR });
        } else {
          setWaiting(true);
          setPauseMsLeft(calculateTimeLeft);
          api.start({ background: PAUSE_COLOR });
        }
      } else if (event.code === "Escape" && appState === AppState.Timer) {
        updateAppState(AppState.GameOver);
        setWaiting(true);
        api.start({ background: END_COLOR});
      } else if (event.code === "Escape" && appState === AppState.GameOver) {
        updateAppState(AppState.Setup);
        setFirstIteration(true);
      }
    }
    document.addEventListener("keydown", listener);
    return () => {
      document.removeEventListener("keydown", listener);
    };
  });


  let content;
  if (appState === AppState.Setup) {
    content = (
      <div className="Setup">
        <h1>TurnTimer</h1>
        <h2>Names</h2>
        <input
          className="Inputs Names"
          spellCheck="false"
          value={names}
          onChange={(e) => updateNames(e.target.value)} />
        <h2>Seconds/Name</h2>
        <input
          className="Inputs Seconds"
          type="number"
          value={timerLength}
          onChange={(e) => updateTimerLength(e.target.valueAsNumber)} />
        <input
          className="StartButton"
          type="button"
          value="▶"
          onClick={() => {
            parseAndShuffleNames();
            setNewEndTime();
            updateAppState(AppState.Timer);
            api.start({ height: "100%"})
          }} />
      </div>
    );
  } else if (appState === AppState.Timer || appState === AppState.GameOver) {
    content = (
      <div className="Timer">
        <animated.div className="fill" style={bgFillProps} />
        <div className="BigName">
          {namesArray[turnNumber % namesArray.length]}
        </div>
        <div className="NextName">
          Next: {namesArray[(turnNumber + 1) % namesArray.length]}
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <div className="Content">
        {content}
      </div>
      <div className="Footer">
        <span>TurnTimer</span>
        <span>About</span>
        <span></span>
      </div>
    </div>
  );
}

export default App;
