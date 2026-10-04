import React, { useEffect, useState } from 'react';
import { getEvents } from '../api';

const EventSelector = ({ selectedEvent, onEventSelect }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await getEvents();
                setEvents(data.events || []);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    return (
        <div className="w-full">
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
                1. Event Type
            </label>
            {loading ? (
                <div className="animate-pulse bg-neutral-100 h-11 rounded-xl w-full"></div>
            ) : error ? (
                <div className="text-red-500 text-sm">Failed to load events</div>
            ) : (
                <div className="relative">
                    <select
                        value={selectedEvent}
                        onChange={(e) => onEventSelect(e.target.value)}
                        className="appearance-none w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all cursor-pointer font-medium text-sm"
                    >
                        <option value="" disabled className="text-neutral-400">Select event type...</option>
                        {events.map((event) => (
                            <option key={event.id} value={event.id} className="text-neutral-900">
                                {event.label}
                            </option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-neutral-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventSelector;
