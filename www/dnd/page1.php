<?php
session_start();
require_once 'includes/functions.php';

// Charger et valider les données
$textes = chargerJSON('page1.json');
$classesData = chargerJSON('classes.json');

// Valider la structure - si invalide, utiliser des valeurs par défaut
if (!$textes || !validerStructurePage($textes)) {
    $textes = ['page1' => [
        'titre_page' => 'Donjons & Dragons',
        'titre_header' => 'Choisissez votre Classe',
        'introduction' => 'Veuillez sélectionner votre classe.',
        'boutons' => ['retour_texte' => 'Accueil', 'suivant_texte' => 'Suivant'],
        'footer_texte' => '&copy; 2025 Character Builder'
    ]];
} else {
    $textes = $textes['page1'];
}

// Valider la nouvelle structure des classes (objet au lieu de tableau)
if (!$classesData || !is_array($classesData)) {
    $classesData = [];
}

// Gérer la sélection de classe
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['classe'])) {
    $classeSelectionnee = trim($_POST['classe']);
    
    // Valider que la classe existe dans les clés
    if (isset($classesData[$classeSelectionnee])) {
        $_SESSION['classeSelectionnee'] = $classeSelectionnee;
        header('Location: page2.php');
        exit;
    }
}

// Gérer la réinitialisation
if (isset($_GET['reset'])) {
    unset($_SESSION['classeSelectionnee']);
    header('Location: page1.php');
    exit;
}

$classeSauvegardee = $_SESSION['classeSelectionnee'] ?? null;
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
        <h1><?= htmlspecialchars($textes['titre_header'] ?? 'Choisissez votre Classe') ?></h1>
        <?php if ($classeSauvegardee): ?>
            <p class="session-info">Classe sélectionnée : <strong><?= htmlspecialchars($classeSauvegardee) ?></strong></p>
        <?php endif; ?>
    </header>

    <main>
        <section>
            <h2><?= htmlspecialchars($textes['titre_section'] ?? 'Classes disponibles') ?></h2>
            <p><?= htmlspecialchars($textes['introduction'] ?? 'Veuillez sélectionner votre classe.') ?></p>

            <form method="POST">
                <div id="vClasseOptionsList" class="classe-options-list">
                    <?php if (!empty($classesData)): ?>
                        <?php foreach ($classesData as $nomClasse => $classe): ?>
                            <?php if (isset($classe['image_url']) && isset($classe['description_html'])): ?>
                            <div class="classe-option-card <?= ($classeSauvegardee === $nomClasse) ? 'selected' : '' ?>">
                                <label>
                                    <table class="classe-layout-table">
                                        <tr>
                                            <td rowspan="2" class="radio-cell">
                                                <input type="radio" name="classe" value="<?= htmlspecialchars($nomClasse) ?>" 
                                                       <?= ($classeSauvegardee === $nomClasse) ? 'checked' : '' ?>>
                                            </td>
                                            <td colspan="2" class="classe-header-title">
                                                <?= htmlspecialchars($nomClasse) ?>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="classe-image-cell">
                                                <img src="<?= htmlspecialchars($classe['image_url']) ?>" 
                                                     alt="Image de la classe <?= htmlspecialchars($nomClasse) ?>" 
                                                     class="classe-image">
                                            </td>
                                            <td class="classe-description-cell">
                                                <div class="classe-description">
                                                    <?= $classe['description_html'] ?>
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
                            <p>Aucune classe disponible pour le moment.</p>
                            <p>Veuillez vérifier que le fichier classes.json est correctement formaté.</p>
                            <p>Structure actuelle : <?= gettype($classesData) ?></p>
                            <?php if ($classesData): ?>
                                <p>Clés disponibles : <?= implode(', ', array_keys($classesData)) ?></p>
                            <?php endif; ?>
                        </div>
                    <?php endif; ?>
                </div>

                <hr>

                <div class="navigation-buttons">
                    <a href="index.php" class="secondary-button">
                        <?= htmlspecialchars($textes['boutons']['retour_texte'] ?? 'Accueil') ?>
                    </a>
                    <?php if ($classeSauvegardee): ?>
                        <a href="?reset=1" class="secondary-button">Réinitialiser</a>
                    <?php endif; ?>
                    <button type="submit" id="vBoutonSuivant" <?= !$classeSauvegardee ? 'disabled' : '' ?>>
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
        document.querySelectorAll('input[name="classe"]').forEach(radio => {
            radio.addEventListener('change', function() {
                document.getElementById('vBoutonSuivant').disabled = !document.querySelector('input[name="classe"]:checked');
            });
        });

        // Initialiser l'état du bouton
        document.getElementById('vBoutonSuivant').disabled = !document.querySelector('input[name="classe"]:checked');
    </script>
</body>
</html>