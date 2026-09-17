import { supabase, isSupabaseConfigured } from "./supabaseClient";
import { 
  Employee, 
  Helmet, 
  UserRecord, 
  SafetyGuideline, 
  AccidentEvent,
  UserProfile,
  UserRole
} from "../types";

// ============================================================
// DADOS INICIAIS RESILIENTES (LOCALSTORAGE / FALLBACK)
// ============================================================

const SEED_USERS: UserRecord[] = [
  {
    id: "USR-001",
    firstName: "Administrador",
    lastName: "Master",
    username: "adminmaster",
    role: "MASTER",
    password: "123456",
    cpf: "000.111.222-33",
    position: "Engenheiro Chefe de Sistemas / Dono",
    department: "Diretoria de Tecnologia & Inovação",
    email: "adminmaster@industrial.com",
    phone: "(11) 99999-0000",
    active: true,
    companyId: "COMP-001"
  },
  {
    id: "USR-002",
    firstName: "Gabriel",
    lastName: "Araújo",
    username: "Gbxm",
    role: "COMPANY_ADMIN",
    password: "123456",
    cpf: "123.456.789-00",
    position: "Engenheiro de Segurança / Admin COI",
    department: "Centro de Operações Industriais (COI)",
    email: "gbxm.seguranca@industrial.com",
    phone: "(11) 98765-4321",
    active: true,
    companyId: "COMP-001"
  },
  {
    id: "USR-003",
    firstName: "Auditor",
    lastName: "Visualizador",
    username: "visualizador",
    role: "VIEWER",
    password: "123456",
    cpf: "999.888.777-66",
    position: "Técnico de Monitoramento / Fiscal",
    department: "Auditoria Externa de Segurança",
    email: "visualizador@industrial.com",
    phone: "(11) 91234-5678",
    active: true,
    companyId: "COMP-001"
  }
];

const SEED_HELMETS: Helmet[] = [
  {
    id: "HELM-001",
    serialNumber: "CAP-2026-ESP01",
    macAddress: "24:6F:28:B4:7E:10",
    firmwareVersion: "v1.0.4",
    battery: 95,
    status: "IN_USE",
    lastCalibration: "2026-01-10",
    nextInspection: "2026-07-10",
    assignedEmployeeId: "EMP001",
    assignedEmployeeName: "Gabriel Araújo",
    companyId: "COMP-001"
  },
  {
    id: "HELM-002",
    serialNumber: "CAP-2026-ESP02",
    macAddress: "24:6F:28:B4:7E:11",
    firmwareVersion: "v1.0.4",
    battery: 80,
    status: "AVAILABLE",
    lastCalibration: "2026-02-15",
    nextInspection: "2026-08-15",
    assignedEmployeeId: null,
    assignedEmployeeName: null,
    companyId: "COMP-001"
  },
  {
    id: "HELM-003",
    serialNumber: "CAP-2026-ESP03",
    macAddress: "24:6F:28:B4:7E:12",
    firmwareVersion: "v1.0.3",
    battery: 65,
    status: "AVAILABLE",
    lastCalibration: "2026-01-20",
    nextInspection: "2026-07-20",
    assignedEmployeeId: null,
    assignedEmployeeName: null,
    companyId: "COMP-001"
  },
  {
    id: "HELM-004",
    serialNumber: "CAP-2026-ESP04",
    macAddress: "24:6F:28:B4:7E:13",
    firmwareVersion: "v1.0.4",
    battery: 90,
    status: "MAINTENANCE",
    lastCalibration: "2025-11-10",
    nextInspection: "2026-05-10",
    assignedEmployeeId: null,
    assignedEmployeeName: null,
    companyId: "COMP-001"
  }
];

