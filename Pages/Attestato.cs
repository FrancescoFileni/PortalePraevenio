using System.Collections.Specialized;
using System.IO;
using iTextSharp.text;
using iTextSharp.text.pdf;
using MudBlazor;

namespace BlazorPortal.Pages
{
    public class Attestato
    {
        private string _intestazione1;
        private string _intestazione2;
        private string _titoloAttestato;
        private string _normative;
        private string _testo3;
        private string _testo4;
        private string _testo5;

        private string _nome;
        private string _cognome;
        private string _codiceFiscale;
        private string _dataNascita;
        private string _luogoNascita;
        private string _provinciaNascita;
        private string _azienda;

        private string _datainizio;
        private string _datafine;
        private string _durata;

        private string _sedeCorso;
        private string _sedeTeorica;
        private string _sedePratica;
        private string _indicareSede;
        private string _indicareSedeTeorica;
        private string _indicareSedePratica;
        private string _indirizzoDue;
        private string _indirizzoTre;
        private string _sedep;
        private string _sedet;
        public Attestato(string intestazione1,
                         string intestazione2,
                         string titoloAttestato,
                         string normative,
                         string testo3,
                         string nome,
                         string cognome,
                         string codiceFiscale,
                         string dataNascita,
                         string luogoNascita,
                         string provinciaNascita,
                         string azienda,
                         string testo4,
                         string testo5,
                         string datainizio,
                         string datafine,
                         string durata,
                         string sedeCorso,
                         string sedeTeorica,
                         string sedePratica,
                         string indicareSede,
                         string indicareSedeTeorica,
                         string indicareSedePratica,
                         string indirizzoDue,
                         string indirizzoTre,
                         string sedep,
                         string sedet)
        {
            this._intestazione1 = intestazione1;
            this._intestazione2 = intestazione2;
            this._titoloAttestato = titoloAttestato;
            this._normative = normative;
            this._testo3 = testo3;
            _nome = nome;
            _cognome = cognome;
            _codiceFiscale = codiceFiscale;
            _dataNascita = dataNascita;
            _luogoNascita = luogoNascita;
            _provinciaNascita = provinciaNascita;
            _azienda = azienda;
            _testo4 = testo4;
            _testo5 = testo5;
            _datainizio = datainizio;
            _datafine = datafine;
            _durata = durata;
            _sedeCorso = sedeCorso;
            _sedeTeorica = sedeTeorica;
            _sedePratica = sedePratica;
            _indicareSede = indicareSede;
            _indicareSedeTeorica = indicareSedeTeorica;
            _indicareSedePratica = indicareSedePratica;
            _indirizzoDue = indirizzoDue;
            _indirizzoTre = indirizzoTre;
            _sedep = sedep;
            _sedet = sedet;
        }


        public byte[] GeneratePdfInMemory()
        {
            using (var memoryStream = new MemoryStream())
            { 

                var document = new Document();
                PdfWriter.GetInstance(document, memoryStream);

                document.Open();

                string imagePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "praevenio_logo.png");
                Image img = Image.GetInstance(imagePath);
                document.Add(img); // Aggiungi l'immagine al PDF

                // Intestazione 1
                var font = FontFactory.GetFont(FontFactory.TIMES_ROMAN, 40, Font.BOLDITALIC, BaseColor.BLACK);
                var paragraph = new iTextSharp.text.Paragraph(this._intestazione1, font)
                {
                    Alignment = Element.ALIGN_CENTER
                };
                document.Add(paragraph);
                //document.Add(Chunk.NEWLINE);

                // Aggiungi uno spazio dopo l'intestazione 1
                //document.Add(Chunk.NEWLINE); // Aggiungi una riga vuota

                // Intestazione 2
                var fontInt2 = FontFactory.GetFont("Arial", 14, Font.BOLD, BaseColor.BLACK);
                var parInt2 = new iTextSharp.text.Paragraph(this._intestazione2, fontInt2)
                {
                    Alignment = Element.ALIGN_CENTER
                };
                document.Add(parInt2);

                // Aggiungi uno spazio dopo l'intestazione 2
                document.Add(Chunk.NEWLINE); // Aggiungi una riga vuota

                // Titolo attestato
                var fontAtt = FontFactory.GetFont("Arial", 12, Font.BOLD, BaseColor.BLACK);
                var parAtt = new iTextSharp.text.Paragraph(this._titoloAttestato, fontAtt)
                {
                    Alignment = Element.ALIGN_CENTER
                };
                document.Add(parAtt);

                // Aggiungi uno spazio dopo il titolo attestato
                document.Add(Chunk.NEWLINE); // Aggiungi una riga vuota

                // Normative
                var fontNorm = FontFactory.GetFont("Arial", 10, Font.ITALIC, BaseColor.BLACK);
                var parNorm = new iTextSharp.text.Paragraph(this._normative, fontNorm)
                {
                    Alignment = Element.ALIGN_CENTER
                };
                document.Add(parNorm);

                // Aggiungi uno spazio dopo la sezione delle normative
                document.Add(Chunk.NEWLINE); // Aggiungi una riga vuota

                // Testo 3
                var testo3Font = FontFactory.GetFont("Arial", 10, Font.NORMAL, BaseColor.BLACK);
                var testo3 = new iTextSharp.text.Paragraph(this._testo3, testo3Font)
                {
                    Alignment = Element.ALIGN_CENTER
                };
                document.Add(testo3);

                // Nome e cognome
                var nomeCognomeFont = FontFactory.GetFont("Arial", 14, Font.BOLD, BaseColor.BLACK);
                var nomeCognomePar = new iTextSharp.text.Paragraph(this._nome + " " + this._cognome, nomeCognomeFont)
                {
                    Alignment = Element.ALIGN_CENTER
                };
                document.Add(nomeCognomePar);

                // Codice Fiscale.
                var cfFont = FontFactory.GetFont("Arial", 10, Font.NORMAL, BaseColor.BLACK);
                var cfPar = new iTextSharp.text.Paragraph("Codice Fiscale: " + this._codiceFiscale, cfFont)
                {
                    Alignment = Element.ALIGN_CENTER
                };
                document.Add(cfPar);

                // Anagrafica
                var anagraficaFont = FontFactory.GetFont("Arial", 10, Font.NORMAL, BaseColor.BLACK);
                var anagraficaPar = new iTextSharp.text.Paragraph("Data e luogo di nascita: " + this._dataNascita + " " + this._luogoNascita + " " + this._provinciaNascita, anagraficaFont)
                {
                    Alignment = Element.ALIGN_CENTER
                };
                document.Add(anagraficaPar);

                // Azienda
                var aziendaFont = FontFactory.GetFont("Arial", 10, Font.NORMAL, BaseColor.BLACK);
                var aziendaPar = new iTextSharp.text.Paragraph("Azienda: " + this._azienda, aziendaFont)
                {
                    Alignment = Element.ALIGN_CENTER
                };
                document.Add(aziendaPar);
                document.Add(Chunk.NEWLINE); // Aggiungi una riga vuota

                // Testo4
                var testo4Font = FontFactory.GetFont("Arial", 9, Font.NORMAL, BaseColor.BLACK);
                var testo4 = new iTextSharp.text.Paragraph(this._testo4, testo4Font)
                {
                    Alignment = Element.ALIGN_CENTER
                };
                document.Add(testo4);
                document.Add(Chunk.NEWLINE); // Aggiungi una riga vuota

                // Durata e data
                string periodo = "";
                if (this._datainizio == this._datafine)
                {
                    periodo = "svoltosi in data: " + this._datainizio;
                }
                else
                {
                    periodo = "svoltosi dal " + this._datainizio + " al " + this._datafine;
                }

                var durataFont = FontFactory.GetFont("Arial", 10, Font.NORMAL, BaseColor.BLACK);
                var durata = new iTextSharp.text.Paragraph("durata ore: " + this._durata + " " + periodo, testo4Font)
                {
                    Alignment = Element.ALIGN_CENTER
                };
                document.Add(durata);
                document.Add(Chunk.NEWLINE); // Aggiungi una riga vuota

                // Testo 5
                var testo5Font = FontFactory.GetFont("Arial", 10, Font.NORMAL, BaseColor.BLACK);
                var testo5 = new iTextSharp.text.Paragraph(this._testo5, testo5Font)
                {
                    Alignment = Element.ALIGN_CENTER
                };
                document.Add(testo5);
                document.Add(Chunk.NEWLINE); // Aggiungi una riga vuota

                // Titolo della sede
                string sedeTitolo = "";
                string sedeTeoricaTitolo = "";
                string sedePraticaTitolo = "";

                // Mappatura delle sedi per leggibilità
                const string PRAEVENIO = "100000000";
                const string ELEARNING = "100000001";
                const string VIDEOCONFERENZA = "100000002";
                const string SEDE_CLIENTE = "100000003";
                const string ALTRO = "100000004";
                var sediFont = FontFactory.GetFont("Arial", 10, Font.NORMAL, BaseColor.BLACK);

                if (_sedeCorso == PRAEVENIO ||
                    _sedeCorso == ELEARNING ||
                    _sedeCorso == VIDEOCONFERENZA ||
                    _sedeCorso == ALTRO ||
                    _sedeCorso == SEDE_CLIENTE)
                {
                    sedeTitolo = "Sede del corso: ";
                }

                else 
                {
                    sedeTeoricaTitolo = "Sede del corso teorico: ";
                    sedePraticaTitolo = "Sede del corso pratico: ";
                }

                if(sedeTitolo != "") // Sede del corso
                {
                    var sedeParagraph = new iTextSharp.text.Paragraph($"{sedeTitolo}", sediFont)
                    {
                        Alignment = Element.ALIGN_CENTER
                    };
                    document.Add(sedeParagraph);
                    // Sede.

                    string sedeCorsoTitolo = "";

                    if (_sedeCorso == PRAEVENIO)
                    {
                        sedeCorsoTitolo = "Praevenio SRLS";
                    }

                    if (_sedeCorso == ELEARNING)
                    {
                        sedeCorsoTitolo = "Corso svolto in modalita' e-learning e realizzato in conformita' allo standard internazionale SCORM (Shereable Content Object Reference Model) come definito dall'Allegato II all'Accordo Stato Regioni del 07/07/2016";
                    }

                    if (_sedeCorso == VIDEOCONFERENZA)
                    {
                        sedeCorsoTitolo = "Corso svolto in modalità di videoconferenza sincrona";
                    }

                    if (_sedeCorso == ALTRO)
                    {
                        sedeCorsoTitolo = this._indicareSede;
                    }

                    if (_sedeCorso == SEDE_CLIENTE)
                    {
                        if (_sedet == "")
                        {
                            sedeCorsoTitolo = this._sedep;
                        }

                        else
                        {
                            sedeCorsoTitolo = this._sedet;
                        }
                        
                    }

                    var sedeCorsoTitoloParagraph = new iTextSharp.text.Paragraph(sedeCorsoTitolo, sediFont)
                    {
                        Alignment = Element.ALIGN_CENTER
                    };
                    document.Add(sedeCorsoTitoloParagraph);
                }
               
                else // Sede teorica e pratica.
                {
                    // Sedi teoriche.

                    var sedeThParagraph = new iTextSharp.text.Paragraph(sedeTeoricaTitolo, sediFont)
                    {
                        Alignment = Element.ALIGN_CENTER
                    };
                    document.Add(sedeThParagraph);

                    string sedeTeoricaDescrizione = "";

                    if (_sedeTeorica == PRAEVENIO)
                    {
                        sedeTeoricaDescrizione = "Praevenio SRLS";
                    }

                    if (_sedeTeorica == ELEARNING)
                    {
                        sedeTeoricaDescrizione = "Corso svolto in modalita' e-learning e realizzato in conformita' allo standard internazionale SCORM (Shereable Content Object Reference Model) come definito dall'Allegato II all'Accordo Stato Regioni del 07/07/2016";
                    }

                    if (_sedeTeorica == VIDEOCONFERENZA)
                    {
                        sedeTeoricaDescrizione = "Corso svolto in modalità di videoconferenza sincrona";
                    }

                    if (_sedeTeorica == ALTRO)
                    {
                        sedeTeoricaDescrizione = this._indicareSedeTeorica;
                    }

                    if (_sedeTeorica == SEDE_CLIENTE)
                    {
                        sedeTeoricaDescrizione = this._indirizzoDue;
                    }

                    var sedeTeoricaDescParagraph = new iTextSharp.text.Paragraph(sedeTeoricaDescrizione, sediFont)
                    {
                        Alignment = Element.ALIGN_CENTER
                    };
                    document.Add(sedeTeoricaDescParagraph);

                    // Sedi pratiche.

                    var sedePrParagraph = new iTextSharp.text.Paragraph(sedePraticaTitolo, sediFont)
                    {
                        Alignment = Element.ALIGN_CENTER
                    };
                    document.Add(sedePrParagraph);

                    string sedePraticaDescrizione = "";

                    if (_sedePratica == PRAEVENIO)
                    {
                        sedePraticaDescrizione = "Praevenio SRLS";
                    }

                    if (_sedePratica == ELEARNING)
                    {
                        sedePraticaDescrizione = "Corso svolto in modalita' e-learning e realizzato in conformita' allo standard internazionale SCORM (Shereable Content Object Reference Model) come definito dall'Allegato II all'Accordo Stato Regioni del 07/07/2016";
                    }

                    if (_sedePratica == VIDEOCONFERENZA)
                    {
                        sedePraticaDescrizione = "Corso svolto in modalità di videoconferenza sincrona";
                    }

                    if (_sedePratica == ALTRO)
                    {
                        sedePraticaDescrizione = this._indicareSedePratica;
                    }

                    if (_sedePratica == SEDE_CLIENTE)
                    {
                        sedePraticaDescrizione = this._indirizzoTre;
                    }

                    var sedePraticaDescParagraph = new iTextSharp.text.Paragraph(sedePraticaDescrizione, sediFont)
                    {
                        Alignment = Element.ALIGN_CENTER
                    };
                    document.Add(sedePraticaDescParagraph);
                }

                document.Close();

                return memoryStream.ToArray();
            }
        }

    }
}
