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
        
        this.mRemplirElement('vHeaderTitre', this.aTextes.titre_page);
        this.mRemplirElement('vPageTitre', this.aTextes.titre_header);
        this.mRemplirElement('vPageIntroduction', this.aTextes.introduction);

        // Footer avec HTML
        const vFooter = document.getElementById('vFooterTexte');
        if (vFooter) {
            vFooter.innerHTML = this.aTextes.footer_texte;
        }
        
        // CONFIGURATION DU BOUTON RETOUR - CORRECTION ICI
        const vRetourBtn = document.getElementById('vBoutonRetour');
        if (vRetourBtn && this.aTextes.navigation) {
            vRetourBtn.textContent = this.aTextes.boutons.retour_texte;
            vRetourBtn.href = this.aTextes.navigation.retour_url; // ← URL depuis JSON
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
    mGenererTableCaracteristiques() {
        const vTableBody = document.getElementById('vCaracTableBody')
        if (!vTableBody || !this.aScoresFixes || !this.aTextes) return

        vTableBody.innerHTML = ""

        let vId = 0

        // Ligne de RESET entre l'entête et Force
        const vResetRow = document.createElement('tr')
        vResetRow.id = 'vResetRow'
        
        let vResetHTML = ""
        vResetHTML += `<td style="font-weight: bold; text-align: center; background-color: #333; color: white;">Reset</td>`
        vResetHTML += `<td style="background-color: #333;"></td>`
        vResetHTML += `<td colspan="4" class="race-bonus-cell" style="text-align: center;">`
        this.aBonusSlots.forEach(pSlot => {
            vResetHTML += `<label style="display: inline-block; margin: 0 5px;">`
            vResetHTML += `<input type="radio" name="${pSlot.name}" value="0" data-bonus="0" id="vRadioReset${pSlot.name}">`
            vResetHTML += `<span>${pSlot.label}</span>`
            vResetHTML += `</label>`
        })
        vResetHTML += `</td>`
        vResetHTML += `<td style="background-color: #333;"></td>`
        vResetHTML += `<td style="background-color: #333;"></td>`

        vResetRow.innerHTML = vResetHTML
        vTableBody.appendChild(vResetRow)

        // Génération des caractéristiques avec LIGNES DOUBLES
        for (const vCarac in this.aTextes.caracteristiques) {
            vId++
            const vNomComplet = this.aTextes.caracteristiques[vCarac]
            const vScoreFixe = this.aScoresFixes[vNomComplet]
            const vModificateurInitial = this.mCalculerModificateur(vScoreFixe)

            // LIGNE 1 : EXISTANTE (caractéristique + radios)
            const vMainRow = document.createElement('tr')
            vMainRow.id = `vMainRow${vCarac}`
            
            let vMainHTML = ""
            vMainHTML += `<td style="font-weight: bold;">${vNomComplet}</td>`
            vMainHTML += `<td id="vScoreFixe${vCarac}" class="score-fixe-valeur">${vScoreFixe}</td>`
            
            vMainHTML += `<td colspan="4" class="race-bonus-cell">`
            this.aBonusSlots.forEach(pSlot => {
                vMainHTML += `<label>`
                vMainHTML += `<input type="radio" name="${pSlot.name}" value="${vId}" data-bonus="${pSlot.bonus}" id="vRadio${vCarac}${pSlot.name}">`
                vMainHTML += `<span>${pSlot.label}</span>`
                vMainHTML += `</label>`
            })
            vMainHTML += `</td>`
            
            vMainHTML += `<td id="vScoreTotal${vCarac}" class="vScoreTotal">${vScoreFixe}</td>`
            vMainHTML += `<td id="vModificateur${vCarac}" class="mod-total-value">${vModificateurInitial > 0 ? '+' : ''}${vModificateurInitial}</td>`

            vMainRow.innerHTML = vMainHTML
            vTableBody.appendChild(vMainRow)

            // LIGNE 2 : NOUVELLE (vide avec calculs des bonus)
            const vDetailRow = document.createElement('tr')
            vDetailRow.id = `vDetailRow${vCarac}`
            vDetailRow.className = 'detail-row'
            
            // Calcul du bonus de base selon VOTRE formule : floor((Score / 2) - 4.5)
            const vBonusBase = Math.floor((vScoreFixe / 2) - 4.5)
            
            let vDetailHTML = ""
            vDetailHTML += `<td style="font-style: italic; color: #888; font-size: 0.9em;">Calcul ${vNomComplet}</td>`
            vDetailHTML += `<td style="background-color: #2a2a2a;"></td>`
            
            vDetailHTML += `<td colspan="4" style="background-color: #2a2a2a; color: #888; font-size: 0.9em; text-align: center;">`
            vDetailHTML += `<span id="vDetailBonusBase${vCarac}">Base: ${vBonusBase > 0 ? '+' : ''}${vBonusBase}</span>`
            vDetailHTML += `<span> + </span>`
            vDetailHTML += `<span id="vDetailBonusRaciaux${vCarac}">Race: +0</span>`
            vDetailHTML += `<span> = </span>`
            vDetailHTML += `<span id="vDetailBonusTotal${vCarac}" style="font-weight: bold;">Total: ${vBonusBase > 0 ? '+' : ''}${vBonusBase}</span>`
            vDetailHTML += `</td>`
            
            vDetailHTML += `<td style="background-color: #2a2a2a;"></td>`
            vDetailHTML += `<td style="background-color: #2a2a2a;"></td>`

            vDetailRow.innerHTML = vDetailHTML
            vTableBody.appendChild(vDetailRow)
        }
        
        // Écouteurs d'événements
        document.querySelectorAll('input[type="radio"]').forEach(pRadio => {
            pRadio.addEventListener('change', () => {
                this.mCalculerTotal()
                this.mGenererTablePV()
                this.mSauvegarder()
            })
        })
    }

    mCalculerTotal() {
        if (!this.aScoresFixes) return

        let vTotalBonus = {}
        for (let vId = 1; vId <= 6; vId++) {
            vTotalBonus[vId] = 0
        }

        // Calcul des bonus raciaux (ignore les reset value="0")
        this.aBonusSlots.forEach(pSlot => {
            const vRadio = document.querySelector(`input[name="${pSlot.name}"]:checked`)
            if (vRadio && vRadio.value !== "0") {
                const vCaracId = parseInt(vRadio.value)
                const vBonus = parseInt(vRadio.dataset.bonus)
                
                if (vCaracId >= 1 && vCaracId <= 6) {
                    vTotalBonus[vCaracId] += vBonus
                }
            }
        })

        // Mise à jour pour chaque caractéristique
        let vIndex = 0
        for (const vCarac in this.aTextes.caracteristiques) {
            vIndex++
            const vNomComplet = this.aTextes.caracteristiques[vCarac]
            const vScoreFixe = this.aScoresFixes[vNomComplet]
            const vBonusRaciaux = vTotalBonus[vIndex]
            
            const vScoreTotal = vScoreFixe + vBonusRaciaux
            const vModificateur = this.mCalculerModificateur(vScoreTotal)
            
            // VOTRE formule : floor((Score / 2) - 4.5)
            const vBonusBase = Math.floor((vScoreTotal / 2) - 4.5)
            const vBonusFinal = vBonusBase + vBonusRaciaux

            // Mise à jour ligne principale
            this.mRemplirElement(`vScoreTotal${vCarac}`, vScoreTotal)
            this.mRemplirElement(`vModificateur${vCarac}`, `${vModificateur > 0 ? '+' : ''}${vModificateur}`)

            // Mise à jour ligne détail (calculs)
            this.mRemplirElement(`vDetailBonusBase${vCarac}`, `Base: ${vBonusBase > 0 ? '+' : ''}${vBonusBase}`)
            this.mRemplirElement(`vDetailBonusRaciaux${vCarac}`, `Race: +${vBonusRaciaux}`)
            this.mRemplirElement(`vDetailBonusTotal${vCarac}`, `Total: ${vBonusFinal > 0 ? '+' : ''}${vBonusFinal}`)

            if (vCarac === 'Con') {
                localStorage.setItem('modificateurConstitution', vModificateur)
            }
        }
    }
}

// Global variable pour un accès facile
const oCPage1 = new CPage1();