import React, { useState, useEffect } from 'react';
import './style-timesense.css';
import errorSound from './sounds/error.mp3';
import notifySound from './sounds/notify.mp3';

const errorAudio = new Audio(errorSound);
const notifyAudio = new Audio(notifySound);

const Timer = () => {
  const [dayMessage, setDayMessage] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [isHidden, setIsHidden] = useState(true);
  const [countdown, setCountdown] = useState(null);
  const [time, setTime] = useState(
    JSON.parse(localStorage.getItem('timer')) || { hours: 0, minutes: 0, seconds: 0 }
  );

  const startCountdown = () => {
    clearInterval(countdown);

    const totalTimeInSeconds = time.hours * 3600 + time.minutes * 60 + time.seconds;

    if (totalTimeInSeconds <= 0) {
      errorAudio.play();
      alert("Please enter a valid time..!!!");
      return;
    }

    let remainingTime = totalTimeInSeconds;

    const updateTimer = () => {
      const hoursRemaining = Math.floor(remainingTime / 3600);
      const minutesRemaining = Math.floor((remainingTime % 3600) / 60);
      const secondsRemaining = remainingTime % 60;

      setTime({ hours: hoursRemaining, minutes: minutesRemaining, seconds: secondsRemaining });

      if (remainingTime <= 0) {
        notifyAudio.play();
        alert("Time's up!");
        resetTimer();
      }
      remainingTime--;
    };

    setCountdown(setInterval(updateTimer, 1000));
  };

  const stopCountdown = () => {
    clearInterval(countdown);
    resetTimer();
  };

  const resetTimer = () => {
    const initialTime = { hours: 0, minutes: 0, seconds: 0 };
    setTime(initialTime);
    localStorage.setItem('timer', JSON.stringify(initialTime));
    clearInterval(countdown);
    setCountdown(null);
  };

  const handleChange = (event) => {
    const { id, value } = event.target;
    const updatedTime = { ...time, [id]: parseInt(value, 10) || 0 };
    setTime(updatedTime);
    localStorage.setItem('timer', JSON.stringify(updatedTime));
  };

  useEffect(() => {
    return () => clearInterval(countdown);
  }, [countdown]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        localStorage.setItem('backgroundTimer', JSON.stringify(time));
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [time]);

  useEffect(() => {
    const backgroundTimer = JSON.parse(localStorage.getItem('backgroundTimer'));

    if (backgroundTimer) {
      setTime(backgroundTimer);
      localStorage.removeItem('backgroundTimer');
    }
  }, []);

  useEffect(() => {
    // Set the day message
    let day;
    switch (new Date().getDay()) {
      case 0:
        day = "Sunday";
        break;
      case 1:
        day = "Monday";
        break;
      case 2:
        day = "Tuesday";
        break;
      case 3:
        day = "Wednesday";
        break;
      case 4:
        day = "Thursday";
        break;
      case 5:
        day = "Friday";
        break;
      case 6:
        day = "Saturday";
        break;
      default:
        day = "";
    }
    setDayMessage("Happy " + day + "..!!!");

    const intervalId = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="container">
      <center>
        <h3>TIME SENSE</h3>
        <div>
          <div id="demo">{currentTime}</div>
          <br />
          <div>
            <big id="switch">{dayMessage}</big>
            <button onClick={() => setIsHidden(!isHidden)} style={{ padding: '8px', fontSize: '16px' }}>
              {isHidden ? 'Show info' : 'Hide info'}
            </button>

            {!isHidden && (
              <div>
                Set timer and click start <br />
                Keep the volume intact for sound alert when countdown completes <br />
              </div>
            )}
          </div>
          <br />
        </div>
        <div className="hms">
          {['hours', 'minutes', 'seconds'].map((unit) => (
            <React.Fragment key={unit}>
              <label htmlFor={unit}>{unit.charAt(0).toUpperCase() + unit.slice(1)}:</label>
              <input
                type="number"
                id={unit}
                min={unit === 'hours' ? '0' : '0'}
                max={unit === 'hours' ? '' : '59'}
                value={time[unit]}
                onChange={handleChange}
                placeholder="0"
                required
              />
            </React.Fragment>
          ))}
        </div>
        <div id="timer">{`${time.hours}h ${time.minutes}m ${time.seconds}s`}</div>
        <button id="startButton" onClick={startCountdown}>
          Start
        </button>
        <button id="pauseButton" style={{ display: countdown ? 'inline-block' : 'none' }}
          onClick={() => setCountdown((prev) => (prev ? clearInterval(prev) : null))}>
          {countdown ? 'Pause' : 'Resume'}
        </button>
        <button id="stopButton" style={{ display: countdown ? 'inline-block' : 'none' }} onClick={stopCountdown}>
          Reset
        </button>
      </center>
    </div>
  );
};

export default Timer;