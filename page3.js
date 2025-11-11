class CPage3 {
    aTextes;
    aClassesListe; 
    aCaracteristiquesData; 
    
    aCaracteristiques = ["Force", "Dextérité", "Constitution", "Intelligence", "Sagesse", "Charisme"];

    // NOTE: Ces valeurs doivent être chargées depuis le localStorage. Elles sont simulées ici.
    aClasseSelectionnee = "Magicien"; 
    aRaceSelectionnee = { nom: "Half-Elf" }; 
    
    aScoresCaracDeBase = {}; // Scores fixes (Classe + Bonus de Classe)
    aScoresCaracFinaux = {}; // Scores finaux (Base + Race)
    

    constructor() {
        this.mInitialiserPage();
    }

    /**
     * @brief Charge tous les fichiers JSON nécessaires.
     */
    async mChargerDonnees() {
        // 1. Chargement des textes (page3.json)
        try {
            const vResponseTextes = await fetch('page3.json'); 
            const vDataTextes = await vResponseTextes.json();
            this.aTextes = vDataTextes.page3;
            console.log("page3.json chargé avec succès.");
        } catch (vError) {
            console.error("ERREUR lors du chargement ou parsing de page3.json:", vError);
        }
        
        // 2. Chargement des données des classes (classes.json)
        try {
            const vResponseClasses = await fetch('classes.json');
            this.aClassesListe = await vResponseClasses.json(); 
            console.log("classes.json chargé avec succès.");
        } catch (vError) {
            console.error("ERREUR lors du chargement ou parsing de classes.json:", vError);
        }
        
        // 3. Chargement des données de caractéristiques (caracteristiques.json)
        try {
            const vResponseCarac = await fetch('caracteristiques.json');
            this.aCaracteristiquesData = await vResponseCarac.json();
            console.log("caracteristiques.json chargé avec succès.");
        } catch (vError) {
            console.error("ERREUR lors du chargement ou parsing de caracteristiques.json:", vError);
        }
    }

    /**
     * @brief Rempli les options du sélecteur de niveau.
     */
    mRemplirNiveauOptions() {
        const vSelectLevel = document.getElementById('pLevel');
        let vOptionsHtml = '';
        
        const vLevelOptions = this.aTextes.niveau_options; 

        for (const vValue in vLevelOptions) {
            const vText = vLevelOptions[vValue];
            const vSelected = (vValue === "3") ? ' selected' : ''; 
            vOptionsHtml += `<option value="${vValue}"${vSelected}>${vText}</option>`;
        }
        vSelectLevel.innerHTML = vOptionsHtml;
    }

    /**
     * @brief Injecte le contenu du JSON dans le HTML.
     */
    mRemplirTextes() {
        if (!this.aTextes) return;

        // Titre et Header
        document.getElementById('vPageTitle').textContent = this.aTextes.titre_page;
        document.getElementById('vHeaderTitre').textContent = this.aTextes.titre_header;
        
        // Section Niveau
        document.getElementById('vNiveauTitre').textContent = this.aTextes.section_niveau_titre;
        document.getElementById('vNiveauLabel').textContent = this.aTextes.select_niveau_label;
        this.mRemplirNiveauOptions();

        // Section Bonus Race
        document.getElementById('vBonusRaceTitre').textContent = this.aTextes.section_bonus_titre;
        document.getElementById('vBonusChargement').textContent = this.aTextes.bonus_chargement;
        document.getElementById('vBonusModTitre').textContent = this.aTextes.bonus_mod_titre;
        document.getElementById('vBonusModDescription').textContent = this.aTextes.bonus_mod_description;

        // Section Caractéristiques
        document.getElementById('vCaracTitre').textContent = this.aTextes.section_carac_titre;

        // Boutons
        document.getElementById('vBoutonRetour').textContent = this.aTextes.bouton_retour;
        document.getElementById('vSuivantButton').textContent = this.aTextes.bouton_suivant;
    }
    
    /**
     * @brief Calcule le Modificateur de Caractéristique (MOD) pour une valeur donnée.
     * @param pValeur La valeur de caractéristique brute.
     * @return Le modificateur.
     */
    mCalculerModificateur(pValeur) {
        // Formule : Arrondi inférieur((Valeur / 2) - 4.5)
        return Math.floor((pValeur / 2.0) - 4.5);
    }
    
    /**
     * @brief Calcule les Points de Vie (PV) totaux.
     * @param pNiveau Le niveau du personnage.
     * @param pClasseNom Le nom de la classe.
     * @param pScoreCon La valeur de Constitution du personnage.
     * @return Le nombre total de Points de Vie.
     */
    mCalculerPointsDeVie(pNiveau, pClasseNom, pScoreCon) {
        const vClasseStats = this.aCaracteristiquesData.classes_scores_fixes[pClasseNom];
        if (!vClasseStats || !vClasseStats.jetDeVie) return 0;
        
        const vDeVie = parseInt(vClasseStats.jetDeVie.replace('d', '')); 
        const vBonusCon = this.mCalculerModificateur(pScoreCon);
        
        // Formule : niveau * (dé de vie + bonus de constitution)
        const vPointsDeVie = pNiveau * (vDeVie + vBonusCon);
        
        return Math.max(1, vPointsDeVie);
    }

    /**
     * @brief Récupère les scores de caractéristiques fixes basés sur la classe sélectionnée.
     * @param pClasseNom Le nom de la classe sélectionnée.
     * @return L'objet des scores de base fixes.
     */
    mCalculerScoresDeBase(pClasseNom) {
        const vScoresFixes = this.aCaracteristiquesData.classes_scores_fixes[pClasseNom];
        if (!vScoresFixes) {
            let vScores = {};
            this.aCaracteristiques.forEach(vCarac => vScores[vCarac] = 10);
            return vScores;
        }

        return {
            "Force": vScoresFixes.Force,
            "Dextérité": vScoresFixes.Dextérité,
            "Constitution": vScoresFixes.Constitution,
            "Intelligence": vScoresFixes.Intelligence,
            "Sagesse": vScoresFixes.Sagesse,
            "Charisme": vScoresFixes.Charisme
        };
    }

    /**
     * @brief Récupère les bonus de race sélectionnés par l'utilisateur.
     * @return Objet contenant les bonus totaux (ex: {Force: 0, Dextérité: 1, ...}).
     */
    mRecupererBonusRaceSelectionnes() {
        let vBonusRace = {};
        
        this.aCaracteristiques.forEach(vCaracNomComplet => {
            const vCaracKey = vCaracNomComplet.substring(0, 3);
            const vRadioGroupName = `pBonus${vCaracKey}`;
            
            const vSelectedRadio = document.querySelector(`input[name="${vRadioGroupName}"]:checked`);
            
            const vBonus = vSelectedRadio ? parseInt(vSelectedRadio.value) : 0;
            vBonusRace[vCaracNomComplet] = vBonus;
        });

        return vBonusRace;
    }

    /**
     * @brief Calcule les scores de caractéristiques finaux (Base + Race).
     */
    mCalculerScoresFinaux() {
        let vScoresFinaux = {};
        
        // Gérer le cas Humain (+1 partout, non modifiable)
        const vBonusRace = this.aRaceSelectionnee.nom === "Humain" 
            ? { "Force": 1, "Dextérité": 1, "Constitution": 1, "Intelligence": 1, "Sagesse": 1, "Charisme": 1 }
            : this.mRecupererBonusRaceSelectionnes();

        // Ajout des bonus
        this.aCaracteristiques.forEach(vCarac => {
            const vScoreBase = this.aScoresCaracDeBase[vCarac] || 0;
            const vBonus = vBonusRace[vCarac] || 0;
            vScoresFinaux[vCarac] = vScoreBase + vBonus;
        });

        this.aScoresCaracFinaux = vScoresFinaux;
    }

    /**
     * @brief Affiche les scores finaux et les PV dans la grille.
     */
    mAfficherCaracteristiques() {
        // 1. Calcul des scores FINAUX (Base + Race)
        this.mCalculerScoresFinaux(); 
        
        // 2. Récupération des valeurs pour le calcul des PV
        const vClasseSelectionnee = this.aClasseSelectionnee;
        const vNiveauSelectionne = parseInt(document.getElementById('pLevel').value) || 1;
        
        const vScoreConFinal = this.aScoresCaracFinaux["Constitution"];
        const vBonusConFinal = this.mCalculerModificateur(vScoreConFinal);
        
        // Calcul des Points de Vie totaux
        const vPointsDeVie = this.mCalculerPointsDeVie(vNiveauSelectionne, vClasseSelectionnee, vScoreConFinal);
        
        // --- Affichage du contenu ---
        const vContainer = document.getElementById('vCaracGridContainer');
        let vHtml = '';
        
        // 1. Affichage des Points de Vie (PV)
        vHtml += `
            <div class="carac-pv">
                <span class="carac-nom">POINTS DE VIE</span>
                <span class="carac-score">${vPointsDeVie}</span>
                <span class="carac-mod">(Mod Con : ${vBonusConFinal >= 0 ? '+' : ''}${vBonusConFinal})</span>
            </div>
            <hr>
        `;

        // 2. Affichage des 6 Caractéristiques
        this.aCaracteristiques.forEach(vCaracNomComplet => {
            const vScore = this.aScoresCaracFinaux[vCaracNomComplet];
            const vModificateur = this.mCalculerModificateur(vScore);
            const vSigneMod = vModificateur >= 0 ? '+' : '';
            
            vHtml += `
                <div class="carac-item">
                    <span class="carac-nom">${vCaracNomComplet.toUpperCase()}</span>
                    <span class="carac-score">${vScore}</span>
                    <span class="carac-mod">(${vSigneMod}${vModificateur})</span>
                </div>
            `;
        });
        vContainer.innerHTML = vHtml;
    }

    /**
     * @brief Génère les sélecteurs de radio buttons pour les bonus de race, groupés par position verticale.
     */
    mGenererSelecteursBonus() {
        const vContainer = document.getElementById('vRaceBonusPointsContainer');
        const vBonusModSection = document.getElementById('vRaceBonusModification');
        
        // Logique Humain (inchangée)
        if (this.aRaceSelectionnee && this.aRaceSelectionnee.nom === "Humain") {
             vBonusModSection.style.display = 'none';
             document.getElementById('vBonusRaceDisplay').innerHTML = '<p>**Humain : +1 à toutes les Caractéristiques.** Ce bonus est automatique et non modifiable.</p>';
             return;
        }

        vBonusModSection.style.display = 'grid'; 

        let vHtml = '';
        const vCaracMap = this.aTextes.caracteristiques; 
        
        // Les noms des groupes de radio buttons (colonnes)
        const vNames = ["pBonusRace_1", "pBonusRace_2", "pBonusRace_3"];

        for (const vCaracKey in vCaracMap) {
            const vCaracNomComplet = vCaracMap[vCaracKey];
            
            let vInputsHtml = '';
            
            // Création des trois radios, chacun appartenant à un groupe de colonne différent
            vNames.forEach((vName, vIndex) => {
                // La valeur est le nom de la Caractéristique (ex: Force, Dextérité)
                // Le nom du groupe est pBonusRace_1, pBonusRace_2, pBonusRace_3
                // Par défaut, le troisième bonus est coché à 'non' pour que 0 points soit possible si rien n'est sélectionné.
                
                vInputsHtml += `
                    <label>
                        <input type="radio" name="${vName}" value="${vCaracNomComplet}"> +1 Point
                    </label>
                `;
            });
            
            // Ajouter une option "non sélectionné" pour chaque colonne afin de pouvoir ne pas utiliser les points
            vInputsHtml += `<input type="radio" name="pBonusRace_unassigned_${vCaracKey}" value="0" checked style="display:none;">`;

            vHtml += `
                <div class="carac-bonus-selector" data-carac-name="${vCaracNomComplet}">
                    <h4>${vCaracNomComplet}</h4>
                    <div>
                        ${vInputsHtml}
                    </div>
                </div>
            `;
        }
        vContainer.innerHTML = vHtml;

        // Écouteur pour tous les radio buttons pour le recalcul
        document.querySelectorAll('#vRaceBonusPointsContainer input[type="radio"]').forEach(pRadio => {
            pRadio.onchange = () => this.mAfficherCaracteristiques();
        });
        
        // Une logique de sélection par défaut est nécessaire, mais pour l'instant, on laisse l'utilisateur choisir.
    }

    /**
     * @brief Initialise la page, charge les données et remplit le contenu.
     */
    async mInitialiserPage() {
        await this.mChargerDonnees();
        this.mRemplirTextes();
        
        // Calculer les scores de base (classe) une seule fois
        this.aScoresCaracDeBase = this.mCalculerScoresDeBase(this.aClasseSelectionnee);
        
        // Afficher les sélecteurs de bonus de race et placer les écouteurs des radios
        this.mGenererSelecteursBonus(); 
        
        // Afficher les scores initiaux et placer l'écouteur du niveau
        this.mAfficherCaracteristiques();
        
        // Écouteur pour le niveau
        document.getElementById('pLevel').onchange = () => this.mAfficherCaracteristiques();
    }
}

new CPage3();