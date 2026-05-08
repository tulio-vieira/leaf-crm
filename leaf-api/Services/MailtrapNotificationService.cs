using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using WebAPI.Interfaces;

namespace WebAPI.Services
{
    public class MailtrapNotificationService(
        IHttpClientFactory httpClientFactory,
        ILogger<MailtrapNotificationService> logger,
        IConfiguration config
        ) : INotificationService
    {
        private string ApiKey => config.GetValue<string>("MailtrapOptions:ApiKey") ?? throw new InvalidOperationException("MailtrapOptions:ApiKey is not configured.");
        private string FromEmail => config.GetValue<string>("MailtrapOptions:FromEmail") ?? "noreply@Leaf.com";
        private string FromName => config.GetValue<string>("MailtrapOptions:FromName") ?? "Leaf";
        private string AdminEmail => config.GetValue<string>("MailtrapOptions:AdminEmail") ?? throw new InvalidOperationException("MailtrapOptions:AdminEmail is not configured.");
        private string FrontendUrl => config.GetValue<string>("FrontendUrl") ?? throw new InvalidOperationException("FrontendUrl is not configured.");

        public async Task NotifiyAccountCreated(string email, string token)
        {
            var validateUrl = $"{FrontendUrl}/auth/validate-email?token={token}";
            var html = EmailTemplates.AccountCreated(validateUrl);
            await SendEmailAsync(email, "Validação de E-mail — Leaf", html);
        }

        public async Task NotifyPasswordResetRequest(string email, string token)
        {
            var resetUrl = $"{FrontendUrl}/auth/reset-password?token={token}&email={email}";
            var html = EmailTemplates.PasswordResetRequest(resetUrl);
            await SendEmailAsync(email, "Redefinição de Senha — Leaf", html);
        }

        public async Task SendMessage(string message)
        {
            var html = $"<p>{message}</p>";
            await SendEmailAsync(AdminEmail, "Mensagem do Sistema — Leaf", html);
        }

        public async Task NotifyProviderNotification(string email, string notificationMessage)
        {
            var html = EmailTemplates.ProviderNotification(notificationMessage);
            await SendEmailAsync(email, "Nova Notificação — Leaf", html);
        }

        private async Task SendEmailAsync(string to, string subject, string html)
        {
            var client = httpClientFactory.CreateClient("mailtrap");
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", ApiKey);

            var body = JsonSerializer.Serialize(new
            {
                from = new { email = FromEmail, name = FromName },
                to = new[] { new { email = to } },
                subject,
                html
            });

            var content = new StringContent(body, Encoding.UTF8, "application/json");
            var response = await client.PostAsync("https://send.api.mailtrap.io/api/send", content);

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
