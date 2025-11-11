class CPage3 {
    aTextes; 
    aScoresBase = {}; 
    aBonusRaciaux = {}; 
    aClassesData;
    aClasseSelectionnee;
    aPointsRestants = 27; 
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
        // Chargement des fichiers JSON
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
        
        // Récupération de la classe et des données précédentes
        const vClasseNom = localStorage.getItem('classeSelectionnee');
        if (vClasseNom && this.aClassesData && this.aClassesData.classes_scores_fixes) {
            this.aClasseSelectionnee = this.aClassesData.classes_scores_fixes[vClasseNom];
        }

        this.mInitialiserScores();
        this.mChargerSauvegarde();
    }

    mInitialiserScores() {
        this.aClesCarac.forEach(vCle => {
            this.aScoresBase[vCle] = 8;
            this.aBonusRaciaux[vCle] = 0;
        });
    }
    
    mChargerSauvegarde() {
        const vSavedScores = localStorage.getItem('scoresCaracteristiques');
        const vSavedBonus = localStorage.getItem('bonusRaciaux');
        const vSavedPoints = localStorage.getItem('pointsRestants');
        const vSavedNiveau = localStorage.getItem('niveauPersonnage');

        if (vSavedScores) {
            this.aScoresBase = JSON.parse(vSavedScores);
        }
        if (vSavedBonus) {
            this.aBonusRaciaux = JSON.parse(vSavedBonus);
        }
        if (vSavedPoints) {
            this.aPointsRestants = parseInt(vSavedPoints, 10);
        }
        if (vSavedNiveau) {
            this.aNiveau = parseInt(vSavedNiveau, 10);
        }
    }
    
    mSauvegarderEtat() {
        localStorage.setItem('scoresCaracteristiques', JSON.stringify(this.aScoresBase));
        localStorage.setItem('bonusRaciaux', JSON.stringify(this.aBonusRaciaux));
        localStorage.setItem('pointsRestants', this.aPointsRestants);
        localStorage.setItem('niveauPersonnage', this.aNiveau);
    }

    mCalculerModificateur(pScore) {
        return Math.floor((pScore - 10) / 2);
    }
    
    mCalculerCout(pScore) {
        let vCout = 0;
        for (let i = 8; i < pScore; i++) {
            vCout += (i >= 13) ? 2 : 1;
        }
        return vCout;
    }
    
    mFormaterModificateur(pMod) {
        return pMod >= 0 ? `+${pMod}` : `${pMod}`;
    }

    mModifierScore(pCle, pValeur) {
        const vScoreActuel = this.aScoresBase[pCle];
        const vNouveauScore = vScoreActuel + pValeur;
        
        if (vNouveauScore < 8 || vNouveauScore > 15) return; 

        const vCoutActuel = this.mCalculerCout(vScoreActuel);
        const vCoutNouveau = this.mCalculerCout(vNouveauScore);
        const vDiffCout = vCoutNouveau - vCoutActuel;

        if (this.aPointsRestants - vDiffCout >= 0) {
            this.aScoresBase[pCle] = vNouveauScore;
            this.aPointsRestants -= vDiffCout;
            
            this.mMettreAJourAffichageScores(pCle);
            this.mMettreAJourAffichageGeneral();
            this.mSauvegarderEtat();
        } else {
            alert(this.aTextes.erreur_points_insuffisants);
        }
    }
    
    mSelectionnerBonusRacial(pCle, pBonus) {
        this.aBonusRaciaux[pCle] = parseInt(pBonus, 10);
        this.mMettreAJourAffichageScores(pCle);
        this.mMettreAJourAffichageGeneral();
        this.mSauvegarderEtat();
    }
    
    mMettreAJourNiveau(pNouveauNiveau) {
        this.aNiveau = parseInt(pNouveauNiveau, 10);
        
        const vModConstitution = this.mCalculerModificateur(this.aScoresBase.constitution + this.aBonusRaciaux.constitution);
        this.mCalculerPointsDeVie(vModConstitution);
        this.mSauvegarderEtat();
    }

    mGenererCaracBlock(pCle) {
        const vNomCapitalise = this.aTextes.caracteristiques[pCle];
        const vScore = this.aScoresBase[pCle];
        
        // 1. Boutons de Point Buy (Score de Base)
        const vHtmlPointBuy = `
            <div class="score-base-controls">
                <button type="button" class="btn-modifier point-buy-btn" onclick="this.mModifierScore('${pCle}', -1)">-</button>
                <span id="vScoreBase${vNomCapitalise}" class="caracteristique-score">${vScore}</span>
                <button type="button" class="btn-modifier point-buy-btn" onclick="this.mModifierScore('${pCle}', 1)">+</button>
            </div>
        `;
        
        // 2. Radio Buttons de Bonus (+1 à +4)
        let vHtmlBonusHeaders = `<div class="bonus-header-colonne">${this.aTextes.bonus_labels.colonne_reset}</div>`;
        for (let i = 1; i <= 4; i++) {
             vHtmlBonusHeaders += `<div class="bonus-header-colonne">+${i}</div>`;
        }
        
        let vHtmlBonusSelect = '';
        for (let i = 0; i <= 4; i++) {
            const vId = `vBonus${pCle}${i}`;
            const vIsChecked = (this.aBonusRaciaux[pCle] === i) ? 'checked' : '';
            
            vHtmlBonusSelect += `
                <div class="bonus-colonne">
                    <input type="radio" id="${vId}" name="bonus_${pCle}" value="${i}" 
                           ${vIsChecked} 
                           onclick="this.mSelectionnerBonusRacial('${pCle}', this.value)">
                    <label for="${vId}" class="radio-label">${i === 0 ? '0' : `+${i}`}</label>
                </div>
            `;
        }
        
        // 3. Structure complète du bloc
        return `
            <div id="vCaracBlock_${pCle}" class="caracteristique-block">
                <h3>${vNomCapitalise}</h3>
                
                <div class="score-base-row">
                    ${vHtmlPointBuy}
                </div>

                <div class="bonus-select-container">
                    <p class="bonus-select-titre">${this.aTextes.calcul_labels.select} (+0 à +4)</p>
                    <div class="bonus-select-grid">
                        ${vHtmlBonusSelect}
                    </div>
                </div>

                <div class="calculation-breakdown">
                    <div>
                        <span>Score Total :</span>
                        <strong id="vScoreFinal${vNomCapitalise}" class="result-score"></strong>
                    </div>
                    <div>
                        <span>${this.aTextes.calcul_labels.base} :</span>
                        <span id="vModBase${vNomCapitalise}"></span>
                    </div>
                    <div>
                        <span>Bonus Racial :</span>
                        <span id="vModSelect${vNomCapitalise}"></span>
                    </div>
                    <div>
                        <span>${this.aTextes.calcul_labels.final} :</span>
                        <strong id="vModFinal${vNomCapitalise}" class="result-mod"></strong>
                    </div>
                </div>
            </div>
        `;
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
        // Attacher l'événement ici si le HTML ne le fait pas
        vSelect.onchange = (pEvent) => {
            this.mMettreAJourNiveau(pEvent.target.value);
        };
    }
    
    mGenererInterface() {
        this.mGenererNiveauSelect();
        
        const vContainer = document.getElementById('vCaracteristiquesWrapper');
        if (!vContainer) return; 
        
        vContainer.innerHTML = ''; 

        this.aClesCarac.forEach(vCle => {
            vContainer.insertAdjacentHTML('beforeend', this.mGenererCaracBlock(vCle));
        });
        
        this.aClesCarac.forEach(vCle => this.mMettreAJourAffichageScores(vCle));
    }
    
    mMettreAJourAffichageScores(pCle) {
        const vNomCapitalise = this.aTextes.caracteristiques[pCle];

        const vScoreBase = this.aScoresBase[pCle];
        const vBonusSelectionne = this.aBonusRaciaux[pCle];
        const vScoreFinal = vScoreBase + vBonusSelectionne;
        
        const vModBase = this.mCalculerModificateur(vScoreBase);
        const vModFinal = this.mCalculerModificateur(vScoreFinal);

        this.mRemplirElement(`vScoreBase${vNomCapitalise}`, vScoreBase);
        this.mRemplirElement(`vScoreFinal${vNomCapitalise}`, vScoreFinal);
        this.mRemplirElement(`vModBase${vNomCapitalise}`, this.mFormaterModificateur(vModBase));
        this.mRemplirElement(`vModSelect${vNomCapitalise}`, this.mFormaterModificateur(vBonusSelectionne)); 
        this.mRemplirElement(`vModFinal${vNomCapitalise}`, this.mFormaterModificateur(vModFinal));

        if (pCle === 'constitution') {
            this.mCalculerPointsDeVie(vModFinal);
        }
        
        // Mettre à jour l'état des radio boutons
        const vRadio = document.getElementById(`vBonus${pCle}${vBonusSelectionne}`);
        if (vRadio) vRadio.checked = true;
    }
    
    mCalculerPointsDeVie(pModConstitution) {
        if (!this.aClasseSelectionnee) {
            this.mRemplirElement('vHpCalculation', "Sélectionnez d'abord votre classe.");
            return;
        }

        const vJetDeVie = this.aClasseSelectionnee.jetDeVie; 
        const vMaxDeVie = parseInt(vJetDeVie.substring(1), 10);
        // Utilisation de la moyenne D&D standard (HD/2 + 1)
        const vMoyenneDeVie = Math.floor(vMaxDeVie / 2) + 1; 
        
        // PV au niveau 1 (Max HD + CON mod)
        let vPVTotal = vMaxDeVie + pModConstitution;
        let vExplicationPV = `${vMaxDeVie} (Max ${vJetDeVie} de la classe) + ${this.mFormaterModificateur(pModConstitution)} (Mod. CON)`;
        
        if (this.aNiveau > 1) {
            // Ajout des PV pour les niveaux suivants (N-1)
            const vPVParNiveau = vMoyenneDeVie + pModConstitution;
            vPVTotal = vMaxDeVie + pModConstitution + ((this.aNiveau - 1) * vPVParNiveau);
            
            vExplicationPV = `[${vMaxDeVie} + Mod. CON] (Niv. 1) + [${this.aNiveau - 1} x (${vMoyenneDeVie} + Mod. CON)] (Niv. 2+)`;
        }
        
        this.mRemplirElement('vHpTitre', this.aTextes.calcul_labels.hp_titre);
        this.mRemplirElementHTML('vHpExplication', this.aTextes.calcul_labels.hp_explication);

        this.mRemplirElementHTML('vHpCalculation', `
            ${vExplicationPV} = <strong class="final-hp-value">${vPVTotal} PV</strong>
        `);
    }

    mMettreAJourAffichageGeneral() {
        this.mRemplirElement('vPointsRestantsTexte', `${this.aPointsRestants} ${this.aTextes.points_restants_label}`);

        const vSuivantButton = document.getElementById('vNextButton');
        const vEstFini = this.aPointsRestants === 0;
        
        if (vSuivantButton) {
             vSuivantButton.disabled = !vEstFini;
             vSuivantButton.style.opacity = vEstFini ? 1 : 0.5;
        }
    }

    mAllerPageSuivante() {
        if (this.aPointsRestants === 0) {
            const vLienSuivant = this.aTextes.lien_suivant;
            window.location.href = vLienSuivant;
        } else {
            alert(this.aTextes.erreur_terminer_distribution);
        }
    }
    
    mRemplirTextes() {
        if (!this.aTextes) return;

        document.title = this.aTextes.titre_page;
        this.mRemplirElement('vHeaderTitre', this.aTextes.titre_header);
        
        this.mRemplirElement('vNiveauSectionTitre', this.aTextes.section_niveau_titre);
        this.mRemplirElement('vNiveauSelectLabel', this.aTextes.select_niveau_label);
        
        this.mRemplirElement('vCaracBaseTitre', this.aTextes.titre_section_base);
        this.mRemplirElement('vMethodeIntroduction', this.aTextes.methode_introduction);
        
        this.mRemplirElement('vCaracteristiquesTitre', this.aTextes.section_carac_titre);

        const vRetourBtn = document.getElementById('vBoutonRetour');
        if (vRetourBtn) {
            vRetourBtn.textContent = this.aTextes.bout