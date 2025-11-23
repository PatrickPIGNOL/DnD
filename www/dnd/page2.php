<?php
session_start();
require_once 'includes/functions.php';

// Vérifier qu'une classe est sélectionnée
if (!isset($_SESSION['classeSelectionnee'])) {
    header('Location: page1.php');
    exit;
}

// Charger et valider les données
$textes = chargerJSON('page2.json');
$races = chargerJSON('races.json');

// Valider la structure - si invalide, utiliser des valeurs par défaut
if (!$textes || !validerStructurePage($textes)) {
    $textes = ['page2' => [
        'titre_page' => 'Donjons & Dragons',
        'titre_header' => 'Choisissez votre Race',
        'titre_section' => 'Choisissez votre Race',
        'description_section' => 'La race détermine l\'apparence physique de votre personnage, sa longévité, et lui confère des bonus de caractéristiques ainsi que des traits spéciaux.',
        'boutons' => ['retour_texte' => 'Retour', 'suivant_texte' => 'Suivant'],
        'footer_texte' => '&copy; 2025 Character Builder',
        'messages' => [
            'chargement' => 'Chargement des options de race...',
            'image_alt' => 'Image de la race {race}',
            'alerte_selection' => 'Veuillez sélectionner une race avant de continuer.'
        ]
    ]];
} else {
    $textes = $textes['page2'];
}

if (!$races || !is_array($races)) {
    $races = [];
}

// Gérer la sélection de race
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['race'])) {
    $raceSelectionnee = trim($_POST['race']);
    
    // Valider que la race existe
    $raceValide = false;
    foreach ($races as $race) {
        if ($race['nom'] === $raceSelectionnee) {
            $raceValide = true;
            break;
        }
    }
    
    if ($raceValide) {
        $_SESSION['raceSelectionnee'] = $raceSelectionnee;
        header('Location: page3.php');
        exit;
    }
}

// Gérer la réinitialisation
if (isset($_GET['reset'])) {
    unset($_SESSION['raceSelectionnee']);
    header('Location: page2.php');
    exit;
}

$raceSauvegardee = $_SESSION['raceSelectionnee'] ?? null;
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
        <h1><?= htmlspecialchars($textes['titre_header'] ?? 'Choisissez votre Race') ?></h1>
        <div class="session-info">
            <p>Classe sélectionnée : <strong><?= htmlspecialchars($_SESSION['classeSelectionnee']) ?></strong></p>
            <?php if ($raceSauvegardee): ?>
                <p>Race sélectionnée : <strong><?= htmlspecialchars($raceSauvegardee) ?></strong></p>
            <?php endif; ?>
        </div>
    </header>

    <main>
        <section>
            <h2><?= htmlspecialchars($textes['titre_section'] ?? 'Choisissez votre Race') ?></h2>
            <p><?= htmlspecialchars($textes['description_section'] ?? 'La race détermine l\'apparence physique de votre personnage, sa longévité, et lui confère des bonus de caractéristiques ainsi que des traits spéciaux.') ?></p>

            <form method="POST" id="raceSelectionForm">
                <div class="classe-options-list">  <!-- Même classe que page1 -->
                    <?php if (!empty($races)): ?>
                        <?php foreach ($races as $race): ?>
                            <?php if (isset($race['nom']) && isset($race['image_url'])): ?>
                            <div class="classe-option-card <?= ($raceSauvegardee === $race['nom']) ? 'selected' : '' ?>">
                                <label>
                                    <table class="classe-layout-table">
                                        <tr>
                                            <td rowspan="2" class="radio-cell">
                                                <input type="radio" name="race" value="<?= htmlspecialchars($race['nom']) ?>" 
                                                       <?= ($raceSauvegardee === $race['nom']) ? 'checked' : '' ?>>
                                            </td>
                                            <td rowspan="2" class="classe-image-cell">
                                                <img src="<?= htmlspecialchars($race['image_url']) ?>" 
                                                     alt="<?= str_replace('{race}', htmlspecialchars($race['nom']), $textes['messages']['image_alt'] ?? 'Image de la race') ?>" 
                                                     class="classe-image">
                                            </td>
                                            <td colspan="2" class="classe-header-title">
                                                <?= htmlspecialchars($race['nom']) ?>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="classe-description-cell">
                                                <div class="classe-description">
                                                    <?= $race['description_courte'] ?? 'Description non disponible' ?>
                                                </div>
                                            </td>
                                        </tr>
                                    </table>
                                </label>
                            </div>
                            <?php endif; ?>
                        <?php endforeach; ?>
                    <?php else: ?>
                        <div class="error-message">
                            <p><?= htmlspecialchars($textes['messages']['chargement'] ?? 'Aucune race disponible pour le moment.') ?></p>
                            <p>Veuillez vérifier que le fichier races.json est correctement formaté.</p>
                        </div>
                    <?php endif; ?>
                </div>

                <hr>

                <div class="navigation-buttons">
                    <a href="page1.php" class="secondary-button">
                        <?= htmlspecialchars($textes['boutons']['retour_texte'] ?? 'Retour') ?>
                    </a>
                    <button type="submit" id="vNextButton" <?= !$raceSauvegardee ? 'disabled' : '' ?>>
                        <?= htmlspecialchars($textes['boutons']['suivant_texte'] ?? 'Suivant') ?>
                    </button>
                </div>
            </form>
        </section>
    </main>

    <footer>
        <p><?= htmlspecialchars($textes['footer_texte'] ?? '&copy; 2025 Character Builder') ?></p>
    </footer>

    <script>
        // Activer/désactiver le bouton Suivant
        document.querySelectorAll('input[name="race"]').forEach(radio => {
            radio.addEventListener('change', function() {
                document.getElementById('vNextButton').disabled = !document.querySelector('input[name="race"]:checked');
            });
        });

        // Initialiser l'état du bouton
        document.getElementById('vNextButton').disabled = !document.querySelector('input[name="race"]:checked');

        // Gérer la soumission du formulaire avec validation
        document.getElementById('raceSelectionForm').addEventListener('submit', function(e) {
            const selectedRace = document.querySelector('input[name="race"]:checked');
            if (!selectedRace) {
                e.preventDefault();
                alert('<?= htmlspecialchars($textes['messages']['alerte_selection'] ?? 'Veuillez sélectionner une race avant de continuer.') ?>');
            }
        });
    </script>
</body>
</html>