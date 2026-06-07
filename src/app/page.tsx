"use client"

import { useState, useEffect } from 'react';
import { Title, Text, Stack, Flex, Button, Card, Container, Transition } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { IconTrophy, IconUsers, IconArrowRight } from '@tabler/icons-react';
import { usersClient } from '@/api/client';

export default function HomePage() {
    const router = useRouter();
    const [userCount, setUserCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [mounted, setMounted] = useState<boolean>(false);
    const [currentUser, setCurrentUser] = useState<{ name: string; email: string; avatar: string } | null>(null);
    const [deleting, setDeleting] = useState<boolean>(false);
    const [deleted, setDeleted] = useState<boolean>(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);

        const token = localStorage.getItem("wcwcpp_token");
        const storedUser = localStorage.getItem("wcwcpp_user");
        if (token && storedUser) {
            try {
                setCurrentUser(JSON.parse(storedUser));
            } catch {
                console.error("Failed to parse user details");
            }
        }

        const fetchUserCount = async () => {
            try {
                const userRes = await usersClient.countUsers({});
                setUserCount(Number(userRes.count));
            } catch (err) {
                console.error("Failed to load user count", err);
                setUserCount(0);
            } finally {
                setLoading(false);
            }
        };

        fetchUserCount();
    }, []);

    const handleDeleteUser = async () => {
        setDeleting(true);
        setDeleteError(null);
        try {
            await usersClient.deleteUser({});
            localStorage.removeItem("wcwcpp_token");
            localStorage.removeItem("wcwcpp_user");
            setDeleted(true);
        } catch (err: any) {
            console.error("Failed to delete user", err);
            setDeleteError(err.message || "An unexpected error occurred while deleting your account.");
            setDeleting(false);
        }
    };

    if (deleted) {
        return (
            <div style={{
                minHeight: '100vh',
                backgroundColor: '#050a06',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                textAlign: 'center'
            }}>
                <Stack gap="xl" align="center" style={{ maxWidth: '500px' }}>
                    <div style={{ fontSize: '7rem', animation: 'float 3s ease-in-out infinite' }}>
                        😭💔🥀
                    </div>
                    <Title order={1} style={{
                        fontSize: '3rem',
                        fontWeight: 900,
                        background: 'linear-gradient(90deg, #ff6b6b 0%, #868e96 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>
                        Goodbye, Friend.
                    </Title>
                    <Text size="lg" style={{ color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.6 }}>
                        Your account has been deleted. Every single pick you made, every point you earned, and all your traces on WCWCPP have been completely erased.
                    </Text>
                    <Text size="md" style={{ color: '#fa5252', fontStyle: 'italic', fontWeight: 600 }}>
                        {"\"We will forever look at our database and feel a void where your ID used to be...\""}
                    </Text>
                    <Button
                        variant="outline"
                        color="gray"
                        onClick={() => {
                            window.location.reload();
                        }}
                        style={{ marginTop: '1.5rem', color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}
                    >
                        Start Anew 🥺
                    </Button>
                </Stack>
            </div>
        );
    }

    return (
        <Transition mounted={mounted} transition="fade" duration={600} timingFunction="ease">
            {(styles) => (
                <div style={{ ...styles, minHeight: '100vh', paddingBottom: '4rem' }}>

                    {/* Hero Section */}
                    <div style={{
                        position: 'relative',
                        padding: '6rem 1rem 4rem 1rem',
                        textAlign: 'center',
                        background: 'linear-gradient(180deg, rgba(46, 111, 64, 0.25) 0%, rgba(11, 20, 14, 0) 100%)',
                        borderBottom: '1px solid rgba(46, 111, 64, 0.15)',
                        marginBottom: '3rem',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            fontSize: '12rem',
                            color: 'rgba(223, 255, 0, 0.03)',
                            fontWeight: 900,
                            pointerEvents: 'none',
                            userSelect: 'none'
                        }}>
                            WCWCPP
                        </div>

                        <Container size="lg">
                            <Title order={1} style={{
                                fontSize: '3.5rem',
                                fontWeight: 900,
                                letterSpacing: '-1px',
                                color: '#fff',
                                marginBottom: '1rem',
                                lineHeight: 1.15
                            }}>
                                <span style={{
                                    background: 'linear-gradient(90deg, #DFFF00 0%, #47ae69 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }} className="text-neon">
                                    Wacky & Cool World Cup
                                </span>
                                <br />
                                Prediction Platform
                            </Title>

                            <Text size="xl" style={{ color: 'rgba(255, 255, 255, 0.7)', maxWidth: '640px', margin: '0 auto 2.5rem auto', lineHeight: 1.6 }}>
                                Predict the World Cup through the group and knockout stages, challenge your friends, and compete for ultimate bragging rights!
                            </Text>

                            <Flex justify="center" gap="md" direction={{ base: 'column', sm: 'row' }} align="center">
                                <Button
                                    size="lg"
                                    color="brandLime"
                                    onClick={() => router.push('/contests')}
                                    rightSection={<IconTrophy size={18} />}
                                    style={{ color: '#000', fontWeight: 800 }}
                                >
                                    Enter Prediction Contests
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    color="brandGreen"
                                    onClick={() => router.push('/rules')}
                                    rightSection={<IconArrowRight size={18} />}
                                    styles={{ root: { borderColor: 'rgba(46,111,64,0.3)', color: '#fff' } }}
                                >
                                    View Scoring Rules
                                </Button>
                            </Flex>
                        </Container>
                    </div>

                    {/* Stats Counter */}
                    <Container size="lg">
                        {/* Live User Counter */}
                        <Card className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
                            <Flex direction="column" align="center" justify="center">
                                <Flex align="center" gap="sm" mb="xs">
                                    <IconUsers size={28} color="#DFFF00" className="text-neon" />
                                    <Text size="sm" style={{ color: 'rgba(255, 255, 255, 0.6)', letterSpacing: '2px', fontWeight: 700 }}>
                                        TOTAL REGISTERED PLAYERS
                                    </Text>
                                </Flex>
                                <Title style={{ fontSize: '4.5rem', fontWeight: 900, color: '#fff', margin: 0 }} className="text-neon">
                                    {loading ? "..." : userCount.toLocaleString()}
                                </Title>
                            </Flex>
                        </Card>
                    </Container>

                    {/* Danger Zone / Delete User Section */}
                    {currentUser && (
                        <Container size="sm" style={{ marginTop: '3rem' }}>
                            <Card style={{
                                background: 'rgba(200, 30, 30, 0.08)',
                                border: '2px solid rgba(255, 50, 50, 0.4)',
                                borderRadius: '16px',
                                padding: '2rem',
                                position: 'relative',
                                overflow: 'hidden',
                                boxShadow: '0 0 20px rgba(255, 0, 0, 0.15)',
                                animation: 'pulse-border 2s infinite ease-in-out'
                            }}>
                                <Stack gap="md" align="center" style={{ textAlign: 'center' }}>
                                    <div style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: 'rgba(255, 50, 50, 0.2)',
                                        borderRadius: '50%',
                                        width: '64px',
                                        height: '64px',
                                        marginBottom: '0.5rem',
                                        border: '1px solid rgba(255, 50, 50, 0.5)'
                                    }}>
                                        <span style={{ fontSize: '2.5rem' }}>⚠️</span>
                                    </div>

                                    <Title order={3} style={{ color: '#ff6b6b', fontWeight: 900, fontSize: '1.75rem', letterSpacing: '-0.5px' }}>
                                        UNRECOVERABLE DESTRUCTION
                                    </Title>

                                    <Text style={{ color: '#ffc9c9', fontWeight: 700, fontSize: '1.1rem', maxWidth: '500px' }}>
                                        WARNING: CLICKING THE BUTTON BELOW WILL IMMEDIATELY AND PERMANENTLY DELETE YOUR ACCOUNT.
                                    </Text>

                                    <Text size="sm" style={{ color: 'rgba(255, 255, 255, 0.65)', maxWidth: '480px', lineHeight: 1.5 }}>
                                        There is <strong style={{ color: '#ff6b6b' }}>NO CONFIRMATION PROMPT</strong>.
                                        All your predictions, subcontests and scores will be permanently vaporized from our servers.
                                        We cannot undo this action.
                                    </Text>

                                    {deleteError && (
                                        <Text size="sm" style={{ color: '#ff6b6b', fontWeight: 600 }}>
                                            Error: {deleteError}
                                        </Text>
                                    )}

                                    <Button
                                        color="red"
                                        size="lg"
                                        onClick={handleDeleteUser}
                                        loading={deleting}
                                        style={{
                                            backgroundColor: '#c92a2a',
                                            color: '#fff',
                                            fontWeight: 800,
                                            border: '2px solid rgba(255,255,255,0.2)',
                                            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
                                            transition: 'transform 0.2s ease, background-color 0.2s ease',
                                            marginTop: '1rem'
                                        }}
                                        styles={{
                                            root: {
                                                '&:hover': {
                                                    backgroundColor: '#a61c1c',
                                                    transform: 'scale(1.02)'
                                                },
                                                '&:active': {
                                                    transform: 'scale(0.98)'
                                                }
                                            }
                                        }}
                                    >
                                        {"😭 Please don't go... 🥺"}
                                    </Button>

                                    <Text size="xs" style={{ color: 'rgba(255, 255, 255, 0.4)', fontStyle: 'italic' }}>
                                        {"\"If you leave, a small part of our server's database will cry in loneliness... 💔\""}
                                    </Text>
                                </Stack>
                            </Card>
                        </Container>
                    )}
                </div>
            )}
        </Transition>
    );
}