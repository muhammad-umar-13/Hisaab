import { useState } from 'react';
import { Plus, X, Calendar, RefreshCw, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { Cycle, Roommate, RoommateDetailedBalance } from '../types';
import { DataStore } from '../dataStore';

interface CyclesTabProps {
  roomId: number;
  cycles: Cycle[];
  roommates: Roommate[];
  onStartNewCycle: (name: string, startDate: string, carryForward: boolean) => void;
  onReopenCycle: (cycleId: number) => void;
}

export default function CyclesTab({
  roomId,
  cycles,
  roommates,
  onStartNewCycle,
  onReopenCycle
}: CyclesTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cycleName, setCycleName] = useState('');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [carryForward, setCarryForward] = useState<boolean>(true); // Default to Carry Forward
  
  const [viewingCycleId, setViewingCycleId] = useState<number | null>(null);

  const roomCycles = cycles.filter(c => c.room_id === roomId);
  const openCycle = roomCycles.find(c => c.status === "OPEN");
  const closedCycles = roomCycles.filter(c => c.status === "CLOSED").sort((a, b) => b.cycle_id - a.cycle_id);

  // Calculate total expenses for any cycle helper
  const getCycleTotalExpenses = (cycleId: number) => {
    const balances = DataStore.getRoommateBalances(roomId, cycleId);
    return balances.reduce((sum, b) => sum + b.expenses_share, 0);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cycleName.trim()) return;
    
    onStartNewCycle(cycleName.trim(), startDate, carryForward);
    setIsModalOpen(false);
    setCycleName('');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in-40 duration-200">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Cycles Management</h2>
          <p className="text-xs text-slate-500 mt-1">Roll over calculation cycles and audit previous hostel expenses</p>
        </div>

        <button
          onClick={() => {
            const nextCycleNum = roomCycles.length + 1;
            setCycleName(`Cycle ${nextCycleNum}`);
            setStartDate(new Date().toISOString().split('T')[0]);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm font-semibold shadow-xs hover:shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5" />
          New Cycle
        </button>
      </div>

      {/* 1. CURRENT CYCLE BOX */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Cycle</h3>
        {openCycle ? (
          <div 
            onClick={() => setViewingCycleId(openCycle.cycle_id)}
            className="p-5 bg-white border border-slate-100 rounded-xl shadow-xs hover:shadow-sm transition-all cursor-pointer flex items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span className="text-base font-bold text-slate-800">{openCycle.cycle_name}</span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md text-[10px] font-bold uppercase tracking-wider">
                  Open
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {formatDate(openCycle.start_date)} <span className="mx-1">→</span> Present
              </p>
            </div>

            <div className="flex items-center gap-6 text-right">
              <div>
                <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Expenses</span>
                <span className="text-sm font-extrabold text-slate-800">Rs. {getCycleTotalExpenses(openCycle.cycle_id).toLocaleString('en-IN')}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </div>
          </div>
        ) : (
          <div className="p-6 bg-slate-50/50 border border-dashed border-slate-200 rounded-xl text-center text-sm text-slate-400">
            No active open cycle. Click "New Cycle" to start recording.
          </div>
        )}
      </div>

      {/* 2. PREVIOUS CYCLES LOGS */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Previous Cycles ({closedCycles.length})</h3>
        {closedCycles.length === 0 ? (
          <div className="p-6 bg-slate-50/50 border border-dashed border-slate-100 rounded-xl text-center text-xs text-slate-400">
            No previous cycle archives found.
          </div>
        ) : (
          <div className="space-y-3">
            {closedCycles.map(c => (
              <div 
                key={c.cycle_id}
                onClick={() => setViewingCycleId(c.cycle_id)}
                className="p-4 bg-white border border-slate-100 hover:shadow-sm rounded-xl transition-all cursor-pointer flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-700">{c.cycle_name}</span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 border border-slate-200 rounded-md text-[10px] font-bold uppercase tracking-wider">
                      Closed
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-semibold">
                    {formatDate(c.start_date)} {c.end_date && <> <span className="mx-1">→</span> {formatDate(c.end_date)} </>}
                  </p>
                </div>

                <div className="flex items-center gap-6 text-right">
                  <div>
                    <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Expenses</span>
                    <span className="text-sm font-bold text-slate-700">Rs. {getCycleTotalExpenses(c.cycle_id).toLocaleString('en-IN')}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* A. VIEWING CYCLE BALANCES SUMMARY POPUP/DRAWER */}
      {viewingCycleId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in-40 duration-150">
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {cycles.find(c => c.cycle_id === viewingCycleId)?.cycle_name} Summary
                </h3>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Audited room balances</p>
              </div>
              <button 
                onClick={() => setViewingCycleId(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Total Expenses Row */}
              <div className="p-3 bg-teal-50 border border-teal-100/50 rounded-lg flex items-center justify-between text-teal-800">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Cycle Expenses</span>
                <span className="text-base font-extrabold">Rs. {getCycleTotalExpenses(viewingCycleId).toLocaleString('en-IN')}</span>
              </div>

              {/* Roommate Balances Rows */}
              <div className="space-y-2.5">
                {DataStore.getRoommateBalances(roomId, viewingCycleId).map(b => (
                  <div key={b.roommate_id} className="flex items-center justify-between p-2.5 border border-slate-50 rounded-lg">
                    <span className="text-xs font-bold text-slate-700">{b.name}</span>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-extrabold ${b.current_balance >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {b.current_balance >= 0 ? '+' : '-'}{Math.abs(b.current_balance).toLocaleString('en-IN')}
                      </span>
                      <span className={`px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-wider ${
                        b.current_balance >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {b.current_balance >= 0 ? 'Receive' : 'Pay'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reopen Cycle Trigger if closed */}
              {cycles.find(c => c.cycle_id === viewingCycleId)?.status === "CLOSED" && (
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to REOPEN this cycle? Reopening this cycle will close the currently open cycle of this room.")) {
                      onReopenCycle(viewingCycleId);
                      setViewingCycleId(null);
                    }
                  }}
                  className="w-full mt-2 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-teal-600 transition-colors flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reopen Cycle
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* B. CREATING NEW CYCLE WORKFLOW DIALOG */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in-40 duration-150">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Start New Cycle</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-4">
              {/* Info alert */}
              {openCycle && (
                <div className="p-3 bg-indigo-50 border border-indigo-100/50 rounded-lg flex items-start gap-2.5 text-[11px] text-indigo-700 font-semibold leading-relaxed">
                  <AlertCircle className="w-4.5 h-4.5 shrink-0 text-indigo-400" />
                  <span>Starting a new cycle will close <span className="font-bold">{openCycle.cycle_name}</span>. Its outstanding bills will be archived or carried forward.</span>
                </div>
              )}

              {/* Cycle Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Cycle Name</label>
                <input
                  type="text"
                  required
                  value={cycleName}
                  onChange={e => setCycleName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 font-bold focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Start Date</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 font-bold focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              {/* Carry Forward Options */}
              {openCycle && (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Previous Balance Handling</label>
                  <div className="space-y-2">
                    {/* Option 1: Carry Forward */}
                    <label className="flex items-start gap-2.5 p-2.5 border rounded-lg cursor-pointer hover:bg-slate-50/50 transition-colors text-xs text-slate-600 leading-normal">
                      <input
                        type="radio"
                        name="carryForward"
                        checked={carryForward === true}
                        onChange={() => setCarryForward(true)}
                        className="mt-0.5 text-teal-600 focus:ring-teal-500 border-slate-300"
                      />
                      <div>
                        <span className="block font-bold text-slate-800">Carry Forward Balance</span>
                        Unsettled roommate dues (+/-) will carry over as opening balances in the new cycle.
                      </div>
                    </label>

                    {/* Option 2: Settle Previous */}
                    <label className="flex items-start gap-2.5 p-2.5 border rounded-lg cursor-pointer hover:bg-slate-50/50 transition-colors text-xs text-slate-600 leading-normal">
                      <input
                        type="radio"
                        name="carryForward"
                        checked={carryForward === false}
                        onChange={() => setCarryForward(false)}
                        className="mt-0.5 text-teal-600 focus:ring-teal-500 border-slate-300"
                      />
                      <div>
                        <span className="block font-bold text-slate-800">Settle Previous</span>
                        Resets opening balances to zero (0). Assumes all roommates fully cleared their ledger cash.
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!cycleName.trim()}
                  className="px-4 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 text-xs font-semibold shadow-xs transition-all"
                >
                  Start Cycle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
