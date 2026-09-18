import { useState } from 'react';
import { 
  ArrowUpRight, Plus, RefreshCw, Landmark, ArrowRight, 
  UserCheck, ArrowRightLeft, Share2, Copy, Check, X 
} from 'lucide-react';
import { Cycle, Roommate, RoommateDetailedBalance } from '../types';

interface DashboardTabProps {
  currentCycle: Cycle | undefined;
  roommates: Roommate[];
  balances: RoommateDetailedBalance[];
  viewingAsId: number;
  setViewingAsId: (id: number) => void;
  onAddExpenseClick: () => void;
  onSettleClick: () => void;
  onNewCycleClick: () => void;
  onSwitchTab: (tab: string) => void;
}

// Transaction minimization algorithm (greedy debt-simplification)
function calculateSettlements(balancesList: RoommateDetailedBalance[], activeRoommates: Roommate[]) {
  // Filter balances to keep only active roommates to prevent including archived/inactive members
  const activeIds = new Set(activeRoommates.map(r => r.roommate_id));
  const activeBalances = balancesList.filter(b => activeIds.has(b.roommate_id));

  // Clone to avoid side effects
  const creditors = activeBalances
    .filter(b => b.current_balance > 0.01)
    .map(b => ({ name: b.name, amount: b.current_balance }))
    .sort((a, b) => b.amount - a.amount);

  const debtors = activeBalances
    .filter(b => b.current_balance < -0.01)
    .map(b => ({ name: b.name, amount: Math.abs(b.current_balance) }))
    .sort((a, b) => b.amount - a.amount);

  const settlements: { from: string; to: string; amount: number }[] = [];
  let i = 0; // debtor index
  let j = 0; // creditor index

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const payment = Math.min(debtor.amount, creditor.amount);

    if (payment > 0.01) {
      settlements.push({
        from: debtor.name,
        to: creditor.name,
        amount: Math.round(payment * 100) / 100
      });
    }

    debtor.amount -= payment;
    creditor.amount -= payment;

    if (debtor.amount <= 0.01) i++;
    if (creditor.amount <= 0.01) j++;
  }

  return settlements;
}

