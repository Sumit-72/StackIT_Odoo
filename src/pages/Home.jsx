import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredQuestions = questions.filter(question =>
    question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    question.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading questions...</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Welcome to Odoo Q&A</h1>
        <p className="text-gray-600 mb-4">
          Find answers to your questions or help others by answering theirs.
        </p>
        
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Link
            to="/ask"
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            Ask Question
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No questions found.</p>
            <Link
              to="/ask"
              className="text-blue-500 hover:text-blue-600 mt-2 inline-block"
            >
              Be the first to ask a question!
            </Link>
          </div>
        ) : (
          filteredQuestions.map((question) => (
            <div
              key={question._id}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <Link to={`/question/${question._id}`}>
                <h2 className="text-xl font-semibold mb-2 text-blue-600 hover:text-blue-800">
                  {question.title}
                </h2>
              </Link>
              <p className="text-gray-600 mb-3 line-clamp-2">
                {question.description}
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  <span>Asked by {question.user?.username || 'Anonymous'}</span>
                  <span>{new Date(question.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>{question.answers?.length || 0} answers</span>
                  {question.tags && question.tags.length > 0 && (
                    <div className="flex gap-1">
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
          ))
        )}
      </div>
    </div>
  );
};

export default Home; 