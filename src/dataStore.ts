import { DatabaseState, Room, Roommate, Cycle, CycleBalance, Transaction, TransactionMember, Settlement, RoommateDetailedBalance } from './types';

// Default initial state matching the mockup screenshots and accounting mathematics exactly
const DEFAULT_STATE: DatabaseState = {
  rooms: [
    {
      room_id: 1,
      room_name: "Room 12",
      created_at: "2026-08-16T10:00:00Z",
      updated_at: "2026-09-18T10:00:00Z",
      is_archived: false,
    },
    {
      room_id: 2,
      room_name: "Room 15",
      created_at: "2026-08-20T11:00:00Z",
      updated_at: "2026-09-18T10:00:00Z",
      is_archived: false,
    },
    {
      room_id: 3,
      room_name: "Room 18",
      created_at: "2026-08-24T12:00:00Z",
      updated_at: "2026-09-18T10:00:00Z",
      is_archived: false,
    },
    {
      room_id: 4,
      room_name: "Room 21",
      created_at: "2026-09-01T09:00:00Z",
      updated_at: "2026-09-18T10:00:00Z",
      is_archived: false,
    }
  ],
  roommates: [
    // Room 12 Roommates
    { roommate_id: 1, room_id: 1, name: "Umar", is_active: true, created_at: "2026-09-01T10:00:00Z", updated_at: "2026-09-01T10:00:00Z", deleted_at: null },
    { roommate_id: 2, room_id: 1, name: "Ali", is_active: true, created_at: "2026-09-01T10:00:00Z", updated_at: "2026-09-01T10:00:00Z", deleted_at: null },
    { roommate_id: 3, room_id: 1, name: "Ahmed", is_active: true, created_at: "2026-09-01T10:00:00Z", updated_at: "2026-09-01T10:00:00Z", deleted_at: null },
    { roommate_id: 4, room_id: 1, name: "Hamza", is_active: true, created_at: "2026-09-01T10:00:00Z", updated_at: "2026-09-01T10:00:00Z", deleted_at: null },

    // Room 15 Roommates
    { roommate_id: 5, room_id: 2, name: "Bilal", is_active: true, created_at: "2026-09-15T10:00:00Z", updated_at: "2026-09-15T10:00:00Z", deleted_at: null },
    { roommate_id: 6, room_id: 2, name: "Usman", is_active: true, created_at: "2026-09-15T10:00:00Z", updated_at: "2026-09-15T10:00:00Z", deleted_at: null },
    { roommate_id: 7, room_id: 2, name: "Zain", is_active: true, created_at: "2026-09-15T10:00:00Z", updated_at: "2026-09-15T10:00:00Z", deleted_at: null },
    { roommate_id: 8, room_id: 2, name: "Farhan", is_active: true, created_at: "2026-09-15T10:00:00Z", updated_at: "2026-09-15T10:00:00Z", deleted_at: null },

    // Room 18 Roommates
    { roommate_id: 9, room_id: 3, name: "Kashif", is_active: true, created_at: "2026-09-15T10:00:00Z", updated_at: "2026-09-15T10:00:00Z", deleted_at: null },
    { roommate_id: 10, room_id: 3, name: "Sajid", is_active: true, created_at: "2026-09-15T10:00:00Z", updated_at: "2026-09-15T10:00:00Z", deleted_at: null }
  ],
  cycles: [
    // Room 12 Cycles
    { cycle_id: 1, room_id: 1, cycle_name: "Cycle 1", start_date: "2026-08-16", end_date: "2026-08-23", status: "CLOSED", created_at: "2026-08-16T10:00:00Z", closed_at: "2026-08-23T22:00:00Z" },
    { cycle_id: 2, room_id: 1, cycle_name: "Cycle 2", start_date: "2026-08-24", end_date: "2026-08-31", status: "CLOSED", created_at: "2026-08-24T10:00:00Z", closed_at: "2026-08-31T22:00:00Z" },
    { cycle_id: 3, room_id: 1, cycle_name: "Cycle 3", start_date: "2026-09-01", end_date: "2026-09-07", status: "CLOSED", created_at: "2026-09-01T10:00:00Z", closed_at: "2026-09-07T22:00:00Z" },
    { cycle_id: 4, room_id: 1, cycle_name: "Cycle 4", start_date: "2026-09-08", end_date: null, status: "OPEN", created_at: "2026-09-08T10:00:00Z", closed_at: null },

    // Room 15 Cycles
    { cycle_id: 5, room_id: 2, cycle_name: "Cycle 1", start_date: "2026-09-15", end_date: null, status: "OPEN", created_at: "2026-09-15T10:00:00Z", closed_at: null }
  ],
  cycle_balances: [
    // Opening carry-forwards for Cycle 4 of Room 12
    { cycle_balance_id: 1, cycle_id: 4, roommate_id: 1, opening_balance: 0, created_at: "2026-09-08T10:00:00Z" },
    { cycle_balance_id: 2, cycle_id: 4, roommate_id: 2, opening_balance: -500, created_at: "2026-09-08T10:00:00Z" },
    { cycle_balance_id: 3, cycle_id: 4, roommate_id: 3, opening_balance: -100, created_at: "2026-09-08T10:00:00Z" },
    { cycle_balance_id: 4, cycle_id: 4, roommate_id: 4, opening_balance: 600, created_at: "2026-09-08T10:00:00Z" }
  ],
  transactions: [
    // Room 12 Cycle 4 Transactions (Total non-deleted sum = 18,500)
    {
      transaction_id: 1,
      cycle_id: 4,
      title: "Grocery",
      amount: 1500,
      paid_by: 4, // Hamza
      transaction_date: "2026-09-10",
      description: "Weekly kitchen vegetables and groceries",
      is_deleted: false,
      deleted_at: null,
      created_at: "2026-09-10T11:00:00Z",
      updated_at: "2026-09-10T11:00:00Z"
    },
    {
      transaction_id: 2,
      cycle_id: 4,
      title: "Water",
      amount: 500,
      paid_by: 3, // Ahmed
      transaction_date: "2026-09-12",
      description: "Mineral water bottles",
      is_deleted: false,
      deleted_at: null,
      created_at: "2026-09-12T12:00:00Z",
      updated_at: "2026-09-12T12:00:00Z"
    },
    {
      transaction_id: 3,
      cycle_id: 4,
      title: "Mess",
      amount: 8000,
      paid_by: 1, // Umar
      transaction_date: "2026-09-14",
      description: "Monthly catering bill",
      is_deleted: false,
      deleted_at: null,
      created_at: "2026-09-14T14:00:00Z",
      updated_at: "2026-09-14T14:00:00Z"
    },
    {
      transaction_id: 4,
      cycle_id: 4,
      title: "Internet",
      amount: 2000,
      paid_by: 2, // Ali
      transaction_date: "2026-09-16",
      description: "High speed fiber connection",
      is_deleted: false,
      deleted_at: null,
      created_at: "2026-09-16T15:00:00Z",
      updated_at: "2026-09-16T15:00:00Z"
    },
    {
      transaction_id: 5,
      cycle_id: 4,
      title: "Electricity",
      amount: 4000,
      paid_by: 1, // Umar
      transaction_date: "2026-09-18",
      description: "August electricity split bill",
      is_deleted: false,
      deleted_at: null,
      created_at: "2026-09-18T10:00:00Z",
      updated_at: "2026-09-18T10:00:00Z"
    },
    {
      transaction_id: 6,
      cycle_id: 4,
      title: "Room Cleaning & Gas",
      amount: 2500,
      paid_by: 1, // Umar
      transaction_date: "2026-09-08",
      description: "Cylinder gas and weekly maid service",
      is_deleted: false,
      deleted_at: null,
      created_at: "2026-09-08T10:00:00Z",
      updated_at: "2026-09-08T10:00:00Z"
    }
  ],
  transaction_members: [
    // 1. Grocery = 1500 -> 375 each
    { transaction_member_id: 1, transaction_id: 1, roommate_id: 1, share_amount: 375 },
    { transaction_member_id: 2, transaction_id: 1, roommate_id: 2, share_amount: 375 },
    { transaction_member_id: 3, transaction_id: 1, roommate_id: 3, share_amount: 375 },
    { transaction_member_id: 4, transaction_id: 1, roommate_id: 4, share_amount: 375 },

    // 2. Water = 500 -> 125 each
    { transaction_member_id: 5, transaction_id: 2, roommate_id: 1, share_amount: 125 },
    { transaction_member_id: 6, transaction_id: 2, roommate_id: 2, share_amount: 125 },
    { transaction_member_id: 7, transaction_id: 2, roommate_id: 3, share_amount: 125 },
    { transaction_member_id: 8, transaction_id: 2, roommate_id: 4, share_amount: 125 },

    // 3. Mess = 8000 -> Umar 5500, Ali 1000, Ahmed 750, Hamza 750 (custom shares)
    { transaction_member_id: 9, transaction_id: 3, roommate_id: 1, share_amount: 5500 },
    { transaction_member_id: 10, transaction_id: 3, roommate_id: 2, share_amount: 1000 },
    { transaction_member_id: 11, transaction_id: 3, roommate_id: 3, share_amount: 750 },
    { transaction_member_id: 12, transaction_id: 3, roommate_id: 4, share_amount: 750 },

    // 4. Internet = 2000 -> 500 each
    { transaction_member_id: 13, transaction_id: 4, roommate_id: 1, share_amount: 500 },
    { transaction_member_id: 14, transaction_id: 4, roommate_id: 2, share_amount: 500 },
    { transaction_member_id: 15, transaction_id: 4, roommate_id: 3, share_amount: 500 },
    { transaction_member_id: 16, transaction_id: 4, roommate_id: 4, share_amount: 500 },

    // 5. Electricity = 4000 -> Umar 3800, Ali 200, Ahmed 0, Hamza 0 (due to AC usage)
    { transaction_member_id: 17, transaction_id: 5, roommate_id: 1, share_amount: 3800 },
    { transaction_member_id: 18, transaction_id: 5, roommate_id: 2, share_amount: 200 },
    { transaction_member_id: 19, transaction_id: 5, roommate_id: 3, share_amount: 0 },
    { transaction_member_id: 20, transaction_id: 5, roommate_id: 4, share_amount: 0 },

    // 6. Maintenance = 2500 -> Umar 1700, Ali 500, Ahmed 250, Hamza 50 (custom)
    { transaction_member_id: 21, transaction_id: 6, roommate_id: 1, share_amount: 1700 },
    { transaction_member_id: 22, transaction_id: 6, roommate_id: 2, share_amount: 500 },
    { transaction_member_id: 23, transaction_id: 6, roommate_id: 3, share_amount: 250 },
    { transaction_member_id: 24, transaction_id: 6, roommate_id: 4, share_amount: 50 }
  ],
  settlements: [
    // Real settlements that make the balances match Ali -1000, Ahmed -800, Hamza -700
    {
      settlement_id: 1,
      cycle_id: 4,
      paid_by: 4, // Hamza pays Ali
      paid_to: 2, // Ali
      amount: 200,
      settlement_date: "2026-09-11",
      note: "Cash settlement to clear grocery dues",
      is_deleted: false,
      deleted_at: null,
      created_at: "2026-09-11T12:00:00Z",
      updated_at: "2026-09-11T12:00:00Z"
    },
    {
      settlement_id: 2,
      cycle_id: 4,
      paid_by: 4, // Hamza pays Ahmed
      paid_to: 3, // Ahmed
      amount: 800,
      settlement_date: "2026-09-13",
      note: "Online bank transfer for previous balance adjustment",
      is_deleted: false,
      deleted_at: null,
      created_at: "2026-09-13T15:00:00Z",
      updated_at: "2026-09-13T15:00:00Z"
    }
  ],
  lastBackupAt: "2026-09-18T10:24:00Z"
};

