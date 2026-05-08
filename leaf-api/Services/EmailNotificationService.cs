using System.Net.Http.Headers;
using System.Text;
using LogosAPI.Interfaces;

namespace LogosAPI.Services
{
    public class EmailNotificationService(
        IHttpClientFactory httpClientFactory,
        ILogger<EmailNotificationService> logger,
        IConfiguration config
        ) : INotificationService
    {
        private string ApiKey => config.GetValue<string>("MailGunOptions:ApiKey") ?? throw new InvalidOperationException("MailGunOptions:ApiKey is not configured.");
        private string Domain => config.GetValue<string>("MailGunOptions:Domain") ?? throw new InvalidOperationException("MailGunOptions:Domain is not configured.");
        private string FromEmail => config.GetValue<string>("MailGunOptions:FromEmail") ?? "noreply@logos.com";
        private string FromName => config.GetValue<string>("MailGunOptions:FromName") ?? "Logos";
        private string AdminEmail => config.GetValue<string>("MailGunOptions:AdminEmail") ?? throw new InvalidOperationException("MailGunOptions:AdminEmail is not configured.");
        private string FrontendUrl => config.GetValue<string>("FrontendUrl") ?? throw new InvalidOperationException("FrontendUrl is not configured.");

        public async Task NotifiyAccountCreated(string email, string token)
        {
            var validateUrl = $"{FrontendUrl}/auth/validate-email?token={token}";
            var html = EmailTemplates.AccountCreated(validateUrl);
            await SendEmailAsync(email, "Validação de E-mail — Logos", html);
        }

        public async Task NotifyPasswordResetRequest(string email, string token)
        {
            var resetUrl = $"{FrontendUrl}/auth/reset-password?token={token}&email={email}";
            var html = EmailTemplates.PasswordResetRequest(resetUrl);
            await SendEmailAsync(email, "Redefinição de Senha — Logos", html);
        }

        public async Task SendMessage(string message)
        {
            var html = $"<p>{message}</p>";
            await SendEmailAsync(AdminEmail, "Mensagem do Sistema — Logos", html);
        }

        public async Task NotifyProviderNotification(string email, string notificationMessage)
        {
            var html = EmailTemplates.ProviderNotification(notificationMessage);
            await SendEmailAsync(email, "Nova Notificação — Logos", html);
        }

        private async Task SendEmailAsync(string to, string subject, string html)
        {
            var client = httpClientFactory.CreateClient("mailgun");

            var credentials = Convert.ToBase64String(Encoding.ASCII.GetBytes($"api:{ApiKey}"));
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", credentials);

            var form = new MultipartFormDataContent
            {
                { new StringContent($"{FromName} <{FromEmail}>"), "from" },
                { new StringContent(to), "to" },
                { new StringContent(subject), "subject" },
                { new StringContent(html, Encoding.UTF8, "text/html"), "html" },
            };

            var response = await client.PostAsync($"https://api.mailgun.net/v3/{Domain}/messages", form);

            if (response.IsSuccessStatusCode)
            {
                logger.LogInformation("[email: {To}] E-mail enviado com sucesso. Assunto: {Subject}", to, subject);
            }
            else
            {
                var responseBody = await response.Content.ReadAsStringAsync();
                logger.LogError("[email: {To}] Falha ao enviar e-mail. Assunto: {Subject}. Status: {Status}. Resposta: {Body}",
                    to, subject, (int)response.StatusCode, responseBody);
            }
        }
    }
}
