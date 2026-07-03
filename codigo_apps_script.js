// ============================================================
// CÓDIGO PARA O GOOGLE APPS SCRIPT
// Cole este código em: Extensões > Apps Script > Código.gs
// ============================================================

function doPost(e) {
  try {
    // Detectar formato dos dados (formulário ou JSON)
    var data;

    if (e.parameter && e.parameter.nome) {
      // Dados vieram de um formulário HTML (application/x-www-form-urlencoded)
      data = e.parameter;
    } else if (e.postData && e.postData.contents) {
      // Dados vieram como JSON no body
      data = JSON.parse(e.postData.contents);
    } else {
      throw new Error("Nenhum dado recebido");
    }

    // Acessar a planilha ativa
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Adicionar linha com os dados
    sheet.appendRow([
      new Date(),                   // A: Timestamp
      data.nome || "",              // B: Nome
      data.email || "",             // C: Email
      data.telefone || "",          // D: Telefone
      data.servico || "",           // E: Serviço
      data.data || "",              // F: Data do Agendamento
      data.horario || "",           // G: Horário
      data.observacoes || ""        // H: Observações
    ]);

    // Enviar email de confirmação para o cliente
    if (data.email && data.email !== "" && data.email !== "undefined") {
      var subjectClient = "Confirmação de Agendamento - Clínica Elevation";
      var bodyClient = "Olá " + data.nome + ",\n\n" +
                       "Recebemos seu pedido de agendamento!\n\n" +
                       "Serviço: " + data.servico + "\n" +
                       "Data: " + data.data + "\n" +
                       "Horário: " + data.horario + "\n\n" +
                       "Entraremos em contato em breve para confirmar.\n\n" +
                       "Obrigado(a)!\nClínica Elevation";

      MailApp.sendEmail(data.email, subjectClient, bodyClient);
    }

    // Enviar notificação para o dono da planilha
    var emailSalao = Session.getActiveUser().getEmail();
    if (emailSalao) {
      var subjectAdmin = "Novo Agendamento: " + data.nome;
      var bodyAdmin = "Novo agendamento recebido no site:\n\n" +
                      "Nome: " + data.nome + "\n" +
                      "Email: " + data.email + "\n" +
                      "Telefone: " + data.telefone + "\n" +
                      "Serviço: " + data.servico + "\n" +
                      "Data: " + data.data + "\n" +
                      "Horário: " + data.horario + "\n" +
                      "Observações: " + data.observacoes;

      MailApp.sendEmail(emailSalao, subjectAdmin, bodyAdmin);
    }

    // Retornar resposta
    return ContentService.createTextOutput(JSON.stringify({"result":"success"}))
      .setMimeType(ContentService.MimeType.JSON);

  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({"result":"error", "error": error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("Script ativo e funcionando!");
}
