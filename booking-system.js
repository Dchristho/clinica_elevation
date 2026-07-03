

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyBorH5wyzvgokCQph6mWBnRMSWsoGQ_kao",
    authDomain: "clinica-elevation.firebaseapp.com",
    databaseURL: "https://clinica-elevation-default-rtdb.firebaseio.com",
    projectId: "clinica-elevation",
    storageBucket: "clinica-elevation.firebasestorage.app",
    messagingSenderId: "32138513541",
    appId: "1:32138513541:web:1f06a6452867a834adadec"
};

// ===================================================
//  NÃO MODIFIQUE ABAIXO DESTA LINHA
// ===================================================

(function () {
    'use strict';

    // Global state
    window._appointmentsCache = [];
    window._firebaseReady = false;

    function isConfigured() {
        return FIREBASE_CONFIG.apiKey &&
            !FIREBASE_CONFIG.apiKey.startsWith('SEU_') &&
            FIREBASE_CONFIG.databaseURL &&
            !FIREBASE_CONFIG.databaseURL.includes('SEU_PROJETO');
    }

    // ── Firebase Mode ───────────────────────────────
    if (isConfigured() && typeof firebase !== 'undefined') {
        try {
            // Initialize Firebase (only once)
            if (!firebase.apps.length) {
                firebase.initializeApp(FIREBASE_CONFIG);
            }
            const db = firebase.database();
            window._firebaseReady = true;

            console.log('✅ Booking System: Firebase conectado com sucesso.');

            // Real-time listener — keeps local cache always in sync
            db.ref('appointments').on('value', (snapshot) => {
                const data = snapshot.val();
                if (!data) {
                    window._appointmentsCache = [];
                } else {
                    window._appointmentsCache = Object.entries(data).map(([key, val]) => ({
                        ...val,
                        _key: key
                    }));
                }
                // Notify any listening page (e.g. agendamentos.html)
                window.dispatchEvent(new CustomEvent('appointments-updated', {
                    detail: window._appointmentsCache
                }));
            });

            // Save a new appointment to the cloud
            window.saveAppointment = function (data) {
                return db.ref('appointments').push(data);
            };

            // Delete an appointment by its Firebase key
            window.removeAppointment = function (key) {
                return db.ref('appointments/' + key).remove();
            };

            // Get the current cached list (synchronous)
            window.getAppointments = function () {
                return [...window._appointmentsCache];
            };

        } catch (error) {
            console.error('❌ Firebase initialization failed:', error);
            initLocalStorageFallback();
        }
    } else {
        // ── LocalStorage Fallback Mode ──────────────
        if (!isConfigured()) {
            console.warn('⚠️ Booking System: Firebase não configurado. Usando armazenamento local (os dados NÃO sincronizam entre dispositivos). Configure o arquivo booking-system.js.');
        }
        initLocalStorageFallback();
    }

    function initLocalStorageFallback() {
        window._firebaseReady = false;

        window.getAppointments = function () {
            return JSON.parse(localStorage.getItem('confirmed_appointments') || '[]');
        };

        window.saveAppointment = function (data) {
            const appointments = window.getAppointments();
            appointments.push(data);
            localStorage.setItem('confirmed_appointments', JSON.stringify(appointments));
            window._appointmentsCache = appointments;
            window.dispatchEvent(new CustomEvent('appointments-updated', {
                detail: appointments
            }));
            return Promise.resolve();
        };

        window.removeAppointment = function (indexOrKey) {
            const appointments = window.getAppointments();
            if (typeof indexOrKey === 'number') {
                appointments.splice(indexOrKey, 1);
            }
            localStorage.setItem('confirmed_appointments', JSON.stringify(appointments));
            window._appointmentsCache = appointments;
            window.dispatchEvent(new CustomEvent('appointments-updated', {
                detail: appointments
            }));
            return Promise.resolve();
        };

        // Load initial data
        window._appointmentsCache = window.getAppointments();
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent('appointments-updated', {
                detail: window._appointmentsCache
            }));
        }, 100);
    }

})();
