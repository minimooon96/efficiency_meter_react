import React from "react";
import './styleHome.css';
import { Link, useNavigate } from "react-router-dom";
import { useUserAuth } from "../context/UserAuthContext";

const Home = () => {
  const { logOut, user } = useUserAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logOut();
      navigate("/");
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div className="main-content">
      <header>
        <span id="name"><i className="las la-business-time"></i> EFFICIENCY METER</span>
        <div className="user-wrapper">
          {user ? (
            <div id="logout">
              <a href="#" onClick={handleLogout} className="logout-btn">LOGOUT</a>
            </div>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </header>

      <div className="sidebar">
        <div className="sidebar-menu">
          <ul>
            <li>
              <Link to="/Analysis" className="active">
                <span className="las la-mail-bulk"></span>
                <p></p>
                <span>ADVANCED TIMER</span>
              </Link>
            </li>
            <li>
              <Link to="/Countdown" className="active">
                <span className="las la-stopwatch"></span>
                <p></p>
                <span>COUNTDOWN TIMER</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="content">
        <big>
          <h2>Easy To Monitor Your Task</h2>
          <p>
            Improve your efficiency with our straightforward <strong>Time Tracking Tool</strong> created
            to help you manage your time effectively. Stay organized, meet deadlines, and enhance
            your workflow with our easy-to-use tool, ensuring smooth time management.
          </p>
          <h2>Key Features:</h2>
          <dl>
            <li>Straightforward time tracking for tasks and projects.</li>
            <li>Create uncomplicated reports for a brief overview.</li>
          </dl>
          <h2>How It Works:</h2>
          <dl>
            <li><strong>Track Time:</strong> Use the user-friendly interface to log your work hours.</li>
            <li><strong>Set Goals:</strong> Define tasks and deadlines for your projects.</li>
            <li><strong>Review Reports:</strong> Get a quick overview through straightforward reports.</li>
          </dl>
        </big>
      </div>
    </div>
  );
};

export default Home;
