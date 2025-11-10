class CIndexPage {
    aTextes;

    constructor() {
        this.mInitialiserPage();
    }

    mInitialiserPage() {
        this.mChargerDonnees().then(() => {
            this.mRemplirTextes();
        });
    }

    async mChargerDonnees() {
        try {
            const vResponseTextes = await fetch('index.json');
            const vDataTextes = await vResponseTextes.json();
            this.aTextes = vDataTextes.index;
        } catch (vError) {
            console.error("Erreur de chargement du fichier index.json:", vError);
        }
    }

    mRemplirTextes() {
        if (!this.aTextes) return;

        document.title = this.aTextes.titre_page;
        document.getElementById('vHeaderTitre').textContent = this.aTextes.titre_header;
        document.getElementById('vFooterTexte').innerHTML = this.aTextes.footer_texte;

        // Génération de la section de démarrage (Étapes)
        this.mGenererSectionDemarrage();
        
        // Injection des titres de la section Ressources
        document.getElementById('vRessourcesTitre').textContent = this.aTextes.ressources_titre;
        document.getElementById('vRessourcesIntro').textContent = this.aTextes.ressources_intro;
        document.getElementById('vRessourcesColonne').textContent = this.aTextes.tableau_ressources_colonne;

        // Génération de la table des ressources
        this.mGenererRessources();
    }
    
    // Changements dans script_index.js

    /**
     * @brief Génère la section de démarrage (Étapes en tant que cartes individuelles).
     */
    mGenererSectionDemarrage() {
        // CORRECTION : S'assurer que vSection est défini
        const vSection = document.getElementById('adventure-start-section'); 
        
        if (!vSection) {
            console.error("mGenererSectionDemarrage - Élément 'adventure-start-section' introuvable.");
            return;
        }

        const vData = this.aTextes;

        let vHTMLContent = ''; 

        // Remplacer l'ancienne grille par des sections individuelles
        this.aTextes.sections.forEach(pSection => {
            const vTarget = pSection.external ? 'target="_blank"' : ''; 
            const vBoutonText = pSection.bouton_texte; 

            // Chaque étape est maintenant son propre cadre (<section>) utilisant la nouvelle classe CSS
            vHTMLContent += `
                <section class="etape-item-card">
                    <h2>${pSection.titre}</h2>
                    <p>${pSection.description}</p>
                    <a href="${pSection.lien}" ${vTarget} class="button-link">${vBoutonText}</a>
                </section>
            `;
        });
        
        // C'est à cette ligne (environ 100) que l'erreur se produisait
        vSection.innerHTML = vHTMLContent; 
    }

    // Les méthodes mVerifierSauvegarde, mDemarrerCreation et mContinuerCreation sont conservées
    // car elles pourraient être nécessaires plus tard pour la navigation, mais elles ne sont plus appelées par la page d'accueil.
    
    mVerifierSauvegarde() {
        // Logique retirée car les boutons n'existent plus
    }
    
    mDemarrerCreation() {
        localStorage.clear(); 
        window.location.href = this.aTextes.sections[0].lien;
    }
    
    mContinuerCreation() {
        if (localStorage.getItem('historiqueSelectionne')) {
             window.location.href = this.aTextes.sections[3].lien;
        } else if (localStorage.getItem('raceSelectionnee')) {
             window.location.href = this.aTextes.sections[2].lien;
        } else if (localStorage.getItem('classeSelectionnee')) {
             window.location.href = this.aTextes.sections[1].lien;
        } else {
             this.mDemarrerCreation();
        }
    }
}

new CIndexPage();