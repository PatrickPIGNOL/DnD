document.addEventListener('DOMContentLoaded', () => {
    // Mettre à jour l'année dans le footer
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // Gérer le bouton de changement de couleur
    const changeColorButton = document.getElementById('changeColorButton');
    const interactiveSection = document.querySelector('.interactive-section');
    const messageParagraph = document.getElementById('message');

    if (changeColorButton && interactiveSection && messageParagraph) {
        const colors = ['#e6f7ff', '#fff0e6', '#e6ffe6', '#f7e6ff']; // Couleurs pastel
        let currentColorIndex = 0;

        changeColorButton.addEventListener('click', () => {
            currentColorIndex = (currentColorIndex + 1) % colors.length;
            interactiveSection.style.backgroundColor = colors[currentColorIndex];
            messageParagraph.textContent = `La couleur a été changée en : ${colors[currentColorIndex]}`;
            console.log(`Couleur changée en ${colors[currentColorIndex]}`);
        });
    } else {
        console.warn("Un élément JS n'a pas été trouvé (bouton, section interactive ou paragraphe de message).");
    }
});