const LOCAL_STORAGE_KEY = "hostel_hisaab_db";

export class DataStore {
  private static state: DatabaseState = DEFAULT_STATE;
  private static listeners: Array<() => void> = [];

  static initialize(): DatabaseState {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    const hasReset = localStorage.getItem("hisaab_v2_scratch_reset_done");
    const forceWipe = localStorage.getItem("force_wipe_september_18_v3");

    if (!forceWipe) {
      const cleanState: DatabaseState = {
        rooms: [],
        roommates: [],
        cycles: [],
        cycle_balances: [],
        transactions: [],
        transaction_members: [],
        settlements: [],
        lastBackupAt: null
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cleanState));
      localStorage.setItem("force_wipe_september_18_v3", "true");
      localStorage.setItem("hisaab_v2_scratch_reset_done", "true");
      this.state = cleanState;
      return this.state;
    }

    if (!hasReset) {
      // One-time hard reset to give the user a completely empty start-from-scratch workspace
      const cleanState: DatabaseState = {
        rooms: [],
        roommates: [],
        cycles: [],
        cycle_balances: [],
        transactions: [],
        transaction_members: [],
        settlements: [],
        lastBackupAt: null
      };

      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cleanState));
      localStorage.setItem("hisaab_v2_scratch_reset_done", "true");
      this.state = cleanState;
      return this.state;
    }

    if (data) {
      try {
        this.state = JSON.parse(data);
      } catch (e) {
        console.error("Failed to parse localStorage data, restoring default", e);
        this.resetDatabase();
      }
    } else {
      this.resetDatabase();
    }
    return this.state;
  }

  static getState(): DatabaseState {
    return this.state;
  }

  private static save() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.state));
    this.listeners.forEach(listener => listener());
  }

  static subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // --- ROOM METHODS ---
  static addRoom(name: string): Room {
    const nextId = this.state.rooms.length > 0 ? Math.max(...this.state.rooms.map(r => r.room_id)) + 1 : 1;
    const newRoom: Room = {
      room_id: nextId,
      room_name: name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_archived: false,
    };
    this.state.rooms.push(newRoom);
    this.save();
    return newRoom;
  }

  static renameRoom(roomId: number, newName: string) {
    this.state.rooms = this.state.rooms.map(r => 
      r.room_id === roomId 
        ? { ...r, room_name: newName, updated_at: new Date().toISOString() } 
        : r
    );
    this.save();
  }

  static archiveRoom(roomId: number) {
    this.state.rooms = this.state.rooms.map(r => 
      r.room_id === roomId 
        ? { ...r, is_archived: true, updated_at: new Date().toISOString() } 
        : r
    );
    this.save();
  }

  static unarchiveRoom(roomId: number) {
    this.state.rooms = this.state.rooms.map(r => 
      r.room_id === roomId 
        ? { ...r, is_archived: false, updated_at: new Date().toISOString() } 
        : r
    );
    this.save();
  }

  static deleteRoom(roomId: number) {
    this.state.rooms = this.state.rooms.filter(r => r.room_id !== roomId);
    this.state.roommates = this.state.roommates.filter(rm => rm.room_id !== roomId);
    const roomCycles = this.state.cycles.filter(c => c.room_id === roomId).map(c => c.cycle_id);
    this.state.cycles = this.state.cycles.filter(c => c.room_id !== roomId);
    this.state.transactions = this.state.transactions.filter(t => !roomCycles.includes(t.cycle_id));
    this.state.settlements = this.state.settlements.filter(s => !roomCycles.includes(s.cycle_id));
    this.save();
  }

  // --- ROOMMATE METHODS ---
  static addRoommate(roomId: number, name: string): Roommate {
    const nextId = this.state.roommates.length > 0 ? Math.max(...this.state.roommates.map(r => r.roommate_id)) + 1 : 1;
    const newRoommate: Roommate = {
      roommate_id: nextId,
      room_id: roomId,
      name,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    };
    this.state.roommates.push(newRoommate);
    this.save();
    return newRoommate;
  }

  static deactivateRoommate(roommateId: number) {
    this.state.roommates = this.state.roommates.map(rm => 
      rm.roommate_id === roommateId 
        ? { ...rm, is_active: false, deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() } 
        : rm
    );
    this.save();
  }

  static reactivateRoommate(roommateId: number) {
    this.state.roommates = this.state.roommates.map(rm => 
      rm.roommate_id === roommateId 
        ? { ...rm, is_active: true, deleted_at: null, updated_at: new Date().toISOString() } 
        : rm
    );
    this.save();
  }

  static deleteRoommate(roommateId: number) {
    this.state.roommates = this.state.roommates.filter(rm => rm.roommate_id !== roommateId);
    this.save();
  }

  // --- CYCLE METHODS ---
  static startNewCycle(roomId: number, name: string, startDate: string, carryForward: boolean): Cycle {
    // 1. Close current open cycle for this room (if any)
    const openCycle = this.state.cycles.find(c => c.room_id === roomId && c.status === "OPEN");
    const previousBalances = openCycle ? this.getRoommateBalances(roomId, openCycle.cycle_id) : [];

    if (openCycle) {
      this.state.cycles = this.state.cycles.map(c => 
        c.cycle_id === openCycle.cycle_id 
          ? { ...c, status: "CLOSED", end_date: startDate, closed_at: new Date().toISOString() } 
          : c
      );
    }

    // 2. Create the new cycle
    const nextCycleId = this.state.cycles.length > 0 ? Math.max(...this.state.cycles.map(c => c.cycle_id)) + 1 : 1;
    const newCycle: Cycle = {
      cycle_id: nextCycleId,
      room_id: roomId,
      cycle_name: name,
      start_date: startDate,
      end_date: null,
      status: "OPEN",
      created_at: new Date().toISOString(),
      closed_at: null
    };
    this.state.cycles.push(newCycle);

    // 3. Create Carry Forward / Opening Balances
    const activeRoommates = this.state.roommates.filter(rm => rm.room_id === roomId && rm.is_active);
    activeRoommates.forEach(rm => {
      let openingBalance = 0;
      if (carryForward && openCycle) {
        const found = previousBalances.find(b => b.roommate_id === rm.roommate_id);
        if (found) {
          openingBalance = found.current_balance;
        }
      }

      const nextBalId = this.state.cycle_balances.length > 0 ? Math.max(...this.state.cycle_balances.map(cb => cb.cycle_balance_id)) + 1 : 1;
      this.state.cycle_balances.push({
        cycle_balance_id: nextBalId,
        cycle_id: nextCycleId,
        roommate_id: rm.roommate_id,
        opening_balance: openingBalance,
        created_at: new Date().toISOString()
      });
    });

    this.save();
    return newCycle;
  }

  static reopenCycle(roomId: number, cycleId: number) {
    // Reopening a cycle requires:
    // 1. Closing any currently open cycle in that room
    this.state.cycles = this.state.cycles.map(c => 
      c.room_id === roomId && c.status === "OPEN" 
        ? { ...c, status: "CLOSED", end_date: new Date().toISOString().split('T')[0], closed_at: new Date().toISOString() } 
        : c
    );

    // 2. Reopening the targeted cycle
    this.state.cycles = this.state.cycles.map(c => 
      c.cycle_id === cycleId 
        ? { ...c, status: "OPEN", end_date: null, closed_at: null } 
        : c
    );

    this.save();
  }

  // --- TRANSACTION METHODS ---
  static addTransaction(
    cycleId: number, 
    title: string, 
    amount: number, 
    paidBy: number | null, 
    date: string, 
    description: string | null,
    members: Array<{ roommate_id: number; share_amount: number }>
  ): Transaction {
    const nextTxId = this.state.transactions.length > 0 ? Math.max(...this.state.transactions.map(t => t.transaction_id)) + 1 : 1;
    const newTx: Transaction = {
      transaction_id: nextTxId,
      cycle_id: cycleId,
      title,
      amount,
      paid_by: paidBy,
      transaction_date: date,
      description,
      is_deleted: false,
      deleted_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.state.transactions.push(newTx);

    // Add members split
    members.forEach(m => {
      const nextMemberId = this.state.transaction_members.length > 0 ? Math.max(...this.state.transaction_members.map(tm => tm.transaction_member_id)) + 1 : 1;
      this.state.transaction_members.push({
        transaction_member_id: nextMemberId,
        transaction_id: nextTxId,
        roommate_id: m.roommate_id,
        share_amount: m.share_amount
      });
    });

    this.save();
    return newTx;
  }

  static editTransaction(
    transactionId: number,
    title: string,
    amount: number,
    paidBy: number | null,
    date: string,
    description: string | null,
    members: Array<{ roommate_id: number; share_amount: number }>
  ) {
    this.state.transactions = this.state.transactions.map(t => 
      t.transaction_id === transactionId 
        ? { ...t, title, amount, paid_by: paidBy, transaction_date: date, description, updated_at: new Date().toISOString() } 
        : t
    );

    // Recreate split members
    this.state.transaction_members = this.state.transaction_members.filter(m => m.transaction_id !== transactionId);
    
    members.forEach(m => {
      const nextMemberId = this.state.transaction_members.length > 0 ? Math.max(...this.state.transaction_members.map(tm => tm.transaction_member_id)) + 1 : 1;
      this.state.transaction_members.push({
        transaction_member_id: nextMemberId,
        transaction_id: transactionId,
        roommate_id: m.roommate_id,
        share_amount: m.share_amount
      });
    });

    this.save();
  }

  static deleteTransaction(transactionId: number) {
    this.state.transactions = this.state.transactions.map(t => 
      t.transaction_id === transactionId 
        ? { ...t, is_deleted: true, deleted_at: new Date().toISOString() } 
        : t
    );
    this.save();
  }

  // --- SETTLEMENT METHODS ---
  static addSettlement(
    cycleId: number,
    paidBy: number,
    paidTo: number,
    amount: number,
    date: string,
    note: string | null
  ): Settlement {
    const nextSetId = this.state.settlements.length > 0 ? Math.max(...this.state.settlements.map(s => s.settlement_id)) + 1 : 1;
    const newSet: Settlement = {
      settlement_id: nextSetId,
      cycle_id: cycleId,
      paid_by: paidBy,
      paid_to: paidTo,
      amount,
      settlement_date: date,
      note,
      is_deleted: false,
      deleted_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.state.settlements.push(newSet);
    this.save();
    return newSet;
  }

  static deleteSettlement(settlementId: number) {
    this.state.settlements = this.state.settlements.map(s => 
      s.settlement_id === settlementId 
        ? { ...s, is_deleted: true, deleted_at: new Date().toISOString() } 
        : s
    );
    this.save();
  }

  // --- BACKUP & EXPORT/IMPORT SYSTEM ---
  static setBackupTimestamp() {
    this.state.lastBackupAt = new Date().toISOString();
    this.save();
  }

  static importDatabase(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (
        Array.isArray(parsed.rooms) &&
        Array.isArray(parsed.roommates) &&
        Array.isArray(parsed.cycles) &&
        Array.isArray(parsed.cycle_balances) &&
        Array.isArray(parsed.transactions) &&
        Array.isArray(parsed.transaction_members) &&
        Array.isArray(parsed.settlements)
      ) {
        this.state = parsed;
        this.save();
        return true;
      }
    } catch (e) {
      console.error("Invalid database backup JSON", e);
    }
    return false;
  }

  static resetDatabase() {
    this.state = {
      rooms: [],
      roommates: [],
      cycles: [],
      cycle_balances: [],
      transactions: [],
      transaction_members: [],
      settlements: [],
      lastBackupAt: null
    };
    this.save();
  }

  // --- CALCULATION ENGINE ---
  static getRoommateBalances(roomId: number, cycleId: number): RoommateDetailedBalance[] {
    const roommates = this.state.roommates.filter(rm => rm.room_id === roomId);
    
    // Non-deleted transactions and settlements for this cycle
    const transactions = this.state.transactions.filter(t => t.cycle_id === cycleId && !t.is_deleted);
    const settlements = this.state.settlements.filter(s => s.cycle_id === cycleId && !s.is_deleted);
    const balances = this.state.cycle_balances.filter(cb => cb.cycle_id === cycleId);

    return roommates.map(rm => {
      // 1. Opening balance
      const balRow = balances.find(cb => cb.roommate_id === rm.roommate_id);
      const opening_balance = balRow ? balRow.opening_balance : 0;

      // 2. Expenses Paid by this roommate
      const expenses_paid = transactions
        .filter(t => t.paid_by === rm.roommate_id)
        .reduce((sum, t) => sum + t.amount, 0);

      // 3. His Share of expenses
      const txIds = transactions.map(t => t.transaction_id);
      const expenses_share = this.state.transaction_members
        .filter(tm => txIds.includes(tm.transaction_id) && tm.roommate_id === rm.roommate_id)
        .reduce((sum, tm) => sum + tm.share_amount, 0);

      // 4. Settlements Received by this roommate
      const settlements_received = settlements
        .filter(s => s.paid_to === rm.roommate_id)
        .reduce((sum, s) => sum + s.amount, 0);

      // 5. Settlements Paid by this roommate
      const settlements_paid = settlements
        .filter(s => s.paid_by === rm.roommate_id)
        .reduce((sum, s) => sum + s.amount, 0);

      // 6. Current Balance formula:
      // Current Balance = Opening Balance + Amount Paid - Share Amount + Settlement Received - Settlement Paid
      const current_balance = opening_balance + expenses_paid - expenses_share + settlements_received - settlements_paid;

      return {
        roommate_id: rm.roommate_id,
        name: rm.name,
        opening_balance,
        expenses_paid,
        expenses_share,
        settlements_received,
        settlements_paid,
        current_balance
      };
    });
  }
}
