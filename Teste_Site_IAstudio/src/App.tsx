import { useEffect, useState, useRef } from "react";
import { Employee, WebSocketMessage, SystemStats, RecentActivity, UserProfile, UserRole } from "./types";
import Sidebar from "./components/Sidebar";
import Map from "./components/Map";
import VideoPlayer from "./components/VideoPlayer";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import HelmetManagementModal from "./components/HelmetManagementModal";
import EmployeeManagementModal from "./components/EmployeeManagementModal";
import UserManagementModal from "./components/UserManagementModal";
import SafetyAnalyticsModal from "./components/SafetyAnalyticsModal";
import { dataService } from "./services/dataService";
import { AlertCircle, Bell, X, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}

export default function App() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>("EMP001");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState<"LOGIN" | "REGISTER">("LOGIN");
  const [username, setUsername] = useState("");
  const [userRole, setUserRole] = useState<UserRole>("COMPANY_ADMIN");
  const [view, setView] = useState<"HOME" | "MAP">("HOME");
  const [loginError, setLoginError] = useState("");
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  // Estados dos 4 Modais do Sistema
  const [showHelmetModal, setShowHelmetModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);

  const [stats, setStats] = useState<SystemStats>({
    signalsToday: 0,
    emergenciesToday: 0,
    activeHelmets: 1,
    disconnectedHelmets: 3,
    systemStatus: "NOMINAL"
  });

  const [activities, setActivities] = useState<RecentActivity[]>([]);

  const [currentUser, setCurrentUser] = useState<UserProfile>({
    firstName: "Admin",
    lastName: "Empresa",
    username: "Gbxm",
    role: "COMPANY_ADMIN",
    cpf: "123.456.789-00",
    position: "Engenheiro de Segurança / Admin",
    department: "Centro de Operações Industriais (COI)",
    email: "gbxm.seguranca@industrial.com",
    phone: "(11) 98765-4321"
  });

  const ws = useRef<WebSocket | null>(null);

  // Carrega lista inicial de funcionários do dataService (Supabase ou Local)
  useEffect(() => {
    const initData = async () => {
      const initialEmps = await dataService.getEmployees();
      if (initialEmps && initialEmps.length > 0) {
        setEmployees(initialEmps);
        const activeCount = initialEmps.filter(e => e.status !== "OFFLINE").length;
        const disconnectedCount = initialEmps.filter(e => e.status === "OFFLINE").length;
        setStats(prev => ({
          ...prev,
          activeHelmets: activeCount,
          disconnectedHelmets: disconnectedCount
        }));
      }
    };
    initData();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Obter localização do usuário
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ type: "SET_BASE_LOCATION", lat: latitude, lng: longitude }));
          }
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }

    // Suporte a VITE_API_URL para deploy no Vercel.
    const apiBaseUrl = import.meta.env.VITE_API_URL || "";
    let wsUrl: string;
    if (apiBaseUrl) {
      wsUrl = apiBaseUrl.replace(/^http/, "ws").replace(/^https/, "wss");
    } else {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.host;
      wsUrl = `${protocol}//${host}`;
    }

    try {
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        if (userLocation) {
          ws.current?.send(JSON.stringify({ type: "SET_BASE_LOCATION", lat: userLocation[0], lng: userLocation[1] }));
        }
      };

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          if (message.type === "INITIAL_STATE" || message.type === "UPDATE") {
            setEmployees(message.data);
            if (message.stats) {
              setStats(message.stats);
            }
            if (message.activities) {
              setActivities(message.activities);
            }
          }
        } catch (err) {
          console.error("Erro ao processar mensagem do WebSocket", err);
        }
      };
    } catch (e) {
      console.info("WebSocket local não disponível no momento. Operando com dados em cache.");
    }

    return () => {
      ws.current?.close();
    };
  }, [isAuthenticated]);

  const handleLogin = async (user: string, pass: string) => {
    // 1. Tentar autenticação no serviço unificado (Supabase ou LocalStorage)
    const authRes = await dataService.authenticate(user, pass);
    if (authRes.success && authRes.user) {
      setIsAuthenticated(true);
      setUsername(authRes.user.username);
      setUserRole(authRes.role || "COMPANY_ADMIN");
      setCurrentUser(authRes.user);
      setLoginError("");
      return;
    }

    // 2. Fallback para API do servidor backend se estiver rodando
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
        body: JSON.stringify({ username: user, password: pass }),
      });
      const data = await response.json();
      if (data.success) {
        setIsAuthenticated(true);
        setUsername(data.user.username);
        setUserRole(data.user.role || "COMPANY_ADMIN");
        if (data.user) {
          setCurrentUser({
            firstName: data.user.firstName || "Admin",
            lastName: data.user.lastName || "User",
            username: data.user.username || user,
            role: data.user.role || "COMPANY_ADMIN",
            cpf: data.user.cpf || "123.456.789-00",
            position: data.user.position || "Engenheiro de Segurança / Admin",
            department: data.user.department || "Centro de Operações Industriais (COI)",
            email: data.user.email || "gbxm.seguranca@industrial.com",
            phone: data.user.phone || "(11) 98765-4321"
          });
        }
        setLoginError("");
        return;
      }
    } catch {}

    setLoginError(authRes.message || "Usuário ou senha incorretos.");
  };

  const handleUpdateUser = async (updated: UserProfile): Promise<boolean> => {
    try {
      await dataService.saveUser(updated);
      setCurrentUser(updated);
      setUsername(updated.username);
      return true;
    } catch {
      return false;
    }
  };

  const handleRegister = async (userData: any) => {
    try {
      await dataService.saveUser({
        firstName: userData.firstName,
        lastName: userData.lastName,
        username: userData.username,
        password: userData.password,
        role: "VIEWER",
        cpf: userData.cpf,
        position: userData.position,
        department: userData.department,
        email: userData.email,
        phone: userData.phone,
        active: true
      });
      setAuthView("LOGIN");
      setLoginError("");
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername("");
    setUserRole("VIEWER");
    setView("HOME");
    setSelectedEmployeeId(null);
  };

  const ignoreEmergency = (employeeId: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: "IGNORE_EMERGENCY", employeeId }));
    }
  };

  const reloadEmployees = async () => {
    const emps = await dataService.getEmployees();
    setEmployees(emps);
  };

  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId) || null;

  if (!isAuthenticated) {
    if (authView === "REGISTER") {
      return (
        <Register 
          onRegister={handleRegister} 
          onGoBack={() => setAuthView("LOGIN")} 
        />
      );
    }
    return (
      <Login 
        onLogin={handleLogin} 
        onGoToRegister={() => setAuthView("REGISTER")}
        error={loginError} 
      />
    );
  }

  return (
    <>
      {view === "HOME" ? (
        <Dashboard 
          username={username}
          userRole={userRole}
          employees={employees}
          stats={stats}
          activities={activities}
          currentUser={currentUser}
          onNavigateToMap={() => setView("MAP")} 
          onLogout={handleLogout}
          onUpdateUser={handleUpdateUser}
          onOpenHelmetModal={() => setShowHelmetModal(true)}
          onOpenEmployeeModal={() => setShowEmployeeModal(true)}
          onOpenUserModal={() => setShowUserModal(true)}
          onOpenAnalyticsModal={() => setShowAnalyticsModal(true)}
        />
      ) : (
        <div className="flex h-screen w-screen bg-zinc-950 overflow-hidden font-sans">
          <div className="flex flex-col">
            <button 
              onClick={() => setView("HOME")}
              className="bg-zinc-900 p-4 border-b border-zinc-800 text-zinc-400 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Painel Principal</span>
            </button>
            <Sidebar 
              employees={employees} 
              selectedEmployeeId={selectedEmployeeId} 
              onSelectEmployee={setSelectedEmployeeId} 
              onIgnoreEmergency={ignoreEmergency}
            />
          </div>

          <main className="flex-1 flex flex-col">
            <div className="h-2/3 relative border-b border-zinc-800">
              <Map 
                employees={employees} 
                selectedEmployeeId={selectedEmployeeId} 
                onSelectEmployee={setSelectedEmployeeId} 
                userLocation={userLocation}
              />
              
              {/* Map Overlay Controls */}
              <div className="absolute bottom-6 left-6 z-[1000] flex flex-col gap-2">
                 <div className="bg-zinc-900/80 backdrop-blur-md p-4 rounded-2xl border border-zinc-800 shadow-2xl">
                    <div className="flex items-center gap-3 mb-3">
                       <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                       <span className="text-xs font-bold text-zinc-300 uppercase tracking-widest">
                         {stats.systemStatus === "EMERGENCY" ? "Alerta de Emergência Ativo" : "Sistema Nominal"}
                       </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <div className="text-[10px] text-zinc-500 uppercase font-bold">Capacetes Ativos</div>
                          <div className="text-xl font-bold text-zinc-100">{employees.filter(e => e.status !== "OFFLINE").length}</div>
                       </div>
                       <div>
                          <div className="text-[10px] text-zinc-500 uppercase font-bold">Emergências</div>
                          <div className="text-xl font-bold text-red-500">{employees.filter(e => e.status === "EMERGENCY").length}</div>
                       </div>
                    </div>
                 </div>
              </div>
            </div>

            <div className="h-1/3 flex">
              <VideoPlayer employee={selectedEmployee} />
              
              <div className="w-96 bg-zinc-900 p-6 border-l border-zinc-800 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Atividades Críticas
                  </h3>
                </div>
                <div className="space-y-4">
                  {employees.filter(e => e.status === "EMERGENCY" || e.status === "OFFLINE").length === 0 ? (
                    <div className="text-center py-8 text-zinc-600 text-xs italic">
                      Nenhuma atividade crítica registrada.
                    </div>
                  ) : (
                    employees.filter(e => e.status === "EMERGENCY" || e.status === "OFFLINE").map(emp => (
                      <div key={emp.id} className="flex gap-4 items-start border-l-2 border-zinc-800 pl-4 py-1 group">
                        <div className={cn(
                          "w-2 h-2 rounded-full mt-1.5",
                          emp.status === "EMERGENCY" ? "bg-red-500" : "bg-zinc-600"
                        )} />
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <p className="text-xs font-bold text-zinc-200">
                              {emp.status === "EMERGENCY" ? "Alerta de Impacto" : "Capacete Desconectado"}
                            </p>
                            {emp.status === "EMERGENCY" && (
                              <button 
                                onClick={() => ignoreEmergency(emp.id)}
                                className="text-[9px] bg-zinc-800 hover:bg-zinc-700 text-zinc-400 px-2 py-0.5 rounded border border-zinc-700 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                Reconhecer
                              </button>
                            )}
                          </div>
                          <p className="text-[10px] text-zinc-500 mt-0.5">
                            {emp.name} ({emp.id}) - {new Date().toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      )}

      {/* Modais do Sistema */}
      <HelmetManagementModal
        isOpen={showHelmetModal}
        onClose={() => setShowHelmetModal(false)}
        userRole={userRole}
        employees={employees}
        onRefreshData={reloadEmployees}
      />

      <EmployeeManagementModal
        isOpen={showEmployeeModal}
        onClose={() => setShowEmployeeModal(false)}
        userRole={userRole}
        onRefreshData={reloadEmployees}
      />

      <UserManagementModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        currentUserRole={userRole}
        currentUsername={username}
      />

      <SafetyAnalyticsModal
        isOpen={showAnalyticsModal}
        onClose={() => setShowAnalyticsModal(false)}
        employees={employees}
      />
    </>
  );
}
