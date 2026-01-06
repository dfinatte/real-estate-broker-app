export interface Client {
  id: string;
  nome: string;
  telefone: string;
  dataChegada: string;
  canalAquisicao: string;
  oQueProcura: string;
  aondeProcura: string;
  budgetInformado: number;
  informacoesAdicionais: string;
  dataCadastro: string;
  temperatura: 'quente' | 'morno' | 'frio' | 'precisa-vender';
  statusJornada: 'Em Jornada' | 'Pausa' | 'Desistiu' | 'Comprou Comigo' | 'Comprou na Concorrência';
  dataUltimaVisita: string;
  ultimaAtualizacao: string;
  qtdeVisitas: number;
  status: string;
  prazoCompra: string;
  ultimaMovimentacao: string;
  saidasRealizadas: number;
  budgetAjustado: number;
  dormitorios: number;
  suites: number;
  banheiros: number;
  vagasGaragem: number;
  demaisCaract: string;
  comentarios: string;
  dataVenda: string;
  enResponsavel: string;
  comissaoContrato: number;
  observacoes: string;
  dataPrevReceb: string;
  dataRecebimento: string;
  codigoImovel: string;
  valorVenda: number;
  minhaComissao: number;
  valorPrevisto: number;
  valorRecebido: number;
}

export interface ContactRecord {
  id: string;
  clientId: string;
  data: string;
  forma: string;
  comentarios: string;
}

export interface VisitRecord {
  id: string;
  clientId: string;
  data: string;
  codImoveis: string[];
  status: string;
  comentarios: string;
}
