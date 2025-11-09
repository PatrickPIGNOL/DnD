document.addEventListener('DOMContentLoaded', () => { 
    // Variables de classe
    let aPersonnage = {};
    const vLocalStorageKey = 'personnage_en_cours';
    
    // Scores de base (méthode Standard Array, pour la simplicité)
    const vScoresDeBase = [15, 14, 13, 12, 10, 8];
    const vNomsCarac = { for: "Force", dex: "Dextérité", con: "Constitution", int: "Intelligence", sag: "Sagesse", cha: "Charisme" };
    
    // Variables DOM
    const vClasseAffichee = document.getElementById('vClasseAffichee');
    const vRaceAffichee = document.getElementById('vRaceAffichee');
    const vNiveauInput = document.getElementById('vNiveauInput');
    const vPvMaxAffiches = document.getElementById('vPvMaxAffiches');
    const vCaracScoresContainer = document.getElementById('vCaracScoresContainer');
    const vForm = document.getElementById('levelCaracForm');
    const vErrorMessage = document.getElementById('vErrorMessage');

    // ** DONNÉES SIMULÉES : REMPLACER PAR LE CHARGEMENT DE classes.json VIA fetch()
    const vClassesProgressionSimule = [
        { aNom: "Guerrier", aDesVie: 10, aPvNiveau1: 10, aCaracPrimaires: ["for", "con"] }, // 1d10
        { aNom: "Mage", aDesVie: 6, aPvNiveau1: 6, aCaracPrimaires: ["int", "con"] },       // 1d6
        // Ajoutez ici les autres données de progression nécessaires
    ];

    /**
     * @method mChargerSession
     * @description Récupère la session du localStorage et vérifie les données requises.
     * @returns {boolean} Vrai si le chargement a réussi.
     */
    function mChargerSession() {
        const vPersonnageJson = localStorage.getItem(vLocalStorageKey);

        if (!vPersonnageJson) {
            alert("Session expirée. Retour à l'Étape 1.");
            window.location.href = 'page1_classe.html';
            return false;
        }

        this.aPersonnage = JSON.parse(vPersonnageJson);
        
        // Vérification des données précédentes
        if (!this.aPersonnage.aClasse || !this.aPersonnage.aRace) {
            alert("Classe ou Race non définie. Retour à l'Étape 2.");
            window.location.href = 'page2_race.html';
            return false;
        }

        this.vClasseAffichee.textContent = this.aPersonnage.aClasse;
        this.vRaceAffichee.textContent = this.aPersonnage.aRace;
        
        return true;
    }
    
    /**
     * @method mCalculerModificateur
     * @description Calcule le modificateur d'une caractéristique.
     * @param {number} pScore - Le score de caractéristique.
     * @returns {number} Le modificateur.
     */
    function mCalculerModificateur(pScore) {
        return Math.floor((pScore - 10) / 2);
    }
    
    /**
     * @method mAttribuerScores
     * @description Assigne les scores de base aux caractéristiques, priorisant les caracs de classe.
     */
    function mAttribuerScores() {
        // Logique simplifiée : les deux plus hauts scores vont aux caracs primaires de la classe
        const vDefClasse = this.vClassesProgressionSimule.find(vC => vC.aNom === this.aPersonnage.aClasse);
        if (!vDefClasse) return;

        let vScoresRestants = [...this.vScoresDeBase];
        let vScoresAssignes = {};

        // 1. Attribuer les deux meilleurs scores aux caracs primaires
        vDefClasse.aCaracPrimaires.forEach(vCarac => {
            if (vScoresRestants.length > 0) {
                vScoresAssignes[vCarac] = vScoresRestants.shift(); // Prend et enlève le meilleur score
            }
        });

        // 2. Attribuer les scores restants aux autres caractéristiques (ordre alphabétique for, dex, etc.)
        Object.keys(this.vNomsCarac).forEach(vCarac => {
            if (!vScoresAssignes.hasOwnProperty(vCarac) && vScoresRestants.length > 0) {
                vScoresAssignes[vCarac] = vScoresRestants.shift();
            }
        });

        this.aPersonnage.aScores = vScoresAssignes;
        mAfficherScores();
    }
    
    /**
     * @method mAfficherScores
     * @description Injecte les scores de carac dans le DOM.
     */
    function mAfficherScores() {
        this.vCaracScoresContainer.innerHTML = '';
        
        // Ordre d'affichage traditionnel
        const vOrdre = ['for', 'dex', 'con', 'int', 'sag', 'cha'];
        
        vOrdre.forEach(vCaracKey => {
            const vScore = this.aPersonnage.aScores[vCaracKey];
            const vMod = mCalculerModificateur(vScore);
            const vModSigne = vMod >= 0 ? `+${vMod}` : vMod;
            
            const vHtml = `
                <div class="carac-item">
                    <span class="carac-nom">${this.vNomsCarac[vCaracKey]}</span>
                    <span class="carac-score">${vScore}</span>
                    <span class="carac-mod">${vModSigne}</span>
                </div>
            `;
            this.vCaracScoresContainer.innerHTML += vHtml;
        });
    }

    /**
     * @method mCalculerPvMax
     * @description Calcule les PV totaux en utilisant le maximum.
     */
    function mCalculerPvMax() {
        const vNiveau = parseInt(this.vNiveauInput.value);
        if (isNaN(vNiveau) || vNiveau < 1) return;
        
        const vDefClasse = this.vClassesProgressionSimule.find(vC => vC.aNom === this.aPersonnage.aClasse);
        if (!vDefClasse) return;

        // Le modificateur de CON est appliqué à chaque niveau
        const vModCon = mCalculerModificateur(this.aPersonnage.aScores.con);
        
        let vPvTotal = 0;
        
        // PV au niveau 1 = maximum du dé de vie + modificateur CON
        vPvTotal += vDefClasse.aPvNiveau1 + vModCon; 
        
        // PV pour les niveaux supérieurs (N-1) = max du dé de vie + modificateur CON, pour chaque niveau
        if (vNiveau > 1) {
            vPvTotal += (vNiveau - 1) * (vDefClasse.aDesVie + vModCon); 
        }

        // Les PV minimums sont 1 (pour un Dd8, même si Con est très négative)
        vPvTotal = Math.max(vPvTotal, vNiveau); 

        this.aPersonnage.aPvMax = vPvTotal;
        this.vPvMaxAffiches.textContent = vPvTotal;
    }

    /**
     * @method mRemplirOptionsNiveau
     * @description Rempli le select des niveaux de 1 à 20.
     */
    function mRemplirOptionsNiveau() {
        for (let vI = 1; vI <= 20; vI++) {
            const vOption = document.createElement('option');
            vOption.value = vI;
            vOption.textContent = `Niveau ${vI}`;
            this.vNiveauInput.appendChild(vOption);
        }
        // Pré-sélectionner le niveau 1 (ou celui déjà sauvegardé)
        this.vNiveauInput.value = this.aPersonnage.aNiveau || 1; 
    }
    
    /**
     * @method mSoumettreNiveauEtContinuer
     * @description Valide, sauvegarde le niveau et passe à l'étape 4.
     */
    function mSoumettreNiveauEtContinuer(pEvent) {
        pEvent.preventDefault();
        this.vErrorMessage.textContent = '';
        
        const vNiveauChoisi = parseInt(this.vNiveauInput.value);

        if (isNaN(vNiveauChoisi) || vNiveauChoisi < 1 || vNiveauChoisi > 20) {
            this.vErrorMessage.textContent = "Veuillez sélectionner un niveau valide entre 1 et 20.";
            return;
        }

        // Sauvegarder l'état final de cette page
        this.aPersonnage.aNiveau = vNiveauChoisi;
        // Les PV et Scores sont déjà mis à jour dans l'objet par les fonctions de calcul

        localStorage.setItem(vLocalStorageKey, JSON.stringify(this.aPersonnage));
        
        // Redirection vers l'étape 4
        window.location.href = 'page4_historique.html';
    }

    // --- INITIALISATION ---
    if (mChargerSession()) {
        mRemplirOptionsNiveau();
        mAttribuerScores(); // Attribuer les scores basés sur la classe
        mCalculerPvMax(); // Calculer les PV basés sur le niveau et la CON
        
        // Écouter le changement de niveau pour recalculer les PV immédiatement
        this.vNiveauInput.addEventListener('change', mCalculerPvMax);
        
        this.vForm.addEventListener('submit', mSoumettreNiveauEtContinuer);
    }
});