export default function DashboardTab({
  currentCycle,
  roommates,
  balances,
  viewingAsId,
  setViewingAsId,
  onAddExpenseClick,
  onSettleClick,
  onNewCycleClick,
  onSwitchTab
}: DashboardTabProps) {
  
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentUserBalance = balances.find(b => b.roommate_id === viewingAsId);
  const activeRoommates = roommates.filter(rm => rm.is_active);

  // Total Cycle Expenses
  const totalExpenses = balances.reduce((sum, b) => sum + b.expenses_share, 0);

  const generateReportText = () => {
    if (!currentCycle) return '';
    
    const formattedDate = new Date(currentCycle.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const settlementsList = calculateSettlements(balances, roommates);
    
    let text = `📋 *HOSTEL HISAAB REPORT*\n`;
    text += `🏢 *Cycle:* ${currentCycle.cycle_name}\n`;
    text += `📅 *Started:* ${formattedDate}\n`;
    text += `💰 *Total Cycle Expenses:* Rs. ${totalExpenses.toLocaleString('en-IN')}\n\n`;
    
    text += `👤 *ROOMMATE BALANCES:*\n`;
    text += `--------------------------------\n`;
    balances.forEach(b => {
      const balanceType = b.current_balance >= 0 ? 'Receive' : 'Pay';
      text += `• *${b.name}*:\n`;
      text += `  - Paid: Rs. ${b.expenses_paid.toLocaleString('en-IN')}\n`;
      text += `  - Share: Rs. ${b.expenses_share.toLocaleString('en-IN')}\n`;
      text += `  - Balance: *Rs. ${Math.abs(b.current_balance).toLocaleString('en-IN')}* (${balanceType})\n\n`;
    });
    
    text += `🤝 *SIMPLIFIED SETTLEMENTS:*\n`;
    text += `--------------------------------\n`;
    if (settlementsList.length === 0) {
      text += `🎉 All settled up! No active dues.\n`;
    } else {
      settlementsList.forEach(s => {
        text += `• *${s.from}* pays Rs. *${s.amount.toLocaleString('en-IN')}* to *${s.to}*\n`;
      });
    }
    
    text += `\n_Generated via Hostel Hisaab App_ 🚀`;
    return text;
  };

  const handleCopyClick = () => {
    const text = generateReportText();
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err);
      });
  };

  const handleNativeShare = async () => {
    const text = generateReportText();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Hisaab Report - ${currentCycle?.cycle_name}`,
          text: text,
        });
      } catch (err) {
        console.log('User cancelled share or API error', err);
      }
    } else {
      handleCopyClick();
      alert('Report copied to clipboard! You can now paste it in WhatsApp or any messaging app.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-40 duration-200">
      
      {/* Onboarding Wizard or Current Cycle Widget */}
      {activeRoommates.length === 0 ? (
        <div className="p-6 sm:p-8 bg-white border border-slate-100 rounded-2xl shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-teal-50 text-teal-600 rounded-xl">
              <UserCheck className="w-6 h-6" />
            </span>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Configure Your New Room</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Empty Room Onboarding</p>
            </div>
          </div>

          <p className="text-sm text-slate-500 leading-relaxed max-w-xl">
            Welcome! To start calculating roommate splits, managing accounts, and simplifying hostel payments, follow these two simple steps:
          </p>

          <div className="grid md:grid-cols-2 gap-6 pt-2">
            {/* Step 1: Add Roommates */}
            <div className="p-5 border-2 border-teal-500 bg-teal-50/10 rounded-xl relative overflow-hidden flex flex-col justify-between">
              <span className="absolute top-3 right-3 text-2xl font-black text-teal-600/15">01</span>
              <div>
                <h4 className="text-sm font-extrabold text-teal-850 uppercase tracking-wider mb-1">Step 1: Add Roommates</h4>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  Register at least 2 active roommates who are staying in this room to record who owes whom.
                </p>
              </div>
              <button
                onClick={() => onSwitchTab('Roommates')}
                className="w-full inline-flex items-center justify-center gap-2 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Roommates Now
              </button>
            </div>

            {/* Step 2: Start First Cycle */}
            <div className="p-5 border border-slate-100 bg-slate-50/50 rounded-xl relative overflow-hidden flex flex-col justify-between opacity-60">
              <span className="absolute top-3 right-3 text-2xl font-black text-slate-300">02</span>
              <div>
                <h4 className="text-sm font-extrabold text-slate-600 uppercase tracking-wider mb-1">Step 2: Start First Cycle</h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Open your first accounting cycle (e.g. September billing) to start recording expenses.
                </p>
              </div>
              <button
                disabled
                className="w-full inline-flex items-center justify-center gap-2 py-2 bg-slate-200 text-slate-400 rounded-lg text-xs font-bold cursor-not-allowed"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Locked (Add Roommates First)
              </button>
            </div>
          </div>
        </div>
      ) : !currentCycle ? (
        <div className="p-6 sm:p-8 bg-white border border-slate-100 rounded-2xl shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-teal-50 text-teal-600 rounded-xl">
              <Landmark className="w-6 h-6" />
            </span>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Activate Your Billing Cycle</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Empty Room Onboarding</p>
            </div>
          </div>

          <p className="text-sm text-slate-500 leading-relaxed max-w-xl">
            Great job! You have registered <b className="text-slate-800">{activeRoommates.length} active roommates</b>. Let's start a tracking cycle to log your shared expenses.
          </p>

          <div className="grid md:grid-cols-2 gap-6 pt-2">
            {/* Step 1: Add Roommates */}
            <div className="p-5 border border-slate-100 bg-slate-50/40 rounded-xl relative overflow-hidden flex flex-col justify-between">
              <span className="absolute top-3 right-3 text-2xl font-black text-slate-200">01</span>
              <div>
                <h4 className="text-sm font-extrabold text-slate-500 uppercase tracking-wider mb-1">Step 1: Add Roommates</h4>
                <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs mt-1 mb-4">
                  <Check className="w-4 h-4" />
                  <span>{activeRoommates.length} Roommates Added</span>
                </div>
              </div>
              <button
                onClick={() => onSwitchTab('Roommates')}
                className="w-full inline-flex items-center justify-center gap-2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                <span>Manage Roommates</span>
              </button>
            </div>

            {/* Step 2: Start First Cycle */}
            <div className="p-5 border-2 border-teal-500 bg-teal-50/10 rounded-xl relative overflow-hidden flex flex-col justify-between">
              <span className="absolute top-3 right-3 text-2xl font-black text-teal-600/15">02</span>
              <div>
                <h4 className="text-sm font-extrabold text-teal-800 uppercase tracking-wider mb-1">Step 2: Start First Cycle</h4>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  Open your first cycle to start splitting meals, bills, rent, and hosteller dues.
                </p>
              </div>
              <button
                onClick={onNewCycleClick}
                className="w-full inline-flex items-center justify-center gap-2 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs hover:shadow-md"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Start Cycle Now
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-5 bg-white border border-slate-100 rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Current Cycle</div>
            <h3 className="text-xl font-bold text-slate-900">{currentCycle.cycle_name}</h3>
            <p className="text-sm text-slate-500 mt-1">
              {new Date(currentCycle.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              <span className="mx-2 text-slate-300">→</span>
              Present
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs font-bold uppercase tracking-wider">
              {currentCycle.status}
            </span>
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
              title="Share Report"
              id="btn-share-report"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Report</span>
            </button>
            {/* View As select box to customize "Your Balance" card context */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-600">
              <UserCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Viewing As:</span>
              <select
                value={viewingAsId}
                onChange={e => setViewingAsId(Number(e.target.value))}
                className="bg-transparent border-none text-slate-800 font-bold focus:outline-hidden cursor-pointer"
              >
                {activeRoommates.map(rm => (
                  <option key={rm.roommate_id} value={rm.roommate_id}>
                    {rm.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Main Stats Cards Grid */}
      {currentCycle && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Total Expenses */}
          <div className="p-5 bg-white border border-slate-100 rounded-xl shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Landmark className="w-5 h-5" />
              </span>
            </div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Expenses</div>
            <div className="text-xl font-bold text-slate-900">Rs. {totalExpenses.toLocaleString('en-IN')}</div>
          </div>

          {/* Card 2: You Paid */}
          <div className="p-5 bg-white border border-slate-100 rounded-xl shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <ArrowUpRight className="w-5 h-5" />
              </span>
            </div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">You Paid</div>
            <div className="text-xl font-bold text-slate-900">
              Rs. {(currentUserBalance?.expenses_paid || 0).toLocaleString('en-IN')}
            </div>
          </div>

          {/* Card 3: Your Share */}
          <div className="p-5 bg-white border border-slate-100 rounded-xl shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <Landmark className="w-5 h-5" />
              </span>
            </div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Your Share</div>
            <div className="text-xl font-bold text-slate-900">
              Rs. {(currentUserBalance?.expenses_share || 0).toLocaleString('en-IN')}
            </div>
          </div>

          {/* Card 4: Your Balance */}
          <div className="p-5 bg-white border border-slate-100 rounded-xl shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className={`p-2 rounded-lg ${
                (currentUserBalance?.current_balance || 0) >= 0 
                  ? 'bg-emerald-50 text-emerald-600' 
                  : 'bg-rose-50 text-rose-600'
              }`}>
                <Landmark className="w-5 h-5" />
              </span>
            </div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Your Balance</div>
            <div className={`text-xl font-bold ${
              (currentUserBalance?.current_balance || 0) >= 0 ? 'text-emerald-600' : 'text-rose-500'
            }`}>
              {(currentUserBalance?.current_balance || 0) >= 0 ? '+' : '-'} Rs. {Math.abs(currentUserBalance?.current_balance || 0).toLocaleString('en-IN')}
            </div>
          </div>

        </div>
      )}

      {/* Roommate Balances Preview Box */}
      {currentCycle && (
        <div className="bg-white border border-slate-100 rounded-xl shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Roommate Balances</h4>
            <button
              onClick={() => onSwitchTab('Hisaab')}
              className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 transition-colors"
            >
              View All
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {balances.map(b => {
              const isActive = roommates.find(rm => rm.roommate_id === b.roommate_id)?.is_active;
              if (!isActive) return null; // Only show active roommates on dashboard balances list

              return (
                <div key={b.roommate_id} className="flex items-center justify-between p-3 border border-slate-50 rounded-lg hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 uppercase text-xs">
                      {b.name.charAt(0)}
                    </div>
                    <span className="text-sm font-bold text-slate-800">{b.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-sm font-bold ${b.current_balance >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {b.current_balance >= 0 ? '+' : '-'}{Math.abs(b.current_balance).toLocaleString('en-IN')}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      b.current_balance >= 0 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                        : 'bg-rose-50 text-rose-700 border border-rose-100'
                    }`}>
                      {b.current_balance >= 0 ? 'Receive' : 'Pay'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Simplified Settlement Summary Card */}
      {currentCycle && (
        <div className="bg-white border border-slate-100 rounded-xl shadow-xs p-5">
          <div className="flex items-center gap-2.5 mb-4 pb-2 border-b border-slate-50">
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <ArrowRightLeft className="w-4 h-4" />
            </span>
            <div>
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Settlement Summary</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Who Owes Whom (Simplified Dues)</p>
            </div>
          </div>

          {calculateSettlements(balances, roommates).length === 0 ? (
            <div className="py-6 text-center border border-dashed border-slate-100 rounded-xl bg-slate-50/20">
              <span className="text-xl">🎉</span>
              <p className="text-sm font-bold text-slate-700 mt-1">All settled up!</p>
              <p className="text-xs text-slate-400 mt-0.5">There are no active dues in this cycle.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {calculateSettlements(balances, roommates).map((s, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between p-3 bg-slate-50/40 border border-slate-100/50 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-slate-800 text-sm">{s.from}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 px-1.5 py-0.5 rounded-md tracking-wider">
                      pays
                    </span>
                    <span className="font-extrabold text-slate-800 text-sm">{s.to}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-rose-500 text-sm">Rs. {s.amount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}


      {/* Dynamic Floating Action Button (FAB) */}
      {currentCycle && (
        <button
          onClick={onAddExpenseClick}
          className="fixed bottom-20 right-5 z-40 sm:bottom-24 sm:right-6 lg:bottom-8 lg:right-8 p-4 bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95 duration-150 cursor-pointer flex items-center justify-center group"
          title="Add Expense"
          id="fab-add-expense"
        >
          <Plus className="w-6 h-6 transition-transform group-hover:rotate-90" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-out text-sm font-bold ml-0 group-hover:ml-2 whitespace-nowrap hidden md:inline">
            Add Expense
          </span>
        </button>
      )}

      {/* Share Report Preview Modal */}
      {isShareModalOpen && currentCycle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Share2 className="w-4.5 h-4.5 text-teal-600" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Share Hisaab Report</h3>
              </div>
              <button 
                onClick={() => setIsShareModalOpen(false)}
                className="p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-md transition-colors cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Modal Content / Preview Area */}
            <div className="p-5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">WhatsApp / Text Preview</p>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 h-64 overflow-y-auto font-mono text-[11px] text-slate-700 whitespace-pre-wrap leading-relaxed select-all">
                {generateReportText()}
              </div>
              <p className="text-[9px] text-slate-400 mt-2 italic">
                Note: Formatting is optimized with *bold* for WhatsApp, Telegram, and Discord.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button
                onClick={handleCopyClick}
                className="grow flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-200 hover:border-teal-500 hover:bg-teal-50/10 text-slate-700 hover:text-teal-700 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600 animate-in zoom-in duration-150" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-400" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>

              <button
                onClick={handleNativeShare}
                className="grow flex items-center justify-center gap-2 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Direct</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
