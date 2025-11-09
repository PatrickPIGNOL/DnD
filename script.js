// Utilisation des règles de nommage personnalisées

// Fonction pour charger et afficher les ressources utiles
const mLoadResources = async () => {
    const vTableBody = document.getElementById('resources-table-body');
    
    if (!vTableBody) {
        console.error("mLoadResources - Élément 'resources-table-body' introuvable.");
        return;
    }
    
    try {
        const vResponse = await fetch('resources.json');
        
        if (!vResponse.ok) {
            throw new Error(`Erreur HTTP: Le fichier resources.json n'a pas été trouvé (Statut ${vResponse.status}).`);
        }
        
        const vResourcesData = await vResponse.json();

        vResourcesData.forEach(pResource => {
            const vRow = document.createElement('tr');
            
            vRow.innerHTML = `
                <td data-label="Ressource">
                    <strong>${pResource.name}</strong>
                </td>
                <td data-label="Description">
                    ${pResource.description}
                </td>
                <td data-label="Action">
                    <a href="${pResource.link}" target="_blank" class="secondary-button">${pResource.buttonText}</a>
                </td>
            `;

            vTableBody.appendChild(vRow);
        });

    } catch (vError) {
        console.error("mLoadResources - Erreur lors de la construction du tableau :", vError);
        vTableBody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--couleur-accent);">Impossible de charger les ressources.</td></tr>`;
    }
};


// NOUVELLE FONCTION : pour charger et afficher l'introduction
const mLoadIntroSection = async () => {
    const vSection = document.getElementById('adventure-start-section');
    
    if (!vSection) {
        console.error("mLoadIntroSection - Élément 'adventure-start-section' introuvable.");
        return;
    }

    try {
        const vResponse = await fetch('aventure.json');
        
        if (!vResponse.ok) {
            throw new Error(`Erreur HTTP: Le fichier intro.json n'a pas été trouvé (Statut ${vResponse.status}).`);
        }
        
        const vData = await vResponse.json();

        let vHTMLContent = `<h2>${vData.title}</h2><p>${vData.introText}</p><hr>`;

        vData.steps.forEach(pStep => {
            // Détermine l'attribut target
            const vTarget = pStep.external ? 'target="_blank"' : '';
            
            vHTMLContent += `
                <h3>${pStep.stepTitle}</h3>
                <p>${pStep.stepText}</p>
                <a href="${pStep.buttonLink}" ${vTarget} class="${pStep.buttonClass}">${pStep.buttonText}</a>
                <hr>
            `;
        });
        
        // Retirer le dernier <hr> superflu
        vHTMLContent = vHTMLContent.replace(/<hr>$/, '');

        vSection.innerHTML = vHTMLContent;

    } catch (vError) {
        console.error("mLoadIntroSection - Erreur lors du chargement de l'introduction :", vError);
        vSection.innerHTML = `
            <h2>Erreur de Chargement</h2>
            <p style="color: var(--couleur-accent);">Impossible de charger la section d'introduction. Veuillez vérifier la console pour les détails.</p>
        `;
    }
};


// Événement pour démarrer le chargement des deux sections
document.addEventListener('DOMContentLoaded', () => {
    // Appel des deux fonctions de chargement
    mLoadIntroSection();
    mLoadResources();
});