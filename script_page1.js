document.addEventListener('DOMContentLoaded', () => {
    // Variables locales pour les éléments du DOM (sans 'this.')
    const vForm = document.getElementById('classSelectionForm');
    const vClassesOptionsContainer = document.getElementById('vClassesOptionsContainer');
    const vLoadingMessage = document.getElementById('vLoadingMessage');
    const vNextButton = document.getElementById('vNextButton');
    const vErrorMessage = document.getElementById('vErrorMessage');
    
    // Variables pour l'état de l'application (sans 'a' car dans la portée locale du script)
    let classesData = [];
    const localStorageKey = 'personnage_en_cours';

    /**
     * @method mChargerClasses
     * @description Charge les données de classes depuis le fichier JSON.
     */
    async function mChargerClasses() {
        try {
            // Utilisation du chemin relatif réel vers le fichier de données
            const vResponse = await fetch('classes.json');
            
            if (!vResponse.ok) {
                // Gère les erreurs HTTP (404, 500, etc.)
                throw new Error(`Erreur HTTP: Le fichier classes.json n'a pas été trouvé (Statut ${vResponse.status}).`);
            }
            
            classesData = await vResponse.json();
            
            vLoadingMessage.style.display = 'none';
            mAfficherListeClasses();
            
        } catch (vError) {
            console.error("Erreur critique lors du chargement de classes.json:", vError);
            // Affichage de l'erreur dans le DOM
            vLoadingMessage.style.display = 'none';
            vErrorMessage.textContent = `Erreur : Impossible de charger les options de classe. Vérifiez la Console (F12) pour les détails.`;
            vNextButton.disabled = true; // Bloque la suite si les données ne sont pas chargées
        }
    }

    /**
     * @method mAfficherListeClasses
     * @description Injecte le HTML pour chaque classe dans le conteneur.
     */
    function mAfficherListeClasses() {
        vClassesOptionsContainer.innerHTML = '';
        
        classesData.forEach((vClasse, vIndex) => {
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
            vClassesOptionsContainer.innerHTML += vHtml;
        });

        // Activation du bouton et écouteur de changement
        vNextButton.disabled = false;
        vClassesOptionsContainer.addEventListener('change', mVerifierSelection);
    }
    
    /**
     * @method mVerifierSelection
     * @description Active/Désactive le bouton suivant selon la sélection.
     */
    function mVerifierSelection() {
        // Utilisation directe des variables locales sans 'this.'
        vNextButton.disabled = !vForm.querySelector('input[name="pClasseSelectionnee"]:checked');
    }

    /**
     * @method mSoumettreClasseEtContinuer
     * @description Enregistre le choix et passe à l'étape 2.
     */
    function mSoumettreClasseEtContinuer(pEvent) {
        pEvent.preventDefault();
        vErrorMessage.textContent = '';
        
        const vSelectionne = vForm.querySelector('input[name="pClasseSelectionnee"]:checked');
        
        if (!vSelectionne) {
            vErrorMessage.textContent = "Veuillez sélectionner une classe.";
            return;
        }

        const vClasseNom = vSelectionne.value;
        
        // Initialisation de l'Objet Personnage
        // Utilisation des règles de nommage personnalisées dans l'objet de données
        const personnage = {
            aNom: "", 
            aClasse: vClasseNom,
            aNiveau: 1, 
            aRace: null,
            aScores: { for: 0, dex: 0, con: 0, int: 0, sag: 0, cha: 0 }, 
            aPvMax: 0,
            aGrimoire: [],
            aHistorique: null
        };

        // Stockage dans le localStorage
        localStorage.setItem(localStorageKey, JSON.stringify(personnage));

        // Redirection vers l'étape 2
        window.location.href = 'page2_race.html'; 
    }

    // --- INITIALISATION ---
    vForm.addEventListener('submit', mSoumettreClasseEtContinuer);
    mChargerClasses();
});