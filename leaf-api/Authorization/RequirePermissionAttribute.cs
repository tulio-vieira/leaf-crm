using WebAPI.Errors;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Management.Automation;

namespace WebAPI.Authorization
{

    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class)]
    public class RequirePermission : Attribute, IAuthorizationFilter
    {
        protected string permission;

        public RequirePermission(string permission)
        {
            this.permission = permission;
        }

        public virtual void OnAuthorization(AuthorizationFilterContext context)
        {
            var user = context.HttpContext.User;
            if (user?.Identity?.IsAuthenticated != true)
                throw new UnauthorizedException();

            var userPermissions = user.Claims
                .Where(c => c.Type == "permission")
                .Select(c => c.Value);

            foreach (var perm in userPermissions)
            {
                var pattern = new WildcardPattern(perm, WildcardOptions.IgnoreCase);
                if (pattern.IsMatch(permission))
                {
                    return;
                }
            }

            throw new ForbiddenException($"Permissão necessária ausente: {permission}");
        }
    }

    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class)]
    public class RequireProviderPermission(string permissionSuffix) : RequirePermission("")
    {
        public override void OnAuthorization(AuthorizationFilterContext context)
        {
            var providerSlugParam = "providerSlug";
            var providerSlug = "";

            // Try route values first
            if (context.HttpContext.Request.RouteValues.TryGetValue(providerSlugParam, out var routeValue)
                && routeValue is string routeStr
                && !string.IsNullOrEmpty(routeStr))
            {
                providerSlug = routeStr;
            }

            // Try query string
            if (context.HttpContext.Request.Query.TryGetValue(providerSlugParam, out var queryValue)
                && !string.IsNullOrEmpty(queryValue))
            {
                providerSlug = queryValue.ToString();
            }

            permission = "providers{" + providerSlug + "}" + permissionSuffix;

            base.OnAuthorization(context);
        }
    }
}
