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

    mRemplirTextes() {
        if (!this.aTextes) return;

        document.title = this.aTextes.titre_page;
        this.mRemplirElement('vHeaderTitre', this.aTextes.titre_header);
        this.mRemplirElement('vPage2Titre', this.aTextes.titre_section);
        this.mRemplirElement('vPage2Introduction', this.aTextes.description_section);

        const vRetourBtn = document.getElementById('vBoutonRetour');
        if (vRetourBtn) {
            vRetourBtn.textContent = this.aTextes.boutons.retour_texte;
            vRetourBtn.href = this.aTextes.navigation.retour_url; // ← URL configurable
        }
        
        this.mRemplirElement('vNextButton', this.aTextes.boutons.suivant_texte);
        
        const vFooter = document.getElementById('vFooterTexte');
        if (vFooter) vFooter.innerHTML = this.aTextes.footer_texte;
    }

    mGenererListeRaces() {
        if (!this.aRacesData || !this.aTextes) return;

        const vContainer = document.getElementById('vRaceOptionsContainer');
        if (!vContainer) return; 

        const vLoading = document.getElementById('vLoadingMessage');
        if (vLoading) {
            vLoading.textContent = this.aTextes.messages.chargement;
            vLoading.style.display = 'none';
        }

        let vHtml = '';
        
        this.aRacesData.forEach(vRace => {
            const vSelectedClass = (this.aRaceSelectionnee && this.aRaceSelectionnee.nom === vRace.nom) ? 'selected' : '';

            vHtml += `
                <div class="race-option-card ${vSelectedClass}">
                    <label>
                        <table class="race-layout-table"> 
                            <tr>
                                <td rowspan="2" style="text-align: center; vertical-align: middle;"><input type="radio" name="race" value="${vRace.nom}"></td>
                                
                                <td rowspan="2" class="race-image-cell" style="text-align: center; vertical-align: middle;">
                                    <img src="${vRace.image_url}" alt="${this.aTextes.messages.image_alt.replace('{race}', vRace.nom)}" style="width: 90px; height: 90px; object-fit: cover;">
                                </td>
                                
                                <td class="race-header-title" style="width: 100%;">
                                    ${vRace.nom}
                                </td>
                            </tr>
                            <tr>
                                <td class="race-description-cell" style="text-align: justify; width: 100%;">
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

    /**
     * @brief Gère la sélection d'une race (appelé par l'écouteur 'change').
     */
    mSelectionnerRace(pRaceNom) {
        this.aRaceSelectionnee = this.aRacesData.find(vRace => vRace.nom === pRaceNom);
        
        localStorage.setItem('raceSelectionnee', JSON.stringify(this.aRaceSelectionnee));
        
        this.mGenererListeRaces(); 
        // C'EST CET APPEL QUI EST CRUCIAL :
        this.mMettreAJourAffichageSelection();
    }
    
    /**
     * @brief Charge la sélection depuis le localStorage si elle existe.
     */
    mChargerSauvegarde() {
        const vSauvegardeRaw = localStorage.getItem('raceSelectionnee')
        if (vSauvegardeRaw) {
            const vSauvegarde = JSON.parse(vSauvegardeRaw)
            const vRadio = document.querySelector(`input[name="race"][value="${vSauvegarde.nom}"]`)
            if (vRadio) {
                vRadio.checked = true
                this.aRaceSelectionnee = vSauvegarde
                this.mMettreAJourAffichageSelection()
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
            // Utilisation de l'URL configurée
            window.location.href = this.aTextes.navigation.suivant_url;
        } else {
            alert(this.aTextes.messages.alerte_selection);
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

    /**
     * @brief Met à jour le bloc d'affichage de la race sélectionnée et active le bouton Suivant.
     */
    mMettreAJourAffichageSelection() {
        const vSuivantButton = document.getElementById('vNextButton');

        if (this.aRaceSelectionnee) {            
            // ✅ ACTIVER LE BOUTON ICI
            if (vSuivantButton) vSuivantButton.disabled = false; 
        } else {            
            // 🚫 DÉSACTIVER LE BOUTON ICI
            if (vSuivantButton) vSuivantButton.disabled = true;
        }
    }
}

// Global variable pour un accès facile
const oCPage2 = new CPage2();