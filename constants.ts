
import { SpecieType, Region, ManagementType } from './types';

export const BRAZILIAN_STATES: Region[] = [
  'SP', 'SC', 'PR', 'RS', 'MG', 'MS', 'MT', 'GO', 'BA', 'PA', 'TO', 'RO', 'MA', 'PI', 'CE', 'PE', 'ES'
];

export const MANAGEMENT_OPTIONS: Record<SpecieType, ManagementType[]> = {
  [SpecieType.BOVINO]: ['Pasto', 'Confinamento'],
  [SpecieType.SUINO]: ['Sistema Intensivo'],
  [SpecieType.FRANGO]: ['Aves Livres', 'Corte Industrial']
};

export interface SpecieGrowthDefaults {
  gmd: number;
  yield: number;
  initialWeight: number;
  periodLabel: string;
}

export const MANAGEMENT_DEFAULTS: Record<SpecieType, Partial<Record<ManagementType, SpecieGrowthDefaults>>> = {
  [SpecieType.BOVINO]: {
    'Pasto': { gmd: 0.5, yield: 50, initialWeight: 380, periodLabel: 'Dias de Pastoreio' },
    'Confinamento': { gmd: 1.5, yield: 54, initialWeight: 420, periodLabel: 'Dias de Cocho' }
  },
  [SpecieType.SUINO]: {
    'Sistema Intensivo': { gmd: 0.9, yield: 76, initialWeight: 28, periodLabel: 'Dias de Alojamento' }
  },
  [SpecieType.FRANGO]: {
    'Aves Livres': { gmd: 0.035, yield: 70, initialWeight: 0.045, periodLabel: 'Ciclo de Vida (Dias)' },
    'Corte Industrial': { gmd: 0.065, yield: 73, initialWeight: 0.048, periodLabel: 'Dias de Galpão' }
  }
};

export const SPECIE_DEFAULTS = {
  [SpecieType.BOVINO]: {
    unit: '@',
    label: 'Bovino',
    description: 'Boi, Vaca ou Novilha'
  },
  [SpecieType.SUINO]: {
    unit: 'kg',
    label: 'Suíno',
    description: 'Terminação comercial'
  },
  [SpecieType.FRANGO]: {
    unit: 'kg',
    label: 'Frango',
    description: 'Aves de corte'
  }
};
