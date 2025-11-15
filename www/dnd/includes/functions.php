<?php
/**
 * Charge un fichier JSON depuis le dossier data avec validation
 */
function chargerJSON($fichier) {
    // Correction de la variable $fichier (au lieu de $ichier)
    $chemin = __DIR__ . '/../data/' . $fichier;
    
    if (file_exists($chemin)) {
        $contenu = file_get_contents($chemin);
        $data = json_decode($contenu, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log("Erreur JSON dans $fichier: " . json_last_error_msg());
            return null;
        }
        
        return $data;
    }
    
    error_log("Fichier JSON non trouvé: $fichier");
    return null;
}

/**
 * Valide la structure des données de classe
 */
function validerStructureClasses($data) {
    if (!is_array($data)) return false;
    
    foreach ($data as $classe) {
        if (!isset($classe['nom']) || !isset($classe['image_url'])) {
            return false;
        }
    }
    
    return true;
}
/**
 * Valide la structure des données de race
 */
function validerStructureRaces($data) {
    if (!is_array($data)) return false;
    
    foreach ($data as $race) {
        if (!isset($race['nom']) || !isset($race['image_url'])) {
            return false;
        }
    }
    
    return true;
}
/**
 * Valide la structure des données de page
 */
function validerStructurePage($data) {
    return is_array($data);
}

/**
 * Redirige vers l'index en cas d'erreur
 */
function redirigerVersIndex() {
    header('Location: /dnd/index.php');
    exit;
}

/**
 * Nettoie les données de session pour une nouvelle création
 */
function demarrerNouvelleCreation() {
    // Supprime seulement les données de personnage
    $keysToRemove = ['classeSelectionnee', 'raceSelectionnee', 'personnageData'];
    
    foreach ($keysToRemove as $key) {
        unset($_SESSION[$key]);
    }
}
?>