import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { 
  User, Bell, Lock, CreditCard, Globe, Moon, Shield, 
  Trash2, LogOut, Save, ChevronRight 
} from 'lucide-react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export default function Settings() {
  const navigate = useNavigate();
  const { user, updateProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Account Settings – initialized from auth user when available
  const [accountData, setAccountData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
  });

  useEffect(() => {
    if (user) {
      setAccountData((prev) => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
      }));
    } else {
      setAccountData({
        name: 'John Smith',
        email: 'john.smith@example.com',
        phone: '+1 (555) 123-4567',
        bio: 'Passionate learner exploring new technologies',
      });
    }
  }, [user]);

  // Notification Settings (local only until backend supports)
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    classReminders: true,
    messageAlerts: true,
    weeklyDigest: false,
    promotions: false,
  });

  // Privacy Settings (local only until backend supports)
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showEnrolledClasses: true,
    showCertificates: true,
  });

  const handleSave = async () => {
    setSaveError(null);
    if (user) {
      setSaving(true);
      try {
        await updateProfile({
          name: accountData.name.trim() || user.name,
        });
        setHasChanges(false);
        alert('Settings saved successfully!');
      } catch (e: unknown) {
        setSaveError(e instanceof Error ? e.message : 'Failed to save');
      } finally {
        setSaving(false);
      }
    } else {
      setHasChanges(false);
      alert('Settings saved (demo – sign in to persist to account).');
    }
  };

  const handleAccountChange = (field: string, value: string) => {
    setAccountData({ ...accountData, [field]: value });
    setHasChanges(true);
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    setNotifications({ ...notifications, [field]: value });
    setHasChanges(true);
  };

  const handlePrivacyChange = (field: string, value: boolean) => {
    setPrivacy({ ...privacy, [field]: value });
    setHasChanges(true);
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // TODO: Implement account deletion
      alert('Account deletion requested (Demo mode)');
    }
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'preferences', label: 'Preferences', icon: Globe },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header variant="light" />
      
      <main className="py-12">
        <div className="w-[90vw] max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black mb-2">Settings</h1>
            <p className="text-gray-600">Manage your account settings and preferences</p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <nav className="bg-white border border-gray-300 rounded-xl overflow-hidden">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors border-b border-gray-200 last:border-b-0 ${
                        activeTab === tab.id
                          ? 'bg-black text-white'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5" />
                        <span className="font-medium text-sm">{tab.label}</span>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              <div className="bg-white border border-gray-300 rounded-xl p-8">
                {/* Account Settings */}
                {activeTab === 'account' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-black mb-4">Account Information</h2>
                      <p className="text-gray-600 mb-6">Update your personal information</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-black mb-2">
                          FULL NAME
                        </label>
                        <Input
                          value={accountData.name}
                          onChange={(e) => handleAccountChange('name', e.target.value)}
                          className="rounded-lg border-gray-300"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-black mb-2">
                          PHONE NUMBER
                        </label>
                        <Input
                          value={accountData.phone}
                          onChange={(e) => handleAccountChange('phone', e.target.value)}
                          className="rounded-lg border-gray-300"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-black mb-2">
                        EMAIL ADDRESS
                      </label>
                      <Input
                        type="email"
                        value={accountData.email}
                        onChange={(e) => handleAccountChange('email', e.target.value)}
                        className="rounded-lg border-gray-300"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-black mb-2">
                        BIO
                      </label>
                      <textarea
                        value={accountData.bio}
                        onChange={(e) => handleAccountChange('bio', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                      />
                    </div>

                    <div className="pt-4">
                      <Button
                        onClick={() => navigate('/forgot-password')}
                        variant="outline"
                        className="border-gray-300 rounded-lg"
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        Change Password
                      </Button>
                    </div>
                  </div>
                )}

                {/* Notifications */}
                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-black mb-4">Notification Preferences</h2>
                      <p className="text-gray-600 mb-6">Choose what notifications you want to receive</p>
                    </div>

                    <div className="space-y-4">
                      {Object.entries(notifications).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                          <div>
                            <h3 className="font-bold text-black mb-1">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {key === 'emailNotifications' && 'Receive notifications via email'}
                              {key === 'classReminders' && 'Get reminded before classes start'}
                              {key === 'messageAlerts' && 'New messages from instructors'}
                              {key === 'weeklyDigest' && 'Weekly summary of your activity'}
                              {key === 'promotions' && 'Special offers and updates'}
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={(e) => handleNotificationChange(key, e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gray-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Privacy & Security */}
                {activeTab === 'privacy' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-black mb-4">Privacy & Security</h2>
                      <p className="text-gray-600 mb-6">Control who can see your information</p>
                    </div>

                    <div className="space-y-4">
                      {Object.entries(privacy).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                          <div>
                            <h3 className="font-bold text-black mb-1">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {key === 'profileVisible' && 'Make your profile visible to others'}
                              {key === 'showEnrolledClasses' && 'Display your enrolled classes on profile'}
                              {key === 'showCertificates' && 'Show earned certificates on profile'}
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={(e) => handlePrivacyChange(key, e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gray-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                          </label>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 space-y-4">
                      <Button
                        variant="outline"
                        className="border-gray-300 rounded-lg"
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Two-Factor Authentication
                      </Button>

                      <div className="border-t border-gray-200 pt-6">
                        <h3 className="font-bold text-red-600 mb-2">Danger Zone</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Once you delete your account, there is no going back. Please be certain.
                        </p>
                        <Button
                          onClick={handleDeleteAccount}
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Billing */}
                {activeTab === 'billing' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-black mb-4">Billing & Payments</h2>
                      <p className="text-gray-600 mb-6">Manage your payment methods and billing history</p>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
                      <h3 className="font-bold text-black mb-4">Payment Methods</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-white border border-gray-300 rounded-lg">
                          <div className="flex items-center gap-3">
                            <CreditCard className="h-5 w-5 text-gray-600" />
                            <div>
                              <div className="font-bold text-black">•••• •••• •••• 4242</div>
                              <div className="text-sm text-gray-600">Expires 12/26</div>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className="border-gray-300 rounded-lg">
                            Edit
                          </Button>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full mt-4 border-gray-300 rounded-lg">
                        Add Payment Method
                      </Button>
                    </div>

                    <div>
                      <h3 className="font-bold text-black mb-4">Billing History</h3>
                      <div className="space-y-2">
                        {[
                          { date: 'Jan 15, 2026', item: 'UI/UX Design Fundamentals', amount: '$59.99' },
                          { date: 'Jan 10, 2026', item: 'Advanced React Patterns', amount: '$79.99' },
                          { date: 'Dec 28, 2025', item: 'Photography Masterclass', amount: '$89.99' },
                        ].map((invoice, index) => (
                          <div key={index} className="flex items-center justify-between p-4 border border-gray-300 rounded-lg">
                            <div>
                              <div className="font-bold text-black">{invoice.item}</div>
                              <div className="text-sm text-gray-600">{invoice.date}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-black">{invoice.amount}</div>
                              <button className="text-sm text-gray-600 hover:text-black">Download</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Preferences */}
                {activeTab === 'preferences' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-black mb-4">Preferences</h2>
                      <p className="text-gray-600 mb-6">Customize your learning experience</p>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-black mb-2">
                        LANGUAGE
                      </label>
                      <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400">
                        <option>English</option>
                        <option>Spanish</option>
                        <option>French</option>
                        <option>German</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-black mb-2">
                        TIME ZONE
                      </label>
                      <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400">
                        <option>UTC-05:00 (Eastern Time)</option>
                        <option>UTC-06:00 (Central Time)</option>
                        <option>UTC-07:00 (Mountain Time)</option>
                        <option>UTC-08:00 (Pacific Time)</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-gray-200">
                      <div>
                        <h3 className="font-bold text-black mb-1">Dark Mode</h3>
                        <p className="text-sm text-gray-600">Switch to dark theme</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gray-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                      </label>
                    </div>
                  </div>
                )}

                {saveError && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                    {saveError}
                  </div>
                )}
                {/* Save Button */}
                {hasChanges && (
                  <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
                    <p className="text-sm text-gray-600">You have unsaved changes</p>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => { setHasChanges(false); setSaveError(null); }}
                        variant="outline"
                        className="border-gray-300 rounded-lg"
                        disabled={saving}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSave}
                        className="bg-black text-white hover:bg-gray-800 rounded-lg"
                        disabled={saving}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}