<?php
// page4.php - Système de sélection Classe & Historique

session_start();

// Récupérer les données de la session (page3.php)
$classeNom = $_SESSION['classeSelectionnee'] ?? '';
$raceNom = $_SESSION['raceSelectionnee'] ?? '';
$niveau = $_SESSION['niveau'] ?? 1;
$bonusSlots = $_SESSION['bonusSlots'] ?? [];

// Vérifier qu'on a les données nécessaires
if (empty($classeNom) || empty($raceNom)) {
    header('Location: page1.php');
    exit;
}

// Charger les données JSON
$classes = json_decode(file_get_contents('data/classes.json'), true);
$historiques = json_decode(file_get_contents('data/historiques.json'), true);
$races = json_decode(file_get_contents('data/races.json'), true);
$langues = json_decode(file_get_contents('data/langues.json'), true);
$outils = json_decode(file_get_contents('data/outils.json'), true);

// Récupérer les données de la classe et race
$classeData = $classes[$classeNom] ?? null;
$raceData = null;
foreach ($races as $race) {
    if ($race['nom'] === $raceNom) {
        $raceData = $race;
        break;
    }
}

if (!$classeData || !$raceData) {
    header('Location: page1.php');
    exit;
}

// RECALCULER LES CARACTÉRISTIQUES (comme dans page3.php)
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

// Calculer les bonus actuels par caractéristique
$bonusActuels = array_fill_keys(array_keys($caracteristiques), 0);
foreach ($bonusSlots as $slot => $carac) {
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
    $modificateurs[$abrev] = floor($scoresFinaux[$abrev] / 2 - 5);
}

// Calculer les PV
function getValeursDeVie($classeNom) {
    $valeursVie = [
        'Artificier' => 6, 'Barbare' => 10, 'Barde' => 6, 'Clerc' => 6,
        'Druide' => 6, 'Ensorceleur' => 4, 'Guerrier' => 8, 'Magicien' => 4,
        'Moine' => 6, 'Occultiste' => 6, 'Paladin' => 8, 'Rodeur' => 8, 'Roublard' => 6
    ];
    return $valeursVie[$classeNom] ?? 6;
}

$valeurDeVie = getValeursDeVie($classeNom);
$pvTotal = ($valeurDeVie + $modificateurs['Con']) * $niveau;

// Variables pour stocker les sélections
$classe_choisie = $classeNom;
$historique_choisi = $_POST['historique'] ?? $_SESSION['historique_choisi'] ?? '';
$specialites_choisies = $_POST['specialites'] ?? $_SESSION['specialites_choisies'] ?? [];
$trait_choisi = $_POST['trait'] ?? $_SESSION['trait_choisi'] ?? '';
$ideal_choisi = $_POST['ideal'] ?? $_SESSION['ideal_choisi'] ?? '';
$lien_choisi = $_POST['lien'] ?? $_SESSION['lien_choisi'] ?? '';
$defaut_choisi = $_POST['defaut'] ?? $_SESSION['defaut_choisi'] ?? '';
$outils_choisis = $_POST['outils'] ?? $_SESSION['outils_choisis'] ?? [];
$langues_choisies = $_POST['langues'] ?? $_SESSION['langues_choisies'] ?? [];

// Gérer la soumission du formulaire
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['confirmer_historique'])) {
        // Sauvegarder juste l'historique
        $_SESSION['historique_choisi'] = $_POST['historique'] ?? '';
        $historique_choisi = $_SESSION['historique_choisi'];
    } elseif (isset($_POST['valider_complet'])) {
        // Sauvegarder toutes les sélections
        $_SESSION['historique_choisi'] = $historique_choisi;
        $_SESSION['specialites_choisies'] = $specialites_choisies;
        $_SESSION['trait_choisi'] = $trait_choisi;
        $_SESSION['ideal_choisi'] = $ideal_choisi;
        $_SESSION['lien_choisi'] = $lien_choisi;
        $_SESSION['defaut_choisi'] = $defaut_choisi;
        $_SESSION['outils_choisis'] = $outils_choisis;
        $_SESSION['langues_choisies'] = $langues_choisies;
        
        header('Location: page5.php');
        exit;
    }
}

