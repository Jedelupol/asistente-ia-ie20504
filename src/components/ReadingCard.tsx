'use client';
import React, { useState } from 'react';
import ImageWithFallback from '@/components/ImageWithFallback';
import Link from 'next/link';
import { BookOpen, ChevronRight, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { Reading } from '@/data/mockReadings';

interface ReadingCardProps {
    reading: Reading;
    onEdit?: (id: string) => void;
    onDelete?: (id: string, isDeletedDoc?: boolean) => void;
}

export default function ReadingCard({ reading, onEdit, onDelete }: ReadingCardProps) {
    const [showMenu, setShowMenu] = useState(false);

    const handleMenuClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowMenu(!showMenu);
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowMenu(false);
        if (onEdit) onEdit(reading.id);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowMenu(false);
        // If it's a dynamic generated id, normally starts with visual- or whatever, but we can pass truthy.
        if (onDelete) onDelete(reading.id, false);
    };

    return (
        <div className="relative group w-full h-full">
            <Link href={`/dashboard/reading/${reading.id}`} className="block w-full h-full">
                <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200 flex flex-col h-full transform hover:-translate-y-1">

                    {/* Cover Image */}
                    <div className="relative h-48 w-full overflow-hidden bg-slate-100 flex items-center justify-center">
                        <ImageWithFallback
                            src={reading.portadaUrl}
                            alt={reading.titulo}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            fallbackIconSize={10}
                        />
                        {/* Grade Badge */}
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary-700 shadow-sm flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5" />
                            {reading.grado}° Grado
                        </div>

                        {/* Three Dots Menu Button */}
                        <button
                            onClick={handleMenuClick}
                            className="absolute top-3 right-3 bg-white/90 hover:bg-white backdrop-blur-sm p-1.5 rounded-full shadow-sm text-black hover:text-primary-600 transition-colors z-10"
                        >
                            <MoreVertical className="w-5 h-5" />
                        </button>

                        {/* Dropdown Menu */}
                        {showMenu && (
                            <div className="absolute top-12 right-3 w-36 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-20 transition-all opacity-100 animate-in fade-in zoom-in-95">
                                <button
                                    onClick={handleEdit}
                                    className="w-full text-left px-4 py-2.5 text-sm text-black hover:bg-slate-50 hover:text-primary-600 flex items-center gap-2 font-medium"
                                >
                                    <Edit2 className="w-4 h-4" /> Editar
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium border-t border-slate-50"
                                >
                                    <Trash2 className="w-4 h-4" /> Eliminar
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="p-5 flex flex-col flex-grow">
                        <h3 className="font-bold text-lg text-black line-clamp-2 mb-2 group-hover:text-primary-600 transition-colors">
                            {reading.titulo}
                        </h3>

                        <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-50">
                            <span className="text-xs font-medium text-black">
                                Evaluación CNEB
                            </span>
                            <div className="w-8 h-8 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center group-hover:bg-primary-600 group-hover:text-black transition-colors">
                                <ChevronRight className="w-4 h-4" />
                            </div>
                        </div>
                    </div>

                </div>
            </Link>
        </div>
    );
}
