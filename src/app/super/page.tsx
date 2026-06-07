"use client"

import { useState } from "react";
import {
    Container,
    Title,
    Text,
    Card,
    Tabs,
    TextInput,
    NumberInput,
    Textarea,
    Button,
    Switch,
    Stack,
    Group,
    Alert,
    Flex,
    Divider
} from "@mantine/core";
import { IconShield, IconCheck, IconAlertTriangle } from "@tabler/icons-react";
import { contestsClient, matchesClient, mapApiError } from "@/api/client";
import { Timestamp } from "@bufbuild/protobuf";

const DEFAULT_GROUPS_JSON = JSON.stringify([
    {
        "letter": "A",
        "countries": [
            { "code": "USA", "fullName": "United States" },
            { "code": "MEX", "fullName": "Mexico" },
            { "code": "CAN", "fullName": "Canada" },
            { "code": "CRC", "fullName": "Costa Rica" }
        ]
    },
    {
        "letter": "B",
        "countries": [
            { "code": "BRA", "fullName": "Brazil" },
            { "code": "ARG", "fullName": "Argentina" },
            { "code": "URU", "fullName": "Uruguay" },
            { "code": "COL", "fullName": "Colombia" }
        ]
    },
    {
        "letter": "C",
        "countries": [
            { "code": "ENG", "fullName": "England" },
            { "code": "FRA", "fullName": "France" },
            { "code": "GER", "fullName": "Germany" },
            { "code": "ITA", "fullName": "Italy" }
        ]
    },
    {
        "letter": "D",
        "countries": [
            { "code": "ESP", "fullName": "Spain" },
            { "code": "POR", "fullName": "Portugal" },
            { "code": "NED", "fullName": "Netherlands" },
            { "code": "BEL", "fullName": "Belgium" }
        ]
    },
    {
        "letter": "E",
        "countries": [
            { "code": "CRO", "fullName": "Croatia" },
            { "code": "SEN", "fullName": "Senegal" },
            { "code": "MAR", "fullName": "Morocco" },
            { "code": "TUN", "fullName": "Tunisia" }
        ]
    },
    {
        "letter": "F",
        "countries": [
            { "code": "JPN", "fullName": "Japan" },
            { "code": "KOR", "fullName": "South Korea" },
            { "code": "AUS", "fullName": "Australia" },
            { "code": "IRN", "fullName": "Iran" }
        ]
    },
    {
        "letter": "G",
        "countries": [
            { "code": "KSA", "fullName": "Saudi Arabia" },
            { "code": "QAT", "fullName": "Qatar" },
            { "code": "UAE", "fullName": "United Arab Emirates" },
            { "code": "OMN", "fullName": "Oman" }
        ]
    },
    {
        "letter": "H",
        "countries": [
            { "code": "EGY", "fullName": "Egypt" },
            { "code": "NGA", "fullName": "Nigeria" },
            { "code": "GHA", "fullName": "Ghana" },
            { "code": "CMR", "fullName": "Cameroon" }
        ]
    },
    {
        "letter": "I",
        "countries": [
            { "code": "SWE", "fullName": "Sweden" },
            { "code": "DEN", "fullName": "Denmark" },
            { "code": "NOR", "fullName": "Norway" },
            { "code": "FIN", "fullName": "Finland" }
        ]
    },
    {
        "letter": "J",
        "countries": [
            { "code": "SUI", "fullName": "Switzerland" },
            { "code": "AUT", "fullName": "Austria" },
            { "code": "POL", "fullName": "Poland" },
            { "code": "UKR", "fullName": "Ukraine" }
        ]
    },
    {
        "letter": "K",
        "countries": [
            { "code": "TUR", "fullName": "Turkey" },
            { "code": "GRE", "fullName": "Greece" },
            { "code": "CZE", "fullName": "Czech Republic" },
            { "code": "SVK", "fullName": "Slovakia" }
        ]
    },
    {
        "letter": "L",
        "countries": [
            { "code": "WAL", "fullName": "Wales" },
            { "code": "SCO", "fullName": "Scotland" },
            { "code": "IRL", "fullName": "Ireland" },
            { "code": "NIR", "fullName": "Northern Ireland" }
        ]
    }
], null, 2);

