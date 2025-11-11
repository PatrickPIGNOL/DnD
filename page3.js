class CPage3 {
    aTextes; 
    // aScoresBase contient les scores fixes (ex: Force 17) de la classe
    aScoresBase = {}; 
    // aBonusRaciaux contient le bonus total (0 à 4) sélectionné par les radio boutons
    aBonusRaciaux = {}; 
    aClassesData;
    aClasseSelectionnee;
    aNiveau = 1; 
    aClesCarac = ['force', 'dexterite', 'constitution', 'intelligence', 'sagesse', 'charisme'];

    constructor() {
        this.mInitialiserPage();
    }

    mRemplirElement(pId, pTexte) {
        const vElement = document.getElementById(pId);
        if (vElement) {
            vElement.textContent = pTexte;
        } 
    }
    
    mRemplirElementHTML(pId, pHTML) {
        const vElement = document.getElementById(pId);
        if (vElement) {
            vElement.innerHTML = pHTML;
        } 
    }

    async mChargerDonnees() {
        try {
            const vResponseTextes = await fetch('page3.json'); 
            this.aTextes = (await vResponseTextes.json()).page3;
        } catch (vError) {
            console.error("ERREUR lors du chargement ou parsing de page3.json:", vError);
        }
        
        try {
            const vResponseCarac = await fetch('caracteristiques.json');
            this.aClassesData = await vResponseCarac.json();
        } catch (vError) {
            console.error("ERREUR lors du chargement ou parsing de caracteristiques.json:", vError);
        }
        
        const vClasseNom = localStorage.getItem('classeSelectionnee');
        if (vClasseNom && this.aClassesData && this.aClassesData.classes_scores_fixes) {
            this.aClasseSelectionnee = this.aClassesData.classes_scores_fixes[vClasseNom];
        }

        this.mInitialiserScores();
        this.mChargerSauvegarde();
    }

    mInitialiserScores() {
        if (this.aClasseSelectionnee && this.aTextes && this.aTextes.caracteristiques) {
            this.aClesCarac.forEach(vCle => {
                const vNomCarac = this.aTextes.caracteristiques[vCle]; // Ex: 'Force' pour 'force'
                const vScore = this.aClasseSelectionnee[vNomCarac]; 
                
                // Utilise les scores fixes, par défaut à 10 si la donnée est manquante
                this.aScoresBase[vCle] = vScore || 10; 
                this.aBonusRaciaux[vCle] = 0;
            });
        } else {
            // Fallback
            this.aClesCarac.forEach(vCle => {
                this.aScoresBase[vCle] = 10; 
                this.aBonusRaciaux[vCle] = 0;
            });
        }
    }
    
    mChargerSauvegarde() {
        const vSavedBonus = localStorage.getItem('bonusRaciaux');
        const vSavedNiveau = localStorage.getItem('niveauPersonnage');

        if (vSavedBonus) {
            this.aBonusRaciaux = JSON.parse(vSavedBonus);
        }
        if (vSavedNiveau) {
            this.aNiveau = parseInt(vSavedNiveau, 10);
        }
    }
    
    mSauvegarderEtat() {
        localStorage.setItem('bonusRaciaux', JSON.stringify(this.aBonusRaciaux));
        localStorage.setItem('niveauPersonnage', this.aNiveau);
    }

    /**
     * @brief Calcule le modificateur avec la formule demandée : floor(score / 2 - 4.5)
     */
    mCalculerModificateur(pScore) {
        return Math.floor(pScore / 2 - 4.5);
    }
    
    mFormaterModificateur(pMod) {
        return pMod >= 0 ? `+${pMod}` : `${pMod}`;
    }
    
    mMettreAJourNiveau(pNouveauNiveau) {
        this.aNiveau = parseInt(pNouveauNiveau, 10);
        
        // Recalcul des PV avec le nouveau niveau
        const vModConstitution = this.mCalculerModificateur(this.aScoresBase.constitution + this.aBonusRaciaux.constitution);
        this.mCalculerPointsDeVie(vModConstitution);
        this.mSauvegarderEtat();
    }
    
    mSelectionnerBonusRacial(pCle, pBonus) {
        this.aBonusRaciaux[pCle] = parseInt(pBonus, 10);
        this.mMettreAJourAffichageScores(pCle);
        this.mSauvegarderEtat();
    }

    /**
     * @brief Génère la table de caractéristiques
     */
    mGenererCaracTable() {
        const vHeaders = this.aTextes.carac_table_headers;
        
        let vHtml = `
            <table class="caracteristiques-table">
                <thead>
                    <tr>
                        <th class="text-center">${vHeaders.nom}</th>
                        <th class="text-center">${vHeaders.bonus_race}</th>
                        <th class="text-center">${vHeaders.bonus_total}</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        this.aClesCarac.forEach(vCle => {
            const vNomCapitalise = this.aTextes.caracteristiques[vCle];
            const vScoreFixe = this.aScoresBase[vCle];
            const vBonusSelectionne = this.aBonusRaciaux[vCle];
            
            const vScoreFinal = vScoreFixe + vBonusSelectionne;
            const vModBase = this.mCalculerModificateur(vScoreFixe);
            const vModTotal = this.mCalculerModificateur(vScoreFinal);
            const vModRaceFinal = vModTotal - vModBase;
            
            // 1. Ligne des Scores / Radios / Modificateur Final
            let vHtmlRow1 = `
                <tr class="carac-scores-row">
                    <td class="text-center carac-name-cell"><strong>${vNomCapitalise}</strong></td>

                    <td class="text-center carac-radio-cell">
                        <div class="radio-select-grid">
            `;
            // Génération des 5 options (0, +1, +2, +3, +4)
            for (let i = 0; i <= 4; i++) {
                const vId = `vBonus${vCle}${i}`;
                const vIsChecked = (vBonusSelectionne === i) ? 'checked' : '';
                vHtmlRow1 += `
                    <div class="radio-colonne">
                        <input type="radio" id="${vId}" name="bonus_${vCle}" value="${i}" 
                               ${vIsChecked} 
                               onclick="oCPage3.mSelectionnerBonusRacial('${vCle}', this.value)">
                        <label for="${vId}" class="radio-label">${i === 0 ? '0' : `+${i}`}</label>
                    </div>
                `;
            }
            vHtmlRow1 += `
                        </div>
                    </td>
                    
                    <td class="text-center final-mod-cell">
                        <span id="vModTotal${vNomCapitalise}" class="mod-total-value">${this.mFormaterModificateur(vModTotal)}</span>
                    </td>
                </tr>
            `;
            
            // 2. Ligne des calculs
            let vHtmlRow2 = `
                <tr class="carac-calc-row">
                    <td class="text-center score-fixe-cell">
                        <span class="score-fixe-valeur">Score Fixe: ${vScoreFixe}</span>
                        <div class="mod-base-calc">
                            (${this.aTextes.calcul_labels.mod_base_formule}) = 
                            <span id="vModBase${vNomCapitalise}">${this.mFormaterModificateur(vModBase)}</span>
                        </div>
                    </td>
                    
                    <td class="text-center">
                        + Bonus de Race (<span id="vBonusRaceMod${vNomCapitalise}">${this.mFormaterModificateur(vBonusSelectionne)}</span>)
                    </td>

                    <td class="text-center">
                        = ${this.mFormaterModificateur(vModTotal)}
                    </td>
                </tr>
            `;

            vHtml += vHtmlRow1;
            vHtml += vHtmlRow2;
        });
        
        vHtml += `
                </tbody>
            </table>
        `;
        
        return vHtml;
    }

    mGenererNiveauSelect() {
        const vSelect = document.getElementById('vNiveauSelection');
        if (!vSelect) return;
        
        const vOptions = this.aTextes.niveau_options;
        vSelect.innerHTML = '';
        
        for (const vValue in vOptions) {
            const vOption = document.createElement('option');
            vOption.value = vValue;
            vOption.textContent = vOptions[vValue];
            if (parseInt(vValue, 10) === this.aNiveau) {
                vOption.selected = true;
            }
            vSelect.appendChild(vOption);
        }
        vSelect.onchange = (pEvent) => {
            this.mMettreAJourNiveau(pEvent.target.value);
        };
    }
    
    mGenererInterface() {
        this.mGenererNiveauSelect();
        
        const vContainer = document.getElementById('vCaracteristiquesWrapper');
        if (!vContainer) return; 
        
        vContainer.innerHTML = this.mGenererCaracTable();
    }
    
    mMettreAJourAffichageScores(pCle) {
        const vNomCapitalise = this.aTextes.caracteristiques[pCle];

        // 1. Calculs
        const vScoreFixe = this.aScoresBase[pCle];
        const vBonusSelectionne = this.aBonusRaciaux[pCle];
        const vScoreFinal = vScoreFixe + vBonusSelectionne;
        
        const vModBase = this.mCalculerModificateur(vScoreFixe);
        const vModTotal = this.mCalculerModificateur(vScoreFinal);

        // 2. Affichage des modifications
        this.mRemplirElement(`vModBase${vNomCapitalise}`, this.mFormaterModificateur(vModBase));
        this.mRemplirElement(`vBonusRaceMod${vNomCapitalise}`, this.mFormaterModificateur(vBonusSelectionne)); 
        this.mRemplirElement(`vModTotal${vNomCapitalise}`, this.mFormaterModificateur(vModTotal));
        
        // Mise à jour des PV si c'est la Constitution
        if (pCle === 'constitution') {
            this.mCalculerPointsDeVie(vModTotal); // Utilise le modificateur TOTAL
        }
    }
    
    /**
     * @brief Calcule et affiche les points de vie dans une table.
     */
    mCalculerPointsDeVie(pModConstitution) {
        const vContainer = document.getElementById('vPointsDeVieContainer');
        if (!this.aClasseSelectionnee || !vContainer) {
            this.mRemplirElement('vHpCalculationTable', "Sélectionnez d'abord votre classe.");
            return;
        }

        const vJetDeVie = this.aClasseSelectionnee.jetDeVie; 
        const vMaxDeVie = parseInt(vJetDeVie.substring(1), 10);
        const vMoyenneDeVie = Math.floor(vMaxDeVie / 2) + 1; 
        
        const vPVNiveau1 = vMaxDeVie + pModConstitution;
        const vPVParNiveau = vMoyenneDeVie + pModConstitution;

        let vPVTotal = vPVNiveau1;
        if (this.aNiveau > 1) {
            vPVTotal += (this.aNiveau - 1) * vPVParNiveau;
        }

        const vHeaders = this.aTextes.hp_table_headers;
        
        let vHtmlTable = `
            <table class="hp-calculation-table">
                <thead>
                    <tr>
                        <th class="text-center">${vHeaders.niveau}</th>
                        <th class="text-center">${vHeaders.devie}</th>
                        <th class="text-center">${vHeaders.modcon}</th>
                        <th class="text-center">${vHeaders.pvmax}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="text-center">${this.aNiveau}</td>
                        <td class="text-center">${vMaxDeVie} (Max ${vJetDeVie})</td>
                        <td class="text-center">${this.mFormaterModificateur(pModConstitution)}</td>
                        <td class="text-center final-hp-value">${vPVTotal}</td>
                    </tr>
                </tbody>
            </table>
        `;
        
        this.mRemplirElementHTML('vHpCalculationTable', vHtmlTable);
    }


    mAllerPageSuivante() {
        // La validation n'est plus nécessaire, on peut toujours continuer
        const vLienSuivant = this.aTextes.lien_suivant;
        window.location.href = vLienSuivant;
    }
    
    mRemplirTextes() {
        if (!this.aTextes) return;

        document.title = this.aTextes.titre_page;
        this.mRemplirElement('vHeaderTitre', this.aTextes.titre_header);
        
        this.mRemplirElement('vNiveauSectionTitre', this.aTextes.section_niveau_titre);
        this.mRemplirElement('vNiveauSelectLabel', this.aTextes.select_niveau_label);
        
        this.mRemplirElement('vCaracteristiquesTitre', this.aTextes.section_carac_titre);

        const vRetourBtn = document.getElementById('vBoutonRetour');
        if (vRetourBtn) {
            vRetourBtn.textContent = this.aTextes.bouton_retour;
            vRetourBtn.href = this.aTextes.lien_retour; 
        }
        this.mRemplirElement('vNextButton', this.aTextes.bouton_suivant);
        
        this.mRemplirElement('vHpTitre', "Points de Vie");
    }

    async mInitialiserPage() {
        await this.mChargerDonnees();
        this.mRemplirTextes();
        this.mGenererInterface();
        
        // La validation n'est plus nécessaire, le bouton Suivant est toujours actif
        const vSuivantButton = document.getElementById('vNextButton');
        if (vSuivantButton) {
             vSuivantButton.disabled = false; // Toujours actif
             vSuivantButton.style.opacity = 1;
             vSuivantButton.onclick = (pEvent) => {
                if(pEvent) pEvent.preventDefault(); 
                this.mAllerPageSuivante();
            };
        }
        
        // Initialiser l'affichage des PV et des Modificateurs après la génération de l'interface
        this.aClesCarac.forEach(vCle => this.mMettreAJourAffichageScores(vCle));
        
        window.oCPage3 = this; 
    }
}

// Initialisation
const oCPage3 = new CPage3();