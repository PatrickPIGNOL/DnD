class CPage1 {
    aTextes;
    aClasses;

    constructor() {
        this.mInitialiserPage();
    }

    mInitialiserPage() {
        this.mChargerDonnees().then(() => {
            this.mRemplirTextes();
            this.mGenererOptionsClasse();
        });
    }

    async mChargerDonnees() {
        try {
            // Chargement des textes de la page 1
            const vResponseTextes = await fetch('page1.json');
            const vDataTextes = await vResponseTextes.json();
            this.aTextes = vDataTextes.page1;

            // Chargement des classes (Correction: utilise 'classes.json')
            const vResponseClasses = await fetch('classes.json');
            const vDataClasses = await vResponseClasses.json();
            
            // CORRECTION: Assignation directe du tableau des classes 
            this.aClasses = vDataClasses; 
            
        } catch (vError) {
            console.error("Erreur de chargement des données pour la page 1:", vError);
        }
    }
    
    /**
     * @brief Vérifie l'existence de l'élément avant de lui attribuer du texte.
     * @param {string} pId L'ID de l'élément HTML.
     * @param {string} pTexte La valeur à attribuer.
     */
    mRemplirElement(pId, pTexte) {
        const vElement = document.getElementById(pId);
        if (vElement) {
            vElement.textContent = pTexte;
        } 
    }

    /**
     * @brief Rempli les éléments textuels de la page à partir du fichier JSON.
     */
    mRemplirTextes() {
        if (!this.aTextes) return;

        document.title = this.aTextes.titre_page;
        this.mRemplirElement('vHeaderTitre', this.aTextes.titre_header);
        this.mRemplirElement('vPageTitre', this.aTextes.titre_header);
        this.mRemplirElement('vPageIntroduction', this.aTextes.introduction);

        const vFooter = document.getElementById('vFooterTexte');
        if (vFooter) vFooter.innerHTML = this.aTextes.footer_texte;
        
        const vRetourBtn = document.getElementById('vBoutonRetour');
        if (vRetourBtn) {
            vRetourBtn.textContent = this.aTextes.boutons.retour_texte;
            vRetourBtn.href = this.aTextes.navigation.retour_url; // ← URL configurable
        }

        this.mRemplirElement('vBoutonSuivant', this.aTextes.boutons.suivant_texte);
    }

    /**
     * @brief Génère les cartes d'options de classe en utilisant une structure de tableau interne.
     */
    mGenererOptionsClasse() {
        if (!this.aClasses || this.aClasses.length === 0) {
            console.warn("Aucune classe à générer. Vérifiez 'classes.json'.");
            return;
        }
        
        const vContainer = document.getElementById('vClasseOptionsList');
        if (!vContainer) return; 

        vContainer.innerHTML = '';
        
        this.aClasses.forEach(pClasse => {
            const vHTML = `
                <div class="classe-option-card">
                    <label>
                        <table class="classe-layout-table">
                            <tr>
                                <td rowspan="2" class="radio-cell" style="text-align: center; vertical-align: middle;">
                                    <input type="radio" name="classe" value="${pClasse.nom}" onclick="oCPage1.mActiverBoutonSuivant(true)">
                                </td>
                                
                                <td colspan="2" class="classe-header-title">
                                    ${pClasse.nom}
                                </td>
                            </tr>
                            <tr>
                                <td class="classe-image-cell">
                                    <img src="${pClasse.image_url}" alt="Image de la classe ${pClasse.nom}" class="classe-image">
                                </td>
                                
                                <td class="classe-description-cell">
                                    <div class="classe-description">
                                        ${pClasse.description_html}
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </label>
                </div>
            `;
            vContainer.innerHTML += vHTML;
        });

        this.mActiverBoutonSuivant(false); 
        this.mChargerSauvegarde();
    }

    /**
     * @brief Active ou désactive le bouton Suivant.
     * @param {boolean} pActiver Si true, le bouton est activé.
     */
    mActiverBoutonSuivant(pActiver) {
        const vBouton = document.getElementById('vBoutonSuivant');
        if (vBouton) {
            vBouton.disabled = !pActiver;
            vBouton.style.opacity = pActiver ? 1 : 0.5;
        }
    }

    /**
     * @brief Enregistre la sélection et passe à la page suivante.
     * @param {Event} pEvent L'événement de soumission.
     */
    mSelectionnerClasse(pEvent) {
        if (pEvent) pEvent.preventDefault();

        const vSelectionne = document.querySelector('input[name="classe"]:checked');
        
        if (vSelectionne) {
            localStorage.setItem('classeSelectionnee', vSelectionne.value);
            // Utilisation de l'URL configurée
            window.location.href = this.aTextes.navigation.suivant_url;
        } else {
            alert(this.aTextes.messages.alerte_selection);
        }
    }
    
    /**
     * @brief Charge la sélection de classe depuis le localStorage si elle existe.
     */
    mChargerSauvegarde() {
        const vSauvegarde = localStorage.getItem('classeSelectionnee');
        if (vSauvegarde) {
            const vRadio = document.querySelector(`input[name="classe"][value="${vSauvegarde}"]`);
            if (vRadio) {
                vRadio.checked = true;
                this.mActiverBoutonSuivant(true);
            }
        }
    }
}

// Global variable pour un accès facile
const oCPage1 = new CPage1();