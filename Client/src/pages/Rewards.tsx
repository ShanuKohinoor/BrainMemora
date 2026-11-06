
import { useEffect, useState } from "react";
import {
    Trophy,
    Flame,
    BookOpen,
    Layers,
    ClipboardCheck,
    Target,
    Sparkles,
    Medal,
    CalendarDays,
    Award,
    Star
} from "lucide-react";

import { DashboardLayout } from "../components/DashboardLayout";
import { getRewards } from "../services/rewardService";

// Type of one earned reward
interface Reward {
    _id: string;
    title: string;
    description: string;
    type: "quiz" | "flashcard" | "learningSession" | "streak";
    points: number;
    achievementId: string;
    earnedAt: string;
}

// Data received from the backend
interface RewardData {
    totalPoints: number;
    currentLevel: string;
    currentStreak: number;
    bestStreak: number;
    rewards: Reward[];
}

// Level information
const levels = [
    { name: "Beginner", min: 0 },
    { name: "Bronze", min: 50 },
    { name: "Silver", min: 100 },
    { name: "Gold", min: 200 },
    { name: "Platinum", min: 500 },
    { name: "Diamond", min: 1000 }
];

// Streak milestones
const streakMilestones = [7, 14, 20];

// Achievement categories
const achievementTypes = [
    {
        type: "learningSession",
        title: "Learning Sessions",
        description: "Complete your learning sessions",
        icon: BookOpen
    },
    {
        type: "flashcard",
        title: "Flashcards",
        description: "Review your flashcards",
        icon: Layers
    },
    {
        type: "quiz",
        title: "Quizzes",
        description: "Complete your quizzes",
        icon: ClipboardCheck
    },
    {
        type: "streak",
        title: "Learning Streaks",
        description: "Stay consistent with learning",
        icon: Flame
    }
] as const;

