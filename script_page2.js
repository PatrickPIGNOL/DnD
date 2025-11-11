class CPage2 {
    aRacesData;
    aTextes; 
    aRaceSelectionnee = null;
    // aFiltreActif n'est plus nécessaire

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

        document.title = this.aTextes.titre_page;
        
        // Header, Titre de section et Introduction
        this.mRemplirElement('vHeaderTitre', this.aTextes.titre_header);
        this.mRemplirElement('vPage2Titre', 'Origines et Traits'); // Statistique
        this.mRemplirElement('vPage2Introduction', 'La race détermine l\'apparence physique de votre personnage, sa longévité, et lui confère des bonus de caractéristiques ainsi que des traits spéciaux.'); // Statistique

        // Section Affichage Race par Défaut
        this.mRemplirElement('vDefaultRaceTitre', this.aTextes.race_par_defaut_titre);
        this.mRemplirElement('vDefaultRaceDesc', this.aTextes.race_par_defaut_desc);

        // Boutons de navigation
        const vRetourBtn = document.getElementById('vBoutonRetour');
        if (vRetourBtn) {
            vRetourBtn.textContent = this.aTextes.bouton_retour;
            vRetourBtn.href = this.aTextes.lien_retour; 
        }
        
        this.mRemplirElement('vNextButton', this.aTextes.bouton_suivant);
        
        // Footer (doit être un innerHTML si vous ajoutez le copyright)
        const vFooter = document.getElementById('vFooterTexte');
        if (vFooter) {
            vFooter.innerHTML = '&copy; 2025 Character Builder'; 
        }

        // Suppression des tentatives de remplissage d'éléments de filtre/recherche
        // (vRechercheTitre, pSearch, vFiltreTout, etc.)
    }

    /**
     * @brief Génère la liste des races dans le conteneur principal (sans filtres).
     */
    mGenererListeRaces() {
        if (!this.aRacesData) return;

        const vContainer = document.getElementById('vRaceOptionsContainer');
        if (!vContainer) return; 

        const vLoading = document.getElementById('vLoadingMessage');
        if (vLoading) vLoading.style.display = 'none';

        let vHtml = '';
        
        this.aRacesData.forEach(vRace => {
            const vSelectedClass = (this.aRaceSelectionnee && this.aRaceSelectionnee.nom === vRace.nom) ? 'selected' : '';

            // Nouvelle structure de carte basée sur un tableau
            vHtml += `
                <div class="race-option-card ${vSelectedClass}">
                    <label>
                        <table class="race-layout-table" onclick="oCPage2.mSelectionnerRace('${vRace.nom}')">
                            <tr>
                                <td rowspan="2" style="text-align: center; vertical-align: middle;">
                                    <input type="radio" name="race" value="${vRace.nom}">
                                </td>
                                
                                <td rowspan="2" class="race-image-cell">
                                    <img src="${vRace.image_url}" alt="Image de la race ${vRace.nom}" style="width: 90px; height: 90px; object-fit: cover;">
                                </td>
                                
                                <td class="race-header-title" style="width: 100%;">
                                    ${vRace.nom}
                                </td>
                            </tr>
                            <tr>
                                <td class="race-description-cell" style="width: 100%;">
                                    <p>${vRace.description_courte}</p>
                                </td>
                            </tr>
                        </table>
                    </label>
                </div>
            `;
        });
        
        vContainer.innerHTML = vHtml;
        this.mChargerSauvegarde(); // Ajout de la sauvegarde
        this.mMettreAJourAffichageSelection();
    }

    // Suppression de mAppliquerFiltre()

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
        const vSuivantButton = document.getElementById('vNextButton');

        if (this.aRaceSelectionnee) {
            this.mRemplirElement('vDefaultRaceTitre', this.aRaceSelectionnee.nom);
            this.mRemplirElement('vDefaultRaceDesc', this.aRaceSelectionnee.description_courte);
            
            if (vSuivantButton) vSuivantButton.disabled = false;
        } else {
            this.mRemplirElement('vDefaultRaceTitre', this.aTextes.race_par_defaut_titre);
            this.mRemplirElement('vDefaultRaceDesc', this.aTextes.race_par_defaut_desc);
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
        
        const vSuivantButton = document.getElementById('vNextButton');
        if (vSuivantButton) {
             vSuivantButton.disabled = true;
             vSuivantButton.onclick = (event) => {
                if(event) event.preventDefault(); 
                this.mAllerPageSuivante();
            };
        }

        // Suppression de l'écouteur de recherche
    }
}

// Global variable pour un accès facile
const oCPage2 = new CPage2();