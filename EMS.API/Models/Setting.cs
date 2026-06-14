namespace EMS.API.Models
{
    public class Setting
    {
        public int SettingID { get; set; }
        public string Key { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
    }
}