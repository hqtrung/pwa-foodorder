'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StaffOrderCard } from '@/components/staff/StaffOrderCard';
import { OrderFilters } from '@/components/staff/OrderFilters';
import { SoundControls } from '@/components/staff/SoundControls';
import { NewOrderModal } from '@/components/staff/NewOrderModal';
import { useUIStore } from '@/stores';
import { orderFirestoreService } from '@/services/orderFirestoreService';
import { soundService } from '@/services/soundService';
import { Order, OrderEvent, OrderFilters as OrderFiltersType } from '@/types/order';

// Legacy interface for backward compatibility - will be removed
export interface StaffOrder extends Order {}

export function StaffDashboard() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  
  // State
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'table' | 'delivery' | 'urgent'>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showSoundControls, setShowSoundControls] = useState(false);
  const [newOrderNotifications, setNewOrderNotifications] = useState<string[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [newOrderModal, setNewOrderModal] = useState<{ order: Order; isOpen: boolean }>({ order: null as any, isOpen: false });
  
  // Refs for cleanup
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const lastOrderCountRef = useRef<number>(0);
  const soundIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const { showSuccessToast, showErrorToast } = useUIStore();

  // Handle real-time order events
  const handleOrderEvent = async (event: OrderEvent) => {
    console.log('Order event received:', event);
    
    if (event.type === 'created') {
      // Show prominent new order modal
      setNewOrderModal({ order: event.order, isOpen: true });
      
      // Start repeating sound notification (every 3 seconds for 30 seconds)
      await soundService.playOrderNotification('new_order');
      
      // Clear any existing sound interval
      if (soundIntervalRef.current) {
        clearInterval(soundIntervalRef.current);
      }
      
      // Setup repeating sound (10 times total - every 3 seconds for 30 seconds)
      let soundCount = 1;
      soundIntervalRef.current = setInterval(async () => {
        if (soundCount >= 10) {
          if (soundIntervalRef.current) {
            clearInterval(soundIntervalRef.current);
            soundIntervalRef.current = null;
          }
          return;
        }
        
        await soundService.playOrderNotification('new_order');
        soundCount++;
      }, 3000);
      
      // Show toast notification as backup
      showSuccessToast(
        t('staff.notifications.newOrder', { 
          orderNumber: event.order.orderNumber,
          customer: event.order.customer.name 
        })
      );
      
    } else if (event.type === 'status_changed') {
      // Play status change sound for urgent orders
      if (event.order.priority === 'urgent') {
        await soundService.playOrderNotification('urgent_order');
      } else {
        await soundService.playOrderNotification('status_change');
      }
    }
  };

  // Load initial data and setup real-time listener
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load initial orders
        const initialOrders = await orderFirestoreService.getOrders();
        setOrders(initialOrders);
        lastOrderCountRef.current = initialOrders.length;
        
      } catch (error) {
        console.error('Error loading staff data:', error);
        showErrorToast(t('staff.errors.loadFailed'));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [t, showErrorToast]);

  // Setup real-time listener
  useEffect(() => {
    if (!autoRefresh) return;

    try {
      const unsubscribe = orderFirestoreService.subscribeToOrders(handleOrderEvent);
      unsubscribeRef.current = unsubscribe;
      
      console.log('Real-time order listener activated');
      return () => {
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
          unsubscribeRef.current = null;
        }
      };
    } catch (error) {
      console.error('Error setting up real-time listener:', error);
    }
  }, [autoRefresh]);

  // Cleanup sound interval on unmount
  useEffect(() => {
    return () => {
      if (soundIntervalRef.current) {
        clearInterval(soundIntervalRef.current);
        soundIntervalRef.current = null;
      }
    };
  }, []);


  // Filter orders
  useEffect(() => {
    let filtered = [...orders];

    // Filter by type
    if (selectedFilter === 'table') {
      filtered = filtered.filter(order => order.type === 'table');
    } else if (selectedFilter === 'delivery') {
      filtered = filtered.filter(order => order.type === 'delivery');
    } else if (selectedFilter === 'urgent') {
      filtered = filtered.filter(order => order.priority === 'urgent');
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(order => order.status === selectedStatus);
    }

    setFilteredOrders(filtered);
  }, [orders, selectedFilter, selectedStatus]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Simulate some order status updates
      setOrders(prevOrders => 
        prevOrders.map(order => {
          if (Math.random() > 0.9) { // 10% chance to update
            const statuses: StaffOrder['status'][] = ['pending', 'confirmed', 'preparing', 'ready', 'delivering', 'completed'];
            const currentIndex = statuses.indexOf(order.status);
            if (currentIndex < statuses.length - 1) {
              return { ...order, status: statuses[currentIndex + 1] };
            }
          }
          return order;
        })
      );
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const handleOrderStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    try {
      // Update in Firestore
      await orderFirestoreService.updateOrder(orderId, { status: newStatus });
      
      // Optimistic update in local state
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      
      showSuccessToast(t('staff.orderUpdated'));
    } catch (error) {
      console.error('Error updating order status:', error);
      showErrorToast(t('staff.errors.updateFailed'));
    }
  };

  const handleDismissOrder = async (orderId: string) => {
    try {
      // Update in Firestore
      await orderFirestoreService.updateOrder(orderId, { isDismissed: true });
      
      // Remove from local state immediately for responsive UI
      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
      
      showSuccessToast('Đã ẩn đơn hàng');
    } catch (error) {
      console.error('Error dismissing order:', error);
      showErrorToast('Không thể ẩn đơn hàng');
    }
  };

  // Handle new order modal actions
  const handleAcceptNewOrder = () => {
    // Stop repeating sound
    if (soundIntervalRef.current) {
      clearInterval(soundIntervalRef.current);
      soundIntervalRef.current = null;
    }
    
    // Close modal
    setNewOrderModal({ order: null as any, isOpen: false });
    showSuccessToast('Đã nhận đơn hàng');
  };

  const handleDismissNewOrderModal = () => {
    // Stop repeating sound
    if (soundIntervalRef.current) {
      clearInterval(soundIntervalRef.current);
      soundIntervalRef.current = null;
    }
    
    // Close modal
    setNewOrderModal({ order: null as any, isOpen: false });
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const refreshedOrders = await orderFirestoreService.getOrders();
      setOrders(refreshedOrders);
      showSuccessToast(t('staff.refreshed'));
    } catch (error) {
      console.error('Error refreshing data:', error);
      showErrorToast(t('staff.errors.refreshFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
    showSuccessToast(
      autoRefresh 
        ? t('staff.autoRefreshDisabled')
        : t('staff.autoRefreshEnabled')
    );
  };

  // Initialize sound service on component mount and user interaction
  useEffect(() => {
    const initializeSound = async () => {
      try {
        await soundService.initialize();
      } catch (error) {
        console.warn('Could not initialize sound service:', error);
      }
    };

    initializeSound();

    // Add click handler to ensure audio context can resume on user interaction
    const handleUserInteraction = async () => {
      try {
        await soundService.resumeAudioContext();
        if (!soundService.isReady()) {
          await soundService.initialize();
        }
      } catch (error) {
        console.warn('Could not resume audio context:', error);
      }
    };

    // Listen for any user interaction to enable audio
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('staff.loading')}</p>
        </div>
      </div>
    );
  }

  const handleTestSound = async () => {
    try {
      // Initialize audio context if needed
      if (!soundService.isReady()) {
        await soundService.initialize();
        await soundService.resumeAudioContext();
      }
      
      // Play test sound
      const success = await soundService.testSound('new_order');
      if (success) {
        showSuccessToast(t('staff.soundTest.success'));
      } else {
        showErrorToast(t('staff.soundTest.failed'));
      }
    } catch (error) {
      console.error('Error testing sound:', error);
      showErrorToast(t('staff.soundTest.error'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Fixed Sidebar */}
      <aside className={`fixed left-0 top-0 z-40 h-screen bg-white shadow-lg border-r border-gray-200 overflow-y-auto transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-80'
      }`}>
        <div className={`${sidebarCollapsed ? 'p-2' : 'p-6'} space-y-6 transition-all duration-300`}>
          {/* Sidebar Toggle */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors ${
                sidebarCollapsed ? 'mx-auto' : 'mx-auto'
              }`}
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <svg 
                className={`w-4 h-4 text-gray-600 transition-transform duration-300 ${
                  sidebarCollapsed ? 'rotate-180' : ''
                }`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
          
          {!sidebarCollapsed && (
            <>
              {/* Live Status */}
              <div className="flex justify-center">
                <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                  autoRefresh ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  {autoRefresh ? t('staff.status.live') : t('staff.status.paused')}
                </div>
              </div>

              {/* Refresh Action */}
              <div className="space-y-3">
                <Button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {t('staff.actions.refresh')}
                </Button>
              </div>

              {/* Order Filters */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  {t('staff.sidebar.filters')}
                </h3>
                <OrderFilters
                  selectedFilter={selectedFilter}
                  selectedStatus={selectedStatus}
                  onFilterChange={setSelectedFilter}
                  onStatusChange={setSelectedStatus}
                  orderCounts={{
                    all: orders.length,
                    table: orders.filter(o => o.type === 'table').length,
                    delivery: orders.filter(o => o.type === 'delivery').length,
                    urgent: orders.filter(o => o.priority === 'urgent').length
                  }}
                />
              </div>

              {/* Test Sound */}
              <div className="space-y-3">
                <Button
                  onClick={handleTestSound}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M9 12a3 3 0 116 0v5a3 3 0 11-6 0v-5z" />
                  </svg>
                  {t('staff.actions.testSound')}
                </Button>
              </div>

              {/* Settings */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  {t('staff.sidebar.settings')}
                </h3>
                
                {/* Auto Refresh Toggle */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      {t('staff.settings.autoRefresh')}
                    </label>
                    <p className="text-xs text-gray-500">
                      {t('staff.settings.autoRefreshDesc')}
                    </p>
                  </div>
                  <button
                    onClick={handleToggleAutoRefresh}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      autoRefresh ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        autoRefresh ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Sound Controls */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    {t('staff.soundControls.title')}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSoundControls(!showSoundControls)}
                    className={showSoundControls ? 'bg-primary-50 text-primary-600' : ''}
                  >
                    {showSoundControls ? 'Hide' : 'Show'}
                  </Button>
                </div>
                
                {showSoundControls ? (
                  <SoundControls className="border-0 shadow-none bg-gray-50" />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className={`flex items-center space-x-2 text-sm ${
                      soundService.isReady() 
                        ? 'text-green-700' 
                        : 'text-red-700'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        soundService.isReady() ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <span>
                        {soundService.isReady() 
                          ? t('staff.soundControls.status.ready')
                          : t('staff.soundControls.status.notReady')
                        }
                      </span>
                    </div>
                  </div>
                )}
              </div>

            </>
          )}

          {/* Collapsed Sidebar Icons */}
          {sidebarCollapsed && (
            <div className="space-y-4">
              {/* Quick Action Icons */}
              <div className="space-y-2">
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors mx-auto"
                  title={t('staff.actions.refresh')}
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>

                <button
                  onClick={handleTestSound}
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors mx-auto"
                  title={t('staff.actions.testSound')}
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M9 12a3 3 0 116 0v5a3 3 0 11-6 0v-5z" />
                  </svg>
                </button>

                {/* Auto Refresh Status Indicator */}
                <div className="w-10 h-10 flex items-center justify-center mx-auto">
                  <div className={`w-3 h-3 rounded-full ${
                    autoRefresh ? 'bg-green-500' : 'bg-gray-400'
                  }`} title={autoRefresh ? t('staff.status.live') : t('staff.status.paused')} />
                </div>

                {/* Sound Status Indicator */}
                <div className="w-10 h-10 flex items-center justify-center mx-auto">
                  <div className={`w-3 h-3 rounded-full ${
                    soundService.isReady() ? 'bg-green-500' : 'bg-red-500'
                  }`} title={soundService.isReady() ? t('staff.soundControls.status.ready') : t('staff.soundControls.status.notReady')} />
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 p-6 ${
        sidebarCollapsed ? 'ml-16' : 'ml-80'
      }`}>

        {/* Orders Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {t('staff.orders.title')} ({filteredOrders.length})
            </h2>
            
            {filteredOrders.length > 0 && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const urgentOrders = filteredOrders.filter(o => o.priority === 'urgent');
                    urgentOrders.forEach(order => {
                      handleOrderStatusUpdate(order.id, 'ready');
                    });
                    showSuccessToast(t('staff.actions.bulkMarkReady'));
                  }}
                  disabled={filteredOrders.filter(o => o.priority === 'urgent').length === 0}
                >
                  {t('staff.actions.markUrgentReady')}
                </Button>
              </div>
            )}
          </div>

          {filteredOrders.length === 0 ? (
            <Card padding="lg" className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('staff.orders.empty.title')}
              </h3>
              <p className="text-gray-600">
                {t('staff.orders.empty.description')}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOrders.map((order) => (
                <StaffOrderCard
                  key={order.id}
                  order={order}
                  onStatusUpdate={handleOrderStatusUpdate}
                  onDismiss={handleDismissOrder}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* New Order Modal */}
      <NewOrderModal
        order={newOrderModal.order}
        isOpen={newOrderModal.isOpen}
        onAccept={handleAcceptNewOrder}
        onDismiss={handleDismissNewOrderModal}
      />
    </div>
  );
}