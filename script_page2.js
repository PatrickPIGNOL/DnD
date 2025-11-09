const mChargerRace = async () => {
    // Variables locales pour les éléments du DOM
    const vForm = document.getElementById('raceSelectionForm');
    const vOptionsContainer = document.getElementById('vRaceOptionsContainer');
    const vLoadingMessage = document.getElementById('vLoadingMessage');
    const vNextButton = document.getElementById('vNextButton');
    const vErrorMessage = document.getElementById('vErrorMessage');
    
    // État
    let vRacesData = [];
    let personnage = null;
    const localStorageKey = 'personnage_en_cours';

    /**
     * @method mChargerEtatInitial
     * @description Charge l'état du personnage depuis le localStorage.
     */
    function mChargerEtatInitial() {
        const vPersonnageJson = localStorage.getItem(localStorageKey);
        if (vPersonnageJson) {
            personnage = JSON.parse(vPersonnageJson);
            
            // Vérification de la continuité (doit avoir une classe)
            if (!personnage.aClasse) {
                // Si la classe manque, rediriger ou désactiver
                // window.location.href = 'page1_classe.html'; 
                vErrorMessage.textContent = "Erreur de session. Veuillez choisir une classe en premier.";
                vNextButton.disabled = true;
            } else if (personnage.aRace) {
                // Activer le bouton si un choix existe déjà
                vNextButton.disabled = false;
            }
        } else {
             // Si aucune session, redirection vers le début
             vErrorMessage.textContent = "Session de personnage introuvable.";
             vNextButton.disabled = true;
             // window.location.href = 'index.html';
        }
    }

    /**
     * @method mAfficherListeRaces
     * @description Injecte le HTML pour chaque race disponible.
     */
    function mAfficherListeRaces() {
        vOptionsContainer.innerHTML = '';
        
        const vRaceSelectionnee = personnage ? personnage.aRace : null;

        vRacesData.forEach((vRace, vIndex) => {
            const vChecked = (vRace.nom === vRaceSelectionnee) ? 'checked' : ''; 
            
            // Structure finale en <tr> avec 3 <td>/<th>
            // Structure stricte demandée (TD sans TH)
            const vHtml = `
                <div class="race-option-card">
                    <input type="radio" name="pRaceSelectionnee" value="${vRace.nom}" id="vRaceRadio-${vIndex}" ${vChecked}>
                    
                    <label for="vRaceRadio-${vIndex}">
                        <table class="race-layout-table">
                            <tbody>
                                <tr>
                                    <td class="radio-cell" rowspan="2"></td>
                                    
                                    <td colspan="2" class="race-header-title">
                                        ${vRace.nom} (${vRace.bonusCarac})
                                    </td>
                                </tr>
                                
                                <tr>
                                    <td class="race-image-cell">
                                        <img src="${vRace.image_url}" alt="Image de ${vRace.nom}" class="race-image">
                                    </td>
                                    
                                    <td class="race-description-cell">
                                        <div class="race-description">${vRace.description}</div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </label>
                </div>
            `;
            vOptionsContainer.innerHTML += vHtml;
        });

        // Écouteur de changement pour vérifier la sélection
        vOptionsContainer.addEventListener('change', mVerifierSelection);
    }
    
    /**
     * @method mVerifierSelection
     * @description Active/Désactive le bouton suivant lors du choix.
     */
    function mVerifierSelection() {
        vNextButton.disabled = !vForm.querySelector('input[name="pRaceSelectionnee"]:checked');
    }

    /**
     * @method mSoumettreRaceEtContinuer
     * @description Enregistre le choix et passe à l'étape suivante.
     */
    function mSoumettreRaceEtContinuer(pEvent) {
        pEvent.preventDefault();
        vErrorMessage.textContent = '';
        
        const vSelectionne = vForm.querySelector('input[name="pRaceSelectionnee"]:checked');
        
        if (!vSelectionne) {
            vErrorMessage.textContent = "Veuillez sélectionner une race.";
            return;
        }

        const vRaceNom = vSelectionne.value;
        
        // Mise à jour de l'Objet Personnage dans le localStorage
        if (personnage) {
            personnage.aRace = vRaceNom;
            
            // Si la race change, les caractéristiques générées précédemment ne sont plus valides (bonus différents)
            // Donc, on réinitialise l'étape des caractéristiques
            personnage.aScoreCarac = null; 
            
            // Stockage et redirection (vers la page 3 : Caractéristiques/Niveau)
            localStorage.setItem(localStorageKey, JSON.stringify(personnage));
            window.location.href = 'page3_niveau_carac.html'; 
        } else {
             vErrorMessage.textContent = "Erreur: Session de personnage introuvable.";
             // window.location.href = 'index.html';
        }
    }


    // --- INITIALISATION PRINCIPALE ---
    mChargerEtatInitial();
    
    try {
        // Charger les données JSON
        const vResponse = await fetch('races.json');
        
        if (!vResponse.ok) {
            throw new Error(`Erreur de chargement du fichier (Statut ${vResponse.status}).`);
        }
        
        vRacesData = await vResponse.json();
        
        vLoadingMessage.style.display = 'none';
        mAfficherListeRaces();
        
    } catch (vError) {
        console.error("Erreur critique lors du chargement de races.json:", vError);
        vLoadingMessage.style.display = 'none';
        vErrorMessage.textContent = `Erreur : Impossible de charger les options de race.`;
        vNextButton.disabled = true; 
    }

    if (vForm) {
        vForm.addEventListener('submit', mSoumettreRaceEtContinuer);
    }
};

// Démarrer le processus une fois que le DOM est complètement chargé
document.addEventListener('DOMContentLoaded', mChargerRace);