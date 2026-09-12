import React, { useState } from "react";
import { 
  AlertTriangle, 
  Bell, 
  Settings, 
  User, 
  Wifi, 
  Plug, 
  Map as MapIcon, 
  HardHat, 
  Monitor, 
  LogOut,
  Activity,
  Radio,
  MapPin,
  Volume2,
  Zap,
  Gauge
} from "lucide-react";
import { Employee, SystemStats, RecentActivity, UserProfile } from "../types";
import { motion, AnimatePresence } from "motion/react";
import ProfileModal from "./ProfileModal";

interface DashboardProps {
  username: string;
  employees: Employee[];
  stats: SystemStats;
  activities: RecentActivity[];
  currentUser: UserProfile;
  onNavigateToMap: () => void;
  onLogout: () => void;
  onUpdateUser: (updated: UserProfile) => Promise<boolean>;
}

export default function Dashboard({ 
  username, 
  employees, 
  stats, 
  activities, 
  currentUser, 
  onNavigateToMap, 
  onLogout,
  onUpdateUser 
}: DashboardProps) {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Capacete conectado principal (EMP001 vinculado ao ESP32)
  const connectedHelmet = employees.find(e => e.id === "EMP001" && e.status !== "OFFLINE") || employees.find(e => e.status !== "OFFLINE") || null;
  const telemetry = connectedHelmet?.telemetry;

  const formatDate = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    };
    return now.toLocaleDateString('pt-BR', options).toUpperCase();
  };

  const isEmergency = stats.systemStatus === "EMERGENCY" || stats.emergenciesToday > 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans">
      {/* Header */}
      <header className="h-16 px-6 flex items-center justify-between border-b border-white/5 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-yellow-500" />
          <span className="text-lg font-bold tracking-tight">Safety Monitor</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="relative cursor-pointer">
            <Bell className="w-5 h-5 text-zinc-400" />
            {stats.emergenciesToday > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-[10px] flex items-center justify-center rounded-full font-bold animate-pulse">
                {stats.emergenciesToday}
              </span>
            )}
          </div>
          <Settings className="w-5 h-5 text-zinc-400 cursor-pointer" />
          
          <div className="relative">
            <div 
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <User className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />
              <div className="w-8 h-8 rounded-full border-2 border-yellow-500/50 flex items-center justify-center bg-zinc-900 text-yellow-500 font-bold text-sm group-hover:border-yellow-500 transition-all">
                {(currentUser.firstName || username).charAt(0).toUpperCase()}
              </div>
            </div>

            <AnimatePresence>
              {showDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowDropdown(false)} 
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden"
                  >
                    <div className="p-3 border-b border-white/5">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Usuário Conectado</p>
                      <p className="text-sm font-bold text-white truncate">{currentUser.firstName} {currentUser.lastName}</p>
                      <p className="text-xs text-zinc-400 font-mono">@{currentUser.username}</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        setShowProfileModal(true);
                      }}
                      className="w-full flex items-center gap-3 p-3 text-sm text-yellow-400 hover:bg-yellow-500/10 transition-colors text-left"
                    >
                      <User className="w-4 h-4" />
                      <span className="font-bold uppercase tracking-widest text-[10px]">Ver Meu Perfil</span>
                    </button>
                    <button
                      onClick={onLogout}
                      className="w-full flex items-center gap-3 p-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left border-t border-white/5"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="font-bold uppercase tracking-widest text-[10px]">Desconectar</span>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Welcome Section with Background */}
        <div className="relative h-[280px] flex flex-col justify-end p-8 overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: `url('https://images.unsplash.com/photo-1516937941344-00b4e0337589?q=80&w=2070&auto=format&fit=crop')`,
              filter: 'brightness(0.35)'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
          
          <div className="relative z-10 flex justify-between items-end">
            <div>
              <p className="text-zinc-400 text-sm font-medium uppercase tracking-widest mb-1">Bem-vindo,</p>
              <h1 className="text-5xl font-bold text-yellow-500 mb-2">{currentUser.firstName ? `${currentUser.firstName} (${username})` : username}</h1>
              <p className="text-zinc-500 text-xs font-bold tracking-[0.2em]">{formatDate()}</p>
            </div>

            <button
              onClick={() => setShowProfileModal(true)}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:text-white transition-all backdrop-blur-md"
            >
              <User className="w-4 h-4 text-yellow-500" />
              <span>Gerenciar Perfil</span>
            </button>
          </div>
        </div>

        {/* Stats Grid - DADOS REAIS */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 -mt-10 relative z-20">
          {/* Active Helmets */}
          <div className="bg-zinc-900/90 backdrop-blur-xl p-6 rounded-2xl border border-white/5 flex justify-between items-center shadow-lg">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${isEmergency ? "bg-red-500 animate-pulse" : "bg-green-500"}`} />
                <span className={`text-[10px] font-bold uppercase tracking-widest ${isEmergency ? "text-red-400" : "text-yellow-500"}`}>
                  {isEmergency ? "Alerta Ativo" : "Sistema Nominal"}
                </span>
              </div>
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Active Helmet</h3>
            </div>
            <div className="text-4xl font-bold text-white">
              <span className="text-green-500 mr-1">+</span>{stats.activeHelmets}
            </div>
          </div>

          {/* Emergencies */}
          <div className="bg-zinc-900/90 backdrop-blur-xl p-6 rounded-2xl border border-white/5 flex justify-between items-center shadow-lg">
            <div>
              <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Emergências</span>
              <div className="mt-3 w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
            </div>
            <div className="text-right">
              <div className={`text-4xl font-bold ${stats.emergenciesToday > 0 ? "text-red-500 animate-pulse" : "text-white"}`}>
                {stats.emergenciesToday}
              </div>
              <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">EPI Afetados</span>
            </div>
          </div>

          {/* Signals Received Today - CONTADOR REAL */}
          <div className="bg-zinc-900/90 backdrop-blur-xl p-6 rounded-2xl border border-white/5 flex justify-between items-center shadow-lg">
            <div>
              <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest">Sinais Recebidos Hoje</span>
              <div className="mt-3">
                <Wifi className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-white font-mono">{stats.signalsToday}</div>
              <span className="text-[8px] font-bold text-green-400 uppercase tracking-widest flex items-center justify-end gap-1 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Pacotes API
              </span>
            </div>
          </div>

          {/* Disconnected Helmets */}
          <div className="bg-zinc-900/90 backdrop-blur-xl p-6 rounded-2xl border border-white/5 flex justify-between items-center shadow-lg">
            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Capacetes Desconectados</span>
              <div className="mt-3">
                <Plug className="w-8 h-8 text-red-500" />
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-white font-mono">{stats.disconnectedHelmets}</div>
              <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Em Espera</span>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* TELEMETRIA AO VIVO DO ESP32 NA TELA PRINCIPAL               */}
        {/* ============================================================ */}
        <div className="px-8 pb-8">
          <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-6 border-b border-white/5 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white tracking-wide">
                    Telemetria ao Vivo do Dispositivo ESP32
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Operador Vinculado: <span className="text-yellow-400 font-semibold">{connectedHelmet?.name || "Gabriel Araújo (EMP001)"}</span> • IP: <span className="font-mono text-zinc-300">{telemetry?.ip || "192.168.0.122"}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Transmissão Contínua (1 Hz)
                </span>
                <button
                  onClick={onNavigateToMap}
                  className="px-4 py-1.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md"
                >
                  <MapIcon className="w-3.5 h-3.5" />
                  Ver no Mapa
                </button>
              </div>
            </div>

            {/* Grid de Sensores da Tela Principal */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Força G Atual */}
              <div className="bg-zinc-950/70 p-4 rounded-xl border border-white/5">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Aceleração (MPU6050)</span>
                  <Gauge className="w-4 h-4 text-yellow-500" />
                </div>
                <div className="text-3xl font-bold text-white font-mono">
                  {telemetry?.aceleracaoG !== undefined ? telemetry.aceleracaoG.toFixed(2) : "1.00"} <span className="text-sm font-bold text-yellow-500 font-sans">G</span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-2">
                  Pico Máximo Registrado: <strong className="text-zinc-300">{telemetry?.picoG !== undefined ? telemetry.picoG.toFixed(2) : "1.01"} G</strong>
                </p>
              </div>

              {/* Pontuação de Risco / Impacto */}
              <div className="bg-zinc-950/70 p-4 rounded-xl border border-white/5">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Pontuação de Impacto</span>
                  <Zap className="w-4 h-4 text-red-400" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className={`text-3xl font-bold font-mono ${(telemetry?.pontuacao ?? 0) >= 60 ? "text-red-500" : "text-green-400"}`}>
                    {telemetry?.pontuacao ?? 10}
                  </span>
                  <span className="text-sm font-bold text-zinc-500 font-mono">/100</span>
                </div>
                {/* Barra de progresso */}
                <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden mt-3">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      (telemetry?.pontuacao ?? 0) >= 60 ? "bg-red-500" : "bg-green-500"
                    }`}
                    style={{ width: `${Math.min(Math.max((telemetry?.pontuacao ?? 10), 5), 100)}%` }}
                  />
                </div>
              </div>

              {/* Sensores SW-420 e FC-04 */}
              <div className="bg-zinc-950/70 p-4 rounded-xl border border-white/5 space-y-2.5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Módulos de Detecção</span>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Vibração (SW-420):</span>
                  <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                    telemetry?.vibracao ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-zinc-800 text-zinc-400"
                  }`}>
                    {telemetry?.vibracao ? "Detectada" : "Estável"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Ruído/Som (FC-04):</span>
                  <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                    telemetry?.som ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "bg-zinc-800 text-zinc-400"
                  }`}>
                    {telemetry?.som ? "Som Ativo" : "Normal"}
                  </span>
                </div>
              </div>

              {/* GPS NEO-6M & Satélites */}
              <div className="bg-zinc-950/70 p-4 rounded-xl border border-white/5">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">GPS (NEO-6M)</span>
                  <MapPin className="w-4 h-4 text-yellow-500" />
                </div>
                <div className="text-xs space-y-1 mt-1">
                  <div className="flex justify-between text-zinc-400">
                    <span>Sinal Satélite:</span>
                    <strong className={telemetry?.gpsValido ? "text-green-400" : "text-yellow-500"}>
                      {telemetry?.gpsValido ? "Sinal Válido" : "Aguardando Visada"}
                    </strong>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Coordenadas:</span>
                    <span className="font-mono text-[11px] text-zinc-200">
                      {connectedHelmet?.lat.toFixed(4)}, {connectedHelmet?.lng.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Altitude:</span>
                    <span className="text-zinc-200">{telemetry?.altitude ?? 0} m</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Sections */}
        <div className="px-8 pb-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Atividades Recentes - REAIS */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Bell className="w-4 h-4 text-zinc-500" />
              <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Atividades Recentes</h2>
            </div>
            <div className="space-y-3">
              {activities.length > 0 ? activities.slice(0, 5).map(act => (
                <div key={act.id} className="bg-zinc-900/40 p-4 rounded-xl border border-white/5 flex items-start gap-4">
                  <div className={`w-2.5 h-2.5 rounded-full mt-1 ${
                    act.type === "EMERGENCY" ? "bg-red-500 animate-pulse" :
                    act.type === "CONNECT" ? "bg-green-500" : "bg-yellow-500"
                  }`} />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-bold text-zinc-200">{act.title}</h4>
                      <span className="text-[10px] text-zinc-500">
                        {new Date(act.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">{act.description}</p>
                    {act.employeeName && (
                      <p className="text-[10px] text-yellow-500/80 mt-1">{act.employeeName}</p>
                    )}
                  </div>
                </div>
              )) : (
                <div className="text-zinc-600 text-xs italic p-4 bg-zinc-900/20 rounded-xl">
                  Nenhuma atividade crítica recente.
                </div>
              )}
            </div>
          </section>

          {/* Control Section */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Monitor className="w-4 h-4 text-zinc-500" />
              <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Controle do Sistema</h2>
            </div>
            <div className="space-y-4">
              <button 
                onClick={onNavigateToMap}
                className="w-full bg-zinc-900/40 hover:bg-zinc-800/60 p-4 rounded-xl border border-white/5 flex items-center gap-6 transition-all group"
              >
                <div className="w-16 h-12 rounded-lg overflow-hidden relative">
                  <div 
                    className="absolute inset-0 bg-cover bg-center opacity-50 group-hover:opacity-80 transition-opacity"
                    style={{ backgroundImage: `url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=2066&auto=format&fit=crop')` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <MapIcon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="text-left">
                  <span className="text-sm font-bold text-zinc-200 uppercase tracking-widest block">Mapa de Segurança</span>
                  <span className="text-[10px] text-zinc-500">Visualizar capacetes conectados com posicionamento geográfico</span>
                </div>
              </button>

              <button 
                onClick={() => setShowProfileModal(true)}
                className="w-full bg-zinc-900/40 hover:bg-zinc-800/60 p-4 rounded-xl border border-white/5 flex items-center gap-6 transition-all group"
              >
                <div className="w-16 h-12 rounded-lg bg-zinc-800 flex items-center justify-center">
                  <HardHat className="w-6 h-6 text-yellow-500" />
                </div>
                <div className="text-left">
                  <span className="text-sm font-bold text-zinc-200 uppercase tracking-widest block">Perfil do Usuário</span>
                  <span className="text-[10px] text-zinc-500">Consultar credenciais, cargo e departamento</span>
                </div>
              </button>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="p-8 text-center border-t border-white/5 mt-auto">
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest">
            © 2026 Safety Monitor. Sistema Industrial em Tempo Real.
          </p>
        </footer>
      </main>

      {/* Modal de Perfil Real do Usuário */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={currentUser}
        onUpdateUser={onUpdateUser}
      />
    </div>
  );
}
