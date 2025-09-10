import React, { useState, useEffect } from 'react';
import { analysisAPI } from '../../services/api';
import { Clock, FileText, Stethoscope, Heart, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../../utils/constants';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedItems, setExpandedItems] = useState({});

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError('');
      try {
        console.log('History: Fetching analysis history...');
        const response = await analysisAPI.getHistory();
        console.log('History: Raw API response:', response);
        console.log('History: Transformed results:', response.results);
        setHistory(response.results);
      } catch (err) {
        console.error('History: Fetch error:', err);
        setError(err.message || 'Failed to load analysis history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const toggleItem = (id) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const formatTextWithMarkdown = (text) => {
    if (!text) return 'No content available';
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br />')
      .replace(/^\d+\.\s/gm, '<br />$&');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="card py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="card text-red-600 text-sm bg-red-50 p-3 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900">Analysis History</h2>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No analysis history found.</p>
            <Link to="/analyze" className="text-blue-600 hover:underline mt-2 inline-block">
              Start a new analysis
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleItem(item.id)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <span className="text-lg font-medium text-gray-900">
                      Analysis #{item.id} - {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {expandedItems[item.id] ? (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                </button>

                {expandedItems[item.id] && (
                  <div className="p-4 bg-white">
                    {/* Analysis Result */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <span>Analysis Result</span>
                      </h3>
                      <div
                        className="text-gray-800 leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: formatTextWithMarkdown(item.result),
                        }}
                      />
                      {item.file && (
                        <div className="mt-4">
                          <img
                            src={`${API_BASE_URL}${item.file}`}
                            alt={`Analysis #${item.id}`}
                            className="max-h-64 max-w-full rounded-lg shadow-md border"
                            onError={(e) => {
                              console.error(`Failed to load image: ${API_BASE_URL}${item.file}`);
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Recommendations */}
                    {item.recommendations && item.recommendations !== 'Error generating recommendations. Please try again later.' && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                          <Stethoscope className="w-5 h-5 text-blue-600" />
                          <span>Medical Recommendations</span>
                        </h3>
                        <div
                          className="text-gray-700 leading-relaxed prose max-w-none"
                          dangerouslySetInnerHTML={{
                            __html: formatTextWithMarkdown(item.recommendations),
                          }}
                        />
                      </div>
                    )}

                    {/* Remedies */}
                    {item.remedies && item.remedies !== 'Error generating remedies. Please try again later.' && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                          <Heart className="w-5 h-5 text-green-600" />
                          <span>Suggested Remedies</span>
                        </h3>
                        <div
                          className="text-gray-700 leading-relaxed prose max-w-none"
                          dangerouslySetInnerHTML={{
                            __html: formatTextWithMarkdown(item.remedies),
                          }}
                        />
                      </div>
                    )}

                    {/* Analysis Details */}
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Analysis Date</p>
                          <p className="text-sm text-gray-600">
                            {new Date(item.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;