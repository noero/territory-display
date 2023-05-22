# territory-display
Un site internet permettant aux proclamateurs d'une assemblée d'accéder aux territoires de prédication.

## Installation
Pour utiliser ce site web, copier l'ensemble des fichiers de ce répertoire et les coller dans le dossier de votre serveur web.

### Voici l'arborescence du projet :
```
┌─ index.html
├─ admin.html
├─ 404.html
├─ .htaccess
├─ geoJson
│   ├─ Territoires.kml    # À créer
│   ├─ Commerces.kml      # À créer
│   ├─ Campagnes.kml      # À créer
│   └─ PANPV.csv          # À compléter
├─ img
│   └─ osm.png
├─ js
│   ├─ main.js
│   ├─ admin.js
│   ├─ togeojson.js
│   ├─ URI.js
│   ├─ maplibre-gl.js
│   └─ ...
├─ css
│   ├─ main.css
│   ├─ admin.css
│   ├─ maplibre-gl.css
│   └─ ...
├─ style-map
│   ├─ here.json
│   ├─ satellite.json
│   └─ street.json
└─ vendor
    └─ ...
```

### Création des territoires

Il existe trois types de territoires disponibles : 
* les territoires normaux (dans le fichier Territoires.kml)
* les territoires de commerces (dans le fichiers Commerces.kml)
* les territoires de campagnes d'invitation (dans le fichiers Campagnes.kml)

Pour les créer, tu as la possibilité de te rendre sur le site de [Google My Maps](https://www.google.com/maps/d/u/0/?hl=fr) où tu pourra te connecter avec ton compte gmail.

Une fois sur place, suis les étapes suivantes :

1. Créer une nouvelle carte
2. Dans la partie 'Carte sans titre', renommer par 'Territoires de mon assemblée' par exemple
3. Dans la partie 'Calque sans titre' (tu peux d'ailleurs le renommer 'Territoires', 'Commerces' ou 'Campagnes'), accèder aux options (les 3 points) et ouvrir le tableau de données
4. Ajouter 2 colonnes supplémentaires :
   - 'number' de type nombre
   - 'infos' de type texte 
5. Le premier élément dans le calque doit être les délimitations globales du territoire de ton assemblée
   - Tu trouveras sur le site JW.org, dans le domaine de ton assemblée, le fichier KML correspondant aux délimitations de territoire de ton assemblée
   - Après l'avoir télécharger, importe-le dans le calque de ta carte 
     - Accèder aux options (les 3 points), 'Réimporter et fusionner' puis 'Ajouter d'autres éléments'
6. Créer à la suite dans ce calque, des polygones fermés correspondant aux différents territoires en utilisant l'outils 'Tracer une ligne'
   - Lors de la création d'un territoire, renseigner son nom et son numéro (le numéro doit être différent pour chaque territoire d'un même type). La description et les infos sont facultatives.
7. Pour créer les territoires de type commerces ou campagnes, le faire dans un autre calque
   - Ajouter un calque et reprendre les étapes 3 à 6
8. Extraire un fichier KML pour chaque calque
   - Accèder aux options du calque (les 3 points) et exporter les données au format KML (option : Exporter au format KML au lieu de KMZ (toutes les icônes ne sont pas compatibles)
   - Les nommer obligatoirement comme vue dans l'arborescence (respecter la casse)
9. Intégrer ces fichiers KML dans le dossier geoJson en remplaçant ceux déjà en place (faire une sauvegarde de ceux déjà présents lorsqu'il s'agit d'une mise à jour)


### Personnes à ne pas visiter

Pour renseigner les personnes à ne pas visiter, remplir et garder à jour le fichier PANPV.csv présent dans le dossier 'geoJson'.
Ce fichier utilise les colonnes suivantes : 

- Ville : nom de la ville
- Territoires : numéro du territoire de maison en maison dans lequel se trouve la personne
- Commerces : numéro du territoire de commerces dans lequel se trouve la personne
- Campagnes : numéro du territoire de campagne d'invitations dans lequel se trouve la personne
- Adresse : l'adresse de la personne
- Dernière date : la dernière date à laquelle la personne a exprimé son souhait de ne plus être visitée

Exemple :
| Ville | Territoires | Commerces | Campagnes |    Adresse    | Dernière date |
|-------|-------------|-----------|-----------|---------------|---------------|
| PARIS |     24      |           |    3      | 4 rue Paradis |   28/02/2022  |


## Utilisation

La partie Administrateur permet de :
- voir l'ensemble des territoires
- exporter tous les territoires d'un même type simultanément
- ouvrir un territoire spécifique au format soit numérique (page internet) soit PDF
- copier le lien internet d'un territoire pour pouvoir le transmettre à un proclamateur via l'application de ton choix

Sur la page d'un territoire, le proclamateur peut :
- changer le fond de carte (openstreetmap, satellite ou here)
- voir les personnes à ne pas visiter
- télécharger le PDF du territoire (à venir)
