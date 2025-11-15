<?php
// Reset session à chaque chargement de l'index
session_start();
$_SESSION = array();
session_destroy();
session_start(); // Redémarrer une session vide
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Donjons & Dragons - Créateur de Personnage</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <header>
        <h1>Donjons & Dragons</h1>
    </header>

    <main>
        <section id="adventure-start-section">
            <section class="etape-item-card">
                <h2>Quelle est votre classe d'aventurier D&D ?</h2>
                <p>Si vous ne l'avez pas encore fait, cliquez ci-dessous pour lancer le test qui déterminera votre classe de départ.</p>
                <a href="https://docs.google.com/forms/d/e/1FAIpQLSdNma04s8TPzZP8g28kWGQxzGNa6o4os5ztF8x-V8B9ELUyRA/viewform?usp=header" 
                   target="_blank" class="button-link">
                   Lancer le Quizz pour déterminer votre Classe
                </a>
            </section>
            
            <section class="etape-item-card">
                <h2>Créer votre personnage</h2>
                <p>Une fois que vous connaissez votre classe, vous pouvez commencer la création de votre personnage.</p>
                <a href="page1.php" class="button-link">
                    Créez votre personnage...
                </a>
            </section>
        </section>

        <section>
            <h2>Ressources Utiles 📚</h2>
            <p>Voici des liens vers des ressources externes qui pourraient vous aider :</p>
            
            <table class="resource-table" style="width: 100%;">
                <thead>
                    <tr>
                        <th></th>
                        <th style="text-align: center;">Ressources</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>AideDD.org</strong></td>
                        <td>Toutes les règles et informations sur l'univers de Donjons et Dragons.</td>
                        <td><a href="https://www.aidedd.org/" target="_blank" class="secondary-button">Visiter le site</a></td>
                    </tr>
                    <tr>
                        <td><strong>AideDD.org - Sorts</strong></td>
                        <td>Une base de données complète des sorts par classe et niveau.</td>
                        <td><a href="https://www.aidedd.org/dnd-filters/sorts.php" target="_blank" class="secondary-button">Visiter le site</a></td>
                    </tr>
                    <tr>
                        <td><strong>D&D Beyond</strong></td>
                        <td>Plateforme officielle pour la création de personnages et les règles en ligne.</td>
                        <td><a href="https://www.dndbeyond.com/" target="_blank" class="secondary-button">Visiter le site</a></td>
                    </tr>
                </tbody>
            </table>
        </section>
    </main>

    <footer>
        <p>&copy; 2025 Character Builder</p>
    </footer>
</body>
</html>
