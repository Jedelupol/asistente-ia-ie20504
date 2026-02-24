import React, { useState } from 'react';
import { ImageProps } from 'next/image';
import { BookOpen } from 'lucide-react';

interface ImageWithFallbackProps extends Omit<ImageProps, 'onError'> {
    fallbackIconSize?: number;
}

export default function ImageWithFallback({ src, fallbackIconSize = 10, alt, ...props }: ImageWithFallbackProps) {
    const [error, setError] = useState(false);

    // If there's no src or it errored out
    if (!src || error) {
        if (src && error) console.warn(`🔴 [IMAGEN] Error de carga en: ${src}`);
        return (
            <div className={`w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-400 gap-2 ${props.className || ''}`}>
                <BookOpen className={`w-${fallbackIconSize} h-${fallbackIconSize} opacity-50`} />
                <span className="text-xs font-bold uppercase tracking-wider">I.E. 20504</span>
            </div>
        );
    }

    const { fill, className, ...restProps } = props;

    // Use native <img> tags. They bypass NextJS lazy hydration issues during printing.
    // Unsplash allows raw <img> src but blocks fetch() CORS, so native img is best.
    if (fill) {
        return (
            <img
                src={src as string}
                alt={alt || "Imagen"}
                className={`absolute inset-0 w-full h-full object-cover text-transparent ${className || ''}`}
                onError={(e) => {
                    console.error("❌ [CLIENTE] Error cargando imagen (fill):", src);
                    setError(true);
                }}
                crossOrigin="anonymous"
            />
        );
    }

    return (
        <img
            src={src as string}
            alt={alt || "Imagen"}
            onError={(e) => {
                console.error("❌ [CLIENTE] Error cargando imagen (width/height):", src);
                setError(true);
            }}
            width={props.width}
            height={props.height}
            className={className}
            crossOrigin="anonymous"
        />
    );
}
