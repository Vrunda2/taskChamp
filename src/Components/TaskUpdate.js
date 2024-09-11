import { User } from "../models/User";
import { Task } from "../models/Task";
import { useState } from "react";
import styles from "./TaskUpdate.module.css";

const TaskUpdate = ({ isOpen, onClose, task, onUpdate }) => {
  const [taskName, setTaskName] = useState(task.taskName);
  const [level, setLevel] = useState(task.level);

  if (!isOpen) return null;

  const handleUpdate = (e) => {
    e.preventDefault();
    onUpdate(task.taskId, taskName, level);
    onClose();
  };

  return (
    <div className={styles.formContainer}>
      <form onSubmit={handleUpdate}>
        <input
          type="text"
          value={taskName}
          className={styles.inputField}
          placeholder="Task name"
          onChange={(e) => setTaskName(e.target.value)}
          required
        />
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className={styles.selectField}
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <div className={styles.buttonGroup}>
          <button
            type="submit"
            className={`${styles.button} ${styles.updateButton}`}
          >
            Update
          </button>
          <button
            type="button"
            className={`${styles.button} ${styles.cancelButton}`}
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskUpdate;
