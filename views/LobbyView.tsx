import React, { useState, useEffect } from 'react';
import { Vehicle } from '../types';
import AIAssistant from '../components/AIAssistant';
import { getVehicles } from '../services/api';

interface LobbyViewProps {
  onStartControl: (id: string) => void;
}

const LobbyView: React.FC<LobbyViewProps> = ({ onStartControl }) => {
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 映射后端类型到中文显示
  const categoryMap: Record<string, string> = {
    'excavator': '挖掘机',
    'bulldozer': '推土机',
    'loader': '装载机',
    'crane': '起重机'
  };

  useEffect(() => {
    fetchVehicles();
  }, [selectedCategory]);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      let typeParam = '';
      if (selectedCategory !== '全部') {
        const key = Object.keys(categoryMap).find(k => categoryMap[k] === selectedCategory);
        if (key) typeParam = key;
      }

      const result = await getVehicles(typeParam || 'all');
      if (result.success && result.data) {
        setVehicles(result.data);
      } else {
        setError('加载车辆失败');
      }
    } catch (err) {
      setError('网络连接错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-transparent pb-32 text-text-main selection:bg-primary/30">
      <header className="sticky top-0 z-50 glass-panel px-4 py-4 flex items-center justify-between shadow-lg backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/30">
            <span className="material-symbols-outlined text-primary text-xl">sensors</span>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(34,197,94,0.6)]"></span>
          </div>
          <div>
            <h2 className="text-white font-bold tracking-tight text-sm leading-tight">远程操控中心</h2>
            <span className="text-[10px] text-sky-400 font-mono tracking-widest uppercase opacity-80 flex items-center gap-1">
              <span className="w-1 h-1 bg-sky-400 rounded-full"></span>
              LINK: 5G SECURE
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="h-9 w-9 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer">
            <span className="material-symbols-outlined text-sm">search</span>
          </button>
          <button className="h-9 w-9 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all relative cursor-pointer group">
            <div className="absolute inset-0 bg-accent/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="material-symbols-outlined text-sm relative z-10">notifications</span>
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-accent rounded-full z-10"></span>
          </button>
        </div>
      </header>

      {/* Cyber Grid Background fixed */}
      <div className="fixed inset-0 bg-cyber z-[-1] opacity-60 pointer-events-none"></div>

      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 tracking-wide">
            <span className="w-1 h-4 bg-primary rounded-full box-shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
            设备状态监控
            <span className="text-xs font-normal text-text-muted font-mono ml-1">[{vehicles.length}]</span>
          </h3>
        </div>

        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
          {['全部', '挖掘机', '推土机', '起重机'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded text-xs font-bold transition-all border whitespace-nowrap cursor-pointer ${selectedCategory === cat ? 'bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(59,130,246,0.2)]' : 'bg-black/40 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-primary/70 font-mono animate-pulse tracking-widest">建立连接中...</p>
        </div>
      ) : error ? (
        <div className="glass-card mx-4 p-6 rounded-xl flex flex-col items-center text-center">
          <span className="material-symbols-outlined text-red-500 text-3xl mb-2">signal_disconnected</span>
          <p className="text-red-400 text-sm mb-4">{error}</p>
          <button onClick={fetchVehicles} className="px-4 py-2 bg-white/10 rounded text-xs hover:bg-white/20 transition-colors border border-white/10 cursor-pointer">重试连接</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 px-4 mb-8">
          {vehicles.map((v) => (
            <div
              key={v.id}
              onClick={() => v.status === 'idle' && onStartControl(v.id.toString())}
              className={`glass-card rounded-lg overflow-hidden transition-all duration-300 group relative ${v.status === 'busy' ? 'opacity-60 grayscale-[0.5] cursor-not-allowed' : 'cursor-pointer hover:border-primary/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:-translate-y-1'}`}
            >
              <div className="relative aspect-[4/3] bg-black/50 overflow-hidden scanlines">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url("${v.image || 'https://via.placeholder.com/300'}")` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-background-dark/90 to-transparent opacity-80"></div>

                {/* Status Badge */}
                <div className={`absolute top-2 left-2 px-1.5 py-0.5 rounded backdrop-blur-md border text-[9px] font-bold tracking-widest uppercase flex items-center gap-1.5 shadow-lg
                    ${v.status === 'idle' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${v.status === 'idle' ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`}></span>
                  {v.status === 'idle' ? '在线' : '作业中'}
                </div>

                {/* Network Stats */}
                <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                  <div className="px-1.5 py-0.5 bg-black/80 rounded text-[8px] font-mono text-cyan-400 border border-cyan-500/20 backdrop-blur-sm">
                    {v.latency > 0 ? `${v.latency}ms` : 'LTE'}
                  </div>
                </div>

                {v.status !== 'idle' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
                    <span className="material-symbols-outlined text-white/50 text-3xl">lock</span>
                  </div>
                )}
              </div>

              <div className="p-3 relative bg-black/20 border-t border-white/5">
                <h4 className="font-bold text-sm text-white truncate mb-2 group-hover:text-primary transition-colors font-display tracking-wide">{v.name}</h4>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[8px] text-gray-500 font-mono uppercase">RATE</span>
                    <p className={`text-[10px] font-mono font-bold ${v.status === 'idle' ? 'text-secondary' : 'text-gray-600'}`}>
                      {v.status === 'idle' ? `¥${v.price.toFixed(2)}/min` : `---`}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[8px] text-gray-500 font-mono uppercase">RATING</span>
                    <div className="flex items-center gap-0.5">
                      <span className="text-[10px] font-bold text-gray-300 font-mono">{v.rating || 4.5}</span>
                      <span className="material-symbols-outlined !text-[10px] text-accent fill-icon">star</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AIAssistant context="lobby" />
    </div>
  );
};

export default LobbyView;
