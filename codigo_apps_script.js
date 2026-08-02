// ============================================================
// CÓDIGO CORRIGIDO PARA O REALTIME DATABASE + WHATSAPP
// ============================================================

const formAgendamento = document.querySelector('#seu-formulario');

if (formAgendamento) {
    formAgendamento.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Captura os dados digitados pelos IDs dos inputs
        const nomeCliente = document.querySelector('#nome').value;
        const telefoneCliente = document.querySelector('#telefone').value;
        const dataAgendamento = document.querySelector('#data').value;
        const procedimentoEscolhido = document.querySelector('#procedimento').value;

        try {
            // 1. Salva no Realtime Database (Nó: appointments)
            if (window.firebase && firebase.database) {
                const dbRef = firebase.database().ref('appointments');
                await dbRef.push({
                    name: nomeCliente,
                    whatsapp: telefoneCliente,
                    date: dataAgendamento,
                    procedure: procedimentoEscolhido,
                    createdAt: new Date().toISOString()
                });
            } else {
                throw new Error("Firebase não inicializado corretamente no HTML.");
            }

            // 2. Dispara a notificação via WhatsApp (CallMeBot)
            const meuNumero = "5511980272343";
            const apiKey = "6360757";
            
            const textoMensagem = `🚨 *Novo Agendamento na Clínica Elevation!*%0A%0A👤 *Cliente:* ${encodeURIComponent(nomeCliente)}%0A📞 *WhatsApp:* ${encodeURIComponent(telefoneCliente)}%0A📅 *Data:* ${encodeURIComponent(dataAgendamento)}%0A💉 *Procedimento:* ${encodeURIComponent(procedimentoEscolhido)}`;

            fetch(`https://api.callmebot.com/whatsapp.php?phone=${meuNumero}&text=${textoMensagem}&apikey=${apiKey}`, {
                mode: 'no-cors'
            });

            // 3. Sucesso para o cliente
            alert("Agendamento realizado com sucesso! Entraremos em contato.");
            formAgendamento.reset();

        } catch (error) {
            console.error("Erro ao agendar: ", error);
            alert("Ocorreu um erro ao agendar: " + error.message);
        }
    });
}