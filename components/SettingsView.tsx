import React, { useState, useEffect } from 'react';
import { Icons } from '../constants';
import { BusinessProfile, getProfile, saveProfile } from '../services/settingsService';

const SettingsView: React.FC = () => {
  const [profile, setProfile] = useState<BusinessProfile>({
    name: '',
    industry: '',
    audience: '',
    voice: 'Professional',
    description: ''
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const existing = getProfile();
    if (existing) setProfile(existing);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
    setSaved(false);
  };

  const handleSave = () => {
    saveProfile(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="h-full max-w-4xl mx-auto flex flex-col">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Business Profile</h2>
        <p className="text-slate-500">
          Define your brand identity once. All AI tools will use this context to generate tailored results.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col md:flex-row">
        {/* Visual Sidebar */}
        <div className="bg-slate-900 p-8 text-white md:w-1/3 flex flex-col justify-between">
            <div>
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    <Icons.UserCircle />
                </div>
                <h3 className="text-xl font-bold mb-2">{profile.name || "Your Business"}</h3>
                <p className="text-slate-400 text-sm">
                    {profile.industry ? `${profile.industry} • ` : ''} 
                    {profile.voice ? `${profile.voice} Voice` : ''}
                </p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 mt-8">
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">AI Context Preview</h4>
                <p className="text-xs text-slate-300 italic leading-relaxed">
                    "You are acting on behalf of {profile.name || "[Business Name]"}, a {profile.industry || "[Industry]"} company targeting {profile.audience || "[Audience]"}..."
                </p>
            </div>
        </div>

        {/* Form */}
        <div className="p-8 flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 gap-6">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Business Name</label>
                    <input 
                        name="name"
                        value={profile.name}
                        onChange={handleChange}
                        type="text" 
                        placeholder="e.g. Acme Corp"
                        className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Industry</label>
                        <input 
                            name="industry"
                            value={profile.industry}
                            onChange={handleChange}
                            type="text" 
                            placeholder="e.g. SaaS, Bakery, Consulting"
                            className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Brand Voice</label>
                        <select 
                            name="voice"
                            value={profile.voice}
                            onChange={handleChange}
                            className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        >
                            <option>Professional</option>
                            <option>Friendly</option>
                            <option>Witty</option>
                            <option>Authoritative</option>
                            <option>Empathetic</option>
                            <option>Luxury</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Target Audience</label>
                    <input 
                        name="audience"
                        value={profile.audience}
                        onChange={handleChange}
                        type="text" 
                        placeholder="e.g. Small business owners, busy moms"
                        className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Business Description / Value Prop</label>
                    <textarea 
                        name="description"
                        value={profile.description}
                        onChange={handleChange}
                        placeholder="What do you do and what makes you unique?"
                        className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-none"
                    />
                </div>

                <div className="pt-4 flex items-center gap-4">
                    <button 
                        onClick={handleSave}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-all flex items-center gap-2"
                    >
                        {saved ? <Icons.Sparkles /> : <Icons.Save />}
                        {saved ? 'Profile Saved!' : 'Save Profile'}
                    </button>
                    {saved && <span className="text-emerald-600 text-sm font-medium animate-fade-in">Settings updated successfully.</span>}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;