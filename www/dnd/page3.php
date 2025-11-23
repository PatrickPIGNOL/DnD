<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

session_start();
require_once 'includes/functions.php';

// Vérifier qu'une classe et une race sont sélectionnées
if (!isset($_SESSION['classeSelectionnee']) || !isset($_SESSION['raceSelectionnee'])) {
    header('Location: page1.php');
    exit;
}

// Charger les données
$textes = chargerJSON('page3.json');
$classes = chargerJSON('classes.json');
$races = chargerJSON('races.json');

// Valider la structure
if (!$textes || !validerStructurePage($textes)) {
    $textes = ['page3' => [
        'titre_page' => 'Donjons & Dragons',
        'titre_header' => 'Niveau de Départ & Caractéristiques',
        'section_niveau_titre' => 'Niveau de Départ',
        'select_niveau_label' => 'Sélectionnez le niveau de départ :',
        'section_bonus_titre' => 'Récapitulatif des Bonus de Race',
        'bonus_mod_description' => 'Vous avez 4 points de race (+1 chacun) à distribuer sur les Caractéristiques de votre choix.',
        'section_carac_titre' => 'Vos Caractéristiques',
        'section_pv_titre' => 'Points de Vie Max (PVMax)',
        'boutons' => ['retour_texte' => 'Retour', 'suivant_texte' => 'Suivant (Historique)'],
        'footer_texte' => '&copy; 2025 Character Builder'
    ]];
} else {
    $textes = $textes['page3'];
}

// Récupérer les caractéristiques depuis page3.json
$caracteristiques = $textes['caracteristiques'] ?? [
    'For' => 'Force',
    'Dex' => 'Dextérité', 
    'Con' => 'Constitution',
    'Int' => 'Intelligence',
    'Sag' => 'Sagesse',
    'Cha' => 'Charisme'
];

// Récupérer les données de la classe et race sélectionnées
$classeNom = $_SESSION['classeSelectionnee'];
$raceNom = $_SESSION['raceSelectionnee'];

$classeData = $classes[$classeNom] ?? null;
$raceData = null;

// Trouver la race sélectionnée
foreach ($races as $race) {
    if ($race['nom'] === $raceNom) {
        $raceData = $race;
        break;
    }
}

// Si données manquantes, rediriger
if (!$classeData || !$raceData) {
    header('Location: page1.php');
    exit;
}

// Récupérer les bonus de race
$bonusRace = $raceData['bonusCarac'] ?? [];
$nombreSlots = $bonusRace['nombreSlots'] ?? 4;
$typeBonus = $bonusRace['type'] ?? 'choix';
$bonusPredefinis = $bonusRace['bonus'] ?? [];

// Valeurs par défaut
$niveauSauvegarde = $_SESSION['niveau'] ?? 1;
$bonusSlotsSauvegarde = $_SESSION['bonusSlots'] ?? [];

// LOGIQUE SIMPLIFIÉE : Charger les bonus selon la structure du fichier race
$bonusSlotsSauvegarde = [];

for ($i = 1; $i <= $nombreSlots; $i++) {
    $slotIndex = $i - 1;
    
    if (isset($bonusPredefinis[$slotIndex]) && !empty($bonusPredefinis[$slotIndex]['carac'])) {
        // Bonus défini dans le fichier race
        $caracNomComplet = $bonusPredefinis[$slotIndex]['carac'];
        $abreviation = array_search($caracNomComplet, $caracteristiques);
        $bonusSlotsSauvegarde["slot$i"] = $abreviation ?: 'reset';
    } else {
        // Aucun bonus défini → reset
        $bonusSlotsSauvegarde["slot$i"] = 'reset';
    }
}

// Pour les races de type "fixe", désactiver les modifications
$radiosDisabled = ($typeBonus === 'fixe');

// Mettre à jour la session
$_SESSION['bonusSlots'] = $bonusSlotsSauvegarde;

// Gérer la soumission du formulaire
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['niveau'])) {
    $_SESSION['niveau'] = (int)$_POST['niveau'];
    
    // Récupérer les bonus sélectionnés
    $bonusSlots = [];
    for ($i = 1; $i <= $nombreSlots; $i++) {
        if (isset($_POST["bonusSlot$i"])) {
            $bonusSlots["slot$i"] = $_POST["bonusSlot$i"];
        }
    }
    $_SESSION['bonusSlots'] = $bonusSlots;
    
    header('Location: page4.php');
    exit;
}

// Caractéristiques de base (déjà définies plus haut)
$scoresFixes = $classeData['scores_fixes'] ?? [];
$jetDeVie = $classeData['jetDeVie'] ?? 'd8';

// Calculer les bonus actuels par caractéristique
$bonusActuels = array_fill_keys(array_keys($caracteristiques), 0);
foreach ($bonusSlotsSauvegarde as $slot => $carac) {
    if (isset($bonusActuels[$carac]) && $carac !== 'reset') {
        $bonusActuels[$carac]++;
    }
}

// Calculer les scores finaux et modificateurs
$scoresFinaux = [];
$modificateurs = [];
foreach ($caracteristiques as $abrev => $nomComplet) {
    $scoreBase = $scoresFixes[$nomComplet] ?? 10;
    $scoresFinaux[$abrev] = $scoreBase + ($bonusActuels[$abrev] ?? 0);
    $modificateurs[$abrev] = calculerModificateur($scoresFinaux[$abrev]);
}

// Calculer les PV avec la formule factorisée
$valeurDeVie = getValeursDeVie($classeNom);
$pvTotal = calculerPointsDeVie($valeurDeVie, $niveauSauvegarde, $modificateurs['Con']);

// Préparer les données pour JavaScript
$jsData = [
    'nombreSlots' => $nombreSlots,
    'scoresBase' => [],
    'valeurDeVie' => $valeurDeVie,
    'jetDeVie' => $jetDeVie,
    'caracteristiques' => $caracteristiques,
    'typeBonus' => $typeBonus
];

