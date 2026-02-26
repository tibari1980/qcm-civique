# Guide Git : Pousser sur plusieurs branches (main, master, principal)

Ce guide explique comment mettre à jour simultanément les trois branches principales utilisées pour le déploiement Cloudflare.

## Étapes pour pousser votre travail

### 1. Préparer vos modifications
Ajoutez tous vos fichiers modifiés ou nouveaux à l'index Git :
```powershell
git add .
```

### 2. Créer un commit
Enregistrez vos modifications avec un message descriptif :
```powershell
git commit -m "votre message de commit ici"
```

### 3. Pousser sur les trois branches
Pour s'assurer que Cloudflare détecte les changements sur toutes les branches de déploiement (main, master, et principal), exécutez ces commandes :

```powershell
# Pousser sur la branche main
git push origin HEAD:main

# Pousser sur la branche master
git push origin HEAD:master

# Pousser sur la branche principal
git push origin HEAD:principal
```

> **Note :** `HEAD` fait référence à votre commit actuel local. Cette syntaxe permet de pousser votre travail actuel vers n'importe quelle branche distante, même si vous n'êtes pas sur cette branche localement.

## Commande groupée (en une seule ligne)
Vous pouvez copier-coller cette commande pour aller plus vite :
```powershell
git push origin HEAD:main; git push origin HEAD:master; git push origin HEAD:principal
```

## Vérification Cloudflare
Une fois les commandes exécutées :
1. Allez sur votre tableau de bord Cloudflare Pages.
2. Un nouveau build devrait apparaître pour chaque branche dans les 1 à 2 minutes.
