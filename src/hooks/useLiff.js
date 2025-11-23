// src/hooks/useLiff.js

"use client";

import { useState, useEffect } from 'react';

const useLiff = (liffId) => {
    const [liffObject, setLiffObject] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const initializeLiff = async () => {
            if (!liffId) {
                setError("LIFF ID is not provided.");
                setLoading(false);
                return;
            }
            try {
                const liff = (await import('@line/liff')).default;
                await liff.init({ liffId });

                const params = new URLSearchParams(window.location.search);
                let redirectPath = params.get('liff.state');
                console.debug('useLiff: raw liff.state from query =', redirectPath);

                if (redirectPath) {
                    try {
                        let decoded = redirectPath;
                        for (let i = 0; i < 3; i++) {
                            const prev = decoded;
                            try { decoded = decodeURIComponent(decoded); } catch (e) { break; }
                            if (decoded === prev) break;
                        }

                        const nestedMatch = decoded.match(/liff\.state=([^&]+)/);
                        if (nestedMatch && nestedMatch[1]) {
                            try { decoded = decodeURIComponent(nestedMatch[1]); } catch (e) {}
                        }

                        decoded = decoded.split('?')[0].trim();
                        let targetPath = decoded;
                        if (!targetPath.startsWith('/')) {
                            targetPath = '/' + targetPath;
                        }

                        const currentPath = window.location.pathname || '/';

                        if (targetPath === '/confirm' && currentPath === '/confirm') {
                            const sp = new URLSearchParams(window.location.search);
                            sp.delete('liff.state');
                            const qs = sp.toString();
                            const newUrl = window.location.pathname + (qs ? `?${qs}` : '');
                            window.history.replaceState(null, '', newUrl);
                            return;
                        }

                        const segments = targetPath.split('/').filter(Boolean);
                        if (segments.length === 1) {
                            targetPath = `/confirm/${segments[0]}`;
                        } else if (segments.length >= 2 && segments[0] !== 'confirm') {
                            console.warn('liff.state contains path outside /confirm, ignoring:', targetPath);
                            return;
                        }

                        if (!targetPath.startsWith('/confirm')) return;

                        if (currentPath === targetPath) {
                            const sp2 = new URLSearchParams(window.location.search);
                            sp2.delete('liff.state');
                            const qs2 = sp2.toString();
                            const newUrl2 = window.location.pathname + (qs2 ? `?${qs2}` : '');
                            window.history.replaceState(null, '', newUrl2);
                            return;
                        }

                        window.location.replace(targetPath);
                        return;
                    } catch (e) {
                        console.warn('Failed to normalize liff.state', e);
                    }
                }

                if (!liff.isLoggedIn()) {
                    liff.login({ 
                        redirectUri: window.location.href,
                        scope: 'profile openid chat_message.write'
                    });
                    return;
                }

                // ดึง profile เพื่อให้ useLiffAuth ใช้ accessToken ได้
                const userProfile = await liff.getProfile();
                setProfile(userProfile);
                setLiffObject(liff);

            } catch (err) {
                console.error("LIFF initialization failed", err);
                
                // --- ส่วนที่แก้ไข ---
                // แสดง Error ที่ละเอียดขึ้นบนหน้าจอเพื่อการดีบัก
                const detailedError = `การเชื่อมต่อ LINE ไม่สมบูรณ์: ${err.message || 'Unknown error'}`;
                setError(detailedError);
                // --- จบส่วนที่แก้ไข ---
                
            } finally {
                setLoading(false);
            }
        };

        initializeLiff();
    }, [liffId]);

    return { liff: liffObject, profile, loading, error };
};

export default useLiff;
