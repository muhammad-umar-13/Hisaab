import { useState } from 'react';
import { Plus, Edit2, Trash2, Calendar, FileText, User, Users, AlertCircle } from 'lucide-react';
import { Cycle, Roommate, Transaction, TransactionMember } from '../types';

interface ExpensesTabProps {
  roomId: number;
  cycles: Cycle[];
  roommates: Roommate[];
  transactions: Transaction[];
  transactionMembers: TransactionMember[];
  onAddExpenseClick: () => void;
  onEditExpenseClick: (tx: Transaction, members: TransactionMember[]) => void;
  onDeleteExpenseClick: (txId: number) => void;
}

export default function ExpensesTab({
  roomId,
  cycles,
  roommates,
  transactions,
  transactionMembers,
  onAddExpenseClick,
  onEditExpenseClick,
  onDeleteExpenseClick
}: ExpensesTabProps) {
  const roomCycles = cycles.filter(c => c.room_id === roomId);
  const openCycle = roomCycles.find(c => c.status === "OPEN");

  // Filter state
  const [selectedCycleId, setSelectedCycleId] = useState<number>(() => {
    if (openCycle) return openCycle.cycle_id;
    if (roomCycles.length > 0) return roomCycles[0].cycle_id;
    return 0;
  });

  const [timeFilter, setTimeFilter] = useState<'all' | 'week' | 'month'>('all');
  const [selectedTxId, setSelectedTxId] = useState<number | null>(null);

  const targetCycleId = selectedCycleId || openCycle?.cycle_id || (roomCycles[0]?.cycle_id || 0);

  // 1. Get transaction list for selected cycle and room, filter out deleted ones
  const filteredTxs = transactions.filter(t => {
    if (t.is_deleted) return false;
    if (t.cycle_id !== targetCycleId) return false;

    // Apply Time Filter (Week/Month)
    if (timeFilter === 'all') return true;

    const txDate = new Date(t.transaction_date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - txDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (timeFilter === 'week') {
      return diffDays <= 7;
    } else if (timeFilter === 'month') {
      return diffDays <= 30;
    }

    return true;
  }).sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime());

  // Pick first transaction by default to display split details below
  const activeTxId = selectedTxId || filteredTxs[0]?.transaction_id || null;
  const activeTx = filteredTxs.find(t => t.transaction_id === activeTxId);

  const activeTxMembers = activeTx 
    ? transactionMembers.filter(m => m.transaction_id === activeTx.transaction_id)
    : [];

  const getRoommateName = (id: number | null) => {
    if (id === null) return "General Room Fund";
    const found = roommates.find(rm => rm.roommate_id === id);
    return found ? found.name : "Unknown Roommate";
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleEditClick = (tx: Transaction) => {
    const txMembers = transactionMembers.filter(m => m.transaction_id === tx.transaction_id);
    onEditExpenseClick(tx, txMembers);
  };

  return (
    <div className="space-y-6 animate-in fade-in-40 duration-200">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Expenses</h2>
          <p className="text-xs text-slate-500 mt-1">Track room bills, grocery splits, and hostel expenses</p>
        </div>

        <button
          onClick={onAddExpenseClick}
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm font-semibold shadow-xs hover:shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5" />
          Add Expense
        </button>
      </div>

      {/* Filters and Sub Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-xs">
        {/* Week/Month Buttons */}
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setTimeFilter('all')}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${timeFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
          >
            All
          </button>
          <button
            onClick={() => setTimeFilter('week')}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${timeFilter === 'week' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
          >
            This Week
          </button>
          <button
            onClick={() => setTimeFilter('month')}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${timeFilter === 'month' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
          >
            This Month
          </button>
        </div>

        {/* Cycle Dropdown */}
        {roomCycles.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cycle:</span>
            <select
              value={targetCycleId}
              onChange={e => {
                setSelectedCycleId(Number(e.target.value));
                setSelectedTxId(null); // Clear selected details on cycle change
              }}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-teal-500/10"
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

      {/* Main Content Grid: Left List, Right details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 1. EXPENSES LIST TABLE (2-columns wide) */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-xl shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>Date & Title</span>
            <div className="flex gap-12 pr-4">
              <span>Amount</span>
              <span className="w-16">Paid By</span>
            </div>
          </div>

          {filteredTxs.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              No expenses recorded in this view.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredTxs.map(t => (
                <div
                  key={t.transaction_id}
                  onClick={() => setSelectedTxId(t.transaction_id)}
                  className={`flex items-center justify-between px-5 py-4 cursor-pointer transition-colors ${activeTxId === t.transaction_id ? 'bg-teal-50/20' : 'hover:bg-slate-50/50'}`}
                >
                  <div>
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{formatDate(t.transaction_date)}</div>
                    <div className="text-sm font-bold text-slate-800 mt-0.5">{t.title}</div>
                  </div>

                  <div className="flex items-center gap-12">
                    <span className="text-sm font-bold text-slate-800">Rs. {t.amount.toLocaleString('en-IN')}</span>
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 border border-slate-100 px-2.5 py-1 rounded-md w-20 text-center truncate">
                      {getRoommateName(t.paid_by)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. TRANSACTION DRILLDOWN DETAILS (1-column wide) */}
        <div className="bg-white border border-slate-100 rounded-xl shadow-xs p-5 self-start space-y-4">
          {activeTx ? (
            <div className="space-y-4 animate-in fade-in-30 duration-200">
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{activeTx.title}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(activeTx.transaction_date)}
                  </p>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEditClick(activeTx)}
                    className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
                    title="Edit Transaction"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this expense split?")) {
                        onDeleteExpenseClick(activeTx.transaction_id);
                        setSelectedTxId(null);
                      }
                    }}
                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                    title="Delete Transaction"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Amount and Sub stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Amount</span>
                  <span className="text-base font-bold text-slate-950">Rs. {activeTx.amount.toLocaleString('en-IN')}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Paid By</span>
                  <span className="text-sm font-bold text-slate-800 truncate block">{getRoommateName(activeTx.paid_by)}</span>
                </div>
              </div>

              {/* Description */}
              {activeTx.description && (
                <div className="flex items-start gap-2 p-3 bg-amber-50/30 border border-amber-100/30 rounded-lg text-xs text-slate-600">
                  <FileText className="w-4 h-4 shrink-0 text-slate-400 mt-0.5" />
                  <span>{activeTx.description}</span>
                </div>
              )}

              {/* Shares Breakdown Table */}
              <div className="space-y-3.5 pt-3">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>Roommate Split Shares</span>
                </div>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {activeTxMembers.map(m => {
                    const name = getRoommateName(m.roommate_id);
                    return (
                      <div key={m.transaction_member_id} className="flex items-center justify-between p-2 bg-slate-50/50 rounded-lg border border-slate-50">
                        <span className="text-xs font-semibold text-slate-700">{name}</span>
                        <span className="text-xs font-bold text-slate-900">Rs. {m.share_amount.toLocaleString('en-IN')}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center p-8 text-slate-400 text-xs">
              <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              Select an expense from the list to view split details and shares.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
