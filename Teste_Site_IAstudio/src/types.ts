export type EmployeeStatus = "ONLINE" | "OFFLINE" | "EMERGENCY" | "UNSTABLE" | "INACTIVE";

export interface EmployeeTelemetry {
  aceleracao?: number;
  aceleracaoG?: number;
  picoAceleracaoG?: number;
  picoG?: number;
  pontuacao?: number;
  pontosMPU?: number;
  pontosVibracao?: number;
  pontosSom?: number;
  vibracao?: boolean;
  som?: boolean;
  satelites?: number;
  altitude?: number;
  hdop?: number;
  gpsValido?: boolean;
  mapsUrl?: string;
  wifi?: string;
  ip?: string;
}

export interface Employee {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: EmployeeStatus;
  lastSeen: number;
  battery: number;
  active?: boolean;
  department?: string;
  telemetry?: EmployeeTelemetry;
}

export interface SystemStats {
  signalsToday: number;
  emergenciesToday: number;
  activeHelmets: number;
  disconnectedHelmets: number;
  systemStatus: "NOMINAL" | "EMERGENCY" | "WARNING";
}

export interface RecentActivity {
  id: string;
  title: string;
  description: string;
  timestamp: number;
  type: "EMERGENCY" | "CONNECT" | "DISCONNECT" | "INFO";
  employeeName?: string;
  employeeId?: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  username: string;
  cpf: string;
  position: string;
  department: string;
  email: string;
  phone: string;
}

export interface UserRecord extends UserProfile {
  active: boolean;
  createdAt?: number;
}

export interface AccidentEvent {
  id: string;
  timestamp: number;
  employeeId: string;
  employeeName: string;
  aceleracaoG: number;
  picoG: number;
  pontuacao: number;
  lat: number;
  lng: number;
  vibracao: boolean;
  som: boolean;
  acknowledged: boolean;
}

export interface WebSocketMessage {
  type: "INITIAL_STATE" | "UPDATE";
  data: Employee[];
  stats?: SystemStats;
  activities?: RecentActivity[];
  accidents?: AccidentEvent[];
  users?: UserRecord[];
}
