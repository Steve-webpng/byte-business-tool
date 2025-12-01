
import { Automation } from '../types';

const STORAGE_KEY = 'byete_automations';

export const getAutomations = (): Automation[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
};

export const saveAutomation = (automation: Automation) => {
    const list = getAutomations();
    const idx = list.findIndex(a => a.id === automation.id);
    if (idx > -1) list[idx] = automation;
    else list.push(automation);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
};

export const deleteAutomation = (id: string) => {
    const list = getAutomations().filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
};

// Mock background runner (would be a real worker in production)
export const checkTriggers = () => {
    console.log("Checking automation triggers...");
};
