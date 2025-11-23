<?php

function getValeursDeVie($classe) {
    $pointsDeVieParDefaut = [
        'Barbare' => 12,
        'Barde' => 8,
        'Clerc' => 8,
        'Druide' => 8,
        'Guerrier' => 10,
        'Magicien' => 6,
        'Moine' => 8,
        'Paladin' => 10,
        'Ranger' => 10,
        'Roublard' => 8,
        'Sorcier' => 6,
        'Ensorceleur' => 6
    ];
    
    return $pointsDeVieParDefaut[$classe] ?? 8; // Valeur par défaut 8 au lieu de 6
}
/**
 * Charge un fichier JSON depuis le dossier data avec validation
 */
function chargerJSON($fichier) {
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
 * Valide la structure des données de page
 */
function validerStructurePage($data) {
    return is_array($data);
}

/**
 * Calcule le modificateur d'une caractéristique selon la formule D&D
 */
function calculerModificateur($score) {
    return floor($score / 2 - 5);
}

/**
 * Calcule les points de vie maximum avec formule favorisant le joueur
 */
function calculerPointsDeVie($jetDeVie, $niveau, $modConstitution) {
    $valeursMax = array(
        'd6' => 6, 
        'd8' => 8, 
        'd10' => 10, 
        'd12' => 12
    );
    $valeurMax = isset($valeursMax[$jetDeVie]) ? $valeursMax[$jetDeVie] : 8;
    
    return ($valeurMax + $modConstitution) * $niveau;
}

/**
 * Nettoie les données de session pour une nouvelle création
 */
function demarrerNouvelleCreation() {
    $keysToRemove = array('classeSelectionnee', 'raceSelectionnee', 'personnageData', 'niveau', 'bonusSlots');
    
    foreach ($keysToRemove as $key) {
        if (isset($_SESSION[$key])) {
            unset($_SESSION[$key]);
        }
    }
}
?>