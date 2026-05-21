using Microsoft.AspNetCore.Mvc;
using DigitalGradebook.Repository;

namespace DigitalGradebook.WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatController : ControllerBase
    {
        private readonly ChatRepository _chatRepository;

        public ChatController(ChatRepository chatRepository)
        {
            _chatRepository = chatRepository;
        }

        [HttpGet("{roomId}")]
        public async Task<IActionResult> GetHistory(string roomId)
        {
            var messages = await _chatRepository.GetMessagesAsync(roomId);
            return Ok(messages);
        }
    }
}