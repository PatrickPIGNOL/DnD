class CPage2 {
    aRacesData;
    aTextes; 
    aRaceSelectionnee = null;
    aFiltreActif = 'tout'; 

    constructor() {
        this.mInitialiserPage();
    }

    /**
     * @brief Vérifie l'existence de l'élément avant de lui attribuer du texte.
     */
    mRemplirElement(pId, pTexte) {
        const vElement = document.getElementById(pId);
        if (vElement) {
            vElement.textContent = pTexte;
        } 
    }

    /**
     * @brief Charge les fichiers JSON nécessaires (races.json et page2.json).
     */
    async mChargerDonnees() {
        try {
            // 1. Chargement des données de Race
            const vResponseRaces = await fetch('races.json');
            this.aRacesData = await vResponseRaces.json(); // Supposons races.json est un tableau direct

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

        // Mise à jour du titre de la fenêtre
        document.title = this.aTextes.titre_page;
        
        // Mise à jour du Header
        this.mRemplirElement('vHeaderTitre', this.aTextes.titre_header);

        // Les IDs suivants manquent dans le HTML fourni, on les sécurise :
        this.mRemplirElement('vRechercheTitre', this.aTextes.section_recherche_titre);
        const vSearchInput = document.getElementById('pSearch');
        if (vSearchInput) vSearchInput.placeholder = this.aTextes.recherche_placeholder; // Input non géré par mRemplirElement
        
        // Section Affichage Race par Défaut (Manquante dans le HTML fourni)
        this.mRemplirElement('vDefaultRaceTitre', this.aTextes.race_par_defaut_titre);
        this.mRemplirElement('vDefaultRaceDesc', this.aTextes.race_par_defaut_desc);
        
        // Catégories de filtres (Manquantes)
        this.mRemplirElement('vFiltreTout', this.aTextes.categories.tout);
        // ... autres filtres

        // Bouton DÉTAIL (Manquant)
        this.mRemplirElement('vBoutonDetail', this.aTextes.bouton_detail);

        // Boutons de navigation
        const vRetourBtn = document.querySelector('.navigation-buttons a.secondary-button');
        if (vRetourBtn) {
            vRetourBtn.textContent = this.aTextes.bouton_retour;
            vRetourBtn.href = this.aTextes.lien_retour; 
        }
        
        // CORRECTION D'ID : vNextButton est l'ID dans le HTML
        this.mRemplirElement('vNextButton', this.aTextes.bouton_suivant);
    }

    /**
     * @brief Génère la liste des races dans le conteneur principal.
     */
    mGenererListeRaces() {
        if (!this.aRacesData) return;

        const vContainer = document.getElementById('vRaceOptionsContainer'); // ID dans le HTML
        if (!vContainer) return; // Sécurité si le conteneur n'est pas là

        // Nettoyer le message de chargement
        const vLoading = document.getElementById('vLoadingMessage');
        if (vLoading) vLoading.style.display = 'none';

        let vHtml = '';
        const vSearchInput = document.getElementById('pSearch');
        const vTermeRecherche = vSearchInput ? vSearchInput.value.toLowerCase() : '';
        
        this.aRacesData.forEach(vRace => {
            const vCategorieTexte = this.aTextes.categories[vRace.categorie] || vRace.categorie;
            
            if (this.aFiltreActif !== 'tout' && vRace.categorie !== this.aFiltreActif) {
                return;
            }

            if (vTermeRecherche && !vRace.nom.toLowerCase().includes(vTermeRecherche)) {
                return;
            }

            const vSelectedClass = (this.aRaceSelectionnee && this.aRaceSelectionnee.nom === vRace.nom) ? 'selected' : '';

            vHtml += `
                <div class="race-card ${vSelectedClass}" data-race-nom="${vRace.nom}" onclick="oCPage2.mSelectionnerRace('${vRace.nom}')">
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
     */
    mAppliquerFiltre(pFiltreKey) {
        this.aFiltreActif = pFiltreKey;
        this.mGenererListeRaces();
    }

    /**
     * @brief Gère la sélection d'une race.
     */
    mSelectionnerRace(pRaceNom) {
        this.aRaceSelectionnee = this.aRacesData.find(vRace => vRace.nom === pRaceNom);
        
        localStorage.setItem('raceSelectionnee', JSON.stringify(this.aRaceSelectionnee));
        
        this.mGenererListeRaces(); 
        this.mMettreAJourAffichageSelection();
    }

    /**
     * @brief Met à jour le bloc d'affichage de la race sélectionnée et active le bouton Suivant.
     */
    mMettreAJourAffichageSelection() {
        // Ces IDs manquent dans le HTML fourni, nous les ignorons ou les créons si vous les ajoutez.
        const vSuivantButton = document.getElementById('vNextButton'); // ID réel du bouton

        if (this.aRaceSelectionnee) {
            // Activer le bouton Suivant
            if (vSuivantButton) vSuivantButton.disabled = false;
        } else {
            // Afficher le message par défaut et désactiver le bouton
            if (vSuivantButton) vSuivantButton.disabled = true;
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
        
        // Correction de l'ID pour le bouton Suivant
        const vSuivantButton = document.getElementById('vNextButton');
        if (vSuivantButton) {
             vSuivantButton.disabled = true;
             vSuivantButton.onclick = (event) => {
                event.preventDefault(); // Empêche l'envoi du formulaire par défaut
                this.mAllerPageSuivante();
            };
        }

        // Si l'élément pSearch n'existe pas, cette ligne sera ignorée grâce à la sécurité implicite
        const vSearchInput = document.getElementById('pSearch');
        if (vSearchInput) {
            vSearchInput.oninput = () => this.mGenererListeRaces();
        }
    }
}

// Global variable pour un accès facile
const oCPage2 = new CPage2();