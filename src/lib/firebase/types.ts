import { Timestamp } from 'firebase/firestore';

// Usuário
export interface User {
  uid: string;
  name: string;
  email: string;
  createdAt: Timestamp;
}

// Site
export interface Site {
  id: string;
  ownerId: string;
  url: string;
  description: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Vulnerabilidade
export interface Vulnerability {
  type: string;
  severity: 'Baixa' | 'Média' | 'Alta' | 'Crítica';
  description: string;
}

// Scan
export interface Scan {
  id: string;
  siteId: string;
  timestamp: Timestamp;
  vulnerabilities: Vulnerability[];
  report: string;
}

// Log
export interface Log {
  id: string;
  timestamp: Timestamp;
  level: 'INFO' | 'WARNING' | 'ERROR';
  message: string;
  scanId?: string;
} 