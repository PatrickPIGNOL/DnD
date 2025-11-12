class CPage3 {
    aTextes
    aCaracteristiquesData
    aScoresFixes
    aClasseSelectionnee
    aJetDeVie

    aCaracMap = {
        "Force": 1, 
        "Dextérité": 2, 
        "Constitution": 3, 
        "Intelligence": 4, 
        "Sagesse": 5, 
        "Charisme": 6
    }
    
    aBonusSlots = [
        { name: "augmtcarac1", bonus: 1, label: "+1" },
        { name: "augmtcarac2", bonus: 1, label: "+1" },
        { name: "augmtcarac3", bonus: 1, label: "+1" },
        { name: "augmtcarac4", bonus: 1, label: "+1" } 
    ]

    constructor() {
        this.mInitialiserPage()
    }

    mInitialiserPage() {
        this.aClasseSelectionnee = localStorage.getItem('classeSelectionnee')
        if (!this.aClasseSelectionnee) {
            console.error("Classe non trouvée. Redirection vers page 1.")
            window.location.href = "page1.html"
            return
        }

        this.mChargerDonnees().then(() => {
            this.mRemplirTextes()
            this.mGenererSelectNiveau()
            this.mGenererTableCaracteristiques()
            this.mGenererTablePV()
            this.mChargerSauvegarde()
            this.mCalculerTotal()
        })
    }

    async mChargerDonnees() {
        try {
            const vResponseTextes = await fetch('page3.json')
            const vDataTextes = await vResponseTextes.json()
            this.aTextes = vDataTextes.page3 //

            const vResponseCarac = await fetch('caracteristiques.json')
            const vDataCarac = await vResponseCarac.json()
            this.aCaracteristiquesData = vDataCarac.classes_scores_fixes //
            
            this.aScoresFixes = this.aCaracteristiquesData[this.aClasseSelectionnee] //
            this.aJetDeVie = this.aScoresFixes.jetDeVie //

        } catch (vError) {
            console.error("Erreur de chargement des données pour la page 3:", vError)
        }
    }

    mRemplirTextes() {
        if (!this.aTextes) return

        // Titres principaux
        document.title = this.aTextes.titre_page
        this.mRemplirElement('vPageTitle', this.aTextes.titre_page)
        this.mRemplirElement('vHeaderTitre', this.aTextes.titre_header)
        
        // Section Niveau
        this.mRemplirElement('vSectionNiveauTitre', this.aTextes.section_niveau_titre)
        this.mRemplirElement('vSelectNiveauLabel', this.aTextes.select_niveau_label)
        
        // Section Bonus Race
        this.mRemplirElement('vSectionBonusTitre', this.aTextes.section_bonus_titre)
        this.mRemplirElement('vBonusModTitre', this.aTextes.bonus_mod_titre)
        this.mRemplirElement('vBonusModDescription', this.aTextes.bonus_mod_description)
        
        // Section Caractéristiques
        this.mRemplirElement('vSectionCaracTitre', this.aTextes.section_carac_titre)
            
        this.mRemplirElement('vPVHeaderDeVie', this.aTextes.table_pv_headers.de_vie)
        this.mRemplirElement('vPVHeaderBonusCon', this.aTextes.table_pv_headers.bonus_constitution)
        this.mRemplirElement('vPVHeaderNiveau', this.aTextes.table_pv_headers.niveau_personnage)
        this.mRemplirElement('vPVHeaderPVMax', this.aTextes.table_pv_headers.pv_max)

        // Boutons
        this.mRemplirElement('vBoutonRetour', this.aTextes.boutons.retour_texte)
        this.mRemplirElement('vNextButton', this.aTextes.boutons.suivant_texte)
        
        // Footer
        const vFooterTexte = document.getElementById('vFooterTexte')
        if (vFooterTexte) {
            vFooterTexte.innerHTML = this.aTextes.footer_texte
        }
        
        // Titre de la section PV (qui est en dur dans le HTML)
        const vSectionPV = document.querySelector('.hp-block h3')
        if (vSectionPV && this.aTextes.section_pv_titre) {
            vSectionPV.textContent = this.aTextes.section_pv_titre
        }
        
        // Configuration de la navigation
        const vBoutonRetour = document.getElementById('vBoutonRetour')
        if (vBoutonRetour && this.aTextes.navigation) {
            vBoutonRetour.href = this.aTextes.navigation.retour_url
        }

        const vBoutonSuivant = document.getElementById('vNextButton')
        if (vBoutonSuivant) {
            vBoutonSuivant.addEventListener('click', (pEvent) => {
                this.mPasserEtape(pEvent)
            })
        }
    }
    
    mRemplirElement(pId, pTexte) {
        const vElement = document.getElementById(pId)
        if (vElement) {
            this.mSetElementText(vElement, pTexte) // CORRECTION: this.this. a été retiré
        }
    }
    
    mSetElementText(pElement, pTexte) {
        pElement.textContent = pTexte
    }

    mGenererSelectNiveau() {
        const vSelect = document.getElementById('vSelectNiveau')
        if (!vSelect || !this.aTextes.niveau_options) return

        for (const vKey in this.aTextes.niveau_options) { //
            const vOption = document.createElement('option')
            vOption.value = vKey
            this.mSetElementText(vOption, this.aTextes.niveau_options[vKey]) // CORRECTION: this.this. a été retiré
            vSelect.appendChild(vOption)
        }
        
        vSelect.addEventListener('change', () => {
            this.mCalculerTotal() 
            this.mGenererTablePV()
            this.mSauvegarder() 
        })
        
        const vNiveauSauvegarde = localStorage.getItem('niveauSelectionne')
        if (vNiveauSauvegarde && vSelect.querySelector(`option[value="${vNiveauSauvegarde}"]`)) {
            vSelect.value = vNiveauSauvegarde
        } else {
            vSelect.value = "1"
        }
    }

    mGenererTableCaracteristiques() {
        const vTableBody = document.getElementById('vCaracTableBody')
        if (!vTableBody || !this.aScoresFixes || !this.aTextes) return

        vTableBody.innerHTML = ""

        let vId = 0

        // LIGNE DE RESET
        const vResetRow = document.createElement('tr')
        vResetRow.id = 'vResetRow'
        
        let vResetHTML = ""
        vResetHTML += `<td style="font-weight: bold; text-align: center; background-color: #333; color: white;">Reset</td>`
        vResetHTML += `<td style="background-color: #333;"></td>`
        vResetHTML += `<td class="race-bonus-cell" style="text-align: center;">`
        this.aBonusSlots.forEach(pSlot => {
            vResetHTML += `<label style="display: inline-block; margin: 0 5px;">`
            vResetHTML += `<input type="radio" name="${pSlot.name}" value="0" data-bonus="0" id="vRadioReset${pSlot.name}">`
            vResetHTML += `<span>${this.aTextes.reset.radio_label}</span>`
            vResetHTML += `</label>`
        })
        vResetHTML += `</td>`
        vResetHTML += `<td style="background-color: #333;"></td>`
        vResetHTML += `<td style="background-color: #333;"></td>`

        vResetRow.innerHTML = vResetHTML
        vTableBody.appendChild(vResetRow)

        // Générateur des caractéristiques
        for (const vCarac in this.aTextes.caracteristiques) {
            vId++
            const vNomComplet = this.aTextes.caracteristiques[vCarac]
            const vScoreFixe = this.aScoresFixes[vNomComplet]
            const vModificateurInitial = this.mCalculerModificateur(vScoreFixe)

            // LIGNE 1 : Caractéristique normale
            const vMainRow = document.createElement('tr')
            vMainRow.id = `vMainRow${vCarac}`
            
            let vMainHTML = ""
            vMainHTML += `<td style="font-weight: bold;">${vNomComplet}</td>`
            vMainHTML += `<td id="vScoreFixe${vCarac}" class="score-fixe-valeur">${vScoreFixe}</td>`
            
            vMainHTML += `<td colspan="4" class="race-bonus-cell">`
            this.aBonusSlots.forEach(pSlot => {
                vMainHTML += `<label>`
                vMainHTML += `<input type="radio" name="${pSlot.name}" value="${vId}" data-bonus="${pSlot.bonus}" id="vRadio${vCarac}${pSlot.name}">`
                vMainHTML += `<span>${pSlot.label}</span>`
                vMainHTML += `</label>`
            })
            vMainHTML += `</td>`
            
            vMainHTML += `<td id="vScoreTotal${vCarac}" class="vScoreTotal">${vScoreFixe}</td>`
            vMainHTML += `<td id="vModificateur${vCarac}" class="mod-total-value">${vModificateurInitial > 0 ? '+' : ''}${vModificateurInitial}</td>`

            vMainRow.innerHTML = vMainHTML
            vTableBody.appendChild(vMainRow)

            // LIGNE 2 : Détail des calculs (NOUVELLE LIGNE)
            const vDetailRow = document.createElement('tr')
            vDetailRow.id = `vDetailRow${vCarac}`
            vDetailRow.className = 'detail-row'
            
            // Calcul du bonus de base selon VOTRE formule
            const vBonusBase = Math.floor((vScoreFixe / 2) - 4.5)
            
            let vDetailHTML = ""
            vDetailHTML += `<td style="font-style: italic; color: #888; font-size: 0.9em;">Calcul ${vNomComplet}</td>`
            vDetailHTML += `<td style="background-color: #2a2a2a;"></td>`
            
            vDetailHTML += `<td colspan="4" style="background-color: #2a2a2a; color: #888; font-size: 0.9em; text-align: center;">`
            vDetailHTML += `<span id="vDetailBonusBase${vCarac}">Base: ${vBonusBase > 0 ? '+' : ''}${vBonusBase}</span>`
            vDetailHTML += `<span> + </span>`
            vDetailHTML += `<span id="vDetailBonusRaciaux${vCarac}">Race: +0</span>`
            vDetailHTML += `<span> = </span>`
            vDetailHTML += `<span id="vDetailBonusTotal${vCarac}" style="font-weight: bold;">Total: ${vBonusBase > 0 ? '+' : ''}${vBonusBase}</span>`
            vDetailHTML += `</td>`
            
            vDetailHTML += `<td style="background-color: #2a2a2a;"></td>`
            vDetailHTML += `<td style="background-color: #2a2a2a;"></td>`

            vDetailRow.innerHTML = vDetailHTML
            vTableBody.appendChild(vDetailRow)
        }
        
        // Écouteurs d'événements
        document.querySelectorAll('input[type="radio"]').forEach(pRadio => {
            pRadio.addEventListener('change', () => {
                this.mCalculerTotal()
                this.mGenererTablePV()
                this.mSauvegarder()
            })
        })
    }

    mCalculerModificateur(pScore) {
        return Math.floor((pScore - 10) / 2)
    }

    mCalculerTotal() {
        if (!this.aScoresFixes) return

        let vTotalBonus = {}
        for (let vId = 1; vId <= 6; vId++) {
            vTotalBonus[vId] = 0
        }

        this.aBonusSlots.forEach(pSlot => {
            const vRadio = document.querySelector(`input[name="${pSlot.name}"]:checked`)
            if (vRadio) {
                const vCaracId = parseInt(vRadio.value)
                const vBonus = parseInt(vRadio.dataset.bonus)
                
                if (vCaracId >= 1 && vCaracId <= 6) {
                    vTotalBonus[vCaracId] += vBonus
                }
            }
        })

        for (const vCarac in this.aTextes.caracteristiques) { //
            const vNomComplet = this.aTextes.caracteristiques[vCarac] //
            const vId = this.aCaracMap[vNomComplet]
            const vScoreFixe = this.aScoresFixes[vNomComplet] //
            const vBonus = vTotalBonus[vId]
            
            const vScoreTotal = vScoreFixe + vBonus
            const vModificateur = this.mCalculerModificateur(vScoreTotal)
            
            this.mRemplirElement(`vScoreTotal${vCarac}`, vScoreTotal) // CORRECTION: this.this. a été retiré
            this.mRemplirElement(`vModificateur${vCarac}`, `${vModificateur > 0 ? '+' : ''}${vModificateur}`) // CORRECTION: this.this. a été retiré

            if (vCarac === 'Con') {
                localStorage.setItem('modificateurConstitution', vModificateur)
            }
        }
    }
    
    mGenererTablePV() {
        const vTableBody = document.getElementById('vHPTableBody')
        const vNiveauSelect = document.getElementById('vSelectNiveau')
        if (!vTableBody || !vNiveauSelect || !this.aJetDeVie || !this.aTextes) return
        
        const vNiveau = parseInt(vNiveauSelect.value)
        const vModCon = parseInt(localStorage.getItem('modificateurConstitution') || 0)
        
        // Calculs
        const vJetDeVieBase = parseInt(this.aJetDeVie.substring(1))
        const vPVMax = (vJetDeVieBase + vModCon) * vNiveau
        
        let vHTML = ""
        
        vHTML += `<tr>`
        vHTML += `<td style="text-align: center;">${this.aJetDeVie} (${vJetDeVieBase})</td>`
        vHTML += `<td style="text-align: center;">${vModCon > 0 ? '+' : ''}${vModCon}</td>`
        vHTML += `<td style="text-align: center;">${vNiveau}</td>`
        vHTML += `<td style="text-align: center; font-weight: bold; font-size: 1.2em;">`
        vHTML += `((${vJetDeVieBase} + ${vModCon > 0 ? '+' : ''}${vModCon}) × ${vNiveau}) = ${vPVMax}`
        vHTML += `</td>`
        vHTML += `</tr>`
        
        vTableBody.innerHTML = vHTML
    }
    
    mChargerSauvegarde() {
        const vSauvegarde = JSON.parse(localStorage.getItem('bonusRaceSelectionnes'))
        
        if (vSauvegarde) {
            this.aBonusSlots.forEach(pSlot => {
                const vNomSlot = pSlot.name
                const vValue = vSauvegarde[vNomSlot]
                
                if (vValue) {
                    const vRadio = document.querySelector(`input[name="${vNomSlot}"][value="${vValue}"]`)
                    if (vRadio) {
                        vRadio.checked = true
                    }
                }
            })
        }
    }

    mSauvegarder() {
        const vNiveau = document.getElementById('vSelectNiveau').value
        localStorage.setItem('niveauSelectionne', vNiveau)

        const vBonusSelectionnes = {}
        this.aBonusSlots.forEach(pSlot => {
            const vRadio = document.querySelector(`input[name="${pSlot.name}"]:checked`)
            if (vRadio) {
                vBonusSelectionnes[pSlot.name] = vRadio.value 
            }
        })
        localStorage.setItem('bonusRaceSelectionnes', JSON.stringify(vBonusSelectionnes))
    }

    mPasserEtape(pEvent) {
        if (pEvent) pEvent.preventDefault();
        this.mSauvegarder();
        // Utilisation de l'URL configurée
        window.location.href = this.aTextes.navigation.suivant_url;
    }
}

new CPage3()