const SEED_EMPLOYEES: Employee[] = [
  {
    id: "EMP001",
    name: "Gabriel Araújo",
    cpf: "123.456.789-00",
    matricula: "IND-1044",
    roleFunction: "Operador Industrial / Protótipo ESP32",
    department: "Usinagem & Linha de Montagem",
    shift: "1º Turno (06h - 14h)",
    emergencyContact: "(11) 98888-1111 (Esposa - Mariana)",
    status: "ONLINE",
    lat: -23.5505,
    lng: -46.6333,
    lastSeen: Date.now(),
    battery: 95,
    assignedHelmetId: "HELM-001",
    assignedHelmetSerial: "CAP-2026-ESP01",
    telemetry: {
      aceleracaoG: 1.02,
      picoG: 1.05,
      pontuacao: 12,
      vibracao: false,
      som: false,
      gpsValido: true,
      satelites: 8,
      altitude: 760,
      wifi: "Carlos Ara_EXT",
      ip: "192.168.0.122"
    }
  },
  {
    id: "EMP002",
    name: "Gustavo Felix",
    cpf: "234.567.890-11",
    matricula: "IND-1045",
    roleFunction: "Técnico de Manutenção Mecânica",
    department: "Manutenção Central",
    shift: "2º Turno (14h - 22h)",
    emergencyContact: "(11) 97777-2222 (Mãe - Cláudia)",
    status: "OFFLINE",
    lat: -23.5515,
    lng: -46.6343,
    lastSeen: 0,
    battery: 80,
    assignedHelmetId: "HELM-002",
    assignedHelmetSerial: "CAP-2026-ESP02"
  },
  {
    id: "EMP003",
    name: "Fabio Akira",
    cpf: "345.678.901-22",
    matricula: "IND-1046",
    roleFunction: "Inspetor de Qualidade & Processos",
    department: "Qualidade & Auditoria",
    shift: "1º Turno (06h - 14h)",
    emergencyContact: "(11) 96666-3333 (Irmão - Roberto)",
    status: "OFFLINE",
    lat: -23.5525,
    lng: -46.6353,
    lastSeen: 0,
    battery: 65,
    assignedHelmetId: "HELM-003",
    assignedHelmetSerial: "CAP-2026-ESP03"
  },
  {
    id: "EMP004",
    name: "Fabio Pelissari",
    cpf: "456.789.012-33",
    matricula: "IND-1047",
    roleFunction: "Eletricista de Alta Tensão",
    department: "Subestação Elétrica",
    shift: "3º Turno (22h - 06h)",
    emergencyContact: "(11) 95555-4444 (Esposa - Fernanda)",
    status: "OFFLINE",
    lat: -23.5535,
    lng: -46.6363,
    lastSeen: 0,
    battery: 90,
    assignedHelmetId: null,
    assignedHelmetSerial: null
  }
];

const SEED_GUIDELINES: SafetyGuideline[] = [
  {
    id: "GUIDE-01",
    code: "NR-06.1",
    title: "Certificado de Aprovação (CA) de Capacetes Industriais",
    description: "Obrigatoriedade de equipamentos com Certificado de Aprovação válido emitido pelo Ministério do Trabalho para atenuação de impacto mecânico.",
    category: "EPI - Proteção da Cabeça",
    complianceStatus: "CONFORME",
    lastAudit: new Date().toISOString(),
    details: { normaReferencia: "ABNT NBR 8221:2019", caExigido: true }
  },
  {
    id: "GUIDE-02",
    code: "NR-06.2",
    title: "Inspeção e Substituição Periódica de Carneira e Casco",
    description: "Inspeção visual periódica contra trincas, deformações térmicas, fadiga do polietileno e higienização dos sistemas de suspensão.",
    category: "EPI - Conservação",
    complianceStatus: "CONFORME",
    lastAudit: new Date().toISOString(),
    details: { frequenciaDias: 180, responsavel: "SESMT" }
  },
  {
    id: "GUIDE-03",
    code: "NR-12.1",
    title: "Sistemas de Parada de Emergência e Delimitação",
    description: "Instalação e monitoramento contínuo de dispositivos de emergência em zonas com risco mecânico, esmagamento e prensagem.",
    category: "Máquinas e Equipamentos",
    complianceStatus: "CONFORME",
    lastAudit: new Date().toISOString(),
    details: { categoriaSeguranca: "Categoria 4 (PLe)", monitoramentoRemoto: true }
  },
  {
    id: "GUIDE-04",
    code: "NR-12.2",
    title: "Detecção Rápida de Queda e Impactos em Operadores",
    description: "Protocolo de alerta e desativação automática de maquinário pesado ao detectar impactos superiores a 4G ou desaceleração abrupta.",
    category: "Intertravamento",
    complianceStatus: "CONFORME",
    lastAudit: new Date().toISOString(),
    details: { limiteGSeguro: 4.0, tempoRespostaMs: 250 }
  }
];

