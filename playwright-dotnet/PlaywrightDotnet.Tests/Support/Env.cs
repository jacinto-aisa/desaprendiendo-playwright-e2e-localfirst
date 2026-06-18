using System;

namespace PlaywrightDotnet.Tests.Support
{
    public static class Env
    {
        public static string RequiredEnv(string name)
        {
            var value = Environment.GetEnvironmentVariable(name);
            if (string.IsNullOrEmpty(value))
            {
                throw new InvalidOperationException($"Falta variable de entorno: {name}");
            }

            return value;
        }

        public static string API_BASE_URL => Environment.GetEnvironmentVariable("API_BASE_URL") ?? "http://127.0.0.1:3001";
    }
}
