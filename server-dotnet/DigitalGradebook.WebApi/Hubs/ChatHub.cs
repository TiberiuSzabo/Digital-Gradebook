using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using DigitalGradebook.Domain.Entities;
using DigitalGradebook.Repository;

namespace DigitalGradebook.WebApi.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly ChatRepository _chatRepository;

        public ChatHub(ChatRepository chatRepository)
        {
            _chatRepository = chatRepository;
        }

        public async Task JoinRoom(string roomId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, roomId);
        }

        public async Task SendMessage(string roomId, string senderName, string text, string visibility)
        {
            var message = new ChatMessage
            {
                RoomId = roomId,
                SenderName = senderName,
                Text = text,
                Timestamp = DateTime.UtcNow,
                Visibility = visibility 
            };

            await _chatRepository.CreateAsync(message);
            await Clients.Group(roomId).SendAsync("ReceiveMessage", message);
        }
    }
}