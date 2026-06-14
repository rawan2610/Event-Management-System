using EMS.API.Data;
using EMS.API.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SettingsController : ControllerBase
    {
        private readonly EMSContext _context;

        public SettingsController(EMSContext context)
        {
            _context = context;
        }

        // GET: api/settings
        [HttpGet]
        public async Task<ActionResult> GetSettings()
        {
            var settings = await _context.Settings.ToListAsync();
            return Ok(settings);
        }

        // GET: api/settings/SlotDurationMinutes
        [HttpGet("{key}")]
        public async Task<ActionResult> GetSetting(string key)
        {
            var setting = await _context.Settings
                .FirstOrDefaultAsync(s => s.Key == key);
            if (setting == null) return NotFound();
            return Ok(setting);
        }

        // PUT: api/settings/SlotDurationMinutes
        [HttpPut("{key}")]
        public async Task<ActionResult> UpdateSetting(string key, UpdateSettingDTO dto)
        {
            var setting = await _context.Settings
                .FirstOrDefaultAsync(s => s.Key == key);
            if (setting == null) return NotFound();

            setting.Value = dto.Value;
            await _context.SaveChangesAsync();

            return Ok(setting);
        }
    }
}