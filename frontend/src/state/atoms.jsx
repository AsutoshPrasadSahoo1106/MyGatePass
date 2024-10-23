import { atom } from 'recoil';

// Atom to store the current user's information
export const userState = atom({
    key: 'userState', // unique ID (with respect to other atoms/selectors)
    default: null, // default value (aka initial value)
});

// Atom to store the list of gate passes
export const gatePassesState = atom({
    key: 'gatePassesState',
    default: [], // Default state for gate passes
});

// Atom to manage loading state for fetching gate passes
export const gatePassesLoadingState = atom({
    key: 'gatePassesLoadingState',
    default: false, // Indicates whether gate passes are being loaded
});

// Atom to manage error state for fetching gate passes
export const gatePassesErrorState = atom({
    key: 'gatePassesErrorState',
    default: null, // Stores error messages, if any
});
