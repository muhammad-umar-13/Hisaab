/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Landmark, Receipt, Users, RefreshCw, 
  Settings, Plus, Home, ChevronDown, Menu, X, ArrowUpRight
} from 'lucide-react';
import { DataStore } from './dataStore';
import { Room, Cycle, Roommate, Transaction, TransactionMember, RoommateDetailedBalance, DatabaseState } from './types';

// Tab Components
import DashboardTab from './components/DashboardTab';
import HisaabTab from './components/HisaabTab';
import ExpensesTab from './components/ExpensesTab';
import RoommatesTab from './components/RoommatesTab';
import CyclesTab from './components/CyclesTab';
import SettingsTab from './components/SettingsTab';
import OnboardingFlow from './components/OnboardingFlow';

// Modals
import AddExpenseModal from './components/AddExpenseModal';
import SettlePaymentModal from './components/SettlePaymentModal';

// PWA components
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';

export default function App() {
  // Load initial store state
  const [dbState, setDbState] = useState<DatabaseState>(() => DataStore.initialize());
  
  // Navigation & context states
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [selectedRoomId, setSelectedRoomId] = useState<number>(1);
  const [viewingAsId, setViewingAsId] = useState<number>(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Prevent background scrolling on mobile when drawer menu is active
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Modals Toggles
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isSettleOpen, setIsSettleOpen] = useState(false);
  
  // Editing Expense state
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingMembers, setEditingMembers] = useState<TransactionMember[]>([]);

  // 1. Subscribe to DataStore updates so the frontend stays completely reactive
  useEffect(() => {
    return DataStore.subscribe(() => {
      const state = DataStore.getState();
      setDbState({ ...state });
    });
  }, []);

  // 2. Sync selected Room ID and "Viewing As" defaults
  const activeRooms = dbState.rooms.filter(r => !r.is_archived);
  
  useEffect(() => {
    if (activeRooms.length > 0 && !activeRooms.some(r => r.room_id === selectedRoomId)) {
      setSelectedRoomId(activeRooms[0].room_id);
    }
  }, [dbState.rooms, activeRooms, selectedRoomId]);

  // Set the default "Viewing As" roommate when switching rooms
  const currentRoommates = dbState.roommates.filter(rm => rm.room_id === selectedRoomId && rm.is_active);
  useEffect(() => {
    if (currentRoommates.length > 0) {
      // If current viewing roommate is no longer active or from another room, pick the first one
      const matches = currentRoommates.find(r => r.roommate_id === viewingAsId);
      if (!matches) {
        setViewingAsId(currentRoommates[0].roommate_id);
      }
    } else {
      setViewingAsId(0);
    }
  }, [selectedRoomId, dbState.roommates, currentRoommates, viewingAsId]);

  // Derived state calculations
  const currentRoom = dbState.rooms.find(r => r.room_id === selectedRoomId);
  const currentCycle = dbState.cycles.find(c => c.room_id === selectedRoomId && c.status === 'OPEN');
  
  const currentBalances: RoommateDetailedBalance[] = currentCycle
    ? DataStore.getRoommateBalances(selectedRoomId, currentCycle.cycle_id)
    : [];

  // Database Handler Wrapper Callbacks
  const handleAddExpenseSave = (
    title: string,
    amount: number,
    paidBy: number | null,
    date: string,
    description: string,
    members: Array<{ roommate_id: number; share_amount: number }>
  ) => {
    if (!currentCycle) return;

    if (editingTransaction) {
      DataStore.editTransaction(
        editingTransaction.transaction_id,
        title,
        amount,
        paidBy,
        date,
        description,
        members
      );
    } else {
      DataStore.addTransaction(
        currentCycle.cycle_id,
        title,
        amount,
        paidBy,
        date,
        description,
        members
      );
    }
    setEditingTransaction(null);
  };

  const handleEditExpenseTrigger = (tx: Transaction, members: TransactionMember[]) => {
    setEditingTransaction(tx);
    setEditingMembers(members);
    setIsAddExpenseOpen(true);
  };

  const handleDeleteExpense = (txId: number) => {
    DataStore.deleteTransaction(txId);
  };

  const handleSettleSave = (
    paidBy: number,
    paidTo: number,
    amount: number,
    date: string,
    note: string
  ) => {
    if (!currentCycle) return;
    DataStore.addSettlement(currentCycle.cycle_id, paidBy, paidTo, amount, date, note);
  };

  const handleAddRoommate = (name: string) => {
    DataStore.addRoommate(selectedRoomId, name);
  };

  const handleDeactivateRoommate = (id: number) => {
    DataStore.deactivateRoommate(id);
  };

  const handleReactivateRoommate = (id: number) => {
    DataStore.reactivateRoommate(id);
  };

  const handleStartNewCycle = (name: string, startDate: string, carryForward: boolean) => {
    DataStore.startNewCycle(selectedRoomId, name, startDate, carryForward);
  };

  const handleReopenCycle = (cycleId: number) => {
    DataStore.reopenCycle(selectedRoomId, cycleId);
  };

  const handleRenameRoom = (roomId: number, name: string) => {
    DataStore.renameRoom(roomId, name);
  };

  const handleAddRoom = (name: string) => {
    const newRoom = DataStore.addRoom(name);
    if (newRoom) {
      setSelectedRoomId(newRoom.room_id);
    }
  };

  const handleArchiveRoom = (roomId: number) => {
    DataStore.archiveRoom(roomId);
  };

  const handleDeleteRoom = (roomId: number) => {
    DataStore.deleteRoom(roomId);
    const state = DataStore.getState();
    const remainingRooms = state.rooms.filter(r => !r.is_archived);
    if (remainingRooms.length > 0) {
      setSelectedRoomId(remainingRooms[0].room_id);
    } else {
      setSelectedRoomId(0);
    }
  };

  const handleResetDatabase = () => {
    DataStore.resetDatabase();
    setActiveTab('Dashboard');
  };

  const handleImportDatabase = (json: string) => {
    return DataStore.importDatabase(json);
  };

  // Navigations Definitions
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Hisaab', icon: Landmark },
    { name: 'Expenses', icon: Receipt },
    { name: 'Roommates', icon: Users },
    { name: 'Cycles', icon: RefreshCw },
    { name: 'Settings', icon: Settings },
  ];

  // Check if first-time onboarding setup is needed
  const needsOnboarding = activeRooms.length === 0 || 
    (activeRooms.length === 1 && (
      dbState.roommates.filter(rm => rm.room_id === activeRooms[0].room_id).length === 0 ||
      dbState.cycles.filter(c => c.room_id === activeRooms[0].room_id).length === 0
    ));

  if (needsOnboarding) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased">
        <OnboardingFlow 
          dbState={dbState} 
          onComplete={(roomId) => {
            setSelectedRoomId(roomId);
            setActiveTab('Dashboard');
          }} 
        />
        <OfflineIndicator />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased">
      
      {/* 1. TOP HERO HEADER */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-xs px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger icon */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-500 lg:hidden focus:outline-hidden transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-teal-50 text-teal-600 rounded-lg">
              <Home className="w-5 h-5" />
            </span>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
              Hostel Hisaab
            </h1>
          </div>
        </div>

        {/* Room Switcher Dropdown */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer">
              <span>{currentRoom?.room_name || "Select Room"}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedRoomId}
                onChange={e => {
                  setSelectedRoomId(Number(e.target.value));
                  setActiveTab('Dashboard'); // reset view to dashboard on room switch
                }}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              >
                {activeRooms.map(r => (
                  <option key={r.room_id} value={r.room_id}>
                    {r.room_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={() => {
              const name = prompt("Enter new room name:");
              if (name && name.trim()) {
                handleAddRoom(name.trim());
              }
            }}
            className="p-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-500 hover:text-teal-600 transition-colors hidden sm:block mr-1"
            title="Create New Room"
          >
            <Plus className="w-4.5 h-4.5" />
          </button>

          <PWAInstallButton />
        </div>
      </header>

      {/* 2. BODY SHELL WRAPPER */}
      <div className="grow flex relative">
        
        {/* Desktop Sidebar Panel */}
        <aside className="w-64 border-r border-slate-100 bg-white p-5 hidden lg:flex flex-col gap-1.5 shrink-0">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">Accounting</div>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;
            return (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all duration-150 cursor-pointer ${
                  isActive 
                    ? 'bg-teal-50/60 text-teal-700' 
                    : 'text-slate-500 hover:bg-slate-50/50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-teal-600' : 'text-slate-400 group-hover:text-slate-900'}`} />
                {item.name}
              </button>
            );
          })}

          {/* Persistent Quick Actions */}
          {currentCycle && (
            <div className="mt-auto pt-6 border-t border-slate-100 space-y-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1">Quick Actions</div>
              <button
                onClick={() => {
                  setEditingTransaction(null);
                  setIsAddExpenseOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                Add Expense
              </button>
              <button
                onClick={() => setIsSettleOpen(true)}
                className="w-full flex items-center gap-2.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                <ArrowUpRight className="w-4 h-4" />
                Settle Payment
              </button>
            </div>
          )}
        </aside>

        {/* Mobile Sidebar Collapsible Menu */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-30 lg:hidden flex">
            {/* Backdrop overlay */}
            <div 
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-slate-900/45 backdrop-blur-xs"
            />
            {/* Drawer menu content */}
            <div className="relative w-64 bg-white h-full max-h-screen overflow-y-auto overscroll-contain border-r border-slate-100 p-5 flex flex-col gap-1.5 animate-in slide-in-from-left duration-200">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-50 shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hostel accounting</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 rounded-md text-slate-400 hover:bg-slate-50 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.name;
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      setActiveTab(item.name);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-teal-50/60 text-teal-700' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                    {item.name}
                  </button>
                );
              })}

              {/* Persistent Quick Actions at the bottom of mobile menu */}
              {currentCycle && (
                <div className="mt-auto pt-4 border-t border-slate-100 space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1">Quick Actions</div>
                  <button
                    onClick={() => {
                      setEditingTransaction(null);
                      setIsAddExpenseOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    Add Expense
                  </button>
                  <button
                    onClick={() => {
                      setIsSettleOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    Settle Payment
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Primary Page Canvas Container */}
        <main className="grow p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto overflow-hidden pb-20 lg:pb-8">
          
          {activeRooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center max-w-md mx-auto">
              <div className="p-4 bg-teal-50 text-teal-600 rounded-2xl mb-4">
                <Home className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-950 uppercase tracking-tight">No Active Rooms</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5 mb-3">Hostel Hisaab Workspace</p>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">
                Hisaab organizes roommate expenses under distinct Rooms. Create a room first to begin adding roommates and tracking cycles.
              </p>
              <button
                onClick={() => {
                  const name = prompt("Enter room name (e.g. Room 302, Flat A):");
                  if (name && name.trim()) {
                    handleAddRoom(name.trim());
                  }
                }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer hover:shadow-lg active:scale-98"
              >
                <Plus className="w-4 h-4" />
                Create Your First Room
              </button>
            </div>
          ) : (
            <>
              {/* Dashboard Tab */}
              {activeTab === 'Dashboard' && (
                <DashboardTab
                  currentCycle={currentCycle}
                  roommates={dbState.roommates.filter(rm => rm.room_id === selectedRoomId)}
                  balances={currentBalances}
                  viewingAsId={viewingAsId}
                  setViewingAsId={setViewingAsId}
                  onAddExpenseClick={() => {
                    setEditingTransaction(null);
                    setIsAddExpenseOpen(true);
                  }}
                  onSettleClick={() => setIsSettleOpen(true)}
                  onNewCycleClick={() => {
                    const nextCycleNum = dbState.cycles.filter(c => c.room_id === selectedRoomId).length + 1;
                    handleStartNewCycle(`Cycle ${nextCycleNum}`, new Date().toISOString().split('T')[0], true);
                  }}
                  onSwitchTab={setActiveTab}
                />
              )}

          {/* Hisaab Calculation Tab */}
          {activeTab === 'Hisaab' && (
            <HisaabTab
              roomId={selectedRoomId}
              cycles={dbState.cycles}
              roommates={dbState.roommates}
            />
          )}

          {/* Expenses Tab */}
          {activeTab === 'Expenses' && (
            <ExpensesTab
              roomId={selectedRoomId}
              cycles={dbState.cycles}
              roommates={dbState.roommates}
              transactions={dbState.transactions}
              transactionMembers={dbState.transaction_members}
              onAddExpenseClick={() => {
                setEditingTransaction(null);
                setIsAddExpenseOpen(true);
              }}
              onEditExpenseClick={handleEditExpenseTrigger}
              onDeleteExpenseClick={handleDeleteExpense}
            />
          )}

          {/* Roommates Tab */}
          {activeTab === 'Roommates' && (
            <RoommatesTab
              roomId={selectedRoomId}
              roommates={dbState.roommates}
              onAddRoommate={handleAddRoommate}
              onDeactivateRoommate={handleDeactivateRoommate}
              onReactivateRoommate={handleReactivateRoommate}
            />
          )}

          {/* Cycles Tab */}
          {activeTab === 'Cycles' && (
            <CyclesTab
              roomId={selectedRoomId}
              cycles={dbState.cycles}
              roommates={dbState.roommates}
              onStartNewCycle={handleStartNewCycle}
              onReopenCycle={handleReopenCycle}
            />
          )}

          {/* Settings Tab */}
          {activeTab === 'Settings' && (
            <SettingsTab
              roomId={selectedRoomId}
              rooms={dbState.rooms}
              lastBackupAt={dbState.lastBackupAt}
              onRenameRoom={handleRenameRoom}
              onAddRoom={handleAddRoom}
              onArchiveRoom={handleArchiveRoom}
              onDeleteRoom={handleDeleteRoom}
              onResetDatabase={handleResetDatabase}
              onImportDatabase={handleImportDatabase}
            />
          )}

          </>)}
        </main>
      </div>

      {/* 3. MOBILE FOOTER TAB NAVIGATION */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 shadow-lg py-1.5 px-2 flex justify-around lg:hidden">
        {navItems.slice(0, 3).map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.name;
          return (
            <button
              key={item.name}
              onClick={() => {
                setActiveTab(item.name);
                setIsMobileMenuOpen(false);
              }}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition-all cursor-pointer ${
                isActive ? 'text-teal-600 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-bold tracking-tight uppercase">{item.name}</span>
            </button>
          );
        })}
        {/* Thumb-friendly menu launcher */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition-all cursor-pointer ${
            isMobileMenuOpen ? 'text-teal-600 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] font-bold tracking-tight uppercase">Menu</span>
        </button>
      </nav>

      {/* 4. MODALS BACKDROP CONTAINER */}
      
      {/* A. Add / Edit Expense Modal */}
      {currentCycle && (
        <AddExpenseModal
          isOpen={isAddExpenseOpen}
          onClose={() => {
            setIsAddExpenseOpen(false);
            setEditingTransaction(null);
          }}
          roommates={dbState.roommates.filter(rm => rm.room_id === selectedRoomId)}
          cycleId={currentCycle.cycle_id}
          editingTx={editingTransaction}
          editingMembers={editingMembers}
          onSave={handleAddExpenseSave}
        />
      )}

      {/* B. Settle Payment Modal */}
      {currentCycle && (
        <SettlePaymentModal
          isOpen={isSettleOpen}
          onClose={() => setIsSettleOpen(false)}
          roommates={dbState.roommates.filter(rm => rm.room_id === selectedRoomId)}
          onSave={handleSettleSave}
        />
      )}

      {/* Connectivity Alert for Offline mode */}
      <OfflineIndicator />

    </div>
  );
}

