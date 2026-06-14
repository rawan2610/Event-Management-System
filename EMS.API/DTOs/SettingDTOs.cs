namespace EMS.API.DTOs
{
    public class SettingResponseDTO
    {
        public int SettingID { get; set; }
        public string Key { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
    }

    public class UpdateSettingDTO
    {
        public string Value { get; set; } = string.Empty;
    }
}