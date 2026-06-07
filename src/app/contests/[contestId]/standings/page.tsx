"use client"

import { useState, useEffect } from 'react';
import { Title, Text, Container, Card, Table, Badge, Flex, TextInput, Select, Grid, Button } from '@mantine/core';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { IconAward, IconSearch, IconTrophy, IconUsers } from '@tabler/icons-react';
import { leaderboardsClient, contestsClient, mapApiError } from '@/api/client';
import { AuthGuard } from '@/components/AuthGuard';
import { mapLeaderboardData, LeaderboardRow } from './utils';

interface LeaderboardEntry {
    rank: number;
    username: string;
    totalPoints: number;
    groupPoints: number;
    knockoutPoints: number;
}

export default function StandingsPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();

    const contestId = params.contestId as string;
    const subcontestId = searchParams.get('subcontestId');

    const [leaderboardTitle, setLeaderboardTitle] = useState<string>('Global Standings');
    const [contestName, setContestName] = useState<string>('');
    const [subcontestName, setSubcontestName] = useState<string>('');
    const [overallEntries, setOverallEntries] = useState<LeaderboardEntry[]>([]);
    const [groupEntries, setGroupEntries] = useState<LeaderboardEntry[]>([]);
    const [knockoutEntries, setKnockoutEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>('total');

    // Fetch contest/subcontest metadata
    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const contestsRes = await contestsClient.listContests({});
                const currentContest = contestsRes.contests?.find(c => c.slug === contestId);
                if (currentContest) {
                    setContestName(currentContest.title);
                }

                if (subcontestId) {
                    const subRes = await contestsClient.listSubcontests({ contestSlug: contestId });
                    const currentSub = subRes.subcontests?.find(s => s.slug === subcontestId);
                    if (currentSub) {
                        setSubcontestName(currentSub.title);
                    }
                } else {
                    setSubcontestName('');
                }
            } catch (err) {
                console.error("Failed to load contest/subcontest metadata", err);
            }
        };

        fetchMetadata();
    }, [contestId, subcontestId]);

    // Pagination state
    const [page, setPage] = useState<number>(1);
    const limit = 20;

    // Reset to page 1 when slug changes
    useEffect(() => {
        setPage(1);
    }, [contestId, subcontestId]);

    useEffect(() => {
        const fetchStandings = async () => {
            setLoading(true);
            setError(null);
            try {
                const offset = (page - 1) * limit;
                if (subcontestId) {
                    // Fetch subcontest specific leaderboard
                    const res = await leaderboardsClient.subleaderboard({
                        subcontestSlug: subcontestId,
                        limit,
                        offset
                    });
                    setLeaderboardTitle('Subcontest Standings');
                    const overall = res.overall || [];
                    const group = res.group || [];
                    const knockout = res.knockout || [];
                    if (overall.length > 0 || group.length > 0 || knockout.length > 0) {
                        const mapList = (list: any[], type: 'total' | 'group' | 'knockout'): LeaderboardEntry[] => {
                            return list.map((e: any, index: number) => ({
                                rank: index + 1,
                                username: e.name || '',
                                totalPoints: type === 'total' ? Number(e.score) : 0,
                                groupPoints: type === 'group' ? Number(e.score) : 0,
                                knockoutPoints: type === 'knockout' ? Number(e.score) : 0,
                            }));
                        };
                        setOverallEntries(mapList(overall, 'total'));
                        setGroupEntries(mapList(group, 'group'));
                        setKnockoutEntries(mapList(knockout, 'knockout'));
                    } else {
                        if (page > 1) {
                            setPage(p => Math.max(1, p - 1));
                        } else {
                            throw new Error("No standings data available for this subcontest.");
                        }
                    }
                } else {
                    // Fetch global leaderboard
                    const res = await leaderboardsClient.leaderboard({
                        contestSlug: contestId,
                        limit,
                        offset
                    });
                    setLeaderboardTitle('Global Standings');
                    const overall = res.overall || [];
                    const group = res.group || [];
                    const knockout = res.knockout || [];
                    if (overall.length > 0 || group.length > 0 || knockout.length > 0) {
                        const mapList = (list: any[], type: 'total' | 'group' | 'knockout'): LeaderboardEntry[] => {
                            return list.map((e: any, index: number) => ({
                                rank: index + 1,
                                username: e.name || '',
                                totalPoints: type === 'total' ? Number(e.score) : 0,
                                groupPoints: type === 'group' ? Number(e.score) : 0,
                                knockoutPoints: type === 'knockout' ? Number(e.score) : 0,
                            }));
                        };
                        setOverallEntries(mapList(overall, 'total'));
                        setGroupEntries(mapList(group, 'group'));
                        setKnockoutEntries(mapList(knockout, 'knockout'));
                    } else {
                        if (page > 1) {
                            setPage(p => Math.max(1, p - 1));
                        } else {
                            throw new Error("No global standings data available for this contest.");
                        }
                    }
                }
            } catch (err: any) {
                setError(mapApiError(err));
                setOverallEntries([]);
                setGroupEntries([]);
                setKnockoutEntries([]);
            } finally {
                setLoading(false);
            }
        };

        fetchStandings();
    }, [contestId, subcontestId, page]);

    // Apply active list
    const activeEntries = sortBy === 'group' ? groupEntries : sortBy === 'knockout' ? knockoutEntries : overallEntries;

    // Apply filters and sorting
    const processedEntries = activeEntries.filter(e =>
        e.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AuthGuard>
            <Container size="lg" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>

                {/* Header section */}
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <Title order={1} style={{ fontSize: '3rem', fontWeight: 900, color: '#fff', marginBottom: '0.5rem' }}>
                        {leaderboardTitle}
                    </Title>
                    {contestName && (
                        <Text size="xl" style={{ color: '#DFFF00', fontWeight: 700, marginBottom: '1rem' }}>
                            {subcontestName ? `${contestName} • ${subcontestName}` : contestName}
                        </Text>
                    )}
                    <Text size="sm" style={{ color: 'rgba(255,255,255,0.6)', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => router.push(`/contests/${contestId}`)}>
                        &larr; Back to Contest Dashboard
                    </Text>
                </div>

                {/* Filters panel */}
                <Card className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2.5rem' }}>
                    <Flex gap="md" align="flex-end" direction={{ base: 'column', sm: 'row' }}>
                        <TextInput
                            label="Search"
                            placeholder="Search players..."
                            leftSection={<IconSearch size={16} />}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.currentTarget.value)}
                            style={{ flex: 1, width: '100%' }}
                            styles={{
                                input: { backgroundColor: 'rgba(0,0,0,0.2)', color: '#fff', borderColor: 'rgba(46,111,64,0.3)' },
                                label: { color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }
                            }}
                        />

                        <Select
                            label="Sort by"
                            value={sortBy}
                            onChange={(val) => setSortBy(val || 'total')}
                            data={[
                                { value: 'total', label: 'Total Accumulated Points' },
                                { value: 'group', label: 'Group Stage Points Only' },
                                { value: 'knockout', label: 'Knockout Stage Points Only' },
                            ]}
                            w={{ base: '100%', sm: '250px' }}
                            styles={{
                                input: { backgroundColor: 'rgba(0,0,0,0.2)', color: '#fff', borderColor: 'rgba(46,111,64,0.3)' },
                                label: { color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }
                            }}
                        />
                    </Flex>
                </Card>

                {/* Standings Table */}
                <Card className="glass-panel" style={{ padding: '2rem' }}>
                    {loading ? (
                        <Text ta="center" size="lg" style={{ color: 'rgba(255,255,255,0.5)' }}>Loading standings...</Text>
                    ) : error ? (
                        <Text ta="center" size="lg" style={{ color: '#ff8787', fontWeight: 600 }}>{error}</Text>
                    ) : processedEntries.length === 0 ? (
                        <Text ta="center" size="lg" style={{ color: 'rgba(255,255,255,0.5)' }}>No entries found matching filters.</Text>
                    ) : (
                        <Table verticalSpacing="md" style={{ color: 'rgba(255,255,255,0.9)' }}>
                            <Table.Thead style={{ borderColor: 'rgba(46, 111, 64, 0.2)' }}>
                                <Table.Tr>
                                    <Table.Th style={{ color: '#fff', width: '80px' }}>Rank</Table.Th>
                                    <Table.Th style={{ color: '#fff' }}>Player</Table.Th>
                                    <Table.Th style={{ color: '#fff' }} ta="right">
                                        {sortBy === 'group' ? 'Group Pts' : sortBy === 'knockout' ? 'Knockout Pts' : 'Total Score'}
                                    </Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {processedEntries.map((entry, index) => {
                                    const displayRank = (page - 1) * limit + index + 1;
                                    const displayScore = sortBy === 'group' ? entry.groupPoints : sortBy === 'knockout' ? entry.knockoutPoints : entry.totalPoints;
                                    return (
                                        <Table.Tr key={entry.username} style={{ borderColor: 'rgba(46, 111, 64, 0.1)' }}>
                                            <Table.Td style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>{displayRank}</Table.Td>
                                            <Table.Td style={{ fontWeight: 700 }}>{entry.username}</Table.Td>
                                            <Table.Td ta="right" style={{ fontWeight: 900, color: '#DFFF00', fontSize: '1.1rem' }} className="text-neon">
                                                {displayScore} pts
                                            </Table.Td>
                                        </Table.Tr>
                                    );
                                })}
                            </Table.Tbody>
                        </Table>
                    )}

                    {/* Pagination Controls */}
                    {!loading && !error && activeEntries.length > 0 && (
                        <Flex justify="center" align="center" gap="md" mt="xl" pt="md" style={{ borderTop: '1px solid rgba(46, 111, 64, 0.15)' }}>
                            <Button
                                variant="subtle"
                                color="brandLime"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                style={{
                                    opacity: page === 1 ? 0.3 : 1,
                                    transition: 'all 0.2s ease',
                                    cursor: page === 1 ? 'not-allowed' : 'pointer'
                                }}
                            >
                                &larr; Previous Page
                            </Button>
                            <Text style={{ fontWeight: 800, color: '#fff', fontSize: '1rem' }} px="md">
                                Page {page}
                            </Text>
                            <Button
                                variant="subtle"
                                color="brandLime"
                                onClick={() => setPage(p => p + 1)}
                                disabled={activeEntries.length < limit}
                                style={{
                                    opacity: activeEntries.length < limit ? 0.3 : 1,
                                    transition: 'all 0.2s ease',
                                    cursor: activeEntries.length < limit ? 'not-allowed' : 'pointer'
                                }}
                            >
                                Next Page &rarr;
                            </Button>
                        </Flex>
                    )}
                </Card>

            </Container>
        </AuthGuard>
    );
}
