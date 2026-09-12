// ===================================================================================
// CLÍNICA ELEVATION - SISTEMA DE AGENDAMENTO AUTOMATIZADO COM E-MAIL LUXO
// ===================================================================================

// 1. Recebe os dados do site e grava como "Pendente"
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    sheet.appendRow([
      new Date(),
      data.nome,
      data.email,
      data.telefone,
      data.procedimento,
      data.data,
      data.horario,
      "Pendente" // O agendamento entra aguardando sua aprovação
    ]);

    return ContentService.createTextOutput(JSON.stringify({"status": "success"}))
      .setMimeType(ContentService.MimeType.JSON);

  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// 2. Formatadores para evitar que Data e Horário fiquem com texto longo do JavaScript
function formatarData(valor) {
  if (!valor) return '';
  if (valor instanceof Date) {
    return Utilities.formatDate(valor, "GMT-0300", "dd/MM/yyyy");
  }
  var str = valor.toString().trim();
  if (str.indexOf('-') !== -1) {
    var partes = str.split('-');
    if (partes.length === 3) {
      return partes[2].substring(0, 2) + '/' + partes[1] + '/' + partes[0];
    }
  }
  return str;
}

function formatarHorario(valor) {
  if (!valor) return '';
  if (valor instanceof Date) {
    return Utilities.formatDate(valor, "GMT-0300", "HH:mm");
  }
  return valor.toString().trim();
}

