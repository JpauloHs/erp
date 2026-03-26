export type OSStatus = 'aberta' | 'atrasada' | 'agendada' | 'orcamento' | 'concluida' | 'cancelada';
export type OSType = 'servico' | 'agendamento' | 'orcamento';

export interface Vehicle {
  id: string;
  plate: string;
  model: string;
  brand: string;
  year: string;
  chassis?: string;
  renavam?: string;
  currentKm: number;
}

export interface Client {
  id: string;
  name: string;
  type: 'PF' | 'PJ';
  document: string; // CPF or CNPJ
  phone: string;
  email: string;
  vehicles: Vehicle[];
  createdAt: string;
}

export interface Part {
  id: string;
  name: string;
  sku: string;
  costPrice: number;
  salePrice: number;
  stock: number;
  minStock: number;
  supplierId: string;
}

export interface OrderItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  type: 'part' | 'service';
}

export interface OS {
  id: string;
  number: number;
  clientId: string;
  vehicleId: string;
  type: OSType;
  status: OSStatus;
  description: string;
  technicalReport?: string;
  artNumber?: string;
  items: OrderItem[];
  totalAmount: number;
  startTime?: string;
  endTime?: string;
  timerSeconds: number;
  isTimerRunning: boolean;
  scheduledDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
}

export interface Employee {
  id: string;
  name: string;
  specialty: string;
  active: boolean;
}

export interface InventoryOrder {
  id: string;
  partId: string;
  quantity: number;
  status: 'pendente' | 'transito' | 'recebido';
  nfNumber?: string;
  createdAt: string;
}
