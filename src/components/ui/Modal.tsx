'use client';

import { Fragment, forwardRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { clsx } from 'clsx';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
}

const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ 
    isOpen, 
    onClose, 
    title, 
    size = 'md', 
    children, 
    className,
    showCloseButton = true 
  }, ref) => {
    return (
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog 
          as="div" 
          className="relative z-50" 
          onClose={onClose}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel 
                  ref={ref}
                  className={clsx(
                    'w-full transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all',
                    {
                      'max-w-sm': size === 'sm',
                      'max-w-md': size === 'md',
                      'max-w-lg': size === 'lg',
                      'max-w-2xl': size === 'xl',
                      'max-w-full mx-4': size === 'full',
                    },
                    className
                  )}
                >
                  {/* Header */}
                  {(title || showCloseButton) && (
                    <div className="flex items-center justify-between mb-4">
                      {title && (
                        <Dialog.Title
                          as="h3"
                          className="text-lg font-semibold leading-6 text-gray-900"
                        >
                          {title}
                        </Dialog.Title>
                      )}
                      
                      {showCloseButton && (
                        <button
                          type="button"
                          className="inline-flex items-center justify-center w-8 h-8 text-gray-400 bg-transparent rounded-lg hover:bg-gray-200 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
                          onClick={onClose}
                        >
                          <span className="sr-only">Close modal</span>
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  )}
                  
                  {/* Content */}
                  <div className="space-y-4">
                    {children}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    );
  }
);

Modal.displayName = 'Modal';

// Modal Footer component for action buttons
interface ModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  justify?: 'start' | 'end' | 'center' | 'between';
}

const ModalFooter = forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ className, justify = 'end', ...props }, ref) => {
    return (
      <div
        className={clsx(
          'flex gap-3 pt-4 mt-6 border-t border-gray-200',
          {
            'justify-start': justify === 'start',
            'justify-end': justify === 'end',
            'justify-center': justify === 'center',
            'justify-between': justify === 'between',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

ModalFooter.displayName = 'ModalFooter';

export { Modal, ModalFooter };