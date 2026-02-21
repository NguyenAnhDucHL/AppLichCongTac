import { collection, addDoc, query, where, orderBy, limit, startAfter, getDocs, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getCurrentUser } from './AuthService';

const LOGS_COLLECTION = 'activityLogs';
const PAGE_SIZE = 20;

/**
 * Action type constants
 */
export const LOG_ACTIONS = {
    LOGIN: 'Đăng nhập hệ thống',
    LOGOUT: 'Đăng xuất hệ thống',
    SCHEDULE_ADD: 'Thêm sự kiện lịch',
    SCHEDULE_EDIT: 'Cập nhật sự kiện lịch',
    SCHEDULE_DELETE: 'Xóa sự kiện lịch',
    USER_UPDATE: 'Cập nhật thông tin cá nhân',
    AVATAR_UPDATE: 'Cập nhật ảnh đại diện',
};

/**
 * Write an activity log entry to Firestore.
 * Safe to call: never throws, silently swallows errors.
 */
export const logActivity = async (action, details = '', overrideUser = null) => {
    try {
        let userName = 'Hệ thống';
        let userId = 'system';

        if (overrideUser) {
            userName = overrideUser.fullName || overrideUser.username || 'Người dùng';
            userId = overrideUser.id || overrideUser.username || 'unknown';
        } else {
            try {
                const user = await getCurrentUser();
                if (user) {
                    userName = user.fullName || user.username || 'Người dùng';
                    userId = user.id || user.username || 'unknown';
                }
            } catch (_) {
                // getCurrentUser may fail during login flow — that's OK
            }
        }

        await addDoc(collection(db, LOGS_COLLECTION), {
            action,
            details,
            userName,
            userId,
            createdAt: Timestamp.now(),
        });
    } catch (error) {
        // Never let logging crash the app
        console.warn('[ActivityLog] Failed to write log:', error?.message);
    }
};

/**
 * Fetch activity logs with period filter and cursor-based pagination.
 * @param {Date} startDate  - filter start date
 * @param {DocumentSnapshot|null} lastDoc - cursor for next page (null = first page)
 * @param {number} pageSize
 * @returns {{ logs: Array, lastDoc: DocumentSnapshot|null, hasMore: boolean }}
 */
export const getActivityLogs = async (startDate, lastDoc = null, pageSize = PAGE_SIZE) => {
    try {
        const startTimestamp = Timestamp.fromDate(startDate);

        let q = query(
            collection(db, LOGS_COLLECTION),
            where('createdAt', '>=', startTimestamp),
            orderBy('createdAt', 'desc'),
            limit(pageSize + 1) // fetch one extra to detect hasMore
        );

        if (lastDoc) {
            q = query(
                collection(db, LOGS_COLLECTION),
                where('createdAt', '>=', startTimestamp),
                orderBy('createdAt', 'desc'),
                startAfter(lastDoc),
                limit(pageSize + 1)
            );
        }

        const snapshot = await getDocs(q);
        const docs = snapshot.docs;
        const hasMore = docs.length > pageSize;
        const pageDocs = hasMore ? docs.slice(0, pageSize) : docs;

        const logs = pageDocs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            // Convert Firestore Timestamp → JS Date for easy use in UI
            timestamp: doc.data().createdAt?.toDate?.() || new Date(),
        }));

        return {
            logs,
            lastDoc: pageDocs.length > 0 ? pageDocs[pageDocs.length - 1] : null,
            hasMore,
        };
    } catch (error) {
        console.error('[ActivityLog] Failed to fetch logs:', error);
    }
};

/**
 * Setup a real-time listener for the first page of activity logs.
 * @param {Date} startDate - filter start date
 * @param {function} callback - called with { logs, lastDoc, hasMore }
 * @param {number} pageSize 
 * @returns {function} unsubscribe function
 */
export const listenToActivityLogs = (startDate, callback, pageSize = PAGE_SIZE) => {
    const startTimestamp = Timestamp.fromDate(startDate);

    const q = query(
        collection(db, LOGS_COLLECTION),
        where('createdAt', '>=', startTimestamp),
        orderBy('createdAt', 'desc'),
        limit(pageSize + 1)
    );

    return onSnapshot(q, (snapshot) => {
        const docs = snapshot.docs;
        const hasMore = docs.length > pageSize;
        const pageDocs = hasMore ? docs.slice(0, pageSize) : docs;

        const logs = pageDocs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().createdAt?.toDate?.() || new Date(),
        }));

        const result = {
            logs,
            lastDoc: pageDocs.length > 0 ? pageDocs[pageDocs.length - 1] : null,
            hasMore,
        };

        callback(result);
    }, (error) => {
        console.error('[ActivityLog] Failed to listen to logs:', error);
        callback({ logs: [], lastDoc: null, hasMore: false });
    });
};
