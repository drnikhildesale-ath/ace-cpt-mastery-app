import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import { db } from './firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import './styles/Dashboard.css';

const StudentDashboard = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const q = query(collection(db, 'quizzes'), where('published', '==', true));
        const snapshot = await getDocs(q);
        setQuizzes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Error fetching quizzes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const submitQuiz = () => {
    if (!selectedQuiz) return;
    
    let correctCount = 0;
    selectedQuiz.questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) correctCount++;
    });
    
    const percentage = (correctCount / selectedQuiz.questions.length) * 100;
    setScore({ correct: correctCount, total: selectedQuiz.questions.length, percentage });
  };

  if (loading) return <div className="dashboard"><p>Loading quizzes...</p></div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Student Dashboard</h1>
        <div className="user-info">
          <span>{currentUser?.email}</span>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </div>

      {!selectedQuiz ? (
        <div className="quizzes-list">
          <h2>Available Quizzes</h2>
          {quizzes.map(quiz => (
            <div key={quiz.id} className="quiz-card">
              <h3>{quiz.title}</h3>
              <p>{quiz.description}</p>
              <button onClick={() => setSelectedQuiz(quiz)}>Start Quiz</button>
            </div>
          ))}
        </div>
      ) : score ? (
        <div className="score-container">
          <h2>Quiz Complete!</h2>
          <p>Score: {score.correct}/{score.total} ({score.percentage.toFixed(1)}%)</p>
          <button onClick={() => { setSelectedQuiz(null); setScore(null); setAnswers({}); }}>Back to Quizzes</button>
        </div>
      ) : (
        <div className="quiz-container">
          <h2>{selectedQuiz.title}</h2>
          {selectedQuiz.questions.map((q, idx) => (
            <div key={idx} className="question">
              <p><strong>{idx + 1}. {q.question}</strong></p>
              {q.options.map((opt, optIdx) => (
                <label key={optIdx}>
                  <input
                    type="radio"
                    name={`question-${idx}`}
                    value={optIdx}
                    onChange={(e) => setAnswers({ ...answers, [idx]: parseInt(e.target.value) })}
                    checked={answers[idx] === optIdx}
                  />
                  {opt}
                </label>
              ))}
            </div>
          ))}
          <button onClick={submitQuiz} className="submit-btn">Submit Quiz</button>
          <button onClick={() => setSelectedQuiz(null)} className="back-btn">Back</button>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
