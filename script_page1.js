class CPage1 {
    aClassesData;
    aTextes; 
    aClasseSelectionnee = null;
    
    // L'ID du filtre actif, utilisé pour l'affichage de la liste
    aFiltreActif = 'tout'; 

    constructor() {
        this.mInitialiserPage();
    }

    /**
     * @brief Charge les fichiers JSON nécessaires (classes.json et page1.json).
     */
    async mChargerDonnees() {
        try {
            // 1. Chargement des données de Classes
            const vResponseClasses = await fetch('classes.json');
            this.aClassesData = await vResponseClasses.json();

            // 2. Chargement des textes (page1.json)
            const vResponseTextes = await fetch('page1.json');
            const vDataTextes = await vResponseTextes.json();
            this.aTextes = vDataTextes.page1;

        } catch (vError) {
            console.error("Erreur de chargement des fichiers JSON:", vError);
        }
    }

    /**
     * @brief Injecte les textes de page1.json dans les éléments HTML.
     */
    mRemplirTextes() {
        if (!this.aTextes) return;

        // Titre et Header
        document.getElementById('vPageTitle').textContent = this.aTextes.titre_page;
        document.getElementById('vHeaderTitre').textContent = this.aTextes.titre_header;
        
        // Section Recherche/Filtres
        document.getElementById('vRechercheTitre').textContent = this.aTextes.section_recherche_titre;
        document.getElementById('pSearch').placeholder = this.aTextes.recherche_placeholder;

        // Section Affichage Classe par Défaut
        document.getElementById('vDefaultClasseTitre').textContent = this.aTextes.classe_par_defaut_titre;
        document.getElementById('vDefaultClasseDesc').textContent = this.aTextes.classe_par_defaut_desc;

        // Catégories de filtres (Assurez-vous que les IDs existent dans page1_classe.html)
        document.getElementById('vFiltreTout').textContent = this.aTextes.categories.tout;
        document.getElementById('vFiltreCorpsACorps').textContent = this.aTextes.categories.corps_a_corps;
        document.getElementById('vFiltreDistance').textContent = this.aTextes.categories.distance;
        document.getElementById('vFiltreMagie').textContent = this.aTextes.categories.magie;
        document.getElementById('vFiltreSoutien').textContent = this.aTextes.categories.soutien;

        // Bouton DÉTAIL 
        document.getElementById('vBoutonDetail').textContent = this.aTextes.bouton_detail;

        // Boutons de navigation
        const vRetourBtn = document.getElementById('vBoutonRetour');
        vRetourBtn.textContent = this.aTextes.bouton_retour;
        vRetourBtn.href = this.aTextes.lien_retour; // Définir la destination
        
        document.getElementById('vSuivantButton').textContent = this.aTextes.bouton_suivant;
    }

    /**
     * @brief Génère la liste des classes dans le conteneur principal, en appliquant les filtres.
     */
    mGenererListeClasses() {
        if (!this.aClassesData) return;

        const vContainer = document.getElementById('vClasseListContainer');
        let vHtml = '';
        const vTermeRecherche = document.getElementById('pSearch').value.toLowerCase();
        
        this.aClassesData.forEach(vClasse => {
            
            // Logique de Filtrage (Catégorie)
            if (this.aFiltreActif !== 'tout' && vClasse.categorie !== this.aFiltreActif) {
                return;
            }

            // Logique de Filtrage (Recherche)
            if (vTermeRecherche && !vClasse.nom.toLowerCase().includes(vTermeRecherche)) {
                return;
            }

            const vSelectedClass = (this.aClasseSelectionnee && this.aClasseSelectionnee.nom === vClasse.nom) ? 'selected' : '';

            // Injection dans le HTML pour chaque carte de classe
            vHtml += `
                <div class="classe-card ${vSelectedClass}" data-classe-nom="${vClasse.nom}" onclick="new CPage1().mSelectionnerClasse('${vClasse.nom}')">
                    <img src="${vClasse.image_url}" alt="${vClasse.nom}" class="classe-image">
                    <div class="classe-info">
                        <h3>${vClasse.nom}</h3>
                        <p class="classe-category">${vClasse.categorie.charAt(0).toUpperCase() + vClasse.categorie.slice(1)}</p>
                        <p class="classe-description">${vClasse.description_courte}</p>
                    </div>
                </div>
            `;
        });
        
        vContainer.innerHTML = vHtml;
        this.mMettreAJourAffichageSelection();
    }
    
    /**
     * @brief Applique un filtre par catégorie et régénère la liste.
     * @param pFiltreKey La clé du filtre (ex: 'corps_a_corps').
     */
    mAppliquerFiltre(pFiltreKey) {
        this.aFiltreActif = pFiltreKey;
        // La mise à jour des classes 'active' sur les boutons de filtre se ferait ici
        this.mGenererListeClasses();
    }

    /**
     * @brief Gère la sélection d'une classe.
     * @param pClasseNom Le nom de la classe sélectionnée.
     */
    mSelectionnerClasse(pClasseNom) {
        this.aClasseSelectionnee = this.aClassesData.find(vClasse => vClasse.nom === pClasseNom);
        
        // Stockage dans le localStorage
        localStorage.setItem('classeSelectionnee', JSON.stringify(this.aClasseSelectionnee));
        
        this.mGenererListeClasses(); // Pour mettre à jour la classe 'selected'
        this.mMettreAJourAffichageSelection();
    }

    /**
     * @brief Met à jour le bloc d'affichage de la classe sélectionnée et active le bouton Suivant.
     */
    mMettreAJourAffichageSelection() {
        const vSuivantButton = document.getElementById('vSuivantButton');

        if (this.aClasseSelectionnee) {
            // Mise à jour de la zone de visualisation détaillée (ajustez les IDs dans le HTML si besoin)
            document.getElementById('vDefaultClasseTitre').textContent = this.aClasseSelectionnee.nom;
            document.getElementById('vDefaultClasseDesc').textContent = this.aClasseSelectionnee.description_courte;
            
            // Activer le bouton Suivant
            vSuivantButton.disabled = false;
        } else {
            // Afficher le message par défaut et désactiver le bouton
            document.getElementById('vDefaultClasseTitre').textContent = this.aTextes.classe_par_defaut_titre;
            document.getElementById('vDefaultClasseDesc').textContent = this.aTextes.classe_par_defaut_desc;
            vSuivantButton.disabled = true;
        }
    }

    /**
     * @brief Gère la navigation vers la page suivante.
     */
    mAllerPageSuivante() {
        if (this.aClasseSelectionnee) {
            const vLienSuivant = this.aTextes.lien_suivant;
            window.location.href = vLienSuivant;
        } else {
            alert("Veuillez sélectionner une classe avant de continuer.");
        }
    }

    /**
     * @brief Initialise la page, charge les données et configure les écouteurs.
     */
    async mInitialiserPage() {
        // Charger les données de la classe sélectionnée précédemment si elles existent
        const vStoredClasse = localStorage.getItem('classeSelectionnee');
        if (vStoredClasse) {
            this.aClasseSelectionnee = JSON.parse(vStoredClasse);
        }

        await this.mChargerDonnees();
        this.mRemplirTextes();
        this.mGenererListeClasses();
        
        // Initialiser l'état du bouton Suivant (désactivé par défaut si rien n'est sélectionné)
        document.getElementById('vSuivantButton').disabled = !this.aClasseSelectionnee;

        // Écouteur pour la recherche
        document.getElementById('pSearch').oninput = () => this.mGenererListeClasses();

        // Écouteur pour la navigation
        document.getElementById('vSuivantButton').onclick = () => this.mAllerPageSuivante();
        
        // Exemple d'attachement des filtres (doit correspondre aux IDs de votre HTML)
        document.getElementById('vFiltreTout').onclick = () => this.mAppliquerFiltre('tout');
        document.getElementById('vFiltreCorpsACorps').onclick = () => this.mAppliquerFiltre('corps_a_corps');
        document.getElementById('vFiltreDistance').onclick = () => this.mAppliquerFiltre('distance');
        document.getElementById('vFiltreMagie').onclick = () => this.mAppliquerFiltre('magie');
        document.getElementById('vFiltreSoutien').onclick = () => this.mAppliquerFiltre('soutien');
    }
}

new CPage1();