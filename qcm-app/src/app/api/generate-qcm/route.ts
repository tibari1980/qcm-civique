import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
type NiveauCECRL = 'A1' | 'A2' | 'B1' | 'B2';
type ThemeQCM = 'vie_quotidienne' | 'administration' | 'civique' | 'travail' | 'voyage' | 'famille';
type ModuleQCM = 'general' | 'carte_sejour_A2' | 'carte_resident_B1' | 'nationalite_B2';

interface GeminiQuestion {
    id: number;
    question: string;
    type: string;
    options: string[];
    correcte: number; // 0-indexed
    explication: string;
    competence: string;
    difficulté: string;
}

interface GeminiResponse {
    metadata: {
        niveau: string;
        theme: string;
        module: string;
        nb_questions: number;
        duree_recommandee: string;
        seuil_reussite: number;
    };
    questions: GeminiQuestion[];
}

/* ─────────────────────────────────────────────
   Whitelist de validation
───────────────────────────────────────────── */
const VALID_NIVEAUX: NiveauCECRL[] = ['A1', 'A2', 'B1', 'B2'];
const VALID_THEMES: ThemeQCM[] = ['vie_quotidienne', 'administration', 'civique', 'travail', 'voyage', 'famille'];
const VALID_MODULES: ModuleQCM[] = ['general', 'carte_sejour_A2', 'carte_resident_B1', 'nationalite_B2'];

/* ─────────────────────────────────────────────
   Prompt PROFESSEUR_FLE_CIVIQUE
───────────────────────────────────────────── */
function buildPrompt(niveau: NiveauCECRL, theme: ThemeQCM, moduleQCM: ModuleQCM): string {
    return `Tu es PROFESSEUR_FLE_CIVIQUE, un expert en Français Langue Étrangère (FLE) certifié pour préparer les étrangers aux examens administratifs français.

PARAMÈTRES :
- NIVEAU : ${niveau}
- THÈME : ${theme}
- MODULE : ${moduleQCM}
- LANGUE : français uniquement

RÈGLES STRICTES par NIVEAU CECRL :

A1 (Débutant) : Phrases très courtes (5-8 mots), vocabulaire 500 mots de base, grammaire être/avoir/présent, thèmes se présenter/chiffres/maison.

A2 (Élémentaire - Carte de séjour) : Phrases simples (8-12 mots), passé composé, futur proche, négation, situations préfecture/formulaires, vocabulaire administratif simple.

B1 (Intermédiaire - Carte résident) : Phrases moyennes (12-20 mots), passé/imparfait, conditionnel, pronoms relatifs, thèmes travail/école/santé/CAF/impôts.

B2 (Autonome - Naturalisation) : Textes 100-150 mots, phrases complexes, subjonctif, discours indirect, thèmes civiques/histoire France/valeurs République/institutions.

Génère EXACTEMENT 10 questions QCM en JSON strict selon ce format :

{
  "metadata": {
    "niveau": "${niveau}",
    "theme": "${theme}",
    "module": "${moduleQCM}",
    "date_generation": "${new Date().toISOString().slice(0, 10)}",
    "nb_questions": 10,
    "duree_recommandee": "15 minutes",
    "seuil_reussite": 70
  },
  "questions": [
    {
      "id": 1,
      "question": "Texte de la question ?",
      "type": "qcm4",
      "options": ["Réponse A", "Réponse B", "Réponse C", "Réponse D"],
      "correcte": 0,
      "explication": "Explication pédagogique de 30-60 mots. Règle clé et erreur fréquente.",
      "competence": "Grammaire|Vocabulaire|Compréhension|Civique",
      "difficulté": "facile|moyen|difficile"
    }
  ]
}

RÈGLES ABSOLUES :
1. "correcte" est l'INDEX (0, 1, 2 ou 3) de la bonne réponse dans "options"
2. 1 seule réponse correcte par question
3. 4 options toujours (A B C D), position aléatoire de la bonne réponse
4. Explications courtes, positives, pédagogiques pour adultes non-francophones
5. Variété : 40% grammaire, 30% vocabulaire, 20% compréhension, 10% civique
6. Questions inspirées TCF/DELF + examen OFII
7. Retourne UNIQUEMENT le JSON, sans markdown, sans commentaires.`;
}

