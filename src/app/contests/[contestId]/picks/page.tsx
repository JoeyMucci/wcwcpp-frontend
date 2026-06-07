"use client"

import { useState, useEffect } from 'react';
import { Title, Text, Container, Card, Button, Grid, Badge, Flex, Stack, Group, Modal, Loader, SegmentedControl, Tooltip, Switch } from '@mantine/core';
import { BarChart } from '@mantine/charts';
import { useParams } from 'next/navigation';
import { IconGridDots, IconDeviceFloppy, IconLock, IconTrophy } from '@tabler/icons-react';
import { contestsClient, picksClient, matchesClient } from '@/api/client';
import { useToast } from '@/components/Toast/ToastContext';
import { AuthGuard } from '@/components/AuthGuard';
import { calculateKnockoutPoints as utilsCalculateKnockoutPoints, checkReachedTarget } from './utils';

interface Team {
    id: string;
    name: string;
    flag: string;
}

interface RankedTeam {
    id: string;
    name: string;
    flag: string;
    points: number;
    wins: number;
    draws: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
    conductScore: number;
    isThirdPlaceQualifier: boolean;
    rank?: number;
}

interface GroupPicks {
    groupId: string;
    groupName: string;
    teams: Team[];
    thirdPlaceAdvances: boolean;
}

const FLAG_MAP: Record<string, string> = {
    AFG: "🇦🇫", ALB: "🇦🇱", ALG: "🇩🇿", AND: "🇦🇩", ANG: "🇦🇴", ANT: "🇦🇬", ARG: "🇦🇷", ARM: "🇦🇲", ARU: "🇦🇼", ASA: "🇦🇸",
    AUS: "🇦🇺", AUT: "🇦🇹", AZE: "🇦🇿", BAH: "🇧🇸", BAN: "🇧🇩", BAR: "🇧🇧", BDI: "🇧🇮", BEL: "🇧🇪", BEN: "🇧🇯", BER: "🇧🇲",
    BHU: "🇧🇹", BIH: "🇧🇦", BIZ: "🇧🇿", BLR: "🇧🇾", BOL: "🇧🇴", BOT: "🇧🇼", BRA: "🇧🇷", BRU: "🇧🇳", BUL: "🇧🇬", BUR: "🇧🇫",
    CAF: "🇨🇫", CAM: "🇰🇭", CAN: "🇨🇦", CAY: "🇰🇾", CGO: "🇨🇬", CHA: "🇹🇩", CHI: "🇨🇱", CHN: "🇨🇳", CIV: "🇨🇮", CMR: "🇨🇲",
    COD: "🇨🇩", COK: "🇨🇰", COL: "🇨🇴", COM: "🇰🇲", CPV: "🇨🇻", CRC: "🇨🇷", CRO: "🇭🇷", CTA: "🇨🇫", CUB: "🇨🇺", CUR: "🇨🇼",
    CYP: "🇨🇾", CZE: "🇨🇿", DEN: "🇩🇰", DJI: "🇩🇯", DMA: "🇩🇲", DOM: "🇩🇴", ECU: "🇪🇨", EGY: "🇪🇬", ENG: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", EQG: "🇬🇶",
    ERI: "🇪🇷", ESP: "🇪🇸", EST: "🇪🇪", ETH: "🇪🇹", FIJ: "🇫🇯", FIN: "🇫🇮", FRA: "🇫🇷", FRO: "🇫🇴", FSM: "🇫🇲", GAB: "🇬🇦",
    GAM: "🇬🇲", GEO: "🇬🇪", GER: "🇩🇪", GHA: "🇬🇭", GIB: "🇬🇮", GRE: "🇬🇷", GUA: "🇬🇹", GUI: "🇬🇳", GUM: "🇬🇺", GUY: "🇬🇾", HAI: "🇭🇹",
    HKG: "🇭🇰", HON: "🇭🇳", HUN: "🇭🇺", INA: "🇮🇩", IND: "🇮🇳", IRL: "🇮🇪", IRN: "🇮🇷", IRQ: "🇮🇶", ISL: "🇮🇸", ISR: "🇮🇱",
    ITA: "🇮🇹", IVB: "🇻🇬", JAM: "🇯🇲", JOR: "🇯🇴", JPN: "🇯🇵", KAZ: "🇰🇿", KEN: "🇰🇪", KGZ: "🇰🇬", KOR: "🇰🇷", KSA: "🇸🇦",
    KUW: "🇰🇼", LAO: "🇱🇦", LBN: "🇱🇧", LBR: "🇱🇷", LBY: "🇱🇾", LCA: "🇱🇨", LIE: "🇱🇮", LTU: "🇱🇹", LUX: "🇱🇺", LVA: "🇱🇻",
    MAC: "🇲🇴", MAD: "🇲🇬", MAR: "🇲🇦", MAS: "🇲🇾", MDA: "🇲🇩", MDV: "🇲🇻", MEX: "🇲🇽", MGL: "🇲🇳", MKD: "🇲🇰", MLI: "🇲🇱",
    MLT: "🇲🇹", MNE: "🇲🇪", MNG: "🇲🇳", MON: "🇲🇨", MOZ: "🇲🇿", MRI: "🇲🇺", MSN: "🇲🇸", MSR: "🇲🇸", MTN: "🇲🇷", MYA: "🇲🇲",
    NAM: "🇳🇦", NCA: "🇳🇮", NED: "🇳🇱", NEP: "🇳🇵", NGA: "🇳🇬", NIG: "🇳🇪", NIR: "🇬🇧", NOR: "🇳🇴", NPL: "🇳🇵", NZL: "🇳🇿",
    OMA: "🇴🇲", OMN: "🇴🇲", PAK: "🇵🇰", PAN: "🇵🇦", PAR: "🇵🇾", PER: "🇵🇪", PHI: "🇵🇭", PLE: "🇵🇸", PNG: "🇵🇬", POL: "🇵🇱",
    POR: "🇵🇹", PRK: "🇰🇵", PUR: "🇵🇷", QAT: "🇶🇦", ROU: "🇷🇴", RSA: "🇿🇦", RUS: "🇷🇺", RWA: "🇷🇼", SAM: "🇼🇸", SCO: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
    SEN: "🇸🇳", SGP: "🇸🇬", SHN: "🇸🇭", SLB: "🇸🇧", SLE: "🇸🇱", SLV: "🇸🇻", SMR: "🇸🇲", SOL: "🇸🇧", SOM: "🇸🇴", SRB: "🇷🇸",
    SRI: "🇱🇰", SSD: "🇸🇸", STP: "🇸🇹", SUI: "🇨🇭", SUR: "🇸🇷", SVK: "🇸🇰", SVN: "🇸🇮", SWE: "🇸🇪", SWZ: "🇸🇿", SXM: "🇸🇽",
    SYR: "🇸🇾", TAH: "🇵🇫", TAN: "🇹🇿", TGA: "🇹🇴", THA: "🇹🇭", TJK: "🇹🇯", TKM: "🇹🇲", TLS: "🇹🇱", TOG: "🇹🇬", TPE: "🇹🇼",
    TRI: "🇹🇹", TUN: "🇹🇳", TUR: "🇹🇷", TUV: "🇹🇻", UAE: "🇦🇪", UGA: "🇺🇬", UKR: "🇺🇦", URU: "🇺🇾", USA: "🇺🇸", UZB: "🇺🇿",
    VAN: "🇻🇺", VEN: "🇻🇪", VIE: "🇻🇳", VIN: "🇻🇨", WAL: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", YEM: "🇾🇪", ZAM: "🇿🇲", ZIM: "🇿🇼",

    "afghanistan": "🇦🇫", "albania": "🇦🇱", "algeria": "🇩🇿", "andorra": "🇦🇩", "angola": "🇦🇴", "antigua": "🇦🇬",
    "argentina": "🇦🇷", "armenia": "🇦🇲", "aruba": "🇦🇼", "american samoa": "🇦🇸", "australia": "🇦🇺", "austria": "🇦🇹",
    "azerbaijan": "🇦🇿", "bahamas": "🇧🇸", "bangladesh": "🇧🇩", "barbados": "🇧🇧", "burundi": "🇧🇮", "belgium": "🇧🇪",
    "benin": "🇧🇯", "bermuda": "🇧🇲", "bhutan": "🇧🇹", "bosnia and herzegovina": "🇧🇦", "belize": "🇧🇿", "belarus": "🇧🇾", "bolivia": "🇧🇴",
    "botswana": "🇧🇼", "brazil": "🇧🇷", "brunei": "🇧🇳", "bulgaria": "🇧🇬", "burkina faso": "🇧🇫", "central african republic": "🇨🇫",
    "cambodia": "🇰🇭", "canada": "🇨🇦", "cayman islands": "🇰🇾", "congo": "🇨🇬", "chad": "🇹🇩", "chile": "🇨🇱",
    "china": "🇨🇳", "côte d'ivoire": "🇨🇮", "cameroon": "🇨🇲", "congo dr": "🇨🇩", "cook islands": "🇨🇰", "colombia": "🇨🇴",
    "comoros": "🇰🇲", "cabo verde": "🇨🇻", "costa rica": "🇨🇷", "croatia": "🇭🇷", "cuba": "🇨🇺", "curaçao": "🇨🇼",
    "cyprus": "🇨🇾", "czech republic": "🇨🇿", "czechia": "🇨🇿", "denmark": "🇩🇰", "djibouti": "🇩🇯", "dominica": "🇩🇲",
    "dominican republic": "🇩🇴", "ecuador": "🇪🇨", "egypt": "🇪🇬", "england": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "equatorial guinea": "🇬🇶",
    "eritrea": "🇪🇷", "spain": "🇪🇸", "estonia": "🇪🇪", "ethiopia": "🇪🇹", "fiji": "🇫🇯", "finland": "🇫🇮", "france": "🇫🇷",
    "faroe islands": "🇫🇴", "micronesia": "🇫🇲", "gabon": "🇬🇦", "gambia": "🇬🇲", "georgia": "🇬🇪", "germany": "🇩🇪",
    "ghana": "🇬🇭", "gibraltar": "🇬🇮", "greece": "🇬🇷", "guatemala": "🇬🇹", "guinea": "🇬🇳", "guam": "🇬🇺", "guyana": "🇬🇾", "haiti": "🇭🇹",
    "hong kong": "🇭🇰", "honduras": "🇭🇳", "hungary": "🇭🇺", "indonesia": "🇮🇩", "india": "🇮🇳", "ireland": "🇮🇪",
    "ir iran": "🇮🇷", "iraq": "🇮🇶", "iceland": "🇮🇸", "israel": "🇮🇱", "italy": "🇮🇹", "virgin islands": "🇻🇬",
    "jamaica": "🇯🇲", "jordan": "🇯🇴", "japan": "🇯🇵", "kazakhstan": "🇰🇿", "kenya": "🇰🇪", "kyrgyzstan": "🇰🇬",
    "south korea": "🇰🇷", "korea republic": "🇰🇷", "saudi arabia": "🇸🇦", "kuwait": "🇰🇼", "laos": "🇱🇦", "lebanon": "🇱🇧",
    "liberia": "🇱🇷", "libya": "🇱🇾", "saint lucia": "🇱🇨", "liechtenstein": "🇱🇮", "lithuania": "🇱🇹", "luxembourg": "🇱🇺",
    "latvia": "🇱🇻", "macau": "🇲🇴", "madagascar": "🇲🇬", "morocco": "🇲🇦", "malaysia": "🇲🇾", "moldova": "🇲🇩",
    "maldives": "🇲🇻", "mexico": "🇲🇽", "mongolia": "🇲🇳", "macedonia": "🇲🇰", "north macedonia": "🇲🇰", "mali": "🇲🇱",
    "malta": "🇲🇹", "montenegro": "🇲🇪", "monaco": "🇲🇨", "mozambique": "🇲🇿", "mauritius": "🇲🇺", "montserrat": "🇲🇸",
    "mauritania": "🇲🇷", "myanmar": "🇲🇲", "namibia": "🇳🇦", "nicaragua": "🇳🇮", "netherlands": "🇳🇱", "nepal": "🇳🇵",
    "nigeria": "🇳🇬", "niger": "🇳🇪", "northern ireland": "🇬🇧", "norway": "🇳🇴", "new zealand": "🇳🇿", "oman": "🇴🇲",
    "pakistan": "🇵🇰", "panama": "🇵🇦", "paraguay": "🇵🇾", "peru": "🇵🇪", "philippines": "🇵🇭", "palestine": "🇵🇸",
    "papua new guinea": "🇵🇬", "poland": "🇵🇱", "portugal": "🇵🇹", "north korea": "🇰🇵", "puerto rico": "🇵🇷",
    "qatar": "🇶🇦", "romania": "🇷🇴", "south africa": "🇿🇦", "russia": "🇷🇺", "rwanda": "🇷🇼", "samoa": "🇼🇸",
    "scotland": "🏴󠁧󠁢󠁳󠁣󠁴󠁿", "senegal": "🇸🇳", "singapore": "🇸🇬", "st helena": "🇸🇭", "solomon islands": "🇸🇧",
    "sierra leone": "🇸🇱", "el salvador": "🇸🇻", "san marino": "🇸🇲", "somalia": "🇸🇴", "serbia": "🇷🇸", "sri lanka": "🇱🇰",
    "south sudan": "🇸🇸", "sao tome": "🇸🇹", "switzerland": "🇨🇭", "suriname": "🇸🇷", "slovakia": "🇸🇰", "slovenia": "🇸🇮",
    "sweden": "🇸🇪", "swaziland": "🇸🇿", "sint maarten": "🇸🇽", "syria": "🇸🇾", "tahiti": "🇵🇫", "tanzania": "🇹🇿",
    "tonga": "🇹🇴", "thailand": "🇹🇭", "tajikistan": "🇹🇯", "turkmenistan": "🇹🇲", "east timor": "🇹🇱", "togo": "🇹🇬",
    "taiwan": "🇹🇼", "trinidad": "🇹🇹", "tunisia": "🇹🇳", "türkiye": "🇹🇷", "tuvalu": "🇹🇻", "united arab emirates": "🇦🇪",
    "uganda": "🇺🇬", "ukraine": "🇺🇦", "uruguay": "🇺🇾", "united states": "🇺🇸", "united states of america": "🇺🇸",
    "uzbekistan": "🇺🇿", "vanuatu": "🇻🇺", "venezuela": "🇻🇪", "vietnam": "🇻🇳", "st vincent": "🇻🇨", "wales": "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
    "yemen": "🇾🇪", "zambia": "🇿🇲", "zimbabwe": "🇿🇼"
};

