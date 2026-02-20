namespace BlazorPortal.Models
{
    public sealed class PermessiUtente
    {
        public Guid? ClienteId { get; set; }   // riferimento azienda (new_cliente / _new_cliente_value)

        public bool Sedi { get; set; }         // cr4f9_sede
        public bool Lavoratori { get; set; }   // new_lavoratori
        public bool Dpi { get; set; }          // cr4f9_dpi
        public bool Formazione { get; set; }   // cr4f9_formazione
        public bool Cliente { get; set; }      // cr4f9_cliente
        public bool ImpiantiMacchinari { get; set; } // cr4f9_impiantiemacchinari
    }

}
