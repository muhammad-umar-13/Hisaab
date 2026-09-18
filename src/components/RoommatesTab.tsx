import { useState } from 'react';
import { Plus, X, UserMinus, UserCheck, Trash2, ShieldAlert } from 'lucide-react';
import { Roommate } from '../types';

interface RoommatesTabProps {
  roomId: number;
  roommates: Roommate[];
  onAddRoommate: (name: string) => void;
  onDeactivateRoommate: (id: number) => void;
  onReactivateRoommate: (id: number) => void;
}

export default function RoommatesTab({
  roomId,
  roommates,
  onAddRoommate,
  onDeactivateRoommate,
  onReactivateRoommate
}: RoommatesTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [isInactiveExpanded, setIsInactiveExpanded] = useState(false);

  // Filter roommates for this specific room
  const roomRoommates = roommates.filter(r => r.room_id === roomId);
  const activeRoommates = roomRoommates.filter(r => r.is_active);
  const inactiveRoommates = roomRoommates.filter(r => !r.is_active);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddRoommate(name.trim());
    setName('');
    setIsModalOpen(false);
  };

  const formatDate = (isoStr: string) => {
    return new Date(isoStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in-40 duration-200">
      
      {/* Header and Add Roommate */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Roommates</h2>
          <p className="text-xs text-slate-500 mt-1">Manage current members and historical records</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm font-semibold shadow-xs hover:shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5" />
          Add Roommate
        </button>
      </div>

      {/* Active Roommates List */}
      <div className="bg-white border border-slate-100 rounded-xl shadow-xs p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Active Roommates ({activeRoommates.length})</h3>

        {activeRoommates.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm border border-dashed border-slate-100 rounded-xl">
            No active roommates. Please add roommates to start split calculations.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeRoommates.map(rm => (
              <div 
                key={rm.roommate_id} 
                className="flex items-center justify-between p-4 border border-slate-50 rounded-xl hover:shadow-xs transition-shadow bg-slate-50/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm uppercase">
                    {rm.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{rm.name}</h4>
                    <span className="text-[10px] text-slate-400 font-medium">Joined: {formatDate(rm.created_at)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md text-[10px] font-bold uppercase tracking-wider">
                    Active
                  </span>
                  
                  {/* Deactivate Button */}
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to make ${rm.name} inactive? This preserves their past cycle bills, but removes them from future splits.`)) {
                        onDeactivateRoommate(rm.roommate_id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Deactivate Roommate"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Inactive Roommates Collapsible Section */}
      <div className="bg-white border border-slate-100 rounded-xl shadow-xs overflow-hidden">
        <button
          onClick={() => setIsInactiveExpanded(!isInactiveExpanded)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50/50 transition-colors text-left"
        >
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Inactive Roommates ({inactiveRoommates.length})</h3>
          <span className="text-xs font-semibold text-teal-600 hover:text-teal-700">
            {isInactiveExpanded ? "Collapse" : "Expand"}
          </span>
        </button>

        {isInactiveExpanded && (
          <div className="p-5 border-t border-slate-50 space-y-4">
            {inactiveRoommates.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No inactive roommates found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inactiveRoommates.map(rm => (
                  <div 
                    key={rm.roommate_id} 
                    className="flex items-center justify-between p-4 border border-slate-100 rounded-xl bg-slate-50/40"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-sm uppercase">
                        {rm.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-700">{rm.name}</h4>
                        <div className="flex flex-col text-[10px] text-slate-400 font-medium">
                          <span>Joined: {formatDate(rm.created_at)}</span>
                          {rm.deleted_at && <span>Left: {formatDate(rm.deleted_at)}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-slate-100 text-slate-500 border border-slate-200 rounded-md text-[10px] font-bold uppercase tracking-wider">
                        Inactive
                      </span>
                      
                      {/* Reactivate Button */}
                      <button
                        onClick={() => onReactivateRoommate(rm.roommate_id)}
                        className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                        title="Reactivate Roommate"
                      >
                        <UserCheck className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Inline Modal for Add Roommate */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add Roommate</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Roommate Name</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Umar, Ali, Hamza..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

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
                  disabled={!name.trim()}
                  className="px-4 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 text-xs font-semibold shadow-xs transition-all"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
