"use client"

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Flex, Text, Stack, Portal } from '@mantine/core';
import { IconCheck, IconX, IconInfoCircle } from '@tabler/icons-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
    id: string;
    message: string;
    type: ToastType;
    title?: string;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info', title?: string) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type, title }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <Portal>
                <div style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    pointerEvents: 'none'
                }}>
                    {toasts.map((toast) => {
                        const isSuccess = toast.type === 'success';
                        const isError = toast.type === 'error';
                        const color = isSuccess ? '#DFFF00' : isError ? '#ff4d4d' : '#00e5ff';
                        const Icon = isSuccess ? IconCheck : isError ? IconX : IconInfoCircle;

                        return (
                            <div
                                key={toast.id}
                                onClick={() => removeToast(toast.id)}
                                style={{
                                    pointerEvents: 'auto',
                                    cursor: 'pointer',
                                    minWidth: '320px',
                                    maxWidth: '450px',
                                    background: 'rgba(10, 20, 14, 0.85)',
                                    backdropFilter: 'blur(16px)',
                                    WebkitBackdropFilter: 'blur(16px)',
                                    borderLeft: `5px solid ${color}`,
                                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: '8px',
                                    padding: '16px',
                                    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5)',
                                    transform: 'translateY(0)',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    animation: 'toast-slide-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
                                }}
                            >
                                <Flex align="flex-start" gap="md">
                                    <div style={{
                                        background: `rgba(${isSuccess ? '223, 255, 0' : isError ? '255, 77, 77' : '0, 229, 255'}, 0.15)`,
                                        borderRadius: '50%',
                                        padding: '6px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: color
                                    }}>
                                        <Icon size={20} />
                                    </div>
                                    <Stack gap="2px" style={{ flex: 1 }}>
                                        {toast.title && (
                                            <Text style={{
                                                fontWeight: 800,
                                                fontSize: '0.9rem',
                                                color: '#fff',
                                                letterSpacing: '0.5px',
                                                textTransform: 'uppercase'
                                            }}>
                                                {toast.title}
                                            </Text>
                                        )}
                                        <Text style={{
                                            fontSize: '0.85rem',
                                            fontWeight: 500,
                                            color: 'rgba(255, 255, 255, 0.85)',
                                            lineHeight: 1.4
                                        }}>
                                            {toast.message}
                                        </Text>
                                    </Stack>
                                </Flex>
                            </div>
                        );
                    })}
                </div>
            </Portal>
            <style jsx global>{`
                @keyframes toast-slide-in {
                    from {
                        transform: translateX(120%) scale(0.9);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0) scale(1);
                        opacity: 1;
                    }
                }
            `}</style>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
