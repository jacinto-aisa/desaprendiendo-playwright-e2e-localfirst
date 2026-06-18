namespace PlaywrightDotnet.Tests.Support
{
    public static class EntornoE2E
    {
        public static string EntornoActual()
        {
            return (System.Environment.GetEnvironmentVariable("E2E_TARGET") == "local") ? "local" : "prod";
        }

        public static bool EsLocalFirst() => EntornoActual() == "local";
        public static bool EsProduccion() => EntornoActual() == "prod";
    }
}
