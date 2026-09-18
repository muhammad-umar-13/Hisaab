import React, { useState, useEffect } from 'react';
import { 
  Home, Users, RefreshCw, Check, ArrowRight, ArrowLeft, Plus, X, ShieldCheck, Smartphone 
} from 'lucide-react';
import { DataStore } from '../dataStore';
import { DatabaseState } from '../types';

interface OnboardingFlowProps {
  dbState: DatabaseState;
  onComplete: (roomId: number) => void;
}

export default function OnboardingFlow({ dbState, onComplete }: OnboardingFlowProps) {
  const activeRooms = dbState.rooms.filter(r => !r.is_archived);
  
  // Auto-detect step based on existing DB state to allow seamless resumption if app closed halfway
  const getInitialStep = (): 0 | 1 | 2 | 3 => {
    if (activeRooms.length === 0) return 0;
    
    const firstRoom = activeRooms[0];
    const roommates = dbState.roommates.filter(rm => rm.room_id === firstRoom.room_id);
    if (roommates.length === 0) return 2; // Room exists, but no roommates added yet
    
    const cycles = dbState.cycles.filter(c => c.room_id === firstRoom.room_id);
    if (cycles.length === 0) return 3; // Room and roommates exist, but no cycles yet
    
    return 3;
  };

  const [step, setStep] = useState<0 | 1 | 2 | 3>(getInitialStep);
  const [roomName, setRoomName] = useState('');
  const [roommateName, setRoommateName] = useState('');
  const [cycleName, setCycleName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [error, setError] = useState('');

  // Synchronize step if underlying database state updates (e.g. from background actions)
  useEffect(() => {
    setStep(getInitialStep());
  }, [dbState.rooms, dbState.roommates, dbState.cycles]);

  // Default values for Step 3
  useEffect(() => {
    if (step === 3) {
      const date = new Date();
      const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      setCycleName(`${months[date.getMonth()]} ${date.getFullYear()}`);
      setStartDate(date.toISOString().split('T')[0]);
    }
  }, [step]);

  // Derived states
  const currentRoom = activeRooms[0];
  const roommates = currentRoom 
    ? dbState.roommates.filter(rm => rm.room_id === currentRoom.room_id)
    : [];

  // Stage 1: Create Room
  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmed = roomName.trim();
    if (!trimmed) {
      setError('Please enter a room name.');
      return;
    }

    if (dbState.rooms.some(r => r.room_name.toLowerCase() === trimmed.toLowerCase() && !r.is_archived)) {
      setError('A room with this name already exists.');
      return;
    }

    // Insert room
    const newRoom = DataStore.addRoom(trimmed);
    setStep(2);
  };

  // Stage 2: Add Roommates
  const handleAddRoommate = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmed = roommateName.trim();
    if (!trimmed) {
      setError('Please enter a roommate name.');
      return;
    }

    if (roommates.some(rm => rm.name.toLowerCase() === trimmed.toLowerCase())) {
      setError('This roommate is already added to this room.');
      return;
    }

    if (!currentRoom) {
      setError('No active room context found.');
      return;
    }

    DataStore.addRoommate(currentRoom.room_id, trimmed);
    setRoommateName('');
  };

  const handleRemoveRoommate = (roommateId: number) => {
    DataStore.deleteRoommate(roommateId);
  };

  const handleContinueToCycle = () => {
    setError('');
    if (roommates.length === 0) {
      setError('Add at least one roommate to continue.');
      return;
    }
    setStep(3);
  };

  // Stage 3: Start Cycle
  const handleStartHostelHisaab = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedCycle = cycleName.trim();
    if (!trimmedCycle) {
      setError('Please enter a cycle name.');
      return;
    }

    if (!startDate) {
      setError('Please select a start date.');
      return;
    }

    if (!currentRoom) {
      setError('No active room context found.');
      return;
    }

    // Start cycle
    DataStore.startNewCycle(currentRoom.room_id, trimmedCycle, startDate, true);
    onComplete(currentRoom.room_id);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Step Header */}
        {step > 0 && (
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest bg-teal-50 px-2 py-1 rounded-md">
                Step {step} of 3
              </span>
              <span className="text-xs text-slate-400 font-bold">
                {step === 1 && "Create Room"}
                {step === 2 && "Add Roommates"}
                {step === 3 && "Start Cycle"}
              </span>
            </div>
            {step === 2 && (
              <button
                onClick={() => {
                  if (confirm("Resetting room setup. Are you sure?")) {
                    if (currentRoom) {
                      DataStore.deleteRoom(currentRoom.room_id);
                    }
                    setStep(1);
                  }
                }}
                className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Restart</span>
              </button>
            )}
          </div>
        )}

        {/* STAGE 0: Welcome Screen */}
        {step === 0 && (
          <div className="space-y-6 text-center py-4">
            <div className="space-y-2">
              <div className="inline-flex items-center justify-center p-4 bg-teal-50 text-teal-600 rounded-3xl">
                <Home className="w-12 h-12" />
              </div>
              <h1 className="text-2xl font-black text-slate-950 uppercase tracking-tight">
                Hostel Hisaab
              </h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Simple Room Expense Manager
              </p>
            </div>

            <p className="text-sm text-slate-500 leading-relaxed">
              Track shared expenses, monthly room bills, and hostel payments seamlessly with your roommates.
            </p>

            <button
              onClick={() => setStep(1)}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-98"
            >
              <Plus className="w-4 h-4" />
              Create Your Room
            </button>

            <div className="pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
              <div className="space-y-1">
                <span className="text-emerald-600 inline-block font-extrabold text-base">✓</span>
                <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-tight">Offline</p>
              </div>
              <div className="space-y-1">
                <span className="text-emerald-600 inline-block font-extrabold text-base">✓</span>
                <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-tight">No Login</p>
              </div>
              <div className="space-y-1">
                <span className="text-emerald-600 inline-block font-extrabold text-base">✓</span>
                <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-tight">Local Data</p>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 1: Create Room */}
        {step === 1 && (
          <form onSubmit={handleCreateRoom} className="space-y-5">
            <div className="space-y-1 text-center">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Create Your Room</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Give your room a name so you can manage its expenses separately.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Room Name
              </label>
              <input
                type="text"
                required
                value={roomName}
                onChange={e => {
                  setRoomName(e.target.value);
                  setError('');
                }}
                placeholder="e.g. Room 12, Flat A"
                className="w-full px-4 py-3 border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl text-sm font-bold text-slate-800 placeholder:text-slate-300 outline-hidden transition-all bg-slate-50/50"
              />
            </div>

            {error && (
              <p className="text-xs font-bold text-rose-600 text-center">{error}</p>
            )}

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-1.5 py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer shadow-md hover:shadow-lg"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STAGE 2: Add Roommates */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="space-y-1 text-center">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                Add Roommates
              </h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                {currentRoom?.room_name}
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Add everyone who is currently living in this room to split bills.
              </p>
            </div>

            <form onSubmit={handleAddRoommate} className="flex gap-2">
              <div className="grow">
                <input
                  type="text"
                  value={roommateName}
                  onChange={e => {
                    setRoommateName(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter roommate name"
                  className="w-full px-4 py-3 border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl text-sm font-bold text-slate-800 placeholder:text-slate-300 outline-hidden transition-all bg-slate-50/50"
                />
              </div>
              <button
                type="submit"
                className="px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>

            {/* Roommates List */}
            <div className="space-y-2">
              <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Roommates List ({roommates.length})
              </h3>
              {roommates.length === 0 ? (
                <div className="py-6 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400 font-medium">
                  No roommates added yet
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-1.5 border border-slate-100 p-2 rounded-xl bg-slate-50/30">
                  {roommates.map(rm => (
                    <div 
                      key={rm.roommate_id}
                      className="flex items-center justify-between px-3 py-2.5 bg-white border border-slate-100 rounded-lg shadow-2xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center text-[10px] font-black">
                          👤
                        </span>
                        <span className="text-xs font-bold text-slate-800">{rm.name}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveRoommate(rm.roommate_id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Remove Roommate"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <p className="text-xs font-bold text-rose-600 text-center">{error}</p>
            )}

            <button
              onClick={handleContinueToCycle}
              className="w-full inline-flex items-center justify-center gap-1.5 py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer shadow-md hover:shadow-lg"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STAGE 3: Start Cycle */}
        {step === 3 && (
          <form onSubmit={handleStartHostelHisaab} className="space-y-5">
            <div className="space-y-1 text-center">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                Start Your First Cycle
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                A cycle keeps your monthly expenses and roommate settlements organized.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Cycle Name
                </label>
                <input
                  type="text"
                  required
                  value={cycleName}
                  onChange={e => {
                    setCycleName(e.target.value);
                    setError('');
                  }}
                  placeholder="e.g. September 2026"
                  className="w-full px-4 py-3 border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl text-sm font-bold text-slate-800 placeholder:text-slate-300 outline-hidden transition-all bg-slate-50/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Start Date
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={e => {
                    setStartDate(e.target.value);
                    setError('');
                  }}
                  className="w-full px-4 py-3 border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl text-sm font-bold text-slate-800 outline-hidden transition-all bg-slate-50/50"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs font-bold text-rose-600 text-center">{error}</p>
            )}

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer shadow-md hover:shadow-lg"
            >
              <Check className="w-4 h-4" />
              <span>Start Hostel Hisaab</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
