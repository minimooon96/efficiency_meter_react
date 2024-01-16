import React, { useRef, useState, useEffect } from 'react';
import { firestore } from '../firebase';
import { addDoc, collection, getDocs, deleteDoc, doc } from '@firebase/firestore';

const Analysis = () => {
  const messageRef = useRef();
  const messagesRef = collection(firestore, 'logs');
  const [logs, setLogs] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [suggestionHistory, setSuggestionHistory] = useState([]);
  const [totalLogTime, setTotalLogTime] = useState(0);
  const [averageLogTime, setAverageLogTime] = useState(0);
  const [mostFrequentActivity, setMostFrequentActivity] = useState('');
  const [activityDistribution, setActivityDistribution] = useState({});

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const querySnapshot = await getDocs(messagesRef);
        const logsData = [];
        querySnapshot.forEach((doc) => {
          logsData.push({ id: doc.id, ...doc.data() });
        });
        setLogs(logsData);
      } catch (e) {
        console.error('Error fetching logs: ', e);
      }
    };
    fetchLogs();
  }, [messagesRef]);

  useEffect(() => {
    const storedOngoingActivity = localStorage.getItem('ongoingActivity');
    if (storedOngoingActivity) {
      setActivityLog((prevLog) => [...prevLog, JSON.parse(storedOngoingActivity)]);
    }
    const storedLog = localStorage.getItem('activityLog');
    if (storedLog) {
      setActivityLog(JSON.parse(storedLog));
    }

    const storedSuggestionHistory = localStorage.getItem('suggestionHistory');
    if (storedSuggestionHistory) {
      setSuggestionHistory(JSON.parse(storedSuggestionHistory));
    }
  }, []);

  useEffect(() => {
    if (logs.length > 0) {
      const calculatedTotalLogTime = logs.reduce((total, log) => total + log.duration, 0);
      setTotalLogTime(calculatedTotalLogTime);

      const calculatedAverageLogTime = calculatedTotalLogTime / logs.length;
      setAverageLogTime(calculatedAverageLogTime);

      const activityCounts = {};
      logs.forEach((log) => {
        activityCounts[log.activity] = (activityCounts[log.activity] || 0) + 1;
      });
      const calculatedMostFrequentActivity = Object.keys(activityCounts).reduce((a, b) =>
        activityCounts[a] > activityCounts[b] ? a : b
      );
      setMostFrequentActivity(calculatedMostFrequentActivity);

      const calculatedActivityDistribution = {};
      logs.forEach((log) => {
        calculatedActivityDistribution[log.activity] =
          (calculatedActivityDistribution[log.activity] || 0) + log.duration;
      });
      setActivityDistribution(calculatedActivityDistribution);
    }
  }, [logs]);

  const handleSave = async (e) => {
    e.preventDefault();
    let data = {
      activity: messageRef.current.value,
    };

    try {
      const docRef = await addDoc(messagesRef, data);
      setLogs([...logs, { id: docRef.id, ...data }]);
      messageRef.current.value = '';
    } catch (error) {
      console.log(error);
    }
  };

  const deleteMessage = async (id) => {
    try {
      await deleteDoc(doc(firestore, 'logs', id));
      setLogs((prevLogs) => prevLogs.filter((log) => log.id !== id));
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const startActivity = () => {
    const currentActivity = messageRef.current.value.trim();

    if (currentActivity === '') {
      alert('No Activity is added');
      return;
    }

    const startTime = new Date();
    const entry = {
      activity: currentActivity,
      startTime,
      endTime: 0,
      duration: 0,
    };

    setActivityLog((prevLog) => [...prevLog, entry]);
    localStorage.setItem('ongoingActivity', JSON.stringify(entry));
    updateSuggestions(currentActivity);
  };

  const stopActivity = (index) => {
    const endTime = new Date();
    setActivityLog((prevLog) =>
      prevLog.map((entry, i) =>
        i === index ? { ...entry, endTime, duration: (endTime - entry.startTime) / 1000 } : entry
      )
    );
    localStorage.removeItem('ongoingActivity');
  };

  const deleteActivity = (index) => {
    setActivityLog((prevLog) => prevLog.filter((entry, i) => i !== index));
  };

  const updateSuggestions = (text) => {
    setSuggestionHistory((prevHistory) => {
      const updatedHistory = [...prevHistory, text];
      localStorage.setItem('suggestionHistory', JSON.stringify(updatedHistory));
      return updatedHistory;
    });
  };

  const clearSuggestions = () => {
    setSuggestionHistory([]);
  };

  const clearLog = () => {
    if (activityLog.length === 0) {
      alert('All Activity Logs are cleared');
      return;
    }

    setActivityLog([]);
  };

  const exportLog = async () => {
    const stoppedActivities = activityLog.filter((entry) => entry.endTime !== null);

    if (stoppedActivities.length === 0) {
      alert("Can't export log. At least one activity must be stopped.");
      return;
    }

    const logData = stoppedActivities.map(({ activity, startTime, endTime, duration }) => ({
      activity,
      startTime,
      endTime,
      duration,
    }));

    try {
      const logsCollection = collection(firestore, 'logs');
      await Promise.all(
        logData.map(async (log) => {
          await addDoc(logsCollection, log);
        })
      );

      console.log('Log data exported to Firestore.');
      alert('Log data has been exported to Firestore.');
    } catch (error) {
      console.error('Error exporting log data to Firestore:', error);
      alert('Error exporting log data to Firestore.');
    }
  };

  const updateActivityLog = () => {
    const activityLogElement = document.getElementById('activity-log');
    activityLogElement.innerHTML = '';
    activityLog.forEach((log, index) => {
      const listItem = document.createElement('li');
      const ongoingActivity = !log.endTime;

      if (ongoingActivity) {
        listItem.textContent = `${log.activity}: ${log.startTime.toLocaleString()} - Ongoing Activity`;
      } else {
        listItem.textContent = `${log.activity}: ${log.startTime.toLocaleString()} - ${log.endTime.toLocaleString()} (${formatTime(
          log.duration
        )})`;
      }

      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.onclick = () => deleteActivity(index);
      listItem.appendChild(deleteButton);

      if (ongoingActivity) {
        const stopButton = document.createElement('button');
        stopButton.textContent = 'Stop';
        stopButton.onclick = () => stopActivity(index);
        listItem.appendChild(stopButton);
      }

      activityLogElement.appendChild(listItem);
    });

    localStorage.setItem('activityLog', JSON.stringify(activityLog));
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${remainingSeconds}`;
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${remainingSeconds}`;
  };

  return (
    <div className="analysis-container">
      <center>
        <h3>Advanced Timer</h3>
        <div>
          <label htmlFor="activity">
            <b id="switch"></b>
          </label>
          <br />
          <form onSubmit={handleSave}>
            <label>Activity Name </label>
            <input
              type="text"
              id="activity"
              placeholder="Enter Activity..."
              title="Coding, Documentation, Internet, SQL, or any other"
              list="activity-suggestions"
              ref={messageRef}
            />
            <button type="submit">Fetch history</button>
          </form>

          <datalist id="activity-suggestions">
            {suggestionHistory.map((prevSuggestion) => (
              <option key={prevSuggestion} value={prevSuggestion} />
            ))}
          </datalist>
          <br />
          <br />
          <button onClick={startActivity}>Start</button>
          <button className="clear-log" onClick={clearLog}>
            Clear Logs
          </button>
          <button className="export-log" onClick={exportLog}>
            Export Log
          </button>
          <button className="clear-suggestions" onClick={clearSuggestions}>
            Clear Suggestions
          </button>
        </div>
      </center>
      <ul id="timeEntriesList">
        {/* Render ongoing activities or display a message if none */}
      </ul>
      <div>
        <h2>Activity Log</h2>
        <ul id="activity-log" className="activity-list">
          {activityLog.map((log, index) => (
            <li key={index}>
              {log.activity}: {log.startTime.toLocaleString()} -{' '}
              {log.endTime ? `${log.endTime.toLocaleString()} (${formatTime(log.duration)})` : 'Ongoing Activity'}
              <button onClick={() => deleteActivity(index)}>Delete</button>
              {!log.endTime && <button onClick={() => stopActivity(index)}>Stop</button>}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h4>Log History:</h4>
        <ul>
          {logs.map((log) => (
            <li key={log.id}>
              {log.activity}
              <span style={{ marginLeft: '10px' }}>Time spent: {log.duration} seconds</span>
              <button onClick={() => deleteMessage(log.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h4>Analytics</h4>
        <p>Total Time Spent: {totalLogTime} seconds</p>
        <p>Average Time Spent: {averageLogTime} seconds</p>
        <p>Most Frequent Activity: {mostFrequentActivity}</p>
        <p>Activity Distribution:</p>
        <ul>
          {Object.entries(activityDistribution).map(([activity, time]) => (
            <li key={activity}>
              {activity}: {time} seconds
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Analysis;