foreach ($caracteristiques as $abrev => $nomComplet) {
    $jsData['scoresBase'][$abrev] = $scoresFixes[$nomComplet] ?? 10;
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($textes['titre_page'] ?? 'Donjons & Dragons') ?></title>
    <link rel="stylesheet" href="css/style.css">
    <style>
        
    </style>
</head>
<body>
    <header>
        <h1><?= htmlspecialchars($textes['titre_header'] ?? 'Niveau de Départ & Caractéristiques') ?></h1>
        <div class="session-info">
            <p>Classe : <strong><?= htmlspecialchars($classeNom) ?></strong> | Race : <strong><?= htmlspecialchars($raceNom) ?></strong></p>
        </div>
    </header>

    <main>
        <form method="POST" id="caracteristiquesForm">
            <!-- Section Niveau -->
            <section class="form-section">
                <h2><?= htmlspecialchars($textes['section_niveau_titre'] ?? 'Niveau de Départ') ?></h2>
                <div class="niveau-selection">
                    <label for="niveau"><?= htmlspecialchars($textes['select_niveau_label'] ?? 'Sélectionnez le niveau de départ :') ?></label>
                    <select name="niveau" id="niveau" required>
                        <?php for ($i = 1; $i <= 20; $i++): ?>
                            <option value="<?= $i ?>" <?= $niveauSauvegarde == $i ? 'selected' : '' ?>>Niveau <?= $i ?></option>
                        <?php endfor; ?>
                    </select>
                </div>
            </section>

            <!-- Section Bonus de Race -->
            <section class="form-section">
                <h2><?= htmlspecialchars($textes['section_bonus_titre'] ?? 'Récapitulatif des Bonus de Race') ?></h2>
                
                <?php if ($typeBonus === 'fixe'): ?>
                    <div class="bonus-fixe-message">
                        <p><strong>Bonus fixes :</strong> Votre race a des bonus prédéfinis qui ne peuvent pas être modifiés.</p>
                    </div>
                <?php else: ?>
                    <p><?= htmlspecialchars($textes['bonus_mod_description'] ?? 'Vous avez des points de race à distribuer sur les Caractéristiques de votre choix.') ?></p>
                    
                    <div class="bonus-race-info">
                        <p><strong>Slots disponibles : <span id="slotsRestants"><?= $nombreSlots ?></span>/<?= $nombreSlots ?></strong></p>
                        <p class="instructions">Choisissez une caractéristique pour chaque slot en cliquant sur les boutons</p>
                    </div>
                <?php endif; ?>
            </section>

            <!-- Section Caractéristiques -->
            <section class="form-section">
                <h2><?= htmlspecialchars($textes['section_carac_titre'] ?? 'Vos Caractéristiques') ?></h2>
                
                <table class="caracteristiques-table">
                    <thead>
                        <tr>
                            <th style="width:15%;"><?= htmlspecialchars($textes['table_headers']['caracteristique'] ?? 'Caractéristique') ?></th>
                            <th><?= htmlspecialchars($textes['table_headers']['score_fixe'] ?? 'Score de base') ?></th>
                            <th class="slot-header" style="width: 50%;">Bonus Racial</th>
                            <th><?= htmlspecialchars($textes['table_headers']['score_total'] ?? 'Score Final') ?></th>
                            <th><?= htmlspecialchars($textes['table_headers']['detail_calcul'] ?? 'Modificateur') ?></th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- Ligne Reset +0 -->
                        <tr class="reset-row">
                            <td class="carac-nom">
                                <strong><?= htmlspecialchars($textes['reset']['label'] ?? 'Reset') ?></strong>
                            </td>
                            <td class="score-base">-</td>
                            <td class="radio-cell">
                                <?php for ($i = 1; $i <= $nombreSlots; $i++): ?>
                                    <div class="radio-container">
                                        <input type="radio" 
                                            name="bonusSlot<?= $i ?>" 
                                            value="reset" 
                                            id="slot<?= $i ?>_reset"
                                            class="bonus-radio reset-radio"
                                            <?= (!isset($bonusSlotsSauvegarde["slot$i"]) || $bonusSlotsSauvegarde["slot$i"] === 'reset') ? 'checked' : '' ?>
                                            <?= $radiosDisabled ? 'disabled' : '' ?>>
                                        <label for="slot<?= $i ?>_reset" 
                                            class="radio-label <?= $radiosDisabled ? 'disabled reset-fixe' : '' ?>">
                                            <?= htmlspecialchars($textes['reset']['radio_label'] ?? '+0') ?>
                                        </label>
                                    </div>
                                <?php endfor; ?>
                            </td>
                            <td class="score-total">-</td>
                            <td class="modificateur">-</td>
                        </tr>
                        
                        <?php foreach ($caracteristiques as $abrev => $nomComplet): ?>
                            <?php 
                            $scoreBase = $scoresFixes[$nomComplet] ?? 10;
                            $bonusTotal = $bonusActuels[$abrev] ?? 0;
                            $scoreTotal = $scoreBase + $bonusTotal;
                            $modificateur = calculerModificateur($scoreTotal);
                            ?>
                            <tr data-carac="<?= $abrev ?>">
                                <td class="carac-nom">
                                    <strong><?= $nomComplet ?></strong><br>
                                    <small>(<?= $abrev ?>)</small>
                                </td>
                                <td class="score-base"><?= $scoreBase ?></td>
                                <td class="radio-cell">
                                    <?php for ($i = 1; $i <= $nombreSlots; $i++): ?>
                                        <div class="radio-container">
                                            <input type="radio" 
                                                name="bonusSlot<?= $i ?>" 
                                                value="<?= $abrev ?>" 
                                                id="slot<?= $i ?>_<?= $abrev ?>"
                                                class="bonus-radio"
                                                <?= (isset($bonusSlotsSauvegarde["slot$i"]) && $bonusSlotsSauvegarde["slot$i"] === $abrev) ? 'checked' : '' ?>
                                                <?= $radiosDisabled ? 'disabled' : '' ?>>
                                            <label for="slot<?= $i ?>_<?= $abrev ?>" 
                                                class="radio-label <?= $radiosDisabled ? 'disabled bonus-fixe' : '' ?>">
                                                +1
                                            </label>
                                        </div>
                                    <?php endfor; ?>
                                </td>
                                <td class="score-total" id="scoreTotal_<?= $abrev ?>"><?= $scoreTotal ?></td>
                                <td class="modificateur" id="modificateur_<?= $abrev ?>">
                                    <?= $modificateur >= 0 ? '+' . $modificateur : $modificateur ?>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </section>

            <!-- Section Points de Vie -->
            <section class="form-section">
                <h2><?= htmlspecialchars($textes['section_pv_titre'] ?? 'Points de Vie Max (PVMax)') ?></h2>
                
                <div class="pv-calculation">
                    <table class="pv-table">
                        <thead>
                            <tr>
                                <th><?= htmlspecialchars($textes['table_pv_headers']['de_vie'] ?? 'Dé de Vie') ?></th>
                                <th><?= htmlspecialchars($textes['table_pv_headers']['bonus_constitution'] ?? 'Bonus CON') ?></th>
                                <th><?= htmlspecialchars($textes['table_pv_headers']['niveau_personnage'] ?? 'Niveau') ?></th>
                                <th><?= htmlspecialchars($textes['table_pv_headers']['pv_max'] ?? 'PV Max') ?></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><?= $jetDeVie ?></td>
                                <td id="modConstitution"><?= $modificateurs['Con'] >= 0 ? '+' . $modificateurs['Con'] : $modificateurs['Con'] ?></td>
                                <td id="niveauAffichage"><?= $niveauSauvegarde ?></td>
                                <td id="pvMax" class="pv-total"><?= $pvTotal ?></td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <div class="pv-details">
                        <p><strong>Détail du calcul :</strong></p>
                        <p id="detailCalcul">
                            (<?= $valeurDeVie ?> + <?= $modificateurs['Con'] >= 0 ? '+' . $modificateurs['Con'] : $modificateurs['Con'] ?>) × <?= $niveauSauvegarde ?> = <?= $pvTotal ?> PV
                        </p>
                    </div>
                </div>
            </section>

            <!-- Navigation -->
            <div class="navigation-buttons">
                <a href="page2.php" class="secondary-button">
                    <?= htmlspecialchars($textes['boutons']['retour_texte'] ?? 'Retour') ?>
                </a>
                <button type="submit" class="primary-button" id="submitButton">
                    <?= htmlspecialchars($textes['boutons']['suivant_texte'] ?? 'Suivant') ?>
                </button>
            </div>
        </form>
    </main>

    <footer>
        <p><?= htmlspecialchars($textes['footer_texte'] ?? '&copy; 2025 Character Builder') ?></p>
    </footer>

    <script>
        // =============================================
        // DONNÉES PHP PASSÉES VIA JSON
        // =============================================
        const phpData = <?= json_encode($jsData) ?>;
        const nombreSlots = phpData.nombreSlots;
        const scoresBase = phpData.scoresBase;
        const valeurDeVie = phpData.valeurDeVie;
        const caracteristiques = phpData.caracteristiques;
        const typeBonus = phpData.typeBonus;

        // Désactiver les interactions si bonus fixes
        if (typeBonus === 'fixe') {
            document.querySelectorAll('.bonus-radio').forEach(radio => {
                radio.disabled = true;
            });
            document.querySelectorAll('.radio-label').forEach(label => {
                label.classList.add('disabled');
            });
        }

        // =============================================
        // FONCTIONS DE CALCUL FACTORISÉES
        // =============================================

        function calculerModificateur(score) {
            return Math.floor(score / 2 - 5);
        }

        function calculerPointsDeVie(valeurDeVie, niveau, modConstitution) {
            return (valeurDeVie + modConstitution) * niveau;
        }

        // =============================================
        // FONCTIONS DE MISE À JOUR DE L'INTERFACE
        // =============================================

        function updateScores() {
            const bonusActuels = {};
            Object.keys(scoresBase).forEach(abrev => {
                bonusActuels[abrev] = 0;
            });

            // Compter les bonus pour chaque caractéristique
            for (let i = 1; i <= nombreSlots; i++) {
                const selectedRadio = document.querySelector(`input[name="bonusSlot${i}"]:checked`);
                if (selectedRadio && selectedRadio.value !== 'reset') {
                    bonusActuels[selectedRadio.value]++;
                }
            }

            // Mettre à jour l'affichage des scores et modificateurs
            Object.keys(scoresBase).forEach(abrev => {
                const scoreTotal = scoresBase[abrev] + bonusActuels[abrev];
                const modificateur = calculerModificateur(scoreTotal);
                
                document.getElementById(`scoreTotal_${abrev}`).textContent = scoreTotal;
                document.getElementById(`modificateur_${abrev}`).textContent = 
                    modificateur >= 0 ? `+${modificateur}` : modificateur;
            });

            // Mettre à jour le modificateur de Constitution
            const scoreCon = scoresBase['Con'] + bonusActuels['Con'];
            const modCon = calculerModificateur(scoreCon);
            document.getElementById('modConstitution').textContent = modCon >= 0 ? `+${modCon}` : modCon;
            
            updatePointsDeVie();
            updateSlotsRestants();
        }

        function updatePointsDeVie() {
            const niveau = parseInt(document.getElementById('niveau').value);
            const modCon = parseInt(document.getElementById('modConstitution').textContent);
            
            const pvMax = calculerPointsDeVie(valeurDeVie, niveau, modCon);
            
            document.getElementById('pvMax').textContent = pvMax;
            document.getElementById('niveauAffichage').textContent = niveau;
            
            document.getElementById('detailCalcul').textContent = 
                `(${valeurDeVie} + ${modCon >= 0 ? '+' + modCon : modCon}) × ${niveau} = ${pvMax} PV`;
        }

        function updateSlotsRestants() {
            let slotsUtilises = 0;
            for (let i = 1; i <= nombreSlots; i++) {
                const selectedRadio = document.querySelector(`input[name="bonusSlot${i}"]:checked`);
                if (selectedRadio && selectedRadio.value !== 'reset') {
                    slotsUtilises++;
                }
            }
            const slotsRestants = nombreSlots - slotsUtilises;
            document.getElementById('slotsRestants').textContent = slotsRestants;
            
            const slotsElement = document.getElementById('slotsRestants');
            if (slotsRestants === 0) {
                slotsElement.style.color = '#90ee90';
            } else {
                slotsElement.style.color = '#ff6b6b';
            }

            document.getElementById('submitButton').disabled = slotsRestants > 0;
        }

        // =============================================
        // GESTION DES ÉVÉNEMENTS
        // =============================================

        document.querySelectorAll('.radio-label:not(.disabled)').forEach(label => {
            label.addEventListener('click', function() {
                if (!this.classList.contains('disabled')) {
                    const radioId = this.getAttribute('for');
                    const radio = document.getElementById(radioId);
                    if (radio) {
                        radio.checked = true;
                        updateScores();
                    }
                }
            });
        });

        document.getElementById('niveau').addEventListener('change', updatePointsDeVie);

        // Initialisation au chargement
        document.addEventListener('DOMContentLoaded', function() {
            updateScores();
        });

        // Validation du formulaire
        document.getElementById('caracteristiquesForm').addEventListener('submit', function(e) {
            let slotsUtilises = 0;
            for (let i = 1; i <= nombreSlots; i++) {
                const selectedRadio = document.querySelector(`input[name="bonusSlot${i}"]:checked`);
                if (selectedRadio && selectedRadio.value !== 'reset') {
                    slotsUtilises++;
                }
            }
            
            if (slotsUtilises !== nombreSlots) {
                e.preventDefault();
                alert(`Vous devez attribuer tous les slots de bonus. Il reste ${nombreSlots - slotsUtilises} slot(s) à attribuer.`);
            }
        });
    </script>
</body>
</html>