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
            // Chargement des textes de la page 1 (inchangé)
            const vResponseTextes = await fetch('page1.json');
            const vDataTextes = await vResponseTextes.json();
            this.aTextes = vDataTextes.page1;

            // CORRECTION ICI : Utilisation de 'classes.json' au lieu de 'data_classes.json'
            const vResponseClasses = await fetch('classes.json');
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

        // Le titre est la première chose à mettre à jour, il ne devrait pas causer de problème
        document.title = this.aTextes.titre_page; 
        
        // Utilisation de la méthode sécurisée pour tous les autres éléments
        this.mRemplirElement('vHeaderTitre', this.aTextes.titre_header);
        
        // Ligne 39 (où l'erreur se produisait) est maintenant sécurisée
        this.mRemplirElement('vPage1Titre', this.aTextes.titre_section); 
        this.mRemplirElement('vPage1Introduction', this.aTextes.introduction); 

        // Les autres éléments de la page
        document.getElementById('vFooterTexte').innerHTML = this.aTextes.footer_texte;
        this.mRemplirElement('vBoutonSuivant', this.aTextes.bouton_suivant);
    }
    /**
     * @brief Vérifie l'existence de l'élément avant de lui attribuer du texte.
     * @param {string} pId L'ID de l'élément HTML.
     * @param {string} pTexte La valeur à attribuer.
     */
    mRemplirElement(pId, pTexte) {
        const vElement = document.getElementById(pId);
        if (vElement) {
            vElement.textContent = pTexte;
        } 
    }
}

// Global variable pour un accès facile
const oCPage1 = new CPage1();