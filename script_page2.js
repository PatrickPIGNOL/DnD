document.addEventListener('DOMContentLoaded', () => {
    // Variable pour l'objet Personnage
    let aPersonnage = {};
    // Constante pour le nom de la clé de stockage
    const vLocalStorageKey = 'personnage_en_cours';

    // Variables DOM
    const vClasseAffichee = document.getElementById('vClasseAffichee');
    const vRaceOptionsContainer = document.getElementById('vRaceOptionsContainer');
    const vForm = document.getElementById('raceSelectionForm');
    const vErrorMessage = document.getElementById('vErrorMessage');

    // ** DONNÉES SIMULÉES : REMPLACER PAR LE CHARGEMENT DE classes.json **
    // Dans votre code final, cette donnée sera chargée via un fetch('classes.json')
    const vClassesDataSimule = [
        {
            aNom: "Guerrier",
            aRacesPreferees: ["Humain", "Nain", "Demi-Orque", "Elfe"],
            aImagesPath: "images/Guerrier"
        },
        {
            aNom: "Mage",
            aRacesPreferees: ["Elfe", "Tieffelin", "Gnome"],
            aImagesPath: "images/Mage"
        },
        // ... (ajouter les autres classes ici)
    ];

    /**
     * @method mChargerSessionEtInitialiser
     * @description Charge la session du localStorage et prépare l'affichage.
     * @returns {boolean} Vrai si le chargement a réussi.
     */
    function mChargerSessionEtInitialiser() {
        const vPersonnageJson = localStorage.getItem(vLocalStorageKey);

        if (!vPersonnageJson) {
            alert("Session expirée ou non démarrée. Redirection vers l'Étape 1.");
            window.location.href = 'page1_classe.html';
            return false;
        }

        this.aPersonnage = JSON.parse(vPersonnageJson);

        // Afficher la classe chargée
        this.vClasseAffichee.textContent = this.aPersonnage.aClasse;

        // Trouver les données de la classe dans notre base de données locale
        const vDefClasse = this.vClassesDataSimule.find(vC => vC.aNom === this.aPersonnage.aClasse);

        if (!vDefClasse) {
            this.vRaceOptionsContainer.innerHTML = "<p>Erreur : Définition de la classe non trouvée.</p>";
            return false;
        }

        mAfficherOptionsRace(vDefClasse);
        return true;
    }

    /**
     * @method mAfficherOptionsRace
     * @param {object} pDefClasse - Définition de la classe actuelle.
     */
    function mAfficherOptionsRace(pDefClasse) {
        this.vRaceOptionsContainer.innerHTML = '';
        
        pDefClasse.aRacesPreferees.forEach((vRace) => {
            const vRaceElement = document.createElement('div');
            vRaceElement.className = 'race-option-card';
            
            // Le nom d'image est construit avec le chemin de la classe et le nom de la race en minuscules
            const vImagePath = `${pDefClasse.aImagesPath}/${vRace.toLowerCase()}.jpg`;
            
            vRaceElement.innerHTML = `
                <input type="radio" name="pRaceSelectionnee" value="${vRace}" id="vRace-${vRace}">
                <label for="vRace-${vRace}">
                    <img src="${vImagePath}" alt="${vRace} ${pDefClasse.aNom}" class="race-image">
                    <span class="race-name">${vRace}</span>
                </label>
            `;
            this.vRaceOptionsContainer.appendChild(vRaceElement);
        });
        
        // Pré-sélectionner la race si elle existe déjà dans l'objet aPersonnage
        if (this.aPersonnage.aRace) {
            const vRadio = document.getElementById(`vRace-${this.aPersonnage.aRace}`);
            if (vRadio) vRadio.checked = true;
        }
    }

    /**
     * @method mSoumettreRaceEtContinuer
     * @description Valide la sélection, sauvegarde la race et passe à l'étape 3.
     */
    function mSoumettreRaceEtContinuer(pEvent) {
        pEvent.preventDefault();
        this.vErrorMessage.textContent = '';
        
        // Récupérer la valeur du radio button sélectionné
        const vRaceSelectionneeElement = this.vForm.querySelector('input[name="pRaceSelectionnee"]:checked');

        if (!vRaceSelectionneeElement) {
            this.vErrorMessage.textContent = "Veuillez sélectionner une race pour continuer.";
            return;
        }
        
        const vRaceChoisie = vRaceSelectionneeElement.value;
        
        // Mise à jour de l'objet Personnage
        this.aPersonnage.aRace = vRaceChoisie;
        
        // Sauvegarde de l'état dans le localStorage
        localStorage.setItem(vLocalStorageKey, JSON.stringify(this.aPersonnage));
        
        // Redirection vers l'étape 3
        window.location.href = 'page3_niveau_carac.html';
    }

    // --- INITIALISATION ---
    if (mChargerSessionEtInitialiser()) {
        this.vForm.addEventListener('submit', mSoumettreRaceEtContinuer);
    }
});