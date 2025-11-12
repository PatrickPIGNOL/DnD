/**
 * @class CPage3
 * @brief Gère la logique et l'affichage de la page de sélection des caractéristiques (page 3).
 */
class CPage3 {
    aTextes;
    aCaracteristiques;
    aRaceSelectionnee;
    aRaceDetails;
    aPointsAllouables;

    constructor() {
        this.aRaceSelectionnee = localStorage.getItem('raceSelectionnee');
        this.mInitialiserPage();
    }

    /**
     * @brief Initialise la page en chargeant les données et en configurant l'affichage.
     */
    mInitialiserPage() {
        this.mChargerDonnees().then(() => {
            this.mRemplirTextes();
            this.mGenererNiveauSelect();
            this.mAfficherRecapRace();
            this.mGenererTableCaracteristiques();
            this.mGenererAllocationBonus(); 
            this.mChargerSauvegarde();
            this.mAjouterEcouteurs();
        });
    }

    /**
     * @brief Charge les fichiers JSON et les données de la race sélectionnée.
     */
    async mChargerDonnees() {
        try {
            const vResponseTextes = await fetch('page3.json');
            const vDataTextes = await vResponseTextes.json();
            this.aTextes = vDataTextes.page3;

            const vResponseCarac = await fetch('caracteristiques.json');
            this.aCaracteristiques = await vResponseCarac.json();

            const vResponseRaces = await fetch('races.json');
            const vRaces = await vResponseRaces.json();
            
            this.aRaceDetails = vRaces.find(pRace => pRace.valeur === this.aRaceSelectionnee);

        } catch (vError) {
            console.error("Erreur de chargement des données pour la page 3:", vError);
        }
    }

    /**
     * @brief Rempli les textes statiques de la page.
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
     * @brief Remplit les éléments statiques de la page avec les textes chargés.
     */
    mRemplirTextes() {
        if (!this.aTextes) return;

        document.title = this.aTextes.titre_page;
        this.mRemplirElement('vHeaderTitre', this.aTextes.titre_header);
        this.mRemplirElement('vNiveauTitre', this.aTextes.section_niveau_titre);
        this.mRemplirElement('vNiveauLabel', this.aTextes.select_niveau_label);
        this.mRemplirElement('vRecapRaceTitre', this.aTextes.section_bonus_titre);
        this.mRemplirElement('vBonusAllocationTitre', this.aTextes.bonus_mod_titre);
        this.mRemplirElement('vBonusAllocationDescription', this.aTextes.bonus_mod_description);
        this.mRemplirElement('vCaracTitre', this.aTextes.section_carac_titre);
        this.mRemplirElement('vBoutonRetour', this.aTextes.bouton_retour);
        document.getElementById('vBoutonRetour').href = this.aTextes.lien_retour;
        this.mRemplirElement('vNextButton', this.aTextes.bouton_suivant);
    }
    
    /**
     * @brief Génère le menu déroulant de sélection du niveau.
     */
    mGenererNiveauSelect() {
        const vSelect = document.getElementById('vNiveauSelect');
        if (!vSelect || !this.aTextes.niveau_options) return;

        for (const vValue in this.aTextes.niveau_options) {
            const vOption = document.createElement('option');
            vOption.value = vValue;
            vOption.textContent = this.aTextes.niveau_options[vValue];
            vSelect.appendChild(vOption);
        }
        this.vSelect = vSelect;
        this.vSelect.value = '1';
    }

    /**
     * @brief Affiche le récapitulatif des bonus fixes de la race sélectionnée.
     */
    mAfficherRecapRace() {
        const vContainer = document.getElementById('vRecapRaceContainer');
        if (!vContainer) return;

        if (this.aRaceSelectionnee === '0' || !this.aRaceDetails) {
            vContainer.innerHTML = `<p>Aucun bonus fixe de race.</p>`;
            return;
        }

        let vHTML = `<h3>${this.aRaceDetails.nom}</h3>`;
        
        if (this.aRaceDetails.bonus_caracteristique) {
            vHTML += `<p>Bonus fixes :`;
            for (const vCarac in this.aRaceDetails.bonus_caracteristique) {
                vHTML += ` <strong>${vCarac}</strong> +${this.aRaceDetails.bonus_caracteristique[vCarac]}`;
            }
            vHTML += `</p>`;
        }
        
        vContainer.innerHTML = vHTML;
    }

