document.addEventListener('DOMContentLoaded', () => {
    // Les règles de nommage des artefacts de programmation est "camelcase" par défaut.
    // Une méthode commence par un "m" minuscule, une variable locale par un "v" minuscule.
    // Les attributs de classes commencent par un "a" minuscule.
    
    // Références DOM
    const vForm = document.getElementById('classSubmissionForm');
    const vClasseInput = document.getElementById('vClasseInput');
    const vErrorMessage = document.getElementById('vErrorMessage');

    // Définitions de classes valides pour une validation côté client rapide
    // Ce tableau doit correspondre exactement aux noms dans votre classes.json
    const vClassesValides = ["Guerrier", "Mage", "Voleur", "Prêtre", "Barde", "Barbare", "Druide", "Paladin", "Rôdeur", "Sorcier", "Moine", "Occultiste"];

    // Méthode pour formater la chaîne entrée par l'utilisateur
    function mFormatClasse(pClasse) {
        // Enlève les espaces inutiles, met en minuscules, puis capitalise la première lettre
        let vClasse = pClasse.trim().toLowerCase();
        if (vClasse.length > 0) {
            return vClasse.charAt(0).toUpperCase() + vClasse.slice(1);
        }
        return "";
    }
    
    // Méthode de validation et de soumission
    function mSoumettreClasse(pEvent) {
        pEvent.preventDefault(); // Empêche la soumission traditionnelle
        this.vErrorMessage.textContent = ''; // Réinitialise l'erreur

        const vClasseNom = mFormatClasse(this.vClasseInput.value);

        // 1. Validation : vérifier si la classe est valide
        if (this.vClassesValides.indexOf(vClasseNom) === -1) {
            this.vErrorMessage.textContent = `Erreur : La classe "${vClasseNom}" n'est pas reconnue ou la syntaxe est incorrecte.`;
            return;
        }

        // 2. Initialisation de l'Objet Personnage (utilise les attributs de classe 'a' pour l'objet interne)
        // Note: Nous utilisons une structure d'objet simple ici, elle sera enrichie aux étapes suivantes.
        const vPersonnage = {
            aNom: "", 
            aClasse: vClasseNom,
            aNiveau: 1, 
            aRace: null,
            aScores: { for: 0, dex: 0, con: 0, int: 0, sag: 0, cha: 0 }, // Les 6 caractéristiques
            aPvMax: 0,
            aGrimoire: [],
            aHistorique: null
            // Les autres attributs seront initialisés ou ajoutés dans les pages suivantes
        };

        // 3. Stockage dans le localStorage
        // La clé doit être unique pour l'application
        localStorage.setItem('personnage_en_cours', JSON.stringify(vPersonnage));

        // 4. Redirection vers l'étape 2
        window.location.href = 'page2_race.html'; 
    }

    // Écouteur d'événement sur le formulaire
    this.vForm.addEventListener('submit', mSoumettreClasse);
});