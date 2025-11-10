// Début du fichier script_page1.js

class CPage1 {
    aTextes;
    aClasses;

    constructor() {
        // Le constructeur doit être très léger
        this.mInitialiserPage();
    }

    mInitialiserPage() {
        // Initialisation asynchrone pour charger les données avant de remplir le contenu
        this.mChargerDonnees().then(() => {
            this.mRemplirTextes();
            this.mGenererOptionsClasse();
        });
    }

    async mChargerDonnees() {
        try {
            // Chargement des textes de la page 1
            const vResponseTextes = await fetch('page1.json');
            const vDataTextes = await vResponseTextes.json();
            this.aTextes = vDataTextes.page1;

            // Chargement des données de classe
            const vResponseClasses = await fetch('data_classes.json');
            const vDataClasses = await vResponseClasses.json();
            this.aClasses = vDataClasses.classes;
            
        } catch (vError) {
            console.error("Erreur de chargement des données pour la page 1:", vError);
        }
    }

    /**
     * @brief Rempli les éléments textuels de la page à partir du fichier JSON.
     */
    mRemplirTextes() {
        if (!this.aTextes) return;

        // --- LIGNES CRITIQUES AUTOUR DE L'ERREUR (LIGNE 39) ---
        // Vérifiez que ces IDs existent dans page1_classe.html

        // Ligne ~36
        document.title = this.aTextes.titre_page; 
        document.getElementById('vHeaderTitre').textContent = this.aTextes.titre_header;
        
        // Ligne ~39 (L'ERREUR est probablement sur l'un de ces deux IDs)
        document.getElementById('vPage1Titre').textContent = this.aTextes.titre_section; 
        document.getElementById('vPage1Introduction').textContent = this.aTextes.introduction; 

        document.getElementById('vFooterTexte').innerHTML = this.aTextes.footer_texte;
        document.getElementById('vBoutonSuivant').textContent = this.aTextes.bouton_suivant;
        // --------------------------------------------------------
    }
    
    // ... (Reste des méthodes : mGenererOptionsClasse, mSelectionnerClasse, etc.)
}

// Global variable pour un accès facile
const oCPage1 = new CPage1();