    /**
     * @brief Génère le tableau des caractéristiques avec les entrées pour les scores.
     */
    mGenererTableCaracteristiques() {
        const vTableBody = document.getElementById('vCaracTableBody');
        if (!vTableBody || !this.aCaracteristiques) return;

        vTableBody.innerHTML = '';
        
        for (const vNom in this.aCaracteristiques) {
            const vCarac = this.aCaracteristiques[vNom];
            const vRow = document.createElement('tr');
            this.vRow = vRow;
            this.vRow.innerHTML = `
                <td>${vCarac.nom_complet} (${vCarac.nom_court})</td>
                <td><input type="number" id="vBaseScore-${vNom}" name="score-${vNom}" min="8" max="15" value="8" onchange="oCPage3.mCalculerCaracs()"></td>
                <td id="vBonusRace-${vNom}">+0</td>
                <td id="vBonusAlloue-${vNom}">+0</td>
                <td class="score-fixe-valeur" id="vScoreTotal-${vNom}">8</td>
                <td id="vModificateur-${vNom}">-1</td>
            `;
            vTableBody.appendChild(this.vRow);
        }
        
        this.mCalculerCaracs();
    }
    
    /**
     * @brief Génère les boutons radio d'allocation des points bonus de race.
     * Inclut l'option de Reset demandée.
     */
    mGenererAllocationBonus() {
        const vContainer = document.getElementById('vBonusAllocationContainer');
        if (!vContainer) return;
        
        vContainer.innerHTML = ''; 

        this.aPointsAllouables = this.mDeterminerPointsAllouables();
        
        let vAllocationHTML = '';
        
        // --- LIGNE DE RESET (value="0") ---
        const vResetHTML = `
            <div id="vBonusResetRow">
                <label>
                    <input 
                        type="radio" 
                        name="bonusAllocation" 
                        value="${this.aTextes.bonus_reset_value || '0'}" 
                        id="vRadioResetBonus"
                        onchange="oCPage3.mGererAllocationBonus()"
                    >
                    <strong>${this.aTextes.bonus_reset_label || 'Pas de Bonus (Reset)'}</strong>
                </label>
            </div>
        `;
        vAllocationHTML += vResetHTML;
        
        // 2. Générer les options d'allocation dynamique
        if (this.aPointsAllouables) {
            vAllocationHTML += this.mCreerOptionsAllocation(this.aPointsAllouables);
        } else {
            vAllocationHTML += `<p>Aucune allocation de points disponible pour la race sélectionnée.</p>`;
        }
        
        vContainer.innerHTML += vAllocationHTML; 
        
        // 3. SÉLECTION PAR DÉFAUT de l'option de Reset
        const vRadioReset = document.getElementById('vRadioResetBonus');
        if (vRadioReset) {
            vRadioReset.checked = true;
            this.mGererAllocationBonus(); 
        }
    }
    
    /**
     * @brief Détermine les points de race à allouer (logique simplifiée pour l'exemple).
     * @return {object|null} Les points allouables (e.g., { 'nom': '...', 'points': [2, 1] } ou null).
     */
    mDeterminerPointsAllouables() {
        if (!this.aRaceDetails || this.aRaceDetails.valeur === '0') {
            return null;
        }
        
        // Si la race n'a PAS de bonus fixes, on suppose qu'elle a des bonus allouables (+2 et +1)
        if (!this.aRaceDetails.bonus_caracteristique) {
            return {
                nom: "Allocation Standard (+2 et +1)",
                points: [2, 1]
            };
        }
        return null;
    }
    
    /**
     * @brief Crée le HTML pour les options d'allocation des points.
     * @param {object} pAllocation Les détails des points à allouer.
     * @return {string} Le HTML des options.
     */
    mCreerOptionsAllocation(pAllocation) {
        if (!pAllocation || !pAllocation.points) return '';
        
        let vHTML = `<h4>${pAllocation.nom}</h4>`;
        vHTML += `<div id="vBonusOptions">`;
        
        const vPointsStr = pAllocation.points.join('_');

        vHTML += `
            <label>
                <input 
                    type="radio" 
                    name="bonusAllocation" 
                    value="${vPointsStr}" 
                    onchange="oCPage3.mGererAllocationBonus()"
                >
                Allouer ${pAllocation.points.map(p => '+' + p).join(' et ')}
            </label>
        `;

        vHTML += `</div>`;
        
        return vHTML;
    }


    /**
     * @brief Gère la sélection des bonus d'allocation, applique le bonus de race fixe et calcule tout.
     */
    mGererAllocationBonus() {
        this.mAppliquerBonusFixes();
        
        const vRadioSelectionne = document.querySelector('input[name="bonusAllocation"]:checked');
        
        document.querySelectorAll('[id^="vBonusAlloue-"]').forEach(pElement => {
            this.pElement = pElement;
            this.pElement.textContent = '+0';
        });

        if (vRadioSelectionne && vRadioSelectionne.value !== (this.aTextes.bonus_reset_value || '0')) {
            // Logique d'allocation des points ici
            // Pour l'exemple, nous allons juste montrer un +1 sur la Force si l'allocation est choisie
            const vBonusTest = document.getElementById('vBonusAlloue-FOR');
            if (vBonusTest) {
                this.vBonusTest = vBonusTest;
                this.vBonusTest.textContent = '+1'; 
            }
        }
        
        this.mCalculerCaracs();
    }
    
