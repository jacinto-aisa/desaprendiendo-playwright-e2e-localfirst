using System.Collections.Generic;

namespace WebHost.Models
{
    public class CourseSimple
    {
        public string Title { get; set; } = string.Empty;
        public List<string> Tags { get; set; } = new List<string>();
        public string Client { get; set; } = string.Empty;
        public int Year { get; set; }
    }

    public class SiteDataModel
    {
        public List<CourseSimple> Courses { get; set; } = new List<CourseSimple>();
        public Dictionary<string, List<string>> TagCategories { get; set; } = new Dictionary<string, List<string>>();
    }
}
