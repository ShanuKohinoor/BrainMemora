
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { DashboardLayout } from "../components/DashboardLayout";
import {
    Users,
    Plus,
    Search,
    BookOpen,
    ArrowRight,
    Copy,
    Check,
    X,
    UserPlus,
    ArrowLeft,
    Clock,
    Trophy,
    Layers,
    FileText,
    Play,
    Share2,
    Video,
    Image as ImageIcon,
    Music,
    Link as LinkIcon,
    ClipboardList
} from "lucide-react";

type StudyRoom = {
    id: number;
    name: string;
    members: number;
    lastSession: string;
    inviteCode: string;
};

type StudyContact = {
    id: number;
    name: string;
    email: string;
};

type SessionType = "competition" | "group-study";
type StudyActivity = "quiz" | "flashcards" | "materials";
type ContentTab = "materials" | "quizzes" | "flashcards";
type MaterialType = "pdf" | "video" | "audio" | "image" | "url";

type SavedMaterial = {
    id: number;
    title: string;
    topic: string;
    type: MaterialType;
};

type SharedContent = {
    id: number;
    title: string;
    topic: string;
    type: "pdf" | "video" | "audio" | "image" | "url" | "quiz" | "flashcards";
};

const initialRooms: StudyRoom[] = [
    {
        id: 1,
        name: "Biology Study Room",
        members: 4,
        lastSession: "Cell Structure",
        inviteCode: "biology-demo"
    },
    {
        id: 2,
        name: "Anatomy Study Room",
        members: 3,
        lastSession: "Nervous System",
        inviteCode: "anatomy-demo"
    }
];

const initialContacts: StudyContact[] = [
    { id: 1, name: "Sherin", email: "sherin@example.com" },
    { id: 2, name: "Anu", email: "anu@example.com" },
    { id: 3, name: "Rahul", email: "rahul@example.com" },
    { id: 4, name: "Aisha", email: "aisha@example.com" }
];

// Demonstration data: later replace this with the user's saved library materials.
const savedMaterials: SavedMaterial[] = [
    { id: 1, title: "Cell Structure Notes", topic: "Cell Biology", type: "pdf" },
    { id: 2, title: "Human Cell Biology", topic: "Cell Biology", type: "video" },
    { id: 3, title: "Introduction to Genetics", topic: "Genetics", type: "audio" },
    { id: 4, title: "Cell Diagram", topic: "Cell Biology", type: "image" },
    { id: 5, title: "Biology Reference Article", topic: "Biology", type: "url" }
];

const savedQuizzes = [
    { id: 101, title: "Cell Biology Quiz", topic: "Cell Biology" },
    { id: 102, title: "Human Anatomy Quiz", topic: "Anatomy" },
    { id: 103, title: "Genetics Quiz", topic: "Genetics" }
];

const savedFlashcards = [
    { id: 201, title: "Cell Structure Flashcards", topic: "Cell Biology" },
    { id: 202, title: "Nervous System Flashcards", topic: "Anatomy" }
];

const roomMembers = ["You", "Sherin", "Anu", "Rahul"];

function shuffleTeams(members: string[]) {
    const shuffled = [...members];

    for (let i = shuffled.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));

        [shuffled[i], shuffled[randomIndex]] = [
            shuffled[randomIndex],
            shuffled[i]
        ];
    }

    const teamOne: string[] = [];
    const teamTwo: string[] = [];

    shuffled.forEach((member, index) => {
        if (index % 2 === 0) {
            teamOne.push(member);
        } else {
            teamTwo.push(member);
        }
    });

    return [teamOne, teamTwo];
}

function StudyRoomsPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const [rooms, setRooms] = useState<StudyRoom[]>(initialRooms);
    const [contacts] = useState<StudyContact[]>(initialContacts);

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showContactsModal, setShowContactsModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);

    const [newRoomName, setNewRoomName] = useState("");
    const [selectedRoom, setSelectedRoom] = useState<StudyRoom | null>(null);
    const [invitedContacts, setInvitedContacts] = useState<number[]>([]);

    const [searchTerm, setSearchTerm] = useState("");
    const [contactSearch, setContactSearch] = useState("");
    const [inviteCopied, setInviteCopied] = useState(false);
    const [roomSearch, setRoomSearch] = useState("");
    const [statusMessage, setStatusMessage] = useState("");

    // Session states
    const [sessionType, setSessionType] =
        useState<SessionType>("competition");

    const [activity, setActivity] =
        useState<StudyActivity>("quiz");

    const [topic, setTopic] = useState("");
    const [duration, setDuration] = useState("25");
    const [sessionActive, setSessionActive] = useState(false);
    const [remainingSeconds, setRemainingSeconds] = useState(0);
    const [teams, setTeams] = useState<string[][]>([]);

    // Shared content UI states
    const [activeContentTab, setActiveContentTab] =
        useState<ContentTab>("materials");

    const [selectedContent, setSelectedContent] = useState<number[]>([]);

    const [sharedContent, setSharedContent] = useState<
        Record<number, SharedContent[]>
    >({
        1: [
            {
                id: 1,
                title: "Cell Structure Notes",
                topic: "Cell Biology",
                type: "pdf"
            }
        ],
        2: []
    });

    const roomId = location.state?.roomId as number | undefined;
    const currentRoom = rooms.find((room) => room.id === roomId);

    const inviteLink = selectedRoom
        ? `https://brainmemora.com/join/${selectedRoom.inviteCode}`
        : "";

    const filteredContacts = contacts.filter((contact) =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredSavedContacts = contacts.filter((contact) =>
        contact.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
        contact.email.toLowerCase().includes(contactSearch.toLowerCase())
    );

    const filteredRooms = rooms.filter((room) =>
        room.name.toLowerCase().includes(roomSearch.toLowerCase())
    );

    useEffect(() => {
        if (!sessionActive) return;

        const timer = window.setInterval(() => {
            setRemainingSeconds((previous) => Math.max(previous - 1, 0));
        }, 1000);

        return () => window.clearInterval(timer);
    }, [sessionActive]);

    useEffect(() => {
        if (sessionActive && remainingSeconds === 0) {
            setSessionActive(false);
            setStatusMessage("The study session has finished.");
        }
    }, [sessionActive, remainingSeconds]);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remaining = seconds % 60;

        return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
    };

    const showMessage = (message: string) => {
        setStatusMessage(message);
    };

    const handleCreateRoom = () => {
        if (!newRoomName.trim()) {
            showMessage("Please enter a room name.");
            return;
        }

        const newRoom: StudyRoom = {
            id: Date.now(),
            name: newRoomName.trim(),
            members: 1,
            lastSession: "No sessions yet",
            inviteCode: `room-${Date.now().toString(36)}`
        };

        setRooms((previous) => [newRoom, ...previous]);
        setNewRoomName("");
        setShowCreateForm(false);
        setSelectedRoom(newRoom);
        setInvitedContacts([]);
        setSearchTerm("");
        setInviteCopied(false);
        setShowInviteModal(true);
    };

    const handleOpenRoom = (room: StudyRoom) => {
        navigate("/studyRoomPage", {
            state: { roomId: room.id, roomName: room.name }
        });
    };

    const handleBackToRooms = () => {
        navigate("/studyRoomPage", {
            replace: true,
            state: null
        });
    };

    const handleOpenInvite = (room: StudyRoom) => {
        setSelectedRoom(room);
        setInvitedContacts([]);
        setSearchTerm("");
        setInviteCopied(false);
        setShowInviteModal(true);
    };

    const handleSelectContact = (contactId: number) => {
        if (invitedContacts.includes(contactId)) return;

        setInvitedContacts((previous) => [...previous, contactId]);

        const contact = contacts.find((item) => item.id === contactId);

        if (contact) {
            showMessage(`Invitation prepared for ${contact.name}.`);
        }
    };

    const handleSelectAll = () => {
        const contactsToInvite = filteredContacts.filter(
            (contact) => !invitedContacts.includes(contact.id)
        );

        if (contactsToInvite.length === 0) return;

        setInvitedContacts((previous) => [
            ...previous,
            ...contactsToInvite.map((contact) => contact.id)
        ]);

        showMessage(`${contactsToInvite.length} invitations prepared.`);
    };

    const handleCopyInvite = async () => {
        try {
            await navigator.clipboard.writeText(inviteLink);
            setInviteCopied(true);
            showMessage("Invitation link copied.");
        } catch {
            showMessage("Unable to copy the invitation link.");
        }
    };

    const handleStartSession = () => {
        if (!topic.trim()) {
            showMessage("Please enter a topic or chapter.");
            return;
        }

        if (sessionType === "competition") {
            setTeams(shuffleTeams(roomMembers));
        } else {
            setTeams([]);
        }

        setRemainingSeconds(Number(duration) * 60);
        setSessionActive(true);
        showMessage("Study session started.");
    };

    const handleEndSession = () => {
        setSessionActive(false);
        setRemainingSeconds(0);
        showMessage("Study session ended.");
    };

    const handleSessionTypeChange = (type: SessionType) => {
        setSessionType(type);
        setActivity("quiz");
    };

    const handleActivityChange = (value: StudyActivity) => {
        setActivity(value);
    };

    const handleOpenShare = () => {
        setActiveContentTab("materials");
        setSelectedContent([]);
        setShowShareModal(true);
    };

    const handleToggleContent = (contentId: number) => {
        setSelectedContent((previous) =>
            previous.includes(contentId)
                ? previous.filter((id) => id !== contentId)
                : [...previous, contentId]
        );
    };

    const handleShareSelected = () => {
        if (!currentRoom || selectedContent.length === 0) {
            showMessage("Please select at least one item.");
            return;
        }

        let selectedItems: SharedContent[] = [];

        if (activeContentTab === "materials") {
            selectedItems = savedMaterials
                .filter((item) => selectedContent.includes(item.id))
                .map((item) => ({ ...item }));
        } else if (activeContentTab === "quizzes") {
            selectedItems = savedQuizzes
                .filter((item) => selectedContent.includes(item.id))
                .map((item) => ({ ...item, type: "quiz" as const }));
        } else {
            selectedItems = savedFlashcards
                .filter((item) => selectedContent.includes(item.id))
                .map((item) => ({ ...item, type: "flashcards" as const }));
        }

        setSharedContent((previous) => ({
            ...previous,
            [currentRoom.id]: [
                ...(previous[currentRoom.id] || []),
                ...selectedItems.filter(
                    (item) =>
                        !(previous[currentRoom.id] || []).some(
                            (shared) => shared.id === item.id
                        )
                )
            ]
        }));

        setShowShareModal(false);
        setSelectedContent([]);
        showMessage(`${selectedItems.length} item(s) added to shared content.`);
    };

    const getContentIcon = (type: SharedContent["type"] | MaterialType) => {
        switch (type) {
            case "pdf":
                return <FileText size={19} />;
            case "video":
                return <Video size={19} />;
            case "audio":
                return <Music size={19} />;
            case "image":
                return <ImageIcon size={19} />;
            case "url":
                return <LinkIcon size={19} />;
            case "quiz":
                return <ClipboardList size={19} />;
            case "flashcards":
                return <Layers size={19} />;
            default:
                return <FileText size={19} />;
        }
    };

    const contentList =
        activeContentTab === "materials"
            ? savedMaterials
            : activeContentTab === "quizzes"
                ? savedQuizzes
                : savedFlashcards;

    const currentSharedContent = currentRoom
        ? sharedContent[currentRoom.id] || []
        : [];

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-[#F8F8F5] p-4 md:p-7">
                <div className="mx-auto max-w-7xl space-y-7">

                    {statusMessage && (
                        <div className="flex items-center justify-between rounded-lg border border-[#F27A58]/20 bg-[#FDF3EC] px-4 py-3 text-sm text-[#2D4030]">
                            <p>{statusMessage}</p>
                            <button
                                onClick={() => setStatusMessage("")}
                                className="ml-3 text-gray-500 hover:text-gray-800"
                            >
                                <X size={17} />
                            </button>
                        </div>
                    )}

                    {/* ROOM DASHBOARD */}
                    {currentRoom ? (
                        <>
                            <section>
                                <button
                                    onClick={handleBackToRooms}
                                    className="mb-5 flex items-center gap-2 text-sm text-gray-500 hover:text-[#2D4030]"
                                >
                                    <ArrowLeft size={18} />
                                    Back to Study Rooms
                                </button>

                                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                    <div>
                                        <h1 className="text-2xl font-bold text-[#2D4030] md:text-3xl">
                                            {currentRoom.name}
                                        </h1>
                                        <p className="mt-2 text-sm text-gray-500">
                                            {currentRoom.members} members
                                        </p>
                                    </div>

                                    <button
                                        onClick={handleOpenShare}
                                        className="flex items-center justify-center gap-2 rounded-lg bg-[#F27A58] px-5 py-3 text-sm font-semibold text-white hover:bg-[#df6848]"
                                    >
                                        <Share2 size={18} />
                                        Share Content
                                    </button>
                                </div>
                            </section>

                            {/* SHARED CONTENT */}
                            <section className="rounded-xl border border-gray-100 bg-white p-6">
                                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                                    <div>
                                        <h2 className="text-xl font-bold text-[#2D4030]">
                                            Shared Content
                                        </h2>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Learning resources available to room members.
                                        </p>
                                    </div>
                                    <span className="rounded-full bg-[#FDF3EC] px-3 py-1 text-xs font-medium text-[#2D4030]">
                                        {currentSharedContent.length} items
                                    </span>
                                </div>

                                {currentSharedContent.length === 0 ? (
                                    <div className="mt-5 rounded-lg border border-dashed border-gray-200 p-8 text-center">
                                        <BookOpen size={28} className="mx-auto mb-3 text-gray-400" />
                                        <p className="font-medium text-[#2D4030]">
                                            No content shared yet
                                        </p>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Share learning materials, quizzes or flashcards with your room.
                                        </p>
                                        <button
                                            onClick={handleOpenShare}
                                            className="mt-4 rounded-lg bg-[#F27A58] px-4 py-2 text-sm font-medium text-white"
                                        >
                                            Share your first item
                                        </button>
                                    </div>
                                ) : (
                                    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                        {currentSharedContent.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex items-center gap-3 rounded-lg border border-gray-100 p-4"
                                            >
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FDF3EC] text-[#F27A58]">
                                                    {getContentIcon(item.type)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-semibold text-[#2D4030]">
                                                        {item.title}
                                                    </p>
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        {item.topic} · {item.type.toUpperCase()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>

                            {/* ACTIVE SESSION */}
                            {sessionActive ? (
                                <section className="rounded-xl border border-gray-100 bg-white p-6">
                                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                        <div>
                                            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                                                Session In Progress
                                            </span>
                                            <h2 className="mt-4 text-xl font-bold text-[#2D4030]">
                                                {topic}
                                            </h2>
                                            <p className="mt-1 text-sm text-gray-500">
                                                {sessionType === "competition"
                                                    ? "Group Quiz Competition"
                                                    : activity === "quiz"
                                                        ? "Individual Quiz"
                                                        : activity === "flashcards"
                                                            ? "Individual Flashcard Review"
                                                            : "Individual Material Learning"}
                                            </p>
                                        </div>

                                        <div className="rounded-xl bg-[#FDF3EC] p-5 text-center">
                                            <Clock className="mx-auto mb-2 text-[#F27A58]" size={24} />
                                            <p className="text-xs text-gray-500">Time Remaining</p>
                                            <p className="mt-1 text-3xl font-bold text-[#2D4030]">
                                                {formatTime(remainingSeconds)}
                                            </p>
                                        </div>
                                    </div>

                                    {sessionType === "competition" && (
                                        <div className="mt-6">
                                            <h3 className="mb-4 flex items-center gap-2 font-semibold text-[#2D4030]">
                                                <Trophy size={19} className="text-[#F27A58]" />
                                                Shuffled Teams
                                            </h3>

                                            <div className="grid gap-4 sm:grid-cols-2">
                                                {teams.map((team, index) => (
                                                    <div key={index} className="rounded-lg bg-[#F8F8F5] p-4">
                                                        <h4 className="font-semibold text-[#2D4030]">
                                                            Team {index + 1}
                                                        </h4>
                                                        {team.map((member) => (
                                                            <p key={member} className="mt-2 rounded-lg bg-white p-2 text-sm text-gray-600">
                                                                {member}
                                                            </p>
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {sessionType === "group-study" && (
                                        <div className="mt-5 rounded-lg bg-[#F8F8F5] p-4">
                                            <p className="font-medium text-[#2D4030]">
                                                Individual Learning
                                            </p>
                                            <p className="mt-1 text-sm text-gray-500">
                                                Each member can work on their own {activity === "quiz"
                                                    ? "quiz"
                                                    : activity === "flashcards"
                                                        ? "flashcards"
                                                        : "shared materials"} during this session.
                                            </p>
                                        </div>
                                    )}

                                    <button
                                        onClick={handleEndSession}
                                        className="mt-6 rounded-lg bg-red-50 px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-100"
                                    >
                                        End Session
                                    </button>
                                </section>
                            ) : (
                                <section className="rounded-xl border border-gray-100 bg-white p-6">
                                    <h2 className="text-xl font-bold text-[#2D4030]">
                                        Start a Study Session
                                    </h2>
                                    <p className="mt-2 text-sm text-gray-500">
                                        Choose how your room members will study.
                                    </p>

                                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                        <button
                                            onClick={() => handleSessionTypeChange("competition")}
                                            className={`rounded-xl border p-4 text-left ${
                                                sessionType === "competition"
                                                    ? "border-[#F27A58] bg-[#FDF3EC]"
                                                    : "border-gray-200"
                                            }`}
                                        >
                                            <Trophy className="mb-3 text-[#F27A58]" size={24} />
                                            <h3 className="font-semibold text-[#2D4030]">
                                                Group Quiz Competition
                                            </h3>
                                            <p className="mt-2 text-sm text-gray-500">
                                                Members are shuffled into two teams and compete in a quiz.
                                            </p>
                                        </button>

                                        <button
                                            onClick={() => handleSessionTypeChange("group-study")}
                                            className={`rounded-xl border p-4 text-left ${
                                                sessionType === "group-study"
                                                    ? "border-[#F27A58] bg-[#FDF3EC]"
                                                    : "border-gray-200"
                                            }`}
                                        >
                                            <Users className="mb-3 text-[#F27A58]" size={24} />
                                            <h3 className="font-semibold text-[#2D4030]">
                                                Group Study
                                            </h3>
                                            <p className="mt-2 text-sm text-gray-500">
                                                Every member learns individually during the same session.
                                            </p>
                                        </button>
                                    </div>

                                    {sessionType === "group-study" && (
                                        <div className="mt-6">
                                            <label className="mb-3 block text-sm font-semibold text-[#2D4030]">
                                                Choose Individual Activity
                                            </label>

                                            <div className="grid gap-3 sm:grid-cols-3">
                                                {(["quiz", "flashcards", "materials"] as StudyActivity[]).map((item) => (
                                                    <button
                                                        key={item}
                                                        onClick={() => handleActivityChange(item)}
                                                        className={`rounded-lg border p-4 text-left ${
                                                            activity === item
                                                                ? "border-[#F27A58] bg-[#FDF3EC]"
                                                                : "border-gray-200"
                                                        }`}
                                                    >
                                                        {item === "quiz" ? (
                                                            <BookOpen className="mb-2 text-[#F27A58]" size={22} />
                                                        ) : item === "flashcards" ? (
                                                            <Layers className="mb-2 text-[#F27A58]" size={22} />
                                                        ) : (
                                                            <FileText className="mb-2 text-[#F27A58]" size={22} />
                                                        )}
                                                        <p className="text-sm font-semibold capitalize text-[#2D4030]">
                                                            {item === "materials" ? "Shared Materials" : item}
                                                        </p>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-6">
                                        <label className="mb-2 block text-sm font-semibold text-[#2D4030]">
                                            Chapter / Topic
                                        </label>
                                        <input
                                            value={topic}
                                            onChange={(e) => setTopic(e.target.value)}
                                            placeholder="e.g. Cell Structure"
                                            className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#F27A58]"
                                        />
                                    </div>

                                    <div className="mt-5">
                                        <label className="mb-2 block text-sm font-semibold text-[#2D4030]">
                                            Session Duration
                                        </label>
                                        <select
                                            value={duration}
                                            onChange={(e) => setDuration(e.target.value)}
                                            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#F27A58] sm:max-w-xs"
                                        >
                                            <option value="15">15 minutes</option>
                                            <option value="25">25 minutes</option>
                                            <option value="30">30 minutes</option>
                                            <option value="45">45 minutes</option>
                                            <option value="60">60 minutes</option>
                                            <option value="90">90 minutes</option>
                                        </select>
                                    </div>

                                    <button
                                        onClick={handleStartSession}
                                        className="mt-6 flex items-center gap-2 rounded-lg bg-[#F27A58] px-6 py-3 text-sm font-semibold text-white hover:bg-[#df6848]"
                                    >
                                        <Play size={17} />
                                        Start Session
                                    </button>
                                </section>
                            )}

                            {/* ROOM INFORMATION */}
                            <section className="grid gap-4 sm:grid-cols-2">
                                <div className="rounded-xl border border-gray-100 bg-white p-5">
                                    <Users className="mb-3 text-[#F27A58]" size={23} />
                                    <p className="text-2xl font-bold text-[#2D4030]">
                                        {currentRoom.members}
                                    </p>
                                    <p className="mt-1 text-sm text-gray-500">Room Members</p>
                                </div>

                                <div className="rounded-xl border border-gray-100 bg-white p-5">
                                    <Clock className="mb-3 text-[#F27A58]" size={23} />
                                    <p className="text-lg font-bold text-[#2D4030]">
                                        {sessionActive ? "In Progress" : "Ready"}
                                    </p>
                                    <p className="mt-1 text-sm text-gray-500">Session Status</p>
                                </div>
                            </section>
                        </>
                    ) : (
                        /* STUDY ROOMS LIST */
                        <>
                            <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                <div>
                                    <h1 className="text-2xl font-bold text-[#2D4030] md:text-3xl">
                                        Study Rooms
                                    </h1>
                                    <p className="mt-2 text-sm text-gray-500">
                                        Create learning spaces and study together with others.
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            setContactSearch("");
                                            setShowContactsModal(true);
                                        }}
                                        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-[#2D4030] hover:bg-gray-50"
                                    >
                                        <Users size={18} />
                                        Contacts
                                    </button>

                                    <button
                                        onClick={() => setShowCreateForm(true)}
                                        className="flex items-center gap-2 rounded-lg bg-[#F27A58] px-5 py-3 text-sm font-medium text-white hover:bg-[#df6848]"
                                    >
                                        <Plus size={18} />
                                        Create Study Room
                                    </button>
                                </div>
                            </section>

                            {showCreateForm && (
                                <section className="rounded-xl border border-gray-100 bg-white p-5">
                                    <div className="mb-4 flex items-center justify-between">
                                        <h2 className="text-lg font-semibold text-[#2D4030]">
                                            Create a New Study Room
                                        </h2>
                                        <button
                                            onClick={() => setShowCreateForm(false)}
                                            className="text-gray-400 hover:text-gray-700"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>

                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Room Name
                                    </label>
                                    <input
                                        value={newRoomName}
                                        onChange={(e) => setNewRoomName(e.target.value)}
                                        placeholder="e.g. Biology Study Room"
                                        className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#F27A58]"
                                    />

                                    <div className="mt-4 flex justify-end gap-2">
                                        <button
                                            onClick={() => setShowCreateForm(false)}
                                            className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-600"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleCreateRoom}
                                            className="rounded-lg bg-[#F27A58] px-5 py-2.5 text-sm font-medium text-white"
                                        >
                                            Create Room
                                        </button>
                                    </div>
                                </section>
                            )}

                            <section>
                                <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                                    <div>
                                        <h2 className="text-lg font-semibold text-[#2D4030]">
                                            My Study Rooms
                                        </h2>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Rooms you have created or joined.
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3">
                                        <Search size={17} className="text-gray-400" />
                                        <input
                                            value={roomSearch}
                                            onChange={(e) => setRoomSearch(e.target.value)}
                                            placeholder="Search rooms..."
                                            className="w-full py-2.5 text-sm outline-none"
                                        />
                                    </div>
                                </div>

                                {filteredRooms.length === 0 ? (
                                    <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
                                        <BookOpen size={30} className="mx-auto mb-3 text-gray-400" />
                                        <p className="font-medium text-[#2D4030]">
                                            No study rooms found
                                        </p>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Create a room to start learning together.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                                        {filteredRooms.map((room) => (
                                            <article
                                                key={room.id}
                                                className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
                                            >
                                                <div className="mb-4 flex items-start justify-between">
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FDF3EC] text-[#F27A58]">
                                                        <Users size={23} />
                                                    </div>
                                                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                                                        Active Room
                                                    </span>
                                                </div>

                                                <h3 className="text-lg font-semibold text-[#2D4030]">
                                                    {room.name}
                                                </h3>

                                                <div className="mt-4 space-y-2 text-sm text-gray-500">
                                                    <p className="flex items-center gap-2">
                                                        <Users size={16} />
                                                        {room.members} members
                                                    </p>
                                                    <p className="flex items-center gap-2">
                                                        <BookOpen size={16} />
                                                        Last session: {room.lastSession}
                                                    </p>
                                                </div>

                                                <div className="mt-5 flex flex-col gap-2">
                                                    <button
                                                        onClick={() => handleOpenRoom(room)}
                                                        className="flex items-center justify-center gap-2 rounded-lg bg-[#2D4030] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#223326]"
                                                    >
                                                        Open Room
                                                        <ArrowRight size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenInvite(room)}
                                                        className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                                                    >
                                                        <UserPlus size={16} />
                                                        Invite Members
                                                    </button>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                )}
                            </section>

                            {/* CONTACTS MODAL */}
                            {showContactsModal && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                                    <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h2 className="text-xl font-semibold text-[#2D4030]">
                                                    Study Contacts
                                                </h2>
                                                <p className="mt-1 text-sm text-gray-500">
                                                    {contacts.length} saved contacts
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setShowContactsModal(false)}
                                                className="text-gray-400 hover:text-gray-700"
                                            >
                                                <X size={21} />
                                            </button>
                                        </div>

                                        <div className="mt-4 flex items-center gap-2 rounded-lg border border-gray-200 px-3">
                                            <Search size={16} className="text-gray-400" />
                                            <input
                                                value={contactSearch}
                                                onChange={(e) => setContactSearch(e.target.value)}
                                                placeholder="Search contacts..."
                                                className="w-full py-2.5 text-sm outline-none"
                                            />
                                        </div>

                                        <div className="mt-4 max-h-72 space-y-2 overflow-y-auto">
                                            {filteredSavedContacts.map((contact) => (
                                                <div
                                                    key={contact.id}
                                                    className="flex items-center gap-3 rounded-lg border border-gray-100 p-3"
                                                >
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FDF3EC] font-semibold text-[#F27A58]">
                                                        {contact.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-[#2D4030]">
                                                            {contact.name}
                                                        </p>
                                                        <p className="text-xs text-gray-400">
                                                            {contact.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* INVITE MODAL */}
                            {showInviteModal && selectedRoom && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                                    <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h2 className="text-xl font-semibold text-[#2D4030]">
                                                    Invite Members
                                                </h2>
                                                <p className="mt-1 text-sm text-gray-500">
                                                    Invite people to {selectedRoom.name}.
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setShowInviteModal(false)}
                                                className="text-gray-400 hover:text-gray-700"
                                            >
                                                <X size={21} />
                                            </button>
                                        </div>

                                        <div className="mt-5 rounded-xl bg-[#F8F8F5] p-4">
                                            <p className="mb-2 text-sm font-medium text-[#2D4030]">
                                                Share Room Invitation Link
                                            </p>
                                            <div className="flex gap-2">
                                                <input
                                                    readOnly
                                                    value={inviteLink}
                                                    className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-xs text-gray-600"
                                                />
                                                <button
                                                    onClick={handleCopyInvite}
                                                    className="flex items-center gap-1 rounded-lg bg-[#2D4030] px-3 text-xs font-medium text-white"
                                                >
                                                    {inviteCopied ? <Check size={15} /> : <Copy size={15} />}
                                                    {inviteCopied ? "Copied" : "Copy Link"}
                                                </button>
                                            </div>
                                            <p className="mt-3 text-xs text-gray-500">
                                                Copy this link and share it wherever you like.
                                            </p>
                                        </div>

                                        <div className="mt-6">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-semibold text-[#2D4030]">
                                                    Invite from Study Contacts
                                                </h3>
                                                <span className="text-xs text-gray-500">
                                                    {invitedContacts.length} invited
                                                </span>
                                            </div>

                                            <div className="mt-3 flex items-center gap-2 rounded-lg border border-gray-200 px-3">
                                                <Search size={16} className="text-gray-400" />
                                                <input
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    placeholder="Search contacts..."
                                                    className="w-full py-2.5 text-sm outline-none"
                                                />
                                            </div>

                                            <button
                                                onClick={handleSelectAll}
                                                className="mt-4 w-full rounded-lg bg-[#FDF3EC] p-3 text-left text-sm font-semibold text-[#2D4030]"
                                            >
                                                Select All
                                            </button>

                                            <div className="mt-3 max-h-52 space-y-2 overflow-y-auto">
                                                {filteredContacts.map((contact) => {
                                                    const alreadyInvited =
                                                        invitedContacts.includes(contact.id);

                                                    return (
                                                        <div
                                                            key={contact.id}
                                                            className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FDF3EC] font-semibold text-[#F27A58]">
                                                                    {contact.name.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-medium text-[#2D4030]">
                                                                        {contact.name}
                                                                    </p>
                                                                    <p className="text-xs text-gray-400">
                                                                        {contact.email}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => handleSelectContact(contact.id)}
                                                                disabled={alreadyInvited}
                                                                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 disabled:border-green-100 disabled:bg-green-50 disabled:text-green-700"
                                                            >
                                                                {alreadyInvited ? "Invited" : "Invite"}
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="mt-5 flex justify-end">
                                            <button
                                                onClick={() => setShowInviteModal(false)}
                                                className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-600"
                                            >
                                                Close
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* SHARE CONTENT MODAL */}
                    {showShareModal && currentRoom && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold text-[#2D4030]">
                                            Share Content
                                        </h2>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Choose content from your BrainMemora library to share with {currentRoom.name}.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setShowShareModal(false)}
                                        className="text-gray-400 hover:text-gray-700"
                                    >
                                        <X size={21} />
                                    </button>
                                </div>

                                {/* Content tabs */}
                                <div className="mt-6 grid grid-cols-3 gap-2 rounded-lg bg-[#F8F8F5] p-1">
                                    <button
                                        onClick={() => {
                                            setActiveContentTab("materials");
                                            setSelectedContent([]);
                                        }}
                                        className={`rounded-md px-3 py-2.5 text-sm font-medium ${
                                            activeContentTab === "materials"
                                                ? "bg-white text-[#2D4030] shadow-sm"
                                                : "text-gray-500"
                                        }`}
                                    >
                                        <FileText className="mx-auto mb-1" size={18} />
                                        Materials
                                    </button>
                                    <button
                                        onClick={() => {
                                            setActiveContentTab("quizzes");
                                            setSelectedContent([]);
                                        }}
                                        className={`rounded-md px-3 py-2.5 text-sm font-medium ${
                                            activeContentTab === "quizzes"
                                                ? "bg-white text-[#2D4030] shadow-sm"
                                                : "text-gray-500"
                                        }`}
                                    >
                                        <BookOpen className="mx-auto mb-1" size={18} />
                                        Quizzes
                                    </button>
                                    <button
                                        onClick={() => {
                                            setActiveContentTab("flashcards");
                                            setSelectedContent([]);
                                        }}
                                        className={`rounded-md px-3 py-2.5 text-sm font-medium ${
                                            activeContentTab === "flashcards"
                                                ? "bg-white text-[#2D4030] shadow-sm"
                                                : "text-gray-500"
                                        }`}
                                    >
                                        <Layers className="mx-auto mb-1" size={18} />
                                        Flashcards
                                    </button>
                                </div>

                                <div className="mt-5 flex items-center justify-between">
                                    <h3 className="font-semibold text-[#2D4030]">
                                        {activeContentTab === "materials"
                                            ? "Your Saved Materials"
                                            : activeContentTab === "quizzes"
                                                ? "Your Saved Quizzes"
                                                : "Your Saved Flashcards"}
                                    </h3>
                                    <span className="text-xs text-gray-500">
                                        {selectedContent.length} selected
                                    </span>
                                </div>

                                <div className="mt-3 space-y-2">
                                    {contentList.map((item) => {
                                        const isSelected = selectedContent.includes(item.id);
                                        const itemType =
                                            activeContentTab === "materials"
                                                ? (item as SavedMaterial).type
                                                : activeContentTab === "quizzes"
                                                    ? "quiz"
                                                    : "flashcards";

                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => handleToggleContent(item.id)}
                                                className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left ${
                                                    isSelected
                                                        ? "border-[#F27A58] bg-[#FDF3EC]"
                                                        : "border-gray-200 hover:bg-gray-50"
                                                }`}
                                            >
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-[#F27A58]">
                                                    {getContentIcon(itemType as SharedContent["type"])}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-semibold text-[#2D4030]">
                                                        {item.title}
                                                    </p>
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        {item.topic}
                                                    </p>
                                                </div>
                                                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                                                    isSelected
                                                        ? "border-[#F27A58] bg-[#F27A58] text-white"
                                                        : "border-gray-300 bg-white"
                                                }`}>
                                                    {isSelected && <Check size={13} />}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {contentList.length === 0 && (
                                    <p className="py-8 text-center text-sm text-gray-500">
                                        No saved content available.
                                    </p>
                                )}

                                <div className="mt-6 flex flex-col-reverse justify-between gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center">
                                    <p className="text-xs text-gray-500">
                                        Selected content will appear in this room.
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setShowShareModal(false)}
                                            className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-600"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleShareSelected}
                                            disabled={selectedContent.length === 0}
                                            className="flex items-center gap-2 rounded-lg bg-[#F27A58] px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <Share2 size={16} />
                                            Share Selected
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

export default StudyRoomsPage;
