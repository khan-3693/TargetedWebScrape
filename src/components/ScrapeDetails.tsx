import { X, ExternalLink, Calendar, Clock, History, TrendingUp, Sparkles, FileText, Link, Download } from 'lucide-react';
import { Scrape, AnalysisPoint } from '../types/scrape';
import { exportToTXT, exportToJSON, exportToDOC, exportToPDF } from '../utils/exportUtils';
import { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface ScrapeDetailsProps {
  scrape: Scrape;
  onClose: () => void;
}

export function ScrapeDetails({ scrape, onClose }: ScrapeDetailsProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const parseAnalysis = (analysisString: string | null): AnalysisPoint[] => {
    if (!analysisString) return [];
    try {
      const parsed = JSON.parse(analysisString);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  };

  const originPoints = parseAnalysis(scrape.origin_analysis);
  const trendsPoints = parseAnalysis(scrape.trends_analysis);

  useEffect(() => {
    if (scrape.status === 'completed') {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6']
      });
    }
  }, [scrape.status]);

  const handleExport = (format: 'txt' | 'doc' | 'pdf' | 'json') => {
    confetti({
      particleCount: 50,
      spread: 50,
      origin: { y: 0.7 },
      colors: ['#3b82f6', '#06b6d4']
    });

    switch (format) {
      case 'txt':
        exportToTXT(scrape, originPoints, trendsPoints);
        break;
      case 'doc':
        exportToDOC(scrape, originPoints, trendsPoints);
        break;
      case 'pdf':
        exportToPDF(scrape, originPoints, trendsPoints);
        break;
      case 'json':
        exportToJSON(scrape, originPoints, trendsPoints);
        break;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col transform animate-scale-in">
        <div className="px-8 py-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600">
          <div className="flex-1 min-w-0 mr-4">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-extrabold text-white truncate">
                {scrape.title || 'Untitled'}
              </h2>
              {scrape.keyword && (
                <span className="bg-white text-blue-600 px-4 py-1 rounded-full text-sm font-bold flex-shrink-0 shadow-lg">
                  {scrape.keyword}
                </span>
              )}
            </div>
            <a
              href={scrape.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-white hover:text-blue-100 flex items-center gap-2 font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="truncate">{scrape.url}</span>
            </a>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-white/20 rounded-xl transition-all duration-300 flex-shrink-0 transform hover:scale-110"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto flex-1 bg-gradient-to-br from-gray-50 to-blue-50">
          {scrape.error && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 rounded-2xl p-6 mb-6 shadow-lg animate-shake">
              <h3 className="text-sm font-bold text-red-900 mb-2">Error Occurred</h3>
              <p className="text-sm font-semibold text-red-700">{scrape.error}</p>
            </div>
          )}

          {scrape.status === 'pending' && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-2xl p-12 text-center shadow-xl">
              <Sparkles className="w-16 h-16 text-yellow-600 mx-auto mb-6 animate-spin" />
              <h3 className="text-2xl font-bold text-yellow-900 mb-3">Analysis in Progress</h3>
              <p className="text-base font-semibold text-yellow-700">AI is researching and generating insights...</p>
            </div>
          )}

          {scrape.status === 'completed' && (
            <div className="space-y-8">
              {scrape.url_summary && (
                <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl p-1 shadow-2xl transform hover:scale-[1.02] transition-all duration-300">
                  <div className="bg-white rounded-2xl p-6">
                    <div className="flex items-center gap-4 mb-5">
                      <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                        <FileText className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">Source Summary</h3>
                        <p className="text-sm text-gray-600 font-semibold">What the input URL is conveying</p>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                      <p className="text-gray-800 leading-relaxed whitespace-pre-wrap font-medium">
                        {scrape.url_summary}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-1 shadow-2xl transform hover:scale-[1.02] transition-all duration-300">
                <div className="bg-white rounded-2xl p-6">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
                      <History className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-extrabold bg-gradient-to-r from-amber-600 to-orange-700 bg-clip-text text-transparent">Verified Origin / Moment of Truth</h3>
                      <p className="text-sm text-gray-600 font-semibold">Historical analysis and earliest mentions</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {originPoints.length > 0 ? (
                      originPoints.map((item, index) => (
                        <div key={index} className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-5 border border-amber-200">
                          <p className="text-gray-800 leading-relaxed mb-3 font-medium">{item.point}</p>
                          {item.references && item.references.length > 0 && (
                            <div className="border-t border-gray-200 pt-3 mt-3">
                              <div className="flex items-center gap-2 mb-2">
                                <Link className="w-4 h-4 text-amber-600" />
                                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                  Reference Sources
                                </span>
                              </div>
                              <div className="space-y-2">
                                {item.references.map((ref, refIndex) => (
                                  <a
                                    key={refIndex}
                                    href={ref.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-start gap-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded transition-colors"
                                  >
                                    <ExternalLink className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                    <span className="break-words">{ref.title || ref.url}</span>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-5 text-gray-800 leading-relaxed whitespace-pre-wrap font-medium">
                        {scrape.origin_analysis || 'No origin analysis available'}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl p-1 shadow-2xl transform hover:scale-[1.02] transition-all duration-300">
                <div className="bg-white rounded-2xl p-6">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg">
                      <TrendingUp className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-cyan-700 bg-clip-text text-transparent">Latest Updates & Future Forecast</h3>
                      <p className="text-sm text-gray-600 font-semibold">Current trends and future predictions</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {trendsPoints.length > 0 ? (
                      trendsPoints.map((item, index) => (
                        <div key={index} className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-5 border border-blue-200">
                          <p className="text-gray-800 leading-relaxed mb-3 font-medium">{item.point}</p>
                          {item.references && item.references.length > 0 && (
                            <div className="border-t border-gray-200 pt-3 mt-3">
                              <div className="flex items-center gap-2 mb-2">
                                <Link className="w-4 h-4 text-blue-600" />
                                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                  Reference Sources
                                </span>
                              </div>
                              <div className="space-y-2">
                                {item.references.map((ref, refIndex) => (
                                  <a
                                    key={refIndex}
                                    href={ref.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-start gap-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded transition-colors"
                                  >
                                    <ExternalLink className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                    <span className="break-words">{ref.title || ref.url}</span>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-5 text-gray-800 leading-relaxed whitespace-pre-wrap font-medium">
                        {scrape.trends_analysis || 'No trends analysis available'}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl p-6 shadow-lg">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl p-4 shadow-md">
                    <div className="flex items-center gap-2 text-gray-700 mb-2">
                      <Calendar className="w-5 h-5" />
                      <span className="text-sm font-bold">Created</span>
                    </div>
                    <p className="text-base font-semibold text-gray-900">{formatDate(scrape.created_at)}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-md">
                    <div className="flex items-center gap-2 text-gray-700 mb-2">
                      <Clock className="w-5 h-5" />
                      <span className="text-sm font-bold">Completed</span>
                    </div>
                    <p className="text-base font-semibold text-gray-900">
                      {scrape.completed_at ? formatDate(scrape.completed_at) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-8 py-6 border-t border-gray-200 bg-gradient-to-r from-gray-100 to-gray-200">
          {scrape.status === 'completed' && (
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-4">
                <Download className="w-6 h-6 text-gray-800" />
                <span className="text-base font-bold text-gray-800">Export Analysis</span>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <button
                  onClick={() => handleExport('txt')}
                  className="flex items-center justify-center gap-2 bg-white border-2 border-gray-400 text-gray-800 font-bold py-3 px-4 rounded-xl hover:bg-gray-100 hover:border-gray-600 hover:shadow-lg transition-all transform hover:scale-105"
                >
                  <FileText className="w-5 h-5" />
                  <span className="text-sm">.TXT</span>
                </button>
                <button
                  onClick={() => handleExport('doc')}
                  className="flex items-center justify-center gap-2 bg-white border-2 border-blue-400 text-blue-700 font-bold py-3 px-4 rounded-xl hover:bg-blue-100 hover:border-blue-600 hover:shadow-lg transition-all transform hover:scale-105"
                >
                  <FileText className="w-5 h-5" />
                  <span className="text-sm">.DOC</span>
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="flex items-center justify-center gap-2 bg-white border-2 border-red-400 text-red-700 font-bold py-3 px-4 rounded-xl hover:bg-red-100 hover:border-red-600 hover:shadow-lg transition-all transform hover:scale-105"
                >
                  <FileText className="w-5 h-5" />
                  <span className="text-sm">.PDF</span>
                </button>
                <button
                  onClick={() => handleExport('json')}
                  className="flex items-center justify-center gap-2 bg-white border-2 border-green-400 text-green-700 font-bold py-3 px-4 rounded-xl hover:bg-green-100 hover:border-green-600 hover:shadow-lg transition-all transform hover:scale-105"
                >
                  <FileText className="w-5 h-5" />
                  <span className="text-sm">.JSON</span>
                </button>
              </div>
            </div>
          )}
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 text-white font-bold py-4 px-6 rounded-xl hover:from-blue-700 hover:via-cyan-700 hover:to-blue-800 shadow-lg hover:shadow-2xl transition-all transform hover:scale-105"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