// Fonction pour obtenir les historiques disponibles pour une classe
function getHistoriquesForClasse($classe, $classes, $historiques) {
    if (empty($classe) || !isset($classes[$classe])) return [];
    
    $historiques_classe = array_filter($classes[$classe]['historiques']);
    $historiques_disponibles = [];
    
    foreach ($historiques_classe as $nom_historique) {
        if (isset($historiques[$nom_historique])) {
            $historiques_disponibles[$nom_historique] = $historiques[$nom_historique];
        }
    }
    
    return $historiques_disponibles;
}
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sélection Classe & Historique</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <header>
        <h1>Création de Personnage - Classe & Historique</h1>
        <div class="session-info">
            <h3 style="color: #ffd700; margin-top: 0;">Récapitulatif de votre personnage :</h3>
            <p><strong>Classe :</strong> <?= htmlspecialchars($classeNom) ?> | 
               <strong>Race :</strong> <?= htmlspecialchars($raceNom) ?> | 
               <strong>Niveau :</strong> <?= $niveau ?> | 
               <strong>PV :</strong> <?= $pvTotal ?></p>
            
            <div>
                <h4 style="color: #90ee90; margin: 10px 0 5px 0;">Caractéristiques :</h4>
                <p>
                    <?php foreach ($caracteristiques as $abrev => $nom): ?>
                        <?php if (isset($scoresFinaux[$abrev])): ?>
                            <strong style="color: #ffd700;"><?= $abrev ?>:</strong> 
                            <?= $scoresFinaux[$abrev] ?> 
                            (<?= $modificateurs[$abrev] >= 0 ? '+' . $modificateurs[$abrev] : $modificateurs[$abrev] ?>) 
                            &nbsp;&nbsp;
                        <?php endif; ?>
                    <?php endforeach; ?>
                </p>
            </div>
        </div>
    </header>

    <main>
        <form method="POST" action="page4.php" id="historiqueForm">
            <!-- SECTION HISTORIQUE -->
            <?php if ($classe_choisie): ?>
                <?php $historiques_disponibles = getHistoriquesForClasse($classe_choisie, $classes, $historiques); ?>
                
                <section class="form-section">
                    <h2>1. Choisissez votre Historique</h2>
                    
                    <select name="historique" id="historique-select" style="
                        width: 100%;
                        padding: 12px;
                        background-color: #2a2a2a;
                        border: 2px solid #555;
                        border-radius: 5px;
                        color: #ccc;
                        font-size: 1em;
                        margin-bottom: 10px;
                    ">
                        <option value="">-- Choisir un historique --</option>
                        <?php foreach ($historiques_disponibles as $nom_historique => $historique): ?>
                            <option value="<?= $nom_historique ?>" <?= $historique_choisi == $nom_historique ? 'selected' : '' ?>>
                                <?= $nom_historique ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                    
                    <button type="submit" name="confirmer_historique" class="primary-button" style="margin-bottom: 20px;">
                        Confirmer l'Historique
                    </button>
                    
                    <?php if ($historique_choisi && isset($historiques[$historique_choisi])): ?>
                        <h3><?= $historique_choisi ?></h3>
                        <p><?= strip_tags($historiques[$historique_choisi]['Description']) ?></p>
                    <?php endif; ?>
                    
                    <hr>
                </section>
            <?php endif; ?>

            
            <!-- SECTION ÉQUIPEMENT ET MAÎTRISES FIXES -->
            <?php if ($historique_choisi && isset($historiques[$historique_choisi])): ?>
                <?php $hist = $historiques[$historique_choisi]; ?>
                
                <section class="form-section">
                    <h2>2. Équipement et Maîtrises Fixes</h2>
                    
                    <!-- Équipement de départ -->
                    <?php if (!empty($hist['Equipement'])): ?>
                        <div style="margin: 15px 0;">
                            <h4 style="color: #ffd700; margin-bottom: 8px;">Équipement de départ :</h4>
                            <div style="padding: 10px; background: #1a1a1a; border-radius: 5px;">
                                <?php foreach ($hist['Equipement'] as $item): ?>
                                    <?php if (isset($item['Objet'])): ?>
                                        <div style="color: #90ee90; margin: 5px 0;">✓ <?= $item['Objet'] ?> 
                                            <?php if (isset($item['Quantité']) && $item['Quantité'] > 1): ?>
                                                (x<?= $item['Quantité'] ?>)
                                            <?php endif; ?>
                                        </div>
                                    <?php elseif (isset($item['Outil'])): ?>
                                        <div style="color: #90ee90; margin: 5px 0;">✓ <?= is_array($item['Outil']) ? $item['Outil']['type'] : $item['Outil'] ?>
                                            <?php if (isset($item['Quantité']) && $item['Quantité'] > 1): ?>
                                                (x<?= $item['Quantité'] ?>)
                                            <?php endif; ?>
                                        </div>
                                    <?php elseif (isset($item['Argent'])): ?>
                                        <div style="color: #ffd700; margin: 5px 0;">💰 <?= $item['Argent']['Quantité'] ?> <?= $item['Argent']['Unité'] ?></div>
                                    <?php elseif (isset($item['Kit'])): ?>
                                        <div style="color: #90ee90; margin: 5px 0;">✓ <?= is_array($item['Kit']) ? $item['Kit']['type'] : $item['Kit'] ?></div>
                                    <?php endif; ?>
                                <?php endforeach; ?>
                            </div>
                        </div>
                    <?php endif; ?>

                    <!-- Maîtrises de Compétences -->
                    <?php if (!empty($hist['MaitriseCompetences'])): ?>
                        <div style="margin: 15px 0;">
                            <h4 style="color: #ffd700; margin-bottom: 8px;">Compétences maîtrisées :</h4>
                            <div style="padding: 10px; background: #1a1a1a; border-radius: 5px;">
                                <?php foreach ($hist['MaitriseCompetences'] as $competence): ?>
                                    <div style="color: #90ee90; margin: 5px 0;">✓ <?= $competence ?></div>
                                <?php endforeach; ?>
                            </div>
                        </div>
                    <?php endif; ?>

                    <!-- Langues fixes -->
                    <?php if (!empty($hist['Langues']) && !empty($hist['Langues']['Langues'])): ?>
                        <div style="margin: 15px 0;">
                            <h4 style="color: #ffd700; margin-bottom: 8px;">Langues supplémentaires :</h4>
                            <div style="padding: 10px; background: #1a1a1a; border-radius: 5px;">
                                <?php foreach ($hist['Langues']['Langues'] as $langue): ?>
                                    <div style="color: #90ee90; margin: 5px 0;">✓ <?= $langue ?></div>
                                <?php endforeach; ?>
                            </div>
                        </div>
                    <?php endif; ?>

                    <!-- Outils fixes (ceux qui ne sont pas des types avec choix) -->
                    <?php 
                    $outils_fixes = [];
                    if (!empty($hist['MaitriseOutils'])) {
                        foreach ($hist['MaitriseOutils'] as $outil_config) {
                            if (is_string($outil_config)) {
                                $outils_fixes[] = $outil_config;
                            } elseif (is_array($outil_config) && !isset($outil_config['Quantité'])) {
                                $outils_fixes[] = $outil_config['type'] ?? $outil_config;
                            }
                        }
                    }
                    ?>
                    
                    <?php if (!empty($outils_fixes)): ?>
                        <div style="margin: 15px 0;">
                            <h4 style="color: #ffd700; margin-bottom: 8px;">Outils maîtrisés :</h4>
                            <div style="padding: 10px; background: #1a1a1a; border-radius: 5px;">
                                <?php foreach ($outils_fixes as $outil): ?>
                                    <div style="color: #90ee90; margin: 5px 0;">✓ <?= is_array($outil) ? $outil['type'] ?? $outil : $outil ?></div>
                                <?php endforeach; ?>
                            </div>
                        </div>
                    <?php endif; ?>

                    <hr>
                </section>
            <?php endif; ?>

            <!-- SECTION SPÉCIALITÉS (uniquement si historique confirmé) -->
            <?php 
            if ($historique_choisi && isset($historiques[$historique_choisi]['Personnalité']['Spécial'])): 
                $specialites = $historiques[$historique_choisi]['Personnalité']['Spécial'];
                
                if (!empty($specialites['Special'])): 
                    $max_selection = isset($specialites['Quantité']) ? $specialites['Quantité'] : 1;
                    $selections_actuelles = [];
                    for ($i = 0; $i < $max_selection; $i++) {
                        $selections_actuelles[$i] = $specialites_choisies[$i] ?? '';
                    }
            ?>
                <section class="form-section">
                    <h2>3. Spécialités de l'Historique</h2>
                    
                    <h3><?= $specialites['NomSpecial'] ?? 'Spécialités' ?></h3>
                    <p><?= $specialites['DescriptionSpecial'] ?? '' ?></p>
                    
                    <div style="margin: 15px 0;">
                        <label style="color: #ffd700; font-weight: bold; display: block; margin-bottom: 8px;">
                            Choisir <?= $max_selection ?> spécialité(s)
                        </label>
                        
                        <?php for ($i = 0; $i < $max_selection; $i++): ?>
                            <select name="specialites[<?= $i ?>]" 
                                    style="width: 100%; padding: 10px; background-color: #2a2a2a; border: 2px solid #555; border-radius: 5px; color: #ccc; margin-bottom: 8px;">
                                <option value="">-- Choisir une spécialité --</option>
                                <?php foreach ($specialites['Special'] as $specialite): ?>
                                    <option value="<?= $specialite ?>" 
                                            <?= $selections_actuelles[$i] == $specialite ? 'selected' : '' ?>>
                                        <?= $specialite ?>
                                    </option>
                                <?php endforeach; ?>
                            </select>
                        <?php endfor; ?>
                    </div>
                    
                    <hr>
                </section>
            <?php 
                endif;
            endif; 
            ?>

            <!-- SECTION PERSONNALITÉ (uniquement si historique confirmé) -->
            <?php if ($historique_choisi && isset($historiques[$historique_choisi]['Personnalité'])): ?>
                <section class="form-section">
                    <h2>4. Personnalité du Personnage</h2>
                    <?php $perso = $historiques[$historique_choisi]['Personnalité']; ?>
                    
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 10px 0;">
                                <label for="trait" style="display: block; margin-bottom: 8px; color: #c0392b; font-weight: bold;">
                                    Trait de personnalité :
                                </label>
                                <select name="trait" id="trait" style="width: 100%; padding: 10px; background-color: #2a2a2a; border: 2px solid #555; border-radius: 5px; color: #ccc;">
                                    <option value="">-- Choisir un trait --</option>
                                    <?php foreach ($perso['Traits'] as $trait): ?>
                                        <option value="<?= $trait ?>" <?= $trait_choisi == $trait ? 'selected' : '' ?>>
                                            <?= $trait ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0;">
                                <label for="ideal" style="display: block; margin-bottom: 8px; color: #c0392b; font-weight: bold;">
                                    Idéal :
                                </label>
                                <select name="ideal" id="ideal" style="width: 100%; padding: 10px; background-color: #2a2a2a; border: 2px solid #555; border-radius: 5px; color: #ccc;">
                                    <option value="">-- Choisir un idéal --</option>
                                    <?php foreach ($perso['Ideaux'] as $ideal): ?>
                                        <option value="<?= $ideal ?>" <?= $ideal_choisi == $ideal ? 'selected' : '' ?>>
                                            <?= $ideal ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0;">
                                <label for="lien" style="display: block; margin-bottom: 8px; color: #c0392b; font-weight: bold;">
                                    Lien :
                                </label>
                                <select name="lien" id="lien" style="width: 100%; padding: 10px; background-color: #2a2a2a; border: 2px solid #555; border-radius: 5px; color: #ccc;">
                                    <option value="">-- Choisir un lien --</option>
                                    <?php foreach ($perso['Liens'] as $lien): ?>
                                        <option value="<?= $lien ?>" <?= $lien_choisi == $lien ? 'selected' : '' ?>>
                                            <?= $lien ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0;">
                                <label for="defaut" style="display: block; margin-bottom: 8px; color: #c0392b; font-weight: bold;">
                                    Défaut :
                                </label>
                                <select name="defaut" id="defaut" style="width: 100%; padding: 10px; background-color: #2a2a2a; border: 2px solid #555; border-radius: 5px; color: #ccc;">
                                    <option value="">-- Choisir un défaut --</option>
                                    <?php foreach ($perso['Défauts'] as $defaut): ?>
                                        <option value="<?= $defaut ?>" <?= $defaut_choisi == $defaut ? 'selected' : '' ?>>
                                            <?= $defaut ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </td>
                        </tr>
                    </table>
                    
                    <hr>
                </section>
            <?php endif; ?>

            <!-- SECTION OUTILS AVEC CHOIX -->
            <?php if ($historique_choisi && isset($historiques[$historique_choisi])): ?>
                <?php $hist = $historiques[$historique_choisi]; ?>
                
                <section class="form-section">
                    <h2>5. Choix d'Outils</h2>
                    
                    <?php 
                    $a_choix_outils = false;
                    if (!empty($hist['MaitriseOutils'])): 
                        foreach ($hist['MaitriseOutils'] as $index => $outil_config): 
                            if (is_array($outil_config) && isset($outil_config['type']) && isset($outil_config['Quantité'])): 
                                $a_choix_outils = true;
                                $type_outil = $outil_config['type'];
                                $quantite_max = $outil_config['Quantité'] ?? 1;
                                
                                $outils_du_type = [];
                                foreach ($outils as $nom_outil => $details) {
                                    if (isset($details['type']) && $details['type'] === $type_outil) {
                                        $outils_du_type[$nom_outil] = $details;
                                    }
                                }
                                
                                if (!empty($outils_du_type)):
                                    $selections_actuelles = [];
                                    for ($i = 0; $i < $quantite_max; $i++) {
                                        $key = $type_outil . '_' . $i;
                                        $selections_actuelles[$i] = $outils_choisis[$key] ?? '';
                                    }
                    ?>
                                    <div style="margin: 15px 0;">
                                        <label style="color: #ffd700; font-weight: bold; display: block; margin-bottom: 8px;">
                                            <?= $type_outil ?> (choisir <?= $quantite_max ?>)
                                        </label>
                                        
                                        <?php for ($i = 0; $i < $quantite_max; $i++): ?>
                                            <select name="outils[<?= $type_outil ?>_<?= $i ?>]" 
                                                    style="width: 100%; padding: 10px; background-color: #2a2a2a; border: 2px solid #555; border-radius: 5px; color: #ccc; margin-bottom: 8px;">
                                                <option value="">-- Choisir un outil --</option>
                                                <?php foreach ($outils_du_type as $nom_outil => $details_outil): ?>
                                                    <option value="<?= $nom_outil ?>" 
                                                            <?= $selections_actuelles[$i] == $nom_outil ? 'selected' : '' ?>
                                                            data-poids="<?= $details_outil['poid']['quantite'] ?? 0 ?>">
                                                        <?= $nom_outil ?> (<?= $details_outil['poid']['quantite'] ?? 0 ?> <?= $details_outil['poid']['unité'] ?? 'g' ?>)
                                                    </option>
                                                <?php endforeach; ?>
                                            </select>
                                        <?php endfor; ?>
                                    </div>
                    <?php 
                                endif;
                            endif;
                        endforeach;
                    endif; 
                    
                    if (!$a_choix_outils): 
                    ?>
                        <p style="color: #888; font-style: italic;">Aucun choix d'outils supplémentaire pour cet historique.</p>
                    <?php endif; ?>
                    
                    <hr>
                </section>
            <?php endif; ?>


            <!-- BOUTON VALIDATION COMPLÈTE (uniquement si historique confirmé) -->
            <?php if ($historique_choisi): ?>
                <div class="navigation-buttons">
                    <a href="page3.php" class="secondary-button">Retour</a>
                    <button type="submit" name="valider_complet" class="primary-button">Suivant</button>
                </div>
            <?php endif; ?>
        </form>
    </main>

    <footer>
        <p>&copy; 2025 Character Builder</p>
    </footer>

    <script>
        function validateOutilsSelection(checkbox, typeOutil, quantiteMax) {
            const checkboxesType = document.querySelectorAll(`input[name="outils[]"][onchange*="${typeOutil}"]`);
            const checkedType = document.querySelectorAll(`input[name="outils[]"][onchange*="${typeOutil}"]:checked`);
            
            // Trouver le compteur correspondant
            const compteur = checkbox.closest('div').querySelector('span[id^="compteur-"]');
            
            if (checkedType.length > quantiteMax) {
                checkbox.checked = false;
                alert(`Vous ne pouvez sélectionner que ${quantiteMax} outil(s) de type ${typeOutil}.`);
                return;
            }
            
            // Mettre à jour le compteur
            if (compteur) {
                compteur.textContent = checkedType.length;
            }
            
            // Activer/désactiver les checkboxes selon la limite
            checkboxesType.forEach(cb => {
                if (!cb.checked && checkedType.length >= quantiteMax) {
                    cb.disabled = true;
                    cb.parentNode.querySelector('label').style.color = '#666';
                } else {
                    cb.disabled = false;
                    cb.parentNode.querySelector('label').style.color = '#ccc';
                }
            });
        }
    </script>
</body>
</html>