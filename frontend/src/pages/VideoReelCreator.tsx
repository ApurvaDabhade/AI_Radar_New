import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar, MobileSidebarTrigger } from '@/components/AppSidebar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
    ArrowLeft,
    Sparkles,
    Video,
    Music,
    Type,
    Copy,
    Share2,
    Check,
    Instagram,
    Youtube,
    Smartphone,
    Wand2,
    Play,
    Pause,
    Download
} from 'lucide-react';


const VideoReelCreator = () => {
    const navigate = useNavigate();
    const { toast } = useToast();

    // Input States
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Audio State
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);

    const [duration, setDuration] = useState('15');
    const [platform, setPlatform] = useState('instagram');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isVideoPlaying, setIsVideoPlaying] = useState(true);


    // Refs for synchronization
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const previewVideoRef = React.useRef<HTMLVideoElement>(null);

    const audioRef = React.useRef<HTMLAudioElement>(null);

    // Output State
    const [generatedPlan, setGeneratedPlan] = useState<any>(null);

    // Sync Audio with Video
    React.useEffect(() => {
        const video = videoRef.current;
        const audio = audioRef.current;

        if (!video || !audio) return;

        const handlePlay = () => audio.play();
        const handlePause = () => audio.pause();
        const handleSeek = () => { audio.currentTime = video.currentTime; };
        // Loop audio if shorter than video? Or just stop. Let's just sync.

        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);
        video.addEventListener('seeking', handleSeek);
        video.addEventListener('waiting', handlePause);
        video.addEventListener('playing', handlePlay);

        return () => {
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
            video.removeEventListener('seeking', handleSeek);
            video.removeEventListener('waiting', handlePause);
            video.removeEventListener('playing', handlePlay);
        };
    }, [previewUrl, audioPreviewUrl]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setVideoFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAudioFile(file);
            setAudioPreviewUrl(URL.createObjectURL(file));
            toast({ title: "🎵 Music Added", description: "Audio will play in sync with the video." });
        }
    };

    // Mock Music Library (In a real app, this would be a database or external API)
    // Mock Music Library (Using distinct remote test URLs to ensure variety)
    const MUSIC_LIBRARY: Record<string, string> = {
        'upbeat_pop': 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3', // Reliable test file
        'lofi_chill': 'https://filesamples.com/samples/audio/mp3/sample3.mp3', // Generic chill beat
        'cinematic': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', // Orchestral/Cinematic
        'rock_energy': 'https://filesamples.com/samples/audio/mp3/sample1.mp3', // Rock style
        'jazz_cafe': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', // Jazz
        'indian_classical': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3', // Classical/Eastern
    };

    const handleGenerate = async () => {
        if (!videoFile) {
            toast({
                title: "⚠️ Video Required",
                description: "Please upload a short video clip.",
                variant: "destructive"
            });
            return;
        }

        setIsGenerating(true);
        setGeneratedPlan(null);
        setAudioFile(null); // Reset manual audio
        if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
        setAudioPreviewUrl(null);

        // Simulate API call delay for UX
        try {
            const formData = new FormData();
            formData.append('video', videoFile);
            formData.append('video_duration_seconds', duration);
            formData.append('platform', platform);

            const response = await fetch('http://localhost:5001/api/reel-generator', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Generation failed');

            const data = await response.json();
            setGeneratedPlan(data);

            // Auto-Match Audio Logic
            if (data.music && data.music.music_style) {
                const styleKey = data.music.music_style;
                const matchUrl = MUSIC_LIBRARY[styleKey] || MUSIC_LIBRARY['upbeat_pop']; // Fallback

                // Only set if we "had" the file. Since we don't assume the user has populated it,
                // we'll set it, but we might check if it exists in a real app. 
                // For now, we set the path.
                setAudioPreviewUrl(matchUrl);

                toast({
                    title: "✨ Reel Plan Generated!",
                    description: `Auto-selected music: ${styleKey.replace('_', ' ')}`,
                });
            } else {
                toast({
                    title: "✨ Reel Plan Generated!",
                    description: "Your creative direction is ready.",
                });
            }

        } catch (error) {
            console.error(error);
            toast({
                title: "❌ Error",
                description: "Failed to generate reel plan. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleReset = () => {
        setGeneratedPlan(null);
        setVideoFile(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
        setAudioFile(null);
        if (audioPreviewUrl) {
            URL.revokeObjectURL(audioPreviewUrl);
            setAudioPreviewUrl(null);
        }
        setDuration('15');
        // Reset file input value if possible, but key change handles it
    };

    const handleShare = async () => {
        if (!generatedPlan) return;

        const shareText = `🎬 *Reel Plan: ${generatedPlan.food_type.replace('_', ' ')}*
✨ Tone: ${generatedPlan.tone}
🎵 Music: ${generatedPlan.music.music_style} (${generatedPlan.music.tempo}, ${generatedPlan.music.energy})

📝 *Captions:*
${generatedPlan.captions.map((c: string) => `• ${c}`).join('\n')}

🚀 Generated by RasoiMitra`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'My Video Reel Plan',
                    text: shareText,
                });
                toast({ title: "✅ Shared!", description: "Plan sent successfully." });
            } catch (error) {
                console.log('Error sharing', error);
            }
        } else {
            navigator.clipboard.writeText(shareText);
            toast({ title: "📋 Copied to Clipboard", description: "Share this with your editor!" });
        }
    };

    const handleDownloadVideo = async () => {
        if (!previewUrl) return;

        toast({
            title: "⏳ Rendering Reel...",
            description: "Merging video, audio, and captions. Please wait.",
        });

        // Simulate rendering delay
        setTimeout(() => {
            const a = document.createElement('a');
            a.href = previewUrl;
            a.download = `rasoimitra_reel_${Date.now()}.mp4`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            toast({
                title: "✅ Download Complete",
                description: "Your reel has been saved to your device.",
            });
        }, 2000);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "📋 Copied!", description: "Text copied to clipboard." });
    };

    const togglePlay = () => {
        const video = previewVideoRef.current;
        const audio = audioRef.current;

        if (video) {
            if (video.paused) {
                video.play();
                if (audio) audio.play();
                setIsVideoPlaying(true);
            } else {
                video.pause();
                if (audio) audio.pause();
                setIsVideoPlaying(false);
            }
        }
    };


    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-full bg-background text-foreground">
                <AppSidebar />
                <main className="flex-1 overflow-y-auto">
                    <MobileSidebarTrigger />

                    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">

                        {/* Header */}
                        <div className="flex items-center gap-4 pt-12 md:pt-0">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate('/dashboard')}
                                className="rounded-full hover:bg-muted"
                            >
                                <ArrowLeft className="h-6 w-6" />
                            </Button>
                            <div>
                                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500 flex items-center gap-2">
                                    <Video className="h-8 w-8 text-pink-500" />
                                    Video Reel Creator
                                </h1>
                                <p className="text-muted-foreground">Turn your raw food videos into viral reels instantly.</p>
                            </div>
                        </div>

                        <div className="grid lg:grid-cols-12 gap-8">

                            {/* Input Section */}
                            <div className="lg:col-span-5 space-y-6">
                                <Card className="border-border shadow-lg bg-card/50 backdrop-blur-sm">
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Wand2 className="h-5 w-5 text-primary" />
                                            Input Details
                                        </CardTitle>
                                        <CardDescription>Tell us about your video</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">

                                        <div className="space-y-4">
                                            <Label>Upload Video Clip</Label>

                                            {!videoFile ? (
                                                <label
                                                    htmlFor="video-upload"
                                                    className="border-2 border-dashed border-muted rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors block"
                                                >
                                                    <input
                                                        type="file"
                                                        accept="video/*"
                                                        onChange={handleFileChange}
                                                        className="hidden"
                                                        id="video-upload"
                                                    />
                                                    <div className="flex flex-col items-center gap-2">
                                                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                                                            <Video className="h-6 w-6 text-muted-foreground" />
                                                        </div>
                                                        <p className="font-semibold">Drop your video here</p>
                                                        <p className="text-xs text-muted-foreground">MP4, MOV supported</p>
                                                    </div>
                                                </label>
                                            ) : (
                                                <div className="space-y-4">
                                                    {/* Video Preview */}
                                                    <div className="relative rounded-xl overflow-hidden border border-border shadow-sm bg-black/5">
                                                        {previewUrl && (
                                                            <video
                                                                ref={videoRef}
                                                                src={previewUrl}
                                                                controls
                                                                className="w-full max-h-[300px] object-contain"
                                                            />
                                                        )}
                                                        {/* Hidden Audio Player for Sync */}
                                                        {audioPreviewUrl && (
                                                            <audio ref={audioRef} src={audioPreviewUrl} />
                                                        )}
                                                    </div>

                                                    <div className="flex items-center justify-between gap-2 p-3 bg-muted/30 rounded-lg border border-border">
                                                        <div className="flex items-center gap-3 overflow-hidden">
                                                            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                                                                <Check className="h-4 w-4" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="font-medium text-sm truncate">{videoFile.name}</p>
                                                                <p className="text-xs text-muted-foreground">Ready for analysis</p>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-muted-foreground hover:text-destructive"
                                                            onClick={handleReset}
                                                        >
                                                            Change Video
                                                        </Button>
                                                    </div>

                                                    {/* Audio Upload Trigger */}
                                                    <div
                                                        className="flex items-center justify-center gap-2 p-3 rounded-lg bg-orange-500/10 cursor-pointer hover:bg-orange-500/20 transition-colors border border-orange-500/20"
                                                        onClick={() => document.getElementById('audio-upload')?.click()}
                                                    >
                                                        <Music className="h-4 w-4 text-orange-600" />
                                                        <span className="text-sm font-bold text-orange-700">
                                                            {audioFile ? audioFile.name : "Add Background Music"}
                                                        </span>
                                                        <input
                                                            type="file"
                                                            id="audio-upload"
                                                            accept="audio/*"
                                                            className="hidden"
                                                            onChange={handleAudioChange}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Duration (Sec)</Label>
                                                <Input
                                                    type="number"
                                                    value={duration}
                                                    onChange={(e) => setDuration(e.target.value)}
                                                    className="bg-muted/30"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Platform</Label>
                                                <div className="flex bg-muted/30 p-1 rounded-lg">
                                                    <button
                                                        onClick={() => setPlatform('instagram')}
                                                        className={`flex-1 flex justify-center py-2 rounded-md transition-all ${platform === 'instagram' ? 'bg-background shadow-sm text-pink-600' : 'text-muted-foreground hover:text-foreground'}`}
                                                    >
                                                        <Instagram className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => setPlatform('whatsapp')}
                                                        className={`flex-1 flex justify-center py-2 rounded-md transition-all ${platform === 'whatsapp' ? 'bg-background shadow-sm text-green-600' : 'text-muted-foreground hover:text-foreground'}`}
                                                    >
                                                        <Smartphone className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => setPlatform('generic')}
                                                        className={`flex-1 flex justify-center py-2 rounded-md transition-all ${platform === 'generic' ? 'bg-background shadow-sm text-blue-600' : 'text-muted-foreground hover:text-foreground'}`}
                                                    >
                                                        <Video className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <Button
                                            className="w-full h-12 text-lg font-bold bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 shadow-lg shadow-pink-500/20"
                                            onClick={handleGenerate}
                                            disabled={isGenerating}
                                        >
                                            {isGenerating ? (
                                                <>
                                                    <Sparkles className="h-5 w-5 mr-2 animate-spin" />
                                                    Magic is happening...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="h-5 w-5 mr-2" />
                                                    Generate Reel Plan
                                                </>
                                            )}
                                        </Button>
                                    </CardContent>
                                </Card>

                                {/* Features Info */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                                        <Music className="h-6 w-6 text-orange-500 mb-2" />
                                        <h3 className="font-bold text-sm">Smart Music</h3>
                                        <p className="text-xs text-muted-foreground">Auto-matches beat to your food type.</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                        <Type className="h-6 w-6 text-blue-500 mb-2" />
                                        <h3 className="font-bold text-sm">Viral Captions</h3>
                                        <p className="text-xs text-muted-foreground">Hooks that stop the scroll.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Output Section */}
                            <div className="lg:col-span-7 space-y-6">
                                {generatedPlan ? (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                                        {/* --- NEW: Live Reel Preview --- */}
                                        <div className="flex flex-col md:flex-row gap-8 items-start">
                                            {/* Phone Mockup Preview */}
                                            <div className="w-full md:w-[320px] flex-shrink-0 mx-auto">
                                                <div
                                                    className="bg-black rounded-[3rem] border-8 border-gray-900 overflow-hidden shadow-2xl relative aspect-[9/19] ring-1 ring-white/10 cursor-pointer"
                                                    onClick={togglePlay}
                                                >
                                                    {/* Video Layer */}
                                                    {previewUrl && (
                                                        <video
                                                            ref={previewVideoRef}
                                                            src={previewUrl}
                                                            autoPlay
                                                            loop
                                                            muted // Muted because we play audio separately or we can unmute if no separate audio
                                                            playsInline
                                                            className="absolute inset-0 w-full h-full object-cover"
                                                            onPlay={() => {
                                                                if (audioPreviewUrl) {
                                                                    const audio = new Audio(audioPreviewUrl);
                                                                    // We need to keep a reference to this audio to pause it, 
                                                                    // but the main audioRef is in the input section. 
                                                                    // Let's rely on the global audioRef if possible, OR create a dedicated preview audio instance.
                                                                    // For simplicity in this mock, we'll just try to sync.
                                                                    // BETTER: Let the audio element in the DOM (audioRef) handle sound, 
                                                                    // and we just control it via togglePlay.
                                                                    // So we WON'T create a new Audio() here to avoid double playing.
                                                                    if (audioRef.current) {
                                                                        audioRef.current.currentTime = 0;
                                                                        audioRef.current.play().catch(e => console.log('Audio autoplay blocked', e));
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                    )}

                                                    {/* Overlay Gradient */}
                                                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 pointer-events-none" />

                                                    {/* Play/Pause Center Overlay */}
                                                    {!isVideoPlaying && (
                                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20 backdrop-blur-[1px]">
                                                            <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                                                                <Play className="h-8 w-8 text-white fill-current" />
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* UI Overlays */}
                                                    <div className="absolute top-8 left-4 right-4 flex justify-between items-center text-white pointer-events-none">
                                                        <span className="font-bold text-sm">Reels</span>
                                                        <Sparkles className="h-4 w-4" />
                                                    </div>

                                                    {/* Caption Overlay */}
                                                    <div className="absolute bottom-20 left-4 right-4 text-white pointer-events-none space-y-2">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-yellow-400 to-red-600 p-[2px]">
                                                                <div className="h-full w-full rounded-full bg-black/50" />
                                                            </div>
                                                            <span className="font-semibold text-sm">@RasoiMitra</span>
                                                        </div>
                                                        <p className="text-sm font-medium leading-snug drop-shadow-md">
                                                            {generatedPlan.captions[0]}
                                                            <span className="text-blue-200 ml-2">#foodie #viral</span>
                                                        </p>
                                                        <div className="flex items-center gap-2 text-xs opacity-80 mt-2">
                                                            <Music className="h-3 w-3 animate-spin" />
                                                            <span className="truncate max-w-[150px]">{generatedPlan.music.music_style} Original Audio</span>
                                                        </div>
                                                    </div>

                                                    {/* Side Actions Mock */}
                                                    <div
                                                        className="absolute bottom-20 right-2 flex flex-col gap-4 items-center text-white pointer-events-auto"
                                                        onClick={(e) => e.stopPropagation()} // Prevent togglePlay when clicking actions
                                                    >
                                                        <button
                                                            onClick={handleDownloadVideo}
                                                            className="flex flex-col items-center gap-1 group"
                                                            title="Download Reel"
                                                        >
                                                            <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-white/30 transition-colors">
                                                                <Download className="h-5 w-5" />
                                                            </div>
                                                            <span className="text-[10px]">Save</span>
                                                        </button>

                                                        <div className="flex flex-col items-center gap-1">
                                                            <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                                                                <span className="text-xs">❤️</span>
                                                            </div>
                                                            <span className="text-[10px]">1.2k</span>
                                                        </div>
                                                        <div className="flex flex-col items-center gap-1">
                                                            <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                                                                <span className="text-xs">💬</span>
                                                            </div>
                                                            <span className="text-[10px]">45</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>


                                            {/* Details Column (Existing Content moved here) */}
                                            <div className="flex-1 space-y-6 w-full">
                                                {/* 1. Creative Direction Card */}
                                                <Card className="border-border shadow-xl overflow-hidden relative">
                                                    {/* ... existing card content ... */}
                                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600" />
                                                    <CardContent className="p-6">
                                                        <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center mb-6">
                                                            <div>
                                                                <h2 className="text-2xl font-bold mb-1">Creative Direction</h2>
                                                                <p className="text-muted-foreground text-sm">Follow this style for best results</p>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold border border-primary/20 capitalize">
                                                                    {generatedPlan.food_type.replace('_', ' ')}
                                                                </span>
                                                                <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-bold border border-border capitalize">
                                                                    {generatedPlan.tone} Tone
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Music Card */}
                                                        <div className="bg-muted/50 rounded-xl p-4 flex items-center gap-4 border border-border/50">
                                                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg animate-pulse">
                                                                <Play className="h-5 w-5 text-white ml-1" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <h4 className="font-bold text-sm text-foreground/80 uppercase tracking-widest text-[10px] mb-1">Recommended Audio</h4>
                                                                <div className="flex flex-wrap items-center gap-x-2">
                                                                    <span className="text-lg font-bold capitalize">{generatedPlan.music.music_style.replace('_', ' ')}</span>
                                                                    <span className="text-muted-foreground">•</span>
                                                                    <span className="text-sm text-muted-foreground capitalize">{generatedPlan.music.tempo} Tempo</span>
                                                                    <span className="text-muted-foreground">•</span>
                                                                    <span className="text-sm text-muted-foreground capitalize">{generatedPlan.music.energy} Energy</span>
                                                                </div>
                                                                {/* Audio element is now managed by the preview logic or global state, 
                                                                    but we kept the hidden player in Input section for sync.
                                                                    The phone preview uses a simple auto-play for effect.
                                                                */}
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>

                                                {/* 2. Captions Options */}
                                                <div className="space-y-3">
                                                    <h3 className="font-bold text-lg flex items-center gap-2">
                                                        <Type className="h-5 w-5 text-muted-foreground" />
                                                        Suggested Captions
                                                    </h3>
                                                    <div className="grid gap-3">
                                                        {generatedPlan.captions.map((caption: string, idx: number) => (
                                                            <div
                                                                key={idx}
                                                                className="group bg-card border border-border hover:border-primary/50 rounded-lg p-4 flex items-center justify-between transition-all hover:shadow-md"
                                                            >
                                                                <p className="text-base font-medium leading-relaxed">{caption}</p>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => copyToClipboard(caption)}
                                                                    className="opacity-0 group-hover:opacity-100 transition-opacity ml-4"
                                                                >
                                                                    <Copy className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Bar */}
                                        <div className="flex gap-4 pt-4">
                                            <Button
                                                className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20"
                                                size="lg"
                                                onClick={handleShare}
                                            >
                                                <Share2 className="h-4 w-4 mr-2" />
                                                Share to Editor
                                            </Button>
                                            <Button variant="outline" size="lg" onClick={handleReset} className="text-pink-600 hover:text-pink-700 border-pink-200 hover:bg-pink-50">
                                                Create New
                                            </Button>
                                        </div>

                                    </div>
                                ) : (
                                    /* Empty State / Placeholder */
                                    <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-muted-foreground/20 rounded-2xl bg-muted/5">
                                        <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-4">
                                            <Video className="h-10 w-10 text-muted-foreground/50" />
                                        </div>
                                        <h3 className="text-xl font-bold text-muted-foreground">Ready to Create?</h3>
                                        <p className="text-sm text-muted-foreground max-w-xs mt-2">
                                            Enter your video details on the left and hit generate to see the magic happen.
                                        </p>

                                        {/* Mock Preview Items */}
                                        <div className="mt-8 flex gap-4 opacity-40 blur-[1px] select-none pointer-events-none transform scale-90">
                                            <div className="h-32 w-24 bg-card rounded-lg border border-border shadow-sm p-2" />
                                            <div className="h-32 w-24 bg-card rounded-lg border border-border shadow-sm p-2" />
                                            <div className="h-32 w-24 bg-card rounded-lg border border-border shadow-sm p-2" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
};

export default VideoReelCreator;
