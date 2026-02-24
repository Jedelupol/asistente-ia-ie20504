import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { BookOpen } from 'lucide-react';

interface ImageWithFallbackProps extends Omit<ImageProps, 'onError'> {
    fallbackIconSize?: number;
}

export default function ImageWithFallback({ src, fallbackIconSize = 10, alt, ...props }: ImageWithFallbackProps) {
    const [error, setError] = useState(false);

    // If there's no src or it errored out (404/429)
    if (!src || error) {
        return (
            <div className={`w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-400 gap-2 ${props.className || ''}`}>
                <BookOpen className={`w-${fallbackIconSize} h-${fallbackIconSize} opacity-50`} />
                <span className="text-xs font-bold uppercase tracking-wider">I.E. 20504</span>
            </div>
        );
    }

    // Next.js Image component with fallback logic
    return (
        <Image
            src={src}
            alt={alt}
            onError={() => setError(true)}
            {...props}
        />
    );
}
