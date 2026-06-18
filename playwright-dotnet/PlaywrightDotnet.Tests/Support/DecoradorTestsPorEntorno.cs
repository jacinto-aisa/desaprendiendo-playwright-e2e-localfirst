using System;
using Xunit.Sdk;

namespace PlaywrightDotnet.Tests.Support
{
    public static class DecoradorTestsPorEntorno
    {
        public static void SkipIfNotLocalFirst()
        {
            if (!EntornoE2E.EsLocalFirst())
            {
                throw new SkipException("Bloque exclusivo de local-first: la copia local no está sincronizada con producción.");
            }
        }
    }
}