export default function Rewards() {

    const [rewardData, setRewardData] = useState<RewardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch reward information when the page loads
    useEffect(() => {

        const fetchRewards = async () => {
            try {
                const data = await getRewards();
                setRewardData(data);
            } catch (error) {
                console.error("Error fetching rewards:", error);
                setError("Unable to load rewards. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchRewards();

    }, []);

    // Safely get the user's points
    const totalPoints = rewardData?.totalPoints ?? 0;

    // Find the current level
    const currentLevel = levels.find(
        level => level.name === rewardData?.currentLevel
    ) ?? levels[0];

    // Find the next level
    const nextLevel = levels.find(
        level => level.min > totalPoints
    );

    // Calculate progress towards the next level
    const levelProgress = nextLevel
        ? Math.min(
            100,
            Math.max(
                0,
                ((totalPoints - currentLevel.min) /
                    (nextLevel.min - currentLevel.min)) * 100
            )
        )
        : 100;

    // Get the current streak
    const currentStreak = rewardData?.currentStreak ?? 0;

    // Find the next streak milestone
    const nextStreakMilestone = streakMilestones.find(
        milestone => milestone > currentStreak
    );

    // Calculate streak progress
    const streakProgress = nextStreakMilestone
        ? Math.min(
            (currentStreak / nextStreakMilestone) * 100,
            100
        )
        : 100;

    // Get earned rewards safely
    const rewards = rewardData?.rewards ?? [];

    return (
        <DashboardLayout
            backLabel="Back to Library"
            backTo="/allLearningMaterials"
        >
            <div className="min-h-screen bg-[#FDF3EC] p-6">
                <div className="mx-auto max-w-6xl">

                    {/* Page Heading */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-[#F27A58]/10 p-3">
                                <Trophy
                                    size={28}
                                    className="text-[#F27A58]"
                                />
                            </div>

                            <div>
                                <h1 className="text-3xl font-bold text-[#2D4030]">
                                    Rewards & Achievements
                                </h1>

                                <p className="mt-1 text-gray-600">
                                    Celebrate your learning journey and every milestone you achieve.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                            <div className="mx-auto mb-3 w-fit animate-pulse">
                                <Trophy
                                    size={36}
                                    className="text-[#F27A58]"
                                />
                            </div>

                            <p className="text-gray-600">
                                Loading your rewards...
                            </p>
                        </div>
                    )}

                    {/* Error */}
                    {!loading && error && (
                        <div className="rounded-xl border border-red-100 bg-white p-8 text-center shadow-sm">
                            <p className="text-red-500">{error}</p>
                        </div>
                    )}

                    {/* Reward Information */}
                    {!loading && rewardData && (

                        <div className="space-y-8">

                            {/* Points and Level */}
                            <section className="overflow-hidden rounded-2xl bg-[#2D4030] p-7 text-white shadow-sm">

                                <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">

                                    <div>
                                        <div className="flex items-center gap-2 text-white/70">
                                            <Star size={18} />
                                            <p className="text-sm font-medium">
                                                Your Total Reward Points
                                            </p>
                                        </div>

                                        <h2 className="mt-3 text-5xl font-bold">
                                            {totalPoints}
                                        </h2>

                                        <p className="mt-2 text-sm text-white/70">
                                            Every small step brings you closer to your next achievement.
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-white/10 bg-white/10 p-6 md:min-w-52">
                                        <div className="flex items-center gap-2 text-white/70">
                                            <Medal size={18} />
                                            <p className="text-sm">
                                                Current Level
                                            </p>
                                        </div>

                                        <h3 className="mt-3 text-2xl font-bold text-[#F9A58C]">
                                            {rewardData.currentLevel}
                                        </h3>

                                        <p className="mt-2 text-xs text-white/70">
                                            {nextLevel
                                                ? `${nextLevel.min - totalPoints} points to ${nextLevel.name}`
                                                : "Highest level reached!"}
                                        </p>
                                    </div>

                                </div>

                                {/* Level Progress */}
                                <div className="mt-8">

                                    <div className="mb-3 flex justify-between text-sm">
                                        <span className="text-white/80">
                                            Level Progress
                                        </span>

                                        <span className="font-semibold">
                                            {Math.round(levelProgress)}%
                                        </span>
                                    </div>

                                    <div className="h-3 overflow-hidden rounded-full bg-white/20">
                                        <div
                                            className="h-full rounded-full bg-[#F27A58] transition-all duration-500"
                                            style={{
                                                width: `${levelProgress}%`
                                            }}
                                        />
                                    </div>

                                    <div className="mt-2 flex justify-between text-xs text-white/70">
                                        <span>{currentLevel.name}</span>
                                        <span>
                                            {nextLevel?.name ?? "Diamond"}
                                        </span>
                                    </div>

                                </div>

                            </section>

                            {/* Learning Streak */}
                            <section>

                                <div className="mb-4 flex items-center gap-2">
                                    <Flame
                                        size={23}
                                        className="text-[#F27A58]"
                                    />

                                    <h2 className="text-xl font-bold text-[#2D4030]">
                                        Your Learning Streak
                                    </h2>
                                </div>

                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                                    {/* Current Streak */}
                                    <div className="rounded-2xl bg-white p-6 shadow-sm">
                                        <div className="flex items-center justify-between">

                                            <div>
                                                <p className="text-sm text-gray-500">
                                                    Current Streak
                                                </p>

                                                <h3 className="mt-2 text-3xl font-bold text-[#F27A58]">
                                                    {rewardData.currentStreak} days
                                                </h3>
                                            </div>

                                            <div className="rounded-xl bg-[#F27A58]/10 p-4">
                                                <Flame
                                                    size={28}
                                                    className="text-[#F27A58]"
                                                />
                                            </div>

                                        </div>

                                        <p className="mt-3 text-sm text-gray-500">
                                            Keep your daily learning habit going!
                                        </p>
                                    </div>

                                    {/* Best Streak */}
                                    <div className="rounded-2xl bg-white p-6 shadow-sm">
                                        <div className="flex items-center justify-between">

                                            <div>
                                                <p className="text-sm text-gray-500">
                                                    Best Streak
                                                </p>

                                                <h3 className="mt-2 text-3xl font-bold text-[#2D4030]">
                                                    {rewardData.bestStreak} days
                                                </h3>
                                            </div>

                                            <div className="rounded-xl bg-[#A3B19B]/20 p-4">
                                                <Trophy
                                                    size={28}
                                                    className="text-[#2D4030]"
                                                />
                                            </div>

                                        </div>

                                        <p className="mt-3 text-sm text-gray-500">
                                            Your longest learning streak so far.
                                        </p>
                                    </div>

                                </div>

                                {/* Streak Milestones */}
                                <div className="mt-5 rounded-2xl bg-white p-6 shadow-sm">

                                    <h3 className="font-semibold text-[#2D4030]">
                                        Streak Milestones
                                    </h3>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Keep learning consistently to reach these milestones.
                                    </p>

                                    <div className="mt-6 grid grid-cols-3 gap-3">

                                        {streakMilestones.map(milestone => {

                                            const achieved =
                                                rewardData.bestStreak >= milestone;

                                            return (
                                                <div
                                                    key={milestone}
                                                    className={`rounded-xl border p-4 text-center ${
                                                        achieved
                                                            ? "border-[#A3B19B] bg-[#EDF2EA]"
                                                            : "border-gray-200 bg-gray-50"
                                                    }`}
                                                >
                                                    <div className="flex justify-center">
                                                        {achieved ? (
                                                            <Trophy
                                                                size={25}
                                                                className="text-[#2D4030]"
                                                            />
                                                        ) : (
                                                            <Target
                                                                size={25}
                                                                className="text-gray-400"
                                                            />
                                                        )}
                                                    </div>

                                                    <p className="mt-2 font-bold text-[#2D4030]">
                                                        {milestone} Days
                                                    </p>

                                                    <p className="mt-1 text-xs text-gray-500">
                                                        {achieved
                                                            ? "Achieved"
                                                            : "Not reached"}
                                                    </p>
                                                </div>
                                            );
                                        })}

                                    </div>

                                    {/* Progress to next milestone */}
                                    <div className="mt-6">

                                        <div className="mb-2 flex justify-between text-sm">
                                            <span className="text-gray-600">
                                                Progress to next milestone
                                            </span>

                                            <span className="font-semibold text-[#2D4030]">
                                                {nextStreakMilestone
                                                    ? `${currentStreak}/${nextStreakMilestone} days`
                                                    : "All milestones reached"}
                                            </span>
                                        </div>

                                        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                                            <div
                                                className="h-full rounded-full bg-[#F27A58] transition-all duration-500"
                                                style={{
                                                    width: `${streakProgress}%`
                                                }}
                                            />
                                        </div>

                                    </div>

                                </div>

                            </section>

                            {/* Achievement Milestones */}
                            <section>

                                <div className="mb-4 flex items-center gap-2">
                                    <Award
                                        size={23}
                                        className="text-[#F27A58]"
                                    />

                                    <h2 className="text-xl font-bold text-[#2D4030]">
                                        Achievement Milestones
                                    </h2>
                                </div>

                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                                    {achievementTypes.map(item => {

                                        const earnedRewards = rewards.filter(
                                            reward => reward.type === item.type
                                        );

                                        const Icon = item.icon;

                                        const pointsEarned = earnedRewards.reduce(
                                            (total, reward) => total + reward.points,
                                            0
                                        );

                                        return (
                                            <div
                                                key={item.type}
                                                className="rounded-2xl bg-white p-6 shadow-sm"
                                            >

                                                <div className="flex items-center gap-3">

                                                    <div className="rounded-xl bg-[#FDF3EC] p-3">
                                                        <Icon
                                                            size={25}
                                                            className="text-[#F27A58]"
                                                        />
                                                    </div>

                                                    <div>
                                                        <h3 className="font-semibold text-[#2D4030]">
                                                            {item.title}
                                                        </h3>

                                                        <p className="text-xs text-gray-500">
                                                            {item.description}
                                                        </p>
                                                    </div>

                                                </div>

                                                <div className="mt-5 flex items-end justify-between">

                                                    <div>
                                                        <p className="text-2xl font-bold text-[#2D4030]">
                                                            {earnedRewards.length}
                                                        </p>

                                                        <p className="text-sm text-gray-500">
                                                            Achievements earned
                                                        </p>
                                                    </div>

                                                    <p className="text-sm font-semibold text-[#F27A58]">
                                                        {pointsEarned} points
                                                    </p>

                                                </div>

                                            </div>
                                        );
                                    })}

                                </div>

                            </section>

                            {/* Reward History */}
                            <section>

                                <div className="mb-4 flex items-center gap-2">
                                    <CalendarDays
                                        size={23}
                                        className="text-[#F27A58]"
                                    />

                                    <h2 className="text-xl font-bold text-[#2D4030]">
                                        Reward History
                                    </h2>
                                </div>

                                <div className="overflow-hidden rounded-2xl bg-white shadow-sm">

                                    {rewards.length > 0 ? (

                                        <div className="divide-y divide-gray-100">

                                            {rewards.map(reward => {

                                                const Icon =
                                                    reward.type === "streak"
                                                        ? Flame
                                                        : reward.type === "quiz"
                                                            ? ClipboardCheck
                                                            : reward.type === "flashcard"
                                                                ? Layers
                                                                : BookOpen;

                                                return (
                                                    <div
                                                        key={reward._id}
                                                        className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center"
                                                    >

                                                        <div className="flex items-center gap-3">

                                                            <div className="rounded-full bg-[#FDF3EC] p-3">
                                                                <Icon
                                                                    size={22}
                                                                    className="text-[#F27A58]"
                                                                />
                                                            </div>

                                                            <div>
                                                                <h3 className="font-semibold text-[#2D4030]">
                                                                    {reward.title}
                                                                </h3>

                                                                <p className="mt-1 text-sm text-gray-500">
                                                                    {reward.description}
                                                                </p>

                                                                <p className="mt-1 text-xs text-gray-400">
                                                                    {new Date(
                                                                        reward.earnedAt
                                                                    ).toLocaleDateString()}
                                                                </p>
                                                            </div>

                                                        </div>

                                                        <p className="font-bold text-[#F27A58]">
                                                            +{reward.points} points
                                                        </p>

                                                    </div>
                                                );
                                            })}

                                        </div>

                                    ) : (

                                        <div className="p-10 text-center">

                                            <div className="mx-auto w-fit rounded-full bg-[#FDF3EC] p-4">
                                                <Sparkles
                                                    size={30}
                                                    className="text-[#F27A58]"
                                                />
                                            </div>

                                            <h3 className="mt-4 font-semibold text-[#2D4030]">
                                                No rewards yet
                                            </h3>

                                            <p className="mt-2 text-sm text-gray-500">
                                                Complete learning activities and reach milestones to earn rewards.
                                            </p>

                                        </div>

                                    )}

                                </div>

                            </section>

                        </div>
                    )}

                </div>
            </div>
        </DashboardLayout>
    );
}
