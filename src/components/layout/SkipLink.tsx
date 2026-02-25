/**
 * SkipLink — Lien "Aller au contenu principal"
 * Visible uniquement au focus clavier (transparent sinon).
 * WCAG 2.4.1 — Bypass Blocks
 * Compatible NVDA / JAWS / VoiceOver
 */
export function SkipLink() {
    return (
        <a
            href="#main-content"
            className={[
                'fixed top-2 left-2 z-[9999]',
                'px-4 py-2 rounded-md text-sm font-semibold',
                'bg-[var(--color-primary)] text-white',
                'translate-y-[-200%] focus:translate-y-0',
                'transition-transform duration-150',
                'outline-2 outline-offset-2 outline-white',
                'focus:outline',
            ].join(' ')}
        >
            Aller au contenu principal
        </a>
    );
}
