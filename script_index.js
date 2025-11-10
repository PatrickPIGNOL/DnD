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

        // Génération de la section de démarrage
        this.mGenererSectionDemarrage();
        
        // Injection des titres de la section Ressources
        document.getElementById('vRessourcesTitre').textContent = this.aTextes.ressources_titre;
        document.getElementById('vRessourcesIntro').textContent = this.aTextes.ressources_intro;
        document.getElementById('vRessourcesColonne').textContent = this.aTextes.tableau_ressources_colonne;

        // Génération de la table des ressources
        this.mGenererRessources();
    }
    
    /**
     * @brief Génère la section de démarrage (Intro, Boutons Démarrer/Continuer et Étapes).
     */
    mGenererSectionDemarrage() {
        const vSection = document.getElementById('adventure-start-section');
        
        if (!vSection) {
            console.error("mGenererSectionDemarrage - Élément 'adventure-start-section' introuvable.");
            return;
        }

        const vData = this.aTextes;

        let vHTMLContent = `
            <h2 id="vIntroTitre">${vData.intro_titre}</h2>
            <p id="vIntroTexte">${vData.intro_texte}</p>
            
            <div class="navigation-buttons">
                <button type="button" id="vBoutonDemarrer" class="primary-button">${vData.bouton_demarrer}</button>
                <button type="button" id="vBoutonContinuer" class="secondary-button" disabled>${vData.bouton_continuer}</button>
            </div>
            
            <hr>
            
            <h2 id="vSectionsTitre">${vData.sections_titre}</h2>
            <div id="vEtapesContainer" class="etapes-grid">
        `;

        this.aTextes.sections.forEach(pSection => {
            // Logique de lien externe rétablie : ajoute target="_blank" si pSection.external est true
            const vTarget = pSection.external ? 'target="_blank"' : ''; 
            
            vHTMLContent += `
                <div class="etape-item">
                    <h3>${pSection.titre}</h3>
                    <p>${pSection.description}</p>
                    <a href="${pSection.lien}" ${vTarget} class="etape-link">${pSection.bouton_texte}</a> 
                </div>
            `;
        });
        
        vHTMLContent += '</div>';
        vSection.innerHTML = vHTMLContent;

        // Attacher les écouteurs après l'injection
        this.mVerifierSauvegarde();
        document.getElementById('vBoutonDemarrer').onclick = () => this.mDemarrerCreation();
    }

    /**
     * @brief Génère le contenu de la table des ressources.
     */
    mGenererRessources() {
        const vTableBody = document.getElementById('resources-table-body');
        
        if (!vTableBody) {
            console.error("mGenererRessources - Élément 'resources-table-body' introuvable.");
            return;
        }
        
        if (!this.aTextes.resources) {
            vTableBody.innerHTML = '<tr><td colspan="3" style="text-align: center;">Aucune ressource disponible.</td></tr>';
            return;
        }

        vTableBody.innerHTML = ''; // Assurer que le corps est vide avant de le remplir

        this.aTextes.resources.forEach(pResource => {
            const vRow = document.createElement('tr');
            
            vRow.innerHTML = `
                <td data-label="Titre">
                    <strong>${pResource.name}</strong>
                </td>                
                <td data-label="Description" style="width: 100%;">
                    ${pResource.description}
                </td>                
                <td data-label="Action" style="white-space: nowrap;">
                    <a href="${pResource.link}" target="_blank" class="secondary-button">${pResource.buttonText}</a>
                </td>
            `;

            vTableBody.appendChild(vRow);
        });
    }

    mVerifierSauvegarde() {
        const vContinuerBtn = document.getElementById('vBoutonContinuer');
        const vClasseSauvegardee = localStorage.getItem('classeSelectionnee');
        
        if (vContinuerBtn && vClasseSauvegardee) {
            vContinuerBtn.disabled = false;
            vContinuerBtn.onclick = () => this.mContinuerCreation();
        }
    }
    
    mDemarrerCreation() {
        localStorage.clear(); 
        window.location.href = this.aTextes.sections[0].lien;
    }
    
    mContinuerCreation() {
        // Les sections sont ordonnées dans le JSON : [0:Classe, 1:Race, 2:Caractéristiques, 3:Historique]
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