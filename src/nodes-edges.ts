import { SimulationLinkDatum, SimulationNodeDatum } from 'd3-force';
import { Edge, Node } from 'reactflow';

export const initialNodes: DataNode[] = [
  {
    data: { label: 'input' },
    id: '1',
    position: { x: 0, y: 0 },
    type: 'input',
  },
  {
    data: { label: 'node 2' },
    id: '2',
    position: { x: 0, y: 100 },
  },
  {
    data: { label: 'node 2a' },
    id: '2a',
    position: { x: 0, y: 200 },
  },
  {
    data: { label: 'node 2b' },
    id: '2b',
    position: { x: 0, y: 300 },
  },
  {
    data: { label: 'node 2c' },
    id: '2c',
    position: { x: 0, y: 400 },
  },
  {
    data: { label: 'node 2d' },
    id: '2d',
    position: { x: 0, y: 500 },
  },
  {
    data: { label: 'node 3' },
    id: '3',
    position: { x: 200, y: 100 },
  },
].map((node) => ({
  ...node,
  data: {
    ...node.data,
    ...node.position,
    height: 41 * 2,
    id: node.id,
    width: 152 * 1.3,
  },
}));

export type DataNodeData = {
  height: number;
  id: string;
  label: string;
  width: number;
  x: number;
  y: number;
} & SimulationNodeDatum;
export type DataNode = Node<DataNodeData>;

export type DataLinkData = SimulationLinkDatum<DataNodeData>;
export type DataLink = Edge<DataLinkData>;

export const initialEdges: DataLink[] = [
  { animated: true, id: 'e12', source: '1', target: '2' },
  { animated: true, id: 'e13', source: '1', target: '3' },
  { animated: true, id: 'e22a', source: '2', target: '2a' },
  { animated: true, id: 'e22b', source: '2', target: '2b' },
  { animated: true, id: 'e22c', source: '2', target: '2c' },
  { animated: true, id: 'e2c2d', source: '2c', target: '2d' },
];
