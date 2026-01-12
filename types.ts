
export enum SpecieType {
  BOVINO = 'Bovino',
  SUINO = 'Suíno',
  FRANGO = 'Frango'
}

export type ManagementType = 
  | 'Pasto' 
  | 'Confinamento' 
  | 'Sistema Intensivo' 
  | 'Aves Livres' 
  | 'Corte Industrial';

export type Region = 
  | 'AC' | 'AL' | 'AP' | 'AM' | 'BA' | 'CE' | 'DF' | 'ES' | 'GO' 
  | 'MA' | 'MT' | 'MS' | 'MG' | 'PA' | 'PB' | 'PR' | 'PE' | 'PI' 
  | 'RJ' | 'RN' | 'RS' | 'RO' | 'RR' | 'SC' | 'SP' | 'SE' | 'TO';

export interface AnimalInput {
  weight: number;
}

export interface SimulationState {
  specie: SpecieType;
  region: Region;
  management: ManagementType;
  yieldPercent: number;
  mode: 'batch' | 'individual';
  batchSize: number;
  initialWeight: number; 
  gmd: number; 
  periodDays: number; 
  useManualPrice: boolean;
  manualPrice: number;
}

export interface MarketQuote {
  price: number;
  unit: string;
  source: string;
  date: string;
  trend: 'up' | 'down' | 'stable';
  commentary: string;
  isManual?: boolean;
}

export interface ResultSummary {
  totalInitialWeight: number;
  totalFinalWeight: number;
  totalCarcassWeight: number;
  totalUnits: number; 
  totalValue: number;
  weightGain: number;
  quote: MarketQuote;
}
