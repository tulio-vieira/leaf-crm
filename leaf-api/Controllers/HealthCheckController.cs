using Microsoft.AspNetCore.Mvc;


namespace JwtAuthDotNet9.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HealthController: ControllerBase
    {
        [HttpGet]
        public IActionResult HealthCheck()
        {
            return Ok("healthy");
        }
    }
}
