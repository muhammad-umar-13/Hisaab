import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Roommate, Transaction, TransactionMember } from '../types';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  roommates: Roommate[];
  cycleId: number;
  editingTx?: Transaction | null;
  editingMembers?: TransactionMember[];
  onSave: (
    title: string,
    amount: number,
    paidBy: number | null,
    date: string,
    description: string,
    members: Array<{ roommate_id: number; share_amount: number }>
  ) => void;
}

export default function AddExpenseModal({
  isOpen,
  onClose,
  roommates,
  cycleId,
  editingTx,
  editingMembers,
  onSave
}: AddExpenseModalProps) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [paidBy, setPaidBy] = useState<string>('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [sharingType, setSharingType] = useState<'equal' | 'custom'>('equal');
  
  // List of roommates participating
  const [participants, setParticipants] = useState<Record<number, boolean>>({});
  // Custom share amounts
  const [customShares, setCustomShares] = useState<Record<number, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (editingTx) {
        setTitle(editingTx.title);
        setAmount(editingTx.amount.toString());
        setPaidBy(editingTx.paid_by?.toString() || '');
        setDate(editingTx.transaction_date);
        setDescription(editingTx.description || '');
        
        // Check if shares are custom or equal
        const totalParticipants = roommates.filter(rm => rm.is_active);
        const shares = editingMembers || [];
        const isCustom = shares.some((s, idx) => {
          if (idx === 0) return false;
          return s.share_amount !== shares[0].share_amount;
        });

        setSharingType(isCustom ? 'custom' : 'equal');

        const activeParts: Record<number, boolean> = {};
        const shareMap: Record<number, string> = {};
        
        roommates.forEach(r => {
          const found = shares.find(s => s.roommate_id === r.roommate_id);
          activeParts[r.roommate_id] = !!found;
          shareMap[r.roommate_id] = found ? found.share_amount.toString() : '';
        });

        setParticipants(activeParts);
        setCustomShares(shareMap);
      } else {
        // Defaults for new expense
        setTitle('');
        setAmount('');
        // select first active roommate by default
        const activeRms = roommates.filter(rm => rm.is_active);
        setPaidBy(activeRms[0]?.roommate_id.toString() || '');
        setDate(new Date().toISOString().split('T')[0]);
        setDescription('');
        setSharingType('equal');

        const initialParts: Record<number, boolean> = {};
        roommates.forEach(rm => {
          initialParts[rm.roommate_id] = rm.is_active;
        });
        setParticipants(initialParts);
        setCustomShares({});
      }
    }
  }, [isOpen, editingTx, editingMembers, roommates]);

  if (!isOpen) return null;

  const activeRoommates = roommates.filter(rm => rm.is_active);
  const selectedParticipantIds = Object.keys(participants)
    .map(Number)
    .filter(id => participants[id]);

  // Calculate automated splits if equal
  const numParticipants = selectedParticipantIds.length;
  const numAmount = parseFloat(amount) || 0;
  let autoShareAmount = 0;
  if (sharingType === 'equal' && numParticipants > 0 && numAmount > 0) {
    autoShareAmount = Math.round((numAmount / numParticipants) * 100) / 100;
  }

  // Calculate sum of custom shares
  const customSum = selectedParticipantIds.reduce((sum, rId) => {
    return sum + (parseFloat(customShares[rId] || '0') || 0);
  }, 0);

  const isShareValid = () => {
    if (numAmount <= 0) return false;
    if (numParticipants === 0) return false;
    if (sharingType === 'equal') return true;
    
    // Custom split must exactly equal the total amount (allowing +/- 1 Rs for roundoff precision)
    return Math.abs(customSum - numAmount) < 0.1;
  };

  const handleParticipantToggle = (id: number) => {
    setParticipants(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCustomShareChange = (id: number, val: string) => {
    setCustomShares(prev => ({ ...prev, [id]: val }));
  };

  const handleAmountChange = (val: string) => {
    setAmount(val);
    if (sharingType === 'equal') return;
    
    // Clear out custom shares if they want to distribute freshly
    const num = parseFloat(val) || 0;
    if (num > 0 && selectedParticipantIds.length > 0) {
      const splitVal = Math.round((num / selectedParticipantIds.length) * 100) / 100;
      const freshShares: Record<number, string> = {};
      selectedParticipantIds.forEach(id => {
        freshShares[id] = splitVal.toString();
      });
      setCustomShares(freshShares);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || !isShareValid()) return;

    const finalMembers = selectedParticipantIds.map(rId => {
      let share = 0;
      if (sharingType === 'equal') {
        share = autoShareAmount;
      } else {
        share = parseFloat(customShares[rId] || '0') || 0;
      }
      return { roommate_id: rId, share_amount: share };
    });

    onSave(
      title,
      parseFloat(amount),
      paidBy ? parseInt(paidBy) : null,
      date,
      description,
      finalMembers
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg overflow-hidden bg-white rounded-xl shadow-2xl animate-in fade-in-50 zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">
            {editingTx ? 'Edit Expense' : 'Add Expense'}
          </h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Title & Amount */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Electricity, Grocery, Rent..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Amount (Rs.)</label>
              <input
                type="number"
                min="1"
                step="any"
                required
                value={amount}
                onChange={e => handleAmountChange(e.target.value)}
                placeholder="e.g. 4000"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm font-medium"
              />
            </div>
          </div>

          {/* Paid By & Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Paid By</label>
              <select
                value={paidBy}
                onChange={e => setPaidBy(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm"
              >
                <option value="">(No roommate - general)</option>
                {activeRoommates.map(rm => (
                  <option key={rm.roommate_id} value={rm.roommate_id}>
                    {rm.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Description (Optional)</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Gas cylinder, August unit readings..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm"
            />
          </div>

          {/* Sharing Split Type */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">Sharing Mode</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="sharingType"
                  checked={sharingType === 'equal'}
                  onChange={() => setSharingType('equal')}
                  className="w-4 h-4 text-teal-600 focus:ring-teal-500 border-slate-300"
                />
                Equal (all roommates)
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="sharingType"
                  checked={sharingType === 'custom'}
                  onChange={() => {
                    setSharingType('custom');
                    // auto init with equal splits
                    if (numAmount > 0 && selectedParticipantIds.length > 0) {
                      const splitVal = Math.round((numAmount / selectedParticipantIds.length) * 100) / 100;
                      const freshShares: Record<number, string> = {};
                      selectedParticipantIds.forEach(id => {
                        freshShares[id] = splitVal.toString();
                      });
                      setCustomShares(freshShares);
                    }
                  }}
                  className="w-4 h-4 text-teal-600 focus:ring-teal-500 border-slate-300"
                />
                Custom (set amounts)
              </label>
            </div>
          </div>

          {/* Participants Checklist */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">Participants</label>
            <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
              {activeRoommates.map(rm => (
                <label 
                  key={rm.roommate_id} 
                  className="flex items-center gap-2 py-1 text-sm text-slate-700 cursor-pointer hover:text-slate-950 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={!!participants[rm.roommate_id]}
                    onChange={() => handleParticipantToggle(rm.roommate_id)}
                    className="rounded-sm text-teal-600 focus:ring-teal-500 border-slate-300"
                  />
                  <span>{rm.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Custom Split Inputs */}
          {sharingType === 'custom' && selectedParticipantIds.length > 0 && (
            <div className="space-y-2 border-t border-slate-100 pt-3">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">Specify Custom Splits (Rs.)</label>
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {selectedParticipantIds.map(rId => {
                  const rName = roommates.find(r => r.roommate_id === rId)?.name || 'Roommate';
                  return (
                    <div key={rId} className="flex items-center justify-between gap-4">
                      <span className="text-sm text-slate-700 font-medium">{rName}</span>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1.5 text-xs text-slate-400 font-medium">Rs.</span>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={customShares[rId] || ''}
                          onChange={e => handleCustomShareChange(rId, e.target.value)}
                          className="w-32 pl-8 pr-3 py-1 text-right border border-slate-200 rounded-md text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-teal-500 text-sm font-medium"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Sum balance check */}
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs font-semibold">
                <span className="text-slate-500">Sum of splits: Rs. {customSum.toFixed(2)}</span>
                <span className={Math.abs(customSum - numAmount) < 0.1 ? "text-teal-600" : "text-rose-500 flex items-center gap-1"}>
                  {Math.abs(customSum - numAmount) < 0.1 ? (
                    "✓ Matches Total"
                  ) : (
                    <>
                      <AlertCircle className="w-3.5 h-3.5" />
                      Difference: Rs. {(numAmount - customSum).toFixed(2)}
                    </>
                  )}
                </span>
              </div>
            </div>
          )}

          {/* Equal split preview */}
          {sharingType === 'equal' && numParticipants > 0 && numAmount > 0 && (
            <div className="p-3 bg-teal-50/50 rounded-lg border border-teal-100 text-xs text-teal-800 font-medium">
              Each of the {numParticipants} participants will share <span className="font-semibold text-teal-900">Rs. {autoShareAmount.toFixed(2)}</span>.
            </div>
          )}

          {/* Submit Action Bar */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isShareValid() || !title}
              className="px-5 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-xs hover:shadow-md transition-all duration-150"
            >
              {editingTx ? 'Save Changes' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