/* ─────────────────────────────────────────────
   Nettoyage options (retire "A) " "B) " etc.)
───────────────────────────────────────────── */
function cleanOptions(options: string[]): string[] {
    return options.map(opt => opt.replace(/^[A-D]\)\s*/i, '').trim());
}

/* ─────────────────────────────────────────────
   Validation du JSON retourné par Gemini
───────────────────────────────────────────── */
function validateGeminiResponse(data: unknown): GeminiResponse {
    const d = data as GeminiResponse;
    if (!d.questions || !Array.isArray(d.questions)) {
        throw new Error('Le champ "questions" est manquant ou invalide');
    }
    if (d.questions.length < 5) {
        throw new Error(`Pas assez de questions générées : ${d.questions.length}`);
    }
    for (const q of d.questions) {
        if (!q.question || typeof q.question !== 'string') throw new Error(`Question invalide : ${q.id}`);
        if (!Array.isArray(q.options) || q.options.length < 2) throw new Error(`Options invalides pour Q${q.id}`);
        if (typeof q.correcte !== 'number' || q.correcte < 0 || q.correcte >= q.options.length) {
            throw new Error(`Index correct invalide pour Q${q.id}: ${q.correcte}`);
        }
    }
    return d;
}

/* ─────────────────────────────────────────────
   API Route Handler
───────────────────────────────────────────── */
export async function POST(request: NextRequest) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
        return NextResponse.json(
            { error: 'GEMINI_API_KEY non configurée. Ajoutez-la dans .env.local' },
            { status: 500 }
        );
    }

    let body: { niveau?: string; theme?: string; module?: string };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Corps de requête JSON invalide' }, { status: 400 });
    }

    const { niveau, theme, module: moduleQCM } = body;

    // Validation whitelist
    if (!niveau || !VALID_NIVEAUX.includes(niveau as NiveauCECRL)) {
        return NextResponse.json({ error: `Niveau invalide. Valeurs : ${VALID_NIVEAUX.join(', ')}` }, { status: 400 });
    }
    if (!theme || !VALID_THEMES.includes(theme as ThemeQCM)) {
        return NextResponse.json({ error: `Thème invalide. Valeurs : ${VALID_THEMES.join(', ')}` }, { status: 400 });
    }
    if (!moduleQCM || !VALID_MODULES.includes(moduleQCM as ModuleQCM)) {
        return NextResponse.json({ error: `Module invalide. Valeurs : ${VALID_MODULES.join(', ')}` }, { status: 400 });
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
            generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.85,
                maxOutputTokens: 4096,
            }
        });

        const prompt = buildPrompt(
            niveau as NiveauCECRL,
            theme as ThemeQCM,
            moduleQCM as ModuleQCM
        );

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        let parsed: unknown;
        try {
            parsed = JSON.parse(text);
        } catch {
            // Tentative de nettoyage si Gemini a ajouté des backticks markdown
            const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            parsed = JSON.parse(cleaned);
        }

        const validated = validateGeminiResponse(parsed);

        // Transformer au format Question existant de l'app
        const questions = validated.questions.map((q, i) => ({
            id: `ai-${Date.now()}-${i}`,
            question: q.question,
            choices: cleanOptions(q.options),
            correct_index: q.correcte,
            explanation: q.explication,
            theme: theme,
            level: niveau,
            competence: q.competence || 'Général',
            difficulte: q.difficulté || 'moyen',
            aiGenerated: true,
        }));

        return NextResponse.json({
            questions,
            metadata: {
                ...validated.metadata,
                niveau,
                theme,
                module: moduleQCM,
            }
        });

    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Erreur inconnue';
        console.error('[generate-qcm] Erreur Gemini:', msg);
        return NextResponse.json(
            { error: `Erreur lors de la génération : ${msg}` },
            { status: 500 }
        );
    }
}

// Rejeter les autres méthodes HTTP
export async function GET() {
    return NextResponse.json({ error: 'Méthode non autorisée' }, { status: 405 });
}
