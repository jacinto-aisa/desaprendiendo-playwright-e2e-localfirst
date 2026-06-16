import { test as appTest, expect } from '@fixtures/AppFixtures';
import { esLocalFirst } from './EntornoE2E';

type TestBaseConDescribeYSkip = {
  describe: (nombre: string, registrarTests: () => void) => void;
  skip: (condicion: boolean, descripcion: string) => void;
};

export class DecoradorTestsPorEntorno {
  constructor(private readonly testBase: TestBaseConDescribeYSkip = appTest) {}

  describeSoloLocalFirst(nombre: string, registrarTests: () => void) {
    this.testBase.describe(nombre, () => {
      this.testBase.skip(
        !esLocalFirst(),
        'Bloque exclusivo de local-first: la copia local no está sincronizada con producción.'
      );

      registrarTests();
    });
  }
}

export function crearDecoradorTestsPorEntorno(
  testBase: TestBaseConDescribeYSkip
): DecoradorTestsPorEntorno {
  return new DecoradorTestsPorEntorno(testBase);
}

export const testsPorEntorno = new DecoradorTestsPorEntorno(appTest);

export { appTest as test, expect };
