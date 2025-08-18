import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Toast } from '@/components/ui/Toast';

export type Theme = 'light' | 'dark' | 'system';
export type ViewMode = 'customer' | 'staff';

interface Modal {
  id: string;
  isOpen: boolean;
  type: 'product-detail' | 'cart' | 'checkout' | 'login' | 'order-confirmation' | 'custom';
  data?: Record<string, unknown>;
  onClose?: () => void;
}

interface LoadingState {
  [key: string]: boolean;
}

interface UIState {
  // Theme and appearance
  theme: Theme;
  viewMode: ViewMode;
  
  // Navigation and layout
  isMenuOpen: boolean;
  isSidebarOpen: boolean;
  currentPage: string;
  previousPage: string | null;
  
  // Modals
  modals: Modal[];
  
  // Toasts
  toasts: Toast[];
  
  // Loading states
  loading: LoadingState;
  
  // Search
  searchQuery: string;
  searchResults: Record<string, unknown>[];
  isSearching: boolean;
  
  // Product filters
  selectedCategory: string | null;
  priceRange: [number, number];
  sortBy: 'name' | 'price' | 'popularity' | 'newest';
  sortOrder: 'asc' | 'desc';
  showAvailableOnly: boolean;
  
  // Cart UI
  isCartVisible: boolean;
  cartSlideDirection: 'left' | 'right';
  
  // PWA
  isPWAInstallable: boolean;
  showPWAInstallPrompt: boolean;
  isOffline: boolean;
  
  // Notifications
  notificationsEnabled: boolean;
  pushSubscription: PushSubscription | null;
}

interface UIActions {
  // Theme and appearance
  setTheme: (theme: Theme) => void;
  setViewMode: (mode: ViewMode) => void;
  
  // Navigation
  setCurrentPage: (page: string) => void;
  goBack: () => void;
  toggleMenu: () => void;
  toggleSidebar: () => void;
  closeMenu: () => void;
  closeSidebar: () => void;
  
  // Modals
  openModal: (type: Modal['type'], data?: Record<string, unknown>, onClose?: () => void) => string;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  isModalOpen: (type: Modal['type']) => boolean;
  getModalData: (type: Modal['type']) => Record<string, unknown> | undefined;
  
  // Toasts
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  
  // Loading states
  setLoading: (key: string, loading: boolean) => void;
  isLoading: (key: string) => boolean;
  clearLoading: () => void;
  
  // Search
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: Record<string, unknown>[]) => void;
  setSearching: (searching: boolean) => void;
  clearSearch: () => void;
  
  // Product filters
  setSelectedCategory: (categoryId: string | null) => void;
  setPriceRange: (range: [number, number]) => void;
  setSortBy: (sortBy: UIState['sortBy']) => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  setShowAvailableOnly: (show: boolean) => void;
  resetFilters: () => void;
  
  // Cart UI
  showCart: () => void;
  hideCart: () => void;
  toggleCart: () => void;
  setCartSlideDirection: (direction: 'left' | 'right') => void;
  
  // PWA
  setPWAInstallable: (installable: boolean) => void;
  showPWAPrompt: () => void;
  hidePWAPrompt: () => void;
  setOffline: (offline: boolean) => void;
  
  // Notifications
  setNotificationsEnabled: (enabled: boolean) => void;
  setPushSubscription: (subscription: PushSubscription | null) => void;
  
  // Utilities
  showSuccessToast: (message: string, title?: string) => void;
  showErrorToast: (message: string, title?: string) => void;
  showWarningToast: (message: string, title?: string) => void;
  showInfoToast: (message: string, title?: string) => void;
}

