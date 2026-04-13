export interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    author: string;
    date: string;
    readTime: string;
    category: string;
    imageUrl?: string;
}

export const BLOG_POSTS: BlogPost[] = [
    {
        id: '1',
        slug: 'combien-de-temps-dure-la-demarche-de-naturalisation-en-2026',
        title: 'Combien de temps dure la démarche de naturalisation en 2026 ?',
        excerpt: 'Découvrez les délais officiels et réels pour obtenir la nationalité française en 2026, de la constitution du dossier à la cérémonie d\'accueil.',
        content: `
## Les délais officiels vs la réalité de 2026

La procédure de naturalisation est souvent considérée comme un marathon. Officiellement, l\'administration dispose de **18 mois** pour répondre à une demande à partir de la remise du récépissé de complétude (ou 12 mois si vous résidez en France depuis plus de 10 ans).

Cependant, en 2026, avec la numérisation complète via la plateforme NATALI, les délais ont évolué.

### 1. Le dépôt du dossier (NATALI)
Aujourd'hui, tout se fait en ligne. Si votre dossier est incomplet, le système vous le notifie très rapidement (souvent dans les semaines qui suivent). C'est un gain de temps considérable par rapport aux anciens dossiers papier.

### 2. Du récépissé à l'entretien d'assimilation
C'est ici que l'attente est la plus variable selon les préfectures. Dans certaines préfectures (comme la préfecture de Police de Paris), le délai d'attente pour obtenir une date d'entretien peut varier **entre 6 et 14 mois**. Ne perdez pas ce temps ! C'est le moment idéal pour utiliser **CiviqQuiz** et vous préparer à l'examen civique.

### 3. De l'entretien à la décision finale
Après votre entretien, le dossier part au Ministère de l'Intérieur (SDANF - Sous-Direction de l'Accès à la Nationalité Française), souvent appelé "Rezé". Cette étape dure généralement **entre 4 et 6 mois**. Ensuite, le Service Central d'État Civil (SCEC) vérifie votre état civil (environ 2 à 4 mois supplémentaires).

### 4. La parution au Journal Officiel (JO)
Une fois votre état civil validé, votre nom apparaîtra sur un décret de naturalisation au Journal Officiel. C'est le moment où vous devenez officiellement Français(e) !

### Comment accélérer les choses ?
Vous ne pouvez pas forcer l'administration à aller plus vite, mais vous pouvez éviter qu'elle vous retarde. Comment ?
- En fournissant des documents parfaitement traduits et récents.
- En réussissant brillamment votre entretien d'assimilation, pour montrer que votre dossier est solide.

La préparation est la clé du succès. N'attendez pas la convocation pour commencer vos révisions sur l'Académie Civique !
        `,
        author: 'L\'équipe CiviqQuiz',
        date: '2026-04-10',
        readTime: '4 min',
        category: 'Démarches',
    },
    {
        id: '2',
        slug: 'comment-reussir-son-entretien-d-assimilation',
        title: 'Comment réussir son entretien de naturalisation à tous les coups',
        excerpt: 'L\'entretien d\'assimilation est l\'épreuve la plus redoutée. Voici les 5 conseils ultimes pour prouver votre adhésion aux valeurs de la République.',
        content: `
## L'entretien de naturalisation : Plus qu'un simple QCM

L'entretien d'assimilation n'est pas un examen piège. L'agent de préfecture n'est pas là pour trouver la faille, mais pour vérifier deux choses fondamentales :
1. Vous parlez un français suffisant pour la vie quotidienne.
2. Vous adhérez aux principes et valeurs de la République française, et vous en connaissez l'histoire de base.

Voici les 5 règles d'or pour réussir cet exercice oral.

### 1. Connaître le "Livret du Citoyen" sur le bout des doigts
C'est indispensable. Ce livret contient 80% des réponses aux questions que l'on vous posera. Sur **CiviqQuiz**, nos QCM et l'intelligence artificielle se basent sur ce livret pour vous préparer au mieux.

### 2. Préparez vos motivations
La première question de l'entretien est presque toujours : *"Pourquoi voulez-vous devenir Français(e) ?"*
"Avoir un passeport pour voyager" n'est pas une bonne réponse. L'agent attend de vous une réponse sincère liée à l'adhésion aux valeurs, à l'attachement au pays, à la volonté de voter et de participer activement à la vie civique de la nation. Préparez cette réponse à l'avance.

### 3. Maîtriser l'actualité politique et sociale
Qui est l'actuel Président de la République ? Le Premier Ministre ? Le Maire de votre ville ? Quels sont les gros sujets d'actualité en France en ce moment ? L'agent veut s'assurer que vous êtes intégré(e) dans la société et que vous suivez sa vie démocratique. Lisez les informations les semaines précédant l'entretien.

### 4. Attention à la laïcité et l'égalité
Ce sont les deux piliers sur lesquels l'agent sera particulièrement intransigeant. Vous devez comprendre ce qu'est la laïcité (la stricte neutralité de l'État en matière religieuse et la liberté de croire ou de ne pas croire) et affirmer l'égalité absolue entre les hommes et les femmes.

### 5. Entraînez-vous à voix haute
Comprendre le livret est une chose. Être capable de répondre du tac au tac avec le stress face à un agent de l'État en est une autre. Utilisez la fonctionnalité de **Simulation Vocale** de CiviqQuiz ! Répéter vos réponses à voix haute vous donnera une assurance redoutable le jour J.
        `,
        author: 'L\'équipe CiviqQuiz',
        date: '2026-03-22',
        readTime: '6 min',
        category: 'Conseils & Astuces',
    },
    {
        id: '3',
        slug: 'les-7-dates-incontournables-de-l-histoire-de-france',
        title: 'Les 7 dates incontournables de l\'Histoire de France',
        excerpt: 'De la Révolution Française à l\'abolition de l\'esclavage, révisez les 7 dates que vous devez absolument mémoriser pour votre examen.',
        content: `
## Ces dates que vous devez savoir placer sur une frise !

L'Histoire de France est millénaire, mais pour l'examen de naturalisation ou la carte de résident, l'administration concentre ses questions sur quelques événements profondément fondateurs pour la République.

Voici le top 7 des dates à graver dans votre mémoire.

### 1. 1789 : La Révolution Française
C'est le point de départ de la France moderne. Le 14 juillet 1789, avec la Prise de la Bastille, le peuple se soulève contre la monarchie absolue. Le 26 août de la même année est rédigée la *Déclaration des Droits de l'Homme et du Citoyen*.

### 2. 1848 : Abolition de l'esclavage et Suffrage Universel Masculin
L'esclavage est définitivement aboli dans les colonies françaises grâce à Victor Schœlcher. C'est également l'année où est instauré le suffrage universel (pour les hommes).

### 3. 1881-1882 : Les lois Jules Ferry
Ces lois rendent l'école **gratuite, laïque et obligatoire**. C'est un pilier fondamental de la République qui vise à éduquer tous les enfants de manière égale, peu importe leur origine sociale ou leur religion.

### 4. 1905 : Séparation des Églises et de l'État
La loi fondatrice de la laïcité française telle qu'on la conçoit aujourd'hui. L'État ne reconnaît, ne salarie ni ne subventionne aucun culte.

### 5. 1944 : Le Droit de vote des femmes
La France a été plutôt tardive sur ce point par rapport à d'autres pays européens, mais c'est en 1944 par ordonnance du Général de Gaulle que les femmes obtiennent enfin le droit de voter et d'être élues. Elles voteront pour la première fois en 1945.

### 6. 1958 : La Cinquième République
Création de notre système politique actuel, sous l'impulsion de Charles de Gaulle. C'est un système semi-présidentiel qui donne un pouvoir exécutif fort au Président de la République.

### 7. 1981 : Abolition de la peine de mort
Portée par le ministre de la Justice Robert Badinter sous la présidence de François Mitterrand, la loi abolissant la peine de mort est une étape cruciale pour les droits de l'homme en France.

Pour tester si vous avez bien retenu ces dates, lancez directement une session d'entraînement sur le module **Histoire de France** dans votre Académie CiviqQuiz !
        `,
        author: 'L\'équipe CiviqQuiz',
        date: '2026-03-10',
        readTime: '5 min',
        category: 'Histoire & Culture',
    }
];
