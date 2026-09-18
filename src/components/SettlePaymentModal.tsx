import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Roommate } from '../types';

interface SettlePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  roommates: Roommate[];
  onSave: (paidBy: number, paidTo: number, amount: number, date: string, note: string) => void;
}

export default function SettlePaymentModal({
  isOpen,
  onClose,
  roommates,
  onSave
}: SettlePaymentModalProps) {
  const [paidBy, setPaidBy] = useState<string>('');
  const [paidTo, setPaidTo] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const activeRms = roommates.filter(rm => rm.is_active);
      setPaidBy(activeRms[0]?.roommate_id.toString() || '');
      setPaidTo(activeRms[1]?.roommate_id.toString() || '');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setNote('');
      setError(null);
    }
  }, [isOpen, roommates]);

  if (!isOpen) return null;

  const activeRoommates = roommates.filter(rm => rm.is_active);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const fromId = parseInt(paidBy);
    const toId = parseInt(paidTo);
    const numAmt = parseFloat(amount);

    if (isNaN(fromId) || isNaN(toId)) {
      setError("Please select both roommate fields.");
      return;
    }

    if (fromId === toId) {
      setError("Sender (Paid By) and Receiver (Paid To) cannot be the same person.");
      return;
    }

    if (isNaN(numAmt) || numAmt <= 0) {
      setError("Please enter a valid payment amount greater than 0.");
      return;
    }

    onSave(fromId, toId, numAmt, date, note);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl animate-in fade-in-50 zoom-in-95 duration-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">Record Settlement Payment</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2.5 p-3 bg-rose-50 border border-rose-100 rounded-lg text-xs font-semibold text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* From & To Dropdowns */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">From (Paid By)</label>
              <select
                value={paidBy}
                onChange={e => setPaidBy(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm"
              >
                {activeRoommates.map(rm => (
                  <option key={rm.roommate_id} value={rm.roommate_id}>
                    {rm.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">To (Paid To)</label>
              <select
                value={paidTo}
                onChange={e => setPaidTo(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm"
              >
                {activeRoommates.map(rm => (
                  <option key={rm.roommate_id} value={rm.roommate_id}>
                    {rm.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Amount (Rs.)</label>
              <input
                type="number"
                min="1"
                step="any"
                required
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="e.g. 1000"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm font-semibold"
              />
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

          {/* Note */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Note (Optional)</label>
            <textarea
              rows={2}
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="e.g. Paid electricity dues, account transfer..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm resize-none"
            />
          </div>

          {/* Actions */}
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
              className="px-5 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm font-medium shadow-xs hover:shadow-md transition-all duration-150"
            >
              Record Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
