Guida Completa per Lavorare su un Progetto GitHub su Windows
Questa guida ti aiuterà a lavorare con Git e GitHub su Windows. Imparerai come gestire i rami, fare commit, push e pull, e come collaborare con altre persone sullo stesso progetto.

1. Aprire Git Bash dalla Cartella del Progetto
Puoi aprire Git Bash direttamente nella cartella del progetto, senza dover navigare manualmente nel terminale.

Come fare:

Vai nella cartella del progetto sul tuo computer.
Clicca con il tasto destro in un'area vuota della cartella e vai su mostra altre opzioni.
Se hai installato Git, vedrai l'opzione "Git Bash Here" nel menu contestuale.
Clicca su questa opzione per aprire Git Bash direttamente nella cartella del progetto e utilizzare i comandi Git.

2. Installare Git e Git Bash su Windows
Prima di iniziare, assicurati di avere Git installato sul tuo computer. Puoi scaricarlo dal sito ufficiale Git-scm.com.

Durante l'installazione, assicurati di selezionare anche Git Bash, che è il terminale ideale per usare Git.

3. Clonare la Repository
Per lavorare su un progetto, devi clonare la repository sul tuo computer.

Passaggi:

Vai alla pagina del progetto su GitHub.
Clicca su "Code" e copia l'URL della repository.
Apri Git Bash e vai nella cartella dove desideri salvare il progetto, ad esempio sul desktop.
Clona la repository con il comando git clone <URL del progetto>.
Entra nella cartella del progetto clonata con cd nome-del-progetto.
Ora hai il progetto sul tuo computer e sei pronto a lavorarci!

4. Gestire i Rami (Branches)
I rami ti permettono di lavorare su funzionalità separate senza interferire con il lavoro degli altri.

Comandi principali:

Visualizzare i rami: Usa git branch per vedere i rami esistenti.
Creare un nuovo ramo: Usa "git checkout -b nome-del-ramo" per creare e passare al nuovo ramo.
Passare a un ramo esistente: Usa "git checkout nome-del-ramo" per passare a un ramo già esistente.

5. Aggiungere e Commettere le Modifiche
Quando fai delle modifiche ai file, devi prima aggiungerli e poi committarli.

Comandi principali:

Aggiungere i file modificati: Usa "git add ." per aggiungere tutte le modifiche o "git add nome-del-file" per aggiungere un singolo file.
Fare il commit: Usa "git commit -m "Descrizione delle modifiche"" per registrare le modifiche con una descrizione.

6. Inviare le Modifiche su GitHub (Push)
Una volta fatto il commit, devi inviare le modifiche su GitHub.

Comando principale:

Usa "git push -u origin nome-del-ramo" per inviare le modifiche al ramo specificato su GitHub.

7. Ottenere le Modifiche degli Altri (Pull)
Se altri collaboratori hanno inviato delle modifiche, puoi scaricarle nel tuo repository locale.

Comandi principali:

Aggiornare il ramo principale (main):
Passa al ramo principale con "git checkout main".
Usa "git pull origin main" per aggiornare il ramo principale.
Aggiornare un altro ramo:
Passa al ramo che desideri aggiornare con "git checkout nome-del-ramo".
Usa "git pull origin nome-del-ramo" per aggiornare il ramo selezionato.

8. Creare una Pull Request (PR)
Una Pull Request (PR) permette ad altri di rivedere il tuo lavoro prima che venga unito al ramo principale.

Passaggi:

Vai su GitHub e apri la pagina del progetto.
Clicca su "Compare & Pull Request" accanto al ramo che hai appena pushato.
Scrivi una descrizione delle modifiche e clicca su "Create Pull Request".

9. Eliminare un Ramo Non Più Necessario
Dopo aver completato il lavoro su un ramo e averlo unito al ramo principale, puoi eliminarlo.

Comandi principali:

Eliminare un ramo localmente: Usa "git branch -d nome-del-ramo".
Eliminare un ramo su GitHub: Usa "git push origin --delete nome-del-ramo".

10. Riepilogo dei Comandi Fondamentali
Ecco un riassunto dei comandi più importanti:

Clonare la repository: "git clone <URL del progetto>"
Creare un nuovo ramo: "git checkout -b nome-del-ramo"
Aggiungere modifiche: "git add ."
Fare il commit: "git commit -m "Descrizione modifiche""
Inviare modifiche su GitHub: "git push -u origin nome-del-ramo"
Aggiornare il ramo principale: "git pull origin main"
Creare una Pull Request: Vai su GitHub e clicca su "Compare & Pull Request".
Eliminare un ramo:
Localmente: "git branch -d nome-del-ramo"
Su GitHub: "git push origin --delete nome-del-ramo"