const SEED_ACCIDENTS: AccidentEvent[] = [
  {
    id: "ACC-001",
    timestamp: Date.now() - 7200000,
    employeeId: "EMP001",
    employeeName: "Gabriel Araújo",
    aceleracaoG: 12.4,
    picoG: 14.8,
    pontuacao: 85,
    lat: -23.5505,
    lng: -46.6333,
    vibracao: true,
    som: true,
    acknowledged: false
  }
];

// Funções utilitárias para armazenamento local
function getFromStorage<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultVal;
    return JSON.parse(raw);
  } catch {
    return defaultVal;
  }
}

function saveToStorage<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Erro ao gravar ${key} no localStorage:`, err);
  }
}

// Inicializa o LocalStorage se estiver vazio
function initLocalStorage() {
  if (!localStorage.getItem("ism_users")) saveToStorage("ism_users", SEED_USERS);
  if (!localStorage.getItem("ism_helmets")) saveToStorage("ism_helmets", SEED_HELMETS);
  if (!localStorage.getItem("ism_employees")) saveToStorage("ism_employees", SEED_EMPLOYEES);
  if (!localStorage.getItem("ism_guidelines")) saveToStorage("ism_guidelines", SEED_GUIDELINES);
  if (!localStorage.getItem("ism_accidents")) saveToStorage("ism_accidents", SEED_ACCIDENTS);
}

// Executa inicialização
initLocalStorage();

// ============================================================
// SERVIÇO DE DADOS INTELIGENTE (SUPABASE + LOCAL RESILIENTE)
// ============================================================
export const dataService = {
  isOnline(): boolean {
    return isSupabaseConfigured();
  },

  // ------------------------------------------------------------
  // USUÁRIOS & AUTENTICAÇÃO (RBAC)
  // ------------------------------------------------------------
  async getUsers(): Promise<UserRecord[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: true });
        if (!error && data && data.length > 0) {
          return data.map(u => ({
            id: u.id,
            firstName: u.first_name,
            lastName: u.last_name,
            username: u.username,
            role: u.role as UserRole,
            cpf: u.cpf || "",
            position: u.position || "",
            department: u.department || "",
            email: u.email || "",
            phone: u.phone || "",
            active: u.active ?? true,
            companyId: u.company_id,
            createdAt: u.created_at
          }));
        }
      } catch (err) {
        console.warn("[dataService] Falha ao buscar usuários do Supabase, utilizando cache local:", err);
      }
    }
    return getFromStorage<UserRecord[]>("ism_users", SEED_USERS);
  },

  async authenticate(username: string, pass: string): Promise<{ success: boolean; user?: UserProfile; role?: UserRole; message?: string }> {
    // 1. Tentar autenticação no Supabase se ativo
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("username", username)
          .eq("password", pass)
          .single();

        if (!error && data) {
          if (!data.active) {
            return { success: false, message: "Usuário desativado pelo administrador." };
          }
          const userProfile: UserProfile = {
            firstName: data.first_name,
            lastName: data.last_name,
            username: data.username,
            role: data.role as UserRole,
            cpf: data.cpf,
            position: data.position,
            department: data.department,
            email: data.email,
            phone: data.phone
          };
          return { success: true, user: userProfile, role: data.role as UserRole };
        }
      } catch (err) {
        console.warn("[dataService] Verificação online falhou, testando banco local:", err);
      }
    }

    // 2. Fallback local
    const localUsers = getFromStorage<UserRecord[]>("ism_users", SEED_USERS);
    const found = localUsers.find(u => u.username === username && u.password === pass);

    if (found) {
      if (!found.active) {
        return { success: false, message: "Usuário desativado pelo administrador." };
      }
      return {
        success: true,
        user: {
          firstName: found.firstName,
          lastName: found.lastName,
          username: found.username,
          role: found.role,
          cpf: found.cpf,
          position: found.position,
          department: found.department,
          email: found.email,
          phone: found.phone
        },
        role: found.role
      };
    }

    return { success: false, message: "Usuário ou senha incorretos." };
  },

  async saveUser(user: Partial<UserRecord>): Promise<boolean> {
    const localUsers = getFromStorage<UserRecord[]>("ism_users", SEED_USERS);
    let updatedUsers: UserRecord[];

    const existingIndex = localUsers.findIndex(u => (user.id && u.id === user.id) || u.username === user.username);
    if (existingIndex >= 0) {
      updatedUsers = [...localUsers];
      updatedUsers[existingIndex] = { ...updatedUsers[existingIndex], ...user } as UserRecord;
    } else {
      const newUser: UserRecord = {
        id: user.id || `USR-${Date.now()}`,
        firstName: user.firstName || "Novo",
        lastName: user.lastName || "Usuário",
        username: user.username || `user_${Date.now()}`,
        role: user.role || "VIEWER",
        password: user.password || "123456",
        cpf: user.cpf || "",
        position: user.position || "",
        department: user.department || "",
        email: user.email || "",
        phone: user.phone || "",
        active: user.active ?? true,
        createdAt: Date.now()
      };
      updatedUsers = [newUser, ...localUsers];
    }

    saveToStorage("ism_users", updatedUsers);

    // Salvar no Supabase se disponível
    if (supabase) {
      try {
        const payload = {
          id: user.id || `USR-${Date.now()}`,
          first_name: user.firstName,
          last_name: user.lastName,
          username: user.username,
          password: user.password,
          role: user.role,
          cpf: user.cpf,
          position: user.position,
          department: user.department,
          email: user.email,
          phone: user.phone,
          active: user.active ?? true
        };
        await supabase.from("users").upsert(payload);
      } catch (e) {
        console.error("[dataService] Erro ao sincronizar usuário com Supabase:", e);
      }
    }

    return true;
  },

  async toggleUserStatus(username: string): Promise<boolean> {
    const users = getFromStorage<UserRecord[]>("ism_users", SEED_USERS);
    const target = users.find(u => u.username === username);
    if (!target) return false;
    target.active = !target.active;
    saveToStorage("ism_users", users);

    if (supabase) {
      try {
        await supabase.from("users").update({ active: target.active }).eq("username", username);
      } catch (e) {
        console.error("[dataService] Erro ao atualizar status no Supabase:", e);
      }
    }
    return true;
  },

  // ------------------------------------------------------------
  // CAPACETES INTELIGENTES (HELMETS)
  // ------------------------------------------------------------
  async getHelmets(): Promise<Helmet[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase.from("helmets").select("*").order("id", { ascending: true });
        if (!error && data && data.length > 0) {
          return data.map(h => ({
            id: h.id,
            serialNumber: h.serial_number,
            macAddress: h.mac_address,
            firmwareVersion: h.firmware_version,
            battery: h.battery,
            status: h.status,
            lastCalibration: h.last_calibration ? h.last_calibration.split("T")[0] : undefined,
            nextInspection: h.next_inspection ? h.next_inspection.split("T")[0] : undefined,
            assignedEmployeeId: h.assigned_employee_id,
            companyId: h.company_id
          }));
        }
      } catch (e) {
        console.warn("[dataService] Erro ao buscar capacetes do Supabase:", e);
      }
    }
    return getFromStorage<Helmet[]>("ism_helmets", SEED_HELMETS);
  },

  async saveHelmet(helmet: Helmet): Promise<boolean> {
    const helmets = getFromStorage<Helmet[]>("ism_helmets", SEED_HELMETS);
    const index = helmets.findIndex(h => h.id === helmet.id);
    if (index >= 0) {
      helmets[index] = helmet;
    } else {
      helmets.push(helmet);
    }
    saveToStorage("ism_helmets", helmets);

    if (supabase) {
      try {
        await supabase.from("helmets").upsert({
          id: helmet.id,
          serial_number: helmet.serialNumber,
          mac_address: helmet.macAddress,
          firmware_version: helmet.firmwareVersion,
          battery: helmet.battery,
          status: helmet.status,
          last_calibration: helmet.lastCalibration ? new Date(helmet.lastCalibration).toISOString() : null,
          next_inspection: helmet.nextInspection ? new Date(helmet.nextInspection).toISOString() : null,
          assigned_employee_id: helmet.assignedEmployeeId
        });
      } catch (e) {
        console.error("[dataService] Erro ao salvar capacete no Supabase:", e);
      }
    }
    return true;
  },

  async deleteHelmet(id: string): Promise<boolean> {
    let helmets = getFromStorage<Helmet[]>("ism_helmets", SEED_HELMETS);
    helmets = helmets.filter(h => h.id !== id);
    saveToStorage("ism_helmets", helmets);

    if (supabase) {
      try {
        await supabase.from("helmets").delete().eq("id", id);
      } catch (e) {
        console.error("[dataService] Erro ao excluir capacete no Supabase:", e);
      }
    }
    return true;
  },

  // ------------------------------------------------------------
  // FUNCIONÁRIOS / OPERADORES (EMPLOYEES)
  // ------------------------------------------------------------
  async getEmployees(): Promise<Employee[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase.from("employees").select("*").order("id", { ascending: true });
        if (!error && data && data.length > 0) {
          return data.map(e => ({
            id: e.id,
            name: e.name,
            cpf: e.cpf,
            matricula: e.matricula,
            roleFunction: e.role_function,
            department: e.department,
            shift: e.shift,
            emergencyContact: e.emergency_contact,
            status: e.status,
            lat: e.lat,
            lng: e.lng,
            lastSeen: Number(e.last_seen) || 0,
            battery: e.battery,
            assignedHelmetId: e.assigned_helmet_id
          }));
        }
      } catch (e) {
        console.warn("[dataService] Erro ao carregar funcionários do Supabase:", e);
      }
    }
    return getFromStorage<Employee[]>("ism_employees", SEED_EMPLOYEES);
  },

  async saveEmployee(employee: Employee): Promise<boolean> {
    const employees = getFromStorage<Employee[]>("ism_employees", SEED_EMPLOYEES);
    const index = employees.findIndex(e => e.id === employee.id);
    if (index >= 0) {
      employees[index] = { ...employees[index], ...employee };
    } else {
      employees.push(employee);
    }
    saveToStorage("ism_employees", employees);

    // Se vinculou um capacete, atualizar o status do capacete para IN_USE
    if (employee.assignedHelmetId) {
      const helmets = getFromStorage<Helmet[]>("ism_helmets", SEED_HELMETS);
      const hIndex = helmets.findIndex(h => h.id === employee.assignedHelmetId);
      if (hIndex >= 0) {
        helmets[hIndex].status = "IN_USE";
        helmets[hIndex].assignedEmployeeId = employee.id;
        helmets[hIndex].assignedEmployeeName = employee.name;
        saveToStorage("ism_helmets", helmets);
      }
    }

    if (supabase) {
      try {
        await supabase.from("employees").upsert({
          id: employee.id,
          name: employee.name,
          cpf: employee.cpf,
          matricula: employee.matricula,
          role_function: employee.roleFunction,
          department: employee.department,
          shift: employee.shift,
          emergency_contact: employee.emergencyContact,
          status: employee.status,
          lat: employee.lat,
          lng: employee.lng,
          last_seen: employee.lastSeen,
          battery: employee.battery,
          assigned_helmet_id: employee.assignedHelmetId
        });
      } catch (e) {
        console.error("[dataService] Erro ao salvar funcionário no Supabase:", e);
      }
    }
    return true;
  },

  async deleteEmployee(id: string): Promise<boolean> {
    let employees = getFromStorage<Employee[]>("ism_employees", SEED_EMPLOYEES);
    employees = employees.filter(e => e.id !== id);
    saveToStorage("ism_employees", employees);

    if (supabase) {
      try {
        await supabase.from("employees").delete().eq("id", id);
      } catch (e) {
        console.error("[dataService] Erro ao excluir funcionário no Supabase:", e);
      }
    }
    return true;
  },

  // ------------------------------------------------------------
  // NORMAS REGULAMENTADORAS (NR-06 e NR-12)
  // ------------------------------------------------------------
  async getSafetyGuidelines(): Promise<SafetyGuideline[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase.from("safety_guidelines").select("*").order("code", { ascending: true });
        if (!error && data && data.length > 0) {
          return data.map(g => ({
            id: g.id,
            code: g.code,
            title: g.title,
            description: g.description,
            category: g.category,
            complianceStatus: g.compliance_status,
            lastAudit: g.last_audit,
            details: g.details
          }));
        }
      } catch (e) {
        console.warn("[dataService] Erro ao buscar normas do Supabase:", e);
      }
    }
    return getFromStorage<SafetyGuideline[]>("ism_guidelines", SEED_GUIDELINES);
  },

  // ------------------------------------------------------------
  // EVENTOS DE ACIDENTES & HISTÓRICO
  // ------------------------------------------------------------
  async getAccidents(): Promise<AccidentEvent[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase.from("accident_events").select("*").order("timestamp", { ascending: false });
        if (!error && data && data.length > 0) {
          return data.map(a => ({
            id: a.id,
            timestamp: Number(a.timestamp),
            employeeId: a.employee_id,
            employeeName: a.employee_name,
            aceleracaoG: a.aceleracao_g,
            picoG: a.pico_g,
            pontuacao: a.pontuacao,
            lat: a.lat,
            lng: a.lng,
            vibracao: a.vibracao,
            som: a.som,
            acknowledged: a.acknowledged,
            acknowledgedBy: a.acknowledged_by,
            acknowledgedAt: a.acknowledged_at
          }));
        }
      } catch (e) {
        console.warn("[dataService] Erro ao buscar acidentes do Supabase:", e);
      }
    }
    return getFromStorage<AccidentEvent[]>("ism_accidents", SEED_ACCIDENTS);
  },

  async recordAccident(accident: AccidentEvent): Promise<boolean> {
    const accidents = getFromStorage<AccidentEvent[]>("ism_accidents", SEED_ACCIDENTS);
    const updated = [accident, ...accidents.slice(0, 49)];
    saveToStorage("ism_accidents", updated);

    if (supabase) {
      try {
        await supabase.from("accident_events").insert({
          id: accident.id,
          timestamp: accident.timestamp,
          employee_id: accident.employeeId,
          employee_name: accident.employeeName,
          aceleracao_g: accident.aceleracaoG,
          pico_g: accident.picoG,
          pontuacao: accident.pontuacao,
          lat: accident.lat,
          lng: accident.lng,
          vibracao: accident.vibracao,
          som: accident.som,
          acknowledged: accident.acknowledged
        });
      } catch (e) {
        console.error("[dataService] Erro ao registrar acidente no Supabase:", e);
      }
    }
    return true;
  },

  // ------------------------------------------------------------
  // EXPORTAÇÃO DE LAUDO TÉCNICO PARA A BANCA DE TCC
  // ------------------------------------------------------------
  async generateTechnicalReport() {
    const [helmets, employees, guidelines, accidents, users] = await Promise.all([
      this.getHelmets(),
      this.getEmployees(),
      this.getSafetyGuidelines(),
      this.getAccidents(),
      this.getUsers()
    ]);

    return {
      titulo: "LAUDO TÉCNICO INDUSTRIAL E CONFORMIDADE DE SEGURANÇA (TCC)",
      sistema: "Industrial Safety Monitor - ESP32 IoT Cloud System",
      dataGeracao: new Date().toLocaleString("pt-BR"),
      modoBanco: this.isOnline() ? "Supabase Cloud (PostgreSQL)" : "Armazenamento Local Resiliente",
      estatisticasGerais: {
        totalCapacetes: helmets.length,
        capacetesEmUso: helmets.filter(h => h.status === "IN_USE").length,
        operadoresCadastrados: employees.length,
        operadoresAtivos: employees.filter(e => e.status !== "OFFLINE").length,
        incidentesRegistrados: accidents.length,
        normasAuditadas: guidelines.length
      },
      normasConformidade: guidelines,
      capacetes: helmets,
      funcionarios: employees,
      historicoImpactos: accidents,
      usuariosAutorizados: users.map(u => ({ nome: `${u.firstName} ${u.lastName}`, role: u.role, usuario: u.username, depto: u.department }))
    };
  }
};