type UIStore = UIState & UIActions;

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useUIStore = create<UIStore>()(
  persist(
    immer((set, get) => ({
      // Initial state
      theme: 'system',
      viewMode: 'customer',
      isMenuOpen: false,
      isSidebarOpen: false,
      currentPage: '/',
      previousPage: null,
      modals: [],
      toasts: [],
      loading: {},
      searchQuery: '',
      searchResults: [],
      isSearching: false,
      selectedCategory: null,
      priceRange: [0, 1000000],
      sortBy: 'popularity',
      sortOrder: 'desc',
      showAvailableOnly: true,
      isCartVisible: false,
      cartSlideDirection: 'right',
      isPWAInstallable: false,
      showPWAInstallPrompt: false,
      isOffline: false,
      notificationsEnabled: false,
      pushSubscription: null,

      // Actions
      setTheme: (theme) => {
        set((state) => {
          state.theme = theme;
        });
      },

      setViewMode: (mode) => {
        set((state) => {
          state.viewMode = mode;
        });
      },

      setCurrentPage: (page) => {
        set((state) => {
          state.previousPage = state.currentPage;
          state.currentPage = page;
        });
      },

      goBack: () => {
        const { previousPage } = get();
        if (previousPage) {
          set((state) => {
            const temp = state.currentPage;
            state.currentPage = state.previousPage!;
            state.previousPage = temp;
          });
        }
      },

      toggleMenu: () => {
        set((state) => {
          state.isMenuOpen = !state.isMenuOpen;
        });
      },

      toggleSidebar: () => {
        set((state) => {
          state.isSidebarOpen = !state.isSidebarOpen;
        });
      },

      closeMenu: () => {
        set((state) => {
          state.isMenuOpen = false;
        });
      },

      closeSidebar: () => {
        set((state) => {
          state.isSidebarOpen = false;
        });
      },

      openModal: (type, data, onClose) => {
        const id = generateId();
        set((state) => {
          // Close any existing modal of the same type
          state.modals = state.modals.filter(modal => modal.type !== type);
          
          state.modals.push({
            id,
            type,
            isOpen: true,
            data,
            onClose
          });
        });
        return id;
      },

      closeModal: (id) => {
        set((state) => {
          const modal = state.modals.find(m => m.id === id);
          if (modal?.onClose) {
            modal.onClose();
          }
          state.modals = state.modals.filter(m => m.id !== id);
        });
      },

      closeAllModals: () => {
        set((state) => {
          state.modals.forEach(modal => {
            if (modal.onClose) modal.onClose();
          });
          state.modals = [];
        });
      },

      isModalOpen: (type) => {
        return get().modals.some(modal => modal.type === type && modal.isOpen);
      },

      getModalData: (type) => {
        const modal = get().modals.find(m => m.type === type && m.isOpen);
        return modal?.data;
      },

      addToast: (toast) => {
        const id = generateId();
        set((state) => {
          state.toasts.push({ ...toast, id });
        });
      },

      removeToast: (id) => {
        set((state) => {
          state.toasts = state.toasts.filter(toast => toast.id !== id);
        });
      },

      clearToasts: () => {
        set((state) => {
          state.toasts = [];
        });
      },

      setLoading: (key, loading) => {
        set((state) => {
          if (loading) {
            state.loading[key] = true;
          } else {
            delete state.loading[key];
          }
        });
      },

      isLoading: (key) => {
        return Boolean(get().loading[key]);
      },

      clearLoading: () => {
        set((state) => {
          state.loading = {};
        });
      },

      setSearchQuery: (query) => {
        set((state) => {
          state.searchQuery = query;
        });
      },

      setSearchResults: (results) => {
        set((state) => {
          state.searchResults = results;
        });
      },

      setSearching: (searching) => {
        set((state) => {
          state.isSearching = searching;
        });
      },

      clearSearch: () => {
        set((state) => {
          state.searchQuery = '';
          state.searchResults = [];
          state.isSearching = false;
        });
      },

      setSelectedCategory: (categoryId) => {
        set((state) => {
          state.selectedCategory = categoryId;
        });
      },

      setPriceRange: (range) => {
        set((state) => {
          state.priceRange = range;
        });
      },

      setSortBy: (sortBy) => {
        set((state) => {
          state.sortBy = sortBy;
        });
      },

      setSortOrder: (order) => {
        set((state) => {
          state.sortOrder = order;
        });
      },

      setShowAvailableOnly: (show) => {
        set((state) => {
          state.showAvailableOnly = show;
        });
      },

      resetFilters: () => {
        set((state) => {
          state.selectedCategory = null;
          state.priceRange = [0, 1000000];
          state.sortBy = 'popularity';
          state.sortOrder = 'desc';
          state.showAvailableOnly = true;
        });
      },

      showCart: () => {
        set((state) => {
          state.isCartVisible = true;
        });
      },

      hideCart: () => {
        set((state) => {
          state.isCartVisible = false;
        });
      },

      toggleCart: () => {
        set((state) => {
          state.isCartVisible = !state.isCartVisible;
        });
      },

      setCartSlideDirection: (direction) => {
        set((state) => {
          state.cartSlideDirection = direction;
        });
      },

      setPWAInstallable: (installable) => {
        set((state) => {
          state.isPWAInstallable = installable;
        });
      },

      showPWAPrompt: () => {
        set((state) => {
          state.showPWAInstallPrompt = true;
        });
      },

      hidePWAPrompt: () => {
        set((state) => {
          state.showPWAInstallPrompt = false;
        });
      },

      setOffline: (offline) => {
        set((state) => {
          state.isOffline = offline;
        });
      },

      setNotificationsEnabled: (enabled) => {
        set((state) => {
          state.notificationsEnabled = enabled;
        });
      },

      setPushSubscription: (subscription) => {
        set((state) => {
          state.pushSubscription = subscription;
        });
      },

      // Utility toast methods
      showSuccessToast: (message, title) => {
        get().addToast({
          type: 'success',
          message,
          title,
          duration: 4000
        });
      },

      showErrorToast: (message, title) => {
        get().addToast({
          type: 'error',
          message,
          title,
          duration: 6000
        });
      },

      showWarningToast: (message, title) => {
        get().addToast({
          type: 'warning',
          message,
          title,
          duration: 5000
        });
      },

      showInfoToast: (message, title) => {
        get().addToast({
          type: 'info',
          message,
          title,
          duration: 4000
        });
      }
    })),
    {
      name: 'ui-storage',
      // Only persist non-session data
      partialize: (state) => ({
        theme: state.theme,
        viewMode: state.viewMode,
        selectedCategory: state.selectedCategory,
        priceRange: state.priceRange,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
        showAvailableOnly: state.showAvailableOnly,
        notificationsEnabled: state.notificationsEnabled,
        pushSubscription: state.pushSubscription
      })
    }
  )
);