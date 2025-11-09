document.addEventListener('DOMContentLoaded', () => {
    // Variables pour les éléments du DOM
    const vForm = document.getElementById('classSelectionForm');
    const vClassesOptionsContainer = document.getElementById('vClassesOptionsContainer');
    const vLoadingMessage = document.getElementById('vLoadingMessage');
    const vNextButton = document.getElementById('vNextButton');
    const vErrorMessage = document.getElementById('vErrorMessage');
    
    // Attributs de la classe (stockage des données)
    let aClassesData = [];
    const vLocalStorageKey = 'personnage_en_cours';

    /**
     * @method mChargerClasses
     * @description Charge les données de classes depuis le fichier JSON.
     */
    async function mChargerClasses() {
        try {
            // Requête GET vers le fichier statique
            const vResponse = await fetch('classes.json');
            if (!vResponse.ok) {
                throw new Error(`Erreur HTTP: ${vResponse.status}`);
            }
            this.aClassesData = await vResponse.json();
            
            this.vLoadingMessage.style.display = 'none';
            mAfficherListeClasses();
            
        } catch (vError) {
            console.error("Erreur lors du chargement de classes.json:", vError);
            this.vLoadingMessage.textContent = "Impossible de charger les données de classes. Veuillez contacter l'administrateur.";
            this.vLoadingMessage.style.color = 'red';
        }
    }

    /**
     * @method mAfficherListeClasses
     * @description Injecte le HTML pour chaque classe dans le conteneur.
     */
    function mAfficherListeClasses() {
        this.vClassesOptionsContainer.innerHTML = '';
        
        this.aClassesData.forEach((vClasse, vIndex) => {
            const vHtml = `
                <div class="classe-option-card">
                    <hr>
                    <label for="vClasseRadio-${vIndex}" class="classe-item-container">
                        <div class="classe-header">${vClasse.nom}</div>
                        <div class="classe-content">
                            <input type="radio" name="pClasseSelectionnee" value="${vClasse.nom}" id="vClasseRadio-${vIndex}">
                            <img src="${vClasse.image_url}" alt="Icône ${vClasse.nom}">
                            <div class="classe-details">${vClasse.description_html}</div>
                        </div>
                    </label>
                </div>
            `;
            this.vClassesOptionsContainer.innerHTML += vHtml;
        });

        // Activer le bouton Suivant après l'affichage
        this.vNextButton.disabled = false;
        
        // Écouter les changements pour s'assurer qu'une option est cochée
        this.vClassesOptionsContainer.addEventListener('change', mVerifierSelection);
    }
    
    /**
     * @method mVerifierSelection
     * @description Vérifie si une classe est cochée.
     */
    function mVerifierSelection() {
        this.vNextButton.disabled = !this.vForm.querySelector('input[name="pClasseSelectionnee"]:checked');
    }

    /**
     * @method mSoumettreClasseEtContinuer
     * @description Enregistre le choix et passe à l'étape 2.
     */
    function mSoumettreClasseEtContinuer(pEvent) {
        pEvent.preventDefault();
        this.vErrorMessage.textContent = '';
        
        const vSelectionne = this.vForm.querySelector('input[name="pClasseSelectionnee"]:checked');
        
        if (!vSelectionne) {
            this.vErrorMessage.textContent = "Veuillez sélectionner une classe.";
            return;
        }

        const vClasseNom = vSelectionne.value;
        
        // 1. Initialisation de l'Objet Personnage (avec la classe sélectionnée)
        const vPersonnage = {
            aNom: "", 
            aClasse: vClasseNom,
            aNiveau: 1, 
            aRace: null,
            aScores: { for: 0, dex: 0, con: 0, int: 0, sag: 0, cha: 0 }, 
            aPvMax: 0,
            aGrimoire: [],
            aHistorique: null
        };

        // 2. Stockage dans le localStorage
        localStorage.setItem(vLocalStorageKey, JSON.stringify(vPersonnage));

        // 3. Redirection vers l'étape 2
        window.location.href = 'page2_race.html'; 
    }

    // --- INITIALISATION ---
    this.vForm.addEventListener('submit', mSoumettreClasseEtContinuer);
    mChargerClasses();
});