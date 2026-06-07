"use client"

import { useState } from 'react';
import { Title, Text, Container, Grid, Card, Table, Badge, Flex, Stack, Tabs, ThemeIcon } from '@mantine/core';
import { IconTrophy, IconSoccerField, IconGridDots, IconAward, IconCheck, IconTarget } from '@tabler/icons-react';

export default function RulesPage() {
    const [activeTab, setActiveTab] = useState<string | null>('group');

    return (
        <Container size="lg" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <Badge color="brandLime" size="lg" style={{ color: '#000', fontWeight: 800, marginBottom: '1rem' }}>
                    SCORING MANUAL
                </Badge>
                <Title order={1} style={{ fontSize: '3rem', fontWeight: 900, color: '#fff', marginBottom: '1rem' }}>
                    How to Score Points
                </Title>
                <Text size="lg" style={{ color: 'rgba(255, 255, 255, 0.7)', maxWidth: '600px', margin: '0 auto' }}>
                    Earn up to 1,200 points across the group and knockout stages to win the ultimate crown. Here is the official rules breakdown.
                </Text>
            </div>

            {/* Main Tabs */}
            <Tabs value={activeTab} onChange={setActiveTab} color="brandLime" variant="pills">
                <Tabs.List justify="center" mb="3rem">
                    <Tabs.Tab className="rules-tab" value="group" leftSection={<IconGridDots size={18} />}>Group Stage</Tabs.Tab>
                    <Tabs.Tab className="rules-tab" value="knockout" leftSection={<IconSoccerField size={18} />}>Knockout Stage</Tabs.Tab>
                    <Tabs.Tab className="rules-tab" value="awards" leftSection={<IconAward size={18} />}>Awards & Honors</Tabs.Tab>
                </Tabs.List>

                {/* Group Stage Tab */}
                <Tabs.Panel value="group">
                    <Grid gutter="xl">
                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <Card className="glass-panel" style={{ padding: '2rem', height: '100%' }}>
                                <Flex align="center" gap="sm" mb="xl">
                                    <ThemeIcon color="brandGreen" size="xl" radius="md" style={{ backgroundColor: '#2E6F40' }}>
                                        <IconGridDots size={24} color="#fff" />
                                    </ThemeIcon>
                                    <Title order={2} style={{ color: '#fff', fontSize: '1.75rem' }}>
                                        Group Placement Scoring
                                    </Title>
                                </Flex>

                                <Text size="md" style={{ color: 'rgba(255, 255, 255, 0.7)', mb: 'md', lineHeight: 1.6 }} mb="lg">
                                    For all 12 groups in the tournament, rank the 4 teams from 1st to 4th place. Your points are calculated as the product of your chosen rank&apos;s <b>Multiplier</b> and the team&apos;s actual <b>Points</b> earned:
                                </Text>

                                <Grid gutter="md">
                                    <Grid.Col span={6}>
                                        <Title order={4} style={{ color: '#DFFF00', marginBottom: '0.5rem' }}>Your Rank Multipliers</Title>
                                        <Table variant="unstyled" style={{ color: 'rgba(255,255,255,0.8)' }}>
                                            <Table.Tbody>
                                                <Table.Tr><Table.Td>1st Place</Table.Td><Table.Td><b>x3</b></Table.Td></Table.Tr>
                                                <Table.Tr><Table.Td>2nd Place</Table.Td><Table.Td><b>x2</b></Table.Td></Table.Tr>
                                                <Table.Tr><Table.Td>3rd Place</Table.Td><Table.Td><b>x1</b></Table.Td></Table.Tr>
                                                <Table.Tr><Table.Td>4th Place</Table.Td><Table.Td><b>x0</b></Table.Td></Table.Tr>
                                            </Table.Tbody>
                                        </Table>
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                        <Title order={4} style={{ color: '#DFFF00', marginBottom: '0.5rem' }}>Actual Finishing Points</Title>
                                        <Table variant="unstyled" style={{ color: 'rgba(255,255,255,0.8)' }}>
                                            <Table.Tbody>
                                                <Table.Tr><Table.Td>Finishes 1st</Table.Td><Table.Td><b>10 pts</b></Table.Td></Table.Tr>
                                                <Table.Tr><Table.Td>Finishes 2nd</Table.Td><Table.Td><b>6 pts</b></Table.Td></Table.Tr>
                                                <Table.Tr><Table.Td>Finishes 3rd</Table.Td><Table.Td><b>3 pts</b></Table.Td></Table.Tr>
                                                <Table.Tr><Table.Td>Finishes 4th</Table.Td><Table.Td><b>1 pt</b></Table.Td></Table.Tr>
                                            </Table.Tbody>
                                        </Table>
                                    </Grid.Col>
                                </Grid>
                            </Card>
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <Stack gap="xl">
                                <Card className="glass-panel" style={{ padding: '2rem' }}>
                                    <Title order={3} style={{ color: '#DFFF00', marginBottom: '1rem' }} className="text-neon">
                                        Perfect Group Example (45 Points)
                                    </Title>
                                    <Text size="sm" style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }} mb="md">
                                        If your ranked placements match the exact final outcomes of a group:
                                    </Text>
                                    <Text ff="monospace" size="sm" style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', color: '#fff' }}>
                                        (10 * 3) + (6 * 2) + (3 * 1) + (1 * 0) = <br />
                                        30 + 12 + 3 + 0 = <b>45 Points</b>
                                    </Text>
                                </Card>

                                <Card className="glass-panel" style={{ padding: '2rem' }}>
                                    <Flex align="center" gap="md" mb="md">
                                        <ThemeIcon color="brandLime" size="md" radius="xl" style={{ backgroundColor: '#DFFF00' }}>
                                            <IconCheck size={16} color="#000" />
                                        </ThemeIcon>
                                        <Title order={3} style={{ color: '#fff', fontSize: '1.25rem' }}>
                                            3rd Place Advance Bonus (+5 pts)
                                        </Title>
                                    </Flex>
                                    <Text size="sm" style={{ color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.6 }}>
                                        Predict whether the 3rd place team in a group will advance to the knockout rounds. Correct predictions earn you a <span style={{ color: '#DFFF00' }}><b>+5 point bonus</b></span>.
                                    </Text>
                                    <Text size="xs" style={{ color: '#47ae69', fontWeight: 700 }} mt="xs">
                                        Total Potential Points per Group: 50 | Max Group Stage Score: 600 pts
                                    </Text>
                                </Card>
                            </Stack>
                        </Grid.Col>
                    </Grid>
                </Tabs.Panel>

                {/* Knockout Stage Tab */}
                <Tabs.Panel value="knockout">
                    <Grid gutter="xl">
                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <Card className="glass-panel" style={{ padding: '2rem' }}>
                                <Flex align="center" gap="sm" mb="xl">
                                    <ThemeIcon color="brandGreen" size="xl" radius="md" style={{ backgroundColor: '#2E6F40' }}>
                                        <IconSoccerField size={24} color="#fff" />
                                    </ThemeIcon>
                                    <Title order={2} style={{ color: '#fff', fontSize: '1.75rem' }}>
                                        Knockout Bracket Points
                                    </Title>
                                </Flex>

                                <Text size="md" style={{ color: 'rgba(255, 255, 255, 0.7)' }} mb="lg">
                                    Predict the teams advancing through each round of the tournament tree. Points are awarded for each correct prediction:
                                </Text>

                                <Table verticalSpacing="sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                                    <Table.Thead>
                                        <Table.Tr style={{ borderColor: 'rgba(46, 111, 64, 0.2)' }}>
                                            <Table.Th style={{ color: '#fff' }}>Round</Table.Th>
                                            <Table.Th style={{ color: '#fff' }} ta="right">Points Per Correct Guess</Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        <Table.Tr style={{ borderColor: 'rgba(46, 111, 64, 0.1)' }}><Table.Td>Round of 16</Table.Td><Table.Td ta="right"><b>15 pts</b></Table.Td></Table.Tr>
                                        <Table.Tr style={{ borderColor: 'rgba(46, 111, 64, 0.1)' }}><Table.Td>Quarterfinals</Table.Td><Table.Td ta="right"><b>20 pts</b></Table.Td></Table.Tr>
                                        <Table.Tr style={{ borderColor: 'rgba(46, 111, 64, 0.1)' }}><Table.Td>Semifinals</Table.Td><Table.Td ta="right"><b>25 pts</b></Table.Td></Table.Tr>
                                        <Table.Tr style={{ borderColor: 'rgba(46, 111, 64, 0.1)' }}><Table.Td>Finals</Table.Td><Table.Td ta="right"><b>30 pts</b></Table.Td></Table.Tr>
                                        <Table.Tr style={{ borderColor: 'rgba(46, 111, 64, 0.1)' }}><Table.Td>Champion</Table.Td><Table.Td ta="right"><b>35 pts</b></Table.Td></Table.Tr>
                                        <Table.Tr style={{ borderColor: 'rgba(46, 111, 64, 0.1)' }}><Table.Td>3rd Place Winner</Table.Td><Table.Td ta="right"><b>5 pts</b></Table.Td></Table.Tr>
                                    </Table.Tbody>
                                </Table>
                            </Card>
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <Card className="glass-panel" style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <Flex align="center" gap="sm" mb="md">
                                    <ThemeIcon color="brandLime" size="md" radius="xl" style={{ backgroundColor: '#DFFF00' }}>
                                        <IconTarget size={16} color="#000" />
                                    </ThemeIcon>
                                    <Title order={3} style={{ color: '#fff', fontSize: '1.25rem' }}>
                                        Perfect Knockout Bracket (600 pts)
                                    </Title>
                                </Flex>

                                <Text size="sm" style={{ color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.6 }} mb="lg">
                                    Getting all 32 picks correct across the bracket awards a maximum score of:
                                </Text>

                                <Text ff="monospace" size="sm" style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', color: '#fff' }} mb="lg">
                                    (16 * 15) + (8 * 20) + (4 * 25) + (2 * 30) + (1 * 35) + (1 * 5) = <br />
                                    240 + 160 + 100 + 60 + 35 + 5 = <b>600 Points</b>
                                </Text>
                            </Card>
                        </Grid.Col>
                    </Grid>
                </Tabs.Panel>

                {/* Awards Tab */}
                <Tabs.Panel value="awards">
                    <Grid gutter="xl">
                        <Grid.Col span={12}>
                            <Card className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
                                <IconTrophy size={48} color="#DFFF00" style={{ margin: '0 auto 1.5rem auto' }} className="text-neon" />
                                <Title order={2} style={{ color: '#fff', fontSize: '2rem' }} mb="lg">
                                    Official Platform Honors
                                </Title>
                                <Text size="md" style={{ color: 'rgba(255, 255, 255, 0.7)', maxWidth: '700px', margin: '0 auto' }} mb="2rem">
                                    We award three distinct honors to recognize elite performance across the entire tournament prediction range:
                                </Text>

                                <Grid gutter="xl">
                                    <Grid.Col span={{ base: 12, md: 4 }}>
                                        <Card style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '1.5rem', height: '100%', alignItems: 'center', textAlign: 'center' }}>
                                            <Badge color="brandGreen" size="lg" mb="sm">GROUP GOAT</Badge>
                                            <Title order={4} style={{ color: '#fff' }} mb="xs">The Tactician</Title>
                                            <Text size="sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                                                Awarded to the player with the most points in the Group Stage.
                                            </Text>
                                        </Card>
                                    </Grid.Col>
                                    <Grid.Col span={{ base: 12, md: 4 }}>
                                        <Card style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '1.5rem', height: '100%', alignItems: 'center', textAlign: 'center' }}>
                                            <Badge color="brandLime" size="lg" style={{ color: '#000' }} mb="sm">KNOCKOUT KING</Badge>
                                            <Title order={4} style={{ color: '#fff' }} mb="xs">The Oracle</Title>
                                            <Text size="sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                                                Awarded to the player with the most points in the Knockout Stage.
                                            </Text>
                                        </Card>
                                    </Grid.Col>
                                    <Grid.Col span={{ base: 12, md: 4 }}>
                                        <Card style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '1.5rem', height: '100%', alignItems: 'center', textAlign: 'center' }}>
                                            <Badge color="yellow" size="lg" mb="sm">OVERALL OLIGARCH</Badge>
                                            <Title order={4} style={{ color: '#fff' }} mb="xs">World Champion</Title>
                                            <Text size="sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                                                Awarded to the player with the most points Overall.
                                            </Text>
                                        </Card>
                                    </Grid.Col>
                                </Grid>
                            </Card>
                        </Grid.Col>
                    </Grid>
                </Tabs.Panel>
            </Tabs>
        </Container>
    );
}
