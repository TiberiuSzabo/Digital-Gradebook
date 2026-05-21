using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace DigitalGradebook.Domain.Entities
{
    public class ChatMessage
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        public string RoomId { get; set; } = null!; // Aici vom folosi ID-ul elevului pe post de "cameră de chat"
        public string SenderName { get; set; } = null!; // Numele celui care trimite (ex: "Prof. Popescu" sau "Părinte")
        public string Text { get; set; } = null!;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        public string Visibility { get; set; } = "All";
    }
}