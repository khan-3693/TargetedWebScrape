import { Copy, Check, Laugh, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { SocialMediaPost } from '../types/scrape';

interface SocialMediaPostsProps {
  posts: {
    comedic: SocialMediaPost[];
    serious: SocialMediaPost[];
  };
}

export function SocialMediaPosts({ posts }: SocialMediaPostsProps) {
  const [activeTab, setActiveTab] = useState<'comedic' | 'serious'>('comedic');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const currentPosts = activeTab === 'comedic' ? posts.comedic : posts.serious;

  return (
    <div className="space-y-6">
      <div className="flex gap-3 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('comedic')}
          className={`px-6 py-3 font-semibold transition-all relative ${
            activeTab === 'comedic'
              ? 'text-orange-600 border-b-3 border-orange-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Laugh className="w-5 h-5" />
            Comedic Posts
          </div>
          {activeTab === 'comedic' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('serious')}
          className={`px-6 py-3 font-semibold transition-all relative ${
            activeTab === 'serious'
              ? 'text-red-600 border-b-3 border-red-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Serious / Controversial Posts
          </div>
          {activeTab === 'serious' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600" />
          )}
        </button>
      </div>

      <div className="space-y-4">
        {currentPosts.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <p className="text-gray-500">No posts available</p>
          </div>
        ) : (
          currentPosts.map((post, index) => (
            <div
              key={post.id}
              className={`bg-gradient-to-br ${
                activeTab === 'comedic'
                  ? 'from-orange-50 to-yellow-50 border-orange-200'
                  : 'from-red-50 to-pink-50 border-red-200'
              } border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      activeTab === 'comedic'
                        ? 'bg-orange-600 text-white'
                        : 'bg-red-600 text-white'
                    }`}
                  >
                    Post {index + 1}
                  </span>
                  <span className="text-xs text-gray-500">
                    {activeTab === 'comedic' ? 'Current Best Comedian Style' : 'Serious Controversial Character Style'}
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(post.content, post.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                    copiedId === post.id
                      ? 'bg-green-600 text-white'
                      : activeTab === 'comedic'
                      ? 'bg-orange-600 text-white hover:bg-orange-700'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {copiedId === post.id ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <div className="bg-white rounded-lg p-5">
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
