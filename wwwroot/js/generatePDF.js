window.generatePDF = async (content, corsoId, corsoTipo, cognomePartecipante, nomePartecipante, intestazione1, intestazione2, titoloAttestato, normative,
    testo3, codiceFiscale, dataNascita, luogoNascita, provinciaNascita, azienda, testo4, testo5, dataInizio, dataFine, durata, sedeDelCorso, sedeTeoricaDelCorso, sedePraticaDelCorso,
    indicareSede, indicareSedeTeorica, indicareSedePratica, indirizzoDue, indirizzoTre, sedeP, sedeT, docenteCognome, docenteNome, dataInizioCorso, dataFineCorso, pieDiPagina) => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Carica l'immagine come Base64
    const imgData = await loadImageAsBase64('/images/praevenio_logo.png'); // Usa il percorso relativo all'immagine
    const accredia = await loadImageAsBase64('/images/accredia.jpg');
    const backgroundData = await loadImageAsBase64('/images/corniceAttestatoPRV.png'); // Carica l'immagine di sfondo
    const firmaRoberto = await loadImageAsBase64('/images/firme/robertolucidi.jpg');

    // Aggiungi l'immagine di sfondo, impostando la dimensione per coprire l'intera pagina
    doc.addImage(backgroundData, 'PNG', 0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height);

    // Nuove dimensioni dell'immagine in mm (modifica la larghezza per farle più strette)
    const imgWidth = 55;  // Logo più stretto
    const imgHeight = 20.3;  // Altezza invariata

    // Nuove dimensioni accredia (modificato per essere più stretto)
    const accWidth = 25;  // Accredia più stretto
    const accHeight = 20.3;  // Altezza invariata

    // Calcola la larghezza totale combinata del logo e di Accredia con uno spazio di 5mm tra di loro
    const totalWidth = imgWidth + accWidth + 5;  // Larghezza del logo + Accredia + 5mm di spazio

    // Calcola la posizione centrale orizzontalmente per entrambe le immagini, ma spostate leggermente verso destra
    const x = (doc.internal.pageSize.width - totalWidth) / 2 + 5;  // Spostato leggermente verso destra (aggiunto 5mm)
    // Posizione in cima alla pagina
    const y = 20;

    // Aggiungi il logo al PDF
    doc.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);

    // Posizionamento dell'immagine Accredia accanto al logo
    const accrediaX = x + imgWidth + 5;  // Aggiungi lo spazio tra il logo e Accredia
    const accrediaY = y;  // Stessa posizione verticale del logo

    // Aggiungi l'immagine Accredia accanto al logo
    doc.addImage(accredia, 'JPG', accrediaX, accrediaY, accWidth, accHeight);


    // Impostare il font per l'intestazione (Times New Roman, bold italic)
    doc.setFont('times', 'bolditalic');
    doc.setFontSize(40);

    // Calcolare la larghezza del titolo per centrarlo
    const titleWidth = doc.getTextWidth(intestazione1);
    const titleX = (doc.internal.pageSize.width - titleWidth) / 2;

    // Aggiungi il primo titolo centrato
    doc.text(intestazione1, titleX, y + imgHeight + 25);

    // Impostare il font per l'intestazione (Helvetica, bold)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);

    // Calcolare la larghezza del titolo per centrarlo
    const titleWidth2 = doc.getTextWidth(intestazione2);
    const titleX2 = (doc.internal.pageSize.width - titleWidth2) / 2;

    // Aggiungi il secondo titolo centrato
    doc.text(intestazione2, titleX2, y + imgHeight + 35);

    // Impostare il font per il titolo attestato (Helvetica, bold)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);

    // Definisci i margini per il titolo
    const leftMargin = 20; // Margine sinistro in mm
    const rightMargin = 20; // Margine destro in mm
    const maxWidth = doc.internal.pageSize.width - leftMargin - rightMargin;  // Impostiamo la larghezza massima per il testo

    // Usa splitTextToSize per gestire il wrapping del testo del titolo attestato
    const lines = doc.splitTextToSize(titoloAttestato, maxWidth);  // Divide il testo in più righe se necessario

    // Calcolare la posizione verticale in modo da non sovrapporre gli altri elementi
    const titleY3 = y + imgHeight + 45;

    // Aggiungere ogni riga centrata con margini
    const lineSpacing = 5;  // Distanza verticale tra le righe (ridotto a 5 mm)
    lines.forEach((line, index) => {
        const lineWidth = doc.getTextWidth(line);  // Calcola la larghezza della riga
        const lineX = leftMargin + (doc.internal.pageSize.width - leftMargin - rightMargin - lineWidth) / 2;  // Calcola la posizione orizzontale con margini
        doc.text(line, lineX, titleY3 + (index * lineSpacing));  // Posiziona la riga sotto la precedente con una distanza ridotta
    });

    // Impostare il font per le normative (Helvetica, italic)
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);

    // Calcolare la larghezza delle normative per centrarle
    const titleWidth4 = doc.getTextWidth(normative);
    const titleX4 = (doc.internal.pageSize.width - titleWidth4) / 2;

    // Calcolare la posizione verticale per le normative (dopo il titoloAttestato)
    const normativeY = titleY3 + lines.length * lineSpacing + 3; // Posizione sotto il titoloAttestato

    // Aggiungi le normative centrato sotto il titoloAttestato
    doc.text(normative, titleX4, normativeY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    const titleWidth5 = doc.getTextWidth(testo3);
    const titleX5 = (doc.internal.pageSize.width - titleWidth5) / 2;
    const testoTreY = normativeY + 10;

    doc.text(testo3, titleX5, testoTreY);

    // Nome e cognome partecipante.
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);

    const titleNomeCognome = doc.getTextWidth(cognomePartecipante + " " + nomePartecipante);
    const nomeCognomeX = (doc.internal.pageSize.width - titleNomeCognome) / 2;
    const nomeCognomeY = testoTreY + lines.length * lineSpacing + 1;

    doc.text(cognomePartecipante + " " + nomePartecipante, nomeCognomeX, nomeCognomeY);

    // Codice Fiscale
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    const titleCf = doc.getTextWidth("Codice Fiscale: " + codiceFiscale);
    const cfX = (doc.internal.pageSize.width - titleCf) / 2;
    const increasedLineSpacing = 5; // Spaziatura aumentata tra i testi
    const cfY = nomeCognomeY + increasedLineSpacing;

    doc.text("Codice Fiscale: " + codiceFiscale, cfX, cfY);

    // Data e luogo di nascita
    const titleDataELuogo = doc.getTextWidth("Data e luogo di nascita: " + dataNascita + " " + luogoNascita + " " + provinciaNascita);
    const dataLuogoX = (doc.internal.pageSize.width - titleDataELuogo) / 2;
    const dataLuogoY = cfY + increasedLineSpacing;

    doc.text("Data e luogo di nascita: " + dataNascita + " " + luogoNascita + " " + provinciaNascita, dataLuogoX, dataLuogoY);

    // Azienda.
    const aziendaTitle = doc.getTextWidth("Azienda: " + azienda);
    const aziendaX = (doc.internal.pageSize.width - aziendaTitle) / 2;
    const aziendaY = dataLuogoY + increasedLineSpacing;

    doc.text("Azienda: " + azienda, aziendaX, aziendaY);

    // Testo 4.
    doc.setFontSize(9);
    const testo4Title = doc.getTextWidth(testo4);
    const testo4X = (doc.internal.pageSize.width - testo4Title) / 2;
    const testo4Y = aziendaY + lines.length * lineSpacing + 3;

    doc.text(testo4, testo4X, testo4Y);

    // Durata e data.

    let periodo = "";

    let dataInizioUsata = "";
    let dataFineUsata = "";

    if (dataInizio == "01/01/0001") {
        dataInizioUsata = dataInizioCorso;
    }

    else {
        dataInizioUsata = dataInizio;
    }

    if (dataFine == "01/01/0001") {
        dataFineUsata = dataFineCorso;
    }

    else {
        dataFineUsata = dataFine;
    }

    if (dataInizioUsata === dataFineUsata) {
        periodo = "svoltosi in data " + dataInizioUsata;

    }

    else {
        periodo = "svoltosi dal " + dataInizioUsata + " al " + dataFineUsata;
    }

    doc.setFontSize(10);
    const dataEDurataTitle = doc.getTextWidth("durata ore " + durata + " " + periodo);
    const dataEDurataX = (doc.internal.pageSize.width - dataEDurataTitle) / 2;
    const dataEDurataY = testo4Y + lines.length * lineSpacing + 3;

    doc.text("durata ore " + durata + " " + periodo, dataEDurataX, dataEDurataY);

    let sediStartY = 0;

    // Testo 5
    if (testo5 != null) {
        const testo5Title = doc.getTextWidth(testo5);
        const testo5X = (doc.internal.pageSize.width - testo5Title) / 2;
        const testo5Y = dataEDurataY + 5;

        //doc.text(testo5, testo5X, testo5Y);

        // Mettere su più righe se necessario.
        // Larghezza massima del testo prima di essere suddiviso in più righe
        const maxTextWidth = doc.internal.pageSize.width - 50// Margini di 10mm su entrambi i lati
        const testoRighe = doc.splitTextToSize(testo5, maxTextWidth); // Suddivisione del testo

        // Altezza delle righe: normale e molto ridotto per wrapping
        const firstLineHeight = 8; // Altezza della prima riga
        const subsequentLineHeight = -5; // Altezza minima per le righe successive (ulteriore riduzione)

        // Inizializzazione della posizione iniziale
        const sedeDescY = testo5Y + 5; // Posizione verticale iniziale in base al contesto
        let currentY = sedeDescY; // Coordinata verticale per iterare sulle righe

        // Scrittura del testo riga per riga
        testoRighe.forEach((riga, index) => {
            const xPos = (doc.internal.pageSize.width - doc.getTextWidth(riga)) / 2; // Centratura orizzontale
            doc.text(riga, xPos, currentY); // Scrive la riga corrente
            currentY += 5; // Spaziatura ridotta ulteriormente
            console.log(`Riga ${index + 1}: y=${currentY}`);
        });

        sediStartY = currentY + 1;

        console.log("TESTO 5 INDIVIDUATO");
    }

    else {
        sediStartY = dataEDurataY + 10;

        console.log("TESTO 5 NON INDIVIDUATO");
    }

    // Sedi

    // Costante del font
    const sediFont = "helvetica";
    const fontSize = 10;

    doc.setFont(sediFont, 'normal');
    doc.setFontSize(fontSize);

    // Definizione delle costanti per le sedi
    const PRAEVENIO = "100000000";
    const ELEARNING = "100000001";
    const VIDEOCONFERENZA = "100000002";
    const SEDE_CLIENTE = "100000003";
    const ALTRO = "100000004";

    let stringY; // Dichiarata come variabile, non costante

    if ([PRAEVENIO, ELEARNING, VIDEOCONFERENZA, ALTRO, SEDE_CLIENTE].includes(sedeDelCorso)) {
        const sedeTitle = doc.getTextWidth("Sede del corso:");
        const sedeX = (doc.internal.pageSize.width - sedeTitle) / 2;
        const sedeY = sediStartY;
        doc.text("Sede del corso:", sedeX, sedeY);

        let sedeCorsoTitolo = "";

        switch (sedeDelCorso) {
            case PRAEVENIO:
                sedeCorsoTitolo = "Praevenio SRLS";
                break;
            case ELEARNING:
                sedeCorsoTitolo = "Corso svolto in modalita' e-learning e realizzato in conformita' allo standard internazionale SCORM (Shereable Content Object Reference Model) come definito dall'Allegato II all'Accordo Stato Regioni del 07/07/2016";
                break;
            case VIDEOCONFERENZA:
                sedeCorsoTitolo = "Corso svolto in modalità di videoconferenza sincrona.";
                break;
            case ALTRO:
                sedeCorsoTitolo = indicareSede;
                break;
            case SEDE_CLIENTE:
                sedeCorsoTitolo = sedeP || sedeT;
                break;
        }

        // Larghezza massima del testo prima di essere suddiviso in più righe
        const maxTextWidth = doc.internal.pageSize.width - 27 // Margini di 10mm su entrambi i lati
        const sedeCorsoRighe = doc.splitTextToSize(sedeCorsoTitolo, maxTextWidth); // Suddivisione del testo

        // Altezza delle righe: normale e molto ridotto per wrapping
        const firstLineHeight = 8; // Altezza della prima riga
        const subsequentLineHeight = -5; // Altezza minima per le righe successive (ulteriore riduzione)

        // Inizializzazione della posizione iniziale
        const sedeDescY = sedeY + 5; // Posizione verticale iniziale in base al contesto
        let currentY = sedeDescY; // Coordinata verticale per iterare sulle righe

        // Scrittura del testo riga per riga
        sedeCorsoRighe.forEach((riga, index) => {
            const xPos = (doc.internal.pageSize.width - doc.getTextWidth(riga)) / 2; // Centratura orizzontale
            doc.text(riga, xPos, currentY); // Scrive la riga corrente
            currentY += 5; // Spaziatura ridotta ulteriormente
            console.log(`Riga ${index + 1}: y=${currentY}`);
        });

        let stringY = 0;

        if (sedeDescY >= 161.3) {
            stringY = sedeDescY + 30;
        }

        else {
            stringY = sedeDescY + 40;
        }

        // Docente Responsabile.

        doc.setFont('helvetica', 'italic');
        doc.setFontSize(10);

        const stringToAdd = "Docente Responsabile";
        const stringX = 36.92;
        doc.text(stringToAdd, stringX, stringY);

        if (docenteCognome != null && docenteNome != null) {

            let firmaDocente;
            let nomeECognomeDocente;

            switch (docenteCognome) {
                case "ANTONELLI":
                    firmaDocente = await loadImageAsBase64('/images/firme/antonelli.png');
                    doc.addImage(firmaDocente, 'PNG', stringX, stringY + 2, 34.925, 8.7817);
                    break;

                case "BATTAGLINI":
                    firmaDocente = await loadImageAsBase64('/images/firme/battaglini.png');
                    doc.addImage(firmaDocente, 'PNG', stringX, stringY + 2, 34.925, 8.7817);
                    break;

                case "BIGINI":
                    firmaDocente = await loadImageAsBase64('/images/firme/bigini.jpg');
                    doc.addImage(firmaDocente, 'JPG', stringX, stringY + 2, 34.925, 8.7817);
                    break;

                case "BONCI":
                    firmaDocente = await loadImageAsBase64('/images/firme/bonci.png');
                    doc.addImage(firmaDocente, 'PNG', stringX, stringY + 2, 34.925, 8.7817);
                    break;

                case "COLANGELI":
                    firmaDocente = await loadImageAsBase64('/images/firme/colangeli.png');
                    doc.addImage(firmaDocente, 'PNG', stringX, stringY + 2, 34.925, 8.7817);
                    break;

                case "IZZO":
                    firmaDocente = await loadImageAsBase64('/images/firme/izzo.jpg');
                    doc.addImage(firmaDocente, 'JPG', stringX, stringY + 2, 34.925, 8.7817);
                    break;

                case "LUCCI":
                    firmaDocente = await loadImageAsBase64('/images/firme/lucci.jpg');
                    doc.addImage(firmaDocente, 'JPG', stringX, stringY + 2, 34.925, 8.7817);
                    break;

                case "LUCIDI":
                    if (docenteNome === "ROBERTO") {
                        firmaDocente = await loadImageAsBase64('/images/firme/robertolucidi.jpg');
                        doc.addImage(firmaDocente, 'JPG', stringX, stringY + 2, 34.925, 8.7817);
                        break;
                    }
                    else {
                        firmaDocente = await loadImageAsBase64('/images/firme/lucidiAlessandro.jpg');
                        doc.addImage(firmaDocente, 'JPG', stringX, stringY + 2, 34.925, 8.7817);
                        break;
                    }

                case "MACCHERONI":
                    firmaDocente = await loadImageAsBase64('/images/firme/maccheroni.png');
                    doc.addImage(firmaDocente, 'PNG', stringX, stringY + 2, 34.925, 8.7817);
                    break;

                case "MARCACCIOLI":
                    firmaDocente = await loadImageAsBase64('/images/firme/marcaccioli.jpg');
                    doc.addImage(firmaDocente, 'JPG', stringX, stringY + 2, 34.925, 8.7817);
                    break;

                case "MAULU":
                    firmaDocente = await loadImageAsBase64('/images/firme/maulu.jpg');
                    doc.addImage(firmaDocente, 'JPG', stringX, stringY + 2, 34.925, 8.7817);
                    break;

                case "PALAZZI":
                    firmaDocente = await loadImageAsBase64('/images/firme/palazzi.jpg');
                    doc.addImage(firmaDocente, 'JPG', stringX, stringY + 2, 34.925, 8.7817);
                    break;
            }

            nomeECognomeDocente = docenteNome + " " + docenteCognome;
            doc.text(nomeECognomeDocente, stringX, stringY + 15);

        }

        // Data di stampa

        doc.setFont('helvetica', 'normal');

        const dataStampaTitle = "Data di stampa";
        const stringXStampa = 36.92;
        doc.text(dataStampaTitle, stringXStampa, stringY + 30);

        let dataStampa = "";

        if (dataFine != null) {
            dataStampa = dataFine;
        }

        else {
            dataStampa = dataFineCorso;
        }

        doc.text(dataStampa, stringXStampa + 3, stringY + 35);

        doc.setFontSize(8);
        XPieDiPagina = stringXStampa - 15;
        YPieDiPagina = stringY + 50;
        doc.text(pieDiPagina, XPieDiPagina, YPieDiPagina);


        doc.text("ID " + corsoId, XPieDiPagina, YPieDiPagina + 10);


        doc.setFontSize(10);
        // Praevenio Srls
        const praevenio = "Praevenio Srls";
        const stringXP = 150;
        doc.text(praevenio, stringXP, stringY);

        // Roberto Lucidi
        const lucidi = "Dott. Roberto Lucidi";
        const stringXr = 145;
        doc.text(lucidi, stringXr, stringY + 5);

        // Firma Roberto Lucidi
        doc.addImage(firmaRoberto, 'JPG', stringXr, stringY + 10, 37.90, 27.00);

    } else {

        const sedeThTitle = doc.getTextWidth("Sede del corso teorico: ");
        const sedeThX = (doc.internal.pageSize.width - sedeThTitle) / 2;
        const sedeThY = sediStartY + 15;
        doc.text("Sede del corso teorico: ", sedeThX, sedeThY);

        let sedeTeoricaDescrizione = "";

        switch (sedeTeoricaDelCorso) {
            case PRAEVENIO:
                sedeTeoricaDescrizione = "Praevenio SRLS";
                break;
            case ELEARNING:
                sedeTeoricaDescrizione = "Corso svolto in modalita' e-learning e realizzato in conformita' allo standard internazionale SCORM (Shereable Content Object Reference Model) come definito dall'Allegato II all'Accordo Stato Regioni del 07/07/2016";
                break;
            case VIDEOCONFERENZA:
                sedeTeoricaDescrizione = "Corso svolto in modalità di videoconferenza sincrona.";
                break;
            case ALTRO:
                sedeTeoricaDescrizione = indicareSedeTeorica;
                break;
            case SEDE_CLIENTE:
                sedeTeoricaDescrizione = indirizzoDue;
                break;
        }

        const maxTextWidth = doc.internal.pageSize.width - 27;

        const sedeCorsoRigheTh = doc.splitTextToSize(sedeTeoricaDescrizione, maxTextWidth); 

        // Altezza delle righe: normale e molto ridotto per wrapping
        const firstLineHeight = 8;
        const subsequentLineHeight = -5; 

        // Inizializzazione della posizione iniziale
        const sedeThDescY = sedeThY + 5;
        let currentYTh = sedeThDescY;

        // Scrittura del testo riga per riga
        sedeCorsoRigheTh.forEach((riga, index) => {
            const xPosTh = (doc.internal.pageSize.width - doc.getTextWidth(riga)) / 2;
            doc.text(riga, xPosTh, currentYTh);
            currentYTh += 5;
            console.log(`Riga ${index + 1}: y=${currentYTh}`);
        });

        /* Sede Pratica. */

        const sedePr = doc.getTextWidth("Sede del corso pratico: ");
        const sedePrX = (doc.internal.pageSize.width - sedePr) / 2;
        const sedePrY = currentYTh; // Spaziatura ridotta a 5 mm tra titolo e descrizione
        doc.text("Sede del corso pratico: ", sedePrX, sedePrY);

        let sedePraticaDescrizione = "";

        switch (sedePraticaDelCorso) {
            case PRAEVENIO:
                sedePraticaDescrizione = "Praevenio SRLS";
                break;
            case ELEARNING:
                sedePraticaDescrizione = "Corso svolto in modalita' e-learning e realizzato in conformita' allo standard internazionale SCORM (Shereable Content Object Reference Model) come definito dall'Allegato II all'Accordo Stato Regioni del 07/07/2016";
                break;
            case VIDEOCONFERENZA:
                sedePraticaDescrizione = "Corso svolto in modalità di videoconferenza sincrona.";
                break;
            case ALTRO:
                sedePraticaDescrizione = indicareSedePratica;
                break;
            case SEDE_CLIENTE:
                sedePraticaDescrizione = indirizzoTre;
                break;
        }

        // Larghezza massima del testo prima di essere suddiviso in più righe 
        const sedeCorsoRighePr = doc.splitTextToSize(sedePraticaDescrizione, maxTextWidth); 

        // Inizializzazione della posizione iniziale
        const sedePrDescY = sedePrY + 5; 
        let currentY = sedePrDescY; 

        // Scrittura del testo riga per riga
        sedeCorsoRighePr.forEach((riga, index) => {
            const xPos = (doc.internal.pageSize.width - doc.getTextWidth(riga)) / 2; 
            doc.text(riga, xPos, currentY); 
            currentY += 5; 
            console.log(`Riga ${index + 1}: y=${currentY}`);
        });

        console.log("SedePrDescY: ", sedePrDescY);
        // stringY = sedePrDescY + 30;

        let stringY = 0;

        if (sedePrDescY >= 161.3) {
            stringY = sedePrDescY + 20;
        }

        else {
            stringY = sedePrDescY + 10
        }
        // Docente Responsabile.

        doc.setFont('helvetica', 'italic');
        doc.setFontSize(10);

        const stringToAdd = "Docente Responsabile";
        const stringX = 36.92;
        doc.text(stringToAdd, stringX, stringY);

        if (docenteCognome != null && docenteNome != null) {

            let firmaDocente;
            let nomeECognomeDocente;

            switch (docenteCognome) {
                case "ANTONELLI":
                    firmaDocente = await loadImageAsBase64('/images/firme/antonelli.png');
                    doc.addImage(firmaDocente, 'PNG', stringX, stringY + 2, 34.925, 8.7817);
                    break;

                case "BATTAGLINI":
                    firmaDocente = await loadImageAsBase64('/images/firme/battaglini.png');
                    doc.addImage(firmaDocente, 'PNG', stringX, stringY + 2, 34.925, 8.7817);
                    break;

                case "BIGINI":
                    firmaDocente = await loadImageAsBase64('/images/firme/bigini.jpg');
                    doc.addImage(firmaDocente, 'JPG', stringX, stringY + 2, 34.925, 8.7817);
                    break;

                case "BONCI":
                    firmaDocente = await loadImageAsBase64('/images/firme/bonci.png');
                    doc.addImage(firmaDocente, 'PNG', stringX, stringY + 2, 34.925, 8.7817);
                    break;

                case "COLANGELI":
                    firmaDocente = await loadImageAsBase64('/images/firme/colangeli.png');
                    doc.addImage(firmaDocente, 'PNG', stringX, stringY + 2, 34.925, 8.7817);
                    break;

                case "IZZO":
                    firmaDocente = await loadImageAsBase64('/images/firme/izzo.jpg');
                    doc.addImage(firmaDocente, 'JPG', stringX, stringY + 2, 34.925, 8.7817);
                    break;

                case "LUCCI":
                    firmaDocente = await loadImageAsBase64('/images/firme/lucci.jpg');
                    doc.addImage(firmaDocente, 'JPG', stringX, stringY + 2, 34.925, 8.7817);
                    break;

                case "LUCIDI":
                    if (docenteNome === "ROBERTO") {
                        firmaDocente = await loadImageAsBase64('/images/firme/robertolucidi.jpg');
                        doc.addImage(firmaDocente, 'JPG', stringX, stringY + 2, 34.925, 8.7817);
                        break;
                    }
                    else {
                        firmaDocente = await loadImageAsBase64('/images/firme/lucidiAlessandro.jpg');
                        doc.addImage(firmaDocente, 'JPG', stringX, stringY + 2, 34.925, 8.7817);
                        break;
                    }

                case "MACCHERONI":
                    firmaDocente = await loadImageAsBase64('/images/firme/maccheroni.png');
                    doc.addImage(firmaDocente, 'PNG', stringX, stringY + 2, 34.925, 8.7817);
                    break;

                case "MARCACCIOLI":
                    firmaDocente = await loadImageAsBase64('/images/firme/marcaccioli.jpg');
                    doc.addImage(firmaDocente, 'JPG', stringX, stringY + 2, 34.925, 8.7817);
                    break;

                case "MAULU":
                    firmaDocente = await loadImageAsBase64('/images/firme/maulu.jpg');
                    doc.addImage(firmaDocente, 'JPG', stringX, stringY + 2, 34.925, 8.7817);
                    break;

                case "PALAZZI":
                    firmaDocente = await loadImageAsBase64('/images/firme/palazzi.jpg');
                    doc.addImage(firmaDocente, 'JPG', stringX, stringY + 2, 34.925, 8.7817);
                    break;
            }

            nomeECognomeDocente = docenteNome + " " + docenteCognome;
            doc.text(nomeECognomeDocente, stringX, stringY + 15);

        }

        // Data di stampa

        doc.setFont('helvetica', 'normal');

        const dataStampaTitle = "Data di stampa";
        const stringXStampa = 36.92;
        doc.text(dataStampaTitle, stringXStampa, stringY + 30);

        let dataStampa = "";

        if (dataFine != null) {
            dataStampa = dataFine;
        }

        else {
            dataStampa = dataFineCorso;
        }

        doc.text(dataStampa, stringXStampa + 3, stringY + 35);

        doc.setFontSize(8);
        XPieDiPagina = stringXStampa - 15;
        YPieDiPagina = stringY + 50;
        doc.text(pieDiPagina, XPieDiPagina, YPieDiPagina);


        doc.text("ID " + corsoId, XPieDiPagina, YPieDiPagina + 10);


        doc.setFontSize(10);

        // Praevenio Srls
        const praevenio = "Praevenio Srls";
        const stringXP = 150;
        doc.text(praevenio, stringXP, stringY);

        // Roberto Lucidi
        const lucidi = "Dott. Roberto Lucidi";
        const stringXr = 145;
        doc.text(lucidi, stringXr, stringY + 5);

        // Firma Roberto Lucidi
        doc.addImage(firmaRoberto, 'JPG', stringXr, stringY + 10, 37.90, 27.00);
    }    

    // Definisci il titolo del PDF
    let finalTitle = "att_id_" + corsoId + "-" + corsoTipo + "--" + cognomePartecipante + " " + nomePartecipante + ".pdf";

    // Salva il PDF
    doc.save(finalTitle);
};

// Funzione per caricare l'immagine come Base64
function loadImageAsBase64(imagePath) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = function () {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL());  // Restituisce l'immagine in formato Base64
        };
        img.onerror = function (error) {
            reject(error);
        };
        img.src = imagePath;  // Percorso relativo dell'immagine
    });
}
