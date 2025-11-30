

import React, { useState, useRef, useEffect } from 'react';
import { Icons } from '../constants';
import { useToast } from './ToastContainer';
import { transcribeAndAnalyzeAudioForVideo, generateImageForVideo } from '../services/geminiService';
import { VideoScene } from '../types';

const VideoCreator: React.FC = () => {
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [scenes, setScenes] = useState<VideoScene[]>([]);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState('');
    const [useGrounding, setUseGrounding] = useState(false);
    
    // Playback state
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
    
    const audioRef = useRef<HTMLAudioElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const requestRef = useRef<number>();
    const toast = useToast();

    // Canvas Settings
    const CANVAS_WIDTH = 1280;
    const CANVAS_HEIGHT = 720;
    const FADE_DURATION = 0.5; // seconds for cross-fade

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAudioFile(file);
            const url = URL.createObjectURL(file);
            setAudioUrl(url);
            setScenes([]);
            setVideoBlob(null);
        }
    };

    const processAudio = async () => {
        if (!audioFile) return;
        setLoading(true);
        setStatusText("Transcribing and analyzing audio scenes...");
        setProgress(0);
        
        try {
            const reader = new FileReader();
            reader.readAsDataURL(audioFile);
            reader.onloadend = async () => {
                const base64Audio = reader.result as string;
                const scenesData = await transcribeAndAnalyzeAudioForVideo(base64Audio, useGrounding);
                setScenes(scenesData);
                
                setStatusText(`Generating visuals for ${scenesData.length} scenes...`);
                await generateAllVisuals(scenesData);
            };
        } catch (e: any) {
            console.error(e);
            toast.show("Failed to analyze audio.", "error");
            setLoading(false);
        }
    };

    const generateAllVisuals = async (sceneList: VideoScene[]) => {
        const updatedScenes = [...sceneList];
        let completed = 0;

        for (let i = 0; i < updatedScenes.length; i++) {
            try {
                const imgBase64 = await generateImageForVideo(updatedScenes[i].visualPrompt);
                updatedScenes[i].image = imgBase64;
                completed++;
                setProgress(Math.round((completed / updatedScenes.length) * 100));
                setScenes([...updatedScenes]);
            } catch (e) {
                console.error(`Failed to generate image for scene ${i}`, e);
            }
        }
        
        setLoading(false);
        setStatusText("Ready to render!");
        toast.show("Video assets generated!", "success");
    };

    const handleRegenerateScene = async (sceneIndex: number) => {
        const updatedScenes = [...scenes];
        updatedScenes[sceneIndex].regenerating = true;
        setScenes(updatedScenes);

        try {
            const imgBase64 = await generateImageForVideo(updatedScenes[sceneIndex].editablePrompt);
            updatedScenes[sceneIndex].image = imgBase64;
        } catch (e) {
            toast.show("Failed to regenerate image.", "error");
        } finally {
            updatedScenes[sceneIndex].regenerating = false;
            setScenes([...updatedScenes]);
        }
    };

    const handlePromptChange = (index: number, newPrompt: string) => {
        const updatedScenes = [...scenes];
        updatedScenes[index].editablePrompt = newPrompt;
        setScenes(updatedScenes);
    };

    const drawScene = (ctx: CanvasRenderingContext2D, scene: VideoScene, opacity = 1) => {
        if (!scene.image) return;
        ctx.globalAlpha = opacity;
        const img = new Image();
        img.src = scene.image;
        ctx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.globalAlpha = 1;
    };

    const drawCaptions = (ctx: CanvasRenderingContext2D, scene: VideoScene, time: number) => {
        if (!scene.words) return;

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(50, CANVAS_HEIGHT - 120, CANVAS_WIDTH - 100, 80);

        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const lineY = CANVAS_HEIGHT - 80;

        // Draw karaoke style
        let currentX = CANVAS_WIDTH / 2; // Center alignment start
        const fullLineWidth = ctx.measureText(scene.text).width;
        currentX -= fullLineWidth / 2;

        for (const word of scene.words) {
            const isSpoken = time >= word.startTime && time <= word.endTime;
            ctx.fillStyle = isSpoken ? '#FBBF24' : '#FFFFFF'; // Amber for active word
            ctx.fillText(word.word, currentX, lineY);
            currentX += ctx.measureText(word.word + " ").width;
        }
    };

    const animate = () => {
        if (!audioRef.current || !scenes.length) return;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;
        
        const time = audioRef.current.currentTime;
        setCurrentTime(time);

        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        const currentSceneIndex = scenes.findIndex(s => time >= s.startTime && time <= s.endTime);
        const currentScene = scenes[currentSceneIndex];
        const prevScene = scenes[currentSceneIndex - 1];
        
        if (currentScene) {
            const timeIntoScene = time - currentScene.startTime;
            const isFadingIn = timeIntoScene < FADE_DURATION;

            if (isFadingIn && prevScene) {
                const fadeOutOpacity = 1 - (timeIntoScene / FADE_DURATION);
                drawScene(ctx, prevScene, fadeOutOpacity);
            }
            
            const fadeInOpacity = isFadingIn ? timeIntoScene / FADE_DURATION : 1;
            drawScene(ctx, currentScene, fadeInOpacity);
            drawCaptions(ctx, currentScene, time);
        } else {
             // Handle gaps or end of video
            const lastScene = scenes[scenes.length-1];
            if (lastScene) drawScene(ctx, lastScene);
        }

        if (!audioRef.current.paused && !audioRef.current.ended) {
            requestRef.current = requestAnimationFrame(animate);
        } else {
            setIsPlaying(false);
        }
    };

    useEffect(() => {
        // Initial draw when scenes are ready
        if (scenes.length > 0 && scenes[0].image) {
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');
            if(ctx) drawScene(ctx, scenes[0]);
        }
    }, [scenes]);


    const togglePlay = () => {
        if (!audioRef.current) return;
        
        if (isPlaying) {
            audioRef.current.pause();
            cancelAnimationFrame(requestRef.current!);
            setIsPlaying(false);
        } else {
            audioRef.current.play();
            setIsPlaying(true);
            requestRef.current = requestAnimationFrame(animate);
        }
    };

    const handleRecord = async () => {
        if (!canvasRef.current || !audioRef.current) return;
        
        toast.show("Starting render... Please wait for playback to finish.", "info");
        
        const canvasStream = canvasRef.current.captureStream(30); // 30 FPS
        let finalStream = canvasStream;
        
        try {
            const audioCtx = new AudioContext();
            const source = audioCtx.createMediaElementSource(audioRef.current);
            const dest = audioCtx.createMediaStreamDestination();
            source.connect(dest);
            const audioTrack = dest.stream.getAudioTracks()[0];
            finalStream = new MediaStream([...canvasStream.getVideoTracks(), audioTrack]);
        } catch (e) {
            console.warn("Could not capture audio stream for export", e);
        }

        const mediaRecorder = new MediaRecorder(finalStream, { mimeType: 'video/webm; codecs=vp9', videoBitsPerSecond: 2500000 });
        const chunks: Blob[] = [];

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'video/mp4' });
            setVideoBlob(blob);
            toast.show("Video rendered! Click Download.", "success");
        };

        audioRef.current.currentTime = 0;
        audioRef.current.play();
        mediaRecorder.start();
        
        requestRef.current = requestAnimationFrame(animate);
        
        audioRef.current.onended = () => {
            mediaRecorder.stop();
            cancelAnimationFrame(requestRef.current!);
            setIsPlaying(false);
        };
    };

    return (
        <div className="h-full flex flex-col max-w-7xl mx-auto">
            <div className="mb-6">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Icons.Film /> AI Video Studio
                </h2>
                <p className="text-slate-500 dark:text-slate-400">Turn audio into a captioned video with AI-generated visuals.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
                {/* Left: Input & Storyboard */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm uppercase mb-4">1. Source Audio</h3>
                        
                        {!audioFile ? (
                             <div 
                                onClick={() => document.getElementById('audio-upload')?.click()}
                                className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                            >
                                <div className="mx-auto w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-2">
                                    <Icons.Upload />
                                </div>
                                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Upload MP3 / WAV</p>
                                <input type="file" id="audio-upload" accept="audio/*" className="hidden" onChange={handleFileChange} />
                            </div>
                        ) : (
                             <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                                <div className="truncate text-sm font-medium text-slate-700 dark:text-slate-300">{audioFile.name}</div>
                                <button onClick={() => { setAudioFile(null); setAudioUrl(null); setScenes([]); }} className="text-red-500 hover:bg-red-50 p-1 rounded">
                                    <Icons.X />
                                </button>
                            </div>
                        )}

                        {audioFile && (
                            <div className="mt-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <input 
                                        type="checkbox" 
                                        id="grounding" 
                                        checked={useGrounding} 
                                        onChange={e => setUseGrounding(e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor="grounding" className="text-xs text-slate-600 dark:text-slate-400 select-none">
                                        Use Google Search to find factual visuals?
                                    </label>
                                </div>
                                <button
                                    onClick={processAudio}
                                    disabled={loading || scenes.length > 0}
                                    className={`w-full py-3 rounded-lg font-bold text-white shadow-md flex items-center justify-center gap-2 transition-all
                                        ${loading || scenes.length > 0 ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
                                    `}
                                >
                                    {loading ? 'Processing...' : 'Create Video Scenes'}
                                </button>
                            </div>
                        )}
                        
                        {loading && (
                            <div className="mt-4">
                                <p className="text-xs text-center text-slate-500 dark:text-slate-400 mb-2">{statusText}</p>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                                    <div className="bg-blue-600 h-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Scene List */}
                    <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                            <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm uppercase">Storyboard ({scenes.length})</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-2">
                            {scenes.length === 0 && <p className="text-center text-slate-400 text-xs mt-10">No scenes generated yet.</p>}
                            {scenes.map((scene, i) => (
                                <div key={i} className="flex flex-col gap-2 p-3 bg-slate-50 dark:bg-slate-900/30 rounded-lg border border-slate-100 dark:border-slate-800">
                                    <div className="flex gap-3">
                                        <div className="w-24 h-14 bg-slate-200 dark:bg-slate-700 rounded flex-shrink-0 overflow-hidden relative group">
                                            {scene.image ? <img src={scene.image} alt="scene" className="w-full h-full object-cover" /> : 
                                                <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                                                    {scene.regenerating || loading ? <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent animate-spin rounded-full"></div> : '...'}
                                                </div>
                                            }
                                            <button onClick={() => handleRegenerateScene(i)} className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Icons.Loop />
                                            </button>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="text-xs font-mono text-blue-500 mb-0.5">{scene.startTime.toFixed(1)}s - {scene.endTime.toFixed(1)}s</div>
                                            <div className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2" title={scene.text}>"{scene.text}"</div>
                                        </div>
                                    </div>
                                    <textarea 
                                        value={scene.editablePrompt}
                                        onChange={e => handlePromptChange(i, e.target.value)}
                                        className="w-full text-[10px] p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded h-10 resize-none font-mono"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Preview & Render */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <div className="bg-black rounded-xl overflow-hidden aspect-video relative group shadow-2xl border border-slate-800">
                        <canvas 
                            ref={canvasRef} 
                            width={CANVAS_WIDTH} 
                            height={CANVAS_HEIGHT} 
                            className="w-full h-full object-contain"
                        />
                        
                        {audioUrl && (
                            <audio 
                                ref={audioRef} 
                                src={audioUrl} 
                                onEnded={() => setIsPlaying(false)}
                                className="hidden"
                            />
                        )}

                        {scenes.length > 0 && (
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={togglePlay} className="text-white hover:text-blue-400">
                                    {isPlaying ? <Icons.Stop /> : <div className="ml-1"><Icons.ArrowRight /></div>}
                                </button>
                                <div className="text-white font-mono text-xs">
                                    {currentTime.toFixed(1)}s
                                </div>
                                <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-blue-500" 
                                        style={{ width: `${(currentTime / (audioRef.current?.duration || 1)) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-slate-200">Export Video</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Render the final video file.</p>
                        </div>
                        <div className="flex gap-3">
                            {videoBlob && (
                                <a 
                                    href={URL.createObjectURL(videoBlob)} 
                                    download={`video-${Date.now()}.mp4`}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm flex items-center gap-2"
                                >
                                    <Icons.Download /> Download
                                </a>
                            )}
                            <button 
                                onClick={handleRecord}
                                disabled={scenes.length === 0 || !scenes.every(s => s.image)}
                                className={`px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-lg font-bold text-sm flex items-center gap-2
                                    ${(scenes.length === 0 || !scenes.every(s => s.image)) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-700 dark:hover:bg-slate-600'}
                                `}
                            >
                                <Icons.VideoCamera /> Render
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoCreator;