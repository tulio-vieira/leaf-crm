namespace LogosAPI.Services
{
    public static class EmailTemplates
    {
        private static string Layout(string title, string bodyContent) => $$"""
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>{{title}}</title>
              <style>
                body { margin: 0; padding: 0; background-color: #f4f4f7; font-family: Arial, sans-serif; color: #333; }
                .wrapper { width: 100%; padding: 40px 0; }
                .container { max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
                .header { background-color: #1a1a2e; padding: 28px 40px; text-align: center; }
                .header h1 { margin: 0; color: #ffffff; font-size: 26px; letter-spacing: 2px; }
                .body { padding: 36px 40px; }
                .body p { font-size: 15px; line-height: 1.6; margin: 0 0 16px; }
                .btn { display: inline-block; margin-top: 8px; padding: 14px 28px; background-color: #1a1a2e; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-size: 15px; font-weight: bold; }
                .footer { background-color: #f4f4f7; padding: 20px 40px; text-align: center; }
                .footer p { margin: 0; font-size: 12px; color: #888; line-height: 1.5; }
              </style>
            </head>
            <body>
              <div class="wrapper">
                <div class="container">
                  <div class="header">
                    <h1>LOGOS</h1>
                  </div>
                  <div class="body">
                    {{bodyContent}}
                  </div>
                  <div class="footer">
                    <p>Você recebeu este e-mail porque uma ação foi solicitada na plataforma Logos.<br />Se você não realizou esta ação, pode ignorar esta mensagem com segurança.</p>
                  </div>
                </div>
              </div>
            </body>
            </html>
            """;

        public static string AccountCreated(string validateUrl) => Layout(
            "Validação de E-mail — Logos",
            $"""
            <p>Olá,</p>
            <p>Sua conta na plataforma <strong>Logos</strong> foi criada com sucesso.</p>
            <p>Para ativar sua conta, clique no botão abaixo para validar o seu e-mail:</p>
            <p><a class="btn" href="{validateUrl}">Validar E-mail</a></p>
            <p>Se o botão não funcionar, copie e cole o link abaixo no seu navegador:</p>
            <p style="word-break: break-all; font-size: 13px; color: #555;">{validateUrl}</p>
            <p>Este link é válido por tempo limitado.</p>
            """
        );

        public static string PasswordResetRequest(string resetUrl) => Layout(
            "Redefinição de Senha — Logos",
            $"""
            <p>Olá,</p>
            <p>Recebemos uma solicitação para redefinir a senha da sua conta na plataforma <strong>Logos</strong>.</p>
            <p>Clique no botão abaixo para criar uma nova senha:</p>
            <p><a class="btn" href="{resetUrl}">Redefinir Senha</a></p>
            <p>Se o botão não funcionar, copie e cole o link abaixo no seu navegador:</p>
            <p style="word-break: break-all; font-size: 13px; color: #555;">{resetUrl}</p>
            <p>Este link é válido por tempo limitado. Se você não solicitou a redefinição de senha, ignore este e-mail.</p>
            """
        );

        public static string ProviderNotification(string notificationMessage) => Layout(
            "Nova Notificação — Logos",
            $"""
            <p>Olá,</p>
            <p>Você recebeu uma nova notificação na plataforma <strong>Logos</strong>:</p>
            <p>{notificationMessage}</p>
            """
        );
    }
}
