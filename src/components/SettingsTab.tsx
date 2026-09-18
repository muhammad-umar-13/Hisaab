import { useState, useRef } from 'react';
import { 
  Edit3, Cloud, Download, Upload, Settings, RefreshCw, 
  Trash2, ShieldAlert, CheckCircle2, ChevronRight, Plus, FolderSync, Info, Archive, X
} from 'lucide-react';
import { Room, DatabaseState } from '../types';
import { DataStore } from '../dataStore';

interface SettingsTabProps {
  roomId: number;
  rooms: Room[];
  lastBackupAt: string | null;
  onRenameRoom: (roomId: number, name: string) => void;
  onAddRoom: (name: string) => void;
  onArchiveRoom: (roomId: number) => void;
  onDeleteRoom: (roomId: number) => void;
  onResetDatabase: () => void;
  onImportDatabase: (json: string) => boolean;
}

export default function SettingsTab({
  roomId,
  rooms,
  lastBackupAt,
  onRenameRoom,
  onAddRoom,
  onArchiveRoom,
  onDeleteRoom,
  onResetDatabase,
  onImportDatabase
}: SettingsTabProps) {
  const currentRoom = rooms.find(r => r.room_id === roomId);
  const activeRooms = rooms.filter(r => !r.is_archived);

  // States
  const [isRenamingRoom, setIsRenamingRoom] = useState(false);
  const [renamedVal, setRenamedVal] = useState('');
  
  // Backup simulation states
  const [isBackupLoading, setIsBackupLoading] = useState(false);
  const [isRestoreLoading, setIsRestoreLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Room management states
  const [isRoomMgrOpen, setIsRoomMgrOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [editingRoomId, setEditingRoomId] = useState<number | null>(null);
  const [editingRoomName, setEditingRoomName] = useState('');

  // Danger zone reset
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [confirmInput, setConfirmInput] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renamedVal.trim()) return;
    onRenameRoom(roomId, renamedVal.trim());
    setIsRenamingRoom(false);
  };

  // Fake Backup Simulation
  const handleBackupClick = () => {
    setIsBackupLoading(true);
    setSuccessMsg(null);
    setTimeout(() => {
      DataStore.setBackupTimestamp();
      setIsBackupLoading(false);
      setSuccessMsg("Database successfully synced and backed up to Supabase Cloud.");
    }, 1500);
  };

  // Fake Restore Simulation
  const handleRestoreClick = () => {
    if (confirm("Restore will overwrite your current local data with the backed-up data. Continue?")) {
      setIsRestoreLoading(true);
      setSuccessMsg(null);
      setTimeout(() => {
        setIsRestoreLoading(false);
        setSuccessMsg("Database state successfully restored from Supabase Cloud.");
      }, 1500);
    }
  };

  // Export File Dump
  const handleExportClick = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(DataStore.getState(), null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `hostel_hisaab_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import File Dump
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const success = onImportDatabase(text);
      if (success) {
        setSuccessMsg("Backup file successfully imported. Local database is fully restored.");
      } else {
        alert("Invalid file format. Please upload a valid Hostel Hisaab JSON backup.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Manage Room Add
  const handleAddRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    onAddRoom(newRoomName.trim());
    setNewRoomName('');
  };

  // Reset Trigger
  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmInput !== 'RESET') return;
    onResetDatabase();
    setIsResetOpen(false);
    setConfirmInput('');
    setSuccessMsg("Local data cleared and restored to default hostel seed figures.");
  };

  const formatTimestamp = (isoStr: string | null) => {
    if (!isoStr) return "Never";
    const d = new Date(isoStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ", " + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6 animate-in fade-in-40 duration-200">
      
      {/* Tab Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Settings</h2>
        <p className="text-xs text-slate-500 mt-1">Configure room attributes, sync data, and manage backup targets</p>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div className="p-3.5 bg-teal-50 border border-teal-100 rounded-xl flex items-start gap-2.5 text-xs text-teal-800 font-medium">
          <CheckCircle2 className="w-4.5 h-4.5 shrink-0 text-teal-500 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Section 1: Room Selection & Rename */}
      <div className="bg-white border border-slate-100 rounded-xl shadow-xs p-5 space-y-4">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Room Configuration</h3>
        
        {!isRenamingRoom ? (
          <div className="flex items-center justify-between p-3 border border-slate-50 rounded-lg">
            <div>
              <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Active Room context</span>
              <span className="text-sm font-bold text-slate-800">{currentRoom?.room_name || "Unknown Room"}</span>
            </div>
            <button
              onClick={() => {
                setRenamedVal(currentRoom?.room_name || '');
                setIsRenamingRoom(true);
              }}
              className="p-2 text-slate-400 hover:text-teal-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleRenameSubmit} className="flex gap-2.5 items-end">
            <div className="grow">
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Rename Room</label>
              <input
                type="text"
                required
                value={renamedVal}
                onChange={e => setRenamedVal(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-800 font-semibold focus:outline-hidden focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsRenamingRoom(false)}
              className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-lg text-xs font-semibold"
            >
              Cancel
            </button>
          </form>
        )}
      </div>

      {/* Section 2: Backup & Sync */}
      <div className="bg-white border border-slate-100 rounded-xl shadow-xs p-5 space-y-4">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Backup & Sync</h3>
        
        <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg text-xs text-slate-500">
          <Cloud className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-700 block">Supabase Cloud Sync</span>
            Synchronize your offline hostel calculations with the centralized backup instance to safeguard against device loss.
            <span className="block font-semibold text-slate-400 mt-2">
              Last backup: {formatTimestamp(lastBackupAt)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          <button
            onClick={handleBackupClick}
            disabled={isBackupLoading}
            className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-teal-600 rounded-lg text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
          >
            {isBackupLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <FolderSync className="w-4 h-4 text-slate-400" />
                Backup to Supabase
              </>
            )}
          </button>
          <button
            onClick={handleRestoreClick}
            disabled={isRestoreLoading}
            className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-teal-600 rounded-lg text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
          >
            {isRestoreLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Restoring...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 text-slate-400" />
                Restore from Supabase
              </>
            )}
          </button>
        </div>
      </div>

      {/* Section 3: Data Export/Import */}
      <div className="bg-white border border-slate-100 rounded-xl shadow-xs p-5 space-y-4">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">File Migration</h3>

        <div className="grid grid-cols-2 gap-3.5">
          <button
            onClick={handleExportClick}
            className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-teal-600 rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-400" />
            Export Database
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-teal-600 rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4 text-slate-400" />
            Import Database
          </button>
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleImportFile} 
          accept=".json" 
          className="hidden" 
        />
      </div>

      {/* Section 4: Room Management Collapsible */}
      <div className="bg-white border border-slate-100 rounded-xl shadow-xs overflow-hidden">
        <button
          onClick={() => setIsRoomMgrOpen(!isRoomMgrOpen)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50/50 transition-colors text-left"
        >
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Room Management ({activeRooms.length})</h3>
          <span className="text-xs font-semibold text-teal-600 hover:text-teal-700">
            {isRoomMgrOpen ? "Collapse" : "Expand"}
          </span>
        </button>

        {isRoomMgrOpen && (
          <div className="p-5 border-t border-slate-50 space-y-5">
            {/* Rooms list with quick rename/archive */}
            <div className="space-y-3">
              {rooms.map(r => (
                <div key={r.room_id} className={`flex items-center justify-between p-3 border rounded-lg ${r.room_id === roomId ? 'bg-teal-50/10 border-teal-100' : 'border-slate-50'}`}>
                  <div>
                    <span className="text-xs font-bold text-slate-700">
                      {r.room_name} {r.room_id === roomId && <span className="text-[10px] text-teal-600 ml-1.5">(Current)</span>}
                      {r.is_archived && <span className="text-[10px] text-slate-400 ml-1.5 font-normal italic">(Archived)</span>}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Rename Room Inline toggle */}
                    <button
                      onClick={() => {
                        const newName = prompt(`Enter new name for ${r.room_name}:`, r.room_name);
                        if (newName && newName.trim()) {
                          onRenameRoom(r.room_id, newName.trim());
                        }
                      }}
                      className="px-2 py-1 text-[10px] font-bold border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-md transition-colors"
                    >
                      Rename
                    </button>
                    
                    {/* Archive Room */}
                    {!r.is_archived && r.room_id !== roomId && (
                      <button
                        onClick={() => {
                          if (confirm(`Archive ${r.room_name}? This preserves its accounting history but removes it from the main active room selection.`)) {
                            onArchiveRoom(r.room_id);
                          }
                        }}
                        className="px-2 py-1 text-[10px] font-bold border border-slate-200 hover:bg-rose-50 text-rose-600 rounded-md transition-colors"
                      >
                        Archive
                      </button>
                    )}

                    {/* Delete Room */}
                    <button
                      onClick={() => {
                        if (confirm(`Are you absolutely sure you want to permanently DELETE ${r.room_name} and all its roommates, cycles, expenses, and settlements? This action is permanent and cannot be undone.`)) {
                          onDeleteRoom(r.room_id);
                        }
                      }}
                      className="px-2 py-1 text-[10px] font-bold border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-md transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Inline add room form */}
            <form onSubmit={handleAddRoomSubmit} className="flex gap-2 items-end pt-3 border-t border-slate-50">
              <div className="grow">
                <input
                  type="text"
                  required
                  placeholder="e.g. Room 22"
                  value={newRoomName}
                  onChange={e => setNewRoomName(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden"
                />
              </div>
              <button
                type="submit"
                className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Room
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Section 5: Danger Zone */}
      <div className="bg-rose-50/40 border border-rose-100 rounded-xl p-5 space-y-4">
        <div className="flex items-start gap-2.5 text-rose-800">
          <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-xs block uppercase tracking-wider mb-0.5">Danger Zone</span>
            <p className="text-xs text-rose-700/80 leading-relaxed">
              Resetting the local database clears all rooms, roommates, active transaction splits, cycle roll-overs, and custom carry-forward balances. This action is permanent and cannot be undone.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsResetOpen(true)}
          className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer"
        >
          Reset Local Data
        </button>
      </div>

      {/* RESET CONFIRMATION MODAL */}
      {isResetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Confirm Reset Dues</h3>
              <button 
                onClick={() => {
                  setIsResetOpen(false);
                  setConfirmInput('');
                }}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleResetSubmit} className="p-5 space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                Please type <span className="font-bold text-rose-600">RESET</span> below to confirm you want to erase all local room transactions and revert to factory seed records.
              </p>

              <div>
                <input
                  type="text"
                  required
                  placeholder="RESET"
                  value={confirmInput}
                  onChange={e => setConfirmInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-center font-bold text-rose-600 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsResetOpen(false);
                    setConfirmInput('');
                  }}
                  className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={confirmInput !== 'RESET'}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-xs transition-all"
                >
                  Confirm Erase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
