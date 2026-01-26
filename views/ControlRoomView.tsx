import React, { useState, useEffect, useRef, useCallback } from 'react';
import AIAssistant from '../components/AIAssistant';

// 配置项 (实际项目中应从环境变量或 API 获取)
const CONFIG = {
  // WebRTC 流地址 (使用 go2rtc 或 SRS 等网关提供的 WHEP/WebRTC 地址)
  // 示例: http://localhost:1984/api/webrtc?src=camera1
  STREAM_URL: 'http://localhost:1984/api/webrtc?src=camera1',
  // 控制指令 WebSocket 地址
  CONTROL_WS: 'ws://localhost:8080/ws/control',
  // 遥测数据 WebSocket 地址 (通常可以和控制合并)
  TELEM_WS: 'ws://localhost:8080/ws/telemetry'
};

interface ControlRoomViewProps {
  onExit: () => void;
}

const ControlRoomView: React.FC<ControlRoomViewProps> = ({ onExit }) => {
  const [viewMode, setViewMode] = useState<'fpv' | 'tpv'>('tpv');
  const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);
  const [rpm, setRpm] = useState(0);
  const [latency, setLatency] = useState(0); // 往返延迟 RTT
  const [connectionState, setConnectionState] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [cameraState, setCameraState] = useState<'loading' | 'live' | 'error'>('loading');
  const [showAlert, setShowAlert] = useState(false);

  // Refs needed for WebRTC and WebSocket
  const videoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Haptic Feedback Helper
  const triggerHaptic = (pattern: number | number[] = 10) => {
    if (navigator.vibrate) navigator.vibrate(pattern);
  };

  // --- WebRTC Logic (简化的播放器实现) ---
  const startWebRTC = useCallback(async () => {
    setCameraState('loading');
    try {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      pcRef.current = pc;

      // 添加收发器 (即只接收视频)
      pc.addTransceiver('video', { direction: 'recvonly' });
      // pc.addTransceiver('audio', { direction: 'recvonly' }); // 假如需要音频

      pc.ontrack = (event) => {
        if (videoRef.current) {
          videoRef.current.srcObject = event.streams[0];
          setCameraState('live');
        }
      };

      // 1. 创建 Offer (或根据服务器协议，这里假设 WHIP/WHEP 风格的交换)
      // 注意：真实对接需要根据 go2rtc/SRS 的具体 API 调整
      // 这里模拟一个标准的 SDP 交换流程
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // 2. 发送 Offer 到信令服务器 (这里只是模拟请求)
      // 实际代码需解开注释并对接真实 API
      /*
      const response = await fetch(CONFIG.STREAM_URL, {
        method: 'POST',
        body: pc.localDescription?.sdp
      });
      const answerSdp = await response.text();
      await pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: answerSdp }));
      */

      // MOCK: 模拟视频成功 (为了演示效果，实际没有流会黑屏，所以先保留 Mock 背景)
      // 真实上线时移除下面的 Mock 视频源
      setTimeout(() => setCameraState('live'), 1000);

    } catch (err) {
      console.error('WebRTC Error:', err);
      setCameraState('error');
    }
  }, []);

  // --- WebSocket Logic (控制指令) ---
  const connectWebSocket = useCallback(() => {
    setConnectionState('connecting');
    // MOCK: 模拟 WS 连接
    setTimeout(() => {
      setConnectionState('connected');
      triggerHaptic([50, 50, 50]); // Success vibration
    }, 500);

    /* 真实代码:
    const ws = new WebSocket(CONFIG.CONTROL_WS);
    ws.onopen = () => setConnectionState('connected');
    ws.onclose = () => setConnectionState('disconnected');
    ws.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        if (data.t === 'telem') {
            setRpm(data.rpm);
            setLatency(Date.now() - data.ts); // 简易计算延迟
        }
    };
    wsRef.current = ws;
    */
  }, []);

  // 发送指令 (Action)
  const sendCommand = (cmd: string, value: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ t: 'cmd', c: cmd, v: value, ts: Date.now() }));
    }
    console.log('CMD Sent:', cmd, value); // Debug log
    // 震动反馈
    if (value === 'start' || value === 'up' || value === 'down') triggerHaptic(20);
  };

  useEffect(() => {
    const handleResize = () => setIsPortrait(window.innerHeight > window.innerWidth);
    window.addEventListener('resize', handleResize);

    startWebRTC();
    connectWebSocket();

    // MOCK: 模拟遥测数据
    const interval = setInterval(() => {
      setRpm(prev => 2100 + Math.floor(Math.random() * 50));
      setLatency(30 + Math.floor(Math.random() * 20)); // ms
      if (Math.random() > 0.98) { setShowAlert(true); triggerHaptic([100, 50, 100]); }
      else if (Math.random() > 0.8) setShowAlert(false);
    }, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(interval);
      pcRef.current?.close();
      wsRef.current?.close();
    };
  }, [startWebRTC, connectWebSocket]);

  if (isPortrait) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background-dark font-display text-text-main">
        <div className="glass-card text-center p-8 max-w-xs rounded-2xl border border-primary/20 shadow-[0_0_50px_rgba(59,130,246,0.2)]">
          <div className="relative inline-block mb-6">
            <span className="material-symbols-outlined text-7xl text-primary animate-pulse-soft">screen_rotation</span>
          </div>
          <h2 className="text-xl font-bold mb-2">请旋转您的设备</h2>
          <p className="text-text-muted text-sm">驾驶舱需要横屏模式以开启最高操作权限。</p>
          <button onClick={onExit} className="mt-8 px-6 py-2 border border-white/20 rounded-full text-xs font-bold uppercase hover:bg-white/10 transition-colors">返回大厅</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-50 bg-black text-text-main select-none overflow-hidden h-screen w-screen transition-all duration-500 font-display touch-none ${showAlert ? 'shadow-[inset_0_0_100px_rgba(239,68,68,0.3)]' : ''}`}>

      {/* ⚠️ 真实 WebRTC 视频层 */}
      {/* 这是一个真实的 video 标签，用于绑定 srcObject */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-500 ${cameraState === 'live' ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* MOCK: 虽然写了 WebRTC 逻辑，但为了没流的时候不黑屏，保留这个 MOCK 背景作为 Fallback */}
      {cameraState !== 'live_real' && (
        <div className="absolute inset-0 z-0 scanlines pointer-events-none">
          <div
            className="w-full h-full bg-cover bg-center transition-all duration-700"
            style={{
              backgroundImage: `url(${viewMode === 'fpv' ? 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop' : 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=2070&auto=format&fit=crop'})`,
              filter: 'brightness(0.6) contrast(1.2) saturate(1.1)'
            }}
          />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/80 pointer-events-none z-0"></div>

      {/* Cyber Overlay Grid */}
      <div className="absolute inset-0 z-0 bg-cyber opacity-20 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col h-full w-full justify-between p-4 pb-2 md:p-6 select-none">
        {/* Top UI */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-2">
            <div className="glass-panel px-4 py-2 rounded-xl flex items-center gap-4 shadow-2xl relative overflow-hidden group">
              {/* HUD Corner accent */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary/50"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary/50"></div>

              <button onTouchEnd={onExit} className="material-symbols-outlined text-white active:text-primary transition-colors z-10 relative text-3xl cursor-pointer">arrow_back</button>
              <div className="flex flex-col relative z-10">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${connectionState === 'connected' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-red-500 animate-ping'}`}></div>
                  <span className="text-white text-[10px] font-black tracking-widest uppercase glow-text">{connectionState === 'connected' ? '链路正常' : '连接中断'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-primary/60 text-[8px] font-mono tracking-wider">ID: OP-8824-X</span>
                  <span className={`text-[8px] font-mono px-1 rounded ${latency < 100 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    PING: {latency}ms
                  </span>
                </div>
              </div>
            </div>
            {showAlert && (
              <div className="bg-red-500/80 backdrop-blur-md px-3 py-1 rounded border border-red-500/50 text-white text-[10px] font-black uppercase tracking-tighter animate-pulse shadow-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-[14px]">warning</span>
                检测到障碍物 • 请减速
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="glass-panel p-1 rounded-full flex relative">
              <button onTouchEnd={() => { setViewMode('fpv'); triggerHaptic(); }} className={`relative z-10 px-5 py-2 rounded-full text-[10px] font-black uppercase transition-all ${viewMode === 'fpv' ? 'bg-primary text-black shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'text-white/40 active:text-white'}`}>第一视角</button>
              <button onTouchEnd={() => { setViewMode('tpv'); triggerHaptic(); }} className={`relative z-10 px-5 py-2 rounded-full text-[10px] font-black uppercase transition-all ${viewMode === 'tpv' ? 'bg-primary text-black shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'text-white/40 active:text-white'}`}>第三视角</button>
            </div>
          </div>
        </div>

        {/* Center Reticle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-80">
          <div className="w-64 h-64 border-[0.5px] border-primary/30 rounded-full flex items-center justify-center relative">
            <div className="absolute inset-0 border-[0.5px] border-white/5 rounded-full scale-110 border-dashed animate-[spin_10s_linear_infinite]"></div>
            <div className={`w-16 h-16 border border-primary/50 rounded flex items-center justify-center relative transition-all duration-100 ${latency > 200 ? 'border-red-500 scale-90' : ''}`}>
              <div className="absolute top-0 left-0 w-1 h-1 bg-primary box-shadow-glow"></div>
              <div className="absolute top-0 right-0 w-1 h-1 bg-primary box-shadow-glow"></div>
              <div className="absolute bottom-0 left-0 w-1 h-1 bg-primary box-shadow-glow"></div>
              <div className="absolute bottom-0 right-0 w-1 h-1 bg-primary box-shadow-glow"></div>
              <div className="w-1 h-1 bg-red-500 rounded-full shadow-[0_0_10px_#ef4444]"></div>
            </div>
            {/* Compass Scale */}
            <div className="absolute -bottom-10 flex gap-6 text-[10px] font-mono text-primary/70">
              <span>240°</span><span className="text-white font-bold glow-text">255°</span><span>270°</span>
            </div>
          </div>
        </div>

        {/* Lower Controls (Optimized for Touch) */}
        <div className="flex items-end justify-between px-2 pb-2">
          {/* 左摇杆: 行走 */}
          <div
            onTouchStart={(e) => { e.preventDefault(); sendCommand('move', 'start'); }}
            onTouchEnd={(e) => { e.preventDefault(); sendCommand('move', 'stop'); }}
            // 保留 Mouse 事件方便 PC 调试
            onMouseDown={() => sendCommand('move', 'start')}
            onMouseUp={() => sendCommand('move', 'stop')}
            className="w-32 h-32 glass-panel rounded-full border border-white/10 flex items-center justify-center relative shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] active:border-primary/50 active:bg-primary/10 transition-all cursor-pointer"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-white/20 to-transparent rounded-full border border-white/20 shadow-lg pointer-events-none"></div>
            <span className="absolute -bottom-6 text-primary/50 text-[10px] font-black uppercase tracking-[0.2em] font-mono pointer-events-none">行走 (HOLD)</span>
          </div>

          <div className="flex-1 max-w-sm px-4 pb-2">
            <div className="glass-panel rounded-t-xl rounded-b-sm p-4 border-t border-l border-r border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[2px] bg-primary/50 shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>

              <div className="grid grid-cols-2 gap-4 items-center">
                <div className="text-center">
                  <p className="text-3xl font-black text-white font-mono glow-text">{Math.floor(rpm)}</p>
                  <p className="text-[8px] text-primary font-bold uppercase tracking-widest mt-1">引擎转速 RPM</p>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[8px] font-black uppercase font-mono">
                    <span className="text-gray-400">液压压力</span>
                    <span className="text-secondary">82%</span>
                  </div>
                  <div className="h-2 bg-black/50 rounded-full overflow-hidden border border-white/10">
                    <div className="h-full bg-secondary shadow-[0_0_10px_rgba(6,182,212,0.8)]" style={{ width: '82%' }}></div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-center gap-6">
                <button onTouchEnd={() => { sendCommand('light', 'toggle'); triggerHaptic(); }} onClick={() => sendCommand('light', 'toggle')} className="p-3 bg-black/40 rounded-lg border border-white/10 active:border-primary/50 active:bg-primary/20 hover:border-white/30 transition-all cursor-pointer">
                  <span className="material-symbols-outlined text-gray-400 text-2xl">flashlight_on</span>
                </button>
                <button onTouchEnd={() => { sendCommand('capture', 'now'); triggerHaptic(); }} onClick={() => sendCommand('capture', 'now')} className="p-3 bg-black/40 rounded-lg border border-white/10 active:border-primary/50 active:bg-primary/20 hover:border-white/30 transition-all cursor-pointer">
                  <span className="material-symbols-outlined text-gray-400 text-2xl">photo_camera</span>
                </button>
                <button onTouchEnd={() => { sendCommand('emergency', 'stop'); triggerHaptic([50, 100, 50]); }} onClick={() => sendCommand('emergency', 'stop')} className="p-3 bg-red-500/10 rounded-lg border border-red-500/20 text-red-500 active:bg-red-500 active:text-white active:scale-95 hover:bg-red-500/20 transition-all cursor-pointer">
                  <span className="material-symbols-outlined text-2xl">power_settings_new</span>
                </button>
              </div>
            </div>
          </div>

          {/* 右摇杆: 动臂 */}
          <div
            onTouchStart={(e) => { e.preventDefault(); sendCommand('bucket', 'up'); }}
            onTouchEnd={(e) => { e.preventDefault(); sendCommand('bucket', 'stop'); }}
            onMouseDown={() => sendCommand('bucket', 'up')}
            onMouseUp={() => sendCommand('bucket', 'stop')}
            className="w-32 h-32 glass-panel rounded-full border border-white/10 flex items-center justify-center relative shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] active:border-primary/50 active:bg-primary/10 transition-all cursor-pointer"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-white/20 to-transparent rounded-full border border-white/20 shadow-lg pointer-events-none"></div>
            <span className="absolute -bottom-6 text-primary/50 text-[10px] font-black uppercase tracking-[0.2em] font-mono pointer-events-none">动臂 (HOLD)</span>
          </div>
        </div>
      </div>

      <AIAssistant context="control-room" />
    </div>
  );
};

export default ControlRoomView;
