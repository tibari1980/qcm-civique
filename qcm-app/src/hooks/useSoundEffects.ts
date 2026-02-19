'use client';

import { useCallback, useRef, useEffect } from 'react';

export const useSoundEffects = () => {
    const audioContextRef = useRef<AudioContext | null>(null);

    useEffect(() => {
        // Initialize AudioContext only on client side and on user interaction if possible, 
        // but here we prepare it. Browsers might block until interaction.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
            audioContextRef.current = new AudioContextClass();
        }
    }, []);

    const playSound = useCallback((type: 'success' | 'error' | 'click' | 'finish') => {
        if (!audioContextRef.current) return;

        // Resume context if suspended (browser policy)
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }

        const ctx = audioContextRef.current;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        const now = ctx.currentTime;

        if (type === 'success') {
            // High pitched major triad arpeggio
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(523.25, now); // C5
            oscillator.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5
            oscillator.frequency.exponentialRampToValueAtTime(783.99, now + 0.2); // G5

            gainNode.gain.setValueAtTime(0.3, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

            oscillator.start(now);
            oscillator.stop(now + 0.4);

        } else if (type === 'error') {
            // Low pitched slightly dissonant square wave
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(150, now);
            oscillator.frequency.linearRampToValueAtTime(100, now + 0.3);

            gainNode.gain.setValueAtTime(0.3, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

            oscillator.start(now);
            oscillator.stop(now + 0.3);

        } else if (type === 'click') {
            // Short high blip
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(800, now);

            gainNode.gain.setValueAtTime(0.1, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

            oscillator.start(now);
            oscillator.stop(now + 0.1);

        } else if (type === 'finish') {
            // Victory fanfareish
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(523.25, now); // C5
            oscillator.frequency.setValueAtTime(659.25, now + 0.1); // E5
            oscillator.frequency.setValueAtTime(783.99, now + 0.2); // G5
            oscillator.frequency.setValueAtTime(1046.50, now + 0.4); // C6

            gainNode.gain.setValueAtTime(0.3, now);
            gainNode.gain.linearRampToValueAtTime(0.3, now + 0.5);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.0);

            oscillator.start(now);
            oscillator.stop(now + 1.0);
        }

    }, []);

    return { playSound };
};
