import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import SimpleMarkdownRenderer from '../components/SimpleMarkdownRenderer';
import Footer from '../components/Footer';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [deletingQuestions, setDeletingQuestions] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 5;

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get('/api/questions');
      setQuestions(response.data);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      return;
    }

    setDeletingQuestions(prev => new Set(prev).add(questionId));
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/questions/${questionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setQuestions(prev => prev.filter(q => q._id !== questionId));
      alert('Question deleted successfully!');
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
      setDeletingQuestions(prev => {
        const newSet = new Set(prev);
        newSet.delete(questionId);
        return newSet;
      });
    }
  };

  const filteredQuestions = questions.filter(question =>
    question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    question.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedAndFilteredQuestions = [...filteredQuestions].sort((a, b) => {
    switch (filter) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'most-answers':
        return (b.answers?.length || 0) - (a.answers?.length || 0);
      case 'least-answers':
        return (a.answers?.length || 0) - (b.answers?.length || 0);
      default:
        return 0; // 'all' - no sorting
    }
  });

  // Pagination logic
  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = sortedAndFilteredQuestions.slice(indexOfFirstQuestion, indexOfLastQuestion);
  const totalPages = Math.ceil(sortedAndFilteredQuestions.length / questionsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">Loading questions...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-black mb-4">Welcome to StackIt</h1>
        <p className="text-gray-600 text-lg mb-8">
          Find answers to your questions or help others by answering theirs.
        </p>
        
        <div className="flex gap-4 mb-8">
          <input
            type="text"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-6 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-white"
          >
            <option value="all" className="py-2">All Questions</option>
            <option value="newest" className="py-2">Newest First</option>
            <option value="oldest" className="py-2">Oldest First</option>
            <option value="most-answers" className="py-2">Most Answers</option>
            <option value="least-answers" className="py-2">Least Answers</option>
          </select>
          <Link
            to="/ask"
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Ask Question
          </Link>
        </div>
      </div>

      <div className="space-y-6">
        {currentQuestions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">No questions found.</p>
            <Link
              to="/ask"
              className="text-black hover:text-gray-600 transition-colors font-medium"
            >
              Be the first to ask a question!
            </Link>
          </div>
        ) : (
          currentQuestions.map((question) => {
            const canDeleteQuestion = user && question.user && user.id === question.user._id;
            const isDeleting = deletingQuestions.has(question._id);
            
            return (
              <div
                key={question._id}
                className="question-card border border-gray-200 rounded-lg hover:shadow-md transition-shadow bg-white"
              >
                <div className="question-card-content">
                  <div className="question-card-header flex justify-between items-start">
                    <Link to={`/question/${question._id}`} className="flex-1">
                      <h2 className="text-xl font-semibold text-black hover:text-gray-600 transition-colors">
                        {question.title}
                      </h2>
                    </Link>
                    {canDeleteQuestion && (
                      <button
                        onClick={() => handleDeleteQuestion(question._id)}
                        disabled={isDeleting}
                        className="ml-4 bg-red-500 text-white px-3 py-1 text-sm hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </button>
                    )}
                  </div>
                  
                  <div className="question-card-body">
                    <div className="text-gray-600 line-clamp-2">
                      <SimpleMarkdownRenderer content={question.description} />
                    </div>
                  </div>
                  
                  <div className="question-card-footer flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span>Asked by {question.user?.username || 'Anonymous'}</span>
                      <span>{new Date(question.createdAt).toLocaleDateString()}</span>
                      <span className="mx-4 text-gray-400">•</span>
                      <span>{question.answers?.length || 0} answers</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      {question.tags && question.tags.length > 0 && (
                        <div className="flex space-x-2">
                          {question.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      <div className="mt-8 flex flex-col items-center space-y-4">
        <div className="text-sm text-gray-600">
          Showing {indexOfFirstQuestion + 1} to {Math.min(indexOfLastQuestion, sortedAndFilteredQuestions.length)} of {sortedAndFilteredQuestions.length} questions
          {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
        </div>
        {totalPages > 1 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => handlePageChange(pageNumber)}
                className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                  currentPage === pageNumber
                    ? 'bg-black text-white border-black'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {pageNumber}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
        {totalPages <= 1 && (
          <div className="text-sm text-gray-500">
            All questions are shown on this page
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Home; 