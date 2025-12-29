
export enum SessionStatus {
  SCHEDULED = 'Scheduled',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
  NO_SHOW = 'No Show'
}

export interface ClientTask {
  id: string;
  title: string;
  description?: string; // Detailed instructions
  isCompleted: boolean;
  dueDate?: string;
  frequency?: 'Once' | 'Daily' | 'Weekly';
  type: 'Journaling' | 'Meditation' | 'Action' | 'Reading';
  attachment?: {
    name: string;
    type: 'PDF' | 'Audio' | 'Video' | 'Link';
    url: string;
  };
}

export interface ClientGoal {
  id: string;
  title: string;
  description?: string;
  category: 'Business' | 'Health' | 'Mindset' | 'Soul' | 'Relationship';
  status: 'In Progress' | 'Achieved' | 'Paused';
  targetDate: string;
}

export interface ClientDocument {
  id: string;
  name: string;
  type: 'PDF' | 'Image' | 'Link' | 'Audio';
  url: string;
  date: string;
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  // Extended Profile Fields for Professional CRM
  profession?: string;
  instagram?: string;
  address?: string; // For Billing
  birthday?: string; // ISO Date YYYY-MM-DD
  source?: string; // e.g., 'Google', 'Referral', 'Instagram'

  lastSession: string; // ISO Date
  loyaltyPoints: number;
  isVIP: boolean;
  notes: string; // General internal notes
  sessionNotes: { date: string; text: string }[]; // History of session notes
  goals: ClientGoal[];
  tasks: ClientTask[]; // Homework assigned to client
  documents: ClientDocument[]; // Files shared or uploaded
  avatar: string;
  totalSpend: number; // LTV (Life Time Value)
  totalSessions: number; // Count of sessions attended
}

export interface VaultCategory {
  id: string;
  name: string;
  iconName: string; // Lucide icon name string
  sortOrder: number;
}

export interface Program {
  id: string;
  title: string;
  category: string; // Dynamic category name (linked to VaultCategory.name)
  type: string; // Flexible type string
  durationMinutes: number;
  price: number;
  active: boolean;
}

export interface Resource {
  id: string;
  title: string;
  category?: string; // Optional category for resources too
  type: 'Audio' | 'PDF' | 'Video' | 'Link';
  url: string;
  tags: string[];
}

export interface Session {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail?: string; // For Calendar Invites
  clientPhone?: string; // For WhatsApp Reminders
  programId: string;
  programName: string;
  date: string; // ISO Date Time
  status: SessionStatus;
  notes?: string;
  type: '1:1' | 'Group' | 'Holistic'; // Added Holistic type
  category?: string;
}

export interface StatMetric {
  label: string;
  value: string;
  trend: number; // percentage
  trendLabel: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

// --- FINANCE TYPES ---
export type TransactionType = 'Income' | 'Expense' | 'Payroll';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string; // e.g., 'Service', 'Product', 'Rent', 'Marketing', 'Salary'
  date: string; // ISO Date
  status: 'Paid' | 'Pending';
  paymentMethod?: 'Credit Card' | 'Bank Transfer' | 'Cash';
}

// --- TEAM TYPES ---
export type TeamMemberType = 'Salary' | 'Contractor';
export type TeamMemberStatus = 'Pending' | 'Paid' | 'Overdue';

export interface TeamMember {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  type: TeamMemberType;
  amount: number;
  dueDay: number; // 1-31
  status: TeamMemberStatus;
  vatId?: string; // P.IVA per Collaboratori
  avatar?: string;
  notes?: string;
  createdAt?: string;
}

// --- SUBSCRIPTION TYPES (v2.0) ---
export type SubscriptionTier = 'free' | 'starter' | 'pro' | 'signature' | 'empire';
export type SubscriptionStatus = 'inactive' | 'active' | 'trial' | 'past_due' | 'canceled';
export type BillingCycle = 'monthly' | 'annual';

export interface SubscriptionPlan {
  id: string;
  name: SubscriptionTier;
  displayName: string;
  priceMonthlyPublic: number;
  priceMonthlyFounder: number;
  priceAnnualFounder: number;
  maxUsers: number; // -1 = unlimited
  maxClients: number;
  maxSessionsPerMonth: number;
  maxLocations: number;
  features: string[];
  stripePriceIdMonthly?: string;
  stripePriceIdAnnual?: string;
}

export interface UserSubscription {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  isFoundingMember: boolean;
  foundingMemberSince?: string;
  foundingMemberNumber?: number; // 1-100 for Founding Members
  trialEndsAt?: string;
  subscriptionEndsAt?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export interface FounderWaitlistEntry {
  email: string;
  name?: string;
  businessType?: 'parrucchiere' | 'estetista' | 'coach' | 'tattoo' | 'massaggio' | 'altro';
}
