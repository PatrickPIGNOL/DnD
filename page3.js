class CPage3 {
    aTextes
    aCaracteristiquesData
    aScoresFixes
    aClasseSelectionnee
    aJetDeVie
    aRaceSelectionnee
    aBonusSlots = []

    aCaracMap = {
        "Force": 1, 
        "Dextérité": 2, 
        "Constitution": 3, 
        "Intelligence": 4, 
        "Sagesse": 5, 
        "Charisme": 6
    }
    
    constructor() {
        this.mInitialiserPage()
    }

    mInitialiserPage() {
        this.aClasseSelectionnee = localStorage.getItem('classeSelectionnee')
        this.aRaceSelectionnee = JSON.parse(localStorage.getItem('raceSelectionnee') || '{}')
        
        if (!this.aClasseSelectionnee) {
            window.location.href = "page1.html"
            return
        }

        this.mConfigurerBonusSlots()

        this.mChargerDonnees().then(() => {
            this.mRemplirTextes()
            this.mGenererSelectNiveau()
            this.mGenererTableCaracteristiques()
            this.mGenererTablePV()
            this.mChargerSauvegarde()
            this.mCalculerTotal()
        })
    }
    
    mConfigurerBonusSlots() {
        const vRaceBonus = this.aRaceSelectionnee.bonusCarac
        
        if (!vRaceBonus) {
            this.aBonusSlots = [
                { name: "augmtcarac1", bonus: 1, label: "+1", visible: true, enabled: true, caracAssigned: null }
            ]
            return
        }

        this.aBonusSlots = []

        // Créer exactement nombreSlots cases +1
        for (let i = 0; i < vRaceBonus.nombreSlots; i++) {
            const vBonusFixe = vRaceBonus.bonus[i]
            
            this.aBonusSlots.push({
                name: `augmtcarac${i + 1}`,
                bonus: 1,
                label: "+1",
                visible: true,
                enabled: vRaceBonus.type === "choix",
                caracAssigned: vBonusFixe ? this.aCaracMap[vBonusFixe.carac] : null  // ← NOM CORRIGÉ
            })
        }

        // Reset invisibles
        const vTotalSlots = Math.max(6, this.aBonusSlots.length)
        for (let i = this.aBonusSlots.length; i < vTotalSlots; i++) {
            this.aBonusSlots.push({
                name: `augmtcarac${i + 1}`,
                bonus: 0,
                label: "+0",
                visible: false,
                enabled: false,
                caracAssigned: null
            })
        }
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

        this.mRemplirElement('vCaracHeaderCaracteristique', this.aTextes.table_headers.caracteristique)
        this.mRemplirElement('vCaracHeaderScoreFixe', this.aTextes.table_headers.score_fixe)
        this.mRemplirElement('vCaracHeaderAllocation', this.aTextes.table_headers.allocation_bonus)
        this.mRemplirElement('vCaracHeaderScoreTotal', this.aTextes.table_headers.score_total)
        
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

        // Ligne de RESET
        const vResetRow = document.createElement('tr')
        vResetRow.id = 'vResetRow'
        
        let vResetHTML = ""
        vResetHTML += `<td style="font-weight: bold; text-align: center; background-color: #333; color: white;">${this.aTextes.reset.label}</td>`
        vResetHTML += `<td style="background-color: #333;"></td>`
        vResetHTML += `<td class="race-bonus-cell" style="text-align: center;">`
        
        this.aBonusSlots.forEach(pSlot => {
            if (pSlot.visible) {
                const vDisabled = !pSlot.enabled ? 'disabled' : ''
                const vChecked = (pSlot.caracAssigned === vId) ? 'checked' : ''
                
                // DEBUG avec noms explicites
                const vNomsCaracs = {
                    1: "Force", 2: "Dextérité", 3: "Constitution", 
                    4: "Intelligence", 5: "Sagesse", 6: "Charisme"
                }
                const vCaracAssignee = vNomsCaracs[pSlot.caracAssigned] || "Aucune"
                console.log(`[${vNomComplet}] Slot ${pSlot.name} -> Assigné à: ${vCaracAssignee}, checked: ${vChecked}`)
                
                vMainHTML += `
                    <label>
                        <input type="radio" name="${pSlot.name}" value="${vId}" data-bonus="${pSlot.bonus}" 
                            id="vRadio${vCarac}${pSlot.name}" ${vDisabled} ${vChecked}>
                        <span>${pSlot.label}</span>
                    </label>
                `
            }
        })
        
        vResetHTML += `</td>`
        vResetHTML += `<td style="background-color: #333;"></td>`

        vResetRow.innerHTML = vResetHTML
        vTableBody.appendChild(vResetRow)

        // Génération des caractéristiques
        for (const vCarac in this.aTextes.caracteristiques) {
            vId++
            const vNomComplet = this.aTextes.caracteristiques[vCarac]
            const vScoreFixe = this.aScoresFixes[vNomComplet]
            const vBonusBase = Math.floor((vScoreFixe / 2) - 4.5)

            // LIGNE 1 : Caractéristique
            let vMainHTML = `
                <tr id="vMainRow${vCarac}">
                    <td style="font-weight: bold;">${vNomComplet}</td>
                    <td id="vScoreFixe${vCarac}" class="score-fixe-valeur">${vScoreFixe}</td>
                    <td class="race-bonus-cell">
            `
            
            this.aBonusSlots.forEach(pSlot => {
                if (pSlot.visible) {
                    console.log(`[${vNomComplet}] Slot ${pSlot.name} -> caracForce: ${pSlot.caracForce}, checked: ${vChecked}`)
                    const vDisabled = !pSlot.enabled ? 'disabled' : ''
                    const vChecked = (pSlot.caracAssigned === vId) ? 'checked' : ''
                    
                    vMainHTML += `
                        <label>
                            <input type="radio" name="${pSlot.name}" value="${vId}" data-bonus="${pSlot.bonus}" 
                                id="vRadio${vCarac}${pSlot.name}" ${vDisabled} ${vChecked}>
                            <span>${pSlot.label}</span>
                        </label>
                    `
                }
            })
            
            vMainHTML += `
                    </td>
                    <td id="vScoreTotal${vCarac}" class="vScoreTotal" style="font-weight: bold;">${vScoreFixe}</td>
                </tr>
            `

            // LIGNE 2 : Détail des bonus
            let vDetailHTML = `
                <tr id="vDetailRow${vCarac}" class="detail-row">
                    <td style="font-style: italic; color: #888; font-size: 0.9em; text-align: center;">${this.aTextes.detail_bonus.label}</td>
                    <td style="text-align: center; color: #888; font-size: 0.9em;" id="vDetailBonusBase${vCarac}">${vBonusBase > 0 ? '+' : ''}${vBonusBase}</td>
                    <td style="background-color: #2a2a2a;"></td>
                    <td style="text-align: center; font-weight: bold; color: #888; font-size: 0.9em;" id="vDetailBonusTotal${vCarac}">${vBonusBase > 0 ? '+' : ''}${vBonusBase}</td>
                </tr>
            `

            vTableBody.innerHTML += vMainHTML + vDetailHTML
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

        // Calcul des bonus raciaux
        this.aBonusSlots.forEach(pSlot => {
            const vRadio = document.querySelector(`input[name="${pSlot.name}"]:checked`)
            if (vRadio && vRadio.value !== "0") {
                const vCaracId = parseInt(vRadio.value)
                const vBonus = parseInt(vRadio.dataset.bonus)
                
                if (vCaracId >= 1 && vCaracId <= 6) {
                    vTotalBonus[vCaracId] += vBonus  // ✅ CORRECTION
                }
            }
        })

        // Mise à jour pour chaque caractéristique
        let vIndex = 0
        for (const vCarac in this.aTextes.caracteristiques) {
            vIndex++
            const vNomComplet = this.aTextes.caracteristiques[vCarac]
            const vScoreBase = this.aScoresFixes[vNomComplet]  // 1. Score de base
            const vBonusRaciaux = vTotalBonus[vIndex]
            
            const vScoreFinal = vScoreBase + vBonusRaciaux  // 3. Score final = base + race

            // 2. Bonus de base (sur score de base)
            const vBonusBase = Math.floor((vScoreBase / 2) - 4.5)
            
            // 4. Bonus final (sur score final)
            const vBonusFinal = Math.floor((vScoreFinal / 2) - 4.5)

            // Mise à jour ligne principale (Score final en gras)
            this.mRemplirElement(`vScoreTotal${vCarac}`, vScoreFinal)

            // Mise à jour ligne détail
            this.mRemplirElement(`vDetailBonusBase${vCarac}`, `${vBonusBase > 0 ? '+' : ''}${vBonusBase}`)
            this.mRemplirElement(`vDetailBonusRaciaux${vCarac}`, `+${vBonusRaciaux}`)
            this.mRemplirElement(`vDetailBonusTotal${vCarac}`, `${vBonusFinal > 0 ? '+' : ''}${vBonusFinal}`)

            // 5. Bonus final utilisé pour les PV (Constitution)
            if (vCarac === 'Con') {
                localStorage.setItem('modificateurConstitution', vBonusFinal)
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