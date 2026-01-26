import React, { useState } from 'react';
import { login, register } from '../services/api';

interface LoginViewProps {
  onLogin: (userData: any) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!username || !password) {
      setError('请输入用户名和密码');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = isRegister
        ? await register(username, password)
        : await login(username, password);

      if (result.success && result.data) {
        onLogin(result.data);
      } else {
        setError(result.message || (isRegister ? '注册失败' : '登录失败'));
      }
    } catch (err) {
      setError('网络连接错误，请检查后端服务');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-background-dark font-display text-text-main selection:bg-primary/30">
      {/* Dynamic Cyber Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-cyber opacity-40 animate-pulse-soft"></div>
        <div
          className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-30"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop')` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-background-dark"></div>
      </div>

      <div className="relative z-10 flex flex-col flex-1 justify-center px-6 max-w-md mx-auto w-full">
        {/* Main Card with HUD Corners */}
        <div className="glass-card rounded-xl p-8 shadow-2xl backdrop-blur-xl relative group transition-all duration-500 hover:shadow-[0_0_40px_rgba(59,130,246,0.15)]">
          {/* HUD Corners */}
          <div className="hud-corner hud-tl"></div>
          <div className="hud-corner hud-tr"></div>
          <div className="hud-corner hud-bl"></div>
          <div className="hud-corner hud-br"></div>

          <div className="flex flex-col items-center mb-8 relative z-10">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse-soft"></div>
              <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/30">
                <span className="material-symbols-outlined !text-5xl text-primary glow-text">hub</span>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-white tracking-widest uppercase glow-text text-center">
              {isRegister ? '账号注册' : '系统接入'}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
              <p className="text-secondary/80 text-xs font-mono tracking-widest uppercase">
                {isRegister ? 'NEW OPERATOR REGISTRATION' : 'REMOTE OPERATIONS V2.5'}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6 relative z-10">
            {/* Custom Input Field */}
            <div className="group/input">
              <div className="flex items-center justify-between mb-2 px-1">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-1">
                  <span className="w-1 h-3 bg-primary/50 rounded-sm"></span>
                  用户名 (USERNAME)
                </label>
              </div>
              <div className="relative flex items-center transition-all glow-border focus-within:ring-1 focus-within:ring-primary/50 rounded bg-black/40 border border-white/10 group-hover/input:border-primary/30">
                <div className="pl-4 text-gray-500 group-focus-within/input:text-primary transition-colors">
                  <span className="material-symbols-outlined !text-xl">person</span>
                </div>
                <div className="h-8 w-px bg-white/10 mx-3"></div>
                <input
                  className="w-full bg-transparent border-none text-white focus:ring-0 py-3.5 pr-4 placeholder:text-gray-700 text-sm font-mono tracking-wide"
                  placeholder="请输入用户名..."
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="group/input">
              <div className="flex items-center justify-between mb-2 px-1">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-1">
                  <span className="w-1 h-3 bg-primary/50 rounded-sm"></span>
                  密码 (ACCESS CODE)
                </label>
              </div>
              <div className="relative flex items-center transition-all glow-border focus-within:ring-1 focus-within:ring-primary/50 rounded bg-black/40 border border-white/10 group-hover/input:border-primary/30">
                <div className="pl-4 text-gray-500 group-focus-within/input:text-primary transition-colors">
                  <span className="material-symbols-outlined !text-xl">key</span>
                </div>
                <div className="h-8 w-px bg-white/10 mx-3"></div>
                <input
                  className="w-full bg-transparent border-none text-white focus:ring-0 py-3.5 pr-4 placeholder:text-gray-700 text-sm font-mono tracking-wide"
                  placeholder="请输入密码..."
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded p-3 flex items-center gap-3 animate-pulse-soft">
                <span className="material-symbols-outlined text-red-500 !text-lg">warning</span>
                <p className="text-red-400 text-xs font-mono">{error}</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`mt-2 relative group overflow-hidden w-full h-12 rounded bg-primary text-white font-bold tracking-widest text-sm transition-all shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5 active:translate-y-0'}`}
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <span className="animate-spin material-symbols-outlined">sync</span>
                ) : (
                  <>
                    <span className="material-symbols-outlined !text-lg">login</span>
                    {isRegister ? '立即注册' : '身份验证'}
                  </>
                )}
              </span>
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center gap-4 relative z-10">
            <button
              onClick={() => { setIsRegister(!isRegister); setError(''); }}
              className="text-text-muted text-xs hover:text-primary transition-colors flex items-center gap-1 group cursor-pointer"
            >
              {isRegister ? '已有账号？' : '需要新的操作权限？'}
              <span className="text-secondary group-hover:underline underline-offset-4 decoration-secondary/50 font-bold">
                {isRegister ? '返回登录' : '申请注册'}
              </span>
            </button>

            <div className="bg-black/40 border border-white/5 rounded px-4 py-2 flex items-center gap-2 cursor-help">
              <span className="text-[10px] text-gray-500 font-mono">DEBUG_KEY:</span>
              <span className="text-[10px] text-sky-400 font-mono bg-sky-500/10 px-1 rounded">demo</span>
              <span className="text-[10px] text-gray-500 font-mono">/</span>
              <span className="text-[10px] text-sky-400 font-mono bg-sky-500/10 px-1 rounded">123456</span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center items-center gap-2 opacity-30">
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-primary"></span>
          <p className="text-[10px] font-mono text-primary tracking-[0.2em] uppercase">SECURE LINK ESTABLISHED</p>
          <span className="h-px w-8 bg-gradient-to-l from-transparent to-primary"></span>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
