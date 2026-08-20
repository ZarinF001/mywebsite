import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Home.css";

function Home() {
  const API = "http://localhost:5000";
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [routines, setRoutines] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRoutine, setNewRoutine] = useState({
    title: "",
    description: ""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch user and routines on mount
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    fetchRoutines(parsedUser.id);
  }, [navigate]);

  // Fetch routines from API
  const fetchRoutines = async (userId) => {
    try {
      const res = await axios.get(`${API}/routines/${userId}`);
      if (res.data.status === "ok") {
        setRoutines(res.data.routines);
      }
    } catch (error) {
      console.log(error);
      setError("Failed to fetch routines");
    } finally {
      setLoading(false);
    }
  };

  // Add new routine
  const handleAddRoutine = async () => {
    if (!newRoutine.title.trim()) {
      setError("Please enter a routine title");
      return;
    }

    try {
      const res = await axios.post(`${API}/routine`, {
        userId: user.id,
        title: newRoutine.title,
        description: newRoutine.description,
        completed: false
      });

      if (res.data.status === "ok") {
        setRoutines([res.data.routine, ...routines]);
        setNewRoutine({ title: "", description: "" });
        setShowAddForm(false);
        setError("");
      }
    } catch (error) {
      console.log(error);
      setError("Failed to add routine");
    }
  };

  // Toggle routine completion
  const handleToggleRoutine = async (routine) => {
    try {
      const res = await axios.put(`${API}/routine/${routine.id}`, {
        completed: !routine.completed,
        title: routine.title,
        description: routine.description
      });

      if (res.data.status === "ok") {
        setRoutines(
          routines.map((r) =>
            r.id === routine.id ? { ...r, completed: !r.completed } : r
          )
        );
      }
    } catch (error) {
      console.log(error);
      setError("Failed to update routine");
    }
  };

  // Delete routine
  const handleDeleteRoutine = async (id) => {
    try {
      const res = await axios.delete(`${API}/routine/${id}`);
      if (res.data.status === "ok") {
        setRoutines(routines.filter((r) => r.id !== id));
      }
    } catch (error) {
      console.log(error);
      setError("Failed to delete routine");
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) {
    return <div className="home-container">Loading...</div>;
  }

  const completedCount = routines.filter((r) => r.completed).length;
  const progressPercentage = routines.length > 0 ? (completedCount / routines.length) * 100 : 0;

  return (
    <div className="home-container">
      <div className="home-header">
        <div className="header-content">
          <h1 className="home-title">My Daily Routine Tracker</h1>
          <p className="home-greeting">Welcome, {user?.name}!</p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="home-content">
        {/* Progress Section */}
        <div className="progress-section">
          <div className="progress-header">
            <h2>Today's Progress</h2>
            <span className="progress-count">
              {completedCount}/{routines.length} completed
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <p className="progress-text">{Math.round(progressPercentage)}% of your routines completed</p>
        </div>

        {/* Add Routine Section */}
        <div className="add-routine-section">
          {!showAddForm ? (
            <button className="add-btn" onClick={() => setShowAddForm(true)}>
              + Add New Routine
            </button>
          ) : (
            <div className="add-form">
              <input
                type="text"
                placeholder="Routine title (e.g., Morning Exercise)"
                value={newRoutine.title}
                onChange={(e) =>
                  setNewRoutine({ ...newRoutine, title: e.target.value })
                }
                className="form-input"
              />
              <textarea
                placeholder="Description (optional)"
                value={newRoutine.description}
                onChange={(e) =>
                  setNewRoutine({ ...newRoutine, description: e.target.value })
                }
                className="form-textarea"
                rows="3"
              />
              <div className="form-buttons">
                <button className="save-btn" onClick={handleAddRoutine}>
                  Save Routine
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewRoutine({ title: "", description: "" });
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Routines List */}
        <div className="routines-section">
          <h2>Your Routines</h2>
          {routines.length === 0 ? (
            <div className="empty-state">
              <p>No routines yet. Add one to get started!</p>
            </div>
          ) : (
            <div className="routines-list">
              {routines.map((routine) => (
                <div
                  key={routine.id}
                  className={`routine-card ${routine.completed ? "completed" : ""}`}
                >
                  <div className="routine-checkbox">
                    <input
                      type="checkbox"
                      checked={routine.completed}
                      onChange={() => handleToggleRoutine(routine)}
                      className="checkbox"
                    />
                  </div>
                  <div className="routine-content">
                    <h3 className="routine-title">{routine.title}</h3>
                    {routine.description && (
                      <p className="routine-description">{routine.description}</p>
                    )}
                  </div>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteRoutine(routine.id)}
                    title="Delete routine"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;