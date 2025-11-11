class CPage2 {
    aRacesData;
    aTextes; 
    aRaceSelectionnee = null;

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

        // Titre de la FENÊTRE
        document.title = this.aTextes.titre_page;
        
        // Header
        this.mRemplirElement('vHeaderTitre', this.aTextes.titre_header);
        
        // Titre de section et Introduction (utilisent des textes statiques si non fournis par JSON)
        this.mRemplirElement('vPage2Titre', this.aTextes.titre_section);
        this.mRemplirElement('vPage2Introduction', this.aTextes.description_section);

        // Boutons de navigation
        const vRetourBtn = document.getElementById('vBoutonRetour');
        if (vRetourBtn) {
            vRetourBtn.textContent = this.aTextes.bouton_retour;
            vRetourBtn.href = this.aTextes.lien_retour; 
        }
        
        this.mRemplirElement('vNextButton', this.aTextes.bouton_suivant);
        
        // Footer 
        const vFooter = document.getElementById('vFooterTexte');
        if (vFooter) {
            vFooter.innerHTML = '&copy; 2025 Character Builder'; 
        }

        // Les autres IDs (filtres/recherche) sont ignorés.
    }

    /**
     * @brief Génère la liste des races dans le conteneur principal.
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

            vHtml += `
                <div class="race-option-card ${vSelectedClass}">
                    <label>

                        <table class="race-layout-table"> 
                            <tr>
                                <td rowspan="2" style="text-align: center; vertical-align: middle;"><input type="radio" name="race" value="${vRace.nom}"></td>
                                
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
        this.mChargerSauvegarde();
    }

    // La logique de mAppliquerFiltre() a été supprimée.

    /**
     * @brief Gère la sélection d'une race (appelé par l'écouteur 'change').
     */
    mSelectionnerRace(pRaceNom) {
        this.aRaceSelectionnee = this.aRacesData.find(vRace => vRace.nom === pRaceNom);
        
        localStorage.setItem('raceSelectionnee', JSON.stringify(this.aRaceSelectionnee));
        
        this.mGenererListeRaces(); 
    }
    
    /**
     * @brief Charge la sélection depuis le localStorage si elle existe.
     */
    mChargerSauvegarde() {
        const vSauvegardeRaw = localStorage.getItem('raceSelectionnee');
        if (vSauvegardeRaw) {
            const vSauvegarde = JSON.parse(vSauvegardeRaw);
            
            const vRadio = document.querySelector(`input[name="race"][value="${vSauvegarde.nom}"]`);
            if (vRadio) {
                vRadio.checked = true;
                this.aRaceSelectionnee = vSauvegarde; // Restaurer l'objet sélectionné
            }
        }
    }

    /**
     * @brief Applique un écouteur d'événement pour intercepter la sélection de la race (méthode stable).
     */
    mAppliquerEcouteurSelection() {
        const vContainer = document.getElementById('vRaceOptionsContainer');
        if (!vContainer) return;

        // Utiliser l'événement 'change' sur le conteneur (délégation d'événement)
        vContainer.onchange = (pEvent) => {
            // Vérifie si l'élément qui a changé est un input radio
            if (pEvent.target.type === 'radio' && pEvent.target.name === 'race') {
                this.mSelectionnerRace(pEvent.target.value);
            }
        };
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
        
        this.mAppliquerEcouteurSelection();

        const vSuivantButton = document.getElementById('vNextButton');
        if (vSuivantButton) {
             vSuivantButton.disabled = true;
             vSuivantButton.onclick = (event) => {
                if(event) event.preventDefault(); 
                this.mAllerPageSuivante();
            };
        }
        
        window.oCPage2 = this; 
    }
}

// Global variable pour un accès facile
const oCPage2 = new CPage2();