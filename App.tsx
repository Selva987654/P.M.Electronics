
import React, { useState, useEffect } from 'react';
import { User, Employee, Job, UserRole, AppState, Attendance } from './types';
import { mockDb } from './services/mockDb';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import JobManager from './components/JobManager';
import EmployeeManager from './components/EmployeeManager';
import AttendanceManager from './components/AttendanceManager';
import { Zap, ShieldCheck, User as UserIcon, Phone, Mail, Save, X, Edit2, UserPlus } from 'lucide-react';

const App: React.FC = () => {
  const [data, setData] = useState<AppState>(mockDb.getData());
  const [activeView, setActiveView] = useState('jobs');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Signup form state
  const [signUpForm, setSignUpForm] = useState({ fullName: '', email: '', phone: '' });

  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ fullName: '', phone: '' });

  // Save to DB on changes
  useEffect(() => {
    mockDb.saveData(data);
  }, [data]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = mockDb.login(email);
    if (user) {
      setData(prev => ({ ...prev, currentUser: user }));
      setProfileForm({ fullName: user.fullName, phone: user.phone || '' });
      setError('');
      // Set default view based on role
      setActiveView(user.role === UserRole.MANAGER ? 'dashboard' : 'attendance');
    } else {
      setError('Email not found. Only registered team members can sign in.');
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    // Check if user already exists
    const existing = data.managers.find(m => m.email.toLowerCase() === signUpForm.email.toLowerCase()) || 
                     data.employees.find(e => e.email.toLowerCase() === signUpForm.email.toLowerCase());
    
    if (existing) {
      setError('An account with this email already exists.');
      return;
    }

    const newManager: User = {
      id: `mgr-${Date.now()}`,
      email: signUpForm.email,
      fullName: signUpForm.fullName,
      role: UserRole.MANAGER,
      phone: signUpForm.phone
    };

    setData(prev => ({
      ...prev,
      managers: [...prev.managers, newManager],
      currentUser: newManager
    }));
    
    setProfileForm({ fullName: newManager.fullName, phone: newManager.phone || '' });
    setError('');
    setActiveView('dashboard');
  };

  const handleLogout = () => {
    setData(prev => ({ ...prev, currentUser: null }));
    setEmail('');
    setError('');
    setIsSignUp(false);
    setIsEditingProfile(false);
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.currentUser) return;

    const updatedUser = {
      ...data.currentUser,
      fullName: profileForm.fullName,
      phone: profileForm.phone
    };

    if (data.currentUser.role === UserRole.MANAGER) {
      setData(prev => ({
        ...prev,
        currentUser: updatedUser,
        managers: prev.managers.map(m => m.id === updatedUser.id ? updatedUser : m)
      }));
    } else {
      setData(prev => ({
        ...prev,
        currentUser: updatedUser,
        employees: prev.employees.map(emp => emp.id === updatedUser.id ? { ...emp, fullName: updatedUser.fullName, phone: updatedUser.phone || '' } : emp)
      }));
    }
    
    setIsEditingProfile(false);
  };

  const handleAddJob = (job: Job) => {
    setData(prev => ({ ...prev, jobs: [job, ...prev.jobs] }));
  };

  const handleUpdateJob = (updatedJob: Job) => {
    setData(prev => ({
      ...prev,
      jobs: prev.jobs.map(j => j.id === updatedJob.id ? updatedJob : j)
    }));
  };

  const handleAddEmployee = (emp: Employee) => {
    setData(prev => ({ ...prev, employees: [...prev.employees, emp] }));
  };

  const handleUpdateAttendance = (record: Attendance) => {
    setData(prev => {
      const exists = prev.attendance.findIndex(a => a.userId === record.userId && a.date === record.date);
      let newAttendance = [...prev.attendance];
      if (exists > -1) {
        newAttendance[exists] = record;
      } else {
        newAttendance.push(record);
      }
      return { ...prev, attendance: newAttendance };
    });
  };

  if (!data.currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="bg-indigo-600 p-8 text-center">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="text-indigo-600 fill-current" size={32} />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Electric.Go</h1>
              <p className="text-indigo-100 mt-2 opacity-80">
                {isSignUp ? 'Create Manager Account' : 'Empowering Electrical Professionals'}
              </p>
            </div>
            
            <div className="p-8 space-y-6">
              {isSignUp ? (
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-bold text-slate-700">Full Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="text" 
                        value={signUpForm.fullName}
                        onChange={(e) => setSignUpForm({...signUpForm, fullName: e.target.value})}
                        placeholder="John Doe"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-bold text-slate-700">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="email" 
                        value={signUpForm.email}
                        onChange={(e) => setSignUpForm({...signUpForm, email: e.target.value})}
                        placeholder="example@gmail.com"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-bold text-slate-700">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="tel" 
                        value={signUpForm.phone}
                        onChange={(e) => setSignUpForm({...signUpForm, phone: e.target.value})}
                        placeholder="9876543210"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 bg-rose-50 text-rose-600 rounded-xl text-sm font-medium border border-rose-100 flex items-center">
                      <ShieldCheck size={18} className="mr-2 flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  <button 
                    type="submit"
                    className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-slate-800 transition-colors flex items-center justify-center space-x-2"
                  >
                    <UserPlus size={20} />
                    <span>Create Account</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => { setIsSignUp(false); setError(''); }}
                    className="w-full text-sm font-bold text-indigo-600 hover:underline"
                  >
                    Already have an account? Sign In
                  </button>
                </form>
              ) : (
                <>
                  <button 
                    onClick={() => alert("Google Sign-In would be here.")}
                    className="w-full flex items-center justify-center space-x-3 bg-white border border-slate-200 py-3 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                    <span>Continue with Google</span>
                  </button>

                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-slate-100"></div>
                    <span className="flex-shrink mx-4 text-slate-400 text-xs font-bold uppercase tracking-widest">or email</span>
                    <div className="flex-grow border-t border-slate-100"></div>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Login Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                          type="email" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="example@gmail.com"
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                          required
                        />
                      </div>
                    </div>
                    
                    {error && (
                      <div className="p-4 bg-rose-50 text-rose-600 rounded-xl text-sm font-medium border border-rose-100 flex items-center">
                        <ShieldCheck size={18} className="mr-2 flex-shrink-0" />
                        {error}
                      </div>
                    )}

                    <button 
                      type="submit"
                      className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-slate-800 transition-colors"
                    >
                      Sign In to Portal
                    </button>
                  </form>

                  <div className="flex flex-col space-y-3 pt-2">
                    <button 
                      type="button"
                      onClick={() => { setIsSignUp(true); setError(''); }}
                      className="w-full text-sm font-bold text-indigo-600 hover:underline"
                    >
                      Don't have a manager account? Sign Up
                    </button>
                    
                    <div className="pt-4 text-center border-t border-slate-50">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Demo Accounts</p>
                      <div className="flex flex-col space-y-1">
                        <button onClick={() => setEmail('rajesh.sharma@gmail.com')} className="text-xs text-indigo-500 hover:underline">Manager: rajesh.sharma@gmail.com</button>
                        <button onClick={() => setEmail('amit.kumar@gmail.com')} className="text-xs text-indigo-500 hover:underline">Worker: amit.kumar@gmail.com</button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout 
      user={data.currentUser} 
      onLogout={handleLogout} 
      activeView={activeView}
      setActiveView={setActiveView}
    >
      {activeView === 'dashboard' && data.currentUser.role === UserRole.MANAGER && (
        <Dashboard jobs={data.jobs} employees={data.employees} />
      )}
      
      {activeView === 'jobs' && (
        <JobManager 
          jobs={data.jobs} 
          employees={data.employees} 
          role={data.currentUser.role}
          currentUserId={data.currentUser.id}
          onUpdateJob={handleUpdateJob}
          onAddJob={handleAddJob}
        />
      )}

      {activeView === 'attendance' && (
        <AttendanceManager 
          user={data.currentUser}
          employees={data.employees}
          attendance={data.attendance}
          onUpdateAttendance={handleUpdateAttendance}
        />
      )}

      {activeView === 'employees' && data.currentUser.role === UserRole.MANAGER && (
        <EmployeeManager 
          employees={data.employees} 
          jobs={data.jobs}
          onAddEmployee={handleAddEmployee}
          onAddJob={handleAddJob}
        />
      )}

      {activeView === 'settings' && (
        <div className="bg-white rounded-2xl p-4 md:p-8 border border-slate-200 max-w-2xl shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Account Settings</h2>
            {!isEditingProfile && (
              <button 
                onClick={() => setIsEditingProfile(true)}
                className="flex items-center space-x-2 text-indigo-600 font-bold text-sm hover:underline"
              >
                <Edit2 size={16} />
                <span>Edit Profile</span>
              </button>
            )}
          </div>

          <form onSubmit={handleUpdateUser} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                {isEditingProfile ? (
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text"
                      value={profileForm.fullName}
                      onChange={(e) => setProfileForm({...profileForm, fullName: e.target.value})}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      required
                    />
                  </div>
                ) : (
                  <p className="text-lg font-semibold text-slate-800">{data.currentUser.fullName}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Security Role</label>
                <div className="flex items-center">
                  <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded uppercase border border-indigo-100">
                    {data.currentUser.role}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Phone Number</label>
                {isEditingProfile ? (
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                ) : (
                  <p className="text-slate-600 font-medium">{data.currentUser.phone || 'Not provided'}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                <div className="flex items-center space-x-2 text-slate-600">
                  <Mail size={16} />
                  <p className="font-medium">{data.currentUser.email}</p>
                </div>
                <p className="text-[10px] text-slate-400 italic">Login email cannot be changed for security reasons.</p>
              </div>
            </div>

            {isEditingProfile && (
              <div className="pt-6 border-t border-slate-100 flex space-x-4">
                <button 
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Save size={18} />
                  <span>Save Changes</span>
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setIsEditingProfile(false);
                    setProfileForm({ fullName: data.currentUser?.fullName || '', phone: data.currentUser?.phone || '' });
                  }}
                  className="px-8 bg-slate-100 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center space-x-2"
                >
                  <X size={18} />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </form>

          {!isEditingProfile && (
            <div className="mt-8 pt-6 border-t border-slate-100">
              <h4 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Security</h4>
              <button className="text-indigo-600 font-bold text-sm hover:underline">
                Change Password
              </button>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
};

export default App;
