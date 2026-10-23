
import { useEffect, useRef, useState } from "react";
import {
    Plus,
    Mic,
    Pencil,
    Trash2,
    BookOpen,
    X,
    Pause,
    Play,
    Square,
    Save,
    RotateCcw,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "../app/hooks";
import { fetchNotes } from "../features/notes/noteSlice";

import {
    createNote,
    updateNote,
    deleteNote,
} from "../services/noteService";

import {
    createTeachBack,
    getAllTeachBacks,
} from "../services/teachBackService";

import type { Note } from "../types/note.types";
import { DashboardLayout } from "../components/DashboardLayout";

// A saved note has its database ID.
type SavedNote = Note & {
    _id: string;
};

// Information about a saved recording.
type TeachBackRecording = {
    _id: string;
    title?: string;
    topic: string;
    audioUrl: string;
    duration?: number;
    createdAt?: string;
};

export default function Notes() {
    const dispatch = useAppDispatch();

    const { notes, loading, error } = useAppSelector(
        (state) => state.notes
    );

    const savedNotes = notes as SavedNote[];

    // Note editor state.
    const [editorOpen, setEditorOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [title, setTitle] = useState("");
    const [topic, setTopic] = useState("");
    const [content, setContent] = useState("");
    const [message, setMessage] = useState("");
    const [saving, setSaving] = useState(false);

    // Note reading popup.
    const [viewNote, setViewNote] = useState<SavedNote | null>(null);

    // Saved recordings.
    const [teachBacks, setTeachBacks] = useState<TeachBackRecording[]>([]);

    // Recording popup state.
    const [recordingTitle, setRecordingTitle] = useState("");
    const [recordingTopic, setRecordingTopic] = useState("");
    const [recordingOpen, setRecordingOpen] = useState(false);
    const [recording, setRecording] = useState(false);
    const [paused, setPaused] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [elapsed, setElapsed] = useState(0);
    const [audioMessage, setAudioMessage] = useState("");

    // References for the recorder, microphone, and timer.
    const recorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<number | null>(null);
    const elapsedRef = useRef(0);

    // Load notes and recordings when the page opens.
    useEffect(() => {
        dispatch(fetchNotes());
        loadTeachBacks();
    }, [dispatch]);

    // Stop the microphone and timer when leaving the page.
    useEffect(() => {
        return () => {
            if (
                recorderRef.current?.state === "recording" ||
                recorderRef.current?.state === "paused"
            ) {
                recorderRef.current.stop();
            }

            streamRef.current?.getTracks().forEach((track) => track.stop());

            if (timerRef.current !== null) {
                window.clearInterval(timerRef.current);
            }
        };
    }, []);

    // Fetch saved recordings.
    async function loadTeachBacks() {
        try {
            const data = await getAllTeachBacks();
            setTeachBacks(data);
        } catch {
            setAudioMessage("Unable to load saved recordings.");
        }
    }

    // Compare text without considering capital letters or extra spaces.
    const sameText = (first?: string, second?: string) =>
        (first ?? "").trim().toLowerCase() ===
        (second ?? "").trim().toLowerCase();

    // Get all topics from notes and recordings.
    const topicNames = Array.from(
        new Set(
            [
                ...savedNotes.map((note) => note.topic?.trim()),
                ...teachBacks.map((item) => item.topic?.trim()),
            ].filter((item): item is string => Boolean(item))
        )
    ).sort((a, b) => a.localeCompare(b));

    // Get notes for one topic.
    const getTopicNotes = (topicName: string) =>
        savedNotes.filter((note) => sameText(note.topic, topicName));

    // Get recordings for one topic.
    const getTopicRecordings = (topicName: string) =>
        teachBacks.filter((item) => sameText(item.topic, topicName));

    // Find recordings linked to a particular note title.
    const getTitleRecordings = (
        topicName: string,
        noteTitle: string
    ) =>
        getTopicRecordings(topicName).filter((item) =>
            sameText(item.title, noteTitle)
        );

    // Find recordings that are not linked to a note.
    const getGeneralRecordings = (topicName: string) => {
        const topicNotes = getTopicNotes(topicName);

        return getTopicRecordings(topicName).filter((item) => {
            return !topicNotes.some(
                (note) =>
                    item.title?.trim() &&
                    sameText(note.title, item.title)
            );
        });
    };

    // Open the recording popup.
    const openRecording = (topicName: string, noteTitle = "") => {
        if (recording || paused || uploading) return;

        if (audioUrl) URL.revokeObjectURL(audioUrl);

        setAudioUrl(null);
        setAudioBlob(null);
        setElapsed(0);
        elapsedRef.current = 0;

        setRecordingTopic(topicName);
        setRecordingTitle(noteTitle);
        setAudioMessage("");
        setViewNote(null);
        setRecordingOpen(true);
    };

    // Open a saved note for editing.
    const selectNote = (note: SavedNote) => {
        setSelectedId(note._id);
        setTitle(note.title);
        setTopic(note.topic);
        setContent(note.content);
        setMessage("");
        setViewNote(null);
        setEditorOpen(true);
    };

    // Open a blank note editor.
    const startNewNote = (topicName = "") => {
        setSelectedId(null);
        setTitle("");
        setTopic(topicName);
        setContent("");
        setMessage("");
        setViewNote(null);
        setEditorOpen(true);
    };

    // Close and reset the note editor.
    const closeEditor = () => {
        setEditorOpen(false);
        setSelectedId(null);
        setTitle("");
        setTopic("");
        setContent("");
        setMessage("");
    };

    // Create a new note or update an existing one.
    const handleSaveNote = async () => {
        if (!title.trim() || !topic.trim() || !content.trim()) {
            setMessage("Please complete the title, topic and note.");
            return;
        }

        setSaving(true);
        setMessage("");

        try {
            if (selectedId) {
                await updateNote(selectedId, {
                    title: title.trim(),
                    topic: topic.trim(),
                    content,
                });
            } else {
                await createNote({
                    userId: "",
                    title: title.trim(),
                    topic: topic.trim(),
                    content,
                    isPinned: false,
                } as Note);
            }

            await dispatch(fetchNotes()).unwrap();
            closeEditor();
        } catch {
            setMessage("Unable to save your note. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    // Delete the note being edited.
    const handleDeleteNote = async () => {
        if (!selectedId) return;

        if (!window.confirm("Are you sure you want to delete this note?")) {
            return;
        }

        try {
            await deleteNote(selectedId);
            await dispatch(fetchNotes()).unwrap();
            closeEditor();
        } catch {
            setMessage("Unable to delete your note.");
        }
    };

    // Start the recording timer.
    const startTimer = () => {
        if (timerRef.current !== null) {
            window.clearInterval(timerRef.current);
        }

        timerRef.current = window.setInterval(() => {
            elapsedRef.current += 1;
            setElapsed(elapsedRef.current);
        }, 1000);
    };

    // Start recording audio.
    const startRecording = async () => {
        if (!recordingTopic.trim()) {
            setAudioMessage("Please enter a topic for your recording.");
            return;
        }

        try {
            if (
                !navigator.mediaDevices?.getUserMedia ||
                typeof MediaRecorder === "undefined"
            ) {
                setAudioMessage(
                    "Audio recording is not supported in this browser."
                );
                return;
            }

            setAudioMessage("");

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });

            streamRef.current = stream;
            chunksRef.current = [];

            const options = MediaRecorder.isTypeSupported("audio/webm")
                ? { mimeType: "audio/webm" }
                : {};

            const recorder = new MediaRecorder(stream, options);
            recorderRef.current = recorder;

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, {
                    type: recorder.mimeType || "audio/webm",
                });

                const url = URL.createObjectURL(blob);

                setAudioUrl((previous) => {
                    if (previous) URL.revokeObjectURL(previous);
                    return url;
                });

                setAudioBlob(blob);

                stream.getTracks().forEach((track) => track.stop());
                streamRef.current = null;
            };

            elapsedRef.current = 0;
            setElapsed(0);

            recorder.start();
            setRecording(true);
            setPaused(false);
            startTimer();
        } catch {
            setAudioMessage(
                "Please allow microphone access to record your voice."
            );
        }
    };

    // Pause the recording.
    const pauseRecording = () => {
        if (recorderRef.current?.state === "recording") {
            recorderRef.current.pause();
            setPaused(true);

            if (timerRef.current !== null) {
                window.clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    };

    // Resume the recording.
    const resumeRecording = () => {
        if (recorderRef.current?.state === "paused") {
            recorderRef.current.resume();
            setPaused(false);
            startTimer();
        }
    };

    // Stop recording and prepare the preview.
    const stopRecording = () => {
        if (
            recorderRef.current?.state === "recording" ||
            recorderRef.current?.state === "paused"
        ) {
            recorderRef.current.stop();
        }

        setRecording(false);
        setPaused(false);

        if (timerRef.current !== null) {
            window.clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    // Save the recording to the backend.
    const handleSaveRecording = async () => {
        if (!audioBlob) {
            setAudioMessage("Please record your voice first.");
            return;
        }

        if (!recordingTopic.trim()) {
            setAudioMessage("Please enter a topic.");
            return;
        }

        setUploading(true);
        setAudioMessage("");

        try {
            const formData = new FormData();

            const file = new File(
                [audioBlob],
                `brainmemora-teachback-${Date.now()}.webm`,
                { type: audioBlob.type || "audio/webm" }
            );

            formData.append("file", file);
            formData.append("topic", recordingTopic.trim());
            formData.append("duration", String(elapsed));

            // Link the recording to its note when a title is provided.
            if (recordingTitle.trim()) {
                formData.append("title", recordingTitle.trim());
            }

            await createTeachBack(formData);
            await loadTeachBacks();

            if (audioUrl) URL.revokeObjectURL(audioUrl);

            setAudioUrl(null);
            setAudioBlob(null);
            setElapsed(0);
            elapsedRef.current = 0;

            setAudioMessage("Recording saved successfully.");
        } catch {
            setAudioMessage("Unable to save recording. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    // Discard the unsaved recording preview.
    const discardRecording = () => {
        if (audioUrl) URL.revokeObjectURL(audioUrl);

        setAudioUrl(null);
        setAudioBlob(null);
        setElapsed(0);
        elapsedRef.current = 0;
        setAudioMessage("");
    };

    // Format seconds as minutes and seconds.
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60)
            .toString()
            .padStart(2, "0");

        const remainingSeconds = (seconds % 60)
            .toString()
            .padStart(2, "0");

        return `${minutes}:${remainingSeconds}`;
    };

    // Close the recording popup when it is safe to do so.
    const closeRecording = () => {
        if (recording || paused || uploading) return;

        if (audioUrl) URL.revokeObjectURL(audioUrl);

        setAudioUrl(null);
        setAudioBlob(null);
        setAudioMessage("");
        setRecordingOpen(false);
    };

    return (
        <DashboardLayout backLabel="Back to MyLibrary" backTo="/allLearningMaterials">
            <main className="min-h-screen bg-[#FDF3EC] px-4 py-6 text-[#4A3028] sm:px-6 lg:px-8">
                {/* Page heading */}
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="mb-1 text-sm font-medium text-[#C45F43]">
                            LEARN · ORGANIZE · REMEMBER
                        </p>

                        <h1 className="text-3xl font-bold sm:text-4xl">
                            My Own Notes
                        </h1>
                    </div>

                    <button
                        onClick={() => startNewNote()}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#F27A58] px-5 py-3 font-semibold text-white hover:bg-[#DE6848]"
                    >
                        <Plus size={18} />
                        Add Note
                    </button>
                </div>

                {/* Note editor */}
                {editorOpen && (
                    <section className="mb-6 rounded-2xl border border-[#EBD8CC] bg-white p-5 shadow-sm">
                        <h2 className="mb-5 text-xl font-bold">
                            {selectedId ? "Edit Note" : "Create a Note"}
                        </h2>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                        <div>
                                <label className="mb-2 block text-sm font-semibold">
                                    Note topic
                                </label>

                                <input
                                    value={topic}
                                    onChange={(event) =>
                                        setTopic(event.target.value)
                                    }
                                    placeholder="e.g. React"
                                    list="saved-topic-options"
                                    className="w-full rounded-xl border border-[#E8D7CB] bg-[#FFFCFA] px-4 py-3 outline-none focus:border-[#F27A58]"
                                />

                                <datalist id="saved-topic-options">
                                    {topicNames.map((topicName) => (
                                        <option
                                            key={topicName}
                                            value={topicName}
                                        />
                                    ))}
                                </datalist>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold">
                                    Note title
                                </label>

                                <input
                                    value={title}
                                    onChange={(event) =>
                                        setTitle(event.target.value)
                                    }
                                    placeholder="e.g. useState"
                                    className="w-full rounded-xl border border-[#E8D7CB] bg-[#FFFCFA] px-4 py-3 outline-none focus:border-[#F27A58]"
                                />
                            </div>

                        </div>

                        <div className="mt-4">
                            <label className="mb-2 block text-sm font-semibold">
                                Your notes
                            </label>

                            <textarea
                                value={content}
                                onChange={(event) =>
                                    setContent(event.target.value)
                                }
                                placeholder="Write what you have learned..."
                                rows={8}
                                className="w-full resize-y rounded-xl border border-[#E8D7CB] bg-[#FFFCFA] px-4 py-3 leading-6 outline-none focus:border-[#F27A58]"
                            />
                        </div>

                        {message && (
                            <p
                                role="status"
                                className="mt-3 text-sm text-[#A44332]"
                            >
                                {message}
                            </p>
                        )}

                        <div className="mt-5 flex flex-wrap gap-3">
                            <button
                                onClick={handleSaveNote}
                                disabled={saving}
                                className="rounded-xl bg-[#F27A58] px-5 py-3 text-sm font-semibold text-white hover:bg-[#DE6848] disabled:opacity-60"
                            >
                                {saving
                                    ? "Saving..."
                                    : selectedId
                                      ? "Save Changes"
                                      : "Save Note"}
                            </button>

                            {selectedId && (
                                <button
                                    onClick={handleDeleteNote}
                                    className="inline-flex items-center gap-2 rounded-xl border border-[#E8B8AE] px-5 py-3 text-sm font-semibold text-[#A44332] hover:bg-[#FCEBE7]"
                                >
                                    <Trash2 size={16} />
                                    Delete Note
                                </button>
                            )}

                            <button
                                onClick={closeEditor}
                                className="rounded-xl border border-[#E8D7CB] px-5 py-3 text-sm font-semibold text-[#80665C] hover:bg-[#FCF7F3]"
                            >
                                Cancel
                            </button>
                        </div>
                    </section>
                )}

                {/* Topics and their notes */}
                <section>

                    {loading && (
                        <p className="mb-4 rounded-xl bg-white p-4 text-sm">
                            Loading notes...
                        </p>
                    )}

                    {!loading && error && (
                        <p
                            role="alert"
                            className="mb-4 rounded-xl bg-[#FCE4E1] p-4 text-sm text-[#9B3F35]"
                        >
                            Unable to load your notes. Please try again.
                        </p>
                    )}

                    {!loading && topicNames.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-[#E8C9B9] bg-white p-8 text-center">
                            <p className="font-semibold">No topics yet</p>

                            <p className="mt-2 text-sm text-[#80665C]">
                                Create a note to start organizing your learning.
                            </p>

                            <button
                                onClick={() => startNewNote()}
                                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#F27A58] px-5 py-3 font-semibold text-white hover:bg-[#DE6848]"
                            >
                                <Plus size={18} />
                                Add Note
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                        {topicNames.map((topicName) => {
                            const topicNotes = getTopicNotes(topicName);
                            const generalRecordings =
                                getGeneralRecordings(topicName);
                            const topicRecordings =
                                getTopicRecordings(topicName);

                            return (
                                <article
                                    key={topicName}
                                    className="overflow-hidden rounded-2xl border border-[#EBD8CC] bg-white shadow-sm transition-shadow hover:shadow-md"
                                >
                                    {/* Topic heading */}
                                    <div className="border-b border-[#F0DDD1] bg-gradient-to-r from-[#F9E8DE] to-[#FFF5ED] px-5 py-4">
                                        <h3 className="break-words text-xl font-bold text-[#603D31]">
                                            {topicName}
                                        </h3>

                                        <p className="mt-1 text-sm text-[#80665C]">
                                            {topicNotes.length}{" "}
                                            {topicNotes.length === 1
                                                ? "note"
                                                : "notes"}
                                            {" · "}
                                            {topicRecordings.length}{" "}
                                            {topicRecordings.length === 1
                                                ? "recording"
                                                : "recordings"}
                                        </p>
                                    </div>

                                    <div className="space-y-5 p-5">
                                        {/* Notes belonging to this topic */}
                                        <section>

                                            {topicNotes.length === 0 && (
                                                <p className="rounded-lg bg-[#FCF7F3] p-3 text-sm text-[#92796E]">
                                                    No notes yet.
                                                </p>
                                            )}

                                            <div className="space-y-4">
                                                {topicNotes.map((note) => {
                                                    const matchingRecordings =
                                                        getTitleRecordings(
                                                            topicName,
                                                            note.title
                                                        );

                                                    return (
                                                        <div
                                                            key={note._id}
                                                            className="rounded-xl border border-[#F0E2D9] bg-[#FCF8F5] p-4"
                                                        >
                                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                                <button
                                                                    onClick={() =>
                                                                        setViewNote(note)
                                                                    }
                                                                    className="break-words text-left text-lg font-semibold text-[#603D31] hover:text-[#C45F43]"
                                                                >
                                                                    {note.title}
                                                                </button>

                                                                <button
                                                                    onClick={() =>
                                                                        selectNote(note)
                                                                    }
                                                                    className="inline-flex items-center gap-1 text-sm font-semibold text-[#C45F43] hover:text-[#943E2B]"
                                                                >
                                                                    <Pencil size={15} />
                                                                    Edit
                                                                </button>
                                                            </div>

                                                            {/* Show only two lines of note content */}
                                                            <p className="mt-2 line-clamp-2 whitespace-pre-wrap break-words text-sm leading-6 text-[#6B625B]">
                                                                {note.content}
                                                            </p>

                                                            {/* Open the full note to read */}
                                                            <button
                                                                type="button"
                                                                onClick={() => setViewNote(note)}
                                                                className="mt-2 text-sm font-semibold text-[#F27A58] hover:underline"
                                                            >
                                                                Read more
                                                            </button>
                                                            {/* Recordings linked to this note */}
                                                            {matchingRecordings.length > 0 && (
                                                                <div className="mt-4 space-y-3 border-t border-[#F0E2D9] pt-4">
                                                                    <p className="inline-flex items-center gap-2 text-sm font-semibold text-[#94513C]">
                                                                        <Mic size={16} />
                                                                        Teach Back
                                                                    </p>

                                                                    {matchingRecordings.map((item) => (
                                                                        <audio
                                                                            key={item._id}
                                                                            controls
                                                                            preload="none"
                                                                            src={item.audioUrl}
                                                                            className="w-full"
                                                                        />
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            <button
                                                onClick={() =>
                                                    startNewNote(topicName)
                                                }
                                                className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#C45F43] hover:text-[#943E2B]"
                                            >
                                                <Plus size={16} />
                                                Add Note
                                            </button>
                                        </section>

                                        {/* Topic summary recordings */}
                                        <section className="border-t border-[#F0DDD1] pt-4">
                                            {generalRecordings.length > 0 && (
                                                <div className="space-y-3">
                                                    <h4 className="font-bold text-[#94513C]">
                                                        Topic Summary
                                                    </h4>

                                                    {generalRecordings.map((item) => (
                                                        <div
                                                            key={item._id}
                                                            className="rounded-xl border border-[#F0E2D9] bg-[#FCF8F5] p-3"
                                                        >
                                                            <div className="mb-2 flex items-center justify-between gap-3">
                                                                <p className="break-words font-semibold text-[#603D31]">
                                                                    {item.title?.trim() || "Topic Summary"}
                                                                </p>

                                                                {item.duration !== undefined && (
                                                                    <span className="shrink-0 text-xs text-[#92796E]">
                                                                        {formatTime(item.duration)}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <audio
                                                                controls
                                                                preload="none"
                                                                src={item.audioUrl}
                                                                className="w-full"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <button
                                                onClick={() =>
                                                    openRecording(topicName, "Topic Summary")
                                                }
                                                className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#C45F43] hover:text-[#943E2B]"
                                            >
                                                <Mic size={16} />
                                                Record Topic Summary
                                            </button>
                                        </section>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </section>

                {/* Read a saved note */}
                {viewNote && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-[#35251F]/60 p-3 backdrop-blur-sm sm:p-6"
                        onClick={() => setViewNote(null)}
                    >
                        <section
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="reading-note-title"
                            onClick={(event) => event.stopPropagation()}
                            className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[#EBD8CC] bg-[#FFFCF8] shadow-2xl sm:rounded-3xl"
                        >
                            {/* Simple reading header */}
                            <header className="flex items-start justify-between gap-4 border-b border-[#EBD8CC] px-5 py-5 sm:px-8 sm:py-6">
                                <div className="min-w-0">
                                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#F9E8DE] px-3 py-1.5 text-sm font-medium text-[#94513C]">
                                        <BookOpen size={16} />
                                        {viewNote.topic}
                                    </div>

                                    <h2
                                        id="reading-note-title"
                                        className="break-words text-xl font-bold leading-tight text-[#603D31] sm:text-3xl"
                                    >
                                        {viewNote.title}
                                    </h2>

                                </div>

                                {/* One close option */}
                                <button
                                    onClick={() => setViewNote(null)}
                                    aria-label="Close note"
                                    title="Close note"
                                    className="shrink-0 rounded-full p-2 text-[#80665C] transition hover:bg-[#F5E7DE] hover:text-[#603D31]"
                                >
                                    <X size={22} />
                                </button>
                            </header>

                            {/* Comfortable reading area */}
                            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-8 sm:py-8">
                                <article className="mx-auto max-w-3xl">
                                    <div className="whitespace-pre-wrap break-words text-base leading-8 text-[#4A3028] sm:text-lg sm:leading-9">
                                        {viewNote.content}
                                    </div>
                                </article>
                            </div>

                            {/* Keep useful actions together */}
                            <footer className="flex flex-wrap gap-3 border-t border-[#EBD8CC] bg-[#FFFCF8] px-5 py-4 sm:px-8">
                                <button
                                    onClick={() =>
                                        openRecording(
                                            viewNote.topic,
                                            viewNote.title
                                        )
                                    }
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F27A58] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#DE6848]"
                                >
                                    <Mic size={17} />
                                    Record Teach Back
                                </button>

                                <button
                                    onClick={() => selectNote(viewNote)}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E8D7CB] px-4 py-3 text-sm font-semibold text-[#80665C] transition hover:bg-[#FCF7F3]"
                                >
                                    <Pencil size={16} />
                                    Edit Note
                                </button>
                            </footer>
                        </section>
                    </div>
                )}

                {/* Record a Teach Back */}
                {recordingOpen && (
                    <div
                        className="fixed inset-0 z-[60] flex items-center justify-center bg-[#35251F]/60 p-3 backdrop-blur-sm sm:p-6"
                        onClick={closeRecording}
                    >
                        <section
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="recording-title"
                            onClick={(event) => event.stopPropagation()}
                            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#EBD8CC] bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-7"
                        >
                            {/* Recording popup heading */}
                            <header className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-[#C45F43]">
                                        <Mic size={16} />
                                        Teach Back
                                    </p>

                                    <h2
                                        id="recording-title"
                                        className="mt-2 text-2xl font-bold text-[#603D31]"
                                    >
                                        Record what you learned
                                    </h2>

                                    <p className="mt-2 text-sm leading-6 text-[#80665C]">
                                        Explain the concept in your own words.
                                    </p>
                                </div>

                                {/* One close option */}
                                <button
                                    onClick={closeRecording}
                                    disabled={recording || paused || uploading}
                                    aria-label="Close recording"
                                    title={
                                        recording || paused || uploading
                                            ? "Stop or save your recording before closing"
                                            : "Close recording"
                                    }
                                    className="shrink-0 rounded-full p-2 text-[#80665C] transition hover:bg-[#FCF4EF] disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <X size={22} />
                                </button>
                            </header>

                            {/* Topic and recording title */}
                            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold">
                                        Main topic
                                    </label>

                                    <input
                                        value={recordingTopic}
                                        onChange={(event) =>
                                            setRecordingTopic(event.target.value)
                                        }
                                        placeholder="e.g. React"
                                        list="recording-topic-options"
                                        disabled={recording || paused || uploading}
                                        className="w-full rounded-xl border border-[#E8D7CB] bg-[#FFFCFA] px-4 py-3 outline-none focus:border-[#F27A58] disabled:opacity-60"
                                    />

                                    <datalist id="recording-topic-options">
                                        {topicNames.map((topicName) => (
                                            <option
                                                key={topicName}
                                                value={topicName}
                                            />
                                        ))}
                                    </datalist>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold">
                                        Recording title (optional)
                                    </label>

                                    <input
                                        value={recordingTitle}
                                        onChange={(event) =>
                                            setRecordingTitle(event.target.value)
                                        }
                                        placeholder="e.g. useState"
                                        disabled={recording || paused || uploading}
                                        className="w-full rounded-xl border border-[#E8D7CB] bg-[#FFFCFA] px-4 py-3 outline-none focus:border-[#F27A58] disabled:opacity-60"
                                    />
                                </div>
                            </div>

                            {/* Recording timer and controls */}
                            <div className="mt-5 rounded-2xl bg-[#FCF4EF] p-5">
                                <p className="text-sm text-[#80665C]">
                                    Duration
                                </p>

                                <p className="mt-1 font-mono text-4xl font-bold text-[#603D31]">
                                    {formatTime(elapsed)}
                                </p>

                                <div className="mt-4 flex flex-wrap gap-3">
                                    {!recording && !paused && !audioBlob && (
                                        <button
                                            onClick={startRecording}
                                            disabled={uploading}
                                            className="inline-flex items-center gap-2 rounded-xl bg-[#F27A58] px-5 py-3 text-sm font-semibold text-white hover:bg-[#DE6848] disabled:opacity-60"
                                        >
                                            <Mic size={17} />
                                            Start Recording
                                        </button>
                                    )}

                                    {recording && !paused && (
                                        <>
                                            <button
                                                onClick={pauseRecording}
                                                className="inline-flex items-center gap-2 rounded-xl border border-[#E8B8A8] bg-white px-5 py-3 text-sm font-semibold text-[#94513C]"
                                            >
                                                <Pause size={16} />
                                                Pause
                                            </button>

                                            <button
                                                onClick={stopRecording}
                                                className="inline-flex items-center gap-2 rounded-xl bg-[#A44332] px-5 py-3 text-sm font-semibold text-white"
                                            >
                                                <Square size={15} />
                                                Stop Recording
                                            </button>
                                        </>
                                    )}

                                    {recording && paused && (
                                        <>
                                            <button
                                                onClick={resumeRecording}
                                                className="inline-flex items-center gap-2 rounded-xl bg-[#F27A58] px-5 py-3 text-sm font-semibold text-white"
                                            >
                                                <Play size={16} />
                                                Resume
                                            </button>

                                            <button
                                                onClick={stopRecording}
                                                className="inline-flex items-center gap-2 rounded-xl bg-[#A44332] px-5 py-3 text-sm font-semibold text-white"
                                            >
                                                <Square size={15} />
                                                Stop Recording
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Preview, save, or discard the recording */}
                            {audioUrl && audioBlob && (
                                <div className="mt-5 rounded-xl border border-[#F0E2D9] bg-[#FCF8F5] p-4">
                                    <h3 className="mb-3 font-semibold text-[#603D31]">
                                        Preview recording
                                    </h3>

                                    <audio
                                        controls
                                        src={audioUrl}
                                        className="w-full"
                                    />

                                    <div className="mt-4 flex flex-wrap gap-3">
                                        <button
                                            onClick={handleSaveRecording}
                                            disabled={uploading}
                                            className="inline-flex items-center gap-2 rounded-xl bg-[#F27A58] px-5 py-3 text-sm font-semibold text-white hover:bg-[#DE6848] disabled:opacity-60"
                                        >
                                            <Save size={16} />
                                            {uploading ? "Saving..." : "Save Recording"}
                                        </button>

                                        <button
                                            onClick={discardRecording}
                                            disabled={uploading}
                                            className="inline-flex items-center gap-2 rounded-xl border border-[#E8D7CB] px-5 py-3 text-sm font-semibold text-[#80665C] disabled:opacity-60"
                                        >
                                            <RotateCcw size={16} />
                                            Discard
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Recording success and error messages */}
                            {audioMessage && (
                                <p
                                    role="status"
                                    className={`mt-4 rounded-xl p-3 text-sm ${
                                        audioMessage.includes("successfully")
                                            ? "bg-[#F9E8DE] text-[#754A38]"
                                            : "bg-[#FCEBE7] text-[#A44332]"
                                    }`}
                                >
                                    {audioMessage}
                                </p>
                            )}
                        </section>
                    </div>
                )}
            </main>
        </DashboardLayout>
    );
}
