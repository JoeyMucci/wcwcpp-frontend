"use client"

import { useState, useEffect, useRef } from 'react';
import { Container, Card, Title, Text, Stack, Flex } from '@mantine/core';
import { IconLock } from '@tabler/icons-react';
import { authClient } from '@/api/client';

interface AuthGuardProps {
    children: React.ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(true);
    const [authError, setAuthError] = useState<string | null>(null);
    const googleBtnRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("wcwcpp_token");
        if (!token) {
            setIsAuthenticated(false);
        } else {
            setIsAuthenticated(true);
        }
        setLoading(false);
    }, []);

    // Initialize Google GIS button if unauthenticated
    useEffect(() => {
        if (!isAuthenticated && !loading && typeof window !== 'undefined') {
            let attempt = 0;
            const initGIS = () => {
                if (!window.google) {
                    setTimeout(initGIS, 100);
                    return;
                }

                const btnNode = document.getElementById("guard-google-btn") || googleBtnRef.current;
                if (!btnNode) {
                    if (attempt < 20) {
                        attempt++;
                        setTimeout(initGIS, 50);
                    }
                    return;
                }

                const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "1028710255869-mockclientid.apps.googleusercontent.com";

                try {
                    window.google.accounts.id.initialize({
                        client_id: clientId,
                        use_fedcm_for_prompt: false,
                        callback: async (response: any) => {
                            try {
                                const idToken = response.credential;
                                let derivedUsername = "";
                                try {
                                    const payloadPart = idToken.split(".")[1];
                                    const decodedPayload = JSON.parse(atob(payloadPart));
                                    derivedUsername = decodedPayload.name || decodedPayload.given_name || decodedPayload.email.split("@")[0];
                                } catch (decodeErr) {
                                    console.error("Failed to decode ID token payload", decodeErr);
                                }

                                const res = await authClient.login({
                                    googleIdToken: idToken,
                                    username: derivedUsername
                                });

                                if (res.accessToken && res.user) {
                                    localStorage.setItem("wcwcpp_token", res.accessToken);
                                    const loggedInUser = {
                                        name: res.user.username || res.user.email.split('@')[0],
                                        email: res.user.email,
                                        avatar: ""
                                    };
                                    localStorage.setItem("wcwcpp_user", JSON.stringify(loggedInUser));

                                    // Refresh to update header and load page children
                                    window.location.reload();
                                }
                            } catch (err: any) {
                                console.error("Guard login failed", err);
                                setAuthError(`Sign in failed: ${err.message || String(err)}`);
                            }
                        }
                    });

                    window.google.accounts.id.renderButton(
                        btnNode,
                        { theme: "filled_blue", size: "large", width: 280 }
                    );
                } catch (err) {
                    console.error("GIS initialization in Guard failed", err);
                }
            };

            initGIS();
        }
    }, [isAuthenticated, loading]);

    if (loading) {
        return (
            <Container size="xs" style={{ paddingTop: '8rem', paddingBottom: '8rem' }}>
                <Text ta="center" size="lg" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    Verifying session...
                </Text>
            </Container>
        );
    }

    if (!isAuthenticated) {
        return (
            <Container size="xs" style={{ paddingTop: '6rem', paddingBottom: '8rem' }}>
                <Card className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                    <Flex justify="center" mb="lg">
                        <IconLock size={48} color="#DFFF00" className="text-neon" />
                    </Flex>

                    <Title order={2} style={{ color: '#fff', fontSize: '1.75rem', fontWeight: 900 }} mb="sm">
                        Authentication Required
                    </Title>

                    <Text size="sm" style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }} mb="xl">
                        Prediction contests, match picking, and private leaderboards are only accessible to signed-in users. Click below to sign in using your Google account.
                    </Text>

                    {authError && (
                        <Card style={{ backgroundColor: 'rgba(250, 82, 82, 0.1)', border: '1px solid rgba(250, 82, 82, 0.2)', marginBottom: '1.5rem' }} p="sm" radius="md">
                            <Text size="xs" style={{ color: '#ff8787', fontWeight: 600 }}>
                                {authError}
                            </Text>
                        </Card>
                    )}

                    <Flex justify="center">
                        <div
                            ref={googleBtnRef}
                            id="guard-google-btn"
                            style={{ minHeight: '40px', width: '280px' }}
                        />
                    </Flex>
                </Card>
            </Container>
        );
    }

    return <>{children}</>;
};
