import { CalendarEvent } from '../types';

const LOCAL_STORAGE_KEY_EVENTS = 'byete_calendar_events';

export const getEvents = (): CalendarEvent[] => {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY_EVENTS);
    return data ? JSON.parse(data) : [];
};

export const saveEvent = (event: CalendarEvent): CalendarEvent => {
    const events = getEvents();
    const existingIdx = events.findIndex(e => e.id === event.id);
    
    if (existingIdx > -1) {
        events[existingIdx] = event;
    } else {
        events.push(event);
    }
    
    localStorage.setItem(LOCAL_STORAGE_KEY_EVENTS, JSON.stringify(events));
    return event;
};

export const deleteEvent = (id: string): void => {
    const events = getEvents();
    const filtered = events.filter(e => e.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY_EVENTS, JSON.stringify(filtered));
};