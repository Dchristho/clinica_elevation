document.addEventListener("DOMContentLoaded", () => {
    // Encontra todos os botões e links relacionados a agendamento
    const agendaButtons = document.querySelectorAll(
        'a[href*="#agendamento"], ' +
        'a[href*="wa.me"], ' +
        '.btn-schedule, ' +
        '.btn-contact-glow, ' +
        '.btn-secondary, ' +
        '.btn-cta'
    );

    // Adiciona a classe de animação CTA a todos eles
    agendaButtons.forEach(btn => {
        // Verifica se o texto do botão contém palavras chave de agendamento para evitar aplicar em links de whatsapp não relacionados, embora a maioria seja
        const text = btn.innerText.toLowerCase();
        if (text.includes('agendar') || text.includes('agenda') || btn.classList.contains('btn-schedule') || btn.classList.contains('btn-contact-glow') || btn.classList.contains('btn-cta')) {
            btn.classList.add('btn-cta-animated');
        }
    });
});
