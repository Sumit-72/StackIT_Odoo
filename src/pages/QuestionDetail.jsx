import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import SimpleMarkdownRenderer from '../components/SimpleMarkdownRenderer';

const QuestionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newAnswer, setNewAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingAnswer, setDeletingAnswer] = useState(null);
  const [userVotes, setUserVotes] = useState({});

  useEffect(() => {
    fetchQuestionAndAnswers();
  }, [id]);

  const fetchQuestionAndAnswers = async () => {
    try {
      const [questionRes, answersRes] = await Promise.all([
        axios.get(`/api/questions/${id}`),
        axios.get(`/api/questions/${id}/answers`)
      ]);
      setQuestion(questionRes.data);
      setAnswers(answersRes.data);
      
      if (isAuthenticated && user) {
        const votes = {};
        await Promise.all(
          answersRes.data.map(async (answer) => {
            try {
              const token = localStorage.getItem('token');
              const voteRes = await axios.get(`/api/answers/${answer._id}/vote`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              votes[answer._id] = voteRes.data.voteType;
            } catch (error) {
              votes[answer._id] = null;
            }
          })
        );
        setUserVotes(votes);
      }
    } catch (error) {
      console.error('Error fetching question:', error);
    } finally {
      setLoading(false);
    }
  };

  const isAnswerEmpty = (content) => {
    if (!content) return true;
    const textContent = content.replace(/<[^>]*>/g, '').trim();
    return textContent === '';
  };

  const handleSubmitAnswer = async () => {
    if (!isAuthenticated) {
      alert('Please login to answer questions');
      navigate('/login');
      return;
    }

    if (isAnswerEmpty(newAnswer)) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/questions/${id}/answers`, {
        text: newAnswer
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setNewAnswer('');
      fetchQuestionAndAnswers(); // Refresh answers
    } catch (error) {
      console.error('Error submitting answer:', error);
      if (error.response?.status === 401) {
        alert('Please login to answer questions');
        navigate('/login');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (answerId, voteType) => {
    if (!isAuthenticated) {
      alert('Please login to vote');
      navigate('/login');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`/api/answers/${answerId}/vote`, {
        voteType
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setAnswers(prev => prev.map(answer => 
        answer._id === answerId ? { ...answer, votes: response.data.votes } : answer
      ));
      
      setUserVotes(prev => {
        const currentVote = prev[answerId];
        if (currentVote === voteType) {
          const newVotes = { ...prev };
          delete newVotes[answerId];
          return newVotes;
        } else {
          return { ...prev, [answerId]: voteType };
        }
      });
    } catch (error) {
      console.error('Error voting:', error);
      if (error.response?.status === 401) {
        alert('Please login to vote');
        navigate('/login');
      }
    }
  };

  const handleDeleteQuestion = async () => {
    if (!isAuthenticated) {
      alert('Please login to delete questions');
      navigate('/login');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/questions/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      alert('Question deleted successfully!');
      navigate('/');
    } catch (error) {
      console.error('Error deleting question:', error);
      if (error.response?.status === 401) {
        alert('Please login to delete questions');
        navigate('/login');
      } else if (error.response?.status === 403) {
        alert('You can only delete your own questions');
      } else {
        alert('Error deleting question. Please try again.');
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteAnswer = async (answerId) => {
    if (!isAuthenticated) {
      alert('Please login to delete answers');
      navigate('/login');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this answer? This action cannot be undone.')) {
      return;
    }

    setDeletingAnswer(answerId);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/answers/${answerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setAnswers(prev => prev.filter(answer => answer._id !== answerId));
      alert('Answer deleted successfully!');
    } catch (error) {
      console.error('Error deleting answer:', error);
      if (error.response?.status === 401) {
        alert('Please login to delete answers');
        navigate('/login');
      } else if (error.response?.status === 403) {
        alert('You can only delete your own answers');
      } else {
        alert('Error deleting answer. Please try again.');
      }
    } finally {
      setDeletingAnswer(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">Loading question...</div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-black mb-4">Question not found</h2>
        <button
          onClick={() => navigate('/')}
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const canDeleteQuestion = isAuthenticated && user && question.user && user.id === question.user._id;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Question */}
      <div className="mb-12">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-4xl font-bold text-black handwritten">{question.title}</h1>
          {canDeleteQuestion && (
            <button
              onClick={handleDeleteQuestion}
              disabled={deleting}
              className="bg-red-500 text-white px-4 py-1 hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? 'Deleting...' : 'Delete Question'}
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-6 text-sm text-gray-500 mb-6">
          <span>Asked by {question.user?.username || 'Anonymous'}</span>
          <span>{new Date(question.createdAt).toLocaleDateString()}</span>
          <span className="mx-6 text-gray-400">•</span>
          <span>{answers.length} answers</span>
        </div>
        
        {/* Tags Section */}
        {question.tags && question.tags.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-black mb-3">Tags</h3>
            <div className="flex gap-2">
              {question.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Question Content Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-black mb-4">Question</h3>
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            {/* Question Header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-600">Question</span>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-600">Asked by {question.user?.username || 'Anonymous'}</span>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(question.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            
            {/* Question Content */}
            <div className="p-6">
              <div className="ml-6 pl-6 border-l-4 border-gray-300">
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: question.description }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Answers */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-black mb-6">
          {answers.length} Answer{answers.length !== 1 ? 's' : ''}
        </h2>
        
        {answers.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <p className="text-gray-500 text-lg mb-2">No answers yet</p>
            <p className="text-gray-400 text-sm">
              {isAuthenticated ? 'Be the first to answer this question!' : 'Login to be the first to answer this question!'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {answers.map((answer, index) => {
              const canDeleteAnswer = isAuthenticated && user && answer.user && user.id === answer.user._id;
              const isDeletingAnswer = deletingAnswer === answer._id;
              
              return (
                <div key={answer._id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  {/* Answer Header */}
                  <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 rounded-t-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-600">Answer #{index + 1}</span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-600">
                          {answer.votes} vote{answer.votes !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>Answered by {answer.user?.username || 'Anonymous'}</span>
                        <span>•</span>
                        <span>{new Date(answer.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Answer Content */}
                  <div className="p-6">
                    <div className="flex items-start gap-6">
                      {/* Voting Section */}
                      <div className="flex flex-col items-center gap-3 min-w-[60px]">
                        <button
                          onClick={() => handleVote(answer._id, 'up')}
                          className={`transition-colors text-2xl p-1 rounded hover:bg-gray-100 ${
                            isAuthenticated && userVotes[answer._id] === 'up' 
                              ? 'text-blue-600' 
                              : 'text-gray-400 hover:text-black'
                          }`}
                          title={isAuthenticated ? "Upvote" : "Login to vote"}
                        >
                          ▲
                        </button>
                        <span className="font-bold text-lg text-black min-w-[20px] text-center">
                          {answer.votes}
                        </span>
                        <button
                          onClick={() => handleVote(answer._id, 'down')}
                          className={`transition-colors text-2xl p-1 rounded hover:bg-gray-100 ${
                            isAuthenticated && userVotes[answer._id] === 'down' 
                              ? 'text-red-600' 
                              : 'text-gray-400 hover:text-black'
                          }`}
                          title={isAuthenticated ? "Downvote" : "Login to vote"}
                        >
                          ▼
                        </button>
                      </div>
                      
                      {/* Answer Text */}
                      <div className="flex-1 min-w-0">
                        <div className="prose max-w-none">
                          <SimpleMarkdownRenderer content={answer.text} />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Answer Footer */}
                  <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 rounded-b-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Posted {new Date(answer.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{new Date(answer.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      
                      {canDeleteAnswer && (
                        <button
                          onClick={() => handleDeleteAnswer(answer._id)}
                          disabled={isDeletingAnswer}
                          className="bg-red-500 text-white px-4 py-1.5 text-sm rounded hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                          {isDeletingAnswer ? 'Deleting...' : 'Delete Answer'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Answer Form */}
      <div className="border-t border-gray-200 pt-8">
        <h3 className="text-2xl font-bold text-black mb-6">Your Answer</h3>
        
        {!isAuthenticated ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <p className="text-gray-600 text-lg mb-4">Login to answer this question</p>
            <Link
              to="/login"
              className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              Login to Answer
            </Link>
          </div>
        ) : (
          <>
            <div className="border border-gray-300 rounded-lg mb-6">
              <ReactQuill
                value={newAnswer}
                onChange={setNewAnswer}
                placeholder="Write your answer here..."
                modules={{
                  toolbar: [
                    [{ 'header': [1, 2, false] }],
                    ['bold', 'italic', 'underline'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['link', 'code-block'],
                    ['clean']
                  ],
                }}
                style={{ minHeight: '200px' }}
              />
            </div>
            <button
              onClick={handleSubmitAnswer}
              disabled={submitting || isAnswerEmpty(newAnswer)}
              className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {submitting ? 'Posting Answer...' : 'Post Answer'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default QuestionDetail; 