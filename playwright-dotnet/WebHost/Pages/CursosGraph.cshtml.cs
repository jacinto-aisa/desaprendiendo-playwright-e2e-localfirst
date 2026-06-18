using Microsoft.AspNetCore.Mvc.RazorPages;
using System.IO;
using System.Text.Json;
using WebHost.Models;
using System.Linq;
using System.Collections.Generic;

public class CursosGraphModel : PageModel
{
    public string SiteDataScript { get; private set; } = "window.SITE_DATA = {};";
    public SiteDataModel Data { get; private set; } = new SiteDataModel();
    public Dictionary<string,int> TagCounts { get; private set; } = new Dictionary<string,int>();

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
            if (root.TryGetProperty("courses", out var courses) && courses.ValueKind == JsonValueKind.Array)
            {
                foreach (var c in courses.EnumerateArray())
                {
                    var course = new CourseSimple();
                    if (c.TryGetProperty("title", out var t)) course.Title = t.GetString() ?? string.Empty;
                    if (c.TryGetProperty("client", out var cl)) course.Client = cl.GetString() ?? string.Empty;
                    if (c.TryGetProperty("year", out var y) && y.TryGetInt32(out var yi)) course.Year = yi;

                    var tags = new List<string>();
                    if (c.TryGetProperty("tagsByType", out var tbt) && tbt.ValueKind == JsonValueKind.Object)
                    {
                        foreach (var prop in tbt.EnumerateObject())
                        {
                            if (prop.Value.ValueKind == JsonValueKind.Array)
                            {
                                foreach (var tag in prop.Value.EnumerateArray())
                                {
                                    var tagStr = tag.GetString() ?? string.Empty;
                                    tags.Add(tagStr);
                                    if (!Data.TagCategories.ContainsKey(prop.Name)) Data.TagCategories[prop.Name] = new List<string>();
                                    if (!Data.TagCategories[prop.Name].Contains(tagStr)) Data.TagCategories[prop.Name].Add(tagStr);
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

            // compute tag counts
            foreach (var course in Data.Courses)
            {
                foreach (var tag in course.Tags)
                {
                    if (!TagCounts.ContainsKey(tag)) TagCounts[tag] = 0;
                    TagCounts[tag]++;
                }
            }

            // If no categories were collected, try tagCatalog or fallback
            if (Data.TagCategories.Count == 0 && root.TryGetProperty("tagCatalog", out var tagCatalog) && tagCatalog.ValueKind == JsonValueKind.Object)
            {
                foreach (var prop in tagCatalog.EnumerateObject())
                {
                    if (prop.Value.ValueKind == JsonValueKind.Array)
                    {
                        Data.TagCategories[prop.Name] = prop.Value.EnumerateArray().Select(x => x.GetString() ?? string.Empty).Where(s => s != string.Empty).Distinct().OrderBy(x => x).ToList();
                    }
                }
            }

            if (Data.TagCategories.Count == 0)
            {
                Data.TagCategories["Tags"] = TagCounts.Keys.OrderBy(x => x).ToList();
            }
            else
            {
                // sort lists
                var sorted = Data.TagCategories.ToDictionary(k => k.Key, v => v.Value.OrderBy(x => x).ToList());
                Data.TagCategories = sorted;
            }
        }
        catch
        {
            // ignore parse errors; keep SiteDataScript available for client
        }
    }
}
