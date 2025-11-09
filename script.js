// Utilisation des règles de nommage personnalisées (mLoadResources, vTableBody, etc.)

const mLoadResources = async () => {
    const vTableBody = document.getElementById('resources-table-body');
    
    // Vérification de l'existence du corps du tableau avant de continuer
    if (!vTableBody) {
        console.error("mLoadResources - Élément 'resources-table-body' introuvable.");
        return;
    }
    
    try {
        // Récupérer le fichier JSON
        const vResponse = await fetch('resources.json');
        
        if (!vResponse.ok) {
            throw new Error(`Erreur HTTP: Le fichier resources.json n'a pas été trouvé (Statut ${vResponse.status}).`);
        }
        
        const vResourcesData = await vResponse.json();

        // Boucler sur chaque ressource et créer la ligne de tableau (<tr>)
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
        
        // Afficher un message d'erreur dans la page pour l'utilisateur
        vTableBody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--couleur-accent);">Impossible de charger les ressources.</td></tr>`;
    }
};

// Événement pour s'assurer que le DOM est complètement chargé avant d'exécuter le script.
// C'est nécessaire si la balise <script> est placée dans le <head> (ce que l'on n'a pas fait), 
// mais c'est une bonne pratique de s'assurer que tous les éléments existent avant de les manipuler.
document.addEventListener('DOMContentLoaded', () => {
    mLoadResources();
});