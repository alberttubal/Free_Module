import { useState } from 'react';
import { ArrowLeft, MessageSquarePlus, TrendingUp, MessageSquare, Award, Eye } from 'lucide-react';
import { Navigation } from './Navigation';
import { Page, User } from '../App';

interface QAForumProps {
  user: User | null;
  onNavigate: (page: Page) => void;
  onLogout?: () => void;
}

export function QAForum({ user, onNavigate, onLogout }: QAForumProps) {
  const [showAskForm, setShowAskForm] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [questionTitle, setQuestionTitle] = useState('');
  const [questionBody, setQuestionBody] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);

  const availableTags = ['Programming', 'Math', 'Physics', 'Database', 'Web Dev', 'Algorithms', 'Networks', 'Electronics'];

  const questions = [
    {
      id: 1,
      title: 'How do I implement a binary search tree in C++?',
      body: 'I am having trouble understanding how to implement BST insertion and deletion. Can someone explain the logic?',
      author: 'Juan Dela Cruz',
      isAnonymous: false,
      tags: ['Programming', 'Algorithms'],
      upvotes: 24,
      answers: 5,
      views: 342,
      date: '2 hours ago',
      hasAcceptedAnswer: true,
    },
    {
      id: 2,
      title: 'What is the difference between inner join and outer join?',
      body: 'I keep getting confused about SQL joins. Can someone explain with examples?',
      author: 'Anonymous',
      isAnonymous: true,
      tags: ['Database'],
      upvotes: 18,
      answers: 3,
      views: 256,
      date: '5 hours ago',
      hasAcceptedAnswer: false,
    },
    {
      id: 3,
      title: 'Help with Kirchhoff\'s Law problems',
      body: 'I need help solving circuit analysis problems using KVL and KCL.',
      author: 'Maria Santos',
      isAnonymous: false,
      tags: ['Electronics', 'Physics'],
      upvotes: 12,
      answers: 8,
      views: 189,
      date: '1 day ago',
      hasAcceptedAnswer: true,
    },
    {
      id: 4,
      title: 'Best practices for React state management?',
      body: 'What are the current best practices for managing state in large React applications?',
      author: 'Anonymous',
      isAnonymous: true,
      tags: ['Web Dev', 'Programming'],
      upvotes: 31,
      answers: 12,
      views: 567,
      date: '2 days ago',
      hasAcceptedAnswer: false,
    },
  ];

  const answers = [
    {
      author: 'Sarah Lee',
      isAnonymous: false,
      body: 'Here\'s a simple implementation of BST insertion in C++:\n\nstruct Node {\n    int data;\n    Node *left, *right;\n};\n\nNode* insert(Node* root, int value) {\n    if (root == NULL) {\n        Node* newNode = new Node();\n        newNode->data = value;\n        newNode->left = newNode->right = NULL;\n        return newNode;\n    }\n    if (value < root->data)\n        root->left = insert(root->left, value);\n    else\n        root->right = insert(root->right, value);\n    return root;\n}',
      upvotes: 18,
      isBestAnswer: true,
      date: '1 hour ago',
    },
    {
      author: 'Anonymous',
      isAnonymous: true,
      body: 'Don\'t forget to handle edge cases like duplicate values and balancing. You might also want to look into AVL trees for better performance.',
      upvotes: 6,
      isBestAnswer: false,
      date: '30 minutes ago',
    },
  ];

  const handleAskQuestion = () => {
    if (!questionTitle || !questionBody) return;
    // Mock submission
    setShowAskForm(false);
    setQuestionTitle('');
    setQuestionBody('');
    setSelectedTags([]);
    setIsAnonymous(false);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="qa" onNavigate={onNavigate} onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button 
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </button>
            <h1 className="text-gray-900">Q&A Forum</h1>
          </div>
          
          <button
            onClick={() => setShowAskForm(!showAskForm)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <MessageSquarePlus className="w-5 h-5" />
            Ask Question
          </button>
        </div>

        {/* Ask Question Form */}
        {showAskForm && (
          <div className="bg-white rounded-xl p-6 shadow-md mb-8">
            <h2 className="text-gray-900 mb-6">Ask a Question</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={questionTitle}
                  onChange={(e) => setQuestionTitle(e.target.value)}
                  placeholder="What's your question?"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Details</label>
                <textarea
                  value={questionBody}
                  onChange={(e) => setQuestionBody(e.target.value)}
                  placeholder="Provide more context and details..."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="anonymous" className="text-gray-700">
                  Post anonymously
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAskForm(false)}
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAskQuestion}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Post Question
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Questions List */}
        {selectedQuestion === null ? (
          <div className="space-y-4">
            {questions.map((question) => (
              <div
                key={question.id}
                onClick={() => setSelectedQuestion(question.id)}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex gap-4">
                  {/* Vote Section */}
                  <div className="flex flex-col items-center gap-2 text-gray-500">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <span>{question.upvotes}</span>
                  </div>

                  {/* Question Content */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <h3 className="text-gray-900 flex-1">{question.title}</h3>
                      {question.hasAcceptedAnswer && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded-lg">
                          <Award className="w-4 h-4" />
                          <span>Solved</span>
                        </div>
                      )}
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-2">{question.body}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {question.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Meta Info */}
                    <div className="flex items-center gap-4 text-gray-500">
                      <span>{question.isAnonymous ? 'Anonymous' : question.author}</span>
                      <span>·</span>
                      <span>{question.date}</span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        {question.answers} answers
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {question.views} views
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Question Detail View */
          <div>
            <button
              onClick={() => setSelectedQuestion(null)}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Questions
            </button>

            <div className="bg-white rounded-xl p-8 shadow-sm mb-6">
              <h1 className="text-gray-900 mb-4">{questions[0].title}</h1>
              <p className="text-gray-600 mb-6">{questions[0].body}</p>

              <div className="flex flex-wrap gap-2 mb-6">
                {questions[0].tags.map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-4 text-gray-500 border-t pt-4">
                <span>Asked by {questions[0].author}</span>
                <span>·</span>
                <span>{questions[0].date}</span>
                <button className="flex items-center gap-1 ml-auto text-blue-600 hover:text-blue-700">
                  <TrendingUp className="w-4 h-4" />
                  <span>{questions[0].upvotes} Upvote</span>
                </button>
              </div>
            </div>

            {/* Answers */}
            <h2 className="text-gray-900 mb-4">{answers.length} Answers</h2>
            <div className="space-y-4">
              {answers.map((answer, index) => (
                <div
                  key={index}
                  className={`bg-white rounded-xl p-6 shadow-sm ${
                    answer.isBestAnswer ? 'border-2 border-green-500' : ''
                  }`}
                >
                  {answer.isBestAnswer && (
                    <div className="flex items-center gap-2 text-green-600 mb-4">
                      <Award className="w-5 h-5" />
                      <span>Best Answer</span>
                    </div>
                  )}

                  <p className="text-gray-600 mb-4 whitespace-pre-wrap font-mono bg-gray-50 p-4 rounded-lg overflow-x-auto">
                    {answer.body}
                  </p>

                  <div className="flex items-center gap-4 text-gray-500 border-t pt-4">
                    <span>{answer.isAnonymous ? 'Anonymous' : answer.author}</span>
                    <span>·</span>
                    <span>{answer.date}</span>
                    <button className="flex items-center gap-1 ml-auto text-blue-600 hover:text-blue-700">
                      <TrendingUp className="w-4 h-4" />
                      <span>{answer.upvotes} Upvote</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Answer Form */}
            <div className="bg-white rounded-xl p-6 shadow-sm mt-6">
              <h3 className="text-gray-900 mb-4">Your Answer</h3>
              <textarea
                placeholder="Write your answer..."
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-4"
              />
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                Post Answer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
