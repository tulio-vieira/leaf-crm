using Hangfire;
using Hangfire.PostgreSql;
using WebAPI.Configuration;
using WebAPI.Data;
using WebAPI.Errors;
using WebAPI.Interfaces;
using WebAPI.Jobs;
using WebAPI.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using System.Text;

namespace LogosAPI
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add logging
            builder.Logging.ClearProviders();
            if (builder.Environment.IsDevelopment())
            {
                builder.Logging.AddConsole();
            } else
            {
                builder.Logging.AddJsonConsole();
            }

            // add configuration options
            builder.Services.Configure<JWTOptions>(
                    builder.Configuration.GetRequiredSection(nameof(JWTOptions)));
            builder.Services.Configure<PaginationOptions>(
                builder.Configuration.GetRequiredSection(nameof(PaginationOptions)));

            var siteUrl = builder.Configuration.GetRequiredValue("SiteUrl");
            var frontendUrl = builder.Configuration.GetRequiredValue("FrontendUrl");

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("MyCorsPolicy",
                    policy =>
                    {
                        policy.WithOrigins(siteUrl, frontendUrl, "localhost")
                            .AllowAnyMethod()
                            .AllowCredentials()
                            .AllowAnyHeader();
                    });
            });

            var dbConnectrionString = builder.Configuration.GetConnectionString("DefaultConnection");

            builder.Services.AddControllers();
                //.AddJsonOptions(options =>
                //    options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles);

            // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
            builder.Services.AddOpenApi();

            builder.Services.AddDbContext<DataContext>(options =>
                options.UseNpgsql(dbConnectrionString));

            builder.Services.AddHangfire(config =>
                config
                    .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
                    .UseSimpleAssemblyNameTypeSerializer()
                    .UseRecommendedSerializerSettings()
                    .UsePostgreSqlStorage(c => c.UseNpgsqlConnection(dbConnectrionString)));
            builder.Services.AddHangfireServer();
            builder.Services.AddScoped<InsuranceAuthExpiredJob>();
            builder.Services.AddScoped<InsuranceAuthAboutToExpireJob>();
            builder.Services.AddScoped<SendProviderNotificationsJob>();

            var jwtSettings = builder.Configuration.GetSection(nameof(JWTOptions)).Get<JWTOptions>()!;
            
            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidIssuer = jwtSettings.Issuer,
                        ValidateAudience = true,
                        ValidAudience = jwtSettings.Audience,
                        ValidateLifetime = true,
                        IssuerSigningKey = new SymmetricSecurityKey(
                            Encoding.UTF8.GetBytes(jwtSettings.SigningKey)),
                        ValidateIssuerSigningKey = true,
                        ClockSkew = TimeSpan.Zero
                    };
                    options.Events = new JwtBearerEvents
                    {
                        OnMessageReceived = context =>
                        {
                            if (context.Request.Cookies.TryGetValue("access_token", out var cookieToken)
                                && !string.IsNullOrEmpty(cookieToken))
                            {
                                context.Token = cookieToken;
                            }
                            return Task.CompletedTask;
                        }
                    };
                });

            builder.Services.AddScoped<AuthService>();
            builder.Services.AddHttpClient("mailgun");
            builder.Services.AddHttpClient("mailtrap");
            var emailService = builder.Configuration.GetValue<string>("EmailService");
            builder.Services.AddScoped<INotificationService>(emailService switch
            {
                "mailgun"  => sp => ActivatorUtilities.CreateInstance<EmailNotificationService>(sp),
                "mailtrap" => sp => ActivatorUtilities.CreateInstance<MailtrapNotificationService>(sp),
                _          => sp => ActivatorUtilities.CreateInstance<NotificationLoggerService>(sp),
            });

            builder.Services.AddExceptionHandler<ProblemExceptionHandler>();
            builder.Services.AddProblemDetails();

            builder.Services.AddScoped<DataSeeder>();

            var app = builder.Build();

            app.UseMiddleware<ErrorLoggingMiddleware>();
            app.UseExceptionHandler();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
                app.MapScalarApiReference();
            }

            // app.UseHttpsRedirection();

            // Does cors need to be before auth?
            app.UseCors("MyCorsPolicy");

            app.UseAuthorization();

            app.UseHangfireDashboard("/hangfire");

            RecurringJob.AddOrUpdate<InsuranceAuthExpiredJob>(
                "insurance-auth-expired",
                job => job.ExecuteAsync(),
                "0 9 * * *");
            RecurringJob.AddOrUpdate<InsuranceAuthAboutToExpireJob>(
                "insurance-auth-about-to-expire",
                job => job.ExecuteAsync(),
                "0 9 * * *");
            RecurringJob.AddOrUpdate<SendProviderNotificationsJob>(
                "send-provider-notifications",
                job => job.ExecuteAsync(),
                "12 9 * * *");

            app.MapControllers();

            if (app.Environment.IsDevelopment())
            {
                using (var scope = app.Services.CreateScope())
                {
                    var seeder = scope.ServiceProvider.GetRequiredService<DataSeeder>();
                    await seeder.SeedAsync();
                }
            }

            app.Run();
        }
    }

    public static class ServiceCollectionExtensions
    {
        public static string GetRequiredValue(this IConfiguration configuration, string key) =>
            configuration[key] ?? throw new InvalidOperationException($"Configuration key '{key}' is null.");
    }
}
