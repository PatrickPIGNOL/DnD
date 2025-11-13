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
    
    mDemarrerNouvelleCreation() {
        // Vider tout le localStorage
        localStorage.clear()
        console.log("✅ Cache vidé - Nouvelle création de personnage")
        
        // Rediriger vers la page 1
        window.location.href = "page1.html"
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
        const vSection = document.getElementById('adventure-start-section')
        if (!vSection) return

        let vHTMLContent = ''

        this.aTextes.sections.forEach(pSection => {
            let vLienHTML = ''
            
            if (pSection.external) {
                vLienHTML = `<a href="${pSection.lien}" target="_blank" class="button-link">${pSection.bouton_texte}</a>`
            } else {
                // ✅ MODIFICATION ICI : Ajouter l'effacement du cache pour la création de personnage
                if (pSection.lien === "page1.html") {
                    vLienHTML = `<a href="${pSection.lien}" onclick="oIndexPage.mDemarrerNouvelleCreation(); return false;" class="button-link">${pSection.bouton_texte}</a>`
                } else {
                    vLienHTML = `<a href="${pSection.lien}" class="button-link">${pSection.bouton_texte}</a>`
                }
            }
            
            vHTMLContent += `
                <section class="etape-item-card">
                    <h2>${pSection.titre}</h2>
                    <p>${pSection.description}</p>
                    ${vLienHTML}
                </section>
            `
        })
        
        vSection.innerHTML = vHTMLContent
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

        // Nettoyer le contenu existant
        vTableBody.innerHTML = ''; 

        // Remplir le tableau avec les données des ressources
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
    /*    
    mDemarrerCreation() {
        localStorage.clear(); 
        window.location.href = this.aTextes.sections[0].lien;
    }
    */
    /*
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
    //*/
}

new CIndexPage();