using AutoMapper;
using EMS.API.Data;
using EMS.API.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SectorsController : ControllerBase
    {
        private readonly EMSContext _context;
        private readonly IMapper _mapper;

        public SectorsController(EMSContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // GET: api/sectors
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SectorResponseDTO>>> GetSectors()
        {
            var sectors = await _context.Sectors.ToListAsync();
            return Ok(_mapper.Map<List<SectorResponseDTO>>(sectors));
        }
    }
}