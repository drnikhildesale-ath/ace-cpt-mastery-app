import React, { useContext, useState } from 'react';
import { AuthContext } from './AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebase';
import './styles/Dashboard.css';

const AdminDashboard = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const [showCreateQuiz, setShowCreateQuiz] = useState(false);
  const [quizData, setQuizData] = useState({ title: '', description: '', questions: [] });
  const [currentQuestion, setCurrentQuestion] = useState({ question: '', options: ['', '', '', ''], correctAnswer: 0 });
  const [loading, setLoading] = useState(false);

  const addQuestion = () => {
    if (currentQuestion.question && currentQuestion.options.every(o => o)) {
      setQuizData({
        ...quizData,
        questions: [...quizData.questions, currentQuestion]
      });
      setCurrentQuestion({ question: '', options: ['', '', '', ''], correctAnswer: 0 });
    }
  };

  const saveQuiz = async () => {
    if (!quizData.title || quizData.questions.length === 0) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'quizzes'), {
        ...quizData,
        published: true,
        createdBy: currentUser.email,
        createdAt: new Date()
      });
      alert('Quiz created successfully!');
      setQuizData({ title: '', description: '', questions: [] });
      setShowCreateQuiz(false);
    } catch (error) {
      alert('Error saving quiz: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="user-info">
          <span>{currentUser?.email}</span>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </div>

      <button onClick={() => setShowCreateQuiz(!showCreateQuiz)} className="create-quiz-btn">
        {showCreateQuiz ? 'Cancel' : 'Create Quiz'}
      </button>

      {showCreateQuiz && (
        <div className="create-quiz-form">
          <h2>Create New Quiz</h2>
          <input
            type="text"
            placeholder="Quiz Title"
            value={quizData.title}
            onChange={(e) => setQuizData({...quizData, title: e.target.value})}
          />
          <textarea
            placeholder="Quiz Description"
            value={quizData.description}
            onChange={(e) => setQuizData({...quizData, description: e.target.value})}
          />

          <div className="question-builder">
            <h3>Add Questions</h3>
            <input
              type="text"
              placeholder="Question"
              value={currentQuestion.question}
              onChange={(e) => setCurrentQuestion({...currentQuestion, question: e.target.value})}
            />
            {currentQuestion.options.map((opt, idx) => (
              <input
                key={idx}
                type="text"
                placeholder={`Option ${idx + 1}`}
                value={opt}
                onChange={(e) => {
                  const newOpts = [...currentQuestion.options];
                  newOpts[idx] = e.target.value;
                  setCurrentQuestion({...currentQuestion, options: newOpts});
                }}
              />
            ))}
            <select
              value={currentQuestion.correctAnswer}
              onChange={(e) => setCurrentQuestion({...currentQuestion, correctAnswer: parseInt(e.target.value)})}
            >
              {currentQuestion.options.map((_, idx) => (
                <option key={idx} value={idx}>Correct Answer: Option {idx + 1}</option>
              ))}
            </select>
            <button onClick={addQuestion}>Add Question</button>
          </div>

          <p>Questions Added: {quizData.questions.length}</p>
          <button onClick={saveQuiz} disabled={loading}>
            {loading ? 'Saving...' : 'Save Quiz'}
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
