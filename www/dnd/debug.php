<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

session_start();
echo "<h1>Debug Session</h1>";
echo "<pre>Session: "; print_r($_SESSION); echo "</pre>";

// Test des fonctions
require_once 'includes/functions.php';


echo "<h2>Test chargement JSON</h2>";
$test = chargerJSON('page3.json');
if ($test) {
    echo "page3.json chargé avec succès<br>";
} else {
    echo "ERREUR: page3.json non chargé<br>";
}

$test = chargerJSON('classes.json');
if ($test) {
    echo "classes.json chargé avec succès<br>";
} else {
    echo "ERREUR: classes.json non chargé<br>";
}

$test = chargerJSON('races.json');
if ($test) {
    echo "races.json chargé avec succès<br>";
} else {
    echo "ERREUR: races.json non chargé<br>";
}

// Test des fonctions de calcul
echo "<h2>Test fonctions calcul</h2>";
try {
    $mod = calculerModificateur(15);
    echo "calculerModificateur(15) = $mod<br>";
    
    $pv = calculerPointsDeVie('d8', 3, 2);
    echo "calculerPointsDeVie('d8', 3, 2) = $pv<br>";
    
    echo "Toutes les fonctions fonctionnent<br>";
} catch (Exception $e) {
    echo "ERREUR fonction: " . $e->getMessage() . "<br>";
}
?>