// 3. Monitora quando VOCÊ altera a coluna Status para "Confirmado"
function onEdit(e) {
  var range = e.range;
  var sheet = range.getSheet();
  var col = range.getColumn();
  var row = range.getRow();
  var valorDigitado = range.getValue();

  // Coluna 8 é a Coluna H (Status) e ignora a linha do cabeçalho (linha 1)
  if (col === 8 && row > 1 && valorDigitado.toString().trim().toLowerCase() === "confirmado") {
    
    // Captura os dados daquela linha específica
    var nomeCliente = sheet.getRange(row, 2).getValue();
    var emailCliente = sheet.getRange(row, 3).getValue();
    var telefoneCliente = sheet.getRange(row, 4).getValue();
    var procedimento = sheet.getRange(row, 5).getValue();
    var dataRaw = sheet.getRange(row, 6).getValue();
    var horaRaw = sheet.getRange(row, 7).getValue();

    // Formatação limpa de Data e Horário
    var dataConsulta = formatarData(dataRaw);
    var horaConsulta = formatarHorario(horaRaw);

    // Envia o e-mail de confirmação luxuoso para o cliente
    if (emailCliente) {
      var assunto = "✦ Agendamento Confirmado - Clínica Elevation";
      
      var htmlCorpo = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Agendamento Confirmado - Clínica Elevation</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0E0E10; font-family: 'Montserrat', 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #2A2A2A;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0E0E10; padding: 40px 10px;">
    <tr>
      <td align="center">
        <!-- Container Principal -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4); border: 1px solid rgba(212, 175, 55, 0.25);">
          
          <!-- Header Sofisticado / Logo -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #111113 0%, #1A1A1E 100%); padding: 45px 30px 35px 30px; border-bottom: 2px solid #C5A059;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center">
                    <!-- Selo Monograma Dourado / Ícone -->
                    <div style="display: inline-block; width: 46px; height: 46px; line-height: 46px; border-radius: 50%; border: 1px solid #D4AF37; background: rgba(212, 175, 55, 0.08); color: #D4AF37; font-size: 20px; text-align: center; margin-bottom: 12px;">
                      ✦
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <h1 style="margin: 0; color: #F4EAD4; font-size: 24px; font-weight: 300; letter-spacing: 4px; text-transform: uppercase; font-family: 'Playfair Display', Georgia, serif;">
                      CLÍNICA ELEVATION
                    </h1>
                    <p style="margin: 6px 0 0 0; color: #C5A059; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; font-weight: 500;">
                      Estética Avançada & Sofisticação
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Tag de Confirmação VIP -->
          <tr>
            <td align="center" style="padding: 28px 30px 10px 30px;">
              <div style="display: inline-block; padding: 6px 18px; background-color: #FAF6EF; border: 1px solid #E6D5B8; border-radius: 30px; color: #9E7D3B; font-size: 11px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase;">
                ✓ Horário Confirmado
              </div>
            </td>
          </tr>

          <!-- Corpo da Mensagem -->
          <tr>
            <td style="padding: 15px 35px 30px 35px; text-align: center;">
              <h2 style="margin: 0 0 12px 0; color: #1A1A1A; font-size: 22px; font-weight: 400; font-family: 'Playfair Display', Georgia, serif;">
                Olá, <span style="color: #9E7D3B; font-weight: 600;">${nomeCliente}</span>
              </h2>
              <p style="margin: 0 0 25px 0; color: #555555; font-size: 14px; line-height: 1.7; font-weight: 300;">
                Temos o prazer de confirmar o seu atendimento na <strong>Clínica Elevation</strong>. Preparamos uma experiência exclusiva, com toda a dedicação e cuidado que você merece.
              </p>

              <!-- Card de Detalhes do Agendamento -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #FAF8F5; border-radius: 12px; border: 1px solid #EBE4D8; margin-bottom: 25px; text-align: left;">
                <tr>
                  <td style="padding: 22px 25px;">
                    
                    <!-- Linha: Procedimento -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 14px; border-bottom: 1px solid #EFEAE1; padding-bottom: 12px;">
                      <tr>
                        <td width="30" valign="top" style="font-size: 16px; color: #C5A059;">✦</td>
                        <td>
                          <span style="font-size: 11px; color: #888888; text-transform: uppercase; letter-spacing: 1px; display: block;">Procedimento</span>
                          <strong style="font-size: 15px; color: #1E1E1E;">${procedimento}</strong>
                        </td>
                      </tr>
                    </table>

                    <!-- Linha: Data & Horário -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td width="50%" valign="top">
                          <span style="font-size: 11px; color: #888888; text-transform: uppercase; letter-spacing: 1px; display: block;">Data Marcada</span>
                          <strong style="font-size: 15px; color: #1E1E1E;">📅 ${dataConsulta}</strong>
                        </td>
                        <td width="50%" valign="top">
                          <span style="font-size: 11px; color: #888888; text-transform: uppercase; letter-spacing: 1px; display: block;">Horário</span>
                          <strong style="font-size: 15px; color: #1E1E1E;">⏰ ${horaConsulta}</strong>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>

              <!-- Dica / Orientação -->
              <p style="margin: 0 0 25px 0; font-size: 12px; color: #777777; line-height: 1.6; background: #FFF9F0; padding: 12px 18px; border-radius: 8px; border-left: 3px solid #C5A059; text-align: left;">
                ℹ️ <strong>Recomendação:</strong> Solicitamos a gentileza de chegar com <strong>10 minutos de antecedência</strong> para desfrutar com calma do nosso espaço.
              </p>

              <!-- Botão Elegante WhatsApp -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 0 auto 10px auto;">
                <tr>
                  <td align="center" style="border-radius: 8px; background: linear-gradient(135deg, #C5A059 0%, #9E7D3B 100%);">
                    <a href="https://wa.me/5511999999999" target="_blank" style="display: inline-block; padding: 14px 28px; color: #FFFFFF; font-size: 13px; font-weight: 600; text-decoration: none; letter-spacing: 1px; text-transform: uppercase; border-radius: 8px;">
                      Dúvidas ou Reagendamento via WhatsApp
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer Luxury -->
          <tr>
            <td align="center" style="background-color: #111113; padding: 25px 30px; border-top: 1px solid rgba(212, 175, 55, 0.2);">
              <p style="margin: 0 0 6px 0; color: #D4AF37; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; font-family: 'Playfair Display', Georgia, serif;">
                Clínica Elevation
              </p>
              <p style="margin: 0; color: #777779; font-size: 11px; line-height: 1.5;">
                Onde a sofisticação encontra o cuidado profissional.<br>
                Este é um e-mail automático de confirmação.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `;

      MailApp.sendEmail({
        to: emailCliente,
        subject: assunto,
        htmlBody: htmlCorpo
      });

      // Atualiza o status na planilha para avisar que o e-mail já foi enviado
      sheet.getRange(row, 8).setValue("Confirmado e Enviado");
    }
  }
}