export default function SuperadminPage() {
    const [activeTab, setActiveTab] = useState<string | null>("create-contest");
    const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    // Form 1: Create Contest State
    const [contestTitle, setContestTitle] = useState("");
    const [groupUnlock, setGroupUnlock] = useState("");
    const [groupLock, setGroupLock] = useState("");
    const [koUnlock, setKoUnlock] = useState("");
    const [koLock, setKoLock] = useState("");
    const [groupsJson, setGroupsJson] = useState(DEFAULT_GROUPS_JSON);

    // Form 2: Create Match State
    const [matchContestSlug, setMatchContestSlug] = useState("");
    const [matchCountry1, setMatchCountry1] = useState("");
    const [matchCountry2, setMatchCountry2] = useState("");
    const [matchC1Goals, setMatchC1Goals] = useState<string | number>("");
    const [matchC2Goals, setMatchC2Goals] = useState<string | number>("");
    const [matchC1Penalties, setMatchC1Penalties] = useState<string | number>("");
    const [matchC2Penalties, setMatchC2Penalties] = useState<string | number>("");
    const [matchC1Conduct, setMatchC1Conduct] = useState<string | number>("");
    const [matchC2Conduct, setMatchC2Conduct] = useState<string | number>("");
    const [matchRound, setMatchRound] = useState<number>(0);
    const [matchRoundIndex, setMatchRoundIndex] = useState<string | number>("");

    // Form 3: Finalize Group Rankings State
    const [rankContestSlug, setRankContestSlug] = useState("");
    const [rankGroupLetter, setRankGroupLetter] = useState("");
    const [rankCountryCodes, setRankCountryCodes] = useState("");

    // Form 4: Finalize Third Place Qualifier State
    const [tpContestSlug, setTpContestSlug] = useState("");
    const [tpGroupLetter, setTpGroupLetter] = useState("");
    const [tpIsWildcard, setTpIsWildcard] = useState(false);

    const handleCreateContest = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        try {
            const parsedGroups = JSON.parse(groupsJson);
            if (!Array.isArray(parsedGroups) || parsedGroups.length !== 12) {
                throw new Error("Groups must be a JSON array of exactly 12 items.");
            }

            const req: any = {
                title: contestTitle,
                groups: parsedGroups,
            };

            if (groupUnlock) req.groupUnlockDate = Timestamp.fromDate(new Date(groupUnlock));
            if (groupLock) req.groupLockDate = Timestamp.fromDate(new Date(groupLock));
            if (koUnlock) req.knockoutUnlockDate = Timestamp.fromDate(new Date(koUnlock));
            if (koLock) req.knockoutLockDate = Timestamp.fromDate(new Date(koLock));

            await contestsClient.createContest(req);
            setStatus({ type: "success", message: `Contest "${contestTitle}" created successfully!` });
            setContestTitle("");
        } catch (err: any) {
            console.error("Create contest error:", err);
            setStatus({ type: "error", message: mapApiError(err) });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateMatch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        try {
            const matchReq: any = {
                round: BigInt(matchRound),
            };

            if (matchCountry1) matchReq.country1 = { code: matchCountry1.toUpperCase(), fullName: "" };
            if (matchCountry2) matchReq.country2 = { code: matchCountry2.toUpperCase(), fullName: "" };
            if (matchC1Goals !== "") matchReq.country1Goals = BigInt(matchC1Goals);
            if (matchC2Goals !== "") matchReq.country2Goals = BigInt(matchC2Goals);
            if (matchC1Penalties !== "") matchReq.country1Penalties = BigInt(matchC1Penalties);
            if (matchC2Penalties !== "") matchReq.country2Penalties = BigInt(matchC2Penalties);
            if (matchC1Conduct !== "") matchReq.country1ConductScore = BigInt(matchC1Conduct);
            if (matchC2Conduct !== "") matchReq.country2ConductScore = BigInt(matchC2Conduct);
            if (matchRoundIndex !== "") matchReq.roundIndex = BigInt(matchRoundIndex);

            await matchesClient.createMatch({
                contestSlug: matchContestSlug,
                match: matchReq,
            });

            setStatus({ type: "success", message: "Match created/updated successfully!" });
        } catch (err: any) {
            console.error("Create match error:", err);
            setStatus({ type: "error", message: mapApiError(err) });
        } finally {
            setLoading(false);
        }
    };

    const handleFinalizeRankings = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        try {
            const countryCodes = rankCountryCodes.split(",").map(c => c.trim().toUpperCase()).filter(Boolean);
            if (countryCodes.length !== 4) {
                throw new Error("Must provide exactly 4 comma-separated country codes.");
            }

            await contestsClient.finalizeGroupRankings({
                contestSlug: rankContestSlug,
                groupLetter: rankGroupLetter.toUpperCase(),
                orderedCountryCodes: countryCodes,
            });

            setStatus({ type: "success", message: `Rankings finalized for Group ${rankGroupLetter.toUpperCase()}!` });
        } catch (err: any) {
            console.error("Finalize rankings error:", err);
            setStatus({ type: "error", message: mapApiError(err) });
        } finally {
            setLoading(false);
        }
    };

    const handleFinalizeThirdPlace = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        try {
            await contestsClient.finalizeThirdPlaceQualifier({
                contestSlug: tpContestSlug,
                groupLetter: tpGroupLetter.toUpperCase(),
                isWildcardQualifier: tpIsWildcard,
            });

            setStatus({ type: "success", message: `Third-place status finalized for Group ${tpGroupLetter.toUpperCase()}!` });
        } catch (err: any) {
            console.error("Finalize third place error:", err);
            setStatus({ type: "error", message: mapApiError(err) });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container size="md" style={{ paddingTop: "3rem", paddingBottom: "5rem" }}>
            <Flex align="center" gap="sm" mb="xs">
                <IconShield size={32} color="#DFFF00" className="text-neon" />
                <Title order={1} style={{ color: "#fff", fontSize: "2.5rem", fontWeight: 900 }}>
                    Superadmin Controls
                </Title>
            </Flex>
            <Text size="sm" style={{ color: "rgba(255,255,255,0.6)" }} mb="2rem">
                Bypasses normal validations to configure contests, schedule/score matches, and finalize group standings. Note: Your active login session must have a superadmin email to execute these.
            </Text>

            {status && (
                <Alert
                    icon={status.type === "success" ? <IconCheck size={16} /> : <IconAlertTriangle size={16} />}
                    title={status.type === "success" ? "Success" : "Error"}
                    color={status.type === "success" ? "teal" : "red"}
                    mb="2rem"
                    withCloseButton
                    onClose={() => setStatus(null)}
                >
                    {status.message}
                </Alert>
            )}

            <Card className="glass-panel" style={{ padding: "2rem" }}>
                <Tabs value={activeTab} onChange={(val) => { setActiveTab(val); setStatus(null); }}>
                    <Tabs.List mb="md" styles={{ list: { borderBottom: "1px solid rgba(46,111,64,0.2)" } }}>
                        <Tabs.Tab value="create-contest" style={{ color: "#fff", fontWeight: 600 }}>Create Contest</Tabs.Tab>
                        <Tabs.Tab value="create-match" style={{ color: "#fff", fontWeight: 600 }}>Create/Score Match</Tabs.Tab>
                        <Tabs.Tab value="finalize-rankings" style={{ color: "#fff", fontWeight: 600 }}>Finalize Rankings</Tabs.Tab>
                        <Tabs.Tab value="third-place" style={{ color: "#fff", fontWeight: 600 }}>Finalize Wildcard</Tabs.Tab>
                    </Tabs.List>

                    {/* CREATE CONTEST FORM */}
                    <Tabs.Panel value="create-contest">
                        <form onSubmit={handleCreateContest}>
                            <Stack gap="md">
                                <TextInput
                                    label="Contest Title"
                                    required
                                    placeholder="e.g. World Cup 2026"
                                    value={contestTitle}
                                    onChange={(e) => setContestTitle(e.target.value)}
                                    styles={{ input: { backgroundColor: "rgba(0,0,0,0.2)", color: "#fff", borderColor: "rgba(46,111,64,0.3)" } }}
                                />
                                <Group grow>
                                    <TextInput
                                        label="Group Stage Unlock Date"
                                        type="datetime-local"
                                        value={groupUnlock}
                                        onChange={(e) => setGroupUnlock(e.target.value)}
                                        styles={{ input: { backgroundColor: "rgba(0,0,0,0.2)", color: "#fff", borderColor: "rgba(46,111,64,0.3)" } }}
                                    />
                                    <TextInput
                                        label="Group Stage Lock Date"
                                        type="datetime-local"
                                        value={groupLock}
                                        onChange={(e) => setGroupLock(e.target.value)}
                                        styles={{ input: { backgroundColor: "rgba(0,0,0,0.2)", color: "#fff", borderColor: "rgba(46,111,64,0.3)" } }}
                                    />
                                </Group>
                                <Group grow>
                                    <TextInput
                                        label="Knockout Stage Unlock Date"
                                        type="datetime-local"
                                        value={koUnlock}
                                        onChange={(e) => setKoUnlock(e.target.value)}
                                        styles={{ input: { backgroundColor: "rgba(0,0,0,0.2)", color: "#fff", borderColor: "rgba(46,111,64,0.3)" } }}
                                    />
                                    <TextInput
                                        label="Knockout Stage Lock Date"
                                        type="datetime-local"
                                        value={koLock}
                                        onChange={(e) => setKoLock(e.target.value)}
                                        styles={{ input: { backgroundColor: "rgba(0,0,0,0.2)", color: "#fff", borderColor: "rgba(46,111,64,0.3)" } }}
                                    />
                                </Group>
                                <Textarea
                                    label="Groups Config JSON"
                                    required
                                    description="Must be an array of exactly 12 groups, each with 4 countries."
                                    rows={10}
                                    value={groupsJson}
                                    onChange={(e) => setGroupsJson(e.target.value)}
                                    styles={{ input: { fontFamily: "monospace", fontSize: "12px", backgroundColor: "rgba(0,0,0,0.2)", color: "#fff", borderColor: "rgba(46,111,64,0.3)" } }}
                                />
                                <Button type="submit" color="brandLime" style={{ color: "#000", fontWeight: 800 }} loading={loading}>
                                    Create Contest
                                </Button>
                            </Stack>
                        </form>
                    </Tabs.Panel>

                    {/* CREATE/SCORE MATCH FORM */}
                    <Tabs.Panel value="create-match">
                        <form onSubmit={handleCreateMatch}>
                            <Stack gap="md">
                                <TextInput
                                    label="Contest Slug"
                                    required
                                    placeholder="e.g. world-cup-2026"
                                    value={matchContestSlug}
                                    onChange={(e) => setMatchContestSlug(e.target.value)}
                                    styles={{ input: { backgroundColor: "rgba(0,0,0,0.2)", color: "#fff", borderColor: "rgba(46,111,64,0.3)" } }}
                                />
                                <Group grow>
                                    <TextInput
                                        label="Country 1 Code"
                                        placeholder="e.g. USA"
                                        value={matchCountry1}
                                        onChange={(e) => setMatchCountry1(e.target.value)}
                                        styles={{ input: { backgroundColor: "rgba(0,0,0,0.2)", color: "#fff", borderColor: "rgba(46,111,64,0.3)" } }}
                                    />
                                    <TextInput
                                        label="Country 2 Code"
                                        placeholder="e.g. CAN"
                                        value={matchCountry2}
                                        onChange={(e) => setMatchCountry2(e.target.value)}
                                        styles={{ input: { backgroundColor: "rgba(0,0,0,0.2)", color: "#fff", borderColor: "rgba(46,111,64,0.3)" } }}
                                    />
                                </Group>
                                <Divider label="Score Fields (Optional)" labelPosition="center" color="rgba(46,111,64,0.2)" />
                                <Group grow>
                                    <NumberInput
                                        label="Country 1 Goals"
                                        min={0}
                                        value={matchC1Goals}
                                        onChange={(val) => setMatchC1Goals(val)}
                                        styles={{ input: { backgroundColor: "rgba(0,0,0,0.2)", color: "#fff", borderColor: "rgba(46,111,64,0.3)" } }}
                                    />
                                    <NumberInput
                                        label="Country 2 Goals"
                                        min={0}
                                        value={matchC2Goals}
                                        onChange={(val) => setMatchC2Goals(val)}
                                        styles={{ input: { backgroundColor: "rgba(0,0,0,0.2)", color: "#fff", borderColor: "rgba(46,111,64,0.3)" } }}
                                    />
                                </Group>
                                <Group grow>
                                    <NumberInput
                                        label="Country 1 Penalties"
                                        min={0}
                                        value={matchC1Penalties}
                                        onChange={(val) => setMatchC1Penalties(val)}
                                        styles={{ input: { backgroundColor: "rgba(0,0,0,0.2)", color: "#fff", borderColor: "rgba(46,111,64,0.3)" } }}
                                    />
                                    <NumberInput
                                        label="Country 2 Penalties"
                                        min={0}
                                        value={matchC2Penalties}
                                        onChange={(val) => setMatchC2Penalties(val)}
                                        styles={{ input: { backgroundColor: "rgba(0,0,0,0.2)", color: "#fff", borderColor: "rgba(46,111,64,0.3)" } }}
                                    />
                                </Group>
                                <Group grow>
                                    <NumberInput
                                        label="Country 1 Conduct Score"
                                        value={matchC1Conduct}
                                        onChange={(val) => setMatchC1Conduct(val)}
                                        styles={{ input: { backgroundColor: "rgba(0,0,0,0.2)", color: "#fff", borderColor: "rgba(46,111,64,0.3)" } }}
                                    />
                                    <NumberInput
                                        label="Country 2 Conduct Score"
                                        value={matchC2Conduct}
                                        onChange={(val) => setMatchC2Conduct(val)}
                                        styles={{ input: { backgroundColor: "rgba(0,0,0,0.2)", color: "#fff", borderColor: "rgba(46,111,64,0.3)" } }}
                                    />
                                </Group>
                                <Divider label="Tournament Round" labelPosition="center" color="rgba(46,111,64,0.2)" />
                                <Group grow>
                                    <NumberInput
                                        label="Round"
                                        required
                                        min={0}
                                        max={7}
                                        description="0: Group, 1: R32, 2: R16, 3: QF, 4: SF, 5: Final, 6: Champ, 7: 3rd"
                                        value={matchRound}
                                        onChange={(val) => setMatchRound(Number(val) || 0)}
                                        styles={{ input: { backgroundColor: "rgba(0,0,0,0.2)", color: "#fff", borderColor: "rgba(46,111,64,0.3)" } }}
                                    />
                                    <NumberInput
                                        label="Round Index (Optional)"
                                        min={0}
                                        description="Match slot offset in knockout rounds (e.g. 0-15 for R32)"
                                        value={matchRoundIndex}
                                        onChange={(val) => setMatchRoundIndex(val)}
                                        styles={{ input: { backgroundColor: "rgba(0,0,0,0.2)", color: "#fff", borderColor: "rgba(46,111,64,0.3)" } }}
                                    />
                                </Group>
                                <Button type="submit" color="brandLime" style={{ color: "#000", fontWeight: 800 }} loading={loading}>
                                    Submit Match
                                </Button>
                            </Stack>
                        </form>
                    </Tabs.Panel>

                    {/* FINALIZE GROUP RANKINGS FORM */}
                    <Tabs.Panel value="finalize-rankings">
                        <form onSubmit={handleFinalizeRankings}>
                            <Stack gap="md">
                                <TextInput
                                    label="Contest Slug"
                                    required
                                    placeholder="e.g. world-cup-2026"
                                    value={rankContestSlug}
                                    onChange={(e) => setRankContestSlug(e.target.value)}
                                    styles={{ input: { backgroundColor: "rgba(0,0,0,0.2)", color: "#fff", borderColor: "rgba(46,111,64,0.3)" } }}
                                />
                                <TextInput
                                    label="Group Letter"
                                    required
                                    placeholder="e.g. A"
                                    value={rankGroupLetter}
                                    onChange={(e) => setRankGroupLetter(e.target.value)}
                                    styles={{ input: { backgroundColor: "rgba(0,0,0,0.2)", color: "#fff", borderColor: "rgba(46,111,64,0.3)" } }}
                                />
                                <TextInput
                                    label="Ordered Country Codes"
                                    required
                                    placeholder="e.g. USA,MEX,CAN,CRC"
                                    description="Provide exactly 4 codes in final placement order (1st, 2nd, 3rd, 4th)."
                                    value={rankCountryCodes}
                                    onChange={(e) => setRankCountryCodes(e.target.value)}
                                    styles={{ input: { backgroundColor: "rgba(0,0,0,0.2)", color: "#fff", borderColor: "rgba(46,111,64,0.3)" } }}
                                />
                                <Button type="submit" color="brandLime" style={{ color: "#000", fontWeight: 800 }} loading={loading}>
                                    Finalize Group Rankings
                                </Button>
                            </Stack>
                        </form>
                    </Tabs.Panel>

                    {/* FINALIZE THIRD PLACE QUALIFIER FORM */}
                    <Tabs.Panel value="third-place">
                        <form onSubmit={handleFinalizeThirdPlace}>
                            <Stack gap="md">
                                <TextInput
                                    label="Contest Slug"
                                    required
                                    placeholder="e.g. world-cup-2026"
                                    value={tpContestSlug}
                                    onChange={(e) => setTpContestSlug(e.target.value)}
                                    styles={{ input: { backgroundColor: "rgba(0,0,0,0.2)", color: "#fff", borderColor: "rgba(46,111,64,0.3)" } }}
                                />
                                <TextInput
                                    label="Group Letter"
                                    required
                                    placeholder="e.g. A"
                                    value={tpGroupLetter}
                                    onChange={(e) => setTpGroupLetter(e.target.value)}
                                    styles={{ input: { backgroundColor: "rgba(0,0,0,0.2)", color: "#fff", borderColor: "rgba(46,111,64,0.3)" } }}
                                />
                                <Switch
                                    label="Is Wildcard Qualifier?"
                                    checked={tpIsWildcard}
                                    onChange={(e) => setTpIsWildcard(e.currentTarget.checked)}
                                    styles={{ label: { color: "#fff" } }}
                                />
                                <Button type="submit" color="brandLime" style={{ color: "#000", fontWeight: 800 }} loading={loading}>
                                    Finalize Wildcard Status
                                </Button>
                            </Stack>
                        </form>
                    </Tabs.Panel>
                </Tabs>
            </Card>
        </Container>
    );
}
