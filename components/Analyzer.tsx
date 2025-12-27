
import React, { useState, useRef } from 'react';
import { analyzePlantImage, generatePlantSilhouette } from '../services/geminiService';
import { AnalysisResponse } from '../types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const Analyzer: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [silhouette, setSilhouette] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'original' | 'silhouette'>('original');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
        setSilhouette(null);
        setViewMode('original');
      };
      reader.readAsDataURL(file);
    }
  };

  const startAnalysis = async () => {
    if (!image) return;
    setAnalyzing(true);
    setViewMode('original');
    
    try {
      // Execute both requests in parallel
      const [analysisData, silhouetteData] = await Promise.all([
        analyzePlantImage(image),
        generatePlantSilhouette(image)
      ]);
      
      setResult(analysisData);
      setSilhouette(silhouetteData);
      if (silhouetteData) {
        setViewMode('silhouette');
      }
    } catch (error) {
      console.error("Analysis failed", error);
      alert("分析失败。请检查 API 密钥或网络连接。");
    } finally {
      setAnalyzing(false);
    }
  };

  const chartData = result ? [
    { subject: '高度', A: Math.min(result.metrics.heightCm, 100), fullMark: 100 },
    { subject: '冠幅', A: Math.min(result.metrics.canopyWidthCm, 100), fullMark: 100 },
    { subject: 'LAI', A: Math.min(result.metrics.leafAreaIndex * 20, 100), fullMark: 100 },
    { subject: '健康', A: result.metrics.healthScore, fullMark: 100 },
  ] : [];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">生长剪影提取</h2>
            <p className="text-slate-500 leading-relaxed">
              上传清晰的植物照片。我们的AI将提取生长剪影、测量株高并即时评估健康状态。
            </p>
            
            <div className="flex justify-between items-center mb-2">
               {silhouette && (
                 <div className="flex bg-slate-100 p-1 rounded-lg">
                   <button 
                     onClick={() => setViewMode('original')}
                     className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'original' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                   >
                     原图
                   </button>
                   <button 
                     onClick={() => setViewMode('silhouette')}
                     className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'silhouette' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                   >
                     AI 剪影
                   </button>
                 </div>
               )}
            </div>

            <div 
              className={`relative border-2 border-dashed rounded-2xl h-[400px] flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${
                image ? 'border-emerald-500 bg-slate-50' : 'border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/30'
              }`}
              onClick={() => !analyzing && fileInputRef.current?.click()}
            >
              {image ? (
                <div className="relative w-full h-full group">
                  <img 
                    src={viewMode === 'silhouette' && silhouette ? silhouette : image} 
                    alt="Plant" 
                    className="w-full h-full object-contain transition-opacity duration-300" 
                  />
                  {!analyzing && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <p className="text-white font-medium">点击更换照片</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <p className="text-slate-600 font-semibold text-lg">上传植物照片</p>
                  <p className="text-slate-400 text-sm mt-1">支持 JPG, PNG 格式，最大 10MB</p>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageUpload}
                disabled={analyzing}
              />
            </div>

            <button
              onClick={startAnalysis}
              disabled={!image || analyzing}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${
                !image || analyzing 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98]'
              }`}
            >
              {analyzing ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  正在提取剪影 & 分析数据...
                </div>
              ) : '开始提取剪影数据'}
            </button>
          </div>

          <div className="w-full md:w-[350px] shrink-0">
            {result ? (
              <div className="bg-slate-50 p-6 rounded-2xl h-full space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">检测到植物</h3>
                  <p className="text-2xl font-bold text-emerald-700">{result.plantName}</p>
                </div>

                {/* Radar Chart */}
                <div className="h-48 w-full -ml-4">
                   <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="Plant" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.5} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <p className="text-xs text-slate-500">高度</p>
                    <p className="text-lg font-bold text-slate-800">{result.metrics.heightCm} cm</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <p className="text-xs text-slate-500">冠幅</p>
                    <p className="text-lg font-bold text-slate-800">{result.metrics.canopyWidthCm} cm</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <p className="text-xs text-slate-500">LAI 指数</p>
                    <p className="text-lg font-bold text-slate-800">{result.metrics.leafAreaIndex}</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <p className="text-xs text-slate-500">生长阶段</p>
                    <p className="text-sm font-bold text-slate-800">{result.metrics.growthStage}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">健康评分</h3>
                  <div className="relative w-full h-4 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`absolute left-0 top-0 h-full transition-all duration-1000 ${
                        result.metrics.healthScore > 80 ? 'bg-emerald-500' : result.metrics.healthScore > 50 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${result.metrics.healthScore}%` }}
                    ></div>
                  </div>
                  <p className="text-right text-xs font-bold text-slate-600 mt-1">{result.metrics.healthScore}% - 生长良好</p>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">AI 洞察建议</h3>
                  <div className="space-y-2">
                    {result.recommendations.map((rec, i) => (
                      <div key={i} className="flex gap-2 text-sm text-slate-700 items-start">
                        <span className="text-emerald-500 mt-1">✓</span>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <p className="text-4xl mb-4">🧪</p>
                <p className="font-medium">进行分析以查看详细的生长剪影指标。</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 italic">S</span>
              剪影形态学描述
            </h3>
            <p className="text-slate-600 leading-relaxed italic">
              "{result.silhouetteDescription}"
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-red-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              检测到的异常
            </h3>
            <div className="space-y-2">
              {result.metrics.detectedAnomalies.length > 0 ? (
                result.metrics.detectedAnomalies.map((ano, i) => (
                  <p key={i} className="text-sm bg-red-50 text-red-700 p-2 rounded-lg border border-red-100">{ano}</p>
                ))
              ) : (
                <p className="text-sm text-emerald-600 bg-emerald-50 p-2 rounded-lg border border-emerald-100">未检测到重大异常。生长状态健康！</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analyzer;