    /**
     * @brief Applique les bonus de race fixes (colonne 3 du tableau).
     */
    mAppliquerBonusFixes() {
        document.querySelectorAll('[id^="vBonusRace-"]').forEach(pElement => {
            this.pElement = pElement;
            this.pElement.textContent = '+0';
        });

        if (this.aRaceDetails && this.aRaceDetails.bonus_caracteristique) {
            for (const vCarac in this.aRaceDetails.bonus_caracteristique) {
                const vElement = document.getElementById(`vBonusRace-${vCarac}`);
                const vBonus = this.aRaceDetails.bonus_caracteristique[vCarac];
                if (vElement) {
                    this.vElement = vElement;
                    this.vElement.textContent = `+${vBonus}`;
                }
            }
        }
    }
    
    /**
     * @brief Calcule les scores totaux et les modificateurs.
     */
    mCalculerCaracs() {
        for (const vNom in this.aCaracteristiques) {
            const vInputBase = document.getElementById(`vBaseScore-${vNom}`);
            const vElementBonusRace = document.getElementById(`vBonusRace-${vNom}`);
            const vElementBonusAlloue = document.getElementById(`vBonusAlloue-${vNom}`);
            const vElementScoreTotal = document.getElementById(`vScoreTotal-${vNom}`);
            const vElementModif = document.getElementById(`vModificateur-${vNom}`);
            
            if (vInputBase && vElementScoreTotal && vElementModif) {
                const vScoreBase = parseInt(vInputBase.value) || 0;
                const vBonusRace = parseInt(vElementBonusRace.textContent.replace('+', '')) || 0;
                const vBonusAlloue = parseInt(vElementBonusAlloue.textContent.replace('+', '')) || 0;
                
                const vScoreTotal = vScoreBase + vBonusRace + vBonusAlloue;
                const vModificateur = Math.floor((vScoreTotal - 10) / 2);
                
                this.vElementScoreTotal = vElementScoreTotal;
                this.vElementModif = vElementModif;
                this.vElementScoreTotal.textContent = vScoreTotal;
                this.vElementModif.textContent = (vModificateur >= 0 ? '+' : '') + vModificateur;
            }
        }
    }

    /**
     * @brief Ajoute les écouteurs d'événements à la page.
     */
    mAjouterEcouteurs() {
        document.getElementById('vNextButton').addEventListener('click', (pEvent) => {
            this.mEnregistrerEtPasser(pEvent);
        });
        document.getElementById('vNiveauSelect').addEventListener('change', () => {
            this.mCalculerCaracs(); 
        });
    }
    
    /**
     * @brief Enregistre les données et passe à la page suivante.
     * @param {Event} pEvent L'événement de clic.
     */
    mEnregistrerEtPasser(pEvent) {
        if (pEvent) pEvent.preventDefault();
        
        const vNiveau = document.getElementById('vNiveauSelect').value;
        localStorage.setItem('niveauSelectionne', vNiveau);
        
        const vScoresFinaux = {};
        for (const vNom in this.aCaracteristiques) {
            const vScore = document.getElementById(`vScoreTotal-${vNom}`).textContent;
            this.vScoresFinaux = vScoresFinaux;
            this.vScoresFinaux[vNom] = parseInt(vScore);
        }
        localStorage.setItem('scoresCaracteristiques', JSON.stringify(this.vScoresFinaux));
        
        window.location.href = this.aTextes.lien_suivant; 
    }
    
    /**
     * @brief Charge les données sauvegardées pour les caractéristiques et le niveau.
     */
    mChargerSauvegarde() {
        const vNiveauSauve = localStorage.getItem('niveauSelectionne');
        if (vNiveauSauve) {
            document.getElementById('vNiveauSelect').value = vNiveauSauve;
        }

        const vScoresSauves = JSON.parse(localStorage.getItem('scoresCaracteristiques'));
        if (vScoresSauves) {
            for (const vNom in vScoresSauves) {
                const vInputBase = document.getElementById(`vBaseScore-${vNom}`);
                if (vInputBase) {
                    this.vInputBase = vInputBase;
                    this.vInputBase.value = vScoresSauves[vNom]; 
                }
            }
        }
        
        this.mGererAllocationBonus(); 
    }
}

const oCPage3 = new CPage3();