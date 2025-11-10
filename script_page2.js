class CPage2 {
    aRacesData;
    aTextes; 
    aRaceSelectionnee = null;

    // L'ID du filtre actif, utilisé pour l'affichage de la liste
    aFiltreActif = 'tout'; 

    constructor() {
        this.mInitialiserPage();
    }

    /**
     * @brief Charge les fichiers JSON nécessaires (races.json et page2.json).
     */
    async mChargerDonnees() {
        try {
            // 1. Chargement des données de Race
            const vResponseRaces = await fetch('races.json');
            this.aRacesData = await vResponseRaces.json();

            // 2. Chargement des textes (page2.json)
            const vResponseTextes = await fetch('page2.json');
            const vDataTextes = await vResponseTextes.json();
            this.aTextes = vDataTextes.page2;

        } catch (vError) {
            console.error("Erreur de chargement des fichiers JSON:", vError);
        }
    }

    /**
     * @brief Injecte les textes de page2.json dans les éléments HTML.
     */
    mRemplirTextes() {
        if (!this.aTextes) return;

        // Titre et Header
        document.getElementById('vPageTitle').textContent = this.aTextes.titre_page;
        document.getElementById('vHeaderTitre').textContent = this.aTextes.titre_header;
        
        // Section Recherche/Filtres
        document.getElementById('vRechercheTitre').textContent = this.aTextes.section_recherche_titre;
        document.getElementById('pSearch').placeholder = this.aTextes.recherche_placeholder;

        // Section Affichage Race par Défaut
        document.getElementById('vDefaultRaceTitre').textContent = this.aTextes.race_par_defaut_titre;
        document.getElementById('vDefaultRaceDesc').textContent = this.aTextes.race_par_defaut_desc;
        
        // Catégories de filtres (ajustez les IDs dans le HTML si nécessaire)
        document.getElementById('vFiltreTout').textContent = this.aTextes.categories.tout;
        document.getElementById('vFiltreHumanoide').textContent = this.aTextes.categories.humanoide;
        document.getElementById('vFiltreMonstrueux').textContent = this.aTextes.categories.monstrueux;
        document.getElementById('vFiltreCeleste').textContent = this.aTextes.categories.celeste;

        // Bouton DÉTAIL (le détail ne sera pas implémenté ici, mais le texte est là)
        document.getElementById('vBoutonDetail').textContent = this.aTextes.bouton_detail;

        // Boutons de navigation
        const vRetourBtn = document.getElementById('vBoutonRetour');
        vRetourBtn.textContent = this.aTextes.bouton_retour;
        vRetourBtn.href = this.aTextes.lien_retour;
        
        document.getElementById('vSuivantButton').textContent = this.aTextes.bouton_suivant;
    }

    /**
     * @brief Génère la liste des races dans le conteneur principal.
     */
    mGenererListeRaces() {
        if (!this.aRacesData) return;

        const vContainer = document.getElementById('vRaceListContainer');
        let vHtml = '';
        const vTermeRecherche = document.getElementById('pSearch').value.toLowerCase();
        
        this.aRacesData.forEach(vRace => {
            const vCategorieTexte = this.aTextes.categories[vRace.categorie] || vRace.categorie;
            
            // Logique de Filtrage (Catégorie)
            if (this.aFiltreActif !== 'tout' && vRace.categorie !== this.aFiltreActif) {
                return;
            }

            // Logique de Filtrage (Recherche)
            if (vTermeRecherche && !vRace.nom.toLowerCase().includes(vTermeRecherche)) {
                return;
            }

            const vSelectedClass = (this.aRaceSelectionnee && this.aRaceSelectionnee.nom === vRace.nom) ? 'selected' : '';

            vHtml += `
                <div class="race-card ${vSelectedClass}" data-race-nom="${vRace.nom}" onclick="new CPage2().mSelectionnerRace('${vRace.nom}')">
                    <img src="${vRace.image_url}" alt="${vRace.nom}" class="race-image">
                    <div class="race-info">
                        <h3>${vRace.nom}</h3>
                        <p class="race-category">${vCategorieTexte}</p>
                        <p class="race-description">${vRace.description_courte}</p>
                    </div>
                </div>
            `;
        });
        
        vContainer.innerHTML = vHtml;
        this.mMettreAJourAffichageSelection();
    }

    /**
     * @brief Applique un filtre et régénère la liste.
     * @param pFiltreKey La clé du filtre (ex: 'humanoide').
     */
    mAppliquerFiltre(pFiltreKey) {
        this.aFiltreActif = pFiltreKey;
        // Mettre à jour les classes actives sur les boutons de filtre si besoin
        this.mGenererListeRaces();
    }

    /**
     * @brief Gère la sélection d'une race.
     * @param pRaceNom Le nom de la race sélectionnée.
     */
    mSelectionnerRace(pRaceNom) {
        this.aRaceSelectionnee = this.aRacesData.find(vRace => vRace.nom === pRaceNom);
        
        // Stockage dans le localStorage
        localStorage.setItem('raceSelectionnee', JSON.stringify(this.aRaceSelectionnee));
        
        this.mGenererListeRaces(); // Pour mettre à jour la classe 'selected'
        this.mMettreAJourAffichageSelection();
    }

    /**
     * @brief Met à jour le bloc d'affichage de la race sélectionnée et active le bouton Suivant.
     */
    mMettreAJourAffichageSelection() {
        const vDisplayContainer = document.getElementById('vSelectedRaceDisplay');
        const vSuivantButton = document.getElementById('vSuivantButton');

        if (this.aRaceSelectionnee) {
            // Mise à jour de la zone de visualisation détaillée (ajustez les IDs dans le HTML si besoin)
            document.getElementById('vDefaultRaceTitre').textContent = this.aRaceSelectionnee.nom;
            document.getElementById('vDefaultRaceDesc').textContent = this.aRaceSelectionnee.description_courte;
            
            // Activer le bouton Suivant
            vSuivantButton.disabled = false;
        } else {
            // Afficher le message par défaut et désactiver le bouton
            document.getElementById('vDefaultRaceTitre').textContent = this.aTextes.race_par_defaut_titre;
            document.getElementById('vDefaultRaceDesc').textContent = this.aTextes.race_par_defaut_desc;
            vSuivantButton.disabled = true;
        }
    }

    /**
     * @brief Gère la navigation vers la page suivante.
     */
    mAllerPageSuivante() {
        if (this.aRaceSelectionnee) {
            const vLienSuivant = this.aTextes.lien_suivant;
            window.location.href = vLienSuivant;
        } else {
            alert("Veuillez sélectionner une race avant de continuer.");
        }
    }

    /**
     * @brief Initialise la page, charge les données et configure les écouteurs.
     */
    async mInitialiserPage() {
        await this.mChargerDonnees();
        this.mRemplirTextes();
        this.mGenererListeRaces();
        
        // Initialiser l'état du bouton Suivant (désactivé par défaut)
        document.getElementById('vSuivantButton').disabled = true;

        // Écouteur pour la recherche
        document.getElementById('pSearch').oninput = () => this.mGenererListeRaces();

        // Écouteur pour la navigation
        document.getElementById('vSuivantButton').onclick = () => this.mAllerPageSuivante();
        
        // Écouteurs pour les filtres (doivent être attachés aux éléments de filtre dans le HTML)
        // Exemple (si vous avez des éléments avec les IDs vFiltreTout, vFiltreHumanoide, etc.):
        // document.getElementById('vFiltreTout').onclick = () => this.mAppliquerFiltre('tout');
        // document.getElementById('vFiltreHumanoide').onclick = () => this.mAppliquerFiltre('humanoide');
        // document.getElementById('vFiltreMonstrueux').onclick = () => this.mAppliquerFiltre('monstrueux');
    }
}

new CPage2();