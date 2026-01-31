
export enum UserRole {
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE'
}

export enum JobStatus {
  COMPLETED = 'COMPLETED',
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING = 'PENDING'
}

export enum PaymentMode {
  CASH = 'CASH',
  UPI = 'UPI',
  CARD = 'CARD',
  BANK_TRANSFER = 'BANK_TRANSFER'
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  HALF_DAY = 'HALF_DAY',
  ABSENT = 'ABSENT'
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string;
}

export interface Employee {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  address: string;
  idNumber: string;
  role: 'Electrician' | 'Helper' | 'Supervisor';
  joiningDate: string;
  isActive: boolean;
  avatar?: string;
}

export interface Attendance {
  id: string;
  userId: string;
  date: string; // ISO Date YYYY-MM-DD
  checkIn?: string; // ISO Timestamp
  checkOut?: string; // ISO Timestamp
  status: AttendanceStatus;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
}

export interface JobPhoto {
  id: string;
  type: 'WORK' | 'BEFORE' | 'AFTER';
  url: string;
  timestamp: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface ChecklistItem {
  id: string;
  task: string;
  isCompleted: boolean;
}

export interface Job {
  id: string;
  title: string;
  customerName: string;
  customerPhone: string;
  description: string;
  status: JobStatus;
  createdAt: string;
  location?: Location;
  assignedEmployeeIds: string[];
  photos: JobPhoto[];
  checklist: ChecklistItem[];
  totalAmount: number;
  amountPaid: number;
  paymentMode: PaymentMode;
  materialCost: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minThreshold: number;
  lastUpdated: string;
}

export interface AppState {
  currentUser: User | null;
  managers: User[];
  employees: Employee[];
  jobs: Job[];
  inventory: InventoryItem[];
  attendance: Attendance[];
}
