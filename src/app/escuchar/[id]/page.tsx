'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Play, Pause, Square, ChevronLeft, Volume2, SkipBack, SkipForward } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { mockReadings, Reading } from '@/data/mockReadings';

interface Paragraph {
    id: number;
    text: string;
    html: string;
}

export default function ListenPage() {
    const { id } = useParams();
    const router = useRouter();
    const [reading, setReading] = useState<Reading | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // Chunking State
    const [paragraphs, setParagraphs] = useState<Paragraph[]>([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const currentIndexRef = useRef(-1); // For accurate state inside callbacks
    
    // TTS State
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const synthRef = useRef<SpeechSynthesis | null>(null);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    // Sync ref when current index changes
    useEffect(() => {
        currentIndexRef.current = currentIndex;
    }, [currentIndex]);

    // Fetch and Parse Reading
    useEffect(() => {
        synthRef.current = window.speechSynthesis;
        
        const fetchReading = async () => {
            if (!id) return;
            setIsLoading(true);
            try {
                const docRef = doc(db, 'readings', id as string);
                const docSnap = await getDoc(docRef);
                let loadedReading: Reading | null = null;
                
                if (docSnap.exists()) {
                    loadedReading = { ...docSnap.data(), id: docSnap.id } as Reading;
                } else {
                    const staticReading = mockReadings.find((r) => r.id === id);
                    if (staticReading) loadedReading = staticReading;
                }
                
                // SI NO EXISTE EN DB, O SI FALLA PERMISOS (Firestore Security Rules), VA POR MOCK DATA
                const staticReading = mockReadings.find((r) => r.id === id);
                if (staticReading) {
                    loadedReading = staticReading;
                }
                
                if (loadedReading) {
                    setReading(loadedReading);
                    parseHtmlIntoParagraphs(loadedReading.contenido);
                }
            } catch (error: any) {
                // Ignore Firebase Missing Permissions error as this is a public unauthenticated route
                if (error?.code !== 'permission-denied') {
                    console.error("Error fetching reading:", error);
                }
                const staticReading = mockReadings.find((r) => r.id === id);
                if (staticReading) {
                    setReading(staticReading);
                    parseHtmlIntoParagraphs(staticReading.contenido);
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchReading();

        return () => {
            if (synthRef.current) {
                synthRef.current.cancel();
            }
        };
    }, [id]);

    const parseHtmlIntoParagraphs = (html: string) => {
        const tmp = document.createElement("DIV");
        // Try to identify distinct blocks by block elements
        // This is a naive but effective way for simple rich text
        tmp.innerHTML = html.replace(/<(p|div|h[1-6]|ul|ol|li)[^>]*>/gi, '||SPLIT||$&');
        
        // If the HTML lacks standard tags, just split by BR or newlines roughly
        let rawChunks = tmp.innerHTML.split('||SPLIT||');
        if (rawChunks.length <= 1) {
             rawChunks = tmp.innerHTML.split(/<br\s*\/?>/i);
        }
        
        const rawParagraphs: Paragraph[] = [];
        let pId = 0;
        
        rawChunks.forEach(chunk => {
            const stripped = document.createElement("DIV");
            stripped.innerHTML = chunk;
            const textContent = (stripped.textContent || stripped.innerText || "").trim();
            if (textContent.length > 0) {
                rawParagraphs.push({
                    id: pId++,
                    text: textContent,
                    html: chunk
                });
            }
        });

        // Ensure we always have at least one chunk to read
        if (rawParagraphs.length === 0) {
            rawParagraphs.push({
                id: 0,
                text: "No se pudo cargar el texto o el contenido está vacío.",
                html: "<p>No se pudo cargar el texto o el contenido está vacío.</p>"
            });
        }

        setParagraphs(rawParagraphs);
    };

    // --- Audio Control Functions ---

    const speakParagraph = (indexToPlay: number) => {
        if (!synthRef.current || indexToPlay < 0 || indexToPlay >= paragraphs.length) return;

        synthRef.current.cancel(); // Stop whatever is currently playing
        setCurrentIndex(indexToPlay);
        setIsPlaying(true);
        setIsPaused(false);

        const chunkText = paragraphs[indexToPlay].text;
        const utterance = new SpeechSynthesisUtterance(chunkText);
        
        // Settings
        utterance.lang = 'es-PE';
        utterance.rate = 0.85; 
        utterance.pitch = 1;

        // Find a decent Spanish voice
        const voices = synthRef.current.getVoices();
        const spanishVoice = voices.find(v => v.lang.startsWith('es-') && (v.name.includes('Google') || v.name.includes('Microsoft') || v.name.includes('Apple')));
        if (spanishVoice) {
            utterance.voice = spanishVoice;
        }

        // Auto Advance Logic
        utterance.onend = () => {
            // Check if we hit Stop or paused. If not, auto-advance.
            // Using a short timeout to prevent rapid-fire glitches when moving to next utterance
            setTimeout(() => {
                const current = currentIndexRef.current;
                // If it reached the end organically (we did not manually cancel and switch index)
                if (current === indexToPlay) {
                    if (current + 1 < paragraphs.length) {
                        speakParagraph(current + 1);
                    } else {
                        // Finished entirely
                        setIsPlaying(false);
                        setCurrentIndex(-1); // Reset
                    }
                }
            }, 300);
        };

        utterance.onerror = (e) => {
            // Don't log or stop on non-fatal interruption errors (like when stopping manually)
            if (e.error !== 'interrupted' && e.error !== 'canceled') {
                console.warn("Speech warning/error:", e);
                setIsPlaying(false);
                setIsPaused(false);
            }
        };

        utteranceRef.current = utterance;
        synthRef.current.speak(utterance);
    };

    const handlePlayPause = () => {
        if (!synthRef.current || paragraphs.length === 0) return;

        if (isPlaying && !isPaused) {
            synthRef.current.pause();
            setIsPaused(true);
        } else if (isPlaying && isPaused) {
            synthRef.current.resume();
            setIsPaused(false);
        } else {
            // Start from where we left off, or from beginning
            const startIndex = currentIndex >= 0 ? currentIndex : 0;
            speakParagraph(startIndex);
        }
    };

    const handleStop = () => {
        if (!synthRef.current) return;
        synthRef.current.cancel();
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentIndex(-1);
    };

    const handleNext = () => {
        if (currentIndexRef.current + 1 < paragraphs.length) {
            speakParagraph(currentIndexRef.current + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndexRef.current - 1 >= 0) {
            speakParagraph(currentIndexRef.current - 1);
        } else if (currentIndexRef.current > 0) {
            // If we are at index 0 but somehow it was playing, restart it.
            speakParagraph(0);
        }
    };
    
    // Enable click-to-play on specific paragraphs
    const handleParagraphClick = (idx: number) => {
        speakParagraph(idx);
    };

    // Listen for voice catalog loading (to ensure Spanish voices load properly on some browsers)
    useEffect(() => {
        const handleVoicesChanged = () => {
             if (synthRef.current) synthRef.current.getVoices();
        };
        speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
        return () => speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
    }, []);

    const handleBack = () => {
        // If they came from an external QR scan, router.back() might do nothing or send to weird states.
        // As a fallback, we navigate to the home page since this is a public route for students
        // and /dashboard requires login.
        if (window.history.length > 2) {
            router.back();
        } else {
            router.push('/');
        }
    };

    if (isLoading) return <div className="p-8 text-center bg-[#FDF8F5] min-h-screen text-[#5D4037] font-bold flex items-center justify-center">Cargando lectura...</div>;
    if (!reading) return <div className="p-8 text-center bg-[#FDF8F5] min-h-screen flex items-center justify-center text-[#5D4037]">Lectura no encontrada. Intenta escanear nuevamente.</div>;

    return (
        <div className="min-h-screen bg-[#FDF8F5] pb-32 selection:bg-[#5D4037] selection:text-white">
            {/* Header minimal */}
            <div className="bg-white border-b border-[#EADDD7] px-4 py-4 sticky top-0 z-10 flex items-center shadow-sm">
                <button 
                    onClick={handleBack}
                    className="p-2 rounded-full hover:bg-[#F5EBE6] text-[#5D4037] transition-colors"
                    aria-label="Volver"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="flex-1 text-center font-black text-[#5D4037] text-lg tracking-tight uppercase flex items-center justify-center gap-2">
                    <Volume2 className="w-5 h-5 text-orange-500" /> Reproductor
                </div>
                <div className="w-10"></div> {/* Spacer for centering */}
            </div>

            <main className="max-w-2xl mx-auto px-6 py-8">
                <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-[#EADDD7] mb-8">
                    <div className="inline-block px-4 py-1.5 bg-[#F5EBE6] text-[#8D6E63] text-xs font-black uppercase tracking-wider rounded-full mb-4">
                        {reading.grado}° Grado • {reading.tipoTexto}
                    </div>
                    
                    <h1 className="text-3xl sm:text-4xl font-black text-[#3E2723] mb-8 leading-[1.15] tracking-tight">
                        {reading.titulo}
                    </h1>

                    {/* Contenido Fragmentado */}
                    <div className="prose prose-[#5D4037] prose-lg max-w-none text-[#5D4037] leading-relaxed font-medium">
                        {reading.esVisual && reading.imagenesSecuencia ? (
                             <p className="opacity-70 italic text-sm text-center bg-[#F5EBE6] p-4 rounded-xl">Esta es una lectura visual. Escucha la narración mientras sigues las imágenes impresas.</p>
                        ) : (
                             <div className="space-y-4 text-left">
                                 {paragraphs.map((p, idx) => (
                                     <div 
                                        key={p.id}
                                        onClick={() => handleParagraphClick(idx)}
                                        className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 ${
                                            currentIndex === idx 
                                            ? 'bg-[#F2DFD3] border-l-4 border-orange-500 shadow-sm text-[#3E2723] font-bold scale-[1.02]' 
                                            : 'bg-transparent border-l-4 border-transparent hover:bg-[#FDF8F5]'
                                        }`}
                                     >
                                        {/* Renderizamos el HTML sin envolver en div adicional si posible, pero como es innerHTML es necesario */}
                                        <div dangerouslySetInnerHTML={{ __html: p.html }} className="pointer-events-none" />
                                     </div>
                                 ))}
                             </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Sticky Player Controls Completos */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white/95 to-transparent pb-6 border-t border-[#EADDD7]/50 lg:border-none lg:bg-transparent lg:from-transparent">
                <div className="max-w-md mx-auto bg-[#5D4037] rounded-full p-2.5 flex items-center justify-between sm:justify-center sm:gap-6 shadow-2xl border-4 border-white backdrop-blur-md">
                    
                    <button 
                        onClick={handlePrev}
                        disabled={currentIndex <= 0}
                        className={`p-3 rounded-full transition-colors active:scale-95 ${currentIndex <= 0 ? 'text-[#8D6E63]/40 cursor-not-allowed' : 'text-white hover:bg-[#8D6E63]'}`}
                        aria-label="Párrafo Anterior"
                    >
                        <SkipBack className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
                    </button>

                    {isPlaying && !isPaused ? (
                        <button 
                            onClick={handlePlayPause}
                            className="bg-[#8D6E63] text-white p-5 rounded-full hover:bg-[#795548] transition-all transform active:scale-95 shadow-md flex-shrink-0"
                            aria-label="Pausar"
                        >
                            <Pause className="w-8 h-8 fill-current" />
                        </button>
                    ) : (
                        <button 
                            onClick={handlePlayPause}
                            className="bg-orange-500 text-white p-5 rounded-full hover:bg-orange-600 transition-all transform active:scale-95 shadow-lg flex-shrink-0"
                            aria-label={isPaused ? "Reanudar" : "Escuchar"}
                        >
                            <Play className="w-8 h-8 fill-current ml-1" />
                        </button>
                    )}

                    <button 
                        onClick={handleNext}
                        disabled={currentIndex >= paragraphs.length - 1}
                        className={`p-3 rounded-full transition-colors active:scale-95 ${currentIndex >= paragraphs.length - 1 ? 'text-[#8D6E63]/40 cursor-not-allowed' : 'text-white hover:bg-[#8D6E63]'}`}
                        aria-label="Siguiente Párrafo"
                    >
                        <SkipForward className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
                    </button>

                    {/* Separador vertical sutil */}
                    <div className="w-[1px] h-8 bg-[#8D6E63]/50 mx-1 sm:mx-2 hidden sm:block"></div>

                    <button 
                        onClick={handleStop}
                        disabled={!isPlaying && !isPaused && currentIndex === -1}
                        className={`p-3 hidden sm:block rounded-full transition-colors active:scale-95 ${(!isPlaying && !isPaused && currentIndex === -1) ? 'text-[#8D6E63]/40 cursor-not-allowed' : 'text-rose-400 hover:bg-[#8D6E63]'}`}
                        aria-label="Detener"
                    >
                        <Square className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
                    </button>
                </div>
                
                {/* Control lateral detener en moviles para no amontonar */}
                <div className="sm:hidden absolute right-6 top-0 -translate-y-[130%]">
                    <button 
                        onClick={handleStop}
                        disabled={!isPlaying && !isPaused && currentIndex === -1}
                        className={`p-3 rounded-full transition-colors shadow-lg border-2 border-white ${(!isPlaying && !isPaused && currentIndex === -1) ? 'text-[#8D6E63]/40 bg-white/80 cursor-not-allowed' : 'text-rose-500 bg-white hover:bg-rose-50'}`}
                        aria-label="Detener"
                    >
                        <Square className="w-5 h-5 fill-current" />
                    </button>
                </div>
            </div>
            
        </div>
    );
}
