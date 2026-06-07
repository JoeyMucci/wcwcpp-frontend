"use client"

declare global {
    interface Window {
        google?: any;
    }
}

import { Button, Flex, Image, Stack, Modal, Title, Text, Avatar, TextInput, Card } from "@mantine/core";
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useRef } from 'react';
import { IconMenu2, IconX, IconLogout } from "@tabler/icons-react";
import classes from './Header.module.css';
import { authClient } from '@/api/client';

const GoogleIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6-3.01-4.63-6.19-4.63z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
    </svg>
);

const links = [
    { link: '/', label: 'Home' },
    { link: '/contests', label: 'Contests' },
    { link: '/rules', label: 'Scoring Rules' },
]

export const WebHeader = () => {
    const router = useRouter()
    const pathname = usePathname()
    const googleBtnRef = useRef<HTMLDivElement | null>(null);
    const [modalOpened, modalHandlers] = useDisclosure(false);
    const [authModalOpened, authModalHandlers] = useDisclosure(false);
    const [user, setUser] = useState<{ name: string; email: string; avatar: string } | null>(null);
    const [authError, setAuthError] = useState<string | null>(null);

    let largeScreen = useMediaQuery('(min-width: 56em)')
    largeScreen = largeScreen === undefined ? true : largeScreen

    // Load auth status from localStorage on path change
    useEffect(() => {
        const token = localStorage.getItem("wcwcpp_token");
        const storedUser = localStorage.getItem("wcwcpp_user");
        if (token && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user details");
            }
        }
    }, [pathname]);

    // Initialize GIS when the Google modal is opened
    useEffect(() => {
        if (authModalOpened && typeof window !== 'undefined') {
            let attempt = 0;
            const initGIS = () => {
                if (!window.google) {
                    setTimeout(initGIS, 100);
                    return;
                }

                const btnNode = document.getElementById("google-signin-btn") || googleBtnRef.current;
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

                                // Decode the Google ID Token payload to get user's name/email prefix
                                let derivedUsername = "";
                                try {
                                    const payloadPart = idToken.split(".")[1];
                                    const decodedPayload = JSON.parse(atob(payloadPart));
                                    derivedUsername = decodedPayload.name || decodedPayload.given_name || decodedPayload.email.split("@")[0];
                                } catch (decodeErr) {
                                    console.error("Failed to decode ID token payload", decodeErr);
                                }

                                // Send token to the backend auth service
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
                                    setUser(loggedInUser);

                                    authModalHandlers.close();
                                    window.location.reload();
                                }
                            } catch (err: any) {
                                console.error("Backend login request failed", err);
                                setAuthError(`Backend login failed: ${err.message || String(err)}`);
                            }
                        }
                    });

                    // Render the official Google Sign-In button
                    window.google.accounts.id.renderButton(
                        btnNode,
                        { theme: "filled_blue", size: "large", width: 280 }
                    );

                    // Prompt One Tap (skip on localhost to avoid FedCM console noise)
                    if (window.location.hostname !== 'localhost') {
                        window.google.accounts.id.prompt();
                    }
                } catch (err) {
                    console.error("GIS initialization failed", err);
                }
            };

            initGIS();
        }
    }, [authModalOpened]);

    const handleLogin = () => {
        authModalHandlers.open();
    };



    const handleLogout = () => {
        localStorage.removeItem("wcwcpp_token");
        localStorage.removeItem("wcwcpp_user");
        setUser(null);
        if (pathname === "/") {
            window.location.reload();
        } else {
            router.push("/");
        }
    };

    const currentTab = pathname === "/" ? "/" : "/" + pathname.split('/')[1];

    return (
        <header className={classes.header}>
            <div className={classes.inner}>
                {/* Logo and Brand */}
                <div className={classes.brand} onClick={() => router.push('/')}>
                    <Image
                        src="/favicon.jpg"
                        alt="WCWCPP Logo"
                        h={36}
                        w={36}
                        fallbackSrc="data:image/svg+xml;utf8,<svg xmuplns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='40' fill='%232E6F40'/><circle cx='50' cy='50' r='30' fill='%23DFFF00'/></svg>"
                    />
                </div>

                {/* Navigation Links (Desktop) */}
                {largeScreen && (
                    <nav className={classes.navLinks}>
                        {links.map((link, i) => {
                            const active = currentTab === link.link;
                            return (
                                <button
                                    key={i}
                                    className={`${classes.link} ${active ? classes.linkActive : ''}`}
                                    onClick={() => router.push(link.link)}
                                >
                                    {link.label}
                                </button>
                            );
                        })}
                    </nav>
                )}

                {/* User Session Controls */}
                <Flex align="center" gap="md">
                    {user ? (
                        <Flex align="center" gap="sm">
                            {largeScreen && (
                                <Stack gap={0} align="flex-end">
                                    <Text size="sm" style={{ color: '#fff', fontWeight: 600 }}>{user.name}</Text>
                                    <Text size="xs" style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{user.email}</Text>
                                </Stack>
                            )}
                            <Avatar src={user.avatar} color="brandGreen" radius="xl">
                                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </Avatar>
                            <Button
                                variant="outline"
                                color="red"
                                size="xs"
                                onClick={handleLogout}
                                leftSection={<IconLogout size={14} />}
                                styles={{ root: { borderColor: 'rgba(240, 62, 62, 0.3)' } }}
                            >
                                Sign Out
                            </Button>
                        </Flex>
                    ) : (
                        <Button
                            variant="filled"
                            onClick={handleLogin}
                            leftSection={<GoogleIcon />}
                            styles={{
                                root: {
                                    backgroundColor: '#2E6F40',
                                    color: '#fff',
                                    fontWeight: 700,
                                    borderRadius: '8px',
                                    height: '38px',
                                    border: '1px solid rgba(46, 111, 64, 0.3)',
                                    '&:hover': {
                                        backgroundColor: '#255933'
                                    }
                                }
                            }}
                        >
                            Sign In
                        </Button>
                    )}

                    {/* Mobile Hamburger menu */}
                    {!largeScreen && (
                        <IconMenu2
                            size={28}
                            color="#fff"
                            style={{ cursor: "pointer" }}
                            onClick={() => modalHandlers.open()}
                        />
                    )}
                </Flex>
            </div>

            {/* Mobile Navigation Menu Modal */}
            <Modal
                opened={modalOpened}
                onClose={modalHandlers.close}
                fullScreen
                transitionProps={{ transition: 'fade', duration: 200 }}
                withCloseButton={false}
                styles={{
                    body: {
                        padding: 0,
                        backgroundColor: '#0b140e',
                    },
                }}
            >
                <Stack justify="space-between" pb={150} style={{ height: '100vh', width: '100vw' }} bg="#0b140e" p="xl">
                    <Flex align="center" justify="space-between">
                        <Title order={3} style={{ color: '#fff', fontWeight: 900 }}>MENU</Title>
                        <IconX
                            size={28}
                            color="#fff"
                            style={{ cursor: "pointer" }}
                            onClick={() => modalHandlers.close()}
                        />
                    </Flex>

                    <Stack gap="lg" align="center" style={{ flex: 1, justifyContent: 'center' }}>
                        {links.map((link, i) => {
                            const active = currentTab === link.link;
                            return (
                                <Button
                                    key={i}
                                    variant="subtle"
                                    size="lg"
                                    onClick={() => { modalHandlers.close(); router.push(link.link) }}
                                    styles={{
                                        root: {
                                            color: active ? '#DFFF00' : 'rgba(255, 255, 255, 0.8)',
                                            fontSize: '1.5rem',
                                            fontWeight: 800
                                        }
                                    }}
                                >
                                    {link.label}
                                </Button>
                            );
                        })}
                    </Stack>
                </Stack>
            </Modal>

            {/* Google Authentication Modal */}
            <Modal
                opened={authModalOpened}
                onClose={authModalHandlers.close}
                title={
                    <Text style={{ color: '#fff', fontWeight: 900, fontSize: '1.25rem' }}>
                        Sign In with Google
                    </Text>
                }
                centered
                styles={{
                    content: {
                        backgroundColor: '#0d1b12',
                        border: '1px solid rgba(46, 111, 64, 0.3)',
                        borderRadius: '16px',
                        padding: '1.5rem',
                    },
                    header: {
                        backgroundColor: '#0d1b12',
                        borderBottom: '1px solid rgba(46, 111, 64, 0.15)',
                        paddingBottom: '1rem',
                    },
                }}
            >
                <Stack gap="md" pt="md" align="center" style={{ textAlign: 'center' }}>
                    <Text size="sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                        Sign in to submit your predictions, compete in subcontests, and win prizes!
                    </Text>

                    {authError && (
                        <Card style={{ backgroundColor: 'rgba(250, 82, 82, 0.1)', border: '1px solid rgba(250, 82, 82, 0.2)' }} p="sm" radius="md">
                            <Text size="xs" style={{ color: '#ff8787', fontWeight: 600 }}>
                                {authError}
                            </Text>
                        </Card>
                    )}

                    {/* Google standard native container */}
                    <div
                        ref={googleBtnRef}
                        id="google-signin-btn"
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            marginTop: '1rem',
                            minHeight: '40px',
                            width: '100%'
                        }}
                    />


                </Stack>
            </Modal>
        </header>
    )
}
