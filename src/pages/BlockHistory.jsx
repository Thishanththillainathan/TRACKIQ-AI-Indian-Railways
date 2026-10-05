import React, { useEffect, useMemo, useState } from 'react';
import {
    ArrowLeft,
    Calendar,
    Database,
    RefreshCw,
    Search,
    Trash2,
    Train,
    Eye,
    MapPin,
    Clock,
    CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

function formatDate(date) {
    if (!date) return '—';

    try {
        return new Date(`${date}T00:00:00`).toLocaleDateString(
            'en-IN',
            {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }
        );
    } catch {
        return date;
    }
}

function formatTime(value) {
    if (!value) return '—';

    const text = String(value).trim();

    const match = text.match(
        /^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i
    );

    if (!match) return text;

    let hour = Number(match[1]);
    const minute = Number(match[2]);
    const period = match[3]?.toUpperCase();

    if (period === 'PM' && hour < 12) {
        hour += 12;
    }

    if (period === 'AM' && hour === 12) {
        hour = 0;
    }

    const suffix = hour >= 12 ? 'PM' : 'AM';
    let displayHour = hour % 12;

    if (displayHour === 0) {
        displayHour = 12;
    }

    return `${String(displayHour).padStart(2, '0')}:${String(
        minute
    ).padStart(2, '0')} ${suffix}`;
}

function getStatusClass(status) {
    const value = String(status || '').toUpperCase();

    if (value.includes('COMPLETED') || value.includes('DONE')) {
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
    }

    if (value.includes('ACTIVE') || value.includes('RUNNING')) {
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    }

    if (value.includes('PENDING')) {
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    }

    return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
}

export default function BlockHistory() {
    const navigate = useNavigate();

    const [blocks, setBlocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState('ALL');
    const [search, setSearch] = useState('');

    const fetchBlocks = async () => {
        setLoading(true);

        try {
            const { data, error } = await supabase
                .from('optimized_blocks')
                .select('*')
                .order('planning_date', {
                    ascending: false
                })
                .order('start_time', {
                    ascending: true
                })
                .order('created_at', {
                    ascending: false
                });

            if (error) {
                console.error('Block history fetch error:', error);
                setBlocks([]);
                return;
            }

            setBlocks(data || []);
        } catch (error) {
            console.error('Block history error:', error);
            setBlocks([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlocks();
    }, []);

    const availableDates = useMemo(() => {
        return [
            ...new Set(
                blocks
                    .map((block) => block.planning_date)
                    .filter(Boolean)
            )
        ].sort((a, b) => b.localeCompare(a));
    }, [blocks]);

    const filteredBlocks = useMemo(() => {
        return blocks.filter((block) => {
            const dateMatch =
                selectedDate === 'ALL' ||
                block.planning_date === selectedDate;

            const searchText = search.trim().toLowerCase();

            if (!searchText) {
                return dateMatch;
            }

            const blockId =
                block.block_id ||
                block.id ||
                '';

            const location = [
                block.station_code,
                block.division,
                block.zone,
                block.corridor
            ]
                .filter(Boolean)
                .join(' ');

            const text =
                `${blockId} ${location} ${block.status || ''}`.toLowerCase();

            return dateMatch && text.includes(searchText);
        });
    }, [blocks, selectedDate, search]);

    const deleteBlock = async (block) => {
        const blockId = block.block_id || block.id;

        if (!blockId) {
            alert('Block ID not found.');
            return;
        }

        const confirmed = window.confirm(
            `Delete ${blockId} permanently from Block Schedule History?`
        );

        if (!confirmed) return;

        try {
            let query = supabase
                .from('optimized_blocks')
                .delete();

            if (block.block_id) {
                query = query.eq('block_id', block.block_id);
            } else {
                query = query.eq('id', block.id);
            }

            const { error } = await query;

            if (error) {
                console.error('Delete error:', error);
                alert(`Delete failed: ${error.message}`);
                return;
            }

            setBlocks((current) =>
                current.filter((item) => {
                    if (block.block_id) {
                        return item.block_id !== block.block_id;
                    }

                    return item.id !== block.id;
                })
            );

            alert(`${blockId} deleted successfully.`);
        } catch (error) {
            console.error(error);
            alert('Delete failed.');
        }
    };

    const openSimulation = (block) => {
        const blockId = block.block_id || block.id;

        if (!blockId) {
            alert('Block ID not found.');
        const queryParams = new URLSearchParams({
            blockId: block.block_id || block.id || 'AI-BLOCK',
            station: block.station_code || 'NDLS',
            line: block.corridor_id || 'DN-MAIN',
            date: block.planning_date || new Date().toISOString().split('T')[0],
            startTime: block.start_time || '10:00',
            endTime: block.end_time || '14:00',
            dept: block.department || 'TMD'
        });

        navigate(`/simulation?${queryParams.toString()}`);
    };

    const deleteBlock = async (block) => {
        const idToDelete = block.id;

        if (!idToDelete) return;

        if (
            !window.confirm(
                `Are you sure you want to delete block ${
                    block.block_id || block.id
                }?`
            )
        ) {
            return;
        }

        try {
            const { error } = await supabase
                .from('optimized_blocks')
                .delete()
                .eq('id', idToDelete);

            if (!error) {
                setBlocks((prev) => prev.filter((b) => b.id !== idToDelete));
            }
        } catch (err) {
            console.error('Failed to delete block:', err);
        }
    };

    return (
        <div className="space-y-6 pb-12 font-sans bg-white text-black min-h-screen">

            {/* HEADER */}
            <div className="bg-white border border-[#D9D9D9] rounded-xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">

                <div>
                    <div className="flex items-center gap-2 text-xs font-mono text-[#333333] font-bold uppercase mb-1">
                        <Database className="w-4 h-4 text-black" />
                        <span>SUPABASE PERSISTENT BLOCK RECORDS</span>
                    </div>

                    <h1 className="text-xl font-extrabold text-black tracking-tight">
                        SAVED BLOCK SCHEDULE HISTORY
                    </h1>

                    <p className="text-xs text-[#333333] mt-1">
                        Complete history of AI-optimized maintenance blocks saved to Supabase.
                    </p>
                </div>

                <div className="flex items-center gap-2">

                    <button
                        onClick={fetchBlocks}
                        disabled={loading}
                        className="p-2.5 bg-black hover:bg-[#333333] text-white rounded-lg border border-black text-xs font-bold font-mono flex items-center gap-2 transition"
                    >
                        <RefreshCw
                            className={`w-4 h-4 text-white ${loading ? 'animate-spin' : ''}`}
                        />
                        REFRESH
                    </button>

                    <button
                        onClick={() => navigate('/ai-planner')}
                        className="px-4 py-2.5 bg-white border border-[#D9D9D9] hover:bg-[#F5F5F5] text-black text-xs font-bold font-mono rounded-lg transition"
                    >
                        NEW PLANNER RUN
                    </button>

                </div>

            </div>

            {/* FILTERS */}
            <div className="bg-[#F5F5F5] border border-[#D9D9D9] rounded-xl p-4 shadow-sm space-y-3 font-mono">
                <div className="text-[10px] text-black font-bold uppercase tracking-wider">
                    FILTER BY PLANNING DATE
                </div>

                <div className="flex flex-wrap items-center gap-2">

                    <button
                        onClick={() => setSelectedDate('ALL')}
                        className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold ${selectedDate === 'ALL'
                                ? 'bg-black border-black text-white'
                                : 'bg-white border-[#D9D9D9] text-black hover:bg-[#F5F5F5]'
                            }`}
                    >
                        ALL DATES
                    </button>

                    {availableDates.map((date) => (
                        <button
                            key={date}
                            onClick={() => setSelectedDate(date)}
                            className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold ${selectedDate === date
                                    ? 'bg-black border-black text-white'
                                    : 'bg-white border-[#D9D9D9] text-black hover:bg-[#F5F5F5]'
                                }`}
                        >
                            {formatDate(date)}
                        </button>
                    ))}

                    <div className="relative ml-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#808080]" />

                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search block / station..."
                            className="w-64 pl-9 pr-3 py-2 bg-white border border-[#D9D9D9] rounded-lg text-xs text-black outline-none focus:border-black"
                        />
                    </div>

                </div>
            </div>

            {/* DATABASE SUMMARY */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <div className="bg-white border border-[#D9D9D9] rounded-xl p-5 shadow-sm">
                    <div className="text-[10px] text-[#808080] font-mono font-bold uppercase">
                        TOTAL SAVED BLOCKS
                    </div>

                    <div className="text-2xl text-black font-bold mt-1">
                        {blocks.length}
                    </div>
                </div>

                <div className="bg-white border border-[#D9D9D9] rounded-xl p-5 shadow-sm">
                    <div className="text-[10px] text-[#808080] font-mono font-bold uppercase">
                        FILTERED BLOCKS
                    </div>

                    <div className="text-2xl text-black font-bold mt-1">
                        {filteredBlocks.length}
                    </div>
                </div>

                <div className="bg-white border border-[#D9D9D9] rounded-xl p-5 shadow-sm">
                    <div className="text-[10px] text-[#808080] font-mono font-bold uppercase">
                        DATABASE STATUS
                    </div>

                    <div className="flex items-center gap-2 text-black font-bold text-sm mt-2">
                        <CheckCircle2 className="w-4 h-4 text-black" />
                        PERSISTENT
                    </div>
                </div>

            </div>

            {/* TABLE */}
            <div className="bg-white border border-[#D9D9D9] rounded-xl overflow-hidden shadow-sm">

                <div className="px-5 py-4 border-b border-[#D9D9D9] flex items-center justify-between">

                    <div className="flex items-center gap-2">
                        <Database className="w-5 h-5 text-black" />
                        <h2 className="text-sm font-bold text-black font-mono">
                            DATABASE RECORDS
                        </h2>
                    </div>

                    <span className="text-[10px] text-[#808080] font-mono font-bold">
                        {filteredBlocks.length} RECORDS
                    </span>

                </div>

                {loading ? (
                    <div className="py-16 text-center text-black font-mono">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-black" />
                        Loading saved block schedules...
                    </div>
                ) : filteredBlocks.length === 0 ? (
                    <div className="py-16 text-center text-[#808080] font-mono">
                        <Database className="w-10 h-10 mx-auto mb-3 opacity-40 text-black" />
                        <p className="text-sm">
                            No saved block schedules found.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">

                        <table className="w-full text-left">

                            <thead>
                                <tr className="border-b border-[#D9D9D9] bg-[#F5F5F5] text-[10px] text-black font-mono font-bold">
                                    <th className="px-5 py-3">BLOCK ID</th>
                                    <th className="px-5 py-3">DATE</th>
                                    <th className="px-5 py-3">LOCATION</th>
                                    <th className="px-5 py-3">TIME</th>
                                    <th className="px-5 py-3">STATUS</th>
                                    <th className="px-5 py-3">ACTIONS</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-[#D9D9D9]">

                                {filteredBlocks.map((block) => {

                                    const blockId =
                                        block.block_id ||
                                        block.id ||
                                        'AI-BLOCK';

                                    return (
                                        <tr
                                            key={block.id || block.block_id}
                                            className="hover:bg-[#F5F5F5] transition-colors"
                                        >

                                            <td className="px-5 py-4">
                                                <div className="font-bold text-black text-xs font-mono">
                                                    {blockId}
                                                </div>

                                                <div className="text-[9px] text-[#808080] mt-1 font-mono">
                                                    SUPABASE RECORD
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2 text-black text-xs font-mono">
                                                    <Calendar className="w-3.5 h-3.5 text-black" />
                                                    {formatDate(block.planning_date)}
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2 text-black text-xs font-mono">
                                                    <MapPin className="w-3.5 h-3.5 text-black" />
                                                    {block.station_code || '—'}
                                                </div>

                                                <div className="text-[9px] text-[#808080] mt-1 font-mono">
                                                    {block.division || '—'} • {block.zone || '—'}
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2 text-black text-xs font-mono">
                                                    <Clock className="w-3.5 h-3.5 text-black" />
                                                    {formatTime(block.start_time)}
                                                    {' → '}
                                                    {formatTime(block.end_time)}
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span
                                                    className={`px-2 py-1 rounded border text-[9px] font-bold ${getStatusClass(
                                                        block.status
                                                    )}`}
                                                >
                                                    {block.status || 'SCHEDULED'}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">

                                                <div className="flex items-center gap-2 font-mono">

                                                    <button
                                                        onClick={() =>
                                                            navigate(
                                                                `/simulation?blockId=${encodeURIComponent(
                                                                    blockId
                                                                )}`
                                                            )
                                                        }
                                                        className="px-3 py-1.5 rounded-lg bg-white border border-[#D9D9D9] hover:bg-[#F5F5F5] text-black text-[10px] font-bold flex items-center gap-1.5"
                                                    >
                                                        <Eye className="w-3 h-3 text-black" />
                                                        VIEW
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            openSimulation(block)
                                                        }
                                                        className="px-3 py-1.5 rounded-lg bg-black hover:bg-[#333333] text-white text-[10px] font-bold flex items-center gap-1.5"
                                                    >
                                                        <Train className="w-3.5 h-3.5 text-white" />
                                                        SIMULATE
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            deleteBlock(block)
                                                        }
                                                        className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#F5F5F5] border border-black text-black text-[10px] font-bold flex items-center gap-1.5"
                                                    >
                                                        <Trash2 className="w-3 h-3 text-black" />
                                                        DELETE
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>
                                    );
                                })}

                            </tbody>

                        </table>

                    </div>
                )}

            </div>

        </div>
    );
}