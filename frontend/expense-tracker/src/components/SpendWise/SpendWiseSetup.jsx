import React, { useState, useEffect } from 'react';
import { LuMail, LuSettings, LuRefreshCw } from 'react-icons/lu';
import { FaRobot, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import DashboardLayout from '../layouts/DashboardLayout';
import { useUserAuth } from '../../hooks/useUserAuth';

const SpendWiseSetup = () => {
  useUserAuth(); // Protect the component with authentication
  const [emailConfig, setEmailConfig] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [setupForm, setSetupForm] = useState({
    email: '',
    phone: '',
    supportedBanks: ['PAYTM', 'PHONEPE', 'GPAY'],
    notificationSettings: {
      dailySummary: true,
      weeklyReport: true,
      spendingAlerts: true,
      smsEnabled: true
    }
  });

  useEffect(() => {
    fetchEmailConfig();
  }, []);

  const fetchEmailConfig = async () => {
    try {
      const response = await axiosInstance.get('/api/v1/spendwise/email-config');
      if (response.data.success && response.data.data) {
        setEmailConfig(response.data.data);
        setSetupForm(prev => ({
          ...prev,
          email: response.data.data.email || '',
          phone: response.data.data.notificationSettings?.phone || '',
          supportedBanks: response.data.data.supportedBanks || ['PAYTM', 'PHONEPE', 'GPAY'],
          notificationSettings: response.data.data.notificationSettings || prev.notificationSettings
        }));
      }
    } catch (error) {
      console.error('Error fetching email config:', error);
    }
  };

  const handleProcessEmails = async () => {
    if (!emailConfig) {
      toast.error('Please set up email configuration first');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await axiosInstance.post('/api/v1/spendwise/process-emails');
      if (response.data.success) {
        toast.success(`✨ Processed ${response.data.data.length} new transactions!`);
      }
    } catch (error) {
      console.error('Error processing emails:', error);
      toast.error('Failed to process emails');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      const configData = {
        email: setupForm.email,
        // Basic IMAP config for Gmail (users can modify)
        imapConfig: {
          host: 'imap.gmail.com',
          port: 993,
          secure: true,
          auth: {
            user: setupForm.email,
            pass: 'app_password' // User needs to set app password
          }
        },
        supportedBanks: setupForm.supportedBanks,
        notificationSettings: {
          ...setupForm.notificationSettings,
          phone: setupForm.phone
        }
      };

      const response = await axiosInstance.post('/api/v1/spendwise/email-config', configData);
      if (response.data.success) {
        toast.success('✅ SpendWise configuration saved!');
        setEmailConfig(response.data.data);
      }
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Failed to save configuration');
    }
  };

  const toggleBank = (bank) => {
    setSetupForm(prev => ({
      ...prev,
      supportedBanks: prev.supportedBanks.includes(bank)
        ? prev.supportedBanks.filter(b => b !== bank)
        : [...prev.supportedBanks, bank]
    }));
  };

  const bankLogos = {
    PAYTM: '💙',
    PHONEPE: '💜',
    GPAY: '🟢',
    AMAZON: '🟠',
    FLIPKART: '🟡'
  };

  return (
    <DashboardLayout activeMenu="SpendWise AI">
      <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white mb-6">
        <div className="flex items-center gap-3 mb-4">
          <FaRobot className="text-3xl" />
          <div>
            <h1 className="text-2xl font-bold">SpendWise Integration</h1>
            <p className="text-purple-100">Automatically track your UPI expenses from emails</p>
          </div>
        </div>
        
        {emailConfig && (
          <div className="flex items-center gap-2 text-sm">
            <FaCheckCircle className="text-green-300" />
            <span>Connected to {emailConfig.email}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <LuSettings />
            Configuration
          </h2>

          <div className="space-y-4">
            {/* Email Setup */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={setupForm.email}
                onChange={(e) => setSetupForm(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="your.email@gmail.com"
              />
              <p className="text-xs text-gray-500 mt-1">
                This email will be monitored for transaction notifications
              </p>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={setupForm.phone}
                onChange={(e) => setSetupForm(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="+91 9876543210"
              />
              <p className="text-xs text-gray-500 mt-1">
                Receive SMS notifications for daily summaries
              </p>
            </div>

            {/* Supported Banks */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supported Platforms
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(bankLogos).map(([bank, emoji]) => (
                  <button
                    key={bank}
                    onClick={() => toggleBank(bank)}
                    className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                      setupForm.supportedBanks.includes(bank)
                        ? 'bg-purple-50 border-purple-500 text-purple-700'
                        : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-2">{emoji}</span>
                    {bank}
                  </button>
                ))}
              </div>
            </div>

            {/* Notification Settings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notification Preferences
              </label>
              <div className="space-y-2">
                {[
                  { key: 'dailySummary', label: 'Daily Spending Summary' },
                  { key: 'weeklyReport', label: 'Weekly Report' },
                  { key: 'spendingAlerts', label: 'High Spending Alerts' },
                  { key: 'smsEnabled', label: 'SMS Notifications' }
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={setupForm.notificationSettings[key]}
                      onChange={(e) => setSetupForm(prev => ({
                        ...prev,
                        notificationSettings: {
                          ...prev.notificationSettings,
                          [key]: e.target.checked
                        }
                      }))}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={handleSaveConfig}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
            >
              Save Configuration
            </button>
          </div>
        </div>

        {/* Actions Panel */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <LuMail />
            Actions
          </h2>

          <div className="space-y-4">
            {/* Process Emails */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Process Recent Emails</h3>
              <p className="text-sm text-blue-700 mb-3">
                Scan your email for new UPI transaction notifications and add them automatically.
              </p>
              <button
                onClick={handleProcessEmails}
                disabled={isProcessing || !emailConfig}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <LuRefreshCw className={isProcessing ? 'animate-spin' : ''} />
                {isProcessing ? 'Processing...' : 'Process Emails'}
              </button>
            </div>

            {/* Status */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Status</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  {emailConfig ? (
                    <>
                      <FaCheckCircle className="text-green-500" />
                      <span className="text-green-700">Email configuration active</span>
                    </>
                  ) : (
                    <>
                      <FaExclamationTriangle className="text-orange-500" />
                      <span className="text-orange-700">Email configuration needed</span>
                    </>
                  )}
                </div>
                
                {emailConfig?.lastProcessedDate && (
                  <div className="text-gray-600">
                    Last processed: {new Date(emailConfig.lastProcessedDate).toLocaleString()}
                  </div>
                )}
              </div>
            </div>

            {/* Features */}
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-900 mb-2">✨ SpendWise Features</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Automatic UPI transaction detection</li>
                <li>• AI-powered expense categorization</li>
                <li>• Daily spending summaries via SMS</li>
                <li>• Smart spending insights & tips</li>
                <li>• Weekly financial reports</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
};

export default SpendWiseSetup;
