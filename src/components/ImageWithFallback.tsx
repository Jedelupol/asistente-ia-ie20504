import React, { useState, useEffect, useRef } from 'react';
import { ImageProps } from 'next/image';
import { BookOpen } from 'lucide-react';

interface ImageWithFallbackProps extends Omit<ImageProps, 'onError'> {
    fallbackIconSize?: number;
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2500;

export default function ImageWithFallback({ src, fallbackIconSize = 10, alt, ...props }: ImageWithFallbackProps) {
    const [error, setError] = useState(false);
    const [imgSrc, setImgSrc] = useState<string>(src as string);
    const retryCount = useRef(0);
    const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Reset state whenever `src` changes
    useEffect(() => {
        retryCount.current = 0;
        setError(false);
        setImgSrc(src as string);
        return () => {
            if (retryTimer.current) clearTimeout(retryTimer.current);
        };
    }, [src]);

    const handleError = () => {
        if (retryCount.current < MAX_RETRIES) {
            retryCount.current += 1;
            // Force reload by appending a cache-buster, then clearing it after a tick
            retryTimer.current = setTimeout(() => {
                const base = (src as string).split('?_retry=')[0];
                setImgSrc(`${base}?_retry=${retryCount.current}&t=${Date.now()}`);
            }, RETRY_DELAY_MS);
        } else {
            console.warn(`🔴 [IMAGEN] Falló tras ${MAX_RETRIES} intentos: ${src}`);
            setError(true);
        }
    };

    // If there's no src or all retries exhausted
    if (!src || error) {
        return (
            <div className={`w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-400 gap-2 ${props.className || ''}`}>
                <BookOpen className={`w-${fallbackIconSize} h-${fallbackIconSize} opacity-50`} />
                <span className="text-xs font-bold uppercase tracking-wider">I.E. 20504</span>
            </div>
        );
    }

    const { fill, className, ...restProps } = props;

    if (fill) {
        return (
            <img
                src={imgSrc}
                alt={alt || "Imagen"}
                className={`absolute inset-0 w-full h-full object-cover text-transparent ${className || ''}`}
                onError={handleError}
            />
        );
    }

    return (
        <img
            src={imgSrc}
            alt={alt || "Imagen"}
            onError={handleError}
            width={props.width}
            height={props.height}
            className={className}
        />
    );
}
