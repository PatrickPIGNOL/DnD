<?php
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

// Gérer la soumission du formulaire
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['niveau'])) {
    $_SESSION['niveau'] = (int)$_POST['niveau'];
    $_SESSION['bonusCarac'] = $_POST['bonusCarac'] ?? [];
    header('Location: page4.php');
    exit;
}

// Valeurs par défaut
$niveauSauvegarde = $_SESSION['niveau'] ?? 1;
$bonusCaracSauvegarde = $_SESSION['bonusCarac'] ?? [];

// Caractéristiques de base
$caracteristiques = [
    'For' => 'Force',
    'Dex' => 'Dextérité', 
    'Con' => 'Constitution',
    'Int' => 'Intelligence',
    'Sag' => 'Sagesse',
    'Cha' => 'Charisme'
];

$scoresFixes = $classeData['scores_fixes'] ?? [];
$jetDeVie = $classeData['jetDeVie'] ?? 'd8';
$bonusRace = $raceData['bonusCarac'] ?? [];

// Calculer les valeurs des dés de vie
$valeursDeVie = [
    'd6' => 6, 'd8' => 8, 'd10' => 10, 'd12' => 12
];
$valeurDeVie = $valeursDeVie[$jetDeVie] ?? 8;
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($textes['titre_page'] ?? 'Donjons & Dragons') ?></title>
    <link rel="stylesheet" href="css/style.css">
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
                            <option value="<?= $i ?>" <?= $niveauSauvegarde == $i ? 'selected' : '' ?>>
                                Niveau <?= $i ?>
                            </option>
                        <?php endfor; ?>
                    </select>
                </div>
            </section>

            <!-- Section Bonus de Race -->
            <section class="form-section">
                <h2><?= htmlspecialchars($textes['section_bonus_titre'] ?? 'Récapitulatif des Bonus de Race') ?></h2>
                <p><?= htmlspecialchars($textes['bonus_mod_description'] ?? 'Vous avez des points de race à distribuer sur les Caractéristiques de votre choix.') ?></p>
                
                <?php if ($bonusRace && $bonusRace['type'] === 'choix'): ?>
                    <div class="bonus-race-info">
                        <p><strong>Points disponibles : <?= $bonusRace['nombreSlots'] ?? 0 ?></strong></p>
                        <?php if (!empty($bonusRace['bonus'])): ?>
                            <p>Bonus fixes : 
                                <?php foreach ($bonusRace['bonus'] as $bonus): ?>
                                    <?= $bonus['carac'] ?> +<?= $bonus['valeur'] ?> 
                                <?php endforeach; ?>
                            </p>
                        <?php endif; ?>
                    </div>
                <?php endif; ?>
            </section>

            <!-- Section Caractéristiques -->
            <section class="form-section">
                <h2><?= htmlspecialchars($textes['section_carac_titre'] ?? 'Vos Caractéristiques') ?></h2>
                
                <table class="caracteristiques-table">
                    <thead>
                        <tr>
                            <th><?= htmlspecialchars($textes['table_headers']['caracteristique'] ?? 'Caractéristique') ?></th>
                            <th><?= htmlspecialchars($textes['table_headers']['score_fixe'] ?? 'Score de base') ?></th>
                            <th><?= htmlspecialchars($textes['table_headers']['allocation_bonus'] ?? 'Bonus de race') ?></th>
                            <th><?= htmlspecialchars($textes['table_headers']['score_total'] ?? 'Score Final') ?></th>
                            <th><?= htmlspecialchars($textes['table_headers']['detail_calcul'] ?? 'Modificateur') ?></th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($caracteristiques as $abrev => $nomComplet): ?>
                            <?php 
                            $scoreBase = $scoresFixes[$nomComplet] ?? 10;
                            $bonusActuel = $bonusCaracSauvegarde[$abrev] ?? 0;
                            $scoreTotal = $scoreBase + $bonusActuel;
                            $modificateur = floor(($scoreTotal - 10) / 2);
                            ?>
                            <tr>
                                <td class="carac-nom">
                                    <strong><?= $nomComplet ?></strong><br>
                                    <small>(<?= $abrev ?>)</small>
                                </td>
                                <td class="score-base"><?= $scoreBase ?></td>
                                <td class="bonus-race">
                                    <select name="bonusCarac[<?= $abrev ?>]" class="bonus-select">
                                        <option value="0" <?= $bonusActuel == 0 ? 'selected' : '' ?>>+0</option>
                                        <option value="1" <?= $bonusActuel == 1 ? 'selected' : '' ?>>+1</option>
                                        <option value="2" <?= $bonusActuel == 2 ? 'selected' : '' ?>>+2</option>
                                    </select>
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
                                <th><?= htmlspecialchars($textes['table_headers']['jet_de_vie'] ?? 'Jet de Vie') ?></th>
                                <th><?= htmlspecialchars($textes['table_headers']['mod_con'] ?? 'Mod. CON') ?></th>
                                <th><?= htmlspecialchars($textes['table_headers']['niveau_personnage'] ?? 'Niveau') ?></th>
                                <th><?= htmlspecialchars($textes['table_headers']['pv_obtenus'] ?? 'PV Max') ?></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><?= $jetDeVie ?> (max niveau 1)</td>
                                <td id="modConstitution"><?= floor((($scoresFixes['Constitution'] ?? 10) - 10) / 2) ?></td>
                                <td id="niveauAffichage"><?= $niveauSauvegarde ?></td>
                                <td id="pvMax" class="pv-total">
                                    <?= $valeurDeVie + (($niveauSauvegarde - 1) * (floor($valeurDeVie / 2) + 1 + floor((($scoresFixes['Constitution'] ?? 10) - 10) / 2))) ?>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <div class="pv-details">
                        <p><strong>Détail du calcul :</strong></p>
                        <p id="detailCalcul">
                            <?= htmlspecialchars($textes['calcul_pv']['pv_base_niveau_1'] ?? 'PV de Base au Niveau 1') ?> : <?= $valeurDeVie ?> +
                            <?= htmlspecialchars($textes['calcul_pv']['pv_par_niveaux'] ?? 'PV par Niveaux') ?> : (<?= $niveauSauvegarde - 1 ?> × <?= floor($valeurDeVie / 2) + 1 ?>) +
                            <?= htmlspecialchars($textes['calcul_pv']['bonus_constitution'] ?? 'Bonus de Constitution') ?> : (<?= $niveauSauvegarde ?> × <?= floor((($scoresFixes['Constitution'] ?? 10) - 10) / 2) ?>)
                        </p>
                    </div>
                </div>
            </section>

            <!-- Navigation -->
            <div class="navigation-buttons">
                <a href="page2.php" class="secondary-button">
                    <?= htmlspecialchars($textes['boutons']['retour_texte'] ?? 'Retour') ?>
                </a>
                <button type="submit" class="primary-button">
                    <?= htmlspecialchars($textes['boutons']['suivant_texte'] ?? 'Suivant (Historique)') ?>
                </button>
            </div>
        </form>
    </main>

    <footer>
        <p><?= htmlspecialchars($textes['footer_texte'] ?? '&copy; 2025 Character Builder') ?></p>
    </footer>

    <script>
        // Mise à jour dynamique des scores et modificateurs
        document.querySelectorAll('.bonus-select').forEach(select => {
            select.addEventListener('change', function() {
                const abrev = this.name.match(/\[(.*?)\]/)[1];
                const scoreBase = parseInt(this.closest('tr').querySelector('.score-base').textContent);
                const bonus = parseInt(this.value);
                const scoreTotal = scoreBase + bonus;
                const modificateur = Math.floor((scoreTotal - 10) / 2);
                
                document.getElementById(`scoreTotal_${abrev}`).textContent = scoreTotal;
                document.getElementById(`modificateur_${abrev}`).textContent = modificateur >= 0 ? `+${modificateur}` : modificateur;
                
                // Mettre à jour le modificateur de Constitution si c'est la CON
                if (abrev === 'Con') {
                    document.getElementById('modConstitution').textContent = modificateur;
                    updatePointsDeVie();
                }
            });
        });

        // Mise à jour des points de vie quand le niveau change
        document.getElementById('niveau').addEventListener('change', function() {
            document.getElementById('niveauAffichage').textContent = this.value;
            updatePointsDeVie();
        });

        function updatePointsDeVie() {
            const niveau = parseInt(document.getElementById('niveau').value);
            const modCon = parseInt(document.getElementById('modConstitution').textContent);
            const valeurDeVie = <?= $valeurDeVie ?>;
            
            // Calcul des PV : max au niveau 1, puis moyenne arrondie vers le haut pour les niveaux suivants
            const pvBaseNiveau1 = valeurDeVie;
            const pvParNiveau = Math.floor(valeurDeVie / 2) + 1; // moyenne arrondie vers le haut
            const pvNiveauxSuivants = (niveau - 1) * pvParNiveau;
            const bonusConTotal = niveau * modCon;
            
            const pvMax = pvBaseNiveau1 + pvNiveauxSuivants + bonusConTotal;
            
            document.getElementById('pvMax').textContent = pvMax;
            
            // Mettre à jour le détail du calcul
            document.getElementById('detailCalcul').textContent = 
                `PV Base Niveau 1: ${pvBaseNiveau1} + PV Niveaux suivants: ${pvNiveauxSuivants} (${niveau - 1} × ${pvParNiveau}) + Bonus CON: ${bonusConTotal} (${niveau} × ${modCon})`;
        }

        // Validation du formulaire
        document.getElementById('caracteristiquesForm').addEventListener('submit', function(e) {
            let totalBonus = 0;
            document.querySelectorAll('.bonus-select').forEach(select => {
                totalBonus += parseInt(select.value);
            });
            
            const bonusDisponibles = <?= $bonusRace['nombreSlots'] ?? 0 ?>;
            
            if (totalBonus > bonusDisponibles) {
                e.preventDefault();
                alert(`Vous avez attribué ${totalBonus} points de bonus, mais vous n'avez que ${bonusDisponibles} points disponibles.`);
            }
        });
    </script>
</body>
</html>