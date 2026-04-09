export type FirestoreTheme = 'vals_principes' | 'histoire' | 'geographie' | 'institutions' | 'societe' | 'droits' | 'naturalisation';

export const THEMES: FirestoreTheme[] = [
    'vals_principes',
    'histoire',
    'geographie',
    'institutions',
    'societe',
    'droits',
    'naturalisation'
];

export const THEME_LABELS: Record<FirestoreTheme, string> = {
    vals_principes: 'Valeurs & Principes',
    histoire: 'Histoire de France',
    geographie: 'Géographie',
    institutions: 'Institutions',
    societe: 'Vie en Société',
    droits: 'Droits et Devoirs',
    naturalisation: 'Naturalisation',
};

export const LEVELS = ['Débutant', 'Intermédiaire', 'Avancé'];

export const CECRL_TO_DB_LEVEL: Record<string, string | null> = {
    A1: null,
    A2: 'Débutant',
    B1: 'Intermédiaire',
    B2: 'Avancé',
};