const getFlag = (nameOrCode: string): string => {
    if (!nameOrCode || nameOrCode === "TBD") return "";
    const clean = nameOrCode.replace(/^country\s+/i, "").trim().toLowerCase();

    if (FLAG_MAP[clean.toUpperCase()]) {
        return FLAG_MAP[clean.toUpperCase()];
    }
    if (FLAG_MAP[clean]) {
        return FLAG_MAP[clean];
    }
    return "⚽";
};

// Bracket rounds helper
const getTargetRound = (round: number, matchIndex: number): number => {
    if (round === 1) return 2;
    if (round === 2) return 3;
    if (round === 3) return 4;
    if (round === 4) return 5;
    if (round === 5 && matchIndex === 0) return 6; // Champion
    return 7; // Third Place
};

export default function PicksPage() {
    const params = useParams();
    const contestId = params.contestId as string;
    const { showToast } = useToast();

    // Tab control state
    const [activeTab, setActiveTab] = useState<string>('group');

    // Group Stage state
    const [isGroupLocked, setIsGroupLocked] = useState<boolean>(false);
    const [groupLockTimeStr, setGroupLockTimeStr] = useState<string>('');
    const [groups, setGroups] = useState<GroupPicks[]>([]);
    const [groupResults, setGroupResults] = useState<Record<string, RankedTeam[]>>({});
    const [finalizedGroups, setFinalizedGroups] = useState<Record<string, { finalized: boolean; extraQualifierFinalized: boolean }>>({});
    const [hasSavedGroupPicks, setHasSavedGroupPicks] = useState<boolean>(false);
    const [savedGroupLetters, setSavedGroupLetters] = useState<Set<string>>(new Set());

    // Group matches modal state
    const [selectedGroupForMatches, setSelectedGroupForMatches] = useState<string | null>(null);
    const [groupMatches, setGroupMatches] = useState<any[]>([]);
    const [loadingGroupMatches, setLoadingGroupMatches] = useState<boolean>(false);

    // Knockout Stage state
    const [isKnockoutLocked, setIsKnockoutLocked] = useState<boolean>(false);
    const [knockoutLockTimeStr, setKnockoutLockTimeStr] = useState<string>('');
    const [knockoutMatches, setKnockoutMatches] = useState<any[]>([]);
    const [knockoutPredictions, setKnockoutPredictions] = useState<Record<string, string>>({});
    const [knockoutResults, setKnockoutResults] = useState<any[]>([]);
    const [hasSavedKnockoutPicks, setHasSavedKnockoutPicks] = useState<boolean>(false);
    const [koViewMode, setKoViewMode] = useState<'real' | 'predicted'>('real');

    const [saving, setSaving] = useState<boolean>(false);

    const handleShowGroupMatches = async (letter: string) => {
        setSelectedGroupForMatches(letter);
        setLoadingGroupMatches(true);
        try {
            const res = await matchesClient.listGroupMatches({ contestSlug: contestId, letter });
            setGroupMatches(res.matches || []);
        } catch (err) {
            console.error("Failed to load group matches:", err);
        } finally {
            setLoadingGroupMatches(false);
        }
    };

    // Shared initializer
    useEffect(() => {
        const fetchPicksAndLock = async () => {
            try {
                // Fetch locks
                const listRes = await contestsClient.listContests({});
                const contest = listRes.contests?.find(c => c.slug === contestId);
                if (contest) {
                    const now = new Date();
                    const gUnlockTime = contest.groupUnlockDate && Number(contest.groupUnlockDate.seconds) > 0
                        ? new Date(Number(contest.groupUnlockDate.seconds) * 1000)
                        : null;
                    const gLockTime = contest.groupLockDate && Number(contest.groupLockDate.seconds) > 0
                        ? new Date(Number(contest.groupLockDate.seconds) * 1000)
                        : null;

                    const kUnlockTime = contest.knockoutUnlockDate && Number(contest.knockoutUnlockDate.seconds) > 0
                        ? new Date(Number(contest.knockoutUnlockDate.seconds) * 1000)
                        : null;
                    const kLockTime = contest.knockoutLockDate && Number(contest.knockoutLockDate.seconds) > 0
                        ? new Date(Number(contest.knockoutLockDate.seconds) * 1000)
                        : null;

                    const isGLocked = (gUnlockTime && now < gUnlockTime) || (gLockTime && now > gLockTime);
                    const isKLocked = (kUnlockTime && now < kUnlockTime) || (kLockTime && now > kLockTime);

                    setIsGroupLocked(!!isGLocked);
                    setIsKnockoutLocked(!!isKLocked);
                    if (!isKLocked) {
                        setKoViewMode('predicted'); // Default to predicted bracket when editing is open
                    } else {
                        setKoViewMode('real'); // Default to live results tracker when locked
                    }

                    let gStatus = "Unlocked";
                    if (gUnlockTime && now < gUnlockTime) {
                        gStatus = `Not open yet (Unlocks at ${gUnlockTime.toLocaleString()})`;
                    } else if (gLockTime && now > gLockTime) {
                        gStatus = `Locked (Locked at ${gLockTime.toLocaleString()})`;
                    }
                    setGroupLockTimeStr(gStatus);

                    let kStatus = "Unlocked";
                    if (kUnlockTime && now < kUnlockTime) {
                        kStatus = `Not open yet (Unlocks at ${kUnlockTime.toLocaleString()})`;
                    } else if (kLockTime && now > kLockTime) {
                        kStatus = `Locked (Locked at ${kLockTime.toLocaleString()})`;
                    }
                    setKnockoutLockTimeStr(kStatus);
                }
            } catch (err) {
                console.warn("Could not load lock time");
            }

            try {
                // Fetch group stage picks and results
                const groupPicksRes = await picksClient.listGroupPicks({ contestSlug: contestId });

                // 1. Process official group results
                const resultsMap: Record<string, RankedTeam[]> = {};
                const finalizedMap: Record<string, { finalized: boolean; extraQualifierFinalized: boolean }> = {};
                if (groupPicksRes.results && groupPicksRes.results.length > 0) {
                    groupPicksRes.results.forEach(r => {
                        resultsMap[r.letter || ''] = (r.rankedCountries || []).map(c => ({
                            id: c.code,
                            name: c.fullName || c.code,
                            flag: getFlag(c.fullName || c.code),
                            points: Number(c.points || 0),
                            wins: Number(c.wins || 0),
                            draws: Number(c.draws || 0),
                            losses: Number(c.losses || 0),
                            goalsFor: Number(c.goalsFor || 0),
                            goalsAgainst: Number(c.goalsAgainst || 0),
                            goalDifference: Number(c.goalDifference || 0),
                            conductScore: Number(c.conductScore || 0),
                            isThirdPlaceQualifier: !!c.isThirdPlaceQualifier,
                            rank: c.rank !== undefined ? c.rank : undefined
                        }));
                        finalizedMap[r.letter || ''] = {
                            finalized: !!r.finalized,
                            extraQualifierFinalized: !!r.extraQualifierFinalized
                        };
                    });
                    setGroupResults(resultsMap);
                    setFinalizedGroups(finalizedMap);
                }

                // 2. Process user group picks
                let loadedGroups: GroupPicks[] = [];
                const hasPicks = groupPicksRes.picks && groupPicksRes.picks.length > 0;
                setHasSavedGroupPicks(hasPicks);

                const savedLetters = new Set<string>();
                if (groupPicksRes.picks) {
                    groupPicksRes.picks.forEach(p => {
                        if (p.group?.letter) {
                            savedLetters.add(p.group.letter);
                        }
                    });
                }
                setSavedGroupLetters(savedLetters);

                if (hasPicks) {
                    loadedGroups = groupPicksRes.picks.map(p => ({
                        groupId: `g-${(p.group?.letter || '').toLowerCase()}`,
                        groupName: `Group ${p.group?.letter || ''}`,
                        teams: (p.group?.countries || []).map(c => ({
                            id: c.code,
                            name: c.fullName,
                            flag: getFlag(c.fullName || c.code)
                        })),
                        thirdPlaceAdvances: !!p.extraQualifier
                    }));
                } else {
                    if (groupPicksRes.results && groupPicksRes.results.length > 0) {
                        loadedGroups = groupPicksRes.results.map(r => ({
                            groupId: `g-${(r.letter || '').toLowerCase()}`,
                            groupName: `Group ${r.letter || ''}`,
                            teams: (r.rankedCountries || []).map(c => ({
                                id: c.code,
                                name: c.fullName || c.code,
                                flag: getFlag(c.fullName || c.code)
                            })),
                            thirdPlaceAdvances: false
                        }));
                    }
                }

                if (loadedGroups.length > 0) {
                    setGroups(loadedGroups);
                }
            } catch (err) {
                console.error("Failed to load group picks/results", err);
            }

            try {
                // Fetch knockout stage matches, user picks, and results
                const koMatchesRes = await matchesClient.listKnockoutMatches({ contestSlug: contestId });
                const matches = koMatchesRes.matches || [];
                setKnockoutMatches(matches);

                const koPicksRes = await picksClient.listKnockoutPicks({ contestSlug: contestId });
                const hasSavedKO = !!(koPicksRes.pick?.entries && koPicksRes.pick.entries.length > 0);
                setHasSavedKnockoutPicks(hasSavedKO);

                if (koPicksRes.result?.entries) {
                    setKnockoutResults(koPicksRes.result.entries);
                }

                // Parse R32 matches to map country -> initial match node
                const r32 = matches.filter(m => Number(m.round) === 1);
                r32.sort((a, b) => Number(a.roundIndex || 0) - Number(b.roundIndex || 0));

                if (hasSavedKO && koPicksRes.pick?.entries) {
                    const loadedPreds: Record<string, string> = {};
                    koPicksRes.pick.entries.forEach(entry => {
                        const code = entry.country?.code;
                        if (!code) return;
                        const round = Number(entry.round);

                        // Find which initial R32 match this country belonged to
                        const initialIdx = r32.findIndex(m => m.country1?.code === code || m.country2?.code === code);
                        if (initialIdx === -1) return;

                        if (round === 2) loadedPreds[`1-${initialIdx}`] = code;
                        else if (round === 3) loadedPreds[`2-${Math.floor(initialIdx / 2)}`] = code;
                        else if (round === 4) loadedPreds[`3-${Math.floor(initialIdx / 4)}`] = code;
                        else if (round === 5) loadedPreds[`4-${Math.floor(initialIdx / 8)}`] = code;
                        else if (round === 6) loadedPreds[`5-0`] = code;
                        else if (round === 7) loadedPreds[`5-1`] = code;
                    });
                    setKnockoutPredictions(loadedPreds);
                }
            } catch (err) {
                console.error("Failed to load knockout picks/matches", err);
            }
        };

        fetchPicksAndLock();
    }, [contestId]);

    // Group picks mutator: swaps the teams at two ranks
    const handleSwapTeams = (groupIndex: number, fromRank: number, toRank: number) => {
        if (isGroupLocked) return;

        setGroups(prev => {
            const next = [...prev];
            const group = { ...next[groupIndex] };
            const teams = [...group.teams];

            // Swap the two teams in the array
            const temp = teams[fromRank];
            teams[fromRank] = teams[toRank];
            teams[toRank] = temp;

            group.teams = teams;
            next[groupIndex] = group;
            return next;
        });
    };

    const handleThirdPlaceToggle = (groupIndex: number) => {
        if (isGroupLocked) return;
        setGroups(prev => {
            const next = [...prev];
            next[groupIndex] = {
                ...next[groupIndex],
                thirdPlaceAdvances: !next[groupIndex].thirdPlaceAdvances
            };
            return next;
        });
    };

    // Save Group stage picks
    const handleSavePicks = async () => {
        if (isGroupLocked) return;
        setSaving(true);
        try {
            await picksClient.createGroupPicks({
                contestSlug: contestId,
                picks: groups.map(g => ({
                    group: {
                        letter: g.groupName.replace("Group ", ""),
                        countries: g.teams.map(t => ({
                            code: t.id,
                            fullName: t.name
                        }))
                    },
                    extraQualifier: g.thirdPlaceAdvances
                }))
            });

            showToast("Group stage predictions submitted successfully!", "success", "Success");
            setHasSavedGroupPicks(true);
            const savedLetters = new Set(groups.map(g => g.groupName.replace("Group ", "")));
            setSavedGroupLetters(savedLetters);
        } catch (err) {
            console.error("Failed to submit group picks", err);
            showToast("Failed to submit group stage picks. Please try again.", "error", "Error");
        } finally {
            setSaving(false);
        }
    };

    // Knockout state logic
    const r32Matches = knockoutMatches.filter(m => Number(m.round) === 1);
    r32Matches.sort((a, b) => Number(a.roundIndex || 0) - Number(b.roundIndex || 0));

    const findTeamInR32 = (code: string): { code: string; name: string } | null => {
        for (const m of r32Matches) {
            if (m.country1?.code === code) return { code, name: m.country1.fullName || code };
            if (m.country2?.code === code) return { code, name: m.country2.fullName || code };
        }
        return null;
    };

    // Recursively resolve predicted teams for subsequent rounds
    const getTeamForMatchSlot = (
        round: number,
        matchIndex: number,
        slot: 1 | 2
    ): { code: string; name: string } | null => {
        if (round === 1) {
            const m = r32Matches[matchIndex];
            if (!m) return null;
            if (slot === 1) {
                return m.country1 ? { code: m.country1.code, name: m.country1.fullName || m.country1.code } : null;
            } else {
                return m.country2 ? { code: m.country2.code, name: m.country2.fullName || m.country2.code } : null;
            }
        }

        const prevRound = round - 1;
        const matchIndex1 = matchIndex * 2;
        const matchIndex2 = matchIndex * 2 + 1;

        if (round === 5 && matchIndex === 1) {
            // Third Place Match: is between the predicted LOSERS of Semifinals Match 0 and 1!
            const sf0Winner = knockoutPredictions[`4-0`];
            const sf1Winner = knockoutPredictions[`4-1`];

            const sf0Team1 = getTeamForMatchSlot(4, 0, 1);
            const sf0Team2 = getTeamForMatchSlot(4, 0, 2);
            const sf1Team1 = getTeamForMatchSlot(4, 1, 1);
            const sf1Team2 = getTeamForMatchSlot(4, 1, 2);

            if (slot === 1) {
                if (!sf0Winner || !sf0Team1 || !sf0Team2) return null;
                return sf0Winner === sf0Team1.code ? sf0Team2 : sf0Team1;
            } else {
                if (!sf1Winner || !sf1Team1 || !sf1Team2) return null;
                return sf1Winner === sf1Team1.code ? sf1Team2 : sf1Team1;
            }
        }

        const p1Code = knockoutPredictions[`${prevRound}-${matchIndex1}`];
        const p2Code = knockoutPredictions[`${prevRound}-${matchIndex2}`];

        if (slot === 1) {
            if (!p1Code) return null;
            const team = findTeamInR32(p1Code);
            return team ? { code: p1Code, name: team.name } : { code: p1Code, name: p1Code };
        } else {
            if (!p2Code) return null;
            const team = findTeamInR32(p2Code);
            return team ? { code: p2Code, name: team.name } : { code: p2Code, name: p2Code };
        }
    };

    // Clicking advances a team and propagates cascades downstream
    const handleSelectWinner = (round: number, matchIndex: number, teamCode: string) => {
        if (isKnockoutLocked) return;

        setKnockoutPredictions(prev => {
            const next = { ...prev };
            const oldWinner = next[`${round}-${matchIndex}`];
            next[`${round}-${matchIndex}`] = teamCode;

            if (oldWinner && oldWinner !== teamCode) {
                // Clear any downstream picks matching oldWinner to avoid bracket ghosting
                for (let r = round + 1; r <= 5; r++) {
                    const maxIndex = r === 2 ? 8 : r === 3 ? 4 : r === 4 ? 2 : 2;
                    for (let idx = 0; idx < maxIndex; idx++) {
                        if (next[`${r}-${idx}`] === oldWinner) {
                            delete next[`${r}-${idx}`];
                        }
                    }
                }
            }
            return next;
        });
    };

    // Save Knockout bracket picks
    const handleSaveKnockoutPicks = async () => {
        if (isKnockoutLocked) return;

        const entries: any[] = [];
        let isComplete = true;

        const addEntry = (code: string, targetRound: number) => {
            const team = findTeamInR32(code);
            entries.push({
                country: {
                    code,
                    fullName: team ? team.name : code
                },
                round: BigInt(targetRound)
            });
        };

        // Round 1 -> Target Round 2 (R16)
        for (let i = 0; i < 16; i++) {
            const code = knockoutPredictions[`1-${i}`];
            if (!code) isComplete = false;
            else addEntry(code, 2);
        }
        // Round 2 -> Target Round 3 (QF)
        for (let i = 0; i < 8; i++) {
            const code = knockoutPredictions[`2-${i}`];
            if (!code) isComplete = false;
            else addEntry(code, 3);
        }
        // Round 3 -> Target Round 4 (SF)
        for (let i = 0; i < 4; i++) {
            const code = knockoutPredictions[`3-${i}`];
            if (!code) isComplete = false;
            else addEntry(code, 4);
        }
        // Round 4 -> Target Round 5 (Finals)
        for (let i = 0; i < 2; i++) {
            const code = knockoutPredictions[`4-${i}`];
            if (!code) isComplete = false;
            else addEntry(code, 5);
        }
        // Round 5 index 0 -> Target Round 6 (Champion)
        const champ = knockoutPredictions[`5-0`];
        if (!champ) isComplete = false;
        else addEntry(champ, 6);

        // Round 5 index 1 -> Target Round 7 (3rd Place)
        const thirdPlace = knockoutPredictions[`5-1`];
        if (!thirdPlace) isComplete = false;
        else addEntry(thirdPlace, 7);

        if (!isComplete) {
            showToast("Please fill out the entire knockout bracket before submitting! 🏆", "error", "Bracket Incomplete");
            return;
        }

        setSaving(true);
        try {
            await picksClient.createKnockoutPicks({
                contestSlug: contestId,
                pick: { entries }
            });
            showToast("Knockout bracket submitted successfully!", "success", "Success");
            setHasSavedKnockoutPicks(true);
        } catch (err) {
            console.error("Failed to submit knockout picks", err);
            showToast("Failed to submit knockout bracket. Please try again.", "error", "Error");
        } finally {
            setSaving(false);
        }
    };

    // Calculate knockout correctness status
    const getPredictionStatus = (
        round: number,
        matchIndex: number,
        code: string
    ): 'correct' | 'incorrect' | 'pending' => {
        if (!code) return 'pending';

        const targetRound = getTargetRound(round, matchIndex);

        // Check achieved standings from refactored results API
        const reachedTarget = checkReachedTarget(code, targetRound, knockoutResults, knockoutMatches);
        if (reachedTarget) {
            return 'correct';
        }

        // Check if they lost in any completed matches
        const lostMatch = knockoutMatches.some(m => {
            const hasPlayed = m.country1Goals !== undefined && m.country1Goals !== null && m.country2Goals !== undefined && m.country2Goals !== null;
            if (!hasPlayed) return false;

            const c1Code = m.country1?.code;
            const c2Code = m.country2?.code;
            if (c1Code !== code && c2Code !== code) return false;

            const g1 = Number(m.country1Goals);
            const g2 = Number(m.country2Goals);
            const p1 = m.country1Penalties !== undefined && m.country1Penalties !== null ? Number(m.country1Penalties) : 0;
            const p2 = m.country2Penalties !== undefined && m.country2Penalties !== null ? Number(m.country2Penalties) : 0;

            const t1Won = g1 > g2 || (g1 === g2 && p1 > p2);
            const team2Won = g2 > g1 || (g1 === g2 && p2 > p1);

            if (c1Code === code && team2Won) return true;
            if (c2Code === code && t1Won) return true;
            return false;
        });

        if (lostMatch) return 'incorrect';
        return 'pending';
    };

    // Real-time knockout score grader
    const calculateKnockoutPoints = (): number => {
        return utilsCalculateKnockoutPoints(knockoutPredictions, knockoutResults, knockoutMatches);
    };

    interface GroupPointsBreakdown {
        placementEarned: number;
        bonusEarned: number;
        isFinalized: boolean;
        isBonusFinalized: boolean;
    }

    const calculateSingleGroupPoints = (
        group: GroupPicks,
        officialStandings: RankedTeam[],
        groupLetter: string
    ): GroupPointsBreakdown => {
        const info = finalizedGroups[groupLetter];
        const isFinalized = !!info?.finalized;
        const isBonusFinalized = !!info?.extraQualifierFinalized;

        let placementEarned = 0;
        let bonusEarned = 0;

        if (!savedGroupLetters.has(groupLetter)) {
            return {
                placementEarned: 0,
                bonusEarned: 0,
                isFinalized,
                isBonusFinalized
            };
        }

        // 1. Placement Points (Only calculate if group is finalized)
        if (isFinalized && officialStandings && officialStandings.length > 0) {
            group.teams.forEach((team, predictedIdx) => {
                const multiplier = predictedIdx === 0 ? 3 : predictedIdx === 1 ? 2 : predictedIdx === 2 ? 1 : 0;
                const officialIdx = officialStandings.findIndex(t => t.id === team.id);
                if (officialIdx === -1) return;

                const teamStanding = officialStandings[officialIdx];
                const actualRank = teamStanding.rank !== undefined && teamStanding.rank !== null ? teamStanding.rank : (officialIdx + 1);
                let basePoints = 0;
                if (actualRank === 1) basePoints = 10;
                else if (actualRank === 2) basePoints = 6;
                else if (actualRank === 3) basePoints = 3;
                else if (actualRank === 4) basePoints = 1;

                placementEarned += basePoints * multiplier;
            });
        }

        // 2. Third-Place Wildcard Qualifier (Only calculate if qualifier is finalized)
        if (isBonusFinalized && officialStandings && officialStandings.length > 0) {
            const official3rdPlaceTeam = officialStandings.find(t => t.rank === 3) || officialStandings[2];
            if (official3rdPlaceTeam) {
                const actualWildcard = !!official3rdPlaceTeam.isThirdPlaceQualifier;
                if (group.thirdPlaceAdvances === actualWildcard) {
                    bonusEarned = 5;
                }
            }
        }

        return {
            placementEarned,
            bonusEarned,
            isFinalized,
            isBonusFinalized
        };
    };

    // Aggregated totals
    const calculateTotalGroupPoints = (): number => {
        if (!hasSavedGroupPicks) return 0;
        let earned = 0;
        groups.forEach(group => {
            const letter = group.groupName.replace("Group ", "");
            const official = groupResults[letter] || [];
            const breakdown = calculateSingleGroupPoints(group, official, letter);
            earned += breakdown.placementEarned + breakdown.bonusEarned;
        });
        return earned;
    };

    // unified header variables
    const currentIsLocked = activeTab === 'group' ? isGroupLocked : isKnockoutLocked;
    const currentLockTimeStr = activeTab === 'group' ? groupLockTimeStr : knockoutLockTimeStr;
    const handleSaveCurrentPicks = activeTab === 'group' ? handleSavePicks : handleSaveKnockoutPicks;
    const hasCurrentPicks = activeTab === 'group' ? hasSavedGroupPicks : hasSavedKnockoutPicks;

    const renderMatchCard = (round: number, matchIndex: number) => {
        const useRealMatch = activeTab === 'knockout' && koViewMode === 'real';

        let team1: { code: string; name: string } | null = null;
        let team2: { code: string; name: string } | null = null;

        const officialMatch = knockoutMatches.find(m => Number(m.round) === round && Number(m.roundIndex) === matchIndex);
        const hasBeenPlayed = officialMatch && officialMatch.country1Goals !== undefined && officialMatch.country1Goals !== null;

        if (useRealMatch) {
            team1 = officialMatch?.country1 ? { code: officialMatch.country1.code, name: officialMatch.country1.fullName || officialMatch.country1.code } : null;
            team2 = officialMatch?.country2 ? { code: officialMatch.country2.code, name: officialMatch.country2.fullName || officialMatch.country2.code } : null;
        } else {
            team1 = getTeamForMatchSlot(round, matchIndex, 1);
            team2 = getTeamForMatchSlot(round, matchIndex, 2);
        }

        const predictedWinner = knockoutPredictions[`${round}-${matchIndex}`];

        let roundLabel = "";
        if (round === 1) roundLabel = `Match R32-${matchIndex + 1}`;
        else if (round === 2) roundLabel = `Match R16-${matchIndex + 1}`;
        else if (round === 3) roundLabel = `QF Match ${matchIndex + 1}`;
        else if (round === 4) roundLabel = `SF Match ${matchIndex + 1}`;
        else if (round === 5) {
            roundLabel = matchIndex === 0 ? "🏆 GRAND FINALS" : "🥉 3rd-Place Match";
        }

        const renderTeamRow = (team: { code: string; name: string } | null, slot: 1 | 2) => {
            if (!team) {
                return (
                    <Flex align="center" style={{ height: '38px', padding: '0 0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.05)' }}>
                        <Text size="xs" style={{ color: 'rgba(255,255,255,0.25)', fontStyle: 'italic' }}>TBD</Text>
                    </Flex>
                );
            }

            const isPicked = predictedWinner === team.code;
            const status = getPredictionStatus(round, matchIndex, team.code);

            let borderStyle = '1px solid transparent';
            let bgStyle = 'transparent';

            let scoreStr = "";
            let isOfficialWinner = false;
            let isOfficialLoser = false;

            if (useRealMatch && officialMatch && hasBeenPlayed) {
                const isOfficialTeam1 = officialMatch.country1?.code === team.code;
                const isOfficialTeam2 = officialMatch.country2?.code === team.code;

                const g1 = Number(officialMatch.country1Goals);
                const g2 = Number(officialMatch.country2Goals);
                const p1 = officialMatch.country1Penalties !== undefined && officialMatch.country1Penalties !== null ? Number(officialMatch.country1Penalties) : 0;
                const p2 = officialMatch.country2Penalties !== undefined && officialMatch.country2Penalties !== null ? Number(officialMatch.country2Penalties) : 0;

                const t1Won = g1 > g2 || (g1 === g2 && p1 > p2);
                const t2Won = g2 > g1 || (g1 === g2 && p2 > p1);

                if (isOfficialTeam1) {
                    scoreStr = `${g1}${officialMatch.country1Penalties !== undefined && officialMatch.country1Penalties !== null ? ` (${p1})` : ''}`;
                    isOfficialWinner = t1Won;
                    isOfficialLoser = t2Won;
                } else if (isOfficialTeam2) {
                    scoreStr = `${g2}${officialMatch.country2Penalties !== undefined && officialMatch.country2Penalties !== null ? ` (${p2})` : ''}`;
                    isOfficialWinner = t2Won;
                    isOfficialLoser = t1Won;
                }
            }

            if (useRealMatch) {
                if (isOfficialWinner) {
                    bgStyle = 'rgba(64, 192, 87, 0.06)';
                    borderStyle = '1px solid rgba(64, 192, 87, 0.15)';
                }
            } else {
                if (isPicked) {
                    if (status === 'correct') {
                        borderStyle = '1px solid rgba(64, 192, 87, 0.4)';
                        bgStyle = 'rgba(64, 192, 87, 0.12)';
                    } else if (status === 'incorrect') {
                        borderStyle = '1px solid rgba(250, 82, 82, 0.4)';
                        bgStyle = 'rgba(250, 82, 82, 0.12)';
                    } else {
                        borderStyle = '1px solid rgba(223, 255, 0, 0.4)';
                        bgStyle = 'rgba(223, 255, 0, 0.12)';
                    }
                }
            }

            const isUserSelectionActive = !isKnockoutLocked && !useRealMatch;

            return (
                <Flex
                    align="center"
                    justify="space-between"
                    onClick={() => {
                        if (isUserSelectionActive) {
                            handleSelectWinner(round, matchIndex, team.code);
                        }
                    }}
                    style={{
                        height: '38px',
                        padding: '0 0.75rem',
                        borderRadius: '8px',
                        cursor: isUserSelectionActive ? 'pointer' : 'default',
                        background: bgStyle,
                        border: borderStyle,
                        transition: 'all 0.2s ease',
                    }}
                    className={isUserSelectionActive ? 'bracket-row-hover' : ''}
                >
                    <Flex align="center" gap="xs">
                        <Text size="md" style={{ lineHeight: 1 }}>{getFlag(team.name)}</Text>
                        <Text
                            size="xs"
                            style={{
                                fontWeight: (isPicked || (useRealMatch && isOfficialWinner)) ? 800 : 500,
                                color: useRealMatch
                                    ? (isOfficialWinner ? '#40c057' : isOfficialLoser ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.7)')
                                    : (isPicked ? (status === 'correct' ? '#40c057' : status === 'incorrect' ? '#fa5252' : '#DFFF00') : 'rgba(255,255,255,0.7)'),
                            }}
                        >
                            {team.name}
                        </Text>
                        {useRealMatch && isPicked && (
                            <Tooltip label="Your Predicted Winner for this match" position="top" withArrow>
                                <Badge color="yellow" size="xs" variant="filled" style={{ color: '#000', padding: '0 4px', height: '16px' }}>★</Badge>
                            </Tooltip>
                        )}
                        {!useRealMatch && isPicked && (
                            status === 'correct' ? (
                                <Badge color="green" size="xs" variant="filled" style={{ padding: '0 4px', height: '16px' }}>✓</Badge>
                            ) : status === 'incorrect' ? (
                                <Badge color="red" size="xs" variant="filled" style={{ padding: '0 4px', height: '16px' }}>✗</Badge>
                            ) : (
                                <Badge color="yellow" size="xs" variant="filled" style={{ color: '#000', padding: '0 4px', height: '16px' }}>★</Badge>
                            )
                        )}
                    </Flex>

                    {scoreStr && (
                        <Text size="xs" style={{ fontWeight: 800, color: isOfficialWinner ? '#40c057' : 'rgba(255,255,255,0.4)' }}>
                            {scoreStr}
                        </Text>
                    )}
                </Flex>
            );
        };

        const renderPredictionOverlay = () => {
            if (!useRealMatch || !predictedWinner) return null;
            const predictedTeam = findTeamInR32(predictedWinner);
            const status = getPredictionStatus(round, matchIndex, predictedWinner);

            return (
                <Flex justify="space-between" align="center" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.5rem', marginTop: '0.2rem' }}>
                    <Text size="xs" style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase' }}>Your Pick:</Text>
                    <Flex align="center" gap="xs">
                        <Text size="xs" style={{ fontWeight: 800, color: status === 'correct' ? '#40c057' : status === 'incorrect' ? '#fa5252' : '#DFFF00', fontSize: '0.75rem' }}>
                            {getFlag(predictedTeam?.name || '')} {predictedTeam?.name || predictedWinner}
                        </Text>
                        {status === 'correct' ? (
                            <Badge color="green" size="xs" variant="filled" style={{ padding: '0 4px', height: '14px', fontSize: '0.6rem' }}>+pts</Badge>
                        ) : status === 'incorrect' ? (
                            <Badge color="red" size="xs" variant="filled" style={{ padding: '0 4px', height: '14px', fontSize: '0.6rem' }}>✗</Badge>
                        ) : (
                            <Badge color="yellow" size="xs" variant="filled" style={{ color: '#000', padding: '0 4px', height: '14px', fontSize: '0.6rem' }}>★</Badge>
                        )}
                    </Flex>
                </Flex>
            );
        };

        return (
            <Card
                key={`${round}-${matchIndex}`}
                style={{
                    background: 'rgba(13, 27, 18, 0.45)',
                    border: '1px solid rgba(46, 111, 64, 0.2)',
                    borderRadius: '12px',
                    padding: '0.75rem',
                    width: '100%',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                    minWidth: '240px'
                }}
            >
                <Text size="xs" style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.5px' }} mb="xs">
                    {roundLabel}
                </Text>
                {renderTeamRow(team1, 1)}
                {renderTeamRow(team2, 2)}
                {renderPredictionOverlay()}
            </Card>
        );
    };

    return (
        <AuthGuard>
            <style dangerouslySetInnerHTML={{
                __html: `
                .bracket-row-hover:hover {
                    background: rgba(223, 255, 0, 0.05) !important;
                    border-color: rgba(223, 255, 0, 0.2) !important;
                }
            `}} />

            <Container size="xl" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>

                {/* Header block with locks */}
                <Card className="glass-panel" p={{ base: 'md', md: 'xl' }} style={{ marginBottom: '3rem' }}>
                    <Flex justify="space-between" align={{ base: 'stretch', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap="md">
                        <Stack gap="xs" style={{ width: '100%' }}>
                            <Title order={1} fz={{ base: '24px', sm: '2.25rem' }} style={{ color: '#fff', fontWeight: 900 }} mb="xs">
                                📝 Prediction Editor
                            </Title>

                            {/* Neon highlighted Segmented Control */}
                            <SegmentedControl
                                value={activeTab}
                                onChange={setActiveTab}
                                data={[
                                    { label: '📋 Group Stage', value: 'group' },
                                    { label: '🏆 Knockout Stage', value: 'knockout' }
                                ]}
                                size="md"
                                radius="xl"
                                w={{ base: '100%', sm: '380px' }}
                                styles={{
                                    root: {
                                        background: 'rgba(13, 27, 18, 0.8)',
                                        border: '1px solid rgba(46, 111, 64, 0.3)',
                                        padding: '4px',
                                        maxWidth: '100%'
                                    },
                                    control: {
                                        border: 'none',
                                    },
                                    indicator: {
                                        background: '#2b5238',
                                    },
                                    label: {
                                        fontWeight: 800,
                                        transition: 'color 0.2s ease',
                                    }
                                }}
                            />
                        </Stack>

                        <Flex align="center" gap="md" w={{ base: '100%', md: 'auto' }}>
                            {currentIsLocked ? (
                                <Badge
                                    color="red"
                                    size="xl"
                                    variant="filled"
                                    leftSection={<IconLock size={16} />}
                                    style={{ width: '100%', minWidth: '150px' }}
                                    styles={{ root: { overflow: 'visible' }, label: { overflow: 'visible' } }}
                                >
                                    LOCKED
                                </Badge>
                            ) : (
                                <Button
                                    size="lg"
                                    color="brandLime"
                                    style={{ color: '#000', fontWeight: 800 }}
                                    w={{ base: '100%', md: 'auto' }}
                                    onClick={handleSaveCurrentPicks}
                                    loading={saving}
                                    leftSection={<IconDeviceFloppy size={18} />}
                                >
                                    {activeTab === 'group' ? 'Submit Group Picks' : 'Submit Knockout Picks'}
                                </Button>
                            )}
                        </Flex>
                    </Flex>

                    {currentIsLocked && (
                        <Text size="xs" color="red" style={{ fontWeight: 700 }} mt="md">
                            ⚠️ This contest phase is locked for submissions.
                        </Text>
                    )}
                </Card>

                {/* Switchable views */}
                {activeTab === 'group' ? (
                    /* Group Stage View */
                    <Card className="glass-panel" style={{ padding: '2.5rem', borderRadius: '16px' }}>
                        <Flex justify="space-between" align="center" mb="2.5rem" direction={{ base: 'column', sm: 'row' }} gap="md">
                            <Flex align="center" gap="sm">
                                <IconGridDots size={24} style={{ color: '#DFFF00' }} />
                                <Title order={2} style={{ color: '#fff', fontSize: '1.75rem', fontWeight: 900 }}>
                                    Group Stage
                                </Title>
                            </Flex>
                            <Flex align="center" gap="lg" direction={{ base: 'column', sm: 'row' }}>
                                {calculateTotalGroupPoints() > 0 && (
                                    <Badge color="green" size="lg" variant="filled" style={{ height: 'auto', padding: '0.6rem 1rem', borderRadius: '8px' }}>
                                        {calculateTotalGroupPoints()} points earned
                                    </Badge>
                                )}
                            </Flex>
                        </Flex>

                        <Grid gutter="xl">
                            {groups.map((group, groupIdx) => {
                                const groupLetter = group.groupName.replace("Group ", "");
                                const officialStandings = groupResults[groupLetter] || [];
                                const isGroupFinalized = !!finalizedGroups[groupLetter]?.finalized;

                                return (
                                    <Grid.Col key={group.groupId} span={12} style={{ marginBottom: '2.5rem' }}>
                                        <Grid gutter="lg" align="stretch">

                                            {/* Predictions Card (Left) */}
                                            <Grid.Col span={{ base: 12, md: 5 }}>
                                                <Card className="glass-panel" style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                                    <div>
                                                        <Flex justify="space-between" align={{ base: 'flex-start', sm: 'center' }} direction={{ base: 'column', sm: 'row' }} gap="xs" mb="lg">
                                                            <Title order={3} style={{ color: '#DFFF00', fontSize: '1.4rem', fontWeight: 900 }}>
                                                                {group.groupName} - Your Predictions
                                                            </Title>
                                                            {!savedGroupLetters.has(groupLetter) && (
                                                                <Badge color="orange" variant="light" size="xs">⚠️ No Picks Saved</Badge>
                                                            )}
                                                        </Flex>

                                                        {officialStandings.length > 0 && (() => {
                                                            const breakdown = calculateSingleGroupPoints(group, officialStandings, groupLetter);
                                                            if (!breakdown.isFinalized && !breakdown.isBonusFinalized) return null;

                                                            const totalPoints = breakdown.placementEarned + breakdown.bonusEarned;
                                                            return (
                                                                <Stack gap="xs" mb="lg" style={{
                                                                    background: 'rgba(64,192,87,0.06)',
                                                                    padding: '1rem',
                                                                    borderRadius: '8px',
                                                                    border: '1px solid rgba(64,192,87,0.2)'
                                                                }}>
                                                                    <Flex justify="space-between" align="center">
                                                                        <Text size="sm" style={{ color: '#fff', fontWeight: 800 }}>
                                                                            Points Earned
                                                                        </Text>
                                                                        <Badge color="green" variant="filled" size="md" style={{ fontWeight: 800 }}>
                                                                            {totalPoints} pts
                                                                        </Badge>
                                                                    </Flex>
                                                                    <Stack gap={2}>
                                                                        {breakdown.isFinalized && (
                                                                            <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
                                                                                Placement: <b>{breakdown.placementEarned}</b> / 45 pts
                                                                            </Text>
                                                                        )}
                                                                        {breakdown.isBonusFinalized && (
                                                                            <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
                                                                                Wildcard Bonus: <b>{breakdown.bonusEarned}</b> / 5 pts
                                                                            </Text>
                                                                        )}
                                                                    </Stack>
                                                                </Stack>
                                                            );
                                                        })()}

                                                        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff', fontSize: '0.875rem' }}>
                                                            <thead>
                                                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                                                    {(isGroupLocked || isGroupFinalized) && (
                                                                        <th style={{ textAlign: 'left', padding: '0.5rem', width: '60px', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Pos</th>
                                                                    )}
                                                                    <th style={{ textAlign: 'left', padding: '0.5rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Predicted Team</th>
                                                                    {!isGroupLocked && !isGroupFinalized && (
                                                                        <th style={{ textAlign: 'right', padding: '0.5rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', textTransform: 'uppercase', width: '120px' }}>Change Pos</th>
                                                                    )}
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {Array.from({ length: 4 }).map((_, rankIdx) => {
                                                                    const predictedTeam = group.teams[rankIdx];
                                                                    const posLabel = rankIdx === 0 ? "1st" : rankIdx === 1 ? "2nd" : rankIdx === 2 ? "3rd" : "4th";

                                                                    return (
                                                                        <tr key={rankIdx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                                            {(isGroupLocked || isGroupFinalized) && (
                                                                                <td style={{ padding: '0.85rem 0.5rem', fontWeight: 800, color: rankIdx < 2 ? '#DFFF00' : 'rgba(255,255,255,0.4)' }}>
                                                                                    {posLabel}
                                                                                </td>
                                                                            )}
                                                                            <td style={{ padding: '0.85rem 0.5rem' }}>
                                                                                {predictedTeam ? (
                                                                                    <Flex align="center" gap="sm">
                                                                                        <Text size="xl" style={{ lineHeight: 1 }}>{predictedTeam.flag}</Text>
                                                                                        <Text size="sm" style={{ fontWeight: 700 }}>{predictedTeam.name}</Text>
                                                                                    </Flex>
                                                                                ) : (
                                                                                    <Text size="sm" style={{ color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>TBD</Text>
                                                                                )}
                                                                            </td>
                                                                            {!isGroupLocked && !isGroupFinalized && (
                                                                                <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>
                                                                                    <select
                                                                                        value={rankIdx}
                                                                                        onChange={(e) => {
                                                                                            const toRank = parseInt(e.target.value, 10);
                                                                                            handleSwapTeams(groupIdx, rankIdx, toRank);
                                                                                        }}
                                                                                        style={{
                                                                                            background: 'rgba(13, 27, 18, 0.8)',
                                                                                            border: '1px solid rgba(46, 111, 64, 0.5)',
                                                                                            borderRadius: '6px',
                                                                                            color: '#DFFF00',
                                                                                            padding: '4px 8px',
                                                                                            fontSize: '0.75rem',
                                                                                            fontWeight: 'bold',
                                                                                            cursor: 'pointer',
                                                                                            outline: 'none',
                                                                                            transition: 'border-color 0.2s ease',
                                                                                        }}
                                                                                    >
                                                                                        <option value={0} style={{ background: '#0d1b12', color: '#fff' }}>1st</option>
                                                                                        <option value={1} style={{ background: '#0d1b12', color: '#fff' }}>2nd</option>
                                                                                        <option value={2} style={{ background: '#0d1b12', color: '#fff' }}>3rd</option>
                                                                                        <option value={3} style={{ background: '#0d1b12', color: '#fff' }}>4th</option>
                                                                                    </select>
                                                                                </td>
                                                                            )}
                                                                        </tr>
                                                                    );
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    </div>

                                                    <div>
                                                        <Flex direction="column" gap="xs" mt="xl" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                                                            <Text size="xs" style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>
                                                                🃏 Third Place Qualifier:
                                                            </Text>
                                                            <SegmentedControl
                                                                value={group.thirdPlaceAdvances ? "advances" : "omit"}
                                                                onChange={() => handleThirdPlaceToggle(groupIdx)}
                                                                disabled={isGroupLocked || isGroupFinalized}
                                                                data={[
                                                                    { label: '❌ Omit', value: 'omit' },
                                                                    { label: '🚀 Advances', value: 'advances' }
                                                                ]}
                                                                styles={{
                                                                    root: {
                                                                        background: 'rgba(0, 0, 0, 0.2)',
                                                                        border: '1px solid rgba(255, 255, 255, 0.05)',
                                                                        padding: '4px',
                                                                    },
                                                                    indicator: {
                                                                        background: group.thirdPlaceAdvances ? '#2e6f40' : 'rgba(255, 255, 255, 0.1)',
                                                                    },
                                                                    label: {
                                                                        fontWeight: 700,
                                                                        color: '#fff',
                                                                        fontSize: '0.75rem',
                                                                    }
                                                                }}
                                                            />
                                                        </Flex>
                                                    </div>
                                                </Card>
                                            </Grid.Col>

                                            {/* Official Live Results & Table (Right) */}
                                            <Grid.Col span={{ base: 12, md: 7 }}>
                                                <Card className="glass-panel" style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                                    <div>
                                                        <Flex justify="space-between" align={{ base: 'flex-start', sm: 'center' }} direction={{ base: 'column', sm: 'row' }} gap="xs" mb="lg">
                                                            <Group gap="xs">
                                                                <Title order={3} style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 900 }}>
                                                                    📋 Standings
                                                                </Title>
                                                                {isGroupFinalized && (
                                                                    <Badge color="green" variant="light" size="xs">Finalized</Badge>
                                                                )}
                                                            </Group>
                                                            <Button
                                                                size="xs"
                                                                variant="subtle"
                                                                color="brandLime"
                                                                onClick={() => handleShowGroupMatches(groupLetter)}
                                                                style={{ paddingLeft: 0, paddingRight: 0 }}
                                                            >
                                                                View Group Match Results
                                                            </Button>
                                                        </Flex>

                                                        <div style={{ overflowX: 'auto' }}>
                                                            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff', fontSize: '0.875rem', minWidth: '450px' }}>
                                                                <thead>
                                                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                                                        <th style={{ textAlign: 'left', padding: '0.75rem 0.5rem', width: '50px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Pos</th>
                                                                        <th style={{ textAlign: 'left', padding: '0.75rem 0.5rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Team</th>
                                                                        <th style={{ textAlign: 'center', padding: '0.75rem 0.5rem', color: 'rgba(255,255,255,0.4)' }}>PTS</th>
                                                                        <th style={{ textAlign: 'center', padding: '0.75rem 0.5rem', color: 'rgba(255,255,255,0.4)' }}>W-D-L</th>
                                                                        <th style={{ textAlign: 'center', padding: '0.75rem 0.5rem', color: 'rgba(255,255,255,0.4)' }}>GD</th>
                                                                        <th style={{ textAlign: 'center', padding: '0.75rem 0.5rem', color: 'rgba(255,255,255,0.4)' }}>GF</th>
                                                                        <th style={{ textAlign: 'center', padding: '0.75rem 0.5rem', color: 'rgba(255,255,255,0.4)' }}>FP</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {officialStandings.length === 0 ? (
                                                                        <tr>
                                                                            <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>
                                                                                Standings pending group matches kickoff!
                                                                            </td>
                                                                        </tr>
                                                                    ) : (
                                                                        officialStandings.map((team, oIdx) => {
                                                                            const predictedIdx = group.teams.findIndex(t => t.id === team.id);
                                                                            const actualRank = team.rank !== undefined && team.rank !== null ? team.rank : oIdx + 1;
                                                                            const isTopTwo = actualRank <= 2;
                                                                            const isWildcardQ = actualRank === 3 && team.isThirdPlaceQualifier;

                                                                            return (
                                                                                <tr key={team.id} style={{
                                                                                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                                                                                    background: 'transparent'
                                                                                }}>
                                                                                    <td style={{ padding: '0.9rem 0.5rem', fontWeight: 800 }}>
                                                                                        {team.rank !== undefined && team.rank !== null ? team.rank : oIdx + 1}
                                                                                    </td>
                                                                                    <td style={{ padding: '0.9rem 0.5rem' }}>
                                                                                        <Flex align="center" gap="sm">
                                                                                            <Text size="xl" style={{ lineHeight: 1 }}>{team.flag}</Text>
                                                                                            <Text size="sm" style={{ fontWeight: 700 }}>
                                                                                                {team.name}
                                                                                            </Text>
                                                                                            {isGroupFinalized && isTopTwo && (
                                                                                                <Badge color="green" variant="filled" size="xs">✓ Qualified</Badge>
                                                                                            )}
                                                                                            {isGroupFinalized && isWildcardQ && (
                                                                                                <Badge color="violet" variant="filled" size="xs">✓ Wildcard Qualified</Badge>
                                                                                            )}
                                                                                        </Flex>
                                                                                    </td>
                                                                                    <td style={{ padding: '0.9rem 0.5rem', textAlign: 'center', fontWeight: 800, color: '#DFFF00' }}>
                                                                                        {team.points}
                                                                                    </td>
                                                                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>
                                                                                        {team.wins}-{team.draws}-{team.losses}
                                                                                    </td>
                                                                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', fontWeight: 700 }}>
                                                                                        {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                                                                                    </td>
                                                                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>
                                                                                        {team.goalsFor}
                                                                                    </td>
                                                                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>
                                                                                        {team.conductScore}
                                                                                    </td>
                                                                                </tr>
                                                                            );
                                                                        })
                                                                    )}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </Card>
                                            </Grid.Col>

                                        </Grid>
                                    </Grid.Col>
                                );
                            })}
                        </Grid>

                        <Flex justify="center" mt="xl">
                            {isGroupLocked ? (
                                <Badge
                                    color="red"
                                    size="xl"
                                    variant="filled"
                                    leftSection={<IconLock size={16} />}
                                    style={{ width: '100%', maxWidth: '380px', minWidth: '150px' }}
                                    styles={{ root: { overflow: 'visible' }, label: { overflow: 'visible' } }}
                                >
                                    LOCKED
                                </Badge>
                            ) : (
                                <Button
                                    size="lg"
                                    color="brandLime"
                                    style={{ color: '#000', fontWeight: 800 }}
                                    w={{ base: '100%', sm: '380px' }}
                                    onClick={handleSavePicks}
                                    loading={saving}
                                    leftSection={<IconDeviceFloppy size={18} />}
                                >
                                    Submit Group Picks
                                </Button>
                            )}
                        </Flex>
                    </Card>
                ) : (
                    /* Premium Knockout Stage Bracket View */
                    <Card className="glass-panel" style={{ padding: '2.5rem', borderRadius: '16px' }}>
                        <Flex justify="space-between" align="center" mb="xl" direction={{ base: 'column', sm: 'row' }} gap="md">
                            <Flex align="center" gap="sm">
                                <IconTrophy size={24} style={{ color: '#DFFF00' }} />
                                <Title order={2} style={{ color: '#fff', fontSize: '1.75rem', fontWeight: 900 }}>
                                    Knockout Stage
                                </Title>
                            </Flex>

                            {/* Mode Toggle Switch */}
                            {isKnockoutLocked && (
                                <SegmentedControl
                                    value={koViewMode}
                                    onChange={(val) => setKoViewMode(val as 'real' | 'predicted')}
                                    data={[
                                        { label: '🚨 Live Results', value: 'real' },
                                        { label: '🔮 My Bracket', value: 'predicted' }
                                    ]}
                                    size="sm"
                                    radius="xl"
                                    w={{ base: '100%', sm: 'auto' }}
                                    styles={{
                                        root: {
                                            background: 'rgba(13, 27, 18, 0.8)',
                                            border: '1px solid rgba(46, 111, 64, 0.3)',
                                            padding: '4px',
                                        },
                                        indicator: {
                                            background: '#2e6f40',
                                        },
                                        label: {
                                            fontWeight: 700,
                                            color: '#fff',
                                            fontSize: '0.75rem',
                                        }
                                    }}
                                />
                            )}

                            {/* Point Scorer Badge */}
                            {knockoutResults.length > 0 && (
                                <Badge color="green" size="lg" variant="filled" style={{ height: 'auto', padding: '0.6rem 1rem', borderRadius: '8px' }}>
                                    {calculateKnockoutPoints()} points earned
                                </Badge>
                            )}
                        </Flex>


                        {/* Flex Horizontal Scrollable Bracket View */}
                        <div style={{
                            display: 'flex',
                            gap: '2.5rem',
                            overflowX: 'auto',
                            padding: '1rem 0.5rem 3rem 0.5rem',
                            scrollbarWidth: 'thin',
                        }}>
                            {/* Column 1: Round of 32 */}
                            <Flex direction="column" style={{ minWidth: '260px', flexShrink: 0, height: '2400px' }}>
                                <Badge color="brandGreen" size="lg" style={{ alignSelf: 'center', marginBottom: '1.5rem', width: '100%' }}>
                                    Round of 32
                                </Badge>
                                {Array.from({ length: 16 }).map((_, idx) => (
                                    <div key={idx} style={{ height: '145px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                        {renderMatchCard(1, idx)}
                                    </div>
                                ))}
                            </Flex>

                            {/* Column 2: Round of 16 */}
                            <Flex direction="column" style={{ minWidth: '260px', flexShrink: 0, height: '2400px' }}>
                                <Badge color="brandGreen" size="lg" style={{ alignSelf: 'center', marginBottom: '1.5rem', width: '100%' }}>
                                    Round of 16
                                </Badge>
                                {Array.from({ length: 8 }).map((_, idx) => (
                                    <div key={idx} style={{ height: '290px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                        {renderMatchCard(2, idx)}
                                    </div>
                                ))}
                            </Flex>

                            {/* Column 3: Quarterfinals */}
                            <Flex direction="column" style={{ minWidth: '260px', flexShrink: 0, height: '2400px' }}>
                                <Badge color="brandGreen" size="lg" style={{ alignSelf: 'center', marginBottom: '1.5rem', width: '100%' }}>
                                    Quarterfinals
                                </Badge>
                                {Array.from({ length: 4 }).map((_, idx) => (
                                    <div key={idx} style={{ height: '580px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                        {renderMatchCard(3, idx)}
                                    </div>
                                ))}
                            </Flex>

                            {/* Column 4: Semifinals */}
                            <Flex direction="column" style={{ minWidth: '260px', flexShrink: 0, height: '2320px' }}>
                                <Badge color="brandGreen" size="lg" style={{ alignSelf: 'center', marginBottom: '1.5rem', width: '100%' }}>
                                    Semifinals
                                </Badge>
                                {Array.from({ length: 2 }).map((_, idx) => (
                                    <div key={idx} style={{ height: '1160px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                        {renderMatchCard(4, idx)}
                                    </div>
                                ))}
                            </Flex>

                            {/* Column 5: Finals & 3rd Place Match */}
                            <Flex direction="column" style={{ minWidth: '260px', flexShrink: 0, height: '2320px', position: 'relative' }}>
                                <Badge color="brandLime" style={{ color: '#000', alignSelf: 'center', marginBottom: '1.5rem', width: '100%', zIndex: 10 }} size="lg">
                                    Finals & 3rd Place
                                </Badge>

                                {/* Grand Finals: Center aligned vertically in the middle of the bracket (1160px midpoint) */}
                                <div style={{
                                    position: 'absolute',
                                    top: '1160px',
                                    left: 0,
                                    right: 0,
                                    transform: 'translateY(-50%)',
                                    width: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center'
                                }}>
                                    {renderMatchCard(5, 0)}
                                </div>

                                {/* Third Place Match: Aligned beautifully towards the bottom of the bracket column */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: '100px',
                                    left: 0,
                                    right: 0,
                                    width: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center'
                                }}>
                                    {renderMatchCard(5, 1)}
                                </div>
                            </Flex>
                        </div>

                        <Flex justify="center" mt="xl">
                            {isKnockoutLocked ? (
                                <Badge
                                    color="red"
                                    size="xl"
                                    variant="filled"
                                    leftSection={<IconLock size={16} />}
                                    style={{ width: '100%', maxWidth: '380px', minWidth: '150px' }}
                                    styles={{ root: { overflow: 'visible' }, label: { overflow: 'visible' } }}
                                >
                                    LOCKED
                                </Badge>
                            ) : (
                                <Button
                                    size="lg"
                                    color="brandLime"
                                    style={{ color: '#000', fontWeight: 800 }}
                                    w={{ base: '100%', sm: '380px' }}
                                    onClick={handleSaveKnockoutPicks}
                                    loading={saving}
                                    leftSection={<IconDeviceFloppy size={18} />}
                                >
                                    Submit Knockout Picks
                                </Button>
                            )}
                        </Flex>
                    </Card>
                )}

                {/* Match Results Modal */}
                <Modal
                    opened={selectedGroupForMatches !== null}
                    onClose={() => {
                        setSelectedGroupForMatches(null);
                        setGroupMatches([]);
                    }}
                    title={
                        <div style={{ color: '#DFFF00', fontSize: '1.5rem', fontWeight: 900 }}>
                            Group {selectedGroupForMatches} - Match Results
                        </div>
                    }
                    size="lg"
                    centered
                    styles={{
                        content: {
                            background: 'rgba(20, 20, 20, 0.95)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(46, 111, 64, 0.4)',
                            color: '#fff',
                            borderRadius: '16px',
                            padding: '1rem',
                        },
                        header: {
                            background: 'transparent',
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            paddingBottom: '1rem',
                        },
                        close: {
                            color: 'rgba(255,255,255,0.6)',
                            '&:hover': {
                                color: '#fff',
                                background: 'rgba(255,255,255,0.1)',
                            }
                        }
                    }}
                >
                    {loadingGroupMatches ? (
                        <Flex justify="center" align="center" style={{ height: '200px' }}>
                            <Loader color="brandGreen" size="xl" />
                        </Flex>
                    ) : (
                        <Stack gap="xl" mt="md">
                            <Stack gap="sm">
                                {groupMatches.length === 0 ? (
                                    <Text size="sm" style={{ color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', textAlign: 'center' }}>
                                        No matches scheduled for this group.
                                    </Text>
                                ) : (
                                    groupMatches.map((match, idx) => {
                                        const score1 = match.country1Goals;
                                        const score2 = match.country2Goals;
                                        const hasBeenPlayed = score1 !== undefined && score1 !== null && score2 !== undefined && score2 !== null;

                                        const t1Name = match.country1?.fullName || match.country1?.code || "TBD";
                                        const t2Name = match.country2?.fullName || match.country2?.code || "TBD";
                                        const t1Flag = getFlag(t1Name);
                                        const t2Flag = getFlag(t2Name);

                                        return (
                                            <Card
                                                key={idx}
                                                style={{
                                                    background: 'rgba(255,255,255,0.03)',
                                                    border: '1px solid rgba(255,255,255,0.05)',
                                                    borderRadius: '8px',
                                                    padding: '1rem'
                                                }}
                                            >
                                                <Flex align="center" justify="space-between" gap="xs">
                                                    <Flex align="center" gap="xs" style={{ flex: 1, minWidth: 0 }}>
                                                        <Text fz={{ base: 'md', sm: 'xl' }} style={{ lineHeight: 1 }}>{t1Flag}</Text>
                                                        <Text size="sm" style={{ fontWeight: 700, whiteSpace: 'normal', wordBreak: 'break-word' }} visibleFrom="sm">{t1Name}</Text>
                                                        <Text size="xs" style={{ fontWeight: 700 }} hiddenFrom="sm">{match.country1?.code || "TBD"}</Text>
                                                    </Flex>

                                                    <Flex justify="center" align="center" style={{ flexShrink: 0, minWidth: '60px' }}>
                                                        {hasBeenPlayed ? (
                                                            <>
                                                                <Badge
                                                                    size="lg"
                                                                    color="brandGreen"
                                                                    variant="filled"
                                                                    visibleFrom="sm"
                                                                    style={{
                                                                        fontSize: '0.85rem',
                                                                        fontWeight: 800,
                                                                        padding: '4px 8px',
                                                                        borderRadius: '4px',
                                                                        height: 'auto'
                                                                    }}
                                                                >
                                                                    {score1.toString()} - {score2.toString()}
                                                                </Badge>
                                                                <Badge
                                                                    size="sm"
                                                                    color="brandGreen"
                                                                    variant="filled"
                                                                    hiddenFrom="sm"
                                                                    style={{
                                                                        fontSize: '0.75rem',
                                                                        fontWeight: 800,
                                                                        padding: '2px 6px',
                                                                        borderRadius: '4px',
                                                                        height: 'auto'
                                                                    }}
                                                                >
                                                                    {score1.toString()} - {score2.toString()}
                                                                </Badge>
                                                            </>
                                                        ) : (
                                                            <Badge size="xs" color="gray" variant="outline">
                                                                vs
                                                            </Badge>
                                                        )}
                                                    </Flex>

                                                    <Flex align="center" justify="flex-end" gap="xs" style={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
                                                        <Text size="sm" style={{ fontWeight: 700, whiteSpace: 'normal', wordBreak: 'break-word' }} visibleFrom="sm">{t2Name}</Text>
                                                        <Text size="xs" style={{ fontWeight: 700 }} hiddenFrom="sm">{match.country2?.code || "TBD"}</Text>
                                                        <Text fz={{ base: 'md', sm: 'xl' }} style={{ lineHeight: 1 }}>{t2Flag}</Text>
                                                    </Flex>
                                                </Flex>
                                            </Card>
                                        );
                                    })
                                )}
                            </Stack>

                            {groupMatches.length > 0 && (() => {
                                const teamStatsMap: Record<string, { gf: number, ga: number }> = {};

                                groupMatches.forEach(match => {
                                    const t1 = match.country1?.fullName || match.country1?.code;
                                    const t2 = match.country2?.fullName || match.country2?.code;
                                    if (!t1 || !t2) return;

                                    if (!teamStatsMap[t1]) teamStatsMap[t1] = { gf: 0, ga: 0 };
                                    if (!teamStatsMap[t2]) teamStatsMap[t2] = { gf: 0, ga: 0 };

                                    const score1 = match.country1Goals;
                                    const score2 = match.country2Goals;
                                    const hasPlayed = score1 !== undefined && score1 !== null && score2 !== undefined && score2 !== null;

                                    if (hasPlayed) {
                                        const g1 = Number(score1);
                                        const g2 = Number(score2);
                                        teamStatsMap[t1].gf += g1;
                                        teamStatsMap[t1].ga += g2;
                                        teamStatsMap[t2].gf += g2;
                                        teamStatsMap[t2].ga += g1;
                                    }
                                });

                                const chartData = Object.keys(teamStatsMap).map(teamName => ({
                                    team: teamName,
                                    "Goals For": teamStatsMap[teamName].gf,
                                    "Goals Against": teamStatsMap[teamName].ga,
                                }));

                                const totalGoals = chartData.reduce((acc, curr) => acc + curr["Goals For"], 0);

                                return (
                                    <Stack gap="xs">
                                        <Title order={4} style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700 }} mb="xs">
                                            📊 Group Goals Overview (GF vs GA)
                                        </Title>
                                        {totalGoals === 0 ? (
                                            <Card style={{ background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.1)', padding: '1.5rem', textAlign: 'center' }}>
                                                <Text size="xs" style={{ color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
                                                    Chart will populate once group matches are played and scored!
                                                </Text>
                                            </Card>
                                        ) : (
                                            <div style={{ height: 260 }}>
                                                <BarChart
                                                    h={240}
                                                    data={chartData}
                                                    dataKey="team"
                                                    series={[
                                                        { name: "Goals For", color: "brandGreen" },
                                                        { name: "Goals Against", color: "orange" }
                                                    ]}
                                                    gridAxis="y"
                                                    tickLine="y"
                                                />
                                            </div>
                                        )}
                                    </Stack>
                                );
                            })()}
                        </Stack>
                    )}
                </Modal>
            </Container>
        </AuthGuard>
    );
}
