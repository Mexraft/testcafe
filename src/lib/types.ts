export type FlowchartNode = {
  id: string;
  label: string;
  description: string;
  position?: { x: number; y: number };
};

export type FlowchartEdge = {
  source: string;
  target: string;
};

export type FlowchartData = {
  nodes: FlowchartNode[];
  edges: FlowchartEdge[];
};

export type TestCase = {
  id: string;
  description: string;
  standards: string[];
};
