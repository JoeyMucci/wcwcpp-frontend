"use client"

import { useState, useEffect } from 'react';
import { Title, Text, Container, Grid, Card, Button, Badge, Flex, Table, Modal, TextInput, ActionIcon, Stack, Group, Checkbox } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useRouter, useParams } from 'next/navigation';
import { IconTrophy, IconEdit, IconAward, IconUsers, IconTrash, IconPlus, IconLock, IconFolderPlus, IconEye } from '@tabler/icons-react';
import { contestsClient, leaderboardsClient, mapApiError } from '@/api/client';
import { useToast } from '@/components/Toast/ToastContext';
import { AuthGuard } from '@/components/AuthGuard';

interface Subcontest {
    id: string;
    name: string;
    isOwner: boolean;
    isMember: boolean;
    joinCode?: string;
}

export default function ContestRootPage() {
    const router = useRouter();
    const params = useParams();
    const contestId = params.contestId as string;
    const { showToast } = useToast();

    const [contestName, setContestName] = useState<string>('');
    const [lockTime, setLockTime] = useState<string>('');
    const [subcontests, setSubcontests] = useState<Subcontest[]>([]);
    const [leaderboardEntries, setLeaderboardEntries] = useState<{ username: string; score: number }[]>([]);
    const [leaderboardError, setLeaderboardError] = useState<string | null>(null);
    const [leaderboardLoading, setLeaderboardLoading] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [createError, setCreateError] = useState<string | null>(null);

    // Modal state
    const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
    const [newSubcontestName, setNewSubcontestName] = useState<string>('');
    const [selfJoin, setSelfJoin] = useState<boolean>(true);
    const [joinModalOpened, { open: openJoinModal, close: closeJoinModal }] = useDisclosure(false);
    const [joinCodeInput, setJoinCodeInput] = useState<string>('');
    const [joinError, setJoinError] = useState<string | null>(null);
    const [joining, setJoining] = useState<boolean>(false);

    useEffect(() => {
        const fetchContestData = async () => {
            setLoading(true);
            setError(null);
            try {
                const listRes = await contestsClient.listContests({});
                const contest = listRes.contests?.find(c => c.slug === contestId);
                if (contest) {
                    setContestName(contest.title);
                    if (contest.groupLockDate) {
                        const date = new Date(Number(contest.groupLockDate.seconds) * 1000);
                        setLockTime(date.toLocaleString());
                    } else {
                        setLockTime('TBD');
                    }
                }
            } catch (err: any) {
                console.error("Failed to load contest title", err);
            }

            try {
                // Fetch subcontests for this contest from the Contest service
                const subRes = await contestsClient.listSubcontests({ contestSlug: contestId });
                if (subRes.subcontests) {
                    const mapped = subRes.subcontests.map((s: any) => ({
                        id: s.slug,
                        name: s.title,
                        isOwner: !!s.isOwner,
                        isMember: !!s.isMember,
                        joinCode: s.joinCode
                    }));
                    setSubcontests(mapped);
                }
            } catch (err: any) {
                console.error("Failed to fetch subcontests from API", err);
                setError(mapApiError(err));
                setSubcontests([]);
            } finally {
                setLoading(false);
            }

            setLeaderboardLoading(true);
            setLeaderboardError(null);
            try {
                const res = await leaderboardsClient.leaderboard({ contestSlug: contestId, limit: 3 });
                const overall = res.overall || [];
                const mapped = overall.slice(0, 3).map((e: any) => ({
                    username: e.name,
                    score: Number(e.score)
                }));
                setLeaderboardEntries(mapped);
            } catch (err: any) {
                console.error("Failed to fetch top standings", err);
                setLeaderboardError(mapApiError(err));
                setLeaderboardEntries([]);
            } finally {
                setLeaderboardLoading(false);
            }
        };

        fetchContestData();
    }, [contestId]);

    const handleCreateSubcontest = async () => {
        if (!newSubcontestName.trim()) return;
        setCreateError(null);

        try {
            await contestsClient.createSubcontest({
                contestSlug: contestId,
                subcontestTitle: newSubcontestName,
                selfJoin: selfJoin,
            });

            // Refetch subcontests to retrieve slug and join code since CreateSubcontestResponse is empty
            const subRes = await contestsClient.listSubcontests({ contestSlug: contestId });
            if (subRes.subcontests) {
                const mapped = subRes.subcontests.map((s: any) => ({
                    id: s.slug,
                    name: s.title,
                    isOwner: !!s.isOwner,
                    isMember: !!s.isMember,
                    joinCode: s.joinCode
                }));
                setSubcontests(mapped);
            }
            setNewSubcontestName('');
            setSelfJoin(true);
            closeModal();
        } catch (err: any) {
            console.error("Failed to create subcontest via API", err);
            setCreateError(err.message || "Failed to create subcontest on backend. Please try again.");
        }
    };

    const handleDeleteSubcontest = async (subcontestId: string) => {
        try {
            await contestsClient.deleteSubcontest({ subcontestSlug: subcontestId });
            setSubcontests(prev => prev.filter(s => s.id !== subcontestId));
        } catch (err) {
            console.error("Failed to delete subcontest via API, deleting locally", err);
            setSubcontests(prev => prev.filter(s => s.id !== subcontestId));
        }
    };

    const handleJoinSubcontest = async () => {
        if (!joinCodeInput.trim()) return;
        setJoinError(null);
        setJoining(true);
        try {
            await contestsClient.joinSubcontest({
                joinCode: joinCodeInput.trim()
            });
            setJoinCodeInput('');
            closeJoinModal();

            // Refetch subcontests to show the newly joined subcontest
            const subRes = await contestsClient.listSubcontests({ contestSlug: contestId });
            if (subRes.subcontests) {
                const mapped = subRes.subcontests.map((s: any) => ({
                    id: s.slug || Math.random().toString(),
                    name: s.title || 'Subcontest',
                    isOwner: !!s.isOwner,
                    isMember: !!s.isMember,
                    joinCode: s.joinCode
                }));
                setSubcontests(mapped);
            }
            showToast("Joined subcontest successfully!", "success", "Success");
        } catch (err: any) {
            console.error("Failed to join subcontest via API", err);
            setJoinError(err.message || "Failed to join subcontest. Please verify the join code and try again.");
        } finally {
            setJoining(false);
        }
    };

    return (
        <AuthGuard>
            <Container size="lg" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>

                {/* Header info */}
                <Card className="glass-panel" style={{ padding: '2.5rem', marginBottom: '3rem' }}>
                    <Flex justify="space-between" align="center" direction={{ base: 'column', md: 'row' }} gap="xl">
                        <div>
                            <Flex align="center" gap="sm" mb="xs">
                                <IconTrophy size={24} color="#DFFF00" className="text-neon" />
                                <Text size="xs" style={{ color: '#DFFF00', letterSpacing: '2px', fontWeight: 800 }}>CONTEST CENTER</Text>
                            </Flex>
                            <Title order={1} style={{ color: '#fff', fontSize: '2.25rem', fontWeight: 900 }} mb="sm">
                                {contestName}
                            </Title>
                        </div>

                        <Flex gap="md" direction={{ base: 'column', sm: 'row' }}>
                            <Button
                                size="lg"
                                color="brandGreen"
                                onClick={() => router.push(`/contests/${contestId}/picks`)}
                                leftSection={<IconEdit size={18} />}
                                styles={{ root: { backgroundColor: '#2E6F40' } }}
                            >
                                Prediction Editor
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                color="brandLime"
                                onClick={() => router.push(`/contests/${contestId}/standings`)}
                                leftSection={<IconAward size={18} />}
                            >
                                View Standings
                            </Button>
                        </Flex>
                    </Flex>
                </Card>

                <Grid gutter="xl">

                    {/* Standings preview */}
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <Card className="glass-panel" style={{ padding: '2rem', height: '100%' }}>
                            <Flex align="center" gap="sm" mb="lg">
                                <IconAward size={24} color="#DFFF00" className="text-neon" />
                                <Title order={3} style={{ color: '#fff', fontSize: '1.25rem' }}>Global Standings Top 3</Title>
                            </Flex>

                            {leaderboardLoading ? (
                                <Text size="sm" style={{ color: 'rgba(255,255,255,0.5)' }} ta="center" py="md">Loading standings...</Text>
                            ) : leaderboardError ? (
                                <Text size="sm" style={{ color: '#ff8787', fontWeight: 600 }} ta="center" py="md">
                                    {leaderboardError}
                                </Text>
                            ) : leaderboardEntries.length === 0 ? (
                                <Text size="sm" style={{ color: 'rgba(255,255,255,0.5)' }} ta="center" py="md" mb="xl">
                                    There&apos;s nobody stopping you!
                                </Text>
                            ) : (
                                <Table verticalSpacing="sm" style={{ color: 'rgba(255,255,255,0.8)' }} mb="xl">
                                    <Table.Tbody>
                                        {leaderboardEntries.map((e, idx) => (
                                            <Table.Tr key={e.username} style={{ borderColor: 'rgba(46,111,64,0.1)' }}>
                                                <Table.Td>
                                                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'} <b>{e.username}</b>
                                                </Table.Td>
                                                <Table.Td ta="right">
                                                    <b style={{ color: idx === 0 ? '#DFFF00' : 'inherit' }}>{e.score} pts</b>
                                                </Table.Td>
                                            </Table.Tr>
                                        ))}
                                    </Table.Tbody>
                                </Table>
                            )}

                            <Button
                                variant="subtle"
                                color="brandLime"
                                fullWidth
                                onClick={() => router.push(`/contests/${contestId}/standings`)}
                            >
                                View Full Standings &rarr;
                            </Button>
                        </Card>
                    </Grid.Col>

                    {/* Subcontests Directory */}
                    <Grid.Col span={{ base: 12, md: 8 }}>
                        <Card className="glass-panel" style={{ padding: '2rem' }}>
                            <Flex justify="space-between" align="center" mb="xl">
                                <Flex align="center" gap="sm">
                                    <IconUsers size={24} color="#DFFF00" className="text-neon" />
                                    <Title order={3} style={{ color: '#fff', fontSize: '1.25rem' }}>Your Subcontests</Title>
                                </Flex>
                                <Group gap="xs">
                                    <Button
                                        size="xs"
                                        variant="outline"
                                        color="brandLime"
                                        onClick={openJoinModal}
                                        leftSection={<IconUsers size={14} />}
                                    >
                                        Join Subcontest
                                    </Button>
                                    <Button
                                        size="xs"
                                        color="brandLime"
                                        style={{ color: '#000', fontWeight: 800 }}
                                        onClick={openModal}
                                        leftSection={<IconPlus size={14} />}
                                    >
                                        Create Subcontest
                                    </Button>
                                </Group>
                            </Flex>

                            {loading ? (
                                <Text size="sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Loading subcontests...</Text>
                            ) : error ? (
                                <Text size="sm" style={{ color: '#ff8787', fontWeight: 600 }} ta="center" py="xl">
                                    {error}
                                </Text>
                            ) : subcontests.length === 0 ? (
                                <Text size="sm" style={{ color: 'rgba(255,255,255,0.5)' }} ta="center" py="xl">
                                    You are not the creator of member of any subcontests.
                                </Text>
                            ) : (
                                <Table verticalSpacing="md" style={{ color: 'rgba(255,255,255,0.9)' }}>
                                    <Table.Thead style={{ borderColor: 'rgba(46, 111, 64, 0.2)' }}>
                                        <Table.Tr>
                                            <Table.Th style={{ color: '#fff' }}>Name</Table.Th>
                                            <Table.Th style={{ color: '#fff' }}>Join Code</Table.Th>
                                            <Table.Th style={{ color: '#fff', textAlign: 'center' }}>Member</Table.Th>
                                            <Table.Th style={{ color: '#fff', textAlign: 'center' }}>Owner</Table.Th>
                                            <Table.Th style={{ color: '#fff' }} ta="right"></Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {subcontests.map((sub) => (
                                            <Table.Tr
                                                key={sub.id}
                                                style={{ borderColor: 'rgba(46, 111, 64, 0.1)', cursor: 'pointer' }}
                                                onClick={() => router.push(`/contests/${contestId}/standings?subcontestId=${sub.id}`)}
                                            >
                                                <Table.Td style={{ fontWeight: 700 }}>{sub.name}</Table.Td>
                                                <Table.Td onClick={(e) => e.stopPropagation()}>
                                                    {sub.joinCode || 'N/A'}
                                                </Table.Td>
                                                <Table.Td onClick={(e) => e.stopPropagation()}>
                                                    <Flex justify="center">
                                                        <Checkbox checked={sub.isMember} readOnly styles={{ input: { cursor: 'default' } }} />
                                                    </Flex>
                                                </Table.Td>
                                                <Table.Td onClick={(e) => e.stopPropagation()}>
                                                    <Flex justify="center">
                                                        <Checkbox checked={sub.isOwner} readOnly styles={{ input: { cursor: 'default' } }} />
                                                    </Flex>
                                                </Table.Td>
                                                <Table.Td ta="right" onClick={(e) => e.stopPropagation()}>
                                                    {(sub.isOwner) && (
                                                        <ActionIcon
                                                            color="red"
                                                            variant="subtle"
                                                            onClick={() => handleDeleteSubcontest(sub.id)}
                                                            title="Delete Subcontest"
                                                        >
                                                            <IconTrash size={16} />
                                                        </ActionIcon>
                                                    )}
                                                </Table.Td>
                                            </Table.Tr>
                                        ))}
                                    </Table.Tbody>
                                </Table>
                            )}
                        </Card>
                    </Grid.Col>
                </Grid>

                {/* Create Subcontest Modal */}
                <Modal
                    opened={modalOpened}
                    onClose={closeModal}
                    title="Create Subcontest"
                    centered
                    styles={{
                        content: { backgroundColor: '#0d1610', color: '#fff', border: '1px solid rgba(46,111,64,0.3)' },
                        header: { backgroundColor: '#0d1610', color: '#fff', borderBottom: '1px solid rgba(46,111,64,0.1)' }
                    }}
                >
                    <Stack gap="md">
                        <TextInput
                            label="Subcontest Name"
                            placeholder="e.g. Wacky Cool Bros"
                            value={newSubcontestName}
                            onChange={(e) => setNewSubcontestName(e.currentTarget.value)}
                            required
                            styles={{
                                input: { backgroundColor: 'rgba(0,0,0,0.3)', color: '#fff', borderColor: 'rgba(46,111,64,0.3)' },
                                label: { color: 'rgba(255,255,255,0.7)', fontWeight: 600 }
                            }}
                        />
                        <Checkbox
                            label="Automatically join this subcontest"
                            checked={selfJoin}
                            onChange={(e) => setSelfJoin(e.currentTarget.checked)}
                            styles={{
                                label: { color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' },
                                input: { backgroundColor: 'rgba(0,0,0,0.3)', borderColor: 'rgba(46,111,64,0.3)' }
                            }}
                        />
                        {createError && (
                            <Text size="xs" style={{ color: '#ff8787', fontWeight: 600 }}>
                                {createError}
                            </Text>
                        )}
                        <Button
                            color="brandLime"
                            fullWidth
                            onClick={handleCreateSubcontest}
                            style={{ color: '#000', fontWeight: 800 }}
                            leftSection={<IconFolderPlus size={16} />}
                        >
                            Create Subcontest
                        </Button>
                    </Stack>
                </Modal>

                {/* Join Subcontest Modal */}
                <Modal
                    opened={joinModalOpened}
                    onClose={closeJoinModal}
                    title="Join Subcontest"
                    centered
                    styles={{
                        content: { backgroundColor: '#0d1610', color: '#fff', border: '1px solid rgba(46,111,64,0.3)' },
                        header: { backgroundColor: '#0d1610', color: '#fff', borderBottom: '1px solid rgba(46,111,64,0.1)' }
                    }}
                >
                    <Stack gap="md">
                        <TextInput
                            label="Join Code"
                            value={joinCodeInput}
                            onChange={(e) => setJoinCodeInput(e.currentTarget.value)}
                            required
                            styles={{
                                input: { backgroundColor: 'rgba(0,0,0,0.3)', color: '#fff', borderColor: 'rgba(46,111,64,0.3)' },
                                label: { color: 'rgba(255,255,255,0.7)', fontWeight: 600 }
                            }}
                        />
                        {joinError && (
                            <Text size="xs" style={{ color: '#ff8787', fontWeight: 600 }}>
                                {joinError}
                            </Text>
                        )}
                        <Button
                            color="brandLime"
                            fullWidth
                            onClick={handleJoinSubcontest}
                            loading={joining}
                            style={{ color: '#000', fontWeight: 800 }}
                            leftSection={<IconUsers size={16} />}
                        >
                            Join Subcontest
                        </Button>
                    </Stack>
                </Modal>
            </Container>
        </AuthGuard>
    );
}
