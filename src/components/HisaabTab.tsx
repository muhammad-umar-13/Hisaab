import { useState } from 'react';
import { ArrowLeft, ChevronRight, Landmark, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Cycle, Roommate, RoommateDetailedBalance } from '../types';
import { DataStore } from '../dataStore';

interface HisaabTabProps {
  roomId: number;
  cycles: Cycle[];
  roommates: Roommate[];
}

export default function HisaabTab({
  roomId,
  cycles,
  roommates
}: HisaabTabProps) {
  // Find current cycle by default, otherwise pick the first cycle available for this room
  const roomCycles = cycles.filter(c => c.room_id === roomId);
  const openCycle = roomCycles.find(c => c.status === "OPEN");
  
  const [selectedCycleId, setSelectedCycleId] = useState<number>(() => {
    if (openCycle) return openCycle.cycle_id;
    if (roomCycles.length > 0) return roomCycles[0].cycle_id;
    return 0;
  });

  const [selectedRoommateId, setSelectedRoommateId] = useState<number | null>(null);

  // If selectedCycleId is not initialized, choose one
  const targetCycleId = selectedCycleId || openCycle?.cycle_id || (roomCycles[0]?.cycle_id || 0);

  const selectedCycle = cycles.find(c => c.cycle_id === targetCycleId);
  const balances = targetCycleId ? DataStore.getRoommateBalances(roomId, targetCycleId) : [];

  const selectedDetails = selectedRoommateId 
    ? balances.find(b => b.roommate_id === selectedRoommateId)
    : null;

  return (
    <div className="space-y-6 animate-in fade-in-45 duration-200">
      
      {/* Header and Cycle Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Roommate Balances</h2>
          <p className="text-xs text-slate-500 mt-1">Detailed calculation of roommate balances for the selected cycle</p>
        </div>

        {/* Cycle Filter Dropdown */}
        {roomCycles.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cycle:</span>
            <select
              value={targetCycleId}
              onChange={e => {
                setSelectedCycleId(Number(e.target.value));
                setSelectedRoommateId(null); // Clear selected roommate drilldown on cycle change
              }}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 font-semibold focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
            >
              {roomCycles.map(c => (
                <option key={c.cycle_id} value={c.cycle_id}>
                  {c.cycle_name} {c.status === 'OPEN' ? '(Current)' : '(Closed)'}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {roomCycles.length === 0 ? (
        <div className="p-8 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center">
          <p className="text-sm text-slate-500">No calculation data available. Start a cycle first.</p>
        </div>
      ) : !selectedDetails ? (
        
        /* 1. MAIN LIST OF BALANCES */
        <div className="bg-white border border-slate-100 rounded-xl shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Roommate</span>
            <div className="flex gap-16 pr-4">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Balance</span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider w-12 text-center">Action</span>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {balances.map(b => (
              <div 
                key={b.roommate_id}
                onClick={() => setSelectedRoommateId(b.roommate_id)}
                className="flex items-center justify-between px-5 py-4 hover:bg-slate-50/80 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs">
                    {b.name.charAt(0)}
                  </div>
                  <span className="text-sm font-bold text-slate-800">{b.name}</span>
                </div>

                <div className="flex items-center gap-10">
                  <span className={`text-sm font-bold ${b.current_balance >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {b.current_balance >= 0 ? '+' : '-'}{Math.abs(b.current_balance).toLocaleString('en-IN')}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <span className={`w-20 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-center ${
                      b.current_balance >= 0 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                        : 'bg-rose-50 text-rose-700 border border-rose-100'
                    }`}>
                      {b.current_balance >= 0 ? 'Receive' : 'Pay'}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      ) : (

        /* 2. ROOMMATE DRILLDOWN LEDGER DETAIL */
        <div className="bg-white border border-slate-100 rounded-xl shadow-xs overflow-hidden animate-in fade-in-30 slide-in-from-right-4 duration-200">
          
          {/* Drilldown Sub Header */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs">
                {selectedDetails.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{selectedDetails.name} – Balance Details</h3>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">{selectedCycle?.cycle_name}</p>
              </div>
            </div>
            
            <button
              onClick={() => setSelectedRoommateId(null)}
              className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
          </div>

          {/* Ledger details list */}
          <div className="p-5 space-y-4">
            
            {/* Table layout of Ledger components */}
            <div className="space-y-3.5">
              
              {/* Row 1: Opening Balance */}
              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <span className="text-sm font-medium text-slate-500">Opening Balance</span>
                <span className={`text-sm font-bold ${selectedDetails.opening_balance >= 0 ? 'text-slate-700' : 'text-slate-700'}`}>
                  {selectedDetails.opening_balance >= 0 ? '+' : '-'}{Math.abs(selectedDetails.opening_balance).toLocaleString('en-IN')}
                </span>
              </div>

              {/* Row 2: Total Expenses Paid */}
              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <span className="text-sm font-medium text-slate-500">Total Expenses Paid</span>
                <span className="text-sm font-bold text-emerald-600">
                  +{selectedDetails.expenses_paid.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Row 3: His Share */}
              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <span className="text-sm font-medium text-slate-500">His Share</span>
                <span className="text-sm font-bold text-rose-500">
                  -{selectedDetails.expenses_share.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Row 4: Settlements Received */}
              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <span className="text-sm font-medium text-slate-500">Settlements Received</span>
                <span className="text-sm font-bold text-emerald-600">
                  +{selectedDetails.settlements_received.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Row 5: Settlements Paid */}
              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <span className="text-sm font-medium text-slate-500">Settlements Paid</span>
                <span className="text-sm font-bold text-rose-500">
                  -{selectedDetails.settlements_paid.toLocaleString('en-IN')}
                </span>
              </div>

            </div>

            {/* Current Balance highlighted block */}
            <div className={`p-4 rounded-xl border flex items-center justify-between ${
              selectedDetails.current_balance >= 0 
                ? 'bg-emerald-50 border-emerald-100' 
                : 'bg-rose-50 border-rose-100'
            }`}>
              <span className={`text-sm font-bold ${selectedDetails.current_balance >= 0 ? 'text-emerald-800' : 'text-rose-800'}`}>
                Current Balance
              </span>
              <span className={`text-base font-black ${selectedDetails.current_balance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {selectedDetails.current_balance >= 0 ? '+' : '-'}{Math.abs(selectedDetails.current_balance).toLocaleString('en-IN')}
              </span>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
