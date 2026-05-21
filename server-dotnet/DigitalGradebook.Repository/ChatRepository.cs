using MongoDB.Driver;
using Microsoft.Extensions.Configuration;
using DigitalGradebook.Domain.Entities;

namespace DigitalGradebook.Repository
{
    public class ChatRepository
    {
        private readonly IMongoCollection<ChatMessage> _messages;

        public ChatRepository(IConfiguration config)
        {
            var mongoClient = new MongoClient(config["MongoDbSettings:ConnectionString"]);
            var mongoDatabase = mongoClient.GetDatabase(config["MongoDbSettings:DatabaseName"]);
            _messages = mongoDatabase.GetCollection<ChatMessage>("Messages");
        }

        public async Task<List<ChatMessage>> GetMessagesAsync(string roomId) =>
            await _messages.Find(m => m.RoomId == roomId).SortBy(m => m.Timestamp).ToListAsync();

        public async Task CreateAsync(ChatMessage newMessage) =>
            await _messages.InsertOneAsync(newMessage);
    }
}