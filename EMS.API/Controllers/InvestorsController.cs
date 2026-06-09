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
    public class InvestorsController : ControllerBase
    {
        private readonly EMSContext _context;
        private readonly IMapper _mapper;

        public InvestorsController(EMSContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // GET: api/investors
        [HttpGet]
        public async Task<ActionResult<IEnumerable<InvestorResponseDTO>>> GetInvestors()
        {
            var investors = await _context.Investors
                .Include(i => i.InvestorSectors)
                    .ThenInclude(s => s.Sector)
                .ToListAsync();

            return Ok(_mapper.Map<List<InvestorResponseDTO>>(investors));
        }

        // GET: api/investors/5
        [HttpGet("{id}")]
        public async Task<ActionResult<InvestorResponseDTO>> GetInvestor(int id)
        {
            var investor = await _context.Investors
                .Include(i => i.InvestorSectors)
                    .ThenInclude(s => s.Sector)
                .FirstOrDefaultAsync(i => i.InvestorID == id);

            if (investor == null) return NotFound();

            return Ok(_mapper.Map<InvestorResponseDTO>(investor));
        }

        // POST: api/investors
        [HttpPost]
        public async Task<ActionResult<InvestorResponseDTO>> CreateInvestor(CreateInvestorDTO dto)
        {
            var investor = new Investor
            {
                Name = dto.Name,
                Mobile = dto.Mobile
            };

            _context.Investors.Add(investor);
            await _context.SaveChangesAsync();

            foreach (var sectorDTO in dto.InvestorSectors)
            {
                var sector = await _context.Sectors.FindAsync(sectorDTO.SectorID);
                if (sector == null) return NotFound($"Sector {sectorDTO.SectorID} not found");

                var investorSector = new InvestorSector
                {
                    InvestorID = investor.InvestorID,
                    SectorID = sectorDTO.SectorID,
                    TimeFrom = sectorDTO.TimeFrom,
                    TimeTo = sectorDTO.TimeTo
                };

                _context.InvestorSectors.Add(investorSector);
            }

            await _context.SaveChangesAsync();

            var result = await _context.Investors
                .Include(i => i.InvestorSectors)
                    .ThenInclude(s => s.Sector)
                .FirstOrDefaultAsync(i => i.InvestorID == investor.InvestorID);

            return CreatedAtAction(nameof(GetInvestor),
                new { id = investor.InvestorID },
                _mapper.Map<InvestorResponseDTO>(result));
        }

        // POST: api/investors/5/sectors
        [HttpPost("{id}/sectors")]
        public async Task<ActionResult> AddSector(int id, CreateInvestorSectorDTO dto)
        {
            var investor = await _context.Investors.FindAsync(id);
            if (investor == null) return NotFound("Investor not found");

            var sector = await _context.Sectors.FindAsync(dto.SectorID);
            if (sector == null) return NotFound("Sector not found");

            var investorSector = new InvestorSector
            {
                InvestorID = id,
                SectorID = dto.SectorID,
                TimeFrom = dto.TimeFrom,
                TimeTo = dto.TimeTo
            };

            _context.InvestorSectors.Add(investorSector);
            await _context.SaveChangesAsync();

            return Ok();
        }

        // DELETE: api/investors/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteInvestor(int id)
        {
            var investor = await _context.Investors.FindAsync(id);
            if (investor == null) return NotFound();

            _context.Investors.Remove(investor);
            await _context.SaveChangesAsync();

            return NoContent();
        }



        // PUT: api/investors/5
        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateInvestor(int id, CreateInvestorDTO dto)
        {
            var investor = await _context.Investors
                .Include(i => i.InvestorSectors)
                .FirstOrDefaultAsync(i => i.InvestorID == id);
            if (investor == null) return NotFound();

            investor.Name = dto.Name;
            investor.Mobile = dto.Mobile;

            // Remove existing sectors and replace with new ones
            _context.InvestorSectors.RemoveRange(investor.InvestorSectors);

            foreach (var sectorDTO in dto.InvestorSectors)
            {
                _context.InvestorSectors.Add(new InvestorSector
                {
                    InvestorID = id,
                    SectorID = sectorDTO.SectorID,
                    TimeFrom = sectorDTO.TimeFrom,
                    TimeTo = sectorDTO.TimeTo
                });
            }

            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}