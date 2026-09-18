export interface Room {
  room_id: number;
  room_name: string;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
}

export interface Roommate {
  roommate_id: number;
  room_id: number;
  name: string;
  is_active: boolean; // 1 = active, 0 = inactive
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type CycleStatus = 'OPEN' | 'CLOSED';

export interface Cycle {
  cycle_id: number;
  room_id: number;
  cycle_name: string;
  start_date: string;
  end_date: string | null;
  status: CycleStatus;
  created_at: string;
  closed_at: string | null;
}

export interface CycleBalance {
  cycle_balance_id: number;
  cycle_id: number;
  roommate_id: number;
  opening_balance: number; // decimal
  created_at: string;
}

export interface Transaction {
  transaction_id: number;
  cycle_id: number;
  title: string;
  amount: number; // decimal > 0
  paid_by: number | null; // FK to roommates, null allowed
  transaction_date: string;
  description: string | null;
  is_deleted: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TransactionMember {
  transaction_member_id: number;
  transaction_id: number;
  roommate_id: number;
  share_amount: number; // decimal > 0
}

export interface Settlement {
  settlement_id: number;
  cycle_id: number;
  paid_by: number; // FK to roommates
  paid_to: number; // FK to roommates
  amount: number; // decimal > 0
  settlement_date: string;
  note: string | null;
  is_deleted: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

// Aggregated / helper types for calculations
export interface RoommateDetailedBalance {
  roommate_id: number;
  name: string;
  opening_balance: number;
  expenses_paid: number;
  expenses_share: number;
  settlements_received: number;
  settlements_paid: number;
  current_balance: number;
}

export interface DatabaseState {
  rooms: Room[];
  roommates: Roommate[];
  cycles: Cycle[];
  cycle_balances: CycleBalance[];
  transactions: Transaction[];
  transaction_members: TransactionMember[];
  settlements: Settlement[];
  lastBackupAt: string | null;
}
