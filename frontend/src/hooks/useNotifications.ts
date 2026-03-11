import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Notification } from '../types';
import toast from 'react-hot-toast';
import { notificationService } from '@/services/notificationService';

const SOCKET_URL = 'http://localhost:8080/ws-clinic';

export const useNotifications = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const clientRef = useRef<Client | null>(null);

    // Initial fetch
    const fetchInitialData = useCallback(async () => {
        try {
            const [notifsResponse, countResponse] = await Promise.all([
                notificationService.getNotifications(0, 20),
                notificationService.getUnreadCount()
            ]);
            setNotifications(notifsResponse.result.content);
            setUnreadCount(countResponse.result);
        } catch (error) {
            console.error('Failed to fetch initial notifications', error);
        }
    }, []);

    const connect = useCallback(() => {
        const token = localStorage.getItem('access_token');
        if (!token || clientRef.current?.active) return;

        const client = new Client({
            webSocketFactory: () => new SockJS(SOCKET_URL),
            connectHeaders: {
                Authorization: `Bearer ${token}`
            },
            debug: () => {
                // STOMP Debug
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = (frame) => {
            console.log('Connected to WebSocket: ' + frame);

            // Subscribe to user-specific notification queue
            client.subscribe('/user/queue/notifications', (message) => {
                const newNotification: Notification = JSON.parse(message.body);
                setNotifications((prev) => [newNotification, ...prev]);
                setUnreadCount((prev) => prev + 1);

                // Show toast for new notification
                toast.success(`${newNotification.title}: ${newNotification.message}`, {
                    icon: '🔔',
                    duration: 5000,
                });
            });
        };

        client.onStompError = (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        };

        client.activate();
        clientRef.current = client;
    }, []);

    const disconnect = useCallback(() => {
        if (clientRef.current) {
            clientRef.current.deactivate();
            clientRef.current = null;
        }
    }, []);

    const markAsRead = async (id: string) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark notification as read', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read', error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchInitialData();
            connect();
        } else {
            disconnect();
        }

        return () => disconnect();
    }, [user, connect, disconnect, fetchInitialData]);

    return {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead
    };
};
