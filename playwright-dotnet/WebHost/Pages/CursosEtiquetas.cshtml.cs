using Microsoft.AspNetCore.Mvc.RazorPages;
using System.IO;
using System.Text.Json;
using WebHost.Models;
using System.Linq;

public class CursosEtiquetasModel : PageModel
{
    public string SiteDataScript { get; private set; } = "window.SITE_DATA = {};";
    public SiteDataModel Data { get; private set; } = new SiteDataModel();

    public void OnGet()
    {
        var staticPath = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "web-local-instrumented"));
        var dataFile = Path.Combine(staticPath, "data.js");
        if (!System.IO.File.Exists(dataFile)) return;

        var text = System.IO.File.ReadAllText(dataFile);
        var marker = "globalThis.SITE_DATA =";
        var idx = text.IndexOf(marker);
        if (idx == -1) return;

        var jsonStart = text.IndexOf('{', idx);
        if (jsonStart == -1) return;

        int pos = jsonStart; int depth = 0;
        while (pos < text.Length)
        {
            if (text[pos] == '{') depth++;
            else if (text[pos] == '}') depth--;
            pos++;
            if (depth == 0) break;
        }

        if (depth != 0) return;
        var json = text.Substring(jsonStart, pos - jsonStart);
        SiteDataScript = "window.SITE_DATA = " + json + ";";

        try
        {
            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;
            if (root.TryGetProperty("courses", out var courses))
            {
                foreach (var c in courses.EnumerateArray())
                {
                    var course = new CourseSimple();
                    if (c.TryGetProperty("title", out var t)) course.Title = t.GetString() ?? string.Empty;
                    if (c.TryGetProperty("client", out var cl)) course.Client = cl.GetString() ?? string.Empty;
                    if (c.TryGetProperty("year", out var y) && y.TryGetInt32(out var yi)) course.Year = yi;

                    // Collect tags from tagsByType if present, else from tags
                    var tags = new List<string>();
                    if (c.TryGetProperty("tagsByType", out var tbt) && tbt.ValueKind == JsonValueKind.Object)
                    {
                        foreach (var prop in tbt.EnumerateObject())
                        {
                            var cat = prop.Name;
                            if (!Data.TagCategories.ContainsKey(cat)) Data.TagCategories[cat] = new List<string>();
                            if (prop.Value.ValueKind == JsonValueKind.Array)
                            {
                                foreach (var tag in prop.Value.EnumerateArray())
                                {
                                    var tagStr = tag.GetString() ?? string.Empty;
                                    if (!Data.TagCategories[cat].Contains(tagStr)) Data.TagCategories[cat].Add(tagStr);
                                    tags.Add(tagStr);
                                }
                            }
                        }
                    }
                    else if (c.TryGetProperty("tags", out var ts) && ts.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var tag in ts.EnumerateArray())
                        {
                            var tagStr = tag.GetString() ?? string.Empty;
                            tags.Add(tagStr);
                        }
                    }

                    course.Tags = tags.Distinct().ToList();
                    Data.Courses.Add(course);
                }
            }

            // Sort categories and tags
            Data.TagCategories = Data.TagCategories.ToDictionary(k => k.Key, v => v.Value.OrderBy(x => x).ToList());
        }
        catch
        {
            // ignore parse errors; keep SiteDataScript available for client
        }
    }
}
