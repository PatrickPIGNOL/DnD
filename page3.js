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

        document.title = this.aTextes.titre_page
        this.mRemplirElement('vPageTitle', this.aTextes.titre_page)
        this.mRemplirElement('vHeaderTitre', this.aTextes.titre_header)
        this.mRemplirElement('vSectionNiveauTitre', this.aTextes.section_niveau_titre)
        this.mRemplirElement('vSelectNiveauLabel', this.aTextes.select_niveau_label)
        this.mRemplirElement('vBoutonRetour', this.aTextes.bouton_retour)
        this.mRemplirElement('vNextButton', this.aTextes.bouton_suivant)
        this.mRemplirElement('vSectionBonusTitre', this.aTextes.section_bonus_titre)
        this.mRemplirElement('vBonusModTitre', this.aTextes.bonus_mod_titre)
        
        // CORRECTION : Utilisation du texte externe
        this.mRemplirElement('vBonusModDescription', this.aTextes.bonus_mod_description)
        
        this.mRemplirElement('vSectionCaracTitre', this.aTextes.section_carac_titre)
        
        const vFooterTexte = document.getElementById('vFooterTexte')
        if (vFooterTexte) {
            vFooterTexte.innerHTML = this.aTextes.footer_texte // ← Correction
        }
        
        // Remplir le titre de la section PV
        const vSectionPV = document.querySelector('.hp-block h3')
        if (vSectionPV) {
            vSectionPV.textContent = this.aTextes.section_pv_titre
        }
        
        const vBoutonRetour = document.getElementById('vBoutonRetour')
        if (vBoutonRetour) {
            vBoutonRetour.href = "page2.html"
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
        if (!vTableBody || !this.aScoresFixes) return

        vTableBody.innerHTML = ""

        let vId = 0
        for (const vCarac in this.aTextes.caracteristiques) { //
            vId++
            const vNomComplet = this.aTextes.caracteristiques[vCarac] //
            const vScoreFixe = this.aScoresFixes[vNomComplet] //
            const vModificateurInitial = this.mCalculerModificateur(vScoreFixe)

            const vRow = document.createElement('tr')
            vRow.id = `vRow${vCarac}`
            
            let vHTML = ""

            vHTML += `<td style="font-weight: bold;">${vNomComplet}</td>`
            
            vHTML += `<td id="vScoreFixe${vCarac}" class="score-fixe-valeur">${vScoreFixe}</td>`
            
            // Les 4 radios sont en ligne grâce au CSS, mais gèrent les slots 1 à 4 verticalement
            vHTML += `<td colspan="4" class="race-bonus-cell">`
            this.aBonusSlots.forEach(pSlot => {
                vHTML += `<label>`
                vHTML += `<input type="radio" name="${pSlot.name}" value="${vId}" data-bonus="${pSlot.bonus}" id="vRadio${vCarac}${pSlot.name}"`
                vHTML += `>`
                vHTML += `<span>${pSlot.label}</span>`
                vHTML += `</label>`
            })
            vHTML += `</td>`
            
            vHTML += `<td id="vScoreTotal${vCarac}" class="vScoreTotal">${vScoreFixe}</td>`
            
            vHTML += `<td id="vModificateur${vCarac}" class="mod-total-value">${vModificateurInitial > 0 ? '+' : ''}${vModificateurInitial}</td>`

            vRow.innerHTML = vHTML
            vTableBody.appendChild(vRow)
        }
        
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
        
        let vHTML = ""
        let vTotalPV = 0
        
        // Ligne PV Niveau 1
        const vJetDeVieBase = parseInt(this.aJetDeVie.substring(1))
        const vPVNiveau1 = vJetDeVieBase + vModCon
        vTotalPV += vPVNiveau1
        
        vHTML += `<tr>`
        vHTML += `<td style="text-align: left;">${this.aTextes.calcul_pv.pv_base_niveau_1.replace('{jetDeVie}', this.aJetDeVie)}</td>`
        vHTML += `<td style="text-align: center;">${vJetDeVieBase}</td>`
        vHTML += `<td style="text-align: center;">${vModCon > 0 ? '+' : ''}${vModCon}</td>`
        vHTML += `<td class="final-hp-value">${vPVNiveau1}</td>`
        vHTML += `</tr>`

        // Ligne PV par Niveaux suivants (si niveau > 1)
        if (vNiveau > 1) {
            const vNiveauxSuivants = vNiveau - 1
            const vPVJetParNiveau = Math.floor(vJetDeVieBase / 2) + 1
            const vPVParNiveauTotalJet = vPVJetParNiveau * vNiveauxSuivants
            const vPVParNiveauTotalMod = vModCon * vNiveauxSuivants
            
            vTotalPV += vPVParNiveauTotalJet + vPVParNiveauTotalMod
            
            vHTML += `<tr>`
            vHTML += `<td style="text-align: left;">${this.aTextes.calcul_pv.pv_par_niveaux.replace('{niveaux}', vNiveauxSuivants).replace('{niveauMax}', vNiveau)}</td>`
            vHTML += `<td style="text-align: center;">${vPVJetParNiveau} x ${vNiveauxSuivants} = ${vPVParNiveauTotalJet}</td>`
            vHTML += `<td style="text-align: center;">${vModCon} x ${vNiveauxSuivants} = ${vPVParNiveauTotalMod > 0 ? '+' : ''}${vPVParNiveauTotalMod}</td>`
            vHTML += `<td class="final-hp-value">${vPVParNiveauTotalJet + vPVParNiveauTotalMod}</td>`
            vHTML += `</tr>`
        }

        // Ligne Total
        vHTML += `<tr>`
        vHTML += `<td style="font-weight: bold; text-align: left;">${this.aTextes.calcul_pv.total_pv}</td>`
        vHTML += `<td colspan="2" style="background-color: #333;"></td>`
        vHTML += `<td class="final-hp-value">${vTotalPV}</td>`
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
        if (pEvent) pEvent.preventDefault()
        this.mSauvegarder() // CORRECTION: this.this. a été retiré
        window.location.href = "page4.html"
    }
}

new CPage3()