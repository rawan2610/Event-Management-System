using AutoMapper;
using EMS.API.Data;
using EMS.API.DTOs;
using EMS.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PresentersController : ControllerBase
    {
        private readonly EMSContext _context;
        private readonly IMapper _mapper;

        public PresentersController(EMSContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // GET: api/presenters
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PresenterResponseDTO>>> GetPresenters()
        {
            var presenters = await _context.Presenters
                .Include(p => p.PresenterSectors)
                    .ThenInclude(s => s.Sector)
                .ToListAsync();

            return Ok(_mapper.Map<List<PresenterResponseDTO>>(presenters));
        }

        // GET: api/presenters/5
        [HttpGet("{id}")]
        public async Task<ActionResult<PresenterResponseDTO>> GetPresenter(int id)
        {
            var presenter = await _context.Presenters
                .Include(p => p.PresenterSectors)
                    .ThenInclude(s => s.Sector)
                .FirstOrDefaultAsync(p => p.PresenterID == id);

            if (presenter == null) return NotFound();

            return Ok(_mapper.Map<PresenterResponseDTO>(presenter));
        }

        // POST: api/presenters
        [HttpPost]
        public async Task<ActionResult<PresenterResponseDTO>> CreatePresenter(CreatePresenterDTO dto)
        {
            var presenter = new Presenter
            {
                Name = dto.Name,
                Mobile = dto.Mobile
            };

            _context.Presenters.Add(presenter);
            await _context.SaveChangesAsync();

            foreach (var sectorDTO in dto.PresenterSectors)
            {
                var sector = await _context.Sectors.FindAsync(sectorDTO.SectorID);
                if (sector == null) return NotFound($"Sector {sectorDTO.SectorID} not found");

                var presenterSector = new PresenterSector
                {
                    PresenterID = presenter.PresenterID,
                    SectorID = sectorDTO.SectorID,
                    TimeFrom = sectorDTO.TimeFrom,
                    TimeTo = sectorDTO.TimeTo
                };

                _context.PresenterSectors.Add(presenterSector);
            }

            await _context.SaveChangesAsync();

            var result = await _context.Presenters
                .Include(p => p.PresenterSectors)
                    .ThenInclude(s => s.Sector)
                .FirstOrDefaultAsync(p => p.PresenterID == presenter.PresenterID);

            return CreatedAtAction(nameof(GetPresenter),
                new { id = presenter.PresenterID },
                _mapper.Map<PresenterResponseDTO>(result));
        }

        // POST: api/presenters/5/sectors
        [HttpPost("{id}/sectors")]
        public async Task<ActionResult> AddSector(int id, CreatePresenterSectorDTO dto)
        {
            var presenter = await _context.Presenters.FindAsync(id);
            if (presenter == null) return NotFound("Presenter not found");

            var sector = await _context.Sectors.FindAsync(dto.SectorID);
            if (sector == null) return NotFound("Sector not found");

            var presenterSector = new PresenterSector
            {
                PresenterID = id,
                SectorID = dto.SectorID,
                TimeFrom = dto.TimeFrom,
                TimeTo = dto.TimeTo
            };

            _context.PresenterSectors.Add(presenterSector);
            await _context.SaveChangesAsync();

            return Ok();
        }

        // DELETE: api/presenters/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePresenter(int id)
        {
            var presenter = await _context.Presenters.FindAsync(id);
            if (presenter == null) return NotFound();

            _context.Presenters.Remove(presenter);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}