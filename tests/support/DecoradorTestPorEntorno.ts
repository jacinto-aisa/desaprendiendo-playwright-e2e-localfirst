import { test, expect } from '../fixtures/AppFixtures';
import { esLocalFirst } from './EntornoE2E';

export class DecoradorTestsPorEntorno {
  constructor(private readonly testBase = test) {}

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

export const testsPorEntorno = new DecoradorTestsPorEntorno();

export { test, expect };
