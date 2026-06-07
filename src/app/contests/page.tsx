"use client"

import { useState, useEffect } from 'react';
import { Title, Text, Container, Grid, Card, Button, Flex, TextInput, SegmentedControl, Stack } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { IconTrophy, IconSearch, IconUsers, IconCalendar } from '@tabler/icons-react';
import { contestsClient, mapApiError } from '@/api/client';

interface Contest {
    id: string;
    name: string;
    status: 'ACTIVE' | 'UPCOMING' | 'COMPLETED';
    participants: number;
    groupOpen: string;
    groupLock: string;
    knockoutOpen: string;
    knockoutLock: string;
}

export default function ContestsDirectoryPage() {
    const router = useRouter();
    const [contests, setContests] = useState<Contest[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    useEffect(() => {
        const fetchContests = async () => {
            setError(null);
            try {
                const res = await contestsClient.listContests({});
                if (res.contests && res.contests.length > 0) {
                    const mapped = res.contests.map((c: any) => {
                        const now = new Date();
                        const unlockTime = c.groupUnlockDate ? new Date(Number(c.groupUnlockDate.seconds) * 1000) : new Date(0);
                        const lockTime = c.groupLockDate ? new Date(Number(c.groupLockDate.seconds) * 1000) : new Date(Date.now() + 86400000);

                        let status: 'ACTIVE' | 'UPCOMING' | 'COMPLETED' = 'UPCOMING';
                        if (now >= unlockTime && now < lockTime) {
                            status = 'ACTIVE';
                        } else if (now >= lockTime) {
                            status = 'COMPLETED';
                        }

                        return {
                            id: c.slug || c.id || Math.random().toString(),
                            name: c.title || c.name || 'Prediction Contest',
                            status: status as any,
                            participants: c.participantCount || 0,
                            groupOpen: c.groupUnlockDate ? new Date(Number(c.groupUnlockDate.seconds) * 1000).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) : 'TBD',
                            groupLock: c.groupLockDate ? new Date(Number(c.groupLockDate.seconds) * 1000).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) : 'TBD',
                            knockoutOpen: c.knockoutUnlockDate ? new Date(Number(c.knockoutUnlockDate.seconds) * 1000).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) : 'TBD',
                            knockoutLock: c.knockoutLockDate ? new Date(Number(c.knockoutLockDate.seconds) * 1000).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) : 'TBD',
                        };
                    });
                    setContests(mapped);
                } else {
                    setContests([]);
                }
            } catch (err: any) {
                console.error("Failed to fetch contests from API", err);
                setError(mapApiError(err));
                setContests([]);
            } finally {
                setLoading(false);
            }
        };

        fetchContests();
    }, []);

    const filteredContests = contests.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || c.status.toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    return (
        <Container size="lg" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
            <Flex justify="space-between" align="center" mb="2rem" direction={{ base: 'column', sm: 'row' }} gap="md">
                <div>
                    <Title order={1} style={{ color: '#fff', fontSize: '2.5rem', fontWeight: 900 }}>
                        🏆 Prediction Contests
                    </Title>
                </div>
            </Flex>

            {loading ? (
                <Text ta="center" size="lg" style={{ color: 'rgba(255,255,255,0.5)' }}>Loading contests...</Text>
            ) : error ? (
                <Card className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                    <Text size="md" style={{ color: '#ff8787', fontWeight: 600 }}>
                        {error}
                    </Text>
                </Card>
            ) : filteredContests.length === 0 ? (
                <Card className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
                    <Text size="lg" style={{ color: 'rgba(255,255,255,0.5)' }}>No contests found matching your filters.</Text>
                </Card>
            ) : (
                <Grid gutter="xl">
                    {filteredContests.map((contest) => (
                        <Grid.Col key={contest.id} span={{ base: 12, md: 6 }}>
                            <Card className="glass-panel" style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div>


                                    <Title order={3} style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>
                                        {contest.name}
                                    </Title>

                                    <Stack gap="xs" mb="xl">
                                        <Flex align="center" gap="xs">
                                            <IconCalendar size={16} color="rgba(255,255,255,0.4)" />
                                            <Text size="sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                                                Group stage picks open: <b>{contest.groupOpen}-{contest.groupLock}</b>
                                            </Text>
                                        </Flex>
                                        <Flex align="center" gap="xs">
                                            <IconCalendar size={16} color="rgba(255,255,255,0.4)" />
                                            <Text size="sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                                                Knockout stage picks open: <b>{contest.knockoutOpen}-{contest.knockoutLock}</b>
                                            </Text>
                                        </Flex>
                                    </Stack>
                                </div>

                                <Button
                                    fullWidth
                                    color="brandLime"
                                    style={{ color: '#000', fontWeight: 800 }}
                                    onClick={() => router.push(`/contests/${contest.id}`)}
                                    rightSection={<IconTrophy size={16} />}
                                >
                                    Enter Prediction Portal
                                </Button>
                            </Card>
                        </Grid.Col>
                    ))}
                </Grid>
            )}
        </Container>
    );
}
