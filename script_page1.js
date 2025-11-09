document.addEventListener('DOMContentLoaded', () => {
    // Variables locales pour les éléments du DOM
    const vForm = document.getElementById('classSelectionForm');
    const vClassesOptionsContainer = document.getElementById('vClassesOptionsContainer');
    const vLoadingMessage = document.getElementById('vLoadingMessage');
    const vNextButton = document.getElementById('vNextButton');
    const vErrorMessage = document.getElementById('vErrorMessage');
    
    // Variables pour l'état de l'application
    let classesData = [];
    let personnage = null; 
    const localStorageKey = 'personnage_en_cours';

    /**
     * @method mChargerEtatInitial
     * @description Charge l'état du personnage depuis le localStorage pour restaurer la sélection.
     */
    function mChargerEtatInitial() {
        const vPersonnageJson = localStorage.getItem(localStorageKey);
        if (vPersonnageJson) {
            personnage = JSON.parse(vPersonnageJson);
            // S'assurer que le bouton est activé si un choix existe déjà
            if (personnage.aClasse) {
                vNextButton.disabled = false;
            }
        } else {
             // Si aucune session, désactiver par défaut
             vNextButton.disabled = true;
        }
    }

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
            // Affichage de l'erreur dans le DOM (sans alert)
            vLoadingMessage.style.display = 'none';
            vErrorMessage.textContent = `Erreur : Impossible de charger les options de classe. Vérifiez la Console (F12) pour les détails.`;
            vNextButton.disabled = true; 
        }
    }

    /**
     * @method mAfficherListeClasses
     * @description Injecte le HTML pour chaque classe et pré-sélectionne si nécessaire.
     */
    function mAfficherListeClasses() {
        vClassesOptionsContainer.innerHTML = '';
        
        // Nom de la classe déjà sélectionnée
        const vClasseSelectionnee = personnage ? personnage.aClasse : null;

        classesData.forEach((vClasse, vIndex) => {
            // Détermine si le bouton doit être pré-coché
            const vChecked = (vClasse.nom === vClasseSelectionnee) ? 'checked' : ''; 
            
            const vHtml = `
                <div class="classe-option-card">
                    <hr>
                    <label for="vClasseRadio-${vIndex}" class="classe-item-container">
                        <div class="classe-header">${vClasse.nom}</div>
                        <div class="classe-content">
                            <input type="radio" name="pClasseSelectionnee" value="${vClasse.nom}" id="vClasseRadio-${vIndex}" ${vChecked}> 
                            <img src="${vClasse.image_url}" alt="Icône ${vClasse.nom}">
                            <div class="classe-details">${vClasse.description_html}</div>
                        </div>
                    </label>
                </div>
            `;
            vClassesOptionsContainer.innerHTML += vHtml;
        });

        // Écouteur de changement pour activer/désactiver le bouton
        vClassesOptionsContainer.addEventListener('change', mVerifierSelection);
    }
    
    /**
     * @method mVerifierSelection
     * @description Active/Désactive le bouton suivant selon la sélection.
     */
    function mVerifierSelection() {
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
        
        // Initialisation ou mise à jour de l'Objet Personnage
        const personnageData = personnage || {};
        
        const vPersonnage = {
            aNom: personnageData.aNom || "", 
            aClasse: vClasseNom,
            // Réinitialisation des étapes suivantes si la classe change
            aNiveau: 1, 
            aRace: null, 
            aScores: { for: 0, dex: 0, con: 0, int: 0, sag: 0, cha: 0 }, 
            aPvMax: 0,
            aGrimoire: [],
            aHistorique: null
        };

        // Stockage dans le localStorage
        localStorage.setItem(localStorageKey, JSON.stringify(vPersonnage));

        // Redirection vers l'étape 2
        window.location.href = 'page2_race.html'; 
    }

    // --- INITIALISATION ---
    if (vForm) {
        mChargerEtatInitial();
        vForm.addEventListener('submit', mSoumettreClasseEtContinuer);
        mChargerClasses();
    } else {
        // Sécurité en cas d'erreur de chargement du formulaire
        console.error("Erreur: Le formulaire 'classSelectionForm' n'a pas été trouvé.");
    }
});