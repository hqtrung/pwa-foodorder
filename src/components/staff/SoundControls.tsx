'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { soundService } from '@/services/soundService';
import { SoundSettings } from '@/types/order';

interface SoundControlsProps {
  className?: string;
}

export function SoundControls({ className = '' }: SoundControlsProps) {
  const t = useTranslations();
  const [settings, setSettings] = useState<SoundSettings>(soundService.getSettings());
  const [isInitialized, setIsInitialized] = useState(soundService.isReady());
  const [audioContextState, setAudioContextState] = useState(soundService.getAudioContextState());

  useEffect(() => {
    // Check initialization status periodically
    const checkStatus = () => {
      setIsInitialized(soundService.isReady());
      setAudioContextState(soundService.getAudioContextState());
    };

    const interval = setInterval(checkStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleVolumeChange = (volume: number) => {
    const newSettings = { ...settings, volume };
    setSettings(newSettings);
    soundService.updateSettings(newSettings);
  };

  const handleToggleEnabled = () => {
    const newSettings = { ...settings, enabled: !settings.enabled };
    setSettings(newSettings);
    soundService.updateSettings(newSettings);
  };

  const handleToggleNewOrder = () => {
    const newSettings = { ...settings, newOrder: !settings.newOrder };
    setSettings(newSettings);
    soundService.updateSettings(newSettings);
  };

  const handleToggleStatusChange = () => {
    const newSettings = { ...settings, statusChange: !settings.statusChange };
    setSettings(newSettings);
    soundService.updateSettings(newSettings);
  };

  const handleToggleUrgentOrder = () => {
    const newSettings = { ...settings, urgentOrder: !settings.urgentOrder };
    setSettings(newSettings);
    soundService.updateSettings(newSettings);
  };

  const handleTestSound = async (type: 'new_order' | 'status_change' | 'urgent_order') => {
    try {
      // Initialize if needed
      if (!isInitialized) {
        await soundService.initialize();
        setIsInitialized(soundService.isReady());
      }
      
      await soundService.testSound(type);
    } catch (error) {
      console.error('Error testing sound:', error);
    }
  };

  const handleInitializeAudio = async () => {
    try {
      await soundService.initialize();
      setIsInitialized(soundService.isReady());
      setAudioContextState(soundService.getAudioContextState());
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  };

  const handleResumeAudio = async () => {
    try {
      await soundService.resumeAudioContext();
      setAudioContextState(soundService.getAudioContextState());
    } catch (error) {
      console.error('Error resuming audio context:', error);
    }
  };

  const handleReset = () => {
    soundService.resetSettings();
    setSettings(soundService.getSettings());
  };

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {t('staff.soundControls.title')}
          </h3>
          <div className="flex items-center space-x-2">
            {/* Audio Status Indicator */}
            <div className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-full ${
              isInitialized 
                ? 'bg-green-100 text-green-700' 
                : audioContextState === 'suspended'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isInitialized ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span>
                {isInitialized 
                  ? t('staff.soundControls.status.ready')
                  : audioContextState === 'suspended'
                  ? t('staff.soundControls.status.suspended')
                  : t('staff.soundControls.status.notReady')
                }
              </span>
            </div>
          </div>
        </div>

        {/* Audio Initialization */}
        {!isInitialized && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-800 font-medium">
                  {t('staff.soundControls.initRequired.title')}
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  {t('staff.soundControls.initRequired.description')}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleInitializeAudio}
                className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
              >
                {t('staff.soundControls.initRequired.button')}
              </Button>
            </div>
          </div>
        )}

        {/* Audio Context Suspended */}
        {audioContextState === 'suspended' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-800 font-medium">
                  {t('staff.soundControls.suspended.title')}
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  {t('staff.soundControls.suspended.description')}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResumeAudio}
                className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
              >
                {t('staff.soundControls.suspended.button')}
              </Button>
            </div>
          </div>
        )}

        {/* Master Enable/Disable */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">
              {t('staff.soundControls.masterEnable.label')}
            </label>
            <p className="text-xs text-gray-500">
              {t('staff.soundControls.masterEnable.description')}
            </p>
          </div>
          <button
            onClick={handleToggleEnabled}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.enabled ? 'bg-primary-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Volume Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              {t('staff.soundControls.volume.label')}
            </label>
            <span className="text-sm text-gray-500">
              {Math.round(settings.volume * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={settings.volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            disabled={!settings.enabled}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
          />
        </div>

        {/* Individual Sound Settings */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">
            {t('staff.soundControls.notifications.title')}
          </h4>

          {/* New Order Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="text-sm text-gray-600">
                {t('staff.soundControls.notifications.newOrder')}
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTestSound('new_order')}
                disabled={!settings.enabled || !isInitialized}
                className="text-xs px-2 py-1"
              >
                {t('staff.soundControls.test')}
              </Button>
              <button
                onClick={handleToggleNewOrder}
                disabled={!settings.enabled}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-50 ${
                  settings.newOrder && settings.enabled ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    settings.newOrder && settings.enabled ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Status Change Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="text-sm text-gray-600">
                {t('staff.soundControls.notifications.statusChange')}
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTestSound('status_change')}
                disabled={!settings.enabled || !isInitialized}
                className="text-xs px-2 py-1"
              >
                {t('staff.soundControls.test')}
              </Button>
              <button
                onClick={handleToggleStatusChange}
                disabled={!settings.enabled}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-50 ${
                  settings.statusChange && settings.enabled ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    settings.statusChange && settings.enabled ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Urgent Order Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="text-sm text-gray-600">
                {t('staff.soundControls.notifications.urgentOrder')}
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTestSound('urgent_order')}
                disabled={!settings.enabled || !isInitialized}
                className="text-xs px-2 py-1"
              >
                {t('staff.soundControls.test')}
              </Button>
              <button
                onClick={handleToggleUrgentOrder}
                disabled={!settings.enabled}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-50 ${
                  settings.urgentOrder && settings.enabled ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    settings.urgentOrder && settings.enabled ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-gray-600"
          >
            {t('staff.soundControls.reset')}
          </Button>
          
          <div className="text-xs text-gray-500">
            {t('staff.soundControls.info')}
          </div>
        </div>
      </div>
    </Card